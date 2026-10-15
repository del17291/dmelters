import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  CornerDownLeft,
  Mic,
} from 'lucide-react';
import { TranscriptTurn } from '../services/geminiLiveClient.ts';
import { deliaProfile } from '../data/deliaProfile.ts';

interface ChatPanelProps {
  turns: TranscriptTurn[];
  isLiveActive: boolean;
  language: 'en' | 'fr' | 'de';
  isLoadingText: boolean;
  onSendMessage: (text: string) => void;
  onClearHistory: () => void;
  onSwitchToVoice: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  turns,
  isLiveActive,
  language,
  isLoadingText,
  onSendMessage,
  onClearHistory,
  onSwitchToVoice,
}) => {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, isLoadingText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isLoadingText) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleCopyTranscript = () => {
    const text = turns
      .map((t) => `[${t.role === 'user' ? 'Recruiter' : 'Lilou'}]: ${t.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-[580px] rounded-3xl bg-white/70 backdrop-blur-md border border-[#E8E3D9] shadow-sm overflow-hidden">
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-[#E8E3D9] flex items-center justify-between bg-[#F8F5EE]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1B382B] text-amber-100 flex items-center justify-center text-xs font-semibold">
            L
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#1B382B] flex items-center gap-2">
              <span>Lilou — Conversation Transcript</span>
              {isLiveActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Sync
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[#1B382B]/60">
              {language === 'fr'
                ? 'Historique synchronisé voix et texte'
                : language === 'de'
                ? 'Sprach- und Textprotokoll synchronisiert'
                : 'Real-time voice captions & text history'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {turns.length > 0 && (
            <>
              <button
                onClick={handleCopyTranscript}
                className="p-2 text-[#1B382B]/60 hover:text-[#1B382B] hover:bg-black/5 rounded-full transition-colors"
                title="Copy conversation"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={onClearHistory}
                className="p-2 text-[#1B382B]/60 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                title="Clear transcript"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          {!isLiveActive && (
            <button
              onClick={onSwitchToVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B382B] text-amber-100 hover:bg-[#234938] text-xs font-medium transition-all shadow-xs ml-1"
            >
              <Mic className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'fr' ? 'Activer Voix' : language === 'de' ? 'Sprache an' : 'Go Live'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {turns.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#1B382B]/60 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#F0ECE2] text-[#1B382B] flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-[#C49E63]" />
            </div>
            <p className="text-sm font-medium text-[#1B382B]">
              {language === 'fr'
                ? 'Aucun message pour le moment'
                : language === 'de'
                ? 'Noch keine Nachrichten vorhanden'
                : 'No messages yet'}
            </p>
            <p className="text-xs text-[#1B382B]/60 mt-1 mb-4">
              {language === 'fr'
                ? 'Posez vos questions par écrit ou activez la voix pour dialoguer directement avec Lilou.'
                : language === 'de'
                ? 'Schreiben Sie eine Frage oder aktivieren Sie die Sprache, um direkt mit Lilou zu sprechen.'
                : 'Type a question below or switch to live voice to talk with Lilou directly.'}
            </p>

            {/* Quick suggested chips */}
            <div className="flex flex-col gap-1.5 w-full">
              {deliaProfile.suggestedQuestions[language].slice(0, 3).map((q, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(q)}
                  className="px-3 py-2 text-xs rounded-xl bg-white hover:bg-[#F5F2EB] text-[#1B382B] border border-[#E5E0D5] text-left transition-colors"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          turns.map((turn) => {
            const isUser = turn.role === 'user';
            return (
              <div
                key={turn.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-[#1B382B] text-amber-200 flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                    L
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed transition-all ${
                    isUser
                      ? 'bg-[#1B382B] text-amber-50 rounded-br-xs'
                      : 'bg-white text-[#1A2E26] border border-[#E8E2D6] rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-75">
                    <span className="font-semibold uppercase tracking-wider">
                      {isUser ? (language === 'fr' ? 'Vous' : language === 'de' ? 'Sie' : 'Recruiter') : 'Lilou'}
                    </span>
                    <span className="text-[10px]">
                      {new Date(turn.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{turn.text}</p>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-[#E5DFD3] text-[#1B382B] flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading typing bubble */}
        {isLoadingText && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-[#1B382B] text-amber-200 flex items-center justify-center text-xs shrink-0">
              L
            </div>
            <div className="bg-white border border-[#E8E2D6] rounded-2xl rounded-bl-xs px-4 py-3 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1B382B]/60 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#1B382B]/60 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#1B382B]/60 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input box form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-[#E8E3D9] bg-[#FAF8F5] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isLiveActive
              ? language === 'fr'
                ? 'Écrivez un message en direct à Lilou...'
                : language === 'de'
                ? 'Nachricht direkt an Lilou senden...'
                : 'Type a message directly into Live session...'
              : language === 'fr'
              ? 'Posez une question à propos de Délia...'
              : language === 'de'
              ? 'Stellen Sie eine Frage zu Délia...'
              : "Ask Lilou about Délia's experience or skills..."
          }
          className="flex-1 px-4 py-2.5 rounded-full bg-white border border-[#E2DDD3] text-sm text-[#1B382B] placeholder-[#1B382B]/40 focus:outline-hidden focus:border-[#1B382B] focus:ring-1 focus:ring-[#1B382B]/20 transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoadingText}
          className="p-2.5 rounded-full bg-[#1B382B] hover:bg-[#234938] text-amber-100 disabled:opacity-40 disabled:hover:bg-[#1B382B] transition-all shadow-xs"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
