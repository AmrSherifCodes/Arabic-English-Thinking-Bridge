import { Lesson, Phase, SourceLanguage } from '../../types';

function sourceThought(source: SourceLanguage, ar: string, en: string): string {
  if (source === 'ar' || source === 'arz' || source === 'apc' || source === 'afb' || source === 'ary') return ar;
  return en;
}

export function getGermanPhases(source: SourceLanguage): Phase[] {
  const isAr = source === 'ar';

  const phase1Lessons: Lesson[] = [];
  for (let i = 1; i <= 7; i++) {
    const target1 = i === 1 ? 'Heute trinke ich Kaffee' : 'Ich lerne Deutsch';
    const target2 = i === 1 ? 'Ich brauche einen Kaffee' : 'Das ist ein schönes Haus';
    const target3 = i === 1 ? 'Ich rufe dich morgen an' : 'Ich sehe den Mann';
    const target4 = 'Wir lieben Deutschland';

    phase1Lessons.push({
      id: `de-p1-l${i}`,
      phaseId: 1,
      phaseTitle: 'Phase 1: Der Satzbau & Die V2-Regel',
      phaseLevel: 'A1',
      number: i,
      title: `Lesson ${i}: V2 Rule & Word Order ${i}`,
      titleAr: `الدرس ${i}: قاعدة الفعل الثاني V2`,
      transferConcept: 'Master the strict V2 verb position in German main clauses.',
      transferConceptAr: 'إتقان مكان الفعل الثاني الصارم V2 في الجملة الألمانية.',
      weakSpotTag: 'german-v2-rule',
      exercises: [
        {
          id: `de-ex-1-${i}-1`,
          arabicThought: i === 1 ? 'أنا أبدأ بتناول القهوة اليوم' : `أنا أتعلم الألمانية ${i}`,
          englishTarget: target1,
          sourceThought: sourceThought(source, i === 1 ? 'أنا أبدأ بتناول القهوة اليوم' : `أنا أتعلم الألمانية ${i}`, i === 1 ? 'Today I am drinking coffee' : `I learn German ${i}`),
          targetSentence: target1,
          acceptableAlternatives: [target1.toLowerCase()],
          wordChips: Array.from(new Set([...target1.split(/\s+/), 'und', 'du', 'Wasser', 'Bier', 'heute'])),
          breakdownChunks: [
            { arabicText: 'Heute', englishText: 'today', sourceText: 'اليوم', targetText: 'Heute', role: 'connector', explanation: 'Adverb' },
            { arabicText: 'trinke', englishText: 'drink', sourceText: 'أشرب', targetText: 'trinke', role: 'verb', explanation: 'Verb V2' }
          ],
          habitHint: 'قاعدة V2.'
        },
        {
          id: `de-ex-1-${i}-2`,
          arabicThought: i === 1 ? 'أنا أحتاج إلى قهوة' : `هذا منزل جميل ${i}`,
          englishTarget: target2,
          sourceThought: sourceThought(source, i === 1 ? 'أنا أحتاج إلى قهوة' : `هذا منزل جميل ${i}`, i === 1 ? 'I need a coffee' : `This is a nice house ${i}`),
          targetSentence: target2,
          acceptableAlternatives: [target2.toLowerCase()],
          wordChips: Array.from(new Set([...target2.split(/\s+/), 'Wasser', 'Tee', 'Haus', 'schön'])),
          breakdownChunks: [
            { arabicText: 'Ich', englishText: 'I', sourceText: 'أنا', targetText: 'Ich', role: 'subject', explanation: 'Subject' }
          ],
          habitHint: 'النصب.'
        },
        {
          id: `de-ex-1-${i}-3`,
          arabicThought: i === 1 ? 'سأتصل بك غداً' : `أنا أرى الرجل ${i}`,
          englishTarget: target3,
          sourceThought: sourceThought(source, i === 1 ? 'سأتصل بك غداً' : `أنا أرى الرجل ${i}`, i === 1 ? 'I will call you tomorrow' : `I see the man ${i}`),
          targetSentence: target3,
          acceptableAlternatives: [target3.toLowerCase()],
          wordChips: Array.from(new Set([...target3.split(/\s+/), 'heute', 'wir', 'Mann', 'Frau'])),
          breakdownChunks: [
            { arabicText: 'Ich', englishText: 'I', sourceText: 'أنا', targetText: 'Ich', role: 'subject', explanation: 'Subject' }
          ],
          habitHint: 'أفعال منفصلة.'
        },
        {
          id: `de-ex-1-${i}-4`,
          arabicThought: `تدريب إضافي ${i}`,
          englishTarget: target4,
          sourceThought: sourceThought(source, `تدريب إضافي ${i}`, `Practice ${i}`),
          targetSentence: target4,
          acceptableAlternatives: [target4.toLowerCase()],
          wordChips: Array.from(new Set([...target4.split(/\s+/), 'Berlin', 'Hamburg', 'Land'])),
          breakdownChunks: [
            { arabicText: 'Wir lieben', englishText: 'we love', sourceText: 'نحن نحب', targetText: 'Wir lieben', role: 'verb', explanation: 'Verb' }
          ],
          habitHint: 'تدريب.'
        }
      ]
    });
  }

  const phase2Lessons: Lesson[] = [];
  for (let i = 8; i <= 14; i++) {
    const target1 = 'Ich sehe den Mann';
    const target2 = 'Ich kaufe einen Apfel';
    const target3 = 'Er liest ein Buch';
    const target4 = 'Wir lieben Deutschland';

    phase2Lessons.push({
      id: `de-p2-l${i}`,
      phaseId: 2,
      phaseTitle: 'Phase 2: Die Fälle (Akkusativ & Dativ)',
      phaseLevel: 'A2',
      number: i,
      title: `Lesson ${i}: Accusative & Cases ${i}`,
      titleAr: `الدرس ${i}: حالات الإعراب والنصب والجر`,
      transferConcept: 'Master noun cases and article changes in German.',
      transferConceptAr: 'إتقان الحالات الإعرابية وتغير أدوات التعريف.',
      weakSpotTag: 'german-accusative',
      exercises: [
        {
          id: `de-ex-2-${i}-1`,
          arabicThought: `أنا أرى الرجل ${i}`,
          englishTarget: target1,
          sourceThought: sourceThought(source, `أنا أرى الرجل ${i}`, `I see the man ${i}`),
          targetSentence: target1,
          acceptableAlternatives: [target1.toLowerCase()],
          wordChips: Array.from(new Set([...target1.split(/\s+/), 'Frau', 'Kind', 'der'])),
          breakdownChunks: [
            { arabicText: 'den Mann', englishText: 'the man', sourceText: 'الرجل', targetText: 'den Mann', role: 'object', explanation: 'Accusative' }
          ],
          habitHint: 'النصب den.'
        },
        {
          id: `de-ex-2-${i}-2`,
          arabicThought: `أنا أشتري تفاحة ${i}`,
          englishTarget: target2,
          sourceThought: sourceThought(source, `أنا أشتري تفاحة ${i}`, `I buy an apple ${i}`),
          targetSentence: target2,
          acceptableAlternatives: [target2.toLowerCase()],
          wordChips: Array.from(new Set([...target2.split(/\s+/), 'Banane', 'Wasser'])),
          breakdownChunks: [
            { arabicText: 'einen Apfel', englishText: 'an apple', sourceText: 'تفاحة', targetText: 'einen Apfel', role: 'object', explanation: 'Accusative' }
          ],
          habitHint: 'النصب einen.'
        },
        {
          id: `de-ex-2-${i}-3`,
          arabicThought: `هو يقرأ كتاباً ${i}`,
          englishTarget: target3,
          sourceThought: sourceThought(source, `هو يقرأ كتاباً ${i}`, `He reads a book ${i}`),
          targetSentence: target3,
          acceptableAlternatives: [target3.toLowerCase()],
          wordChips: Array.from(new Set([...target3.split(/\s+/), 'Zeitung', 'Brief'])),
          breakdownChunks: [
            { arabicText: 'Er liest', englishText: 'he reads', sourceText: 'هو يقرأ', targetText: 'Er liest', role: 'verb', explanation: 'Verb' }
          ],
          habitHint: 'فعل lesen.'
        },
        {
          id: `de-ex-2-${i}-4`,
          arabicThought: `نحن نحب ألمانيا ${i}`,
          englishTarget: target4,
          sourceThought: sourceThought(source, `نحن نحب ألمانيا ${i}`, `We love Germany ${i}`),
          targetSentence: target4,
          acceptableAlternatives: [target4.toLowerCase()],
          wordChips: Array.from(new Set([...target4.split(/\s+/), 'Europa', 'Welt'])),
          breakdownChunks: [
            { arabicText: 'Wir lieben', englishText: 'we love', sourceText: 'نحن نحب', targetText: 'Wir lieben', role: 'verb', explanation: 'Verb' }
          ],
          habitHint: 'فعل الحب.'
        }
      ]
    });
  }

  const phase3Lessons: Lesson[] = [];
  for (let i = 15; i <= 21; i++) {
    const target1 = 'Ich bin nach Berlin gereist';
    const target2 = 'Ich habe einen Apfel gegessen';
    const target3 = 'Weil ich Deutsch lerne';
    const target4 = 'Ich weiß, dass du verstehst';

    phase3Lessons.push({
      id: `de-p3-l${i}`,
      phaseId: 3,
      phaseTitle: 'Phase 3: Perfekt & Nebensätze',
      phaseLevel: 'B1',
      number: i,
      title: `Lesson ${i}: Past & Complex Sentences ${i}`,
      titleAr: `الدرس ${i}: الماضي والجمل المركبة`,
      transferConcept: 'Master Perfekt tense and subordinate clauses.',
      transferConceptAr: 'إتقان الماضي المركب والجمل الفرعية.',
      weakSpotTag: 'german-perfekt',
      exercises: [
        {
          id: `de-ex-3-${i}-1`,
          arabicThought: `لقد سافرت إلى برلين ${i}`,
          englishTarget: target1,
          sourceThought: sourceThought(source, `لقد سافرت إلى برلين ${i}`, `I traveled to Berlin ${i}`),
          targetSentence: target1,
          acceptableAlternatives: [target1.toLowerCase()],
          wordChips: Array.from(new Set([...target1.split(/\s+/), 'Hamburg', 'Wien'])),
          breakdownChunks: [
            { arabicText: 'Ich bin ... gereist', englishText: 'traveled', sourceText: 'سافرتُ', targetText: 'Ich bin ... gereist', role: 'verb', explanation: 'Perfekt' }
          ],
          habitHint: 'الماضي المركب.'
        },
        {
          id: `de-ex-3-${i}-2`,
          arabicThought: `أنا أكل تفاحة ${i}`,
          englishTarget: target2,
          sourceThought: sourceThought(source, `أنا أكل تفاحة ${i}`, `I have eaten an apple ${i}`),
          targetSentence: target2,
          acceptableAlternatives: [target2.toLowerCase()],
          wordChips: Array.from(new Set([...target2.split(/\s+/), 'gemacht', 'gekauft'])),
          breakdownChunks: [
            { arabicText: 'Ich habe ... gegessen', englishText: 'have eaten', sourceText: 'أكلتُ', targetText: 'Ich habe ... gegessen', role: 'verb', explanation: 'Perfekt' }
          ],
          habitHint: 'الماضي مع haben.'
        },
        {
          id: `de-ex-3-${i}-3`,
          arabicThought: `لأنني أتعلم الألمانية ${i}`,
          englishTarget: target3,
          sourceThought: sourceThought(source, `لأنني أتعلم الألمانية ${i}`, `Because I learn German ${i}`),
          targetSentence: target3,
          acceptableAlternatives: [target3.toLowerCase()],
          wordChips: Array.from(new Set([...target3.split(/\s+/), 'dass', 'obwohl'])),
          breakdownChunks: [
            { arabicText: 'Weil', englishText: 'because', sourceText: 'لأن', targetText: 'Weil', role: 'connector', explanation: 'Conjunction' }
          ],
          habitHint: 'weil الجملة الفرعية.'
        },
        {
          id: `de-ex-3-${i}-4`,
          arabicThought: `أنا أعلم أنك تفهم ${i}`,
          englishTarget: target4,
          sourceThought: sourceThought(source, `أنا أعلم أنك تفهم ${i}`, `I know that you understand ${i}`),
          targetSentence: target4,
          acceptableAlternatives: [target4.toLowerCase(), 'ich weiss, dass du verstehst'],
          wordChips: Array.from(new Set([...target4.split(/\s+/), 'glaube', 'denke'])),
          breakdownChunks: [
            { arabicText: 'Ich weiß', englishText: 'I know', sourceText: 'أعلم', targetText: 'Ich weiß', role: 'verb', explanation: 'Main' }
          ],
          habitHint: 'dass الجملة الفرعية.'
        }
      ]
    });
  }

  return [
    { id: 1, title: 'Phase 1: Der Satzbau & Die V2-Regel', titleAr: 'المرحلة ١: بنية الجملة وقاعدة الفعل الثاني', level: 'A1', tagline: 'V2 Rule & Core Sentences', lessons: phase1Lessons },
    { id: 2, title: 'Phase 2: Die Fälle (Akkusativ & Dativ)', titleAr: 'المرحلة ٢: حالات الإعراب والنصب والجر', level: 'A2', tagline: 'Accusative & Articles', lessons: phase2Lessons },
    { id: 3, title: 'Phase 3: Perfekt & Nebensätze', titleAr: 'المرحلة ٣: الماضي المركب والجمل الفرعية', level: 'B1', tagline: 'Past Tense & Subordinate Clauses', lessons: phase3Lessons }
  ];
}
