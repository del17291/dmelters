import React, { useState } from 'react';
import {
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  ChevronRight,
  MessageCircle,
  Download,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { deliaProfile } from '../data/deliaProfile.ts';

interface CVExplorerProps {
  language: 'en' | 'fr' | 'de';
  onAskLilouAbout: (topic: string) => void;
}

export const CVExplorer: React.FC<CVExplorerProps> = ({ language, onAskLilouAbout }) => {
  const [activeTab, setActiveTab] = useState<'experience' | 'education' | 'projects' | 'skills'>(
    'experience'
  );

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-[#E8E3D9] p-6 sm:p-8 shadow-sm">
      {/* Top Profile Summary Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#E8E3D9]">
        <div className="flex items-center gap-5">
          {/* Elegant Monogram / Portrait Badge */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#1B382B] to-[#2E5A46] text-amber-100 flex flex-col items-center justify-center shrink-0 shadow-md border-2 border-[#C49E63]/40">
            <span className="text-2xl sm:text-3xl font-serif-luxury font-bold tracking-wider">DM</span>
            <span className="text-[10px] uppercase tracking-widest text-amber-200/80">Paris</span>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#1B382B]">
                {deliaProfile.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300/40 text-[11px] font-semibold">
                Available for Roles
              </span>
            </div>
            <p className="text-sm font-medium text-[#C49E63] mt-0.5 max-w-xl">
              {deliaProfile.title}
            </p>

            {/* Contact Pills */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#1B382B]/80">
              <span className="flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E8E3D9]">
                <MapPin className="w-3.5 h-3.5 text-[#C49E63]" />
                {deliaProfile.location}
              </span>
              <a
                href={`mailto:${deliaProfile.email}`}
                className="flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E8E3D9] hover:border-[#1B382B] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#C49E63]" />
                {deliaProfile.email}
              </a>
              <span className="flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E8E3D9]">
                <Phone className="w-3.5 h-3.5 text-[#C49E63]" />
                {deliaProfile.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Language Proficiency Bar */}
        <div className="flex flex-col gap-1.5 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E3D9] self-stretch md:self-auto shrink-0">
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#1B382B]/60 flex items-center gap-1">
            <Globe className="w-3 h-3 text-[#C49E63]" />
            Languages
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#1B382B]">German</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-medium">Native</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#1B382B]">French</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-medium">C2 Fluent</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#1B382B]">English</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-medium">C2 Fluent</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#1B382B]">Spanish</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-stone-200 text-stone-700 rounded font-medium">A2 Basic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Bio Quote */}
      <div className="my-6 p-4 rounded-2xl bg-[#FAF8F5] border-l-4 border-[#1B382B] text-sm text-[#1B382B]/85 italic leading-relaxed">
        "{deliaProfile.bio[language]}"
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E3D9] pb-3 mb-6 overflow-x-auto">
        {[
          { id: 'experience', label: 'Experience', icon: Briefcase, count: deliaProfile.experience.length },
          { id: 'education', label: 'Education', icon: GraduationCap, count: deliaProfile.education.length },
          { id: 'projects', label: 'Awards & Projects', icon: Award, count: deliaProfile.projectsAndHonors.length },
          { id: 'skills', label: 'Skills & Passions', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-[#1B382B] text-amber-100 shadow-xs'
                  : 'text-[#1B382B]/70 hover:text-[#1B382B] hover:bg-[#F5F2EB]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-[#2E5A46] text-amber-200' : 'bg-[#EAE5DA] text-[#1B382B]/70'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Experience */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          {deliaProfile.experience.map((exp) => (
            <div
              key={exp.id}
              className="p-5 rounded-2xl bg-white border border-[#E8E3D9] hover:border-[#C49E63]/60 transition-all shadow-2xs group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-bold text-[#1B382B] group-hover:text-[#2E5A46] transition-colors">
                    {exp.role}
                  </h3>
                  <div className="text-xs font-semibold text-[#C49E63]">
                    {exp.company} &bull; <span className="text-[#1B382B]/60 font-normal">{exp.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2.5 py-1 bg-[#FAF8F5] text-[#1B382B]/80 rounded-full border border-[#E8E3D9]">
                    {exp.period}
                  </span>
                  <button
                    onClick={() =>
                      onAskLilouAbout(
                        `Tell me in detail about Délia's work as ${exp.role} at ${exp.company}.`
                      )
                    }
                    className="flex items-center gap-1 text-xs text-[#1B382B] bg-[#F5F2EB] hover:bg-[#1B382B] hover:text-amber-100 px-3 py-1 rounded-full transition-all border border-[#E2DDD3]"
                    title="Ask Lilou about this role"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Ask Lilou</span>
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#1B382B]/80 mb-3">{exp.summary}</p>

              <ul className="space-y-1.5 mb-4">
                {exp.bulletPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#1B382B]/85 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E5A46] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#F2ECE1]">
                {exp.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#1B382B]/70 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: Education */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          {deliaProfile.education.map((edu) => (
            <div
              key={edu.id}
              className="p-5 rounded-2xl bg-white border border-[#E8E3D9] hover:border-[#C49E63]/60 transition-all shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-bold text-[#1B382B]">{edu.degree}</h3>
                  <div className="text-xs font-semibold text-[#C49E63]">{edu.institution}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2.5 py-1 bg-[#FAF8F5] text-[#1B382B]/80 rounded-full border border-[#E8E3D9]">
                    {edu.period}
                  </span>
                  {edu.honors && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300/40">
                      {edu.honors}
                    </span>
                  )}
                  <button
                    onClick={() =>
                      onAskLilouAbout(`Tell me about Délia's studies at ${edu.institution} (${edu.degree}).`)
                    }
                    className="flex items-center gap-1 text-xs text-[#1B382B] bg-[#F5F2EB] hover:bg-[#1B382B] hover:text-amber-100 px-3 py-1 rounded-full transition-all border border-[#E2DDD3]"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Ask Lilou</span>
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#1B382B]/80 leading-relaxed">{edu.details}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: Projects & Awards */}
      {activeTab === 'projects' && (
        <div className="space-y-5">
          {deliaProfile.projectsAndHonors.map((proj) => (
            <div
              key={proj.id}
              className="p-6 rounded-2xl bg-gradient-to-br from-white via-white to-[#FAF6EE] border-2 border-[#C49E63]/40 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-amber-800" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1B382B]">{proj.title}</h3>
                    <div className="text-xs font-semibold text-[#C49E63]">
                      {proj.organization} &bull; {proj.date}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    onAskLilouAbout(
                      `Tell me all about Délia's 1st place award in the European sustainable tourism competition in Croatia.`
                    )
                  }
                  className="flex items-center gap-1.5 text-xs text-[#1B382B] bg-[#F5F2EB] hover:bg-[#1B382B] hover:text-amber-100 px-3.5 py-1.5 rounded-full transition-all border border-[#E2DDD3] shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#C49E63]" />
                  <span>Ask Lilou to Explain</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#1B382B]/85 leading-relaxed mb-3">
                {proj.description}
              </p>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E3D9] text-xs text-[#1B382B]/90">
                <span className="font-semibold text-[#1B382B]">Executive Impact: </span>
                {proj.impact}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: Skills & Passions */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {deliaProfile.skills.map((cat, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-[#E8E3D9] shadow-2xs">
                <h4 className="text-sm font-bold text-[#1B382B] mb-3 pb-2 border-b border-[#F0ECE2] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C49E63]" />
                  {cat.category}
                </h4>
                <div className="space-y-2.5">
                  {cat.skills.map((s, i) => (
                    <div key={i} className="flex flex-col text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1B382B]">{s.name}</span>
                        {s.level && (
                          <span className="text-[10px] px-2 py-0.2 bg-[#F5F2EB] text-[#1B382B]/80 rounded font-medium">
                            {s.level}
                          </span>
                        )}
                      </div>
                      {s.notes && <span className="text-[11px] text-[#1B382B]/60 mt-0.5">{s.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Athletic & Creative Leadership */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E3D9]">
            <h4 className="text-sm font-bold text-[#1B382B] mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#C49E63]" />
              Personal Leadership & Passions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {deliaProfile.interests.map((int, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-[#E8E3D9] text-xs">
                  <h5 className="font-bold text-[#1B382B] mb-1">{int.category}</h5>
                  <p className="text-[#1B382B]/75 mb-2">{int.description}</p>
                  <ul className="space-y-1">
                    {int.highlights.map((h, i) => (
                      <li key={i} className="text-[#1B382B]/80 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C49E63] shrink-0 mt-1" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
