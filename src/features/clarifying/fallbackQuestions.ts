export const fallbackQuestions = {
  writing: [
    "ليه اخترت تكتب بالطريقة دي؟",
    "ممكن تدي مثال تاني يوضح فكرتك؟",
    "لو حبيت تعيد صياغة الجملة دي، هتقول إيه؟",
    "إيه الكلمة اللي حسيت إنها صعبة وأنت بتكتب؟",
    "هل في طريقة أبسط تقدر توصل بيها نفس المعنى؟"
  ],
  speaking: [
    "تقصد إيه بالظبط لما قلت الكلمة دي؟",
    "جرب تقول نفس الفكرة بس في جملة أطول شوية.",
    "ممكن تشرحلي أكتر؟",
    "لو بتكلم واحد صاحبك، هتقولها إزاي؟",
    "حاول تستخدم كلمة جديدة في إجابتك الجاية."
  ],
  listening: [
    "الجملة اللي سمعتها كانت بتتكلم عن إيه؟",
    "إيه أكتر كلمة ميزتها في الجملة؟",
    "ممكن تقول الجملة تاني بطريقتك؟",
    "هل في جزء مفهمتوش كويس في الجملة دي؟",
    "حاول تخمن المعنى العام حتى لو مسمعتش كل كلمة."
  ],
  reading: [
    "مين الشخص أو الشيء الأساسي في الفقرة دي؟",
    "من السياق، تفتكر الكلمة دي معناها إيه؟",
    "إيه الفكرة الرئيسية في جملة واحدة؟",
    "لو هتكتب عنوان للفقرة دي، هيكون إيه؟",
    "إيه أكتر جزء لفت انتباهك في الكلام المكتوب؟"
  ]
};

export function getFallbackQuestion(skill: 'writing' | 'speaking' | 'listening' | 'reading', turnNumber: number): string {
    const list = fallbackQuestions[skill];
    return list[turnNumber % list.length];
}

export function generateFallbackDiagnosis(skill: string, history: any[]) {
    return {
        skill: skill,
        estimated_level: "A2", // default fallback
        strengths: ["You tried answering the questions.", "Good effort in participation."],
        gaps: ["Needs more complex sentence structures.", "Vocabulary could be expanded."],
        next_practice: "Review intermediate grammar and practice speaking more fluidly."
    };
}
