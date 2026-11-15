from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
from typing import Any, Dict, List, Optional

HERE = os.path.dirname(os.path.abspath(__file__))
PROFILE_PATH = os.environ.get("WA3I_CODER_PROFILE", os.path.join(HERE, "wa3i_coder_profile.json"))
MAX_LEVEL = 99

BADGES: Dict[str, Dict[str, str]] = {
    "first_code":   {"icon": "🌟", "title": "أول كود",       "desc": "أول كود ناجح ليك على واعي كودر"},
    "first_run":    {"icon": "▶️", "title": "أول تجربة",      "desc": "جربت تشغل كود بنفسك"},
    "first_heal":   {"icon": "🩺", "title": "دكتور كود",      "desc": "واعي صلح كود فاشل لأول مرة"},
    "heal_master":  {"icon": "🧰", "title": "أسطورة الإصلاح", "desc": "5 إصلاحات ناجحة"},
    "combo_5":      {"icon": "🔥", "title": "كمبو 5",         "desc": "5 نجاحات ورا بعض"},
    "combo_10":     {"icon": "⚡", "title": "كمبو 10",        "desc": "10 نجاحات ورا بعض"},
    "level_5":      {"icon": "💎", "title": "المستوى 5",      "desc": "وصلت للمستوى 5"},
    "level_10":     {"icon": "👑", "title": "المستوى 10",     "desc": "وصلت للمستوى 10"},
    "challenge_1":  {"icon": "🎯", "title": "أول تحدي",       "desc": "خلصت أول تحدي"},
    "challenge_5":  {"icon": "🏆", "title": "صايد التحديات",  "desc": "خلصت 5 تحديات"},
    "streak_3":     {"icon": "📅", "title": "3 أيام ورا بعض", "desc": "دخلت 3 أيام متتالية"},
    "streak_7":     {"icon": "🗓️", "title": "أسبوع كامل",     "desc": "دخلت 7 أيام متتالية"},
    "night_owl":    {"icon": "🦉", "title": "بومة الليل",     "desc": "اشتغلت بعد نص الليل"},
    "early_bird":   {"icon": "🐦", "title": "طير الصبح",      "desc": "اشتغلت قبل 8 الصبح"},
    "copier":       {"icon": "📋", "title": "نسخ احترافي",    "desc": "نسخت الكود 10 مرات"},
    "centurion":    {"icon": "💯", "title": "100 نجاح",       "desc": "100 كود ناجح"},
    "speed_demon":  {"icon": "🚀", "title": "سرعة الصاروخ",   "desc": "كود ناجح في أقل من 15 ثانية"},
    "arabic_coder": {"icon": "🇪🇬", "title": "كودر مصري",     "desc": "طلبت بالعربي"},
}

CHALLENGES: List[Dict[str, Any]] = [
    {"id": "hello", "title": "قول أهلاً", "difficulty": "سهل", "xp": 40,
     "prompt": "اكتب سكريبت بايثون يطبع بالظبط: Hello, Wa3i!",
     "expect": ["Hello, Wa3i!"]},
    {"id": "sum100", "title": "مجموع 1..100", "difficulty": "سهل", "xp": 50,
     "prompt": "اكتب سكريبت بايثون يحسب مجموع الأرقام من 1 لـ 100 ويطبع الناتج.",
     "expect": ["5050"]},
    {"id": "fizzbuzz", "title": "FizzBuzz", "difficulty": "متوسط", "xp": 80,
     "prompt": "اكتب FizzBuzz من 1 لـ 30: لو الرقم يقبل القسمة على 3 اطبع Fizz، على 5 اطبع Buzz، على الاتنين اطبع FizzBuzz، غير كده اطبع الرقم.",
     "expect": ["FizzBuzz"]},
    {"id": "fact5", "title": "مضروب 5", "difficulty": "سهل", "xp": 45,
     "prompt": "اكتب سكريبت بايثون يحسب مضروب 5 (5!) ويطبع الناتج.",
     "expect": ["120"]},
    {"id": "fib", "title": "فيبوناتشي", "difficulty": "متوسط", "xp": 70,
     "prompt": "اكتب سكريبت بايثون يطبع أول 10 أرقام فيبوناتشي في سطر واحد مفصولين بمسافة.",
     "expect": ["55"]},
    {"id": "reverse", "title": "اقلب الكلمة", "difficulty": "سهل", "xp": 40,
     "prompt": "اكتب سكريبت بايثون يقلب كلمة 'مرحبا' ويطبعها.",
     "expect": ["ابحرم"]},
    {"id": "maxlist", "title": "أكبر رقم", "difficulty": "سهل", "xp": 40,
     "prompt": "اكتب سكريبت بايثون فيه قائمة [4, 99, 12, 7] ويطبع أكبر رقم فيها.",
     "expect": ["99"]},
    {"id": "count_words", "title": "عد الكلمات", "difficulty": "متوسط", "xp": 70,
     "prompt": "اكتب سكريبت بايثون يعد كلمات الجملة 'واعي كودر بيحب الكود' ويطبع العدد.",
     "expect": ["4"]},
    {"id": "primes", "title": "الأعداد الأولية", "difficulty": "صعب", "xp": 120,
     "prompt": "اكتب سكريبت بايثون يطبع كل الأعداد الأولية من 1 لـ 30 في سطر واحد.",
     "expect": ["29"]},
    {"id": "palindrome", "title": "باليندروم", "difficulty": "متوسط", "xp": 80,
     "prompt": "اكتب سكريبت بايثون يشوف لو كلمة 'level' باليندروم ويطبع True.",
     "expect": ["True"]},
    {"id": "json_write", "title": "اكتب JSON", "difficulty": "متوسط", "xp": 85,
     "prompt": "اكتب سكريبت بايثون يعمل dictionary فيه name=Wa3i و version=1 ويطبعه كـ JSON.",
     "expect": ["Wa3i"]},
    {"id": "timer", "title": "وقت التنفيذ", "difficulty": "صعب", "xp": 110,
     "prompt": "اكتب سكريبت بايثون يقيس الوقت اللي بياخده sum(range(1000000)) ويطبع كلمة 'elapsed'.",
     "expect": ["elapsed"]},
]


def xp_for_level(level: int) -> int:
    level = max(1, min(MAX_LEVEL, int(level)))
    return 50 * (level - 1) * level


def level_for_xp(xp: int) -> int:
    xp = max(0, int(xp))
    level = 1
    while level < MAX_LEVEL and xp_for_level(level + 1) <= xp:
        level += 1
    return level


def daily_challenge(today: Optional[str] = None) -> Dict[str, Any]:
    today = today or dt.date.today().isoformat()
    digest = hashlib.sha256(f"wa3i-coder-{today}".encode("utf-8")).hexdigest()
    return CHALLENGES[int(digest, 16) % len(CHALLENGES)]


def evaluate_challenge(challenge: Dict[str, Any], result: Any) -> bool:
    if not result or not getattr(result, "success", False):
        return False
    out = getattr(result, "stdout", "") or ""
    for needle in challenge.get("expect", []):
        if needle not in out:
            return False
    return True


class GameProfile:
    def __init__(self, path: str = PROFILE_PATH, data: Optional[dict] = None):
        self.path = path
        self.state = data or self.default_state()

    @staticmethod
    def default_state() -> dict:
        return {
            "xp": 0, "coins": 0, "streak": 0, "last_active": "",
            "total_success": 0, "total_heals": 0, "heal_wins": 0,
            "best_combo": 0, "copies": 0, "runs": 0,
            "challenges_done": [], "daily_done": {"date": "", "id": ""},
            "badges": [], "sound": True,
            "created": dt.date.today().isoformat(),
        }

    @classmethod
    def load(cls, path: str = PROFILE_PATH) -> "GameProfile":
        data = None
        try:
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
        except Exception:
            data = None
        profile = cls(path, data)
        profile.state = {**cls.default_state(), **(profile.state or {})}
        return profile

    def save(self) -> bool:
        try:
            with open(self.path, "w", encoding="utf-8") as f:
                json.dump(self.state, f, ensure_ascii=False, indent=2)
            return True
        except Exception:
            return False

    @property
    def level(self) -> int:
        return level_for_xp(int(self.state.get("xp", 0)))

    def level_progress(self) -> float:
        cur, nxt = xp_for_level(self.level), xp_for_level(self.level + 1)
        if nxt <= cur:
            return 1.0
        return max(0.0, min(1.0, (int(self.state.get("xp", 0)) - cur) / (nxt - cur)))

    def xp_to_next(self) -> int:
        return max(0, xp_for_level(self.level + 1) - int(self.state.get("xp", 0)))

    def touch_day(self) -> bool:
        today = dt.date.today().isoformat()
        last = self.state.get("last_active", "")
        if last == today:
            return False
        if last:
            try:
                delta = (dt.date.today() - dt.date.fromisoformat(last)).days
                self.state["streak"] = int(self.state.get("streak", 0)) + 1 if delta == 1 else 1
            except Exception:
                self.state["streak"] = 1
        else:
            self.state["streak"] = 1
        self.state["last_active"] = today
        return True

    def add_xp(self, amount: int, combo: int = 0) -> int:
        amount = max(0, int(amount))
        if combo >= 3:
            amount = int(amount * (1 + min(combo, 10) * 0.1))
        self.state["xp"] = int(self.state.get("xp", 0)) + amount
        return amount

    def unlock(self, badge_id: str) -> Optional[Dict[str, str]]:
        if badge_id in BADGES and badge_id not in self.state["badges"]:
            self.state["badges"].append(badge_id)
            return BADGES[badge_id]
        return None
