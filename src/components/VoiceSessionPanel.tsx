import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  HelpCircle,
  Globe,
  Radio,
} from 'lucide-react';
import { LilouAvatar } from './LilouAvatar.tsx';
import { LiveSessionStatus, TranscriptTurn } from '../services/geminiLiveClient.ts';
import { deliaProfile } from '../data/deliaProfile.ts';

interface VoiceSessionPanelProps {
  status: LiveSessionStatus;
  audioLevel: number;
  isMuted: boolean;
  language: 'en' | 'fr' | 'de';
  latestModelSubtitle: string;
  latestUserSubtitle: string;
  onStartVoice: () => void;
  onEndVoice: () => void;
  onToggleMute: () => void;
  onSelectLanguage: (lang: 'en' | 'fr' | 'de') => void;
  onSelectSuggestedQuestion: (question: string) => void;
  onSwitchToTextChat: () => void;
  onOpenKnowledgeBase: () => void;
  onTestVoiceGreeting?: () => void;
  errorMessage: string | null;
}

export const VoiceSessionPanel: React.FC<VoiceSessionPanelProps> = ({
  status,
  audioLevel,
  isMuted,
  language,
  latestModelSubtitle,
  latestUserSubtitle,
  onStartVoice,
  onEndVoice,
  onToggleMute,
  onSelectLanguage,
  onSelectSuggestedQuestion,
  onSwitchToTextChat,
  onOpenKnowledgeBase,
  onTestVoiceGreeting,
  errorMessage,
}) => {
  const isConnected = status === 'connected' || status === 'listening' || status === 'speaking';
  const isConnecting = status === 'connecting' || status === 'requesting_permission';
  const suggested = deliaProfile.suggestedQuestions[language];

  // Call duration timer
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer: any = null;
    if (isConnected) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[580px] p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-md border border-[#E8E3D9] shadow-sm relative overflow-hidden">
      {/* Decorative luxury background elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#E2DDD3]/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#1B382B]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header controls: Language & Knowledge Base info */}
      <div className="w-full flex items-center justify-between z-10 gap-2 mb-4">
        {/* Language selector toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#F5F2EB] rounded-full border border-[#E5E0D5]">
          <Globe className="w-3.5 h-3.5 text-[#1B382B]/60 ml-2 mr-1" />
          {(['en', 'fr', 'de'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => onSelectLanguage(lang)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                language === lang
                  ? 'bg-[#1B382B] text-amber-100 shadow-sm'
                  : 'text-[#1B382B]/70 hover:text-[#1B382B] hover:bg-black/5'
              }`}
            >
              {lang === 'en' ? 'EN' : lang === 'fr' ? 'FR' : 'DE'}
            </button>
          ))}
        </div>

        {/* Knowledge & Greeting test indicator */}
        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live {formatDuration(callDuration)}</span>
            </div>
          )}

          <button
            onClick={onTestVoiceGreeting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1B382B] bg-[#F5F2EB] hover:bg-[#EFEAE0] rounded-full transition-colors border border-[#E5E0D5]"
            title="Hear Lilou's warm polite greeting"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#C49E63]" />
            <span className="hidden sm:inline">Preview Voice</span>
          </button>

          <button
            onClick={onOpenKnowledgeBase}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1B382B] bg-[#F5F2EB] hover:bg-[#EFEAE0] rounded-full transition-colors border border-[#E5E0D5]"
            title="Inspect Lilou's verified knowledge base"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#C49E63]" />
            <span className="hidden sm:inline">Facts</span>
          </button>
        </div>
      </div>

      {/* Center Stage: Lilou Avatar and Dynamic Persona Presentation */}
      <div className="flex flex-col items-center justify-center my-auto z-10 w-full max-w-lg">
        <div className="mb-6 relative">
          <LilouAvatar
            status={status}
            audioLevel={audioLevel}
            size="hero"
            onClick={!isConnected && !isConnecting ? onStartVoice : undefined}
          />
        </div>

        {/* Identity & Subtitle Box */}
        <div className="text-center w-full px-2">
          <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold tracking-tight text-[#1B382B]">
            Lilou
          </h2>
          <p className="text-xs uppercase tracking-widest text-[#C49E63] font-semibold mt-0.5 mb-3">
            {language === 'fr'
              ? 'Assistante Vocale IA pour Délia Melters'
              : language === 'de'
              ? 'KI-Stimmassistentin für Délia Melters'
              : 'Voice AI Assistant for Délia Melters'}
          </p>

          {/* Subtitles / Speech Bubble Overlay */}
          <div className="min-h-[85px] flex items-center justify-center p-4 rounded-2xl bg-[#FAF8F5]/90 border border-[#E8E2D6] shadow-inner text-sm transition-all duration-200">
            {status === 'requesting_permission' ? (
              <div className="flex items-center gap-2.5 text-[#1B382B] font-medium animate-pulse">
                <Mic className="w-4 h-4 text-amber-500 animate-bounce" />
                <span>
                  {language === 'fr'
                    ? "Veuillez autoriser l'accès au microphone dans votre navigateur..."
                    : language === 'de'
                    ? 'Bitte erlauben Sie den Mikrofonzugriff im Browser...'
                    : 'Please allow microphone access in your browser prompt...'}
                </span>
              </div>
            ) : status === 'connecting' ? (
              <div className="flex items-center gap-2 text-[#1B382B]/85 font-medium">
                <RefreshCw className="w-4 h-4 animate-spin text-[#C49E63]" />
                <span>
                  {language === 'fr'
                    ? 'Connexion sécurisée en direct à Gemini Live...'
                    : language === 'de'
                    ? 'Sichere Verbindung zu Gemini Live wird aufgebaut...'
                    : 'Connecting directly to Gemini Live API...'}
                </span>
              </div>
            ) : status === 'speaking' ? (
              latestModelSubtitle ? (
                <p className="text-[#1B382B] font-medium leading-relaxed italic">
                  "{latestModelSubtitle}"
                </p>
              ) : (
                <div className="flex items-center gap-2 text-[#C49E63] font-medium animate-pulse">
                  <Sparkles className="w-4 h-4 text-[#C49E63]" />
                  <span>
                    {language === 'fr'
                      ? 'Lilou réfléchit et prépare sa réponse...'
                      : language === 'de'
                      ? 'Lilou denkt nach und antwortet...'
                      : 'Lilou is preparing her response...'}
                  </span>
                </div>
              )
            ) : status === 'listening' ? (
              latestUserSubtitle ? (
                <p className="text-[#3E6553] font-medium leading-relaxed">
                  <span className="text-xs uppercase font-semibold text-[#1B382B]/50 block mb-0.5">
                    {language === 'fr' ? 'Vous dites :' : language === 'de' ? 'Sie sagen:' : 'You said:'}
                  </span>
                  "{latestUserSubtitle}"
                </p>
              ) : (
                <div className="flex items-center gap-2 text-[#2E5A46] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span>
                    {language === 'fr'
                      ? 'Lilou est prête et vous écoute ! Parlez maintenant...'
                      : language === 'de'
                      ? 'Lilou ist bereit und hört zu! Sprechen Sie jetzt...'
                      : 'Lilou is ready and listening! Speak into your microphone...'}
                  </span>
                </div>
              )
            ) : status === 'error' ? (
              <div className="flex flex-col items-center gap-1.5 text-rose-700 text-xs sm:text-sm text-center font-medium">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage || 'Connection issue. Please retry or use text chat.'}</span>
                </div>
              </div>
            ) : (
              <p className="text-[#1B382B]/75 text-sm max-w-md">
                {language === 'fr'
                  ? 'Cliquez sur le bouton ci-dessous pour démarrer une conversation vocale naturelle en direct avec Lilou.'
                  : language === 'de'
                  ? 'Klicken Sie unten auf den Button, um ein direktes Stimmgespräch mit Lilou zu beginnen.'
                  : 'Click the button below to start a real-time, bidirectional voice conversation with Lilou.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="w-full flex flex-col items-center gap-4 z-10 mt-4">
        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!isConnected ? (
            <>
              <button
                onClick={onStartVoice}
                disabled={isConnecting}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-full font-semibold text-base transition-all shadow-md active:scale-95 ${
                  isConnecting
                    ? 'bg-[#3D5E4D] text-amber-100/70 cursor-wait'
                    : 'bg-[#1B382B] hover:bg-[#234938] text-amber-100 hover:shadow-lg hover:shadow-[#1B382B]/20'
                }`}
              >
                {isConnecting ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-300" />
                ) : (
                  <Mic className="w-5 h-5 text-amber-300 animate-pulse" />
                )}
                <span>
                  {status === 'requesting_permission'
                    ? language === 'fr'
                      ? 'Permission micro...'
                      : language === 'de'
                      ? 'Mikrofon erlauben...'
                      : 'Allow Microphone...'
                    : status === 'connecting'
                    ? language === 'fr'
                      ? 'Connexion en cours...'
                      : language === 'de'
                      ? 'Verbinde...'
                      : 'Connecting...'
                    : status === 'error'
                    ? language === 'fr'
                      ? 'Réessayer la voix'
                      : language === 'de'
                      ? 'Erneut verbinden'
                      : 'Retry Voice Connection'
                    : language === 'fr'
                    ? 'Parler à Lilou'
                    : language === 'de'
                    ? 'Mit Lilou sprechen'
                    : 'Start Voice Conversation'}
                </span>
              </button>

              {/* Text chat fallback button */}
              <button
                onClick={onSwitchToTextChat}
                className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#F5F2EB] hover:bg-[#EFEAE0] text-[#1B382B] text-sm font-semibold border border-[#E2DDD3] transition-colors shadow-2xs"
              >
                <MessageSquare className="w-4 h-4 text-[#C49E63]" />
                <span>
                  {language === 'fr' ? 'Utiliser le Chat Texte' : language === 'de' ? 'Text-Chat nutzen' : 'Use Text Chat'}
                </span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 bg-[#FAF8F5] p-2 rounded-full border border-[#E2DDD3] shadow-sm">
              {/* Mute button */}
              <button
                onClick={onToggleMute}
                className={`p-3 rounded-full transition-all ${
                  isMuted
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-[#EFEAE0] hover:bg-[#E5DFD3] text-[#1B382B]'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5 text-amber-800" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* End conversation button */}
              <button
                onClick={onEndVoice}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition-all shadow-sm active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                <span>
                  {language === 'fr' ? 'Terminer' : language === 'de' ? 'Beenden' : 'End Call'}
                </span>
              </button>

              {/* Text chat toggle button */}
              <button
                onClick={onSwitchToTextChat}
                className="p-3 rounded-full bg-[#EFEAE0] hover:bg-[#E5DFD3] text-[#1B382B] transition-all"
                title="Open transcript & text chat"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Suggested recruiter questions chips */}
        <div className="w-full mt-2">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#1B382B]/60 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C49E63]" />
              {language === 'fr'
                ? 'Suggestions pour recruteurs'
                : language === 'de'
                ? 'Fragen für Recruiter'
                : 'Suggested Recruiter Questions'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 justify-center max-h-36 overflow-y-auto p-1">
            {suggested.slice(0, 4).map((q, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSuggestedQuestion(q)}
                className="px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-xs font-medium text-[#1B382B] border border-[#E5E0D5] hover:border-[#C49E63]/60 transition-all text-left shadow-2xs hover:shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
