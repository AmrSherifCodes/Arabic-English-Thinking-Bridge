"""
Pasmagology Core Generator
--------------------------
المحرك الأساسي لتحويل النصوص المستخرجة عبر RAG إلى لعبة تفاعلية.
يعتمد على التوليد المتعدد على دفعات صغيرة (Batched Multi-Call Generation) عبر Ollama،
مع وجود آلية إصلاح تلقائي للـ JSON وسجل مراجعة للحد من الأخطاء والتباطؤ.
"""

import json
import logging
import os
import re
import requests
from datetime import datetime
from typing import Dict, Any, List, Optional

try:
    from .pasmagology_rag import PasmagologyRAG
except ImportError:
    from pasmagology_rag import PasmagologyRAG

logger = logging.getLogger(__name__)

MAX_CONTEXT_CHARS = 10000
MAX_CONTEXT_CHUNKS = 10

BAD_WORDS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bad_words.json")

def _load_bad_words() -> set:
    try:
        if os.path.exists(BAD_WORDS_PATH):
            with open(BAD_WORDS_PATH, "r", encoding="utf-8") as fh:
                data = json.load(fh)
                if isinstance(data, list):
                    return {w.strip().lower() for w in data if isinstance(w, str) and w.strip()}
    except Exception as exc:
        logger.warning(f"تعذر تحميل bad_words.json: {exc}")
    return set()

BAD_WORDS: set = _load_bad_words()

SAFE_ICONS = ["🌿", "⭐", "💧", "⚡", "📘", "🧪", "🔍", "🌍", "📌", "🏆"]

class PasmagologyCore:
    """المولد الرئيسي للعبة بناءً على نصوص RAG و LLM باستخدام التوليد الموزع على دفعات."""

    def __init__(self, ollama_url: str = "http://localhost:11434", model: str = "qwen2.5:1.5b"):
        self.ollama_url = ollama_url
        self.model = model

    def _call_ollama(self, prompt: str, system_prompt: str = "", options_override: Optional[dict] = None) -> str:
        url = f"{self.ollama_url}/api/generate"
        options = {
            "temperature": 0.1,
            "num_predict": 700,
            "num_ctx": 4096,
            "repeat_penalty": 1.2,
            "stop": ["\n\n```", "```"]
        }
        if options_override:
            options.update(options_override)

        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "format": "json",
            "options": options
        }

        try:
            response = requests.post(url, json=payload, timeout=180)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
        except requests.exceptions.RequestException as e:
            logger.error(f"خطأ في الاتصال بـ Ollama: {e}")
            raise RuntimeError(f"فشل الاتصال بـ Ollama ({self.ollama_url}): {e}")

    def _repair_json(self, raw: str) -> Optional[Dict[str, Any]]:
        if not raw or not raw.strip():
            return None

        s = raw.strip()
        # إزالة وسوم Markdown المعطوبة
        s = re.sub(r'^```(?:json)?', '', s, flags=re.IGNORECASE).strip()
        s = re.sub(r'```$', '', s).strip()

        # استخراج أول هيكل صريح لـ JSON
        first_brace = s.find('{')
        first_bracket = s.find('[')

        if first_brace == -1 and first_bracket == -1:
            return None

        if first_brace != -1 and (first_bracket == -1 or first_brace < first_bracket):
            start = first_brace
            is_object = True
        else:
            start = first_bracket
            is_object = False

        s = s[start:]

        # تنظيف الأحرف الخاصة داخل السلاسل النصية المفردة
        cleaned = []
        in_string = False
        escape = False
        for char in s:
            if escape:
                cleaned.append(char)
                escape = False
                continue

            if char == '\\':
                escape = True
                cleaned.append(char)
                continue

            if char == '"':
                in_string = not in_string
                cleaned.append(char)
                continue

            if in_string:
                if char == '\n':
                    cleaned.append('\\n')
                elif char == '\r':
                    cleaned.append('\\r')
                elif char == '\t':
                    cleaned.append('\\t')
                else:
                    cleaned.append(char)
            else:
                cleaned.append(char)

        s = "".join(cleaned)

        # محاولة تحليل قياسية أولى
        try:
            res = json.loads(s)
            if is_object and isinstance(res, dict):
                return res
            if not is_object and isinstance(res, list):
                return {"items": res}
        except Exception:
            pass

        # محاولة إغلاق الأقواس المفتوحة تلقائياً
        open_brackets = []
        in_str = False
        esc = False
        for char in s:
            if esc:
                esc = False
                continue
            if char == '\\':
                esc = True
                continue
            if char == '"':
                in_str = not in_str
                continue
            if not in_str:
                if char in ('{', '['):
                    open_brackets.append(char)
                elif char == '}' and open_brackets and open_brackets[-1] == '{':
                    open_brackets.pop()
                elif char == ']' and open_brackets and open_brackets[-1] == '[':
                    open_brackets.pop()

        closers = ""
        for b in reversed(open_brackets):
            closers += '}' if b == '{' else ']'

        try:
            res = json.loads(s + closers)
            if is_object and isinstance(res, dict):
                return res
            if not is_object and isinstance(res, list):
                return {"items": res}
        except Exception:
            pass

        return None

    def _call_batch(self, prompt: str, system_prompt: str, expected_key: str = None) -> Any:
        # محاولتان مع إعدادات مختلفة لكل محاولة
        for attempt in (1, 2):
            opts = {"temperature": 0.1, "repeat_penalty": 1.2} if attempt == 1 else {"temperature": 0.3, "repeat_penalty": 1.3}
            try:
                raw = self._call_ollama(prompt=prompt, system_prompt=system_prompt, options_override=opts)
                parsed = self._repair_json(raw)
                if parsed is not None:
                    if expected_key:
                        if expected_key in parsed:
                            return parsed[expected_key]
                        elif "items" in parsed:
                            return parsed["items"]
                        elif isinstance(parsed, dict) and len(parsed) == 1:
                            return list(parsed.values())[0]
                    return parsed
            except Exception as e:
                logger.warning(f"محاولة الدفعة {attempt} فشلت: {e}")

        logger.warning(f"فشلت الدفعة تماماً للمفتاح المطلوب: {expected_key}")
        return [] if expected_key else {}

    def _filter_bad_words_obj(self, obj: Any) -> Any:
        if isinstance(obj, str):
            res = obj
            for w in BAD_WORDS:
                if w in res.lower():
                    res = re.sub(re.escape(w), "***", res, flags=re.IGNORECASE)
            return res
        elif isinstance(obj, dict):
            return {k: self._filter_bad_words_obj(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._filter_bad_words_obj(item) for item in obj]
        return obj

    def _sanitize_icons(self, obj: Any) -> Any:
        emoji_pattern = re.compile(r'[\U0001F300-\U0001FAFF\u2600-\u27BF]')
        if isinstance(obj, dict):
            new_dict = {}
            for k, v in obj.items():
                if k == "icon" and isinstance(v, str):
                    cleaned_icon = emoji_pattern.sub('', v).strip()
                    if not cleaned_icon:
                        idx = hash(str(obj.get("title_ar", ""))) % len(SAFE_ICONS)
                        new_dict[k] = SAFE_ICONS[idx]
                    else:
                        new_dict[k] = cleaned_icon
                else:
                    new_dict[k] = self._sanitize_icons(v)
            return new_dict
        elif isinstance(obj, list):
            return [self._sanitize_icons(item) for item in obj]
        return obj

    def _finalize(self, result: dict) -> dict:
        final_data = {
            "meta": result.get("meta") if isinstance(result.get("meta"), dict) else {},
            "glossary": result.get("glossary") if isinstance(result.get("glossary"), list) else [],
            "cards": result.get("cards") if isinstance(result.get("cards"), list) else [],
            "formulas": result.get("formulas") if isinstance(result.get("formulas"), list) else [],
            "battle": result.get("battle") if isinstance(result.get("battle"), list) else [],
            "exam": result.get("exam") if isinstance(result.get("exam"), list) else []
        }

        # تصفية الكلمات واستبدال الرموز
        final_data = self._filter_bad_words_obj(final_data)
        final_data = self._sanitize_icons(final_data)

        # فحص المعايير والتنبيه بدون إيقاف النظام
        mins = {"cards": 6, "formulas": 3, "battle": 25, "exam": 15}
        for k, min_c in mins.items():
            count = len(final_data[k])
            if count < min_c:
                print(f"⚠️ SHORTFALL: {k} {count}/{min_c} (النظام مستمر بدون توقف)")

        return final_data

    def _get_context(self, chunks: list) -> str:
        step = max(1, len(chunks) // MAX_CONTEXT_CHUNKS)
        sampled = chunks[::step][:MAX_CONTEXT_CHUNKS]
        context = "\n\n---\n\n".join(c.text for c in sampled)
        if len(context) > MAX_CONTEXT_CHARS:
            context = context[:MAX_CONTEXT_CHARS] + "\n\n[...مقتطع...]"
        return context

    def _gen_meta(self, chunks: list, pdf_path: str = "") -> dict:
        ctx = self._get_context(chunks)
        sys_prompt = "أنت مبرمج تعليمي. أنشئ كائن JSON يحتوي على عنوان الدرس فقط."
        prompt = f"المصدر:\n{ctx}\n\nأرجع JSON بنفس الشكل:\n{{\"title\": \"عنوان الدرس\"}}"
        res = self._call_batch(prompt, sys_prompt)
        if not isinstance(res, dict):
            res = {}
        fallback = os.path.splitext(os.path.basename(pdf_path))[0] if pdf_path else "درس تعليمي"
        return {
            "title": res.get("title") or fallback,
            "source_pages": len(set(c.page_num for c in chunks)) if chunks else 1,
            "generated_at": datetime.utcnow().isoformat() + "Z"
        }

    def _gen_glossary(self, chunks: list, n: int = 4) -> list:
        ctx = self._get_context(chunks)
        sys_prompt = f"أنشئ قائمة مصطلحات (glossary) تحتوي على {n} عناصر باللغة العربية والإنجليزي."
        prompt = f"المصدر:\n{ctx}\n\nأرجع JSON:\n{{\"glossary\": [{{\"en\": \"Term\", \"ar\": \"المصطلح\", \"category\": \"علم\"}}]}}"
        res = self._call_batch(prompt, sys_prompt, expected_key="glossary")
        return res if isinstance(res, list) else []

    def _gen_cards(self, chunks: list, n: int = 4) -> list:
        ctx = self._get_context(chunks)
        sys_prompt = f"أنشئ قائمة بطاقات تعليمية (cards) بعدد {n} بطاقات. لا تستخدم أي وجوه بشرية."
        prompt = (
            f"المصدر:\n{ctx}\n\nأرجع JSON:\n"
            "{\"cards\": [{\"icon\": \"⭐\", \"title_en\": \"Title\", \"title_ar\": \"العنوان\", \"body_ar\": \"الشرح\", \"body_en\": \"Explanation\", \"source_page\": 1, \"exam_hack\": \"ملاحظة\"}]}"
        )
        res = self._call_batch(prompt, sys_prompt, expected_key="cards")
        return res if isinstance(res, list) else []

    def _gen_formulas(self, chunks: list, n: int = 2) -> list:
        ctx = self._get_context(chunks)
        sys_prompt = f"استخرج {n} معادلات أو قوانين علمية (formulas) من النص."
        prompt = f"المصدر:\n{ctx}\n\nأرجع JSON:\n{{\"formulas\": [{{\"latex\": \"E=mc^2\", \"plain\": \"E=mc^2\", \"meaning_ar\": \"المعنى\", \"source_page\": 1}}]}}"
        res = self._call_batch(prompt, sys_prompt, expected_key="formulas")
        return res if isinstance(res, list) else []

    def _gen_battle(self, chunks: list, num_cats: int = 5, qs_per_cat: int = 5) -> list:
        ctx = self._get_context(chunks)
        sys_prompt_cat = f"استخرج {num_cats} تصنيفات رئيسية للأسئلة."
        prompt_cat = f"المصدر:\n{ctx}\n\nأرجع JSON:\n{{\"categories\": [\"التصنيف 1\", \"التصنيف 2\"]}}"
        cats = self._call_batch(prompt_cat, sys_prompt_cat, expected_key="categories")
        if not isinstance(cats, list) or len(cats) < num_cats:
            cats = [f"تصنيف {i+1}" for i in range(num_cats)]

        battle_all = []
        for cat in cats[:num_cats]:
            sys_prompt_q = f"أنشئ {qs_per_cat} أسئلة معركة اختيار من متعدد للتصنيف '{cat}'."
            prompt_q = (
                f"المصدر:\n{ctx}\n\nأرجع JSON:\n"
                "{\"questions\": [{\"category\": \"" + str(cat) + "\", \"points\": 100, \"question_ar\": \"السؤال؟\", \"options\": [\"أ\", \"ب\", \"ج\", \"د\"], \"correct\": 0, \"explanation_ar\": \"الشرح\"}]}"
            )
            qs = self._call_batch(prompt_q, sys_prompt_q, expected_key="questions")
            if isinstance(qs, list) and len(qs) > 0:
                for idx, q in enumerate(qs[:qs_per_cat]):
                    if isinstance(q, dict):
                        q["category"] = cat
                        q["points"] = (idx + 1) * 100
                        battle_all.append(q)
            else:
                for idx in range(qs_per_cat):
                    battle_all.append({
                        "category": cat,
                        "points": (idx + 1) * 100,
                        "question_ar": f"سؤال في {cat}",
                        "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
                        "correct": 0,
                        "explanation_ar": "شرح تلقائي"
                    })

        return battle_all

    def _gen_exam(self, chunks: list, n: int = 6) -> list:
        ctx = self._get_context(chunks)
        sys_prompt = f"أنشئ {n} أسئلة امتحان متدرجة الصعوبة (easy, medium, hard)."
        prompt = (
            f"المصدر:\n{ctx}\n\nأرجع JSON:\n"
            "{\"exam\": [{\"question_ar\": \"السؤال؟\", \"options\": [\"أ\", \"ب\", \"ج\", \"د\"], \"correct\": 0, \"explanation_ar\": \"الشرح\", \"difficulty\": \"easy\", \"source_page\": 1}]}"
        )
        res = self._call_batch(prompt, sys_prompt, expected_key="exam")
        return res if isinstance(res, list) else []

    def generate_game(self, pdf_path: str, age_band: str = "10-12", language: str = "ar",
                      cards_n: int = 6, formulas_n: int = 3, battle_cats: int = 5, exam_n: int = 15) -> Dict[str, Any]:
        rag = PasmagologyRAG.from_pdf(pdf_path)
        if not rag.chunks:
            raise ValueError("الملف مفيهوش نص مقروء — يمكن يكون صورة مسحوبة (scan) أو مشفر")

        print("🚀 بدء التوليد الموزع على دفعات (Batched Generation)...")
        result = {}

        print("  [1/6] توليد معلومات الميتا...")
        result["meta"] = self._gen_meta(rag.chunks, pdf_path=pdf_path)
        result["meta"]["age_band"] = age_band
        result["meta"]["language"] = language

        print("  [2/6] توليد القاموس...")
        result["glossary"] = self._gen_glossary(rag.chunks, n=4)

        print(f"  [3/6] توليد البطاقات ({cards_n})...")
        result["cards"] = self._gen_cards(rag.chunks, n=cards_n)

        print(f"  [4/6] توليد المعادلات ({formulas_n})...")
        result["formulas"] = self._gen_formulas(rag.chunks, n=formulas_n)

        print(f"  [5/6] توليد المعركة ({battle_cats}x5)...")
        result["battle"] = self._gen_battle(rag.chunks, num_cats=battle_cats, qs_per_cat=5)

        print(f"  [6/6] توليد الامتحان ({exam_n})...")
        result["exam"] = self._gen_exam(rag.chunks, n=exam_n)

        print("✨ تجميع وتصفية النتيجة النهائية...")
        return self._finalize(result)


if __name__ == "__main__":
    print("PasmagologyCore module loaded successfully.")
