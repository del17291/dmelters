/**
 * Gemini Live API Client for Browser WebSocket connection.
 * Uses short-lived ephemeral tokens issued by the server (/api/token).
 * Handles:
 *  - WebSocket connection to Gemini Live v1alpha
 *  - Handling binary/Blob and ArrayBuffer frames across all browsers (Safari/Chrome/Firefox)
 *  - 16kHz microphone capture and downsampling to 16-bit PCM LE
 *  - 24kHz jitter-free scheduled audio playback
 *  - Interruption handling (barge-in)
 *  - Live streaming transcription (captions)
 *  - Audio volume analyzer for UI animations
 *  - Connection timeout and recovery
 */

export type LiveSessionStatus =
  | 'idle'
  | 'requesting_permission'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'speaking'
  | 'error';

export interface TranscriptTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
  isFinal: boolean;
  timestamp: Date;
}

export interface LiveClientCallbacks {
  onStatusChange?: (status: LiveSessionStatus) => void;
  onTranscript?: (turn: TranscriptTurn) => void;
  onAudioLevel?: (level: number, source: 'user' | 'model') => void;
  onError?: (error: string) => void;
  onInterrupted?: () => void;
}

export interface LiveClientConfig {
  systemInstruction?: string;
  voiceName?: string; // 'Aoede' | 'Kore' | 'Zephyr'
  language?: 'en' | 'fr' | 'de';
}

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private status: LiveSessionStatus = 'idle';
  private callbacks: LiveClientCallbacks = {};
  private config: LiveClientConfig = {};

  // Audio recording (Input)
  private inputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private inputAnalyser: AnalyserNode | null = null;
  private isMicMuted: boolean = false;

  // Audio playback (Output)
  private outputAudioContext: AudioContext | null = null;
  private outputAnalyser: AnalyserNode | null = null;
  private nextPlayTime: number = 0;
  private activeSourceNodes: AudioBufferSourceNode[] = [];

  // Transcription state
  private currentModelTurnId: string | null = null;
  private currentModelText: string = '';
  private currentUserTurnId: string | null = null;
  private currentUserText: string = '';

  // Connection safety timeout
  private connectTimeoutId: any = null;

  // Analyzer animation frame
  private animationFrameId: number | null = null;

  constructor(callbacks: LiveClientCallbacks = {}, config: LiveClientConfig = {}) {
    this.callbacks = callbacks;
    this.config = config;
  }

  public updateConfig(config: Partial<LiveClientConfig>) {
    this.config = { ...this.config, ...config };
  }

  public getStatus(): LiveSessionStatus {
    return this.status;
  }

  public isMuted(): boolean {
    return this.isMicMuted;
  }

  private setStatus(newStatus: LiveSessionStatus) {
    if (this.status === newStatus) return;
    this.status = newStatus;
    this.callbacks.onStatusChange?.(newStatus);
  }

  private startConnectTimeout() {
    this.clearConnectTimeout();
    this.connectTimeoutId = setTimeout(() => {
      if (this.status === 'connecting' || this.status === 'requesting_permission') {
        console.warn('Gemini Live API connection handshake timed out');
        this.setStatus('error');
        this.callbacks.onError?.(
          'Connection timed out while connecting to Gemini Live API. Please try again, or use the Text Chat tab.'
        );
        this.disconnect();
      }
    }, 15000);
  }

  private clearConnectTimeout() {
    if (this.connectTimeoutId) {
      clearTimeout(this.connectTimeoutId);
      this.connectTimeoutId = null;
    }
  }

  /**
   * Connect to Gemini Live session using a short-lived token
   */
  public async connect(): Promise<void> {
    if (this.status === 'connecting' || this.status === 'listening' || this.status === 'speaking') {
      return;
    }

    try {
      this.clearConnectTimeout();
      this.setStatus('requesting_permission');

      // 1. Request microphone access early to fail fast if denied
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        this.mediaStream = stream;
      } catch (err: any) {
        const errorMsg =
          err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
            ? 'Microphone permission was denied. Please allow microphone access in your browser settings to speak with Lilou.'
            : 'Could not access microphone: ' + (err?.message || 'Check audio device');
        this.setStatus('error');
        this.callbacks.onError?.(errorMsg);
        throw new Error(errorMsg);
      }

      this.setStatus('connecting');
      this.startConnectTimeout();

      // 2. Fetch short-lived ephemeral token from backend
      const tokenRes = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!tokenRes.ok) {
        const errJson = await tokenRes.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to get ephemeral token (${tokenRes.status})`);
      }

      const { token } = await tokenRes.json();
      if (!token) {
        throw new Error('No token returned from server');
      }

      // 3. Connect to Gemini Live WebSocket endpoint
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(
        token
      )}`;

      const socket = new WebSocket(wsUrl);
      // Essential: set binaryType to arraybuffer so binary WebSocket frames are ArrayBuffers
      socket.binaryType = 'arraybuffer';
      this.ws = socket;

      socket.onopen = () => {
        console.log('Gemini Live WebSocket opened, sending setup configuration...');
        this.sendSetupMessage();
      };

      socket.onmessage = async (event) => {
        await this.handleMessage(event.data);
      };

      socket.onerror = (err) => {
        console.error('Gemini Live WebSocket error:', err);
        this.clearConnectTimeout();
        this.callbacks.onError?.('Real-time voice connection error. You can retry or use the text chat.');
        this.setStatus('error');
      };

      socket.onclose = (event) => {
        console.log('Gemini Live WebSocket closed:', event.code, event.reason);
        this.clearConnectTimeout();
        if (this.status === 'connecting' || this.status === 'requesting_permission') {
          this.setStatus('error');
          this.callbacks.onError?.(
            `Voice connection closed (code ${event.code}${event.reason ? ': ' + event.reason : ''}). Please retry or use text chat.`
          );
        } else if (this.status !== 'idle') {
          this.disconnect();
        }
      };

      // 4. Initialize Audio Contexts
      await this.initAudioPlayback();
      await this.initAudioCapture(stream);
      this.startLevelLoop();
    } catch (error: any) {
      console.error('Connection failed:', error);
      this.clearConnectTimeout();
      this.setStatus('error');
      this.callbacks.onError?.(error?.message || 'Connection failed');
      this.cleanup();
      throw error;
    }
  }

  /**
   * Send the initial setup configuration handshake
   */
  private sendSetupMessage() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const voiceName = this.config.voiceName || 'Aoede';
    const systemInstruction = this.config.systemInstruction || 'You are Lilou, a warm, professional AI assistant.';

    const setupPayload = {
      setup: {
        model: 'models/gemini-3.8-live',
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName,
              },
            },
          },
        },
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    };

    this.ws.send(JSON.stringify(setupPayload));
  }

  /**
   * Handle incoming WebSocket messages from Gemini Live.
   * Handles string, Blob, ArrayBuffer, and ArrayBufferView reliably.
   */
  private async handleMessage(data: any) {
    try {
      let rawText = '';
      if (typeof data === 'string') {
        rawText = data;
      } else if (data instanceof Blob) {
        rawText = await data.text();
      } else if (data instanceof ArrayBuffer) {
        rawText = new TextDecoder('utf-8').decode(data);
      } else if (ArrayBuffer.isView(data)) {
        rawText = new TextDecoder('utf-8').decode(
          new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
        );
      } else {
        rawText = String(data);
      }

      if (!rawText || !rawText.trim()) return;

      const msg = JSON.parse(rawText);

      if (msg.setupComplete) {
        console.log('Gemini Live session ready, transitioning to listening state.');
        this.clearConnectTimeout();
        this.setStatus('listening');
        return;
      }

      if (msg.serverContent) {
        const { modelTurn, outputTranscription, inputAudioTranscription, turnComplete, interrupted } =
          msg.serverContent;

        // Barge-in / interruption
        if (interrupted) {
          this.stopAudioPlayback();
          this.callbacks.onInterrupted?.();
          this.setStatus('listening');
          return;
        }

        // Live user speech transcription
        if (inputAudioTranscription?.text) {
          if (!this.currentUserTurnId) {
            this.currentUserTurnId = 'user-' + Date.now();
            this.currentUserText = '';
          }
          this.currentUserText += inputAudioTranscription.text;
          this.callbacks.onTranscript?.({
            id: this.currentUserTurnId,
            role: 'user',
            text: this.currentUserText,
            isFinal: false,
            timestamp: new Date(),
          });
        }

        // Live model output transcription (subtitles)
        if (outputTranscription?.text) {
          if (!this.currentModelTurnId) {
            this.currentModelTurnId = 'model-' + Date.now();
            this.currentModelText = '';
            this.setStatus('speaking');
          }
          this.currentModelText += outputTranscription.text;
          this.callbacks.onTranscript?.({
            id: this.currentModelTurnId,
            role: 'model',
            text: this.currentModelText,
            isFinal: false,
            timestamp: new Date(),
          });
        }

        // Audio chunks from model (24kHz 16-bit PCM little-endian)
        if (modelTurn?.parts) {
          for (const part of modelTurn.parts) {
            if (part.inlineData?.data) {
              this.setStatus('speaking');
              this.playAudioChunk(part.inlineData.data);
            }
          }
        }

        // Turn completion
        if (turnComplete) {
          if (this.currentModelTurnId) {
            this.callbacks.onTranscript?.({
              id: this.currentModelTurnId,
              role: 'model',
              text: this.currentModelText,
              isFinal: true,
              timestamp: new Date(),
            });
            this.currentModelTurnId = null;
            this.currentModelText = '';
          }
          if (this.currentUserTurnId) {
            this.callbacks.onTranscript?.({
              id: this.currentUserTurnId,
              role: 'user',
              text: this.currentUserText,
              isFinal: true,
              timestamp: new Date(),
            });
            this.currentUserTurnId = null;
            this.currentUserText = '';
          }
          // Resume listening once model turn finishes
          this.setStatus('listening');
        }
      }
    } catch (e) {
      console.warn('Error parsing Live message:', e);
    }
  }

  /**
   * Set up audio input recording from microphone
   */
  private async initAudioCapture(stream: MediaStream) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.inputAudioContext = new AudioContextClass();

    if (this.inputAudioContext.state === 'suspended') {
      try {
        await this.inputAudioContext.resume();
      } catch (e) {
        console.warn('Input AudioContext resume warning:', e);
      }
    }

    const sampleRate = this.inputAudioContext.sampleRate;
    const source = this.inputAudioContext.createMediaStreamSource(stream);

    this.inputAnalyser = this.inputAudioContext.createAnalyser();
    this.inputAnalyser.fftSize = 256;
    source.connect(this.inputAnalyser);

    // Buffer size of 4096 gives ~85ms latency at 48kHz
    this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    this.inputAnalyser.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputAudioContext.destination);

    this.scriptProcessor.onaudioprocess = (e) => {
      if (this.isMicMuted || !this.ws || this.ws.readyState !== WebSocket.OPEN || this.status === 'error') {
        return;
      }

      const inputData = e.inputBuffer.getChannelData(0);

      // Downsample to 16,000 Hz if needed
      const downsampledData = this.downsampleTo16k(inputData, sampleRate);
      if (!downsampledData || downsampledData.length === 0) return;

      // Convert Float32Array to 16-bit PCM little-endian
      const base64Pcm = this.floatTo16BitPCMBase64(downsampledData);

      // Send realtime audio chunk to Gemini Live API
      const audioPayload = {
        realtimeInput: {
          mediaChunks: [
            {
              mimeType: 'audio/pcm;rate=16000',
              data: base64Pcm,
            },
          ],
        },
      };

      try {
        this.ws.send(JSON.stringify(audioPayload));
      } catch (err) {
        console.warn('Failed to send audio chunk:', err);
      }
    };
  }

  /**
   * Downsamples arbitrary audio sample rate to 16,000Hz
   */
  private downsampleTo16k(buffer: Float32Array, inputSampleRate: number): Float32Array {
    if (inputSampleRate === 16000) return buffer;
    if (inputSampleRate < 16000) return buffer; // edge fallback

    const ratio = inputSampleRate / 16000;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLength);

    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }

    return result;
  }

  /**
   * Encodes Float32 audio samples into 16-bit little-endian PCM base64
   */
  private floatTo16BitPCMBase64(input: Float32Array): string {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    const uint8 = new Uint8Array(output.buffer);
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    return btoa(binary);
  }

  /**
   * Set up audio output for 24kHz PCM model playback
   */
  private async initAudioPlayback() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    // Model output is strictly 24000Hz
    this.outputAudioContext = new AudioContextClass({ sampleRate: 24000 });

    if (this.outputAudioContext.state === 'suspended') {
      try {
        await this.outputAudioContext.resume();
      } catch (e) {
        console.warn('Output AudioContext resume warning:', e);
      }
    }

    this.outputAnalyser = this.outputAudioContext.createAnalyser();
    this.outputAnalyser.fftSize = 256;
    this.outputAnalyser.connect(this.outputAudioContext.destination);
    this.nextPlayTime = this.outputAudioContext.currentTime;
  }

  /**
   * Queue and seamlessly schedule 24kHz PCM chunk playback
   */
  private playAudioChunk(base64Pcm: string) {
    if (!this.outputAudioContext || !this.outputAnalyser) return;

    if (this.outputAudioContext.state === 'suspended') {
      this.outputAudioContext.resume().catch(() => {});
    }

    try {
      const binaryString = atob(base64Pcm);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert 16-bit PCM LE to Float32
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      // Create audio buffer at 24000Hz
      const audioBuffer = this.outputAudioContext.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAnalyser);

      // Gapless jitter-free scheduling
      const now = this.outputAudioContext.currentTime;
      if (this.nextPlayTime < now) {
        this.nextPlayTime = now + 0.04; // safety margin
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;
      this.activeSourceNodes.push(source);

      source.onended = () => {
        const idx = this.activeSourceNodes.indexOf(source);
        if (idx !== -1) this.activeSourceNodes.splice(idx, 1);
        if (this.activeSourceNodes.length === 0 && this.status === 'speaking') {
          this.setStatus('listening');
        }
      };
    } catch (e) {
      console.error('Audio chunk decoding error:', e);
    }
  }

  /**
   * Stop all currently playing audio chunks (barge-in / interruption)
   */
  public stopAudioPlayback() {
    for (const src of this.activeSourceNodes) {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    }
    this.activeSourceNodes = [];
    if (this.outputAudioContext) {
      this.nextPlayTime = this.outputAudioContext.currentTime;
    }
  }

  /**
   * Send a text message turn directly through the live WebSocket
   */
  public sendTextMessage(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Live voice session is not connected.');
    }

    const payload = {
      clientContent: {
        turns: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      },
    };

    this.ws.send(JSON.stringify(payload));

    // Emit transcript entry for user
    const id = 'user-txt-' + Date.now();
    this.callbacks.onTranscript?.({
      id,
      role: 'user',
      text,
      isFinal: true,
      timestamp: new Date(),
    });
  }

  /**
   * Mute or unmute microphone
   */
  public toggleMute(): boolean {
    this.isMicMuted = !this.isMicMuted;
    if (this.mediaStream) {
      for (const track of this.mediaStream.getAudioTracks()) {
        track.enabled = !this.isMicMuted;
      }
    }
    return this.isMicMuted;
  }

  /**
   * Level calculation loop for visualizer
   */
  private startLevelLoop() {
    const dataArray = new Uint8Array(128);

    const checkLevel = () => {
      if (this.status === 'idle') return;

      // If model is speaking, check output analyser
      if (this.status === 'speaking' && this.outputAnalyser) {
        this.outputAnalyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length / 255;
        this.callbacks.onAudioLevel?.(Math.min(1, avg * 1.8), 'model');
      } else if (this.status === 'listening' && this.inputAnalyser && !this.isMicMuted) {
        // If listening to user mic
        this.inputAnalyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length / 255;
        this.callbacks.onAudioLevel?.(Math.min(1, avg * 2.2), 'user');
      } else {
        this.callbacks.onAudioLevel?.(0, 'user');
      }

      this.animationFrameId = requestAnimationFrame(checkLevel);
    };

    this.animationFrameId = requestAnimationFrame(checkLevel);
  }

  /**
   * Disconnect and clean up all audio and socket resources
   */
  public disconnect() {
    this.clearConnectTimeout();
    this.stopAudioPlayback();
    this.cleanup();
    this.setStatus('idle');
  }

  private cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close();
        }
      } catch {}
      this.ws = null;
    }

    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
      } catch {}
      this.scriptProcessor = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.inputAudioContext) {
      try {
        this.inputAudioContext.close();
      } catch {}
      this.inputAudioContext = null;
    }

    if (this.outputAudioContext) {
      try {
        this.outputAudioContext.close();
      } catch {}
      this.outputAudioContext = null;
    }

    this.activeSourceNodes = [];
  }
}
