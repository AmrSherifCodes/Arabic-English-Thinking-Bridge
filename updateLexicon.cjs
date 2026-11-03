const fs = require('fs');
let code = fs.readFileSync('src/utils/arabicWordLexicon.ts', 'utf8');

const knownTips = {
  "Must be followed by 'am' or an active verb in English.": "لازم تيجي بعدها am أو فعل في الإنجليزي.",
  "Must be followed by “am” or an active verb in English.": "لازم تيجي بعدها am أو فعل في الإنجليزي.",
  "Add the indefinite article 'a' before singular jobs in English.": "زوّد 'a' قبل أسماء الوظايف المفردة في الإنجليزي.",
  "Add the indefinite article “a” before singular jobs in English.": "زوّد 'a' قبل أسماء الوظايف المفردة في الإنجليزي.",
  "Needs a linking verb ('is cold') in English.": "لازم فعل رابط في الإنجليزي زي 'is cold'.",
  "Requires 'an' before a vowel sound.": "خد بالك: 'an' قبل الكلمات اللي بتبدأ بحرف متحرك.",
  "Placed BEFORE the adjective in English.": "بتيجي قبل الصفة في الإنجليزي، عكس العربي.",
  "Takes the helper 'does not' in present negation.": "معاه بنستخدم 'does not' في النفي.",
  "After 'does not', the verb loses its -s.": "بعد 'does not' الفعل بيرجع لأصله بدون s.",
  "Generic concepts take Zero Article in English.": "لو بتتكلم عن حاجة بشكل عام، متحطش 'the'.",
  "Past action closed in time takes Simple Past, not Present Perfect.": "لو الوقت اتقفل في الماضي، استخدم الماضي البسيط مش المضارع التام.",
  "Relative pronoun drop after object position.": "ضمير الوصل بيتشال في الإنجليزي لو كان مفعول.",
  "Triggers Past Perfect backshift.": "بيتحول لـ Past Perfect بعد فعل القول في الماضي.",
  "Modal + have + past participle for past regret/deduction.": "الندم أو الاستنتاج في الماضي: modal + have + V3.",
  "Mandative subjunctive: base verb after 'suggest that'.": "بعد 'suggest that' الفعل بييجي مجرد بدون s.",
  "Any verb after a preposition takes -ing.": "أي فعل بعد حرف جر لازم ينتهي بـ -ing.",
  "Use 'at' for institutions, 'on' for days, 'in' for periods.": "at للأماكن المحددة، on للأيام، in للفترات."
};

code = code.replace(/export interface ArabicLexiconEntry \{\s*en: string;\s*grammar: string;\s*tip: string;/, 'export interface ArabicLexiconEntry {\n  en: string;\n  grammar: string;\n  grammarAr?: string;\n  tip: string;\n  tipAr?: string;');

code = code.replace(/grammar:\s*['"](.*?)['"],\s*tip:\s*['"](.*?)['"]/g, (match, grammar, tip) => {
  let grammarAr = '';
  const gMatch = grammar.match(/\(([^)]+)\)/);
  if (gMatch) {
    grammarAr = gMatch[1];
  } else {
    grammarAr = grammar; // fallback
  }

  let tipAr = 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.';
  for (const [enTip, arTip] of Object.entries(knownTips)) {
    if (tip.includes(enTip)) {
      tipAr = arTip;
      break;
    }
  }

  return `grammar: '${grammar.replace(/'/g, "\\'")}',\n    grammarAr: '${grammarAr.replace(/'/g, "\\'")}',\n    tip: '${tip.replace(/'/g, "\\'")}',\n    tipAr: '${tipAr.replace(/'/g, "\\'")}'`;
});

fs.writeFileSync('src/utils/arabicWordLexicon.ts', code);
