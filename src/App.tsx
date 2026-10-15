import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MessageSquare,
  FileText,
  ShieldCheck,
  Globe,
  Sparkles,
  Phone,
  Mail,
  ExternalLink,
  Volume2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { VoiceSessionPanel } from './components/VoiceSessionPanel.tsx';
import { ChatPanel } from './components/ChatPanel.tsx';
import { CVExplorer } from './components/CVExplorer.tsx';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal.tsx';
import { LiveSessionStatus, TranscriptTurn } from './services/geminiLiveClient.ts';
import { VoiceAssistantEngine } from './services/voiceAssistantEngine.ts';
import { sendChatMessage } from './services/apiClient.ts';
import { deliaProfile, buildLilouSystemInstruction } from './data/deliaProfile.ts';

export default function App() {
  const [language, setLanguage] = useState<'en' | 'fr' | 'de'>('en');
  const [status, setStatus] = useState<LiveSessionStatus>('idle');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subtitles & Transcripts
  const [latestModelSubtitle, setLatestModelSubtitle] = useState<string>('');
  const [latestUserSubtitle, setLatestUserSubtitle] = useState<string>('');
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [isLoadingText, setIsLoadingText] = useState<boolean>(false);

  // UI view state
  const [activeView, setActiveView] = useState<'voice' | 'chat'>('voice');
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState<boolean>(false);

  // Voice Assistant Engine Reference
  const voiceEngineRef = useRef<VoiceAssistantEngine | null>(null);

  // Initialize voice engine once on mount
  useEffect(() => {
    const systemInstruction = buildLilouSystemInstruction(language);
    const engine = new VoiceAssistantEngine(
      {
        onStatusChange: (newStatus) => {
          setStatus(newStatus);
          if (newStatus === 'listening') {
            setLatestModelSubtitle('');
          }
        },
        onTranscript: (turn) => {
          if (turn.role === 'model') {
            setLatestModelSubtitle(turn.text);
          } else {
            setLatestUserSubtitle(turn.text);
          }

          setTurns((prev) => {
            const idx = prev.findIndex((t) => t.id === turn.id);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = turn;
              return updated;
            } else {
              return [...prev, turn];
            }
          });
        },
        onAudioLevel: (level) => {
          setAudioLevel(level);
        },
        onError: (err) => {
          setErrorMessage(err);
        },
      },
      language,
      systemInstruction
    );

    voiceEngineRef.current = engine;

    return () => {
      engine.stop();
    };
  }, []);

  // Update engine configuration when language changes
  useEffect(() => {
    if (voiceEngineRef.current) {
      voiceEngineRef.current.updateConfig(language, buildLilouSystemInstruction(language));
    }
  }, [language]);

  // Start voice conversation
  const handleStartVoice = async () => {
    setErrorMessage(null);
    try {
      if (voiceEngineRef.current) {
        await voiceEngineRef.current.start();
      }
    } catch (err: any) {
      console.warn('Start voice failed:', err);
      setErrorMessage(err?.message || 'Failed to start voice conversation.');
    }
  };

  // End voice conversation
  const handleEndVoice = () => {
    if (voiceEngineRef.current) {
      voiceEngineRef.current.stop();
    }
    setStatus('idle');
    setAudioLevel(0);
    setLatestModelSubtitle('');
    setLatestUserSubtitle('');
  };

  // Toggle microphone mute
  const handleToggleMute = () => {
    if (voiceEngineRef.current) {
      const muted = voiceEngineRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  // Change conversation language
  const handleSelectLanguage = (newLang: 'en' | 'fr' | 'de') => {
    setLanguage(newLang);
    if (status === 'connected' || status === 'listening') {
      const greeting =
        newLang === 'fr'
          ? 'Bonjour Lilou, continuons en français.'
          : newLang === 'de'
          ? 'Hallo Lilou, bitte antworte ab jetzt auf Deutsch.'
          : 'Hello Lilou, let us continue in English.';
      try {
        voiceEngineRef.current?.sendTextQuery(greeting);
      } catch {}
    }
  };

  // Send message from chat input or suggested chip
  const handleSendMessage = async (text: string) => {
    setErrorMessage(null);

    // If voice session is active, route through voice engine
    if (status === 'connected' || status === 'listening' || status === 'speaking') {
      try {
        await voiceEngineRef.current?.sendTextQuery(text);
        return;
      } catch (err) {
        console.warn('Voice engine query failed, falling back to direct API:', err);
      }
    }

    // Direct text fallback
    const userTurn: TranscriptTurn = {
      id: 'user-' + Date.now(),
      role: 'user',
      text,
      isFinal: true,
      timestamp: new Date(),
    };

    setTurns((prev) => [...prev, userTurn]);
    setIsLoadingText(true);

    try {
      const result = await sendChatMessage(text, [...turns, userTurn], language, false);

      const modelTurn: TranscriptTurn = {
        id: 'model-' + Date.now(),
        role: 'model',
        text: result.text,
        isFinal: true,
        timestamp: new Date(),
      };

      setTurns((prev) => [...prev, modelTurn]);
      setLatestModelSubtitle(result.text);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Chat service failed. Please check your connection.');
    } finally {
      setIsLoadingText(false);
    }
  };

  // Ask Lilou about specific CV topic
  const handleAskLilouAbout = (topic: string) => {
    if (status === 'idle' || status === 'error') {
      setActiveView('chat');
    }
    handleSendMessage(topic);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A2E26] flex flex-col font-sans">
      {/* Top Luxury Navbar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E3D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand & Monogram */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#1B382B] text-amber-100 flex items-center justify-center font-serif-luxury font-bold text-xl shadow-xs border border-[#C49E63]/30">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif-luxury font-bold tracking-tight text-[#1B382B]">
                  Lilou
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#EAE5DA] text-[#1B382B] text-[10px] font-semibold tracking-wider uppercase">
                  Voice AI
                </span>
              </div>
              <p className="text-xs text-[#C49E63] font-medium hidden sm:block">
                Interactive Voice CV for Délia Melters
              </p>
            </div>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#F3EFE6] p-1 rounded-full border border-[#E2DDD3]">
              {(['en', 'fr', 'de'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleSelectLanguage(lang)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                    language === lang
                      ? 'bg-[#1B382B] text-amber-100 shadow-2xs'
                      : 'text-[#1B382B]/70 hover:text-[#1B382B]'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Facts Modal Trigger */}
            <button
              onClick={() => setIsKnowledgeModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1B382B] bg-[#F5F2EB] hover:bg-[#EFEAE0] rounded-full border border-[#E2DDD3] transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#C49E63]" />
              <span>Verified Facts</span>
            </button>

            {/* Direct Contact Button */}
            <a
              href={`mailto:${deliaProfile.email}?subject=Recruiter%20Inquiry%20via%20Lilou%20Interactive%20CV`}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1B382B] text-amber-100 hover:bg-[#234938] text-xs font-semibold transition-all shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Contact Délia</span>
              <span className="sm:hidden">Email</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Hero Introduction Ribbon */}
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/40 text-amber-900 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C49E63]" />
            <span>Interactive Voice & Audio Assistant &bull; Multilingual</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif-luxury font-bold text-[#1B382B] tracking-tight leading-tight">
            Meet Lilou, AI Ambassador for Délia Melters
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#1B382B]/75 leading-relaxed">
            {language === 'fr'
              ? "Posez vos questions de vive voix ou par écrit sur les diplômes, les expériences chez KENKO et Hercule Studio, les compétences trilingues et le 1er prix d'innovation de Délia."
              : language === 'de'
              ? 'Sprechen Sie direkt mit Lilou oder schreiben Sie, um Délias Masterstudium, Praxiserfahrung bei KENKO & Hercule Studio, Dreisprachigkeit und Innovationsauszeichnung zu erkunden.'
              : "Ask Lilou anything via real-time voice or text regarding Délia's international marketing background, luxury branding at Hercule Studio & KENKO, trilingual fluency, and European award."}
          </p>
        </div>

        {/* Dual Column Layout: Left (Lilou Voice & Transcript), Right (Interactive CV Explorer) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Voice Assistant & Chat Center (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* View Selector Tabs */}
            <div className="flex items-center p-1 bg-[#F0ECE2] rounded-2xl border border-[#E2DDD3]">
              <button
                onClick={() => setActiveView('voice')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === 'voice'
                    ? 'bg-white text-[#1B382B] shadow-2xs font-bold'
                    : 'text-[#1B382B]/60 hover:text-[#1B382B]'
                }`}
              >
                <Mic className="w-4 h-4 text-[#C49E63]" />
                <span>Live Voice AI</span>
              </button>
              <button
                onClick={() => setActiveView('chat')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === 'chat'
                    ? 'bg-white text-[#1B382B] shadow-2xs font-bold'
                    : 'text-[#1B382B]/60 hover:text-[#1B382B]'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-[#C49E63]" />
                <span>Transcript & Text</span>
                {turns.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#1B382B] text-amber-200 text-[10px] flex items-center justify-center">
                    {turns.length}
                  </span>
                )}
              </button>
            </div>

            {/* Active View Container */}
            {activeView === 'voice' ? (
              <VoiceSessionPanel
                status={status}
                audioLevel={audioLevel}
                isMuted={isMuted}
                language={language}
                latestModelSubtitle={latestModelSubtitle}
                latestUserSubtitle={latestUserSubtitle}
                onStartVoice={handleStartVoice}
                onEndVoice={handleEndVoice}
                onToggleMute={handleToggleMute}
                onSelectLanguage={handleSelectLanguage}
                onSelectSuggestedQuestion={handleSendMessage}
                onSwitchToTextChat={() => setActiveView('chat')}
                onOpenKnowledgeBase={() => setIsKnowledgeModalOpen(true)}
                errorMessage={errorMessage}
              />
            ) : (
              <ChatPanel
                turns={turns}
                isLiveActive={status === 'connected' || status === 'listening' || status === 'speaking'}
                language={language}
                isLoadingText={isLoadingText}
                onSendMessage={handleSendMessage}
                onClearHistory={() => setTurns([])}
                onSwitchToVoice={() => {
                  setActiveView('voice');
                  if (status === 'idle') handleStartVoice();
                }}
              />
            )}

            {/* Quick Helper Banner */}
            <div className="p-4 rounded-2xl bg-[#F5F2EB]/80 border border-[#E5E0D5] text-xs text-[#1B382B]/75 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#C49E63] shrink-0" />
                <span>Real-time voice & spoken answers &bull; Anti-hallucination verified</span>
              </div>
              <button
                onClick={() => setIsKnowledgeModalOpen(true)}
                className="text-[11px] font-semibold underline text-[#1B382B] hover:text-[#2E5A46]"
              >
                Architecture Info
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive CV Explorer (7 cols on lg) */}
          <div className="lg:col-span-7">
            <CVExplorer language={language} onAskLilouAbout={handleAskLilouAbout} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E3D9] bg-white/60 py-6 mt-12 text-center text-xs text-[#1B382B]/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-luxury font-bold text-[#1B382B] text-base">Lilou</span>
            <span>&bull;</span>
            <span>Délia Melters Interactive CV Assistant</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsKnowledgeModalOpen(true)}
              className="hover:text-[#1B382B] underline"
            >
              Anti-Hallucination & Architecture
            </button>
            <a href={`mailto:${deliaProfile.email}`} className="hover:text-[#1B382B]">
              {deliaProfile.email}
            </a>
            <span>Paris, France</span>
          </div>
        </div>
      </footer>

      {/* Knowledge Base & Architecture Modal */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
      />
    </div>
  );
}
