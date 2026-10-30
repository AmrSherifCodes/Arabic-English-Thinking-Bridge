export interface ArabNation {
  nameEn: string;
  nameAr: string;
  region: 'Maghreb' | 'Nile Valley & Horn' | 'Levant' | 'Mesopotamia' | 'Arabian Peninsula';
  landmarkOrSymbol: string;
}

export interface PanArabUnityPhrase {
  id: string;
  ar: string;
  en: string;
  nationsHighlight: string;
}

export interface CulturalQuote {
  id: string;
  en: string;
  ar: string;
  theme: string;
}

/**
 * The 23 Arabic-speaking nations across the Pan-Arab world —
 * from the Atlantic shores of Morocco & Mauritania to the mountains of Yemen & Oman,
 * the Levant, the Nile, and the Indian Ocean islands.
 */
export const PAN_ARAB_NATIONS: ArabNation[] = [
  { nameEn: 'Palestine', nameAr: 'فلسطين', region: 'Levant', landmarkOrSymbol: 'Al-Quds & The Immortal Olive Tree' },
  { nameEn: 'Egypt', nameAr: 'مصر', region: 'Nile Valley & Horn', landmarkOrSymbol: 'Alexandria & The Eternal Nile' },
  { nameEn: 'Yemen', nameAr: 'اليمن', region: 'Arabian Peninsula', landmarkOrSymbol: 'Sana’a & Socotra' },
  { nameEn: 'Morocco', nameAr: 'المغرب', region: 'Maghreb', landmarkOrSymbol: 'Al-Qarawiyyin of Fez & The Atlas' },
  { nameEn: 'Algeria', nameAr: 'الجزائر', region: 'Maghreb', landmarkOrSymbol: 'Casbah of Algiers & Aurès' },
  { nameEn: 'Tunisia', nameAr: 'تونس', region: 'Maghreb', landmarkOrSymbol: 'Kairouan & Olive Groves of Sfax' },
  { nameEn: 'Libya', nameAr: 'ليبيا', region: 'Maghreb', landmarkOrSymbol: 'Tripoli & Green Mountain (Al-Jabal Al-Akhdar)' },
  { nameEn: 'Mauritania', nameAr: 'موريتانيا', region: 'Maghreb', landmarkOrSymbol: 'Chinguetti Libraries of the Sahara' },
  { nameEn: 'Sudan', nameAr: 'السودان', region: 'Nile Valley & Horn', landmarkOrSymbol: 'Confluence of the Two Niles in Khartoum' },
  { nameEn: 'Lebanon', nameAr: 'لبنان', region: 'Levant', landmarkOrSymbol: 'Cedars & Mediterranean Scriptoria' },
  { nameEn: 'Syria', nameAr: 'سوريا', region: 'Levant', landmarkOrSymbol: 'Damascus Jasmine & Aleppo Citadel' },
  { nameEn: 'Jordan', nameAr: 'الأردن', region: 'Levant', landmarkOrSymbol: 'Petra & Olive Hills of Ajloun' },
  { nameEn: 'Iraq', nameAr: 'العراق', region: 'Mesopotamia', landmarkOrSymbol: 'Baghdad House of Wisdom (بيت الحكمة)' },
  { nameEn: 'Saudi Arabia', nameAr: 'السعودية', region: 'Arabian Peninsula', landmarkOrSymbol: 'Al-Ula & Classical Poetic Heritage' },
  { nameEn: 'Oman', nameAr: 'عُمان', region: 'Arabian Peninsula', landmarkOrSymbol: 'Nizwa & Maritime Navigators' },
  { nameEn: 'Kuwait', nameAr: 'الكويت', region: 'Arabian Peninsula', landmarkOrSymbol: 'Al-Arabi Cultural Journals & Dhow Harbors' },
  { nameEn: 'United Arab Emirates', nameAr: 'الإمارات', region: 'Arabian Peninsula', landmarkOrSymbol: 'Sharjah House of Poetry & Gulf Pearls' },
  { nameEn: 'Qatar', nameAr: 'قطر', region: 'Arabian Peninsula', landmarkOrSymbol: 'Qatar National Library & Doha Bay' },
  { nameEn: 'Bahrain', nameAr: 'البحرين', region: 'Arabian Peninsula', landmarkOrSymbol: 'Dilmun Springs & Two Seas' },
  { nameEn: 'Somalia', nameAr: 'الصومال', region: 'Nile Valley & Horn', landmarkOrSymbol: 'Mogadishu Coast & Horn of Africa' },
  { nameEn: 'Djibouti', nameAr: 'جيبوتي', region: 'Nile Valley & Horn', landmarkOrSymbol: 'Bab el-Mandeb Gateway' },
  { nameEn: 'Comoros', nameAr: 'جزر القمر', region: 'Nile Valley & Horn', landmarkOrSymbol: 'Moroni & Indian Ocean Archipelagos' },
  { nameEn: 'Chad', nameAr: 'تشاد', region: 'Nile Valley & Horn', landmarkOrSymbol: 'Lake Chad & Sahelian Arabic Scholarship' }
];

export const PAN_ARAB_UNITY_PHRASES: PanArabUnityPhrase[] = [
  {
    id: 'yemen-to-morocco',
    ar: 'من اليمن إلى المغرب · لسانٌ واحد و٢٣ وطناً يجمعنا',
    en: 'From Yemen to Morocco · 23 Nations, One Shared Tongue & Living Heritage',
    nationsHighlight: 'اليمن · فلسطين · مصر · الشام · الرافدين · الخليج · المغرب الكبير'
  },
  {
    id: 'ocean-to-gulf',
    ar: 'من المحيط إلى الخليج · جذورنا راسخة كشجرة الزيتون',
    en: 'From the Atlantic to the Gulf · Rooted Like the Olive Tree Across 23 Homelands',
    nationsHighlight: 'فلسطين · المغرب · الجزائر · تونس · مصر · السودان · العراق · اليمن'
  },
  {
    id: 'fez-to-baghdad',
    ar: 'من القرويين في فاس إلى بيت الحكمة في بغداد · فكرٌ يبني الجسور',
    en: 'From Fez & Alexandria to Jerusalem, Damascus & Baghdad · A Legacy of Thought',
    nationsHighlight: 'المغرب · مصر · فلسطين · سوريا · لبنان · الأردن · العراق'
  },
  {
    id: 'sumud-and-wisdom',
    ar: 'من جبال الأطلس إلى ربى القدس وصنعاء · صمودٌ ومعرفة لا تنضب',
    en: 'From the Atlas Mountains to the Hills of Al-Quds & Sana’a · Steadfastness & Knowledge',
    nationsHighlight: '٢٣ بلداً ناطقاً بالعربية · من شنقيط إلى مسقط'
  }
];

export const CULTURAL_QUOTES: CulturalQuote[] = [
  {
    id: 'olive-tree-mind',
    en: 'Your mind is like the olive tree—deeply rooted in your heritage, resilient in the face of hardship, and always bearing fruit.',
    ar: 'عقلك كشجرة الزيتون؛ ضاربٌ بجذوره في عمق هويتك، صامدٌ في وجه الصعاب، ومثمرٌ في كلّ حين.',
    theme: 'Steadfastness (صمود) & Growth'
  },
  {
    id: 'atlas-to-peninsula',
    en: 'From the Atlas Mountains to the Arabian Peninsula, we share a tongue that has carried poetry, science, and unwavering hope for centuries.',
    ar: 'من جبال الأطلس إلى الجزيرة العربية، يجمعنا لسانٌ حمل الشعر والعلم والأمل الراسخ عبر القرون.',
    theme: 'Pan-Arab Unity · 23 Nations'
  },
  {
    id: 'olive-branch-new-soil',
    en: "Learning a new language isn't about leaving your identity behind; it's about planting your olive branch in new soil.",
    ar: 'تعلّم لغةٍ جديدة لا يعني التخلّي عن هويتك، بل هو غرسٌ لغصن زيتونك في أرضٍ جديدة.',
    theme: 'Identity & Language Transfer'
  },
  {
    id: 'steadfast-heart',
    en: 'Behind every great civilization is a steadfast heart. Keep building your English foundation, rooted in your own rich history.',
    ar: 'وراء كلّ حضارةٍ عظيمة قلبٌ صامد. واصل بناء أساسك اللغوي وأنت متجذّر في تاريخك العريق.',
    theme: 'Heritage & Resilience'
  }
];

export function getNextCulturalQuote(currentIndex: number): {
  quote: CulturalQuote;
  nextIndex: number;
} {
  const safeIdx = ((currentIndex % CULTURAL_QUOTES.length) + CULTURAL_QUOTES.length) % CULTURAL_QUOTES.length;
  const quote = CULTURAL_QUOTES[safeIdx];
  const nextIndex = (safeIdx + 1) % CULTURAL_QUOTES.length;
  return { quote, nextIndex };
}

export function getNextUnityPhraseIndex(currentIndex: number): number {
  if (PAN_ARAB_UNITY_PHRASES.length === 0) return 0;
  return (Math.max(0, currentIndex) + 1) % PAN_ARAB_UNITY_PHRASES.length;
}
