import { translateArabicToEnglish } from './offlineTranslator';
import { TargetLanguage } from '../types';

export interface CorporateToneOption {
  label: string;
  english: string;
  context: string;
}

export interface CorporateBridgeResult {
  originalThought: string;
  thinkingShift: string;
  tones: {
    polite: CorporateToneOption;
    assertive: CorporateToneOption;
    executive: CorporateToneOption;
  };
}

interface PresetBridge {
  match: RegExp;
  thinkingShift: string;
  polite: string;
  assertive: string;
  executive: string;
  de?: {
    thinkingShift: string;
    polite: string;
    assertive: string;
    executive: string;
  };
  ja?: {
    thinkingShift: string;
    polite: string;
    assertive: string;
    executive: string;
  };
  es?: {
    thinkingShift: string;
    polite: string;
    assertive: string;
    executive: string;
  };
}

const PRESET_BRIDGES: PresetBridge[] = [
  {
    match: /مأخر|ماخر|بيماطل|مباطل/,
    thinkingShift:
      'بدل توصيف الشخص ("بيماطل")، اوصف السلوك المهني نفسه (تأخير في الداتا والرد) وحط طلب واضح في الآخر.',
    polite:
      'Hi team, a quick update: the client is delaying the data and has been slow to reply. Could we please follow up with them today?',
    assertive:
      'The client is delaying the data and stalling on replies. Please follow up today and confirm a delivery date.',
    executive:
      'Client delay on data and responses is blocking progress. Action: escalate today and secure a firm delivery date.',
    de: {
      thinkingShift: 'في الألمانية المهنية، ركز على التأخير التقني واستخدم صيغة Konjunktiv II للطلب المهذب.',
      polite: 'Hallo Team, der Kunde verzögert die Datenlieferung. Könnten wir heute bitte nachfassen?',
      assertive: 'Der Kunde verzögert die Daten und Antworten. Bitte fassen Sie heute nach und vereinbaren Sie einen Termin.',
      executive: 'Kundenverzögerung blockiert den Fortschritt. Maßnahme: Heute eskalieren und Termin sichern.'
    },
    ja: {
      thinkingShift: 'في اليابانية المهنية (Keigo)، عبر عن التأخير بلطف مع طلب المتابعة بصيغة الاحترام.',
      polite: 'お世話になっております。クライアントからのデータ共有が遅れております。本日確認のご連絡をいただけますと幸いです。',
      assertive: 'データの提出および返信が遅延しております。本日中に再確認の上、納期をご確定ください。',
      executive: '緊急対応：クライアントデータ遅延のため、本日中に再確認および納期確定をお願いいたします。'
    },
    es: {
      thinkingShift: 'En el español profesional, centra el mensaje en el retraso técnico y pide una fecha de entrega concreta, usando un registro formal.',
      polite: 'Hola equipo, una actualización: el cliente está retrasando los datos y tarda en responder. ¿Podríamos hacer seguimiento hoy?',
      assertive: 'El cliente está retrasando los datos y las respuestas. Por favor, hagan seguimiento hoy y confirmen la fecha de entrega.',
      executive: 'Retraso del cliente en datos y respuestas bloquea el avance. Acción: escalar hoy y asegurar fecha firme de entrega.'
    }
  },
  {
    match: /كنت في ميتنج|مشوفتش|مشوفت|معلش/,
    thinkingShift:
      'الاعتذار في الإنجليزي المهني = اعتراف مختصر + سبب + التزام بالخطوة الجاية. من غير مبالغة.',
    polite:
      "Apologies for the delayed reply — I was in a meeting and missed your email. I'll get back to you shortly.",
    assertive:
      "I was in a meeting and missed your email. I'm reviewing it now and will respond by end of day.",
    executive:
      'Missed your email due to a meeting. Reviewing now; response by EOD.',
    de: {
      thinkingShift: 'في الألمانية، الاعتذار البسيط وتقديم موعد واضح للرد يعكس الاحترافية.',
      polite: 'Entschuldigen Sie die späte Antwort — ich war in einem Termin. Ich melde mich in Kürze bei Ihnen.',
      assertive: 'Ich war in einem Meeting und habe Ihre E-Mail verpasst. Ich prüfe dies und antworte bis heute Abend.',
      executive: 'E-Mail wegen Meeting verpasst. Prüfung läuft; Rückmeldung bis EOD.'
    },
    ja: {
      thinkingShift: 'في اليابانية، استخدم صيغة الاعتذار عن التأخير (お返事が遅くなり申し訳ありません).',
      polite: 'ご連絡が遅くなり大変申し訳ございません。会議のためメールを確認できておりませんでした。追ってご連絡いたします。',
      assertive: '会議のため返信が遅れました。ただいま確認中ですので、本日中にご回答いたします。',
      executive: '会議のため確認遅延。至急確認中、本日中に回答いたします。'
    },
    es: {
      thinkingShift: 'En el español profesional, una disculpa breve + causa + compromiso de respuesta es suficiente.',
      polite: 'Disculpen la demora en la respuesta — estaba en una reunión y perdí su correo. Les responderé en breve.',
      assertive: 'Estaba en una reunión y no vi su correo. Lo reviso ahora y respondo antes de que termine el día.',
      executive: 'Correo perdido por reunión. Revisando ahora; respuesta antes de EOD.'
    }
  },
  {
    match: /نراجع الحسابات|في غلطة|غلطة|مراجعة/,
    thinkingShift:
      'بلاش "في غلطة" بشكل مباشر. استخدم "there appears to be an error" + اطلب مراجعة مش اتهام.',
    polite:
      'Could we please review these accounts? I believe there may be an error that needs checking.',
    assertive:
      'We need to review these accounts — there appears to be an error that should be corrected.',
    executive:
      'Action: review these accounts. An error has been identified and requires correction.',
    de: {
      thinkingShift: 'في الألمانية، اطلب المراجعة بصيغة الجمع والتعاون بدلاً من الإشارة إلى الخطأ مباشرة.',
      polite: 'Könnten wir diese Abrechnungen bitte überprüfen? Es scheint hier eine Unstimmigkeit zu geben.',
      assertive: 'Wir müssen diese Konten überprüfen — hier liegt offenbar ein Fehler vor, der korrigiert werden muss.',
      executive: 'Prüfungsbedarf: Fehler in den Konten identifiziert. Bitte um Korrektur bis EOD.'
    },
    ja: {
      thinkingShift: 'في اليابانية، استخدم تعبير 不備 (Unstimmigkeit/Discrepancy) لتجنب المواجهة المباشرة.',
      polite: '恐れ入りますが、こちらの計算データをご確認いただけますでしょうか。一部不一致の可能性がございます。',
      assertive: 'こちらの会計データに誤りと思われる箇所がございます。ご確認の上、修正をお願いいたします。',
      executive: '要確認：会計データに不備が検出されました。本日中の再確認および修正をお願いいたします。'
    },
    es: {
      thinkingShift: 'En el español profesional, pide la revisión con un tono colaborativo y menciona la discrepancia sin acusar.',
      polite: '¿Podríamos revisar estas cuentas? Creo que puede haber un error que conviene verificar.',
      assertive: 'Debemos revisar estas cuentas — parece haber un error que debe corregirse.',
      executive: 'Acción: revisar estas cuentas. Se identificó un error que requiere corrección.'
    }
  },
  {
    match: /آخر الأسبوع|اخر الاسبوع|نخلّص|نخلص|ضروري/,
    thinkingShift:
      'حدد الموعد النهائي بوضوح (hard deadline) + اطلب تأكيد ملكية المهمة، بدل كلمة "ضروري" العامة.',
    polite:
      'We need to wrap this up before the end of the week if possible. Could we align on a plan and owners?',
    assertive:
      'We must finish this before the end of the week. Please confirm your part today.',
    executive:
      'Hard deadline: end of week. All owners to confirm completion today.',
    de: {
      thinkingShift: 'في الألمانية، الأوقات والمواعيد النهائية يُعبر عنها بجدية بعبارة bis Ende der Woche.',
      polite: 'Wir sollten dies möglichst bis Ende der Woche abschließen. Können wir uns dazu kurz abstimmen?',
      assertive: 'Wir müssen diese Aufgabe bis Ende der Woche fertigstellen. Bitte bestätigen Sie Ihren Teil heute.',
      executive: 'Feste Frist: Ende der Woche. Bitte alle Zuständigen heute um Bestätigung.'
    },
    ja: {
      thinkingShift: 'حدد الموعد بوضوح مع عبارة 週末までに (By the weekend).',
      polite: 'できれば今週末までに完了させたく存じます。進捗のご確認をお願いできますでしょうか。',
      assertive: '今週末までに本件を完了させる必要がございます。本日中に担当箇所のご確認をお願いいたします。',
      executive: '期限：今週末厳守。各自本日中に完了予定のご報告をお願いいたします。'
    },
    es: {
      thinkingShift: 'En el español profesional, fija una fecha límite clara (hasta fin de semana) y pide confirmación de responsables.',
      polite: 'Deberíamos cerrar esto antes de fin de semana si es posible. ¿Podemos alinear un plan y responsables?',
      assertive: 'Debemos terminar esto antes de fin de semana. Por favor, confirmen su parte hoy.',
      executive: 'Fecha límite firme: fin de semana. Todos los responsables a confirmar hoy.'
    }
  },
  {
    match: /ميزانية|مكفية|تكفي|الفلوس/,
    thinkingShift:
      'بدل "الميزانية مش مكفية"، اذكر الفجوة بين الميزانية والنطاق المطلوب واطلب قرار واضح.',
    polite:
      "The current budget doesn't seem to cover the required scope. Could we review it together?",
    assertive:
      'The budget does not cover the required scope. We need a revised figure before we proceed.',
    executive:
      'Budget gap vs. scope. Decision needed: increase the budget or reduce the scope.',
    de: {
      thinkingShift: 'في الألمانية، ركز على التوازن بين Budget (الميزانية) و Umfang (النطاق).',
      polite: 'Das aktuelle Budget scheint den erforderlichen Umfang nicht ganz abzudecken. Können wir das besprechen?',
      assertive: 'Das Budget reicht für den geforderten Umfang nicht aus. Wir benötigen eine Anpassung.',
      executive: 'Budgetabweichung: Entscheidung erforderlich — Budget erhöhen oder Umfang anpassen.'
    },
    ja: {
      thinkingShift: 'استخدم تعبير 予算 (Yosan) و Scope لتحديد الفجوة بأسلوب مهني.',
      polite: '現在の予算では要求仕様をカバーできない可能性がございます。一度お打ち合わせ可能でしょうか。',
      assertive: '現在の予算と要求範囲に乖離がございます。進行前に予算の再検討をお願いいたします。',
      executive: '予算超過の懸念：予算の追加またはスコープ調整の意思決定をお願いいたします。'
    },
    es: {
      thinkingShift: 'En el español profesional, centra el mensaje en la brecha entre presupuesto y alcance y pide una decisión clara.',
      polite: 'El presupuesto actual no parece cubrir el alcance requerido. ¿Podríamos revisarlo juntos?',
      assertive: 'El presupuesto no cubre el alcance requerido. Necesitamos una cifra revisada antes de continuar.',
      executive: 'Brecha presupuesto vs. alcance. Decisión necesaria: aumentar presupuesto o reducir alcance.'
    }
  },
];

const CONTEXTS = {
  polite: 'نبرة هادئة ومهنية — مناسبة لأول تواصل أو عميل حساس.',
  assertive: 'نبرة حاسمة وواضحة — مناسبة للمتابعة وطلب التزام بموعد.',
  executive: 'نبرة تنفيذية مختصرة — مناسبة للتقارير والإدارة العليا.',
};

function ensureSentence(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const capitalized =
    /^[A-Z]/.test(cleaned) || /^I\b/.test(cleaned)
      ? cleaned
      : cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function lowerFirst(text: string): string {
  const cleaned = text.replace(/[.!?]+$/g, '').trim();
  if (!cleaned) return '';
  if (/^I\b/.test(cleaned) || /^[A-Z]{2,}/.test(cleaned)) return cleaned;
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}

function cleanEnglishCore(text: string, coverage: number): string {
  if (/[\u0600-\u06FF]/.test(text)) return 'this matter';
  if (coverage < 0.5) return 'this matter';
  const sanitized = text.replace(/\s+/g, ' ').trim();
  return sanitized.length >= 2 ? sanitized : 'this matter';
}

function genericBridge(thought: string, targetLang: TargetLanguage = 'en'): CorporateBridgeResult {
  const translation = translateArabicToEnglish(thought);
  const core = cleanEnglishCore(lowerFirst(translation.text), translation.coverage);

  if (targetLang === 'de') {
    return {
      originalThought: thought,
      thinkingShift:
        'في الألمانية المهنية، حدد موضوع الجملة مع إتقان قاعدة الفعل الثاني V2 واستخدام صيغة Konjunktiv II للطلب المهذب.',
      tones: {
        polite: {
          label: 'Höflich (Polite)',
          english: ensureSentence(
            `Hallo Team, eine kurze Anmerkung dazu: ${core}. Könnten Sie sich das bitte bei Gelegenheit ansehen? Vielen Dank`
          ),
          context: CONTEXTS.polite,
        },
        assertive: {
          label: 'Bestimmt (Assertive)',
          english: ensureSentence(
            `Team, ${core}. Bitte priorisieren Sie dies und bestätigen Sie heute den Zeitplan`
          ),
          context: CONTEXTS.assertive,
        },
        executive: {
          label: 'Direkt & Knapp (Executive)',
          english: ensureSentence(
            `Dringende Maßnahme erforderlich: ${core}. Verantwortlicher und Termin heute zu bestätigen`
          ),
          context: CONTEXTS.executive,
        },
      },
    };
  }

  if (targetLang === 'ja') {
    return {
      originalThought: thought,
      thinkingShift:
        'في اليابانية المهنية، ركز على صيغة الاحترام 丁寧語 (Desu/Masu) أو 敬語 (Keigo)، واجعل الفعل المساعد دائماً في الختام المطلق للجملة.',
      tones: {
        polite: {
          label: '丁寧 (Polite)',
          english: `お世話になっております。本件（${core}）についてご確認いただけますと幸いです。`,
          context: CONTEXTS.polite,
        },
        assertive: {
          label: '明確 (Assertive)',
          english: `本件（${core}）、緊急度の高い課題でございます。本日中のご対応をお願い申し上げます。`,
          context: CONTEXTS.assertive,
        },
        executive: {
          label: '簡潔 (Executive)',
          english: `要対応（${core}）：本日中の確認および完了予定日のご連絡をお願いいたします。`,
          context: CONTEXTS.executive,
        },
      },
    };
  }

  if (targetLang === 'es') {
    return {
      originalThought: thought,
      thinkingShift:
        'En el español profesional, centra el mensaje en el asunto (what) + la acción (action) + el plazo (when). Una frase corta y clara es más fuerte que un párrafo largo.',
      tones: {
        polite: {
          label: 'Cortés',
          english: ensureSentence(
            `Hola equipo, una nota rápida: ${core}. ¿Podrían revisarlo cuando tengan un momento? Gracias`
          ),
          context: CONTEXTS.polite,
        },
        assertive: {
          label: 'Directo',
          english: ensureSentence(
            `Equipo, ${core}. Por favor, prioricen esto y confirmen el plazo hoy`
          ),
          context: CONTEXTS.assertive,
        },
        executive: {
          label: 'Ejecutivo',
          english: ensureSentence(
            `Acción requerida: ${core}. Responsable y fecha de entrega a confirmar antes de fin de día`
          ),
          context: CONTEXTS.executive,
        },
      },
    };
  }

  return {
    originalThought: thought,
    thinkingShift:
      'السر مش ترجمة كل كلمة: حدد الموضوع (what) + المطلوب (action) + الموعد (when). الجملة القصيرة الواضحة أقوى من كلام كتير.',
    tones: {
      polite: {
        label: 'Polite',
        english: ensureSentence(
          `Hi team, just a quick note: ${core}. Could you please look into it when you get a chance? Thanks`
        ),
        context: CONTEXTS.polite,
      },
      assertive: {
        label: 'Assertive',
        english: ensureSentence(
          `Team, ${core}. Please prioritize this and confirm the timeline today`
        ),
        context: CONTEXTS.assertive,
      },
      executive: {
        label: 'Executive',
        english: ensureSentence(
          `Action required: ${core}. Owner and ETA to be confirmed by end of day`
        ),
        context: CONTEXTS.executive,
      },
    },
  };
}

/**
 * 100% offline Corporate Bridge for English, German, and Japanese.
 */
export function buildCorporateBridgeOffline(thought: string, targetLang: TargetLanguage = 'en'): CorporateBridgeResult {
  const raw = String(thought || '').trim();
  if (!raw) {
    return genericBridge('this needs our attention', targetLang);
  }

  const preset = PRESET_BRIDGES.find((entry) => entry.match.test(raw));
  if (preset) {
    if (targetLang === 'de' && preset.de) {
      return {
        originalThought: raw,
        thinkingShift: preset.de.thinkingShift,
        tones: {
          polite: { label: 'Höflich', english: preset.de.polite, context: CONTEXTS.polite },
          assertive: { label: 'Bestimmt', english: preset.de.assertive, context: CONTEXTS.assertive },
          executive: { label: 'Direkt & Knapp', english: preset.de.executive, context: CONTEXTS.executive },
        },
      };
    }
    if (targetLang === 'ja' && preset.ja) {
      return {
        originalThought: raw,
        thinkingShift: preset.ja.thinkingShift,
        tones: {
          polite: { label: '丁寧 (Polite)', english: preset.ja.polite, context: CONTEXTS.polite },
          assertive: { label: '明確 (Assertive)', english: preset.ja.assertive, context: CONTEXTS.assertive },
          executive: { label: '簡潔 (Executive)', english: preset.ja.executive, context: CONTEXTS.executive },
        },
      };
    }
    if (targetLang === 'es' && preset.es) {
      return {
        originalThought: raw,
        thinkingShift: preset.es.thinkingShift,
        tones: {
          polite: { label: 'Cortés', english: preset.es.polite, context: CONTEXTS.polite },
          assertive: { label: 'Directo', english: preset.es.assertive, context: CONTEXTS.assertive },
          executive: { label: 'Ejecutivo', english: preset.es.executive, context: CONTEXTS.executive },
        },
      };
    }
    return {
      originalThought: raw,
      thinkingShift: preset.thinkingShift,
      tones: {
        polite: { label: 'Polite', english: preset.polite, context: CONTEXTS.polite },
        assertive: { label: 'Assertive', english: preset.assertive, context: CONTEXTS.assertive },
        executive: { label: 'Executive', english: preset.executive, context: CONTEXTS.executive },
      },
    };
  }

  return genericBridge(raw, targetLang);
}
