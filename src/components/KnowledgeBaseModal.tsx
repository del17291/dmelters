import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  BookOpen,
  DollarSign,
  Cloud,
  Lock,
  CheckCircle,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import { deliaProfile } from '../data/deliaProfile.ts';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'anti_hallucination' | 'architecture'>(
    'profile'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#FAF8F5] rounded-3xl border border-[#E8E3D9] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E3D9] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1B382B] text-amber-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif-luxury font-bold text-[#1B382B]">
                Lilou Knowledge Base & Architecture
              </h2>
              <p className="text-[11px] text-[#1B382B]/60">
                Transparent verified facts, anti-hallucination policy, and serverless cost model
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#1B382B]/60 hover:text-[#1B382B] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#E8E3D9] bg-[#F5F2EB]/60">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-[#1B382B] border-t border-x border-[#E8E3D9] shadow-2xs'
                : 'text-[#1B382B]/60 hover:text-[#1B382B]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
            Verified Facts Repository
          </button>
          <button
            onClick={() => setActiveTab('anti_hallucination')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all ${
              activeTab === 'anti_hallucination'
                ? 'bg-white text-[#1B382B] border-t border-x border-[#E8E3D9] shadow-2xs'
                : 'text-[#1B382B]/60 hover:text-[#1B382B]'
            }`}
          >
            <Lock className="w-3.5 h-3.5 inline mr-1.5" />
            Anti-Hallucination Guardrails
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all ${
              activeTab === 'architecture'
                ? 'bg-white text-[#1B382B] border-t border-x border-[#E8E3D9] shadow-2xs'
                : 'text-[#1B382B]/60 hover:text-[#1B382B]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 inline mr-1.5" />
            Cost & Deployment Architecture
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-emerald-900 text-xs">
                <strong>Strict Source of Truth:</strong> Lilou is anchored strictly to this verified
                knowledge base derived directly from Délia Melters' official curriculum vitae. She speaks in the
                third person and never fabricates details.
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8E3D9] space-y-3">
                <h4 className="font-bold text-[#1B382B]">1. Candidate Profile</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#1B382B]/80">
                  <div><strong>Name:</strong> {deliaProfile.name}</div>
                  <div><strong>Current Location:</strong> {deliaProfile.location}</div>
                  <div><strong>Email:</strong> {deliaProfile.email}</div>
                  <div><strong>Phone:</strong> {deliaProfile.phone}</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8E3D9] space-y-2">
                <h4 className="font-bold text-[#1B382B]">2. Verified Academic Degrees</h4>
                {deliaProfile.education.map((edu) => (
                  <div key={edu.id} className="text-xs border-b border-[#F5F2EB] pb-2 last:border-b-0">
                    <span className="font-semibold text-[#1B382B]">{edu.degree}</span> — {edu.institution} ({edu.period})
                  </div>
                ))}
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8E3D9] space-y-2">
                <h4 className="font-bold text-[#1B382B]">3. Verified Career Experience</h4>
                {deliaProfile.experience.map((exp) => (
                  <div key={exp.id} className="text-xs border-b border-[#F5F2EB] pb-2 last:border-b-0">
                    <span className="font-semibold text-[#1B382B]">{exp.role}</span> at {exp.company} ({exp.period}, {exp.location})
                  </div>
                ))}
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8E3D9] space-y-2">
                <h4 className="font-bold text-[#1B382B]">4. Verified Honors & Awards</h4>
                {deliaProfile.projectsAndHonors.map((p) => (
                  <div key={p.id} className="text-xs border-b border-[#F5F2EB] pb-2 last:border-b-0">
                    <span className="font-semibold text-[#1B382B]">{p.title}</span> — {p.organization} ({p.date})
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'anti_hallucination' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-950 text-xs leading-relaxed">
                <strong>Why Recruiters Can Trust Lilou:</strong> Traditional generative bots often hallucinate credentials.
                Lilou enforces strict boundaries in her system instruction:
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-white rounded-2xl border border-[#E8E3D9] flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-[#1B382B] text-xs">Third-Person Representation</h5>
                    <p className="text-xs text-[#1B382B]/75 mt-0.5">
                      Lilou introduces herself as Délia's AI voice ambassador and talks about Délia as "she / her", ensuring no confusion about identity.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E8E3D9] flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-[#1B382B] text-xs">Grounding in Verified Facts</h5>
                    <p className="text-xs text-[#1B382B]/75 mt-0.5">
                      Every detail—from the 1st place in the Croatia sustainable tourism innovation contest to the U.S. expansion at Hercule Studio—is sourced verbatim from Délia's verified credentials.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E8E3D9] flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-[#1B382B] text-xs">Safe Boundary Handling</h5>
                    <p className="text-xs text-[#1B382B]/75 mt-0.5">
                      If asked about private topics, salary expectations, or undisclosed personal details, Lilou politely declines and provides Délia's contact details (<a href={`mailto:${deliaProfile.email}`} className="underline font-semibold">{deliaProfile.email}</a>).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-blue-950 text-xs leading-relaxed">
                <strong>Deployment & Zero-Idle-Cost Guarantee:</strong> Built specifically to resolve past Vercel WebSocket failures without requiring expensive dedicated servers.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-[#E8E3D9]">
                  <Cpu className="w-5 h-5 text-[#1B382B] mb-2" />
                  <h5 className="font-bold text-[#1B382B] text-xs">Short-Lived Ephemeral Tokens</h5>
                  <p className="text-xs text-[#1B382B]/75 mt-1 leading-relaxed">
                    The backend endpoint <code className="bg-[#FAF8F5] px-1 py-0.5 rounded text-[11px]">/api/token</code> issues a 3-minute ephemeral token via Google GenAI. The browser connects directly to Google's Live WebSocket endpoint.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E8E3D9]">
                  <Cloud className="w-5 h-5 text-[#1B382B] mb-2" />
                  <h5 className="font-bold text-[#1B382B] text-xs">No Persistent Server Required</h5>
                  <p className="text-xs text-[#1B382B]/75 mt-1 leading-relaxed">
                    Fully compatible with Vercel Serverless Functions, Google Cloud Run, and AI Studio. Scales down to 0 instances when idle, incurring zero fixed hosting cost.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E8E3D9]">
                  <DollarSign className="w-5 h-5 text-[#1B382B] mb-2" />
                  <h5 className="font-bold text-[#1B382B] text-xs">Free / Ultra-Low API Costs</h5>
                  <p className="text-xs text-[#1B382B]/75 mt-1 leading-relaxed">
                    Gemini Developer API includes generous free tier limits for prototyping and personal CV traffic. Pay-as-you-go audio tokens cost pennies per hour of recruiter talk time.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E8E3D9]">
                  <Lock className="w-5 h-5 text-[#1B382B] mb-2" />
                  <h5 className="font-bold text-[#1B382B] text-xs">Zero API Key Leakage</h5>
                  <p className="text-xs text-[#1B382B]/75 mt-1 leading-relaxed">
                    The permanent <code className="bg-[#FAF8F5] px-1 py-0.5 rounded text-[11px]">GEMINI_API_KEY</code> never touches the browser bundle or client network payloads.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E8E3D9] bg-[#FAF8F5] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#1B382B] text-amber-100 hover:bg-[#234938] text-xs font-semibold transition-all shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
