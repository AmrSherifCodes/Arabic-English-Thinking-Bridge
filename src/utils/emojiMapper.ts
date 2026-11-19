export interface SceneTheme {
  primaryBg: string;
  secondaryBg: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  glowColor: string;
}

export interface SceneContext {
  mainEmoji: string;
  leftEmoji: string;
  rightEmoji: string;
  categoryTitleAr: string;
  categoryTitleEn: string;
  grammarTag: string;
  theme: SceneTheme;
}

export function getEmojiForWord(word: string, fallback: string): string {
  if (!word) return fallback;

  const text = word.toLowerCase();

  const mappings: Record<string, string[]> = {
    '🧑‍🚒': ['firefighter', 'fire fighter', 'fireman', 'fire', 'firetruck', 'extinguisher', 'إطفاء', 'مطافئ', 'حريق'],
    '👨‍⚕️': ['doctor', 'nurse', 'hospital', 'physician', 'patient', 'sick', 'medicine', 'clinic', 'طبيب', 'مستشفى', 'ممرض', 'دواء', 'مرض'],
    '👨‍💼': ['architect', 'engineer', 'blueprint', 'building', 'structure', 'construction', 'مهندس', 'معماري', 'بناء', 'مبنى'],
    '🧑‍💻': ['developer', 'coder', 'programmer', 'hacker', 'software', 'computer', 'code', 'ai', 'مبرمج', 'حاسوب', 'برمجيات'],
    '👨‍✈️': ['pilot', 'airplane', 'plane', 'flight', 'airport', 'fly', 'travel', 'طيار', 'طائرة', 'سفر', 'مطار'],
    '👨‍🍳': ['chef', 'cook', 'cooking', 'coffee', 'restaurant', 'food', 'meal', 'burger', 'طباخ', 'مطعم', 'قهوة', 'طعام'],
    '👮': ['police', 'cop', 'officer', 'security', 'law', 'lawyer', 'jail', 'شرطة', 'ضابط', 'قانون'],
    '👨‍🏫': ['teacher', 'student', 'school', 'university', 'study', 'class', 'learn', 'معلم', 'طالب', 'مدرسة', 'جامعة'],
    '🏃': ['run', 'running', 'jog', 'sports', 'athlete', 'football', 'soccer', 'gym', 'رياضة', 'كرة', 'جري'],
    '🎨': ['art', 'paint', 'artist', 'music', 'song', 'sing', 'movie', 'cinema', 'موسيقى', 'فنان', 'رسم', 'سينما'],
    '💼': ['work', 'job', 'office', 'business', 'manager', 'company', 'money', 'interview', 'مدير', 'شركة', 'مال', 'مقابلة'],
    '🔬': ['scientist', 'chemistry', 'chemical', 'lab', 'experiment', 'science', 'nature', 'عالم', 'كيمياء', 'مختبر', 'تجربة'],
    '👨‍🚀': ['astronaut', 'space', 'rocket', 'planet', 'star', 'galaxy', 'فضاء', 'صاروخ', 'كوكب'],
    '🌦️': ['weather', 'rain', 'storm', 'snow', 'cold', 'hot', 'sun', 'sunny', 'wind', 'طقس', 'مطر', 'ثلج', 'شمس'],
    '🏠': ['house', 'home', 'apartment', 'بيت', 'منزل'],
    '🚗': ['car', 'auto', 'vehicle', 'drive', 'driving', 'سيارة'],
    '📖': ['book', 'read', 'reading', 'story', 'كتاب', 'قصة'],
    '❤️': ['love', 'like', 'heart', 'care', 'حب'],
    '😊': ['happy', 'smile', 'glad', 'joy', 'سعيد'],
    '🐶': ['dog', 'puppy', 'pet', 'كلب'],
    '🐱': ['cat', 'kitten', 'قطة'],
    '☕': ['coffee', 'tea', 'cafe', 'شاي'],
    '📱': ['phone', 'mobile', 'call', 'app', 'هاتف']
  };

  for (const [emoji, keywords] of Object.entries(mappings)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(text) || text.includes(keyword)) {
        return emoji;
      }
    }
  }

  return fallback;
}

export function getSceneContextForExercise(
  englishTarget: string = '',
  promptAr: string = '',
  stage: string = 'A1',
  levelNumber: number = 1
): SceneContext {
  const combined = (englishTarget + ' ' + promptAr).toLowerCase();

  // Detect grammar pattern
  let grammarTag = 'Cognitive Structure';
  if (/^he is|^she is|^it is|^i am|^we are|^they are|^you are/i.test(englishTarget)) {
    grammarTag = 'Subject ➔ Copula (is/am/are) ➔ Noun/Adj';
  } else if (/do you|does he|does she|did you/i.test(englishTarget)) {
    grammarTag = 'Auxiliary (Do/Does) ➔ Subject ➔ Verb';
  } else if (/can|could|would|should|must/i.test(englishTarget)) {
    grammarTag = 'Modal Verb ➔ Action';
  } else if (/if i|if it|if you/i.test(englishTarget)) {
    grammarTag = 'Conditional Clause (If ➔ Result)';
  } else if (/turn off|run out|give up|look forward/i.test(englishTarget)) {
    grammarTag = 'Phrasal Verb Construction';
  } else if (/piece of cake|break a leg|break the ice/i.test(englishTarget)) {
    grammarTag = 'Native Idiom';
  }

  if (/firefighter|fire fighter|firetruck|fire|extinguisher|إطفاء|مطافئ|حريق/i.test(combined)) {
    return {
      mainEmoji: '🧑‍🚒',
      leftEmoji: '🚒',
      rightEmoji: '🧯',
      categoryTitleAr: 'فرق الإطفاء والطوارئ',
      categoryTitleEn: 'Fire & Emergency Services',
      grammarTag,
      theme: {
        primaryBg: '#1D0606',
        secondaryBg: '#450A0A',
        accentColor: '#EF4444',
        badgeBg: 'rgba(239, 68, 68, 0.2)',
        badgeText: '#FCA5A5',
        glowColor: 'rgba(239, 68, 68, 0.4)',
      },
    };
  }

  if (/doctor|nurse|hospital|physician|patient|sick|medicine|clinic|طبيب|مستشفى|ممرض|دواء|مرض|صحة/i.test(combined)) {
    return {
      mainEmoji: '👨‍⚕️',
      leftEmoji: '🏥',
      rightEmoji: '🩺',
      categoryTitleAr: 'القطاع الطبي والرعاية الصحية',
      categoryTitleEn: 'Medical & Healthcare',
      grammarTag,
      theme: {
        primaryBg: '#022C22',
        secondaryBg: '#064E3B',
        accentColor: '#10B981',
        badgeBg: 'rgba(16, 185, 129, 0.2)',
        badgeText: '#6EE7B7',
        glowColor: 'rgba(16, 185, 129, 0.4)',
      },
    };
  }

  if (/architect|engineer|blueprint|building|structure|construction|مهندس|معماري|بناء|مبنى|تصميم/i.test(combined)) {
    return {
      mainEmoji: '👨‍💼',
      leftEmoji: '🏗️',
      rightEmoji: '📐',
      categoryTitleAr: 'الهندسة والتصميم المعماري',
      categoryTitleEn: 'Engineering & Architecture',
      grammarTag,
      theme: {
        primaryBg: '#0F172A',
        secondaryBg: '#1E293B',
        accentColor: '#38BDF8',
        badgeBg: 'rgba(56, 189, 248, 0.2)',
        badgeText: '#7DD3FC',
        glowColor: 'rgba(56, 189, 248, 0.4)',
      },
    };
  }

  if (/programmer|developer|software|computer|laptop|code|coding|ai|algorithm|hacker|برمجيات|حاسوب|مبرمج|تقنية|كود/i.test(combined)) {
    return {
      mainEmoji: '🧑‍💻',
      leftEmoji: '💻',
      rightEmoji: '⚡',
      categoryTitleAr: 'البرمجيات والذكاء الاصطناعي',
      categoryTitleEn: 'Software & AI Development',
      grammarTag,
      theme: {
        primaryBg: '#052E16',
        secondaryBg: '#14532D',
        accentColor: '#22C55E',
        badgeBg: 'rgba(34, 197, 94, 0.2)',
        badgeText: '#86EFAC',
        glowColor: 'rgba(34, 197, 94, 0.4)',
      },
    };
  }

  if (/pilot|airplane|plane|flight|airport|fly|travel|trip|طيار|طائرة|سفر|مطار|رحلة/i.test(combined)) {
    return {
      mainEmoji: '👨‍✈️',
      leftEmoji: '✈️',
      rightEmoji: '🌤️',
      categoryTitleAr: 'الطيران والملاحة الجوية',
      categoryTitleEn: 'Aviation & Travel',
      grammarTag,
      theme: {
        primaryBg: '#0C4A6E',
        secondaryBg: '#0369A1',
        accentColor: '#38BDF8',
        badgeBg: 'rgba(56, 189, 248, 0.2)',
        badgeText: '#BAE6FD',
        glowColor: 'rgba(56, 189, 248, 0.4)',
      },
    };
  }

  if (/chef|cook|cooking|coffee|tea|restaurant|food|meal|burger|dinner|lunch|طباخ|مطعم|قهوة|طعام|وجبة/i.test(combined)) {
    return {
      mainEmoji: '👨‍🍳',
      leftEmoji: '☕',
      rightEmoji: '🍕',
      categoryTitleAr: 'الطهي والمأكولات',
      categoryTitleEn: 'Culinary & Dining',
      grammarTag,
      theme: {
        primaryBg: '#2A1205',
        secondaryBg: '#451A03',
        accentColor: '#F59E0B',
        badgeBg: 'rgba(245, 158, 11, 0.2)',
        badgeText: '#FDE68A',
        glowColor: 'rgba(245, 158, 11, 0.4)',
      },
    };
  }

  if (/teacher|student|school|university|class|study|exam|book|learn|معلم|مدرس|طالب|مدرسة|جامعة|دراسة|كتاب/i.test(combined)) {
    return {
      mainEmoji: '👨‍🏫',
      leftEmoji: '🏫',
      rightEmoji: '📚',
      categoryTitleAr: 'التعليم والأكاديميا',
      categoryTitleEn: 'Education & Academics',
      grammarTag,
      theme: {
        primaryBg: '#1E1B4B',
        secondaryBg: '#312E81',
        accentColor: '#818CF8',
        badgeBg: 'rgba(129, 140, 248, 0.2)',
        badgeText: '#C7D2FE',
        glowColor: 'rgba(129, 140, 248, 0.4)',
      },
    };
  }

  if (/police|officer|cop|security|law|lawyer|jail|شرطة|ضابط|قانون|محامي|أمن/i.test(combined)) {
    return {
      mainEmoji: '👮',
      leftEmoji: '🚓',
      rightEmoji: '🛡️',
      categoryTitleAr: 'الأمن والقانون',
      categoryTitleEn: 'Security & Law',
      grammarTag,
      theme: {
        primaryBg: '#172554',
        secondaryBg: '#1E3A8A',
        accentColor: '#60A5FA',
        badgeBg: 'rgba(96, 165, 250, 0.2)',
        badgeText: '#BFDBFE',
        glowColor: 'rgba(96, 165, 250, 0.4)',
      },
    };
  }

  if (/sports|athlete|football|soccer|gym|run|workout|match|ball|رياضي|كرة|رياضة|جيم|جري|تمرين/i.test(combined)) {
    return {
      mainEmoji: '🏃',
      leftEmoji: '⚽',
      rightEmoji: '🏆',
      categoryTitleAr: 'الرياضة واللياقة البدنية',
      categoryTitleEn: 'Sports & Fitness',
      grammarTag,
      theme: {
        primaryBg: '#14532D',
        secondaryBg: '#15803D',
        accentColor: '#4ADE80',
        badgeBg: 'rgba(74, 222, 128, 0.2)',
        badgeText: '#BBF7D0',
        glowColor: 'rgba(74, 222, 128, 0.4)',
      },
    };
  }

  if (/music|song|sing|artist|art|paint|movie|cinema|موسيقى|أغنية|فنان|رسم|سينما|فيلم/i.test(combined)) {
    return {
      mainEmoji: '🎨',
      leftEmoji: '🎵',
      rightEmoji: '🎬',
      categoryTitleAr: 'الفنون والإعلام',
      categoryTitleEn: 'Arts & Media',
      grammarTag,
      theme: {
        primaryBg: '#3B0764',
        secondaryBg: '#581C87',
        accentColor: '#C084FC',
        badgeBg: 'rgba(192, 132, 252, 0.2)',
        badgeText: '#E9D5FF',
        glowColor: 'rgba(192, 132, 252, 0.4)',
      },
    };
  }

  if (/business|manager|office|company|money|cash|interview|deal|report|مدير|شركة|مال|مقابلة|مكتب|تقرير|صفقة/i.test(combined)) {
    return {
      mainEmoji: '💼',
      leftEmoji: '💰',
      rightEmoji: '📊',
      categoryTitleAr: 'إدارة الأعمال والمالية',
      categoryTitleEn: 'Business & Finance',
      grammarTag,
      theme: {
        primaryBg: '#064E3B',
        secondaryBg: '#047857',
        accentColor: '#34D399',
        badgeBg: 'rgba(52, 211, 153, 0.2)',
        badgeText: '#A7F3D0',
        glowColor: 'rgba(52, 211, 153, 0.4)',
      },
    };
  }

  if (/weather|rain|storm|snow|cold|hot|sun|sunny|wind|طقس|مطر|عاصفة|ثلج|شمس|حرارة/i.test(combined)) {
    return {
      mainEmoji: '🌦️',
      leftEmoji: '⚡',
      rightEmoji: '❄️',
      categoryTitleAr: 'الظواهر الجوية والطقس',
      categoryTitleEn: 'Weather & Climate',
      grammarTag,
      theme: {
        primaryBg: '#0F172A',
        secondaryBg: '#334155',
        accentColor: '#FACC15',
        badgeBg: 'rgba(250, 204, 21, 0.2)',
        badgeText: '#FEF08A',
        glowColor: 'rgba(250, 204, 21, 0.4)',
      },
    };
  }

  if (/space|rocket|planet|star|galaxy|astronaut|فضاء|صاروخ|كوكب|نجم/i.test(combined)) {
    return {
      mainEmoji: '👨‍🚀',
      leftEmoji: '🚀',
      rightEmoji: '🪐',
      categoryTitleAr: 'استكشاف الفضاء والعلوم',
      categoryTitleEn: 'Space Exploration',
      grammarTag,
      theme: {
        primaryBg: '#090D16',
        secondaryBg: '#1E1B4B',
        accentColor: '#A855F7',
        badgeBg: 'rgba(168, 85, 247, 0.2)',
        badgeText: '#E9D5FF',
        glowColor: 'rgba(168, 85, 247, 0.4)',
      },
    };
  }

  const levelTitleAr = stage.includes('A0')
    ? 'جسر الكلمات وفعل الربط'
    : stage.includes('A1')
    ? 'التواصل اليومي المباشر'
    : stage.includes('A2')
    ? 'السرد والقصص التراكمية'
    : stage.includes('B1')
    ? 'المرونة اللغوية والحوار'
    : stage.includes('B2')
    ? 'التحليل والدقة الأكاديمية'
    : 'الطلاقة الفائقة C1';

  return {
    mainEmoji: '🧠',
    leftEmoji: '🌉',
    rightEmoji: '⚡',
    categoryTitleAr: levelTitleAr,
    categoryTitleEn: `CEFR Level ${stage} Structure`,
    grammarTag,
    theme: {
      primaryBg: '#0A0E13',
      secondaryBg: '#0B3D5C',
      accentColor: '#C9A227',
      badgeBg: 'rgba(201, 162, 39, 0.2)',
      badgeText: '#FDE68A',
      glowColor: 'rgba(201, 162, 39, 0.4)',
    },
  };
}
