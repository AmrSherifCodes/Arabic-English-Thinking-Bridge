export interface ProgressionLevel {
  id: number;
  titleAr: string;
  subtitleEn: string;
  cefr: string;
  description: string;
}

export const PROGRESSION_LEVELS: ProgressionLevel[] = [
  {
    id: 1,
    titleAr: '١. مصنع الاسم وأصوات الحروف',
    subtitleEn: 'Spell Your Name & First Sounds',
    cefr: 'Pre-A0',
    description: 'Interactive Arabic-to-English Name Forge + P/B, V/F, TH, SH, CH, and vowel sounds.'
  },
  {
    id: 2,
    titleAr: '٢. إنجليزي في شوارع مصر',
    subtitleEn: 'Street English You Already Know',
    cefr: 'A0',
    description: 'Turning 35+ everyday Egyptian loanwords into full sentences.'
  },
  {
    id: 3,
    titleAr: '٣. سر الرابط الخفي (am / is / are)',
    subtitleEn: 'The Invisible Bridge',
    cefr: 'A1',
    description: 'Solving Arabic nominal sentences (أنا جاهز → I am ready).'
  },
  {
    id: 4,
    titleAr: '٤. حركة الحياة (I do vs I am doing)',
    subtitleEn: 'Actions Now vs. Every Day',
    cefr: 'A1+',
    description: 'Habits vs. live actions and natural negation (don\'t / doesn\'t).'
  },
  {
    id: 5,
    titleAr: '٥. احكي حكايتك واسأل بذكاء',
    subtitleEn: 'Past Stories & Smart Questions',
    cefr: 'A2',
    description: 'Past tense storytelling and preposition bridges.'
  },
  {
    id: 6,
    titleAr: '٦. جسر الزمن (I ate vs I have eaten)',
    subtitleEn: 'Connecting Past to Present',
    cefr: 'B1',
    description: 'Finished past time vs. present result using visual timeline thinking.'
  },
  {
    id: 7,
    titleAr: '٧. هندسة الأفكار والروابط القوية',
    subtitleEn: 'Connecting Complex Ideas',
    cefr: 'B1+',
    description: 'Linking clauses smoothly with although, however, despite, because of, and which/who.'
  },
  {
    id: 8,
    titleAr: '٨. التفكير الشرطي والمناقشة العلمية',
    subtitleEn: 'What-If Scenarios & Debate',
    cefr: 'B2',
    description: 'Hypothetical thinking, technical/scientific reading, and structured persuasion.'
  },
  {
    id: 9,
    titleAr: '٩. طلاقة المحترفين والعلماء (C1)',
    subtitleEn: 'Advanced C1 Operational Fluency',
    cefr: 'C1',
    description: 'High-precision register, academic/research synthesis, and zero-translation spontaneous speech.'
  },
  {
    id: 10,
    titleAr: '١٠. قمة الإتقان: حكيم جسر التفكير',
    subtitleEn: 'C1+ Greatness - The Bridge Master',
    cefr: 'C1+',
    description: 'Real-world bilingual mastery gauntlet across science, leadership, and global communication.'
  }
];
