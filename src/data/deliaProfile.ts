/**
 * Verified Knowledge Base for Délia Melters.
 * Lilou is instructed to ONLY draw facts from this repository and never invent details.
 */

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  category: 'work' | 'engagement' | 'early';
  summary: string;
  bulletPoints: string[];
  tags: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  honors?: string;
  details: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  organization: string;
  date: string;
  award?: string;
  description: string;
  impact: string;
}

export interface SkillCategory {
  category: string;
  skills: { name: string; level?: string; notes?: string }[];
}

export interface DeliaProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  languages: { language: string; proficiency: string; note: string }[];
  bio: {
    en: string;
    fr: string;
    de: string;
  };
  executiveSummary: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  projectsAndHonors: ProjectItem[];
  skills: SkillCategory[];
  interests: {
    category: string;
    description: string;
    highlights: string[];
  }[];
  suggestedQuestions: {
    en: string[];
    fr: string[];
    de: string[];
  };
}

export const deliaProfile: DeliaProfile = {
  name: "Délia Melters",
  title: "Master's Student in Luxury, Communications & Prestige Marketing | International Marketing Professional",
  email: "del17291@gmail.com",
  phone: "+49 152 26351065",
  location: "Paris, France (with extensive background living in Germany, France, and the USA)",
  languages: [
    { language: "German", proficiency: "Native", note: "Mother tongue, educated in Germany" },
    { language: "French", proficiency: "Fluent (C2)", note: "Studying and working in France, bilingual degree" },
    { language: "English", proficiency: "Fluent (C2)", note: "US exchange year, professional working proficiency" },
    { language: "Spanish", proficiency: "Elementary (A2)", note: "Basic conversational foundation" },
  ],
  executiveSummary:
    "Proactive, creative, and communicative professional with two years of experience in international marketing and the luxury sports and design sector. Fluent in three languages with adaptability and open-mindedness shaped by living in three countries. Strong interest in sustainability and tourism, highlighted by a 1st-place win in a Europe-wide tourism innovation competition.",
  bio: {
    en: "Délia Melters is an international marketing talent pursuing a Double Master's Degree in International Marketing (HWR Berlin) and Luxury, Communications & Prestige Marketing (ESCE Paris). Having lived and studied in Germany, France, and the United States, she brings a truly multicultural mindset, trilingual fluency, and proven hands-on experience in brand development, Kickstarter launch management, and international market expansion.",
    fr: "Délia Melters est une professionnelle du marketing international qui prépare un Double Master en Marketing International (HWR Berlin) et en Luxe, Communication & Marketing de Prestige (ESCE Paris). Forte de ses expériences de vie et d'études en Allemagne, en France et aux États-Unis, elle allie aisance trilingue, créativité et compétences éprouvées en stratégie de marque, lancements de campagnes et expansion internationale.",
    de: "Délia Melters ist eine internationale Marketingexpertin im Double-Master-Studium: International Marketing an der HWR Berlin sowie Luxury, Communications & Prestige Marketing an der ESCE Paris. Durch ihre Stationen in Deutschland, Frankreich und den USA verbindet sie gelebte Dreisprachigkeit, hohe Anpassungsfähigkeit und praktische Erfolge in Markenaufbau, Kampagnenführung und internationaler Markterschließung.",
  },
  education: [
    {
      id: "master-double",
      degree: "Double Master's Degree: International Marketing (HWR Berlin) & Luxury, Comm. and Prestige Marketing (ESCE Paris)",
      institution: "HWR Berlin (Germany) & ESCE Paris (France)",
      period: "2026 – present",
      details: "Advanced international program combining strategic brand positioning, luxury sector dynamics, omnichannel communication, and prestige marketing.",
    },
    {
      id: "bachelor-double",
      degree: "German-French Double Bachelor's Degree in International Management",
      institution: "HWR Berlin (Germany) & ESCE Paris (France)",
      period: "2022 – 2026",
      details: "Comprehensive curriculum in cross-border business management, international market analysis, multicultural team leadership, and corporate strategy.",
    },
    {
      id: "gymnasium",
      degree: "High School Diploma (Abitur)",
      institution: "Gymnasium Prenzlau (Germany)",
      period: "2019 – 2022",
      honors: "Graduated with honors",
      details: "Rigorous academic secondary education completed with distinguished honors.",
    },
    {
      id: "us-exchange",
      degree: "High School Exchange Year in the USA",
      institution: "Northern High School, Calvert County, Maryland, USA",
      period: "2018 – 2019",
      details: "Full cultural immersion year in the United States, achieving fluent English proficiency and deep cross-cultural adaptability.",
    },
    {
      id: "montessori",
      degree: "Foundational Education",
      institution: "Montessori Nature School Prenzlau",
      period: "2009 – 2018",
      details: "Self-directed learning philosophy, fostering intrinsic curiosity, creative problem solving, and collaborative thinking.",
    },
  ],
  experience: [
    {
      id: "kenko",
      role: "International Marketing Working Student",
      company: "KENKO GmbH",
      location: "Berlin, Germany",
      period: "April 2025 – July 2026",
      category: "work",
      summary: "Spearheaded international marketing campaigns and sub-brand development for high-end wellness & design products.",
      bulletPoints: [
        "Supported international marketing activities and cross-border project management.",
        "Co-developed campaign strategy, social media roadmaps, and multimedia content production.",
        "Contributed actively to the development of a new sub-brand: brand positioning, photoshoots, video production, and post-editing.",
        "Created, managed, and executed its international Kickstarter crowdfunding campaign.",
      ],
      tags: ["International Marketing", "Brand Positioning", "Kickstarter", "Content Production", "Social Media"],
    },
    {
      id: "galeries-lafayette",
      role: "Sales Associate – Hercule Studio",
      company: "Galeries Lafayette Paris (dedicated Wellness Space)",
      location: "Paris, France",
      period: "December 2024",
      category: "work",
      summary: "Luxury retail sales and visual merchandising for Hercule Studio's designer fitness accessories.",
      bulletPoints: [
        "Advised high-end international clientele in the dedicated Wellness Space at Galeries Lafayette Haussmann.",
        "Showcased Hercule Studio's premium fitness and design accessories through elegant visual merchandising.",
        "Leveraged multilingual interpersonal communication to boost brand visibility and drive strong holiday sales figures.",
      ],
      tags: ["Luxury Retail", "Visual Merchandising", "Customer Relations", "Holiday Sales"],
    },
    {
      id: "hercule-studio",
      role: "Marketing Internship",
      company: "Hercule Studio SAS",
      location: "Nice, France",
      period: "September 2024 – March 2025",
      category: "work",
      summary: "Strategic marketing and international expansion for a fast-growing French luxury sports and design brand.",
      bulletPoints: [
        "Supported the brand's United States expansion: managed official US entity application and selected US logistics partners.",
        "Benchmarked competitive dynamics and consumer trends across international target markets.",
        "Created multimedia marketing assets (video production, digital ads, social media campaigns).",
        "Organized promotional events and represented Hercule Studio at premier trade fairs.",
        "Gained deep commercial insights into the intersection of luxury, sports, and product design.",
      ],
      tags: ["US Market Expansion", "Logistics Selection", "Market Benchmarking", "Event Organization", "Content Creation"],
    },
    {
      id: "esce-art",
      role: "Social Media Manager",
      company: "ESCE Business School Artistic Association",
      location: "Paris, France",
      period: "January 2024 – May 2024",
      category: "engagement",
      summary: "Led social media strategy and digital communications for student creative initiatives.",
      bulletPoints: [
        "Curated and produced engaging Instagram content to elevate the artistic association's visibility.",
        "Synthesized and communicated key event information across diverse campus communities.",
        "Coordinated cross-functional content from various student sub-associations.",
      ],
      tags: ["Social Media Management", "Content Creation", "Community Coordination"],
    },
    {
      id: "gospel-choir",
      role: "Pianist for a Gospel Choir",
      company: "St. Jacobi-Kirche",
      location: "Prenzlau, Germany",
      period: "October 2019 – December 2021",
      category: "engagement",
      summary: "Collaborative musical performance and rhythm coordination for church choir performances.",
      bulletPoints: [
        "Collaborated closely with choir members to enhance performances through expressive piano accompaniment.",
        "Demonstrated musical precision, discipline, and creative coordination under live performance conditions.",
      ],
      tags: ["Piano", "Musical Collaboration", "Live Performance"],
    },
    {
      id: "organic-farm",
      role: "Part-Time Agricultural Worker",
      company: "Regenbogen Hof Uckermark",
      location: "Uckermark, Germany",
      period: "August 2020",
      category: "early",
      summary: "Hands-on experience in hard physical teamwork and sustainable produce cultivation.",
      bulletPoints: [
        "Contributed to daily farm operations ensuring the growth of healthy, certified organic produce.",
        "Embodied rigorous work ethic, perseverance, and teamwork in an environmental setting.",
      ],
      tags: ["Work Ethic", "Sustainability", "Teamwork"],
    },
    {
      id: "hotel-hospitality",
      role: "Part-Time Hospitality Employee",
      company: "Hotel Uckermark (FINE ARTS- Hotel- und Restaurantgesellschaft mbH & KG)",
      location: "Prenzlau, Germany",
      period: "July 2020 – August 2020",
      category: "early",
      summary: "Customer service and quality assurance in a four-star hotel and restaurant environment.",
      bulletPoints: [
        "Ensured refined guest satisfaction through meticulous housekeeping and professional event waitressing.",
        "Demonstrated acute attention to detail, composure under high-stress rushes, and adherence to 4-star standards.",
      ],
      tags: ["Hospitality", "Customer Service", "Attention to Detail", "High Standards"],
    },
  ],
  projectsAndHonors: [
    {
      id: "croatia-award",
      title: "1st Place – Europe-Wide Sustainable Tourism Innovation Competition",
      organization: "BEST STAY EVENT CROATIA (Sponsored by BWH Hotels & PAVE Europe)",
      date: "February 2026",
      award: "1st Place Winner (Europe-wide)",
      description:
        "Engineered an innovative sustainable tourism framework for Croatia that seamlessly weaves autonomous electric mobility into the traveler journey to minimize carbon footprints and disperse tourist flow away from overcrowded hotspots.",
      impact:
        "Praised by international hospitality executives from BWH Hotels and PAVE Europe for viable commercial design, technological feasibility, and ecological sustainability.",
    },
    {
      id: "anne-frank-guide",
      title: "Exhibition Guide – 'Deine Anne (Frank)'",
      organization: "Anne Frank Zentrum / Prenzlau",
      date: "February – March 2020",
      description:
        "Guided youth groups, classes, and adult visitors through the historical traveling exhibition, facilitating nuanced discussions on history, tolerance, empathy, and civic responsibility.",
      impact:
        "Honed empathetic public speaking and intercultural sensitivity when addressing complex socio-historical topics.",
    },
  ],
  skills: [
    {
      category: "Marketing & Strategy",
      skills: [
        { name: "Brand Positioning & Strategy", level: "Advanced", notes: "Sub-brand development at KENKO & luxury positioning at Hercule Studio" },
        { name: "Kickstarter / Crowdfunding", level: "Experienced", notes: "End-to-end campaign architecture and backers management" },
        { name: "International Market Expansion", level: "Experienced", notes: "US entity setup, logistics benchmarking, foreign market research" },
        { name: "Luxury & Prestige Marketing", level: "Specialist", notes: "Master's focus at ESCE Paris, retail experience at Galeries Lafayette" },
        { name: "Social Media & Content Strategy", level: "Advanced", notes: "Instagram, video production, photoshoot direction" },
        { name: "Sustainable Tourism Concepts", level: "Award-winning", notes: "1st place across Europe (BEST STAY Croatia)" },
      ],
    },
    {
      category: "Languages",
      skills: [
        { name: "German", level: "Native (C2)", notes: "Mother tongue" },
        { name: "French", level: "Fluent (C2)", notes: "Academic and professional fluency in Paris and Nice" },
        { name: "English", level: "Fluent (C2)", notes: "US exchange year + international business curricula" },
        { name: "Spanish", level: "Elementary (A2)", notes: "Conversational foundations" },
      ],
    },
    {
      category: "Creative & Software",
      skills: [
        { name: "Adobe Photoshop", level: "Proficient", notes: "Visual design, promotional material retouching" },
        { name: "Canva", level: "Advanced", notes: "Rapid digital asset creation for campaigns" },
        { name: "iMovie / Video Editing", level: "Proficient", notes: "Social media video production and reels" },
        { name: "Microsoft Office Suite", level: "Advanced", notes: "Word, Excel (data models/benchmarks), PowerPoint (pitch decks)" },
        { name: "Photography & Videography", level: "Skilled", notes: "Formal coursework (2018–2019) + continuous brand projects" },
      ],
    },
    {
      category: "Interpersonal & Leadership",
      skills: [
        { name: "Cheerleading Captaincy", level: "Leadership", notes: "Captain of the United Cheerleading Team of all Berlin Universities" },
        { name: "Cross-Cultural Dexterity", level: "Native mindset", notes: "Lived and studied in Germany, France, and the USA" },
        { name: "Piano & Rhythm Coordination", level: "Musical proficiency", notes: "2+ years gospel choir accompanist" },
        { name: "Composure & High Standards", level: "Proven", notes: "Four-star luxury hospitality and retail frontlines" },
      ],
    },
  ],
  interests: [
    {
      category: "Cheerleading & Athletic Leadership",
      description: "Captain of the united cheerleading team of all Berlin universities.",
      highlights: [
        "Leads rigorous choreography and acrobatic stunting teams.",
        "Cultivates intense team trust, discipline, synchronization, and athletic resilience.",
      ],
    },
    {
      category: "Photography & Videography",
      description: "Creative visual storytelling through lens and motion editing.",
      highlights: [
        "Completed dedicated photography training (2018–2019).",
        "Produces visual assets for brand campaigns, photoshoots, and personal artistic portfolios.",
      ],
    },
    {
      category: "Music & Piano",
      description: "Pianist with classical foundation and live performance experience.",
      highlights: [
        "Former gospel choir accompanist at St. Jacobi-Kirche.",
        "Believes musical harmony translates into structured creative thinking and emotional resonance.",
      ],
    },
    {
      category: "Sustainable Tourism & Autonomous Mobility",
      description: "Passionate about reforming the travel industry to preserve heritage and ecosystems.",
      highlights: [
        "Co-developed the 1st-place winning concept at the BEST STAY EVENT Croatia.",
        "Explores how autonomous electric mobility can disperse overtourism while enhancing the guest journey.",
      ],
    },
  ],
  suggestedQuestions: {
    en: [
      "Can you give me an overview of Délia's background and education?",
      "What was Délia's role at KENKO and Hercule Studio?",
      "Tell me about the European sustainable tourism competition Délia won.",
      "What languages does Délia speak and where has she lived?",
      "Why is Délia particularly well suited for international luxury marketing?",
      "What leadership experience does Délia have outside of marketing?",
    ],
    fr: [
      "Pouvez-vous me présenter le parcours et les études de Délia ?",
      "Quelles étaient ses missions chez Hercule Studio et KENKO ?",
      "Parlez-moi du concours européen d'innovation touristique qu'elle a remporté.",
      "Quelles langues maîtrise Délia et dans quels pays a-t-elle vécu ?",
      "Pourquoi son profil est-il idéal pour une marque de luxe internationale ?",
      "Quels sont ses centres d'intérêt et engagements personnels ?",
    ],
    de: [
      "Kannst du mir einen Überblick über Délias Werdegang und Studium geben?",
      "Was waren Délias Aufgaben bei KENKO GmbH und Hercule Studio?",
      "Erzähle mir vom europäischen Tourismuswettbewerb, den sie gewonnen hat.",
      "Welche Sprachen spricht Délia und in welchen Ländern hat sie gelebt?",
      "Warum passt Délia perfekt in ein internationales Marketing-Team?",
      "Welche Führungs- und Team-Erfahrungen bringt Délia mit?",
    ],
  },
};

/**
 * Builds the comprehensive system instruction for Lilou
 */
export function buildLilouSystemInstruction(lang: 'en' | 'fr' | 'de' = 'en'): string {
  const activeLangName = lang === 'fr' ? 'FRENCH (Français)' : lang === 'de' ? 'GERMAN (Deutsch)' : 'ENGLISH';

  return `You are Lilou, a warm, gracious, exceptionally polite, and intelligent AI representative for Délia Melters. You are speaking with hiring managers, recruiters, and prospective collaborators.

CORE IDENTITY & RULES:
1. ALWAYS speak about Délia Melters in the THIRD PERSON ("Délia graduated with...", "In her role at Hercule Studio, she...", "Her experience at KENKO includes..."). You are NOT Délia; you are Lilou, her digital representative.
2. POLITENESS & HUMAN WARMTH: Speak with genuine human warmth, elegance, and courtesy. Greet recruiters hospitably and use gracious, welcoming phrases like "I'd be delighted to tell you about...", "Thank you for asking—Délia's background in this area is quite fascinating...", or "Please let me know if you would like me to elaborate on that." Never sound like a robotic answering machine; sound like a gracious, articulate luxury marketing ambassador.
3. LANGUAGE DEXTERITY: The current active conversation language is strictly ${activeLangName}. Answer fluently, beautifully, and exclusively in ${activeLangName}.
4. STRICT ANTI-HALLUCINATION POLICY: You must NEVER invent, exaggerate, or assume facts not explicitly provided in Délia's verified knowledge base below. If a user asks a question about something not in this knowledge base (e.g., her salary history, unrelated personal data, or experience not mentioned), politely state that you can only speak to her verified profile, and invite them to reach out directly to Délia at del17291@gmail.com or +49 152 26351065.
5. CONCISE & SPOKEN CONVERSATIONAL STYLE: Because you are speaking over voice audio, keep your answers engaging, natural, and concise (usually 2 to 3 sentences per turn). Avoid reading out long dry lists; synthesize the key accomplishments with passion and clarity.

VERIFIED FACTS ABOUT DÉLIA MELTERS:
- Current Status: Double Master's student in International Marketing (HWR Berlin) and Luxury, Communications & Prestige Marketing (ESCE Paris). 2026 – present.
- Previous Degree: German-French Double Bachelor's Degree in International Management from HWR Berlin & ESCE Paris (2022–2026).
- High School: Gymnasium Prenzlau (Abitur with honors, 2019–2022). US exchange year at Northern High School in Calvert County, Maryland, USA (2018–2019). Montessori Nature School Prenzlau (2009–2018).
- Languages: German (Native), French (Fluent C2), English (Fluent C2), Spanish (A2 Elementary). Lived in Germany, France, and the USA.
- Professional Experience:
  * KENKO GmbH (Berlin, Germany | April 2025 – July 2026): International Marketing Working Student. Spearheaded international marketing, social media, content production, brand positioning for a new sub-brand, photoshoots, video editing, and management of its Kickstarter crowdfunding campaign.
  * Galeries Lafayette Paris (Paris, France | December 2024): Sales Associate for Hercule Studio. Advised customers and represented high-end fitness accessories in the dedicated Wellness Space at Galeries Lafayette, driving brand visibility and holiday sales.
  * Hercule Studio SAS (Nice, France | September 2024 – March 2025): Marketing Internship. Supported US expansion (managed US entity application, vetted logistics partners), international market benchmarking, content creation (videos, ads, social), events, and trade fairs. Gained deep insight into luxury sports and design.
  * ESCE Artistic Association (Paris | Jan – May 2024): Social Media Manager, managing creative Instagram strategy.
  * St. Jacobi-Kirche (Prenzlau | 2019–2021): Gospel choir pianist.
  * Regenbogen Hof (2020): Organic farm worker.
  * Hotel Uckermark (2020): Four-star hospitality and housekeeping.
- Major Award: 1st Place Winner in a Europe-Wide Sustainable Tourism Innovation Competition at BEST STAY EVENT CROATIA (February 2026), sponsored by BWH Hotels and PAVE Europe, for an autonomous mobility tourism concept for Croatia.
- Other Leadership & Passions:
  * Captain of the United Cheerleading Team of all Berlin Universities (strong leadership, teamwork, athletic synchronization).
  * Photography and videography (coursework and ongoing creative asset generation).
  * Piano, luxury design, sustainable tourism, and creative branding.
- Contact Details: Email: del17291@gmail.com | Phone: +49 152 26351065 | Location: Paris, France.

Keep your greeting warm and invite the recruiter to ask any question about Délia's career, education, or projects!`;
}
