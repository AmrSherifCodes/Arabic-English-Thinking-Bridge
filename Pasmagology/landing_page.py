"""
Pasmagology Landing Page Generator
----------------------------------
Generates the site hub: index.html
Ships two products only:
  1. جسر التفكير لتعلم اللغات مجانا
  2. بصمجولوجي — Pasmagology

Zero external requests. RTL. Navy + gold. Single self-contained HTML.
"""
import glob
import html as _html
import os
import re

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAMES_DIR = os.path.join(PROJECT_ROOT, "Pasmagology", "games")
THINKING_BRIDGE_CANDIDATES = [
    os.path.join(PROJECT_ROOT, "thinking_bridge.html"),
    os.path.join(PROJECT_ROOT, "Arabic-English-Thinking-Bridge", "thinking_bridge.html"),
]


def _find_thinking_bridge():
    for path in THINKING_BRIDGE_CANDIDATES:
        if os.path.isfile(path):
            return path
    return None


def _list_games():
    if not os.path.isdir(GAMES_DIR):
        return []
    files = sorted(glob.glob(os.path.join(GAMES_DIR, "*.html")))
    return [os.path.basename(f) for f in files]


def _slug_to_title(slug):
    name = os.path.splitext(slug)[0]
    name = name.replace("_", " ").replace("-", " ").strip()
    return name or slug


LANDING_TEMPLATE = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>جسر التفكير لتعلم اللغات مجانًا · The Thinking Bridge</title>
    <meta name="theme-color" content="#0B132B">
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%230B132B'/%3E%3Cpath d='M16 40c0-12 16-12 16-24M48 24c0 12-16 12-16 24' fill='none' stroke='%23FFD700' stroke-width='3'/%3E%3C/svg%3E">
    <style>
        :root {
            --bg-main: #0B132B;
            --bg-panel: #111C3D;
            --bg-panel-2: #1A284D;
            --accent-gold: #FFD700;
            --text-main: #FFFFFF;
            --text-muted: #A0B0D0;
            --border: #2A3B6D;
        }
        * { box-sizing: border-box; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
        body {
            margin: 0;
            background: linear-gradient(180deg, #0B132B 0%, #080D1F 100%);
            color: var(--text-main);
            line-height: 1.7;
            min-height: 100vh;
        }
        header.hero {
            text-align: center;
            padding: 4rem 1rem 2rem;
            border-bottom: 1px solid var(--border);
        }
        header.hero .logo {
            width: 72px;
            height: 72px;
            margin: 0 auto 1.5rem;
            display: block;
            border-radius: 16px;
        }
        header.hero h1 {
            margin: 0 0 0.5rem;
            font-size: clamp(1.8rem, 4vw, 2.6rem);
            color: var(--accent-gold);
            font-weight: 800;
        }
        header.hero .tagline-ar {
            color: var(--text-main);
            font-size: clamp(1rem, 2.2vw, 1.15rem);
            margin: 0 0 0.5rem;
        }
        header.hero .tagline-en {
            color: var(--text-muted);
            font-size: 0.95rem;
            direction: ltr;
            margin: 0;
            font-style: italic;
        }

        main.products {
            max-width: 1000px;
            margin: 0 auto;
            padding: 3rem 1rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.5rem;
        }

        .product-card {
            background: var(--bg-panel);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            transition: transform 0.2s, border-color 0.2s;
        }
        .product-card:hover {
            transform: translateY(-3px);
            border-color: var(--accent-gold);
        }
        .product-card .product-number {
            display: inline-block;
            background: var(--accent-gold);
            color: var(--bg-main);
            font-weight: bold;
            padding: 0.2rem 0.7rem;
            border-radius: 12px;
            font-size: 0.85rem;
            margin-bottom: 1rem;
            align-self: flex-start;
        }
        .product-card .product-icon {
            font-size: 3rem;
            line-height: 1;
            margin-bottom: 1rem;
        }
        .product-card h2 {
            margin: 0 0 0.3rem;
            color: var(--accent-gold);
            font-size: 1.4rem;
        }
        .product-card .product-en {
            direction: ltr;
            text-align: right;
            color: var(--text-muted);
            font-size: 0.95rem;
            margin: 0 0 1rem;
        }
        .product-card .product-desc {
            color: var(--text-muted);
            font-size: 0.98rem;
            margin: 0 0 1rem;
        }
        .product-card .product-desc-en {
            direction: ltr;
            text-align: left;
            color: #8090B0;
            font-size: 0.88rem;
            font-style: italic;
            margin: 0 0 1.5rem;
        }
        .product-card .product-status {
            display: inline-block;
            font-size: 0.85rem;
            font-weight: bold;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            margin-bottom: 1rem;
            align-self: flex-start;
        }
        .product-card .product-status.available {
            background: #4CAF50;
            color: #fff;
        }
        .product-card .product-status.soon {
            background: transparent;
            color: var(--text-muted);
            border: 1px dashed var(--border);
        }

        .game-list {
            list-style: none;
            padding: 0;
            margin: 0 0 1rem;
            max-height: 260px;
            overflow-y: auto;
        }
        .game-list li {
            margin: 0.4rem 0;
        }
        .game-list a {
            display: block;
            padding: 0.7rem 1rem;
            background: var(--bg-panel-2);
            color: var(--text-main);
            text-decoration: none;
            border-radius: 8px;
            border: 1px solid var(--border);
            font-size: 0.95rem;
            transition: border-color 0.2s, background 0.2s;
        }
        .game-list a:hover {
            border-color: var(--accent-gold);
            background: #1F2E55;
        }
        .game-list a::before {
            content: "🎮 ";
            margin-left: 0.3rem;
        }
        .game-list li.coming a {
            opacity: 0.55;
            cursor: default;
        }
        .game-list li.coming a::before {
            content: "⏳ ";
        }

        .btn-primary {
            display: inline-block;
            text-align: center;
            padding: 0.85rem 1.4rem;
            background: var(--accent-gold);
            color: var(--bg-main);
            text-decoration: none;
            font-weight: bold;
            border-radius: 10px;
            font-size: 1rem;
            margin-top: auto;
            transition: opacity 0.2s;
        }
        .btn-primary:hover { opacity: 0.9; }
        .btn-primary.disabled {
            background: transparent;
            color: var(--text-muted);
            border: 1px dashed var(--border);
            cursor: default;
            opacity: 0.7;
        }

        footer.site-footer {
            text-align: center;
            padding: 2.5rem 1rem;
            color: var(--text-muted);
            font-size: 0.85rem;
            border-top: 1px solid var(--border);
            margin-top: 2rem;
        }
        footer.site-footer .footer-brand {
            color: var(--accent-gold);
            font-weight: bold;
            font-size: 1rem;
            margin-bottom: 0.4rem;
        }
        footer.site-footer .footer-line { margin: 0.15rem 0; }

        @media (max-width: 500px) {
            header.hero { padding: 3rem 1rem 1.5rem; }
            .product-card { padding: 1.5rem; }
        }
    </style>
</head>
<body>

<header class="hero">
    <svg class="logo" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#111C3D"/>
        <path d="M16 40c0-12 16-12 16-24M48 24c0 12-16 12-16 24" fill="none" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
        <circle cx="32" cy="32" r="2.5" fill="#FFD700"/>
    </svg>
    <h1>جسر التفكير لتعلم اللغات مجانًا</h1>
    <p class="tagline-ar">تعلّم اللغة ببناء الفكرة — لا بحفظ الكلمة</p>
    <p class="tagline-en">The Thinking Bridge for Free Language Learning</p>
</header>

<main class="products">

    <!-- ═══════ PRODUCT 1: THINKING BRIDGE ═══════ -->
    <article class="product-card">
        <span class="product-number">المنتج الأول · #1</span>
        <div class="product-icon">🌉</div>
        <h2>جسر التفكير لتعلم اللغات مجانًا</h2>
        <p class="product-en">The Thinking Bridge for Free Language Learning</p>
        <p class="product-desc">
            منصة تعلّم اللغات بالتفكير — تربط بين المفاهيم في العربية والإنجليزية
            عشان تبني الفكرة بدل ما تحفظها، مجانًا وبدون إنترنت.
        </p>
        <p class="product-desc-en">
            A free, offline-first language-learning platform that builds thinking
            bridges between Arabic and English concepts — no memorization, no cloud.
        </p>
        {PRODUCT_1_STATUS}
        {PRODUCT_1_LINK}
    </article>

    <!-- ═══════ PRODUCT 2: PASMAGOLOGY ═══════ -->
    <article class="product-card">
        <span class="product-number">المنتج الثاني · #2</span>
        <div class="product-icon">🧪</div>
        <h2>بصمجولوجي</h2>
        <p class="product-en">Pasmagology</p>
        <p class="product-desc">
            حوّل أي ملف PDF إلى لعبة تعليمية تفاعلية تعمل بدون إنترنت — بطاقات،
            معادلات، ساحة معركة، وامتحان، بلهجة مصرية وبإعدادات مخصصة لكل شخص.
        </p>
        <p class="product-desc-en">
            Turn any PDF into an interactive offline learning game — cards, formulas,
            battle arena, and exams, Egyptian-Arabic-first and personalized per learner.
        </p>
        <span class="product-status available">✅ متاح الآن · Available now</span>
        {PRODUCT_2_GAMES}
        <a class="btn-primary" href="Pasmagology/games/" target="_blank" rel="noopener">📂 افتح مجلد الألعاب</a>
    </article>

</main>

<footer class="site-footer">
    <div class="footer-brand">جسر التفكير لتعلم اللغات مجانًا · The Thinking Bridge</div>
    <div class="footer-line">مشروع تعليمي مفتوح — يعمل 100% بدون إنترنت</div>
    <div class="footer-line" dir="ltr">Open educational project — 100% offline</div>
</footer>

</body>
</html>"""


def _build_product_1():
    bridge_path = _find_thinking_bridge()
    if bridge_path:
        rel = os.path.relpath(bridge_path, PROJECT_ROOT).replace("\\", "/")
        status = '<span class="product-status available">✅ متاح الآن · Available now</span>'
        link = f'<a class="btn-primary" href="{_html.escape(rel)}">🚀 ادخل جسر التفكير</a>'
    else:
        status = '<span class="product-status soon">⏳ قريبًا · Coming soon</span>'
        link = '<a class="btn-primary disabled">⏳ قريبًا</a>'
    return status, link


def _build_product_2_games():
    games = _list_games()
    if not games:
        return ('<ul class="game-list"><li class="coming"><a>لسه ما فيش ألعاب — شغّل '
                '<code>pasmagology.py</code> على PDF الأول</a></li></ul>')
    items = []
    for g in games:
        title = _slug_to_title(g)
        href = "Pasmagology/games/" + g
        items.append(f'<li><a href="{_html.escape(href)}" target="_blank" rel="noopener">'
                     f'{_html.escape(title)}</a></li>')
    return '<ul class="game-list">' + "".join(items) + "</ul>"


def build_landing() -> str:
    status1, link1 = _build_product_1()
    games2 = _build_product_2_games()
    return (LANDING_TEMPLATE
            .replace("{PRODUCT_1_STATUS}", status1)
            .replace("{PRODUCT_1_LINK}", link1)
            .replace("{PRODUCT_2_GAMES}", games2))


def main():
    try:
        html = build_landing()
        out_path = os.path.join(PROJECT_ROOT, "index.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)
        size_kb = len(html) // 1024
        print(f"✅ index.html generated ({size_kb} KB)")
        print(f"📄 {out_path}")
        games = _list_games()
        print(f"🎮 Pasmagology games linked: {len(games)}")
        if _find_thinking_bridge():
            print("🌉 Thinking Bridge: linked")
        else:
            print("🌉 Thinking Bridge: marked as 'coming soon' "
                  "(drop a thinking_bridge.html at the project root to link it)")
        print("📴 100% offline — open index.html in any browser")
        return 0
    except Exception as e:
        print(f"❌ Landing generation failed: {e}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
