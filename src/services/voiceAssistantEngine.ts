/**
 * Low-Latency Voice Engine for Lilou.
 * Supports English, French, and German with strict language-voice matching:
 * - English text is ONLY read with a warm, natural English voice (en-US / en-GB).
 * - French text is ONLY read with an elegant, natural French voice (fr-FR).
 * - German text is ONLY read with a friendly, professional German voice (de-DE).
 * - Strips markdown/symbols so speech flows naturally without reading punctuation aloud.
 * - 750ms silence detection for fast, interactive recruiter conversation turns.
 */

import { LiveSessionStatus, TranscriptTurn } from './geminiLiveClient.ts';
import { sendChatMessage } from './apiClient.ts';

export interface VoiceEngineCallbacks {
  onStatusChange: (status: LiveSessionStatus) => void;
  onTranscript: (turn: TranscriptTurn) => void;
  onAudioLevel: (level: number, source: 'user' | 'model') => void;
  onError?: (err: string) => void;
}

export class VoiceAssistantEngine {
  private callbacks: VoiceEngineCallbacks;
  private language: 'en' | 'fr' | 'de';
  private systemInstruction: string;
  private status: LiveSessionStatus = 'idle';

  // Speech Recognition state
  private recognition: any = null;
  private currentTurnId: string | null = null;
  private accumulatedText: string = '';
  private silenceTimer: any = null;
  private isProcessingAnswer: boolean = false;

  // Audio Playback state
  private isSpeakingAudio: boolean = false;
  private currentAudioElement: HTMLAudioElement | null = null;
  private animInterval: any = null;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor(callbacks: VoiceEngineCallbacks, language: 'en' | 'fr' | 'de', systemInstruction: string) {
    this.callbacks = callbacks;
    this.language = language;
    this.systemInstruction = systemInstruction;

    this.initVoices();
  }

  private initVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const load = () => {
      this.availableVoices = window.speechSynthesis.getVoices();
    };

    load();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  public updateConfig(language: 'en' | 'fr' | 'de', systemInstruction: string) {
    this.language = language;
    this.systemInstruction = systemInstruction;
  }

  public getStatus(): LiveSessionStatus {
    return this.status;
  }

  private setStatus(status: LiveSessionStatus) {
    this.status = status;
    this.callbacks.onStatusChange(status);
  }

  /**
   * Start voice session
   */
  public async start(): Promise<void> {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.setStatus('error');
      this.callbacks.onError?.(
        'Speech recognition is not supported in this browser. Please use the Text Chat tab.'
      );
      return;
    }

    this.setStatus('listening');
    this.startListening();
  }

  /**
   * Start listening for user speech with fast 750ms silence detection
   */
  private startListening() {
    if (this.isProcessingAnswer || this.isSpeakingAudio) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = this.language === 'fr' ? 'fr-FR' : this.language === 'de' ? 'de-DE' : 'en-US';

    this.currentTurnId = 'user-' + Date.now();
    this.accumulatedText = '';

    rec.onstart = () => {
      if (!this.isProcessingAnswer && !this.isSpeakingAudio) {
        this.setStatus('listening');
      }
    };

    rec.onresult = (event: any) => {
      let interim = '';
      let finalStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalStr += transcript;
        } else {
          interim += transcript;
        }
      }

      const activeText = (this.accumulatedText + ' ' + finalStr + ' ' + interim).trim();

      if (activeText) {
        this.accumulatedText = (this.accumulatedText + ' ' + finalStr).trim();

        // Broadcast transcript to UI live subtitles
        this.callbacks.onTranscript({
          id: this.currentTurnId || 'user-' + Date.now(),
          role: 'user',
          text: activeText,
          isFinal: false,
          timestamp: new Date(),
        });

        // Pulse audio level to show listening activity
        this.callbacks.onAudioLevel(0.35 + Math.random() * 0.45, 'user');

        // FAST SILENCE DEBOUNCER:
        // As soon as the user pauses for 750ms, trigger answer immediately
        clearTimeout(this.silenceTimer);
        this.silenceTimer = setTimeout(() => {
          if (activeText && !this.isProcessingAnswer && !this.isSpeakingAudio) {
            clearTimeout(this.silenceTimer);
            try {
              rec.stop();
            } catch {}
            this.handleUserVoiceInput(activeText);
          }
        }, 750);
      }
    };

    rec.onerror = (e: any) => {
      console.warn('SpeechRecognition event error:', e.error);
      if (e.error === 'not-allowed') {
        this.setStatus('error');
        this.callbacks.onError?.('Microphone access was denied in browser settings.');
      } else if (e.error !== 'aborted') {
        // Restart listening if transient
        setTimeout(() => {
          if (this.status === 'listening' && !this.isProcessingAnswer && !this.isSpeakingAudio) {
            this.startListening();
          }
        }, 500);
      }
    };

    rec.onend = () => {
      if (this.status === 'listening' && !this.isProcessingAnswer && !this.isSpeakingAudio) {
        setTimeout(() => {
          if (this.status === 'listening' && !this.isProcessingAnswer && !this.isSpeakingAudio) {
            this.startListening();
          }
        }, 300);
      }
    };

    try {
      rec.start();
      this.recognition = rec;
    } catch (err) {
      console.warn('Error starting speech recognition:', err);
    }
  }

  /**
   * Handle user voice input and play spoken response
   */
  public async handleUserVoiceInput(text: string) {
    if (!text || this.isProcessingAnswer) return;

    this.isProcessingAnswer = true;
    clearTimeout(this.silenceTimer);

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }

    // Finalize user turn
    if (this.currentTurnId) {
      this.callbacks.onTranscript({
        id: this.currentTurnId,
        role: 'user',
        text,
        isFinal: true,
        timestamp: new Date(),
      });
    }

    this.setStatus('speaking');

    try {
      // 1. Fetch AI response (with server-side model fallback)
      const result = await sendChatMessage(text, [], this.language, true);

      const modelTurnId = 'model-' + Date.now();
      this.callbacks.onTranscript({
        id: modelTurnId,
        role: 'model',
        text: result.text,
        isFinal: true,
        timestamp: new Date(),
      });

      // 2. Play audio response
      // If server returned Gemini TTS audio, use it; otherwise use language-matched high quality speech
      if (result.audio) {
        await this.playTTSAudio(result.audio);
      } else {
        await this.speakWithLanguageMatchedVoice(result.text);
      }
    } catch (err: any) {
      console.error('Error generating answer:', err);
      this.callbacks.onError?.(err?.message || 'Failed to generate voice answer.');
    } finally {
      this.isProcessingAnswer = false;
      this.accumulatedText = '';
      this.currentTurnId = null;

      // Automatically resume listening for the recruiter's next question!
      if (this.status !== 'idle') {
        this.setStatus('listening');
        this.startListening();
      }
    }
  }

  /**
   * Play Gemini Neural Voice (WAV/audio base64) with audio visualizer
   */
  private async playTTSAudio(base64Audio: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        const audioSrc = `data:audio/wav;base64,${base64Audio}`;
        const audio = new Audio(audioSrc);
        this.currentAudioElement = audio;
        this.isSpeakingAudio = true;

        clearInterval(this.animInterval);
        this.animInterval = setInterval(() => {
          if (!audio.paused && !audio.ended) {
            const lvl = 0.35 + Math.random() * 0.45;
            this.callbacks.onAudioLevel(lvl, 'model');
          }
        }, 75);

        const cleanup = () => {
          clearInterval(this.animInterval);
          this.isSpeakingAudio = false;
          this.callbacks.onAudioLevel(0, 'model');
          this.currentAudioElement = null;
          resolve();
        };

        audio.onended = cleanup;
        audio.onerror = cleanup;

        audio.play().catch((err) => {
          console.warn('Audio play error:', err);
          cleanup();
        });
      } catch (err) {
        console.warn('Error in playTTSAudio:', err);
        resolve();
      }
    });
  }

  /**
   * Speak text using strictly language-matched, friendly natural voice.
   * Guarantees English is read with an English voice, French with a French voice, and German with a German voice!
   */
  private speakWithLanguageMatchedVoice(rawText: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      this.isSpeakingAudio = true;

      // Clean spoken text: strip markdown bullets, hashes, asterisks
      const cleanText = rawText
        .replace(/[*#_`~>]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\n\s*[-•]\s*/g, '. ')
        .trim();

      const utter = new SpeechSynthesisUtterance(cleanText);

      // Define target language tag & friendly voice criteria
      const targetLang = this.language; // 'en' | 'fr' | 'de'
      const langTag = targetLang === 'fr' ? 'fr-FR' : targetLang === 'de' ? 'de-DE' : 'en-US';
      utter.lang = langTag;
      utter.rate = 0.98; // Friendly, warm conversational speed (not robotic or rushed)
      utter.pitch = 1.04; // Natural, engaging warm inflection

      // Fetch latest voices
      let voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) {
        voices = this.availableVoices;
      }

      // STRICT FILTER: voices that strictly match the target language code
      const languageVoices = voices.filter((v) => {
        if (!v.lang) return false;
        const vLang = v.lang.toLowerCase().replace('_', '-');
        return vLang.startsWith(targetLang);
      });

      // Best friendly natural voice selector
      let chosenVoice: SpeechSynthesisVoice | null = null;

      if (languageVoices.length > 0) {
        // Preference score for natural, friendly, warm female voices
        const scoreVoice = (v: SpeechSynthesisVoice) => {
          const name = v.name.toLowerCase();
          let score = 0;

          // Highest priority: Natural, Enhanced, Studio, Online voices
          if (name.includes('natural') || name.includes('online (natural)')) score += 50;
          if (name.includes('enhanced') || name.includes('premium')) score += 40;
          if (name.includes('google')) score += 30;

          // Language-specific top-rated friendly personas
          if (targetLang === 'en') {
            if (name.includes('uk english female') || name.includes('serena') || name.includes('samantha')) score += 25;
            if (name.includes('karen') || name.includes('victoria') || name.includes('jenny') || name.includes('aria')) score += 20;
          } else if (targetLang === 'fr') {
            if (name.includes('amélie') || name.includes('amelie') || name.includes('denise')) score += 25;
            if (name.includes('céline') || name.includes('celine') || name.includes('hortense') || name.includes('marie')) score += 20;
          } else if (targetLang === 'de') {
            if (name.includes('katja') || name.includes('marlene') || name.includes('anna')) score += 25;
            if (name.includes('petra') || name.includes('hedda') || name.includes('vicki')) score += 20;
          }

          if (name.includes('female') || name.includes('femme') || name.includes('weiblich')) score += 10;
          return score;
        };

        languageVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a));
        chosenVoice = languageVoices[0];
      }

      // CRITICAL: ONLY set voice if it belongs to the target language! Never allow cross-language pronunciation!
      if (chosenVoice) {
        utter.voice = chosenVoice;
      }

      // Visualizer animation while speaking
      clearInterval(this.animInterval);
      this.animInterval = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          const lvl = 0.35 + Math.random() * 0.45;
          this.callbacks.onAudioLevel(lvl, 'model');
        }
      }, 75);

      const finish = () => {
        clearInterval(this.animInterval);
        this.isSpeakingAudio = false;
        this.callbacks.onAudioLevel(0, 'model');
        resolve();
      };

      utter.onend = finish;
      utter.onerror = finish;

      window.speechSynthesis.speak(utter);
    });
  }

  /**
   * Send a text query directly
   */
  public async sendTextQuery(text: string) {
    await this.handleUserVoiceInput(text);
  }

  /**
   * Stop voice session
   */
  public stop() {
    this.setStatus('idle');
    this.isProcessingAnswer = false;
    this.isSpeakingAudio = false;
    clearTimeout(this.silenceTimer);
    clearInterval(this.animInterval);

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }

    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
      } catch {}
      this.currentAudioElement = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    this.callbacks.onAudioLevel(0, 'user');
  }

  public toggleMute(): boolean {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      return true;
    }
    return false;
  }
}
