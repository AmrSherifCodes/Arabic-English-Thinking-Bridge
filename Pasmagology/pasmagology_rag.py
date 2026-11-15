"""
Pasmagology RAG Pipeline (Keyword-based)
----------------------------------------
يعالج هذا الملف استخراج النصوص من ملفات PDF مع الحفاظ على الجداول والمعادلات،
وتقسيم النص (Chunking) إلى أجزاء صغيرة (بحد أقصى 800 حرف)،
وبناء كشاف الكلمات (Inverted Index) للبحث السريع بدون مكتبات ذكاء اصطناعي ثقيلة.
"""

import re
import logging
from typing import List, Dict, Any

try:
    import pymupdf as fitz  # PyMuPDF 2.x — aliased so all downstream `fitz.X` calls keep working
except ImportError:
    try:
        import fitz  # PyMuPDF 1.x fallback (older installs)
    except ImportError:
        fitz = None

# إعداد سجل الأخطاء (Logging)
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')


class Page:
    """يمثل صفحة واحدة مستخرجة من ملف PDF."""
    def __init__(self, page_num: int, text: str):
        self.page_num = page_num
        self.text = text

    def __repr__(self):
        return f"<Page num={self.page_num} len={len(self.text)}>"


class Chunk:
    """يمثل جزءاً نصياً من صفحة لاستخدامه في البحث (RAG)."""
    def __init__(self, chunk_id: int, page_num: int, text: str):
        self.chunk_id = chunk_id
        self.page_num = page_num
        self.text = text

    def __repr__(self):
        return f"<Chunk id={self.chunk_id} page={self.page_num} len={len(self.text)}>"


class PasmagologyRAG:
    """محرك استخراج وبحث يعتمد على الكلمات المفتاحية (Keyword RAG)."""

    def __init__(self):
        self.pages: List[Page] = []
        self.chunks: List[Chunk] = []
        self.inverted_index: Dict[str, List[int]] = {}
        # قائمة الكلمات المستبعدة (Stop words) البسيطة
        self.stop_words = {
            "في", "من", "على", "إلى", "عن", "مع", "هذا", "هذه", "أن", "أو", "هل", "ما", "ماذا",
            "كيف", "متى", "أين", "لماذا", "و", "ف", "ثم", "التي", "الذي", "in", "on", "at", "to",
            "from", "is", "are", "and", "or", "the", "a", "an", "of", "with", "this", "that"
        }

    def _tokenize(self, text: str) -> set:
        """تنظيف النص وتقسيمه إلى كلمات مفتاحية فريدة."""
        # إزالة التشكيل والرموز الخاصة للتبسيط
        text = re.sub(r'[\u064B-\u065F\u0670]', '', text)
        words = re.findall(r'\b\w+\b', text.lower())
        return {w for w in words if w not in self.stop_words and len(w) > 1}

    def extract_pdf(self, path: str) -> List[Page]:
        """
        يستخرج النص من ملف PDF مع محاولة الحفاظ على تنسيق الجداول والمعادلات.
        """
        if fitz is None:
            raise ImportError("PyMuPDF is not installed. Please install it using 'pip install pymupdf'.")

        self.pages = []
        try:
            doc = fitz.open(path)
            for page_num, page in enumerate(doc, start=1):
                # استخدام الاستخراج كقاموس لمحاولة الحفاظ على التنسيق (مثل الجداول)
                page_dict = page.get_text("dict")
                blocks = page_dict.get("blocks", [])

                page_text_parts = []
                for block in blocks:
                    if block.get("type") == 0:  # نص (Text block)
                        block_text = ""
                        for line in block.get("lines", []):
                            line_text = " ".join([span.get("text", "") for span in line.get("spans", [])])
                            block_text += line_text + "\n"
                        page_text_parts.append(block_text.strip())

                # دمج الكتل بمسافات مزدوجة للفصل الدلالي
                full_page_text = "\n\n".join(page_text_parts)
                self.pages.append(Page(page_num=page_num, text=full_page_text))
            doc.close()
        except Exception as e:
            logger.error(f"خطأ أثناء قراءة ملف PDF: {e}")
            raise RuntimeError(f"Failed to read PDF: {e}")

        return self.pages

    def chunk(self, pages: List[Page] = None) -> List[Chunk]:
        """
        يُقسم صفحات PDF إلى أجزاء (Chunks) بناءً على الفواصل الدلالية وبحد أقصى 800 حرف.
        """
        if pages is None:
            pages = self.pages

        self.chunks = []
        chunk_id = 0
        max_length = 800

        for page in pages:
            # التقسيم المبدئي بناءً على الفقرات (الأسطر المزدوجة)
            paragraphs = re.split(r'\n\s*\n', page.text)
            current_chunk_text = ""

            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue

                # إذا كانت الفقرة بحد ذاتها أطول من الحد المسموح، نقطعها بالجمل
                if len(para) > max_length:
                    if current_chunk_text:
                        self.chunks.append(Chunk(chunk_id, page.page_num, current_chunk_text.strip()))
                        chunk_id += 1
                        current_chunk_text = ""

                    sentences = re.split(r'(?<=[.!?؟])\s+', para)
                    for sentence in sentences:
                        if len(current_chunk_text) + len(sentence) <= max_length:
                            current_chunk_text += sentence + " "
                        else:
                            if current_chunk_text:
                                self.chunks.append(Chunk(chunk_id, page.page_num, current_chunk_text.strip()))
                                chunk_id += 1
                            current_chunk_text = sentence + " "
                else:
                    if len(current_chunk_text) + len(para) <= max_length:
                        current_chunk_text += para + "\n\n"
                    else:
                        self.chunks.append(Chunk(chunk_id, page.page_num, current_chunk_text.strip()))
                        chunk_id += 1
                        current_chunk_text = para + "\n\n"

            if current_chunk_text.strip():
                self.chunks.append(Chunk(chunk_id, page.page_num, current_chunk_text.strip()))
                chunk_id += 1

        return self.chunks

    def index(self, chunks: List[Chunk] = None) -> Dict[str, List[int]]:
        """
        يُنشئ كشاف الكلمات (Inverted Index) للبحث السريع في الـ Chunks.
        """
        if chunks is None:
            chunks = self.chunks

        self.inverted_index = {}
        for chunk in chunks:
            tokens = self._tokenize(chunk.text)
            for token in tokens:
                if token not in self.inverted_index:
                    self.inverted_index[token] = []
                self.inverted_index[token].append(chunk.chunk_id)

        return self.inverted_index

    def retrieve(self, query: str, k: int = 5) -> List[Chunk]:
        """
        يسترجع أكثر الـ Chunks تطابقاً مع كلمات البحث (Query).
        """
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        chunk_scores = {}
        for token in query_tokens:
            if token in self.inverted_index:
                matched_chunks = self.inverted_index[token]
                for cid in matched_chunks:
                    chunk_scores[cid] = chunk_scores.get(cid, 0) + 1

        # ترتيب النتائج بناءً على عدد الكلمات المتطابقة (التقاطع)
        sorted_cids = sorted(chunk_scores.keys(), key=lambda cid: chunk_scores[cid], reverse=True)

        # جلب أفضل k نتيجة
        top_cids = sorted_cids[:k]

        # إرجاع كائنات Chunk المقابلة بالترتيب الصحيح (Relevance order)
        chunk_by_id = {c.chunk_id: c for c in self.chunks}
        return [chunk_by_id[cid] for cid in top_cids if cid in chunk_by_id]

    @classmethod
    def from_pdf(cls, path: str) -> 'PasmagologyRAG':
        """
        مُنشئ سريع يقرأ الـ PDF، ويُقسمه، ويُفهرسه ليكون جاهزاً للبحث فوراً.
        """
        rag = cls()
        try:
            rag.extract_pdf(path)
            rag.chunk()
            rag.index()
        except Exception as e:
            logger.error(f"فشل في تهيئة RAG من الملف: {e}")
        return rag


if __name__ == "__main__":
    # نقطة اختبار بسيطة للتأكد من خلو الملف من أخطاء بناء الجملة
    print("PasmagologyRAG module loaded successfully.")
