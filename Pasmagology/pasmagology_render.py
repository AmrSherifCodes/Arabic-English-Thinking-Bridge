"""
Pasmagology Renderer
--------------------
Generates a self-contained HTML file from the validated game_json.
Includes: Step 0 fixes, PWA lock, and auto-personalization.
"""
import json
import logging

logger = logging.getLogger(__name__)

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pasmagology Game</title>
    <meta name="theme-color" content="#0B132B">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Pasmagology">
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%230B132B'/%3E%3Cpath d='M18 16h28v32l-14-6-14 6z' fill='none' stroke='%23FFD700' stroke-width='3'/%3E%3C/svg%3E">
    <link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%230B132B'/%3E%3Cpath d='M18 16h28v32l-14-6-14 6z' fill='none' stroke='%23FFD700' stroke-width='3'/%3E%3C/svg%3E">
    <style>
        :root {
            --bg-main: #0B132B; --bg-panel: #111C3D; --accent-gold: #FFD700;
            --text-main: #FFFFFF; --text-muted: #A0B0D0;
            --correct: #4CAF50; --wrong: #F44336;
        }
        * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
        body { margin: 0; background: var(--bg-main); color: var(--text-main); line-height: 1.6; }
        header { background: var(--bg-panel); padding: 1rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--accent-gold); gap: 0.5rem; flex-wrap: wrap; }
        h1 { margin: 0; font-size: 1.5rem; color: var(--accent-gold); }
        button { cursor: pointer; border: none; border-radius: 8px; font-size: 1rem; padding: 0.8rem 1.2rem; min-height: 44px; min-width: 44px; }
        .btn-primary { background: var(--accent-gold); color: var(--bg-main); font-weight: bold; }
        .btn-panel { background: var(--bg-panel); color: var(--text-main); border: 1px solid var(--accent-gold); }

        .tabs { display: flex; overflow-x: auto; padding: 0.5rem; gap: 0.5rem; background: var(--bg-panel); scrollbar-width: none; }
        .tab-btn { flex: 0 0 auto; background: transparent; color: var(--text-muted); border: 1px solid transparent; }
        .tab-btn.active { color: var(--accent-gold); border-bottom: 2px solid var(--accent-gold); }
        .tab-content { display: none; padding: 1rem; max-width: 800px; margin: 0 auto; }
        .tab-content.active { display: block; }

        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .flip-card { background: transparent; height: 250px; perspective: 1000px; cursor: pointer; }
        .flip-card-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; pointer-events: none; }
        .flip-card.flipped .flip-card-inner { transform: rotateY(180deg); }
        .flip-card-front, .flip-card-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 1rem; background: var(--bg-panel); border-radius: 12px; border: 1px solid #2A3B6D; overflow-y: auto; pointer-events: auto; }
        .flip-card-back { transform: rotateY(180deg); background: #1A284D; }
        .card-icon { font-size: 3rem; margin-bottom: 0.5rem; }

        .formula-card { background: var(--bg-panel); padding: 1rem; margin-bottom: 1rem; border-radius: 8px; border-left: 4px solid var(--accent-gold); }
        .formula-latex { font-family: monospace; font-size: 1.2rem; direction: ltr; text-align: left; background: #080D1F; padding: 0.5rem; border-radius: 4px; overflow-x: auto; color: #76E0FF; margin: 0.5rem 0; }

        .battle-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; }
        .battle-cell { background: var(--bg-panel); aspect-ratio: 1; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; font-weight: bold; color: var(--accent-gold); border-radius: 8px; cursor: pointer; text-align: center; padding: 0.2rem; word-break: break-word; }
        .battle-cell.used { background: #080D1F; color: var(--text-muted); cursor: not-allowed; }
        .battle-modal { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(11,19,43,0.95); z-index: 100; padding: 1rem; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
        .battle-modal.active { display: flex; }
        .battle-options { display: grid; grid-template-columns: 1fr; gap: 0.5rem; width: 100%; max-width: 400px; margin-top: 1rem; }
        .battle-opt-btn { background: var(--bg-panel); border: 2px solid #2A3B6D; }
        .battle-opt-btn.correct { background: var(--correct) !important; color: white !important; }
        .battle-opt-btn.wrong { background: var(--wrong) !important; color: white !important; }

        .exam-q { background: var(--bg-panel); padding: 1rem; margin-bottom: 1.5rem; border-radius: 8px; }
        .exam-options { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; }
        .exam-opt { display: flex; align-items: center; gap: 0.5rem; background: #1A284D; padding: 0.8rem; border-radius: 8px; cursor: pointer; }
        .exam-opt input { transform: scale(1.5); margin-left: 0.5rem; cursor: pointer; }
        .exam-feedback { margin-top: 0.5rem; font-weight: bold; display: none; padding: 0.5rem; border-radius: 4px; }

        /* ===== PERSONALIZATION ===== */
        .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(11,19,43,0.96); z-index: 300; justify-content: center; align-items: center; padding: 1rem; overflow-y: auto; }
        .modal-overlay.active { display: flex; }
        .modal-box { background: var(--bg-panel); border: 2px solid var(--accent-gold); border-radius: 16px; padding: 2rem; max-width: 500px; width: 100%; text-align: center; }
        .modal-box h2 { color: var(--accent-gold); margin-top: 0; }
        .modal-box p { color: var(--text-muted); }
        .modal-box label { display: block; text-align: right; margin: 1rem 0 0.5rem; color: var(--text-muted); }
        .modal-box input[type="text"], .modal-box input[type="number"] { width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #2A3B6D; background: #080D1F; color: var(--text-main); font-size: 1rem; direction: rtl; }
        .modal-box input[type="number"] { direction: ltr; text-align: center; }
        .modal-box .btn-primary { margin-top: 1.5rem; width: 100%; }
        .dict-question { background: #1A284D; padding: 1rem; border-radius: 8px; margin: 1rem 0; text-align: right; }
        .dict-question .dict-en { font-size: 1.5rem; color: var(--accent-gold); direction: ltr; text-align: center; margin-bottom: 1rem; font-family: monospace; }
        .dict-option { display: block; width: 100%; padding: 0.8rem; margin: 0.5rem 0; background: #080D1F; border: 2px solid #2A3B6D; border-radius: 8px; color: var(--text-main); cursor: pointer; text-align: right; font-size: 1rem; }
        .dict-option:hover { border-color: var(--accent-gold); }
        .dict-option.selected { background: var(--accent-gold); color: var(--bg-main); }
        .dict-option.correct { background: var(--correct); color: white; }
        .dict-option.wrong { background: var(--wrong); color: white; }
        .profile-badge { background: var(--accent-gold); color: var(--bg-main); padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 0.3rem; min-height: 36px; min-width: 36px; justify-content: center; }
        .profile-badge:hover { opacity: 0.9; }
        body.level-beginner .exam-feedback { font-size: 1.05rem; }
        body.level-beginner .exam-opt { padding: 1rem; }
        body.level-advanced #instant-feedback-label { opacity: 0.5; }

        footer#site-footer {
            text-align: center;
            padding: 1.5rem 1rem;
            margin-top: 2rem;
            color: var(--text-muted);
            font-size: 0.82rem;
            border-top: 1px solid #2A3B6D;
            background: var(--bg-main);
        }
        footer#site-footer .footer-brand {
            color: var(--accent-gold);
            font-weight: bold;
            font-size: 0.95rem;
            margin-bottom: 0.3rem;
        }
        footer#site-footer .footer-line { margin: 0.15rem 0; }

        @media print {
            body { background: white; color: black; }
            .tabs, header button, .profile-badge, .modal-overlay { display: none !important; }
            .tab-content { display: block !important; page-break-after: always; }
            .flip-card { height: auto; page-break-inside: avoid; border: 1px solid #ccc; margin-bottom: 1rem; }
            .flip-card-inner { transform: none !important; transition: none; display: block; pointer-events: auto; }
            .flip-card-front, .flip-card-back { position: relative; transform: none; background: white; color: black; border: none; padding: 0.5rem; }
            .formula-card, .exam-q { background: white; border: 1px solid #ccc; color: black; page-break-inside: avoid; }
            footer#site-footer { display: none; }
        }
        @media (max-width: 500px) { .battle-cell { font-size: 1rem; } .modal-box { padding: 1.2rem; } }
    </style>
</head>
<body>

<header>
    <h1 id="app-title">Pasmagology</h1>
    <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
        <button id="profile-badge" class="profile-badge" style="display:none;" onclick="reopenOnboarding()" title="تغيير التخصيص">
            <span id="profile-summary">👤</span>
        </button>
        <span id="score-display" style="color: var(--accent-gold); font-weight: bold;">0</span>
        <button id="install-btn" class="btn-primary" style="display:none" onclick="installApp()">📲 تثبيت التطبيق</button>
        <button class="btn-primary" onclick="window.print()">طباعة</button>
    </div>
</header>

<div class="tabs">
    <button class="tab-btn active" onclick="switchTab('study')">Study Vault</button>
    <button class="tab-btn" onclick="switchTab('formulas')">Formulas</button>
    <button class="tab-btn" onclick="switchTab('graphs')">Graphs/Flows</button>
    <button class="tab-btn" onclick="switchTab('battle')">Battle Arena</button>
    <button class="tab-btn" onclick="switchTab('exam')">Exam</button>
</div>

<div id="study" class="tab-content active">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h3 style="margin:0;">Study Vault</h3>
        <button class="btn-panel" id="retake-dict-btn" style="display:none;" onclick="startDictTest(true)">📚 إعادة اختبار القاموس</button>
    </div>
    <div class="cards-grid" id="cards-container"></div>
    <section id="glossary-section" style="display:none; margin-top:2rem;">
        <h3 style="color:var(--accent-gold); border-bottom:1px solid var(--accent-gold); padding-bottom:0.5rem;">المصطلحات الأساسية</h3>
        <table style="width:100%; border-collapse:collapse; background:var(--bg-panel); border-radius:8px; overflow:hidden;">
            <thead>
                <tr style="background:#1A284D; text-align:right;">
                    <th style="padding:1rem; border-bottom:1px solid #2A3B6D;">المصطلح بالإنجليزي</th>
                    <th style="padding:1rem; border-bottom:1px solid #2A3B6D;">المصطلح بالعربي</th>
                </tr>
            </thead>
            <tbody id="glossary-tbody"></tbody>
        </table>
    </section>
</div>
<div id="formulas" class="tab-content"><div id="formulas-container"></div></div>
<div id="graphs" class="tab-content"><div id="graphs-container" style="text-align:center; padding: 2rem;">لا توجد بيانات</div></div>

<div id="battle" class="tab-content">
    <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
        <h3>ساحة المعركة</h3>
        <button class="btn-panel" onclick="resetBattle()">إعادة التعيين</button>
    </div>
    <div class="battle-grid" id="battle-grid"></div>
</div>

<div id="exam" class="tab-content">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <label id="instant-feedback-label"><input type="checkbox" id="instant-feedback" checked> تقييم فوري</label>
        <button class="btn-primary" onclick="scoreExam()">إنهاء وتسليم</button>
    </div>
    <div id="exam-result-banner" class="exam-result" style="display:none; background:var(--bg-panel); padding:1rem; border-radius:8px; border:2px solid var(--accent-gold); margin-bottom:1rem; text-align:center; font-size:1.2rem; font-weight:bold;"></div>
    <div id="exam-container"></div>
</div>

<div class="battle-modal" id="battle-modal">
    <h2 id="battle-q-text" style="margin-bottom:1rem;"></h2>
    <div class="battle-options" id="battle-options"></div>
    <p id="battle-explanation" style="margin-top:1rem; display:none; color:var(--accent-gold);"></p>
    <button class="btn-primary" style="margin-top:2rem;" onclick="closeBattleModal()">إغلاق</button>
</div>

<div id="onboarding-modal" class="modal-overlay">
    <div class="modal-box">
        <h2>👋 أهلاً بك في باسمالوجي</h2>
        <p>علشان نخصصلك المحتوى، محتاجين نعرف حاجتين:</p>
        <label for="onboard-name">اسمك (اختياري)</label>
        <input type="text" id="onboard-name" placeholder="اكتب اسمك هنا" maxlength="30">
        <label for="onboard-age">كام سنة؟</label>
        <input type="number" id="onboard-age" min="5" max="99" placeholder="مثلاً: 14">
        <button class="btn-primary" id="onboard-start-btn" onclick="submitOnboarding()">ابدأ</button>
    </div>
</div>

<div id="dict-test-modal" class="modal-overlay">
    <div class="modal-box">
        <h2>📚 اختبار سريع للقاموس</h2>
        <p id="dict-progress-text">هنسألك 3 أسئلة عشان نعرف مستواك</p>
        <div id="dict-question-container"></div>
        <button class="btn-primary" id="dict-next-btn" onclick="submitDictAnswer()" disabled>التالي</button>
        <button class="btn-panel" style="margin-top:0.5rem; width:100%;" onclick="skipDictTest()">تخطي</button>
    </div>
</div>

<script>
    const GAME_DATA = /*__GAME_JSON__*/ {};
    let score = 0;

    let audioCtx = null;
    function playBeep(isCorrect) {
        try {
            if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if(audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = isCorrect ? 'sine' : 'sawtooth';
            osc.frequency.setValueAtTime(isCorrect ? 800 : 300, audioCtx.currentTime);
            if(isCorrect) osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
            else osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
            osc.start(); osc.stop(audioCtx.currentTime + 0.2);
        } catch(e) {}
    }

    function switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        const btn = document.querySelector(`button[onclick="switchTab('${tabId}')"]`);
        if (btn) btn.classList.add('active');
    }

    function saveProgress() {
        try {
            const progress = { score, usedBattle: Array.from(document.querySelectorAll('.battle-cell.used')).map(el => el.dataset.idx) };
            if(window.examScore !== undefined && window.examTotal !== undefined) {
                progress.examScore = window.examScore; progress.examTotal = window.examTotal;
            }
            if(GAME_DATA.exam) {
                GAME_DATA.exam.forEach((q, qIdx) => {
                    const selected = document.querySelector(`input[name="exam_${qIdx}"]:checked`);
                    if(selected) progress[`exam_sel_${qIdx}`] = parseInt(selected.value);
                });
            }
            localStorage.setItem('pasmagology_progress_' + (GAME_DATA.meta?.title || 'game'), JSON.stringify(progress));
        } catch(e) {}
    }

    function loadProgress() {
        try {
            const saved = localStorage.getItem('pasmagology_progress_' + (GAME_DATA.meta?.title || 'game'));
            if(saved) {
                const progress = JSON.parse(saved);
                score = progress.score || 0;
                document.getElementById('score-display').innerText = score;
                if(progress.usedBattle) {
                    progress.usedBattle.forEach(idx => {
                        const cell = document.querySelector(`.battle-cell[data-idx="${idx}"]`);
                        if(cell) cell.classList.add('used');
                    });
                }
                if(progress.examScore !== undefined) {
                    window.examScore = progress.examScore; window.examTotal = progress.examTotal;
                    const banner = document.getElementById('exam-result-banner');
                    banner.innerHTML = `نتيجتك: ${window.examScore} من ${window.examTotal} ⭐`;
                    banner.style.display = 'block';
                }
                if(GAME_DATA.exam) {
                    GAME_DATA.exam.forEach((q, qIdx) => {
                        const sel = progress[`exam_sel_${qIdx}`];
                        if(sel !== undefined) {
                            const radio = document.querySelector(`input[name="exam_${qIdx}"][value="${sel}"]`);
                            if(radio) radio.checked = true;
                        }
                    });
                }
            }
        } catch(e) {}
    }

    function renderApp() {
        if(GAME_DATA.meta && GAME_DATA.meta.title) {
            document.getElementById('app-title').innerText = GAME_DATA.meta.title;
            document.title = GAME_DATA.meta.title;
        }

        const cardsCont = document.getElementById('cards-container');
        if(GAME_DATA.cards) {
            GAME_DATA.cards.forEach(card => {
                const el = document.createElement('div');
                el.className = 'flip-card';
                el.onclick = () => el.classList.toggle('flipped');
                el.ontouchstart = () => el.classList.toggle('flipped');
                el.innerHTML = `
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <div class="card-icon">${card.icon || '📚'}</div>
                            <h3>${card.title_ar || ''}</h3>
                            <small>${card.title_en || ''}</small>
                        </div>
                        <div class="flip-card-back">
                            <p>${card.body_ar || ''}</p>
                            <p dir="ltr" style="color:var(--accent-gold)">${card.body_en || ''}</p>
                            ${card.exam_hack ? `<small style="background:#080D1F;padding:0.2rem;border-radius:4px;">Hack: ${card.exam_hack}</small>` : ''}
                        </div>
                    </div>`;
                cardsCont.appendChild(el);
            });
        }

        if(GAME_DATA.glossary && GAME_DATA.glossary.length > 0) {
            const glosSection = document.getElementById('glossary-section');
            const glosTbody = document.getElementById('glossary-tbody');
            glosSection.style.display = 'block';
            GAME_DATA.glossary.forEach(g => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #2A3B6D';
                tr.innerHTML = `
                    <td style="padding:1rem; direction:ltr; text-align:left;">
                        <strong>${g.en || ''}</strong>
                        ${g.category ? `<br><small style="background:var(--accent-gold); color:var(--bg-main); padding:0.1rem 0.4rem; border-radius:4px; font-size:0.75rem; font-weight:bold;">${g.category}</small>` : ''}
                    </td>
                    <td style="padding:1rem;">${g.ar || ''}</td>`;
                glosTbody.appendChild(tr);
            });
        }

        const formCont = document.getElementById('formulas-container');
        if(GAME_DATA.formulas) {
            GAME_DATA.formulas.forEach(form => {
                const el = document.createElement('div');
                el.className = 'formula-card';
                el.innerHTML = `<div class="formula-latex">${form.latex || form.plain || ''}</div><p>${form.meaning_ar || ''}</p>`;
                formCont.appendChild(el);
            });
        }

        if(GAME_DATA.graphs && GAME_DATA.graphs.length > 0) {
            document.getElementById('graphs-container').innerHTML = GAME_DATA.graphs.map(g => `<p>${JSON.stringify(g)}</p>`).join('');
        }

        const battleCont = document.getElementById('battle-grid');
        if(GAME_DATA.battle) {
            for(let idx = 0; idx < 25; idx++) {
                const b = GAME_DATA.battle[idx];
                const cell = document.createElement('div');
                cell.className = 'battle-cell';
                cell.dataset.idx = idx;
                if (b) { cell.innerText = b.points || 100; cell.onclick = () => openBattle(idx, cell); }
                else { cell.classList.add('used'); cell.innerText = '-'; }
                battleCont.appendChild(cell);
            }
        }

        const examCont = document.getElementById('exam-container');
        if(GAME_DATA.exam) {
            GAME_DATA.exam.forEach((q, qIdx) => {
                const el = document.createElement('div');
                el.className = 'exam-q';
                el.id = 'exam-q-' + qIdx;
                let optsHtml = (q.options || []).map((opt, oIdx) => `
                    <label class="exam-opt">
                        <input type="radio" name="exam_${qIdx}" value="${oIdx}">
                        ${opt}
                    </label>`).join('');
                el.innerHTML = `<h4>${q.question_ar || ''}</h4><div class="exam-options">${optsHtml}</div><div class="exam-feedback" id="exam-feedback-${qIdx}"></div>`;
                examCont.appendChild(el);
            });
        }

        loadProgress();

        document.getElementById('exam-container').addEventListener('change', (e) => {
            saveProgress();
            if(document.getElementById('instant-feedback').checked && e.target.type === 'radio') {
                const qIdx = parseInt(e.target.name.split('_')[1]);
                const oIdx = parseInt(e.target.value);
                const q = GAME_DATA.exam[qIdx];
                const isCorrect = oIdx === q.correct;
                playBeep(isCorrect);
                const feedbackEl = document.getElementById(`exam-feedback-${qIdx}`);
                feedbackEl.style.display = 'block';
                feedbackEl.style.background = isCorrect ? 'var(--correct)' : 'var(--wrong)';
                feedbackEl.innerText = (isCorrect ? "إجابة صحيحة! " : "خطأ! ") + (q.explanation_ar || '');
            }
        });

        initPersonalization();
    }

    let currentBattleCell = null;
    function openBattle(idx, cellEl) {
        if(cellEl.classList.contains('used')) return;
        const b = GAME_DATA.battle[idx];
        if(!b) return;
        currentBattleCell = cellEl;
        document.getElementById('battle-q-text').innerText = b.question_ar || '';
        document.getElementById('battle-explanation').style.display = 'none';
        const optsCont = document.getElementById('battle-options');
        optsCont.innerHTML = '';
        (b.options || []).forEach((opt, oIdx) => {
            const btn = document.createElement('button');
            btn.className = 'battle-opt-btn btn-panel';
            btn.innerText = opt;
            btn.onclick = () => handleBattleAnswer(idx, oIdx, btn);
            optsCont.appendChild(btn);
        });
        document.getElementById('battle-modal').classList.add('active');
    }

    function handleBattleAnswer(qIdx, oIdx, btnEl) {
        const b = GAME_DATA.battle[qIdx];
        const isCorrect = oIdx === b.correct;
        playBeep(isCorrect);
        const btns = document.getElementById('battle-options').children;
        for(let i=0; i<btns.length; i++) {
            btns[i].disabled = true;
            if(i === b.correct) btns[i].classList.add('correct');
            else if(i === oIdx && !isCorrect) btns[i].classList.add('wrong');
        }
        if(isCorrect) { score += (b.points || 100); document.getElementById('score-display').innerText = score; }
        const exp = document.getElementById('battle-explanation');
        exp.style.display = 'block';
        exp.innerText = (isCorrect ? "صحيح! " : "خطأ! ") + (b.explanation_ar || '');
        if(currentBattleCell) currentBattleCell.classList.add('used');
        saveProgress();
    }

    function closeBattleModal() { document.getElementById('battle-modal').classList.remove('active'); }

    function resetBattle() {
        if(confirm('هل أنت متأكد من إعادة تعيين ساحة المعركة؟')) {
            score = 0;
            document.getElementById('score-display').innerText = score;
            document.querySelectorAll('.battle-cell').forEach(el => el.classList.remove('used'));
            localStorage.removeItem('pasmagology_progress_' + (GAME_DATA.meta?.title || 'game'));
            if(GAME_DATA.battle) {
                for(let idx = GAME_DATA.battle.length; idx < 25; idx++) {
                    const cell = document.querySelector(`.battle-cell[data-idx="${idx}"]`);
                    if(cell) cell.classList.add('used');
                }
            }
        }
    }

    function scoreExam() {
        if(!GAME_DATA.exam) return;
        let total = 0, correctCount = 0;
        GAME_DATA.exam.forEach((q, qIdx) => {
            const qEl = document.getElementById('exam-q-' + qIdx);
            if (qEl && qEl.style.display === 'none') return;
            total++;
            const selected = document.querySelector(`input[name="exam_${qIdx}"]:checked`);
            const feedbackEl = document.getElementById(`exam-feedback-${qIdx}`);
            feedbackEl.style.display = 'block';
            if(selected && parseInt(selected.value) === q.correct) {
                correctCount++;
                feedbackEl.style.background = 'var(--correct)';
                feedbackEl.innerText = "صحيح. " + (q.explanation_ar || '');
            } else {
                feedbackEl.style.background = 'var(--wrong)';
                feedbackEl.innerText = "خطأ. الإجابة الصحيحة هي: " + (q.options[q.correct] || '') + " - " + (q.explanation_ar || '');
            }
        });
        window.examScore = correctCount; window.examTotal = total;
        const banner = document.getElementById('exam-result-banner');
        banner.innerHTML = `نتيجتك: ${window.examScore} من ${window.examTotal} ⭐`;
        banner.style.display = 'block';
        saveProgress();
        playBeep(correctCount > total/2);
    }

    // ===== PERSONALIZATION =====
    const PROFILE_KEY = 'pasmagology_profile_' + (GAME_DATA.meta?.title || 'game');
    let currentProfile = null;
    let pendingAge = null, pendingName = null;
    let dictState = { questions: [], current: 0, correct: 0, selectedIdx: null };

    function loadProfile() {
        try { const raw = localStorage.getItem(PROFILE_KEY); return raw ? JSON.parse(raw) : null; } catch(e) { return null; }
    }
    function saveProfile(profile) { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch(e) {} }
    function ageToLevel(age) {
        if (!age || isNaN(age)) return 'intermediate';
        if (age < 10) return 'beginner';
        if (age < 15) return 'intermediate';
        return 'advanced';
    }
    function levelLabel(level) {
        return level === 'beginner' ? 'مبتدئ' : level === 'advanced' ? 'متقدم' : 'متوسط';
    }

    function applyPersonalization(profile) {
        currentProfile = profile;
        if (!profile) return;
        const badge = document.getElementById('profile-badge');
        const summary = document.getElementById('profile-summary');
        if (badge && summary) {
            const name = profile.name ? profile.name : 'ضيف';
            summary.innerText = `👤 ${name} • ${profile.age} سنة • ${levelLabel(profile.level)}`;
            badge.style.display = 'inline-flex';
        }
        document.body.classList.remove('level-beginner', 'level-intermediate', 'level-advanced');
        document.body.classList.add('level-' + (profile.level || 'intermediate'));
        const instantCb = document.getElementById('instant-feedback');
        if (instantCb) instantCb.checked = profile.level !== 'advanced';
        applyExamAgeFilter(profile.age);
        const retake = document.getElementById('retake-dict-btn');
        if (retake) retake.style.display = (GAME_DATA.glossary && GAME_DATA.glossary.length >= 2) ? 'inline-block' : 'none';
    }

    function applyExamAgeFilter(age) {
        if (!GAME_DATA.exam) return;
        const hideHard = age && age < 12;
        GAME_DATA.exam.forEach((q, qIdx) => {
            const el = document.getElementById('exam-q-' + qIdx);
            if (!el) return;
            el.style.display = (hideHard && q.difficulty === 'hard') ? 'none' : 'block';
        });
    }

    function initPersonalization() {
        const profile = loadProfile();
        if (profile) applyPersonalization(profile);
        else document.getElementById('onboarding-modal').classList.add('active');
    }

    function submitOnboarding() {
        const ageInput = document.getElementById('onboard-age');
        const nameInput = document.getElementById('onboard-name');
        const age = parseInt(ageInput.value, 10);
        const name = (nameInput.value || '').trim();
        if (!age || age < 5 || age > 99) { ageInput.style.borderColor = 'var(--wrong)'; ageInput.focus(); return; }
        ageInput.style.borderColor = '#2A3B6D';
        pendingAge = age; pendingName = name;
        document.getElementById('onboarding-modal').classList.remove('active');
        if (GAME_DATA.glossary && GAME_DATA.glossary.length >= 2) startDictTest(false);
        else finalizeProfile(ageToLevel(age));
    }

    function startDictTest(isRetake) {
        const glossary = GAME_DATA.glossary || [];
        if (glossary.length < 2) {
            const profile = loadProfile() || { age: pendingAge || 12, name: pendingName || '' };
            finalizeProfile(ageToLevel(profile.age));
            return;
        }
        if (isRetake) {
            const existing = loadProfile();
            pendingAge = existing ? existing.age : 12;
            pendingName = existing ? existing.name : '';
        }
        const shuffled = [...glossary].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(3, shuffled.length));
        const questions = selected.map(item => {
            const distractors = glossary.filter(g => g.ar !== item.ar).sort(() => Math.random() - 0.5).slice(0, 3).map(g => g.ar);
            const options = [item.ar, ...distractors].sort(() => Math.random() - 0.5);
            return { en: item.en, correctAr: item.ar, options, correctIdx: options.indexOf(item.ar) };
        });
        dictState = { questions, current: 0, correct: 0, selectedIdx: null };
        document.getElementById('dict-test-modal').classList.add('active');
        renderDictQuestion();
    }

    function renderDictQuestion() {
        const q = dictState.questions[dictState.current];
        if (!q) return;
        document.getElementById('dict-progress-text').innerText = `السؤال ${dictState.current + 1} من ${dictState.questions.length}`;
        const container = document.getElementById('dict-question-container');
        const optsHtml = q.options.map((opt, idx) => `<button class="dict-option" data-idx="${idx}" onclick="selectDictOption(${idx})">${opt}</button>`).join('');
        container.innerHTML = `
            <div class="dict-question">
                <div class="dict-en">${q.en || ''}</div>
                <p style="text-align:center; color:var(--text-muted); margin:0 0 0.5rem;">إيه معنى الكلمة دي بالعربي؟</p>
                ${optsHtml}
            </div>`;
        const nextBtn = document.getElementById('dict-next-btn');
        nextBtn.disabled = true;
        nextBtn.innerText = dictState.current === dictState.questions.length - 1 ? 'خلص' : 'التالي';
        dictState.selectedIdx = null;
    }

    function selectDictOption(idx) {
        dictState.selectedIdx = idx;
        document.querySelectorAll('.dict-option').forEach((el, i) => el.classList.toggle('selected', i === idx));
        document.getElementById('dict-next-btn').disabled = false;
    }

    function submitDictAnswer() {
        const q = dictState.questions[dictState.current];
        if (!q || dictState.selectedIdx === null) return;
        const isCorrect = dictState.selectedIdx === q.correctIdx;
        if (isCorrect) dictState.correct++;
        playBeep(isCorrect);
        document.querySelectorAll('.dict-option').forEach((el, i) => {
            if (i === q.correctIdx) el.classList.add('correct');
            else if (i === dictState.selectedIdx) el.classList.add('wrong');
            el.disabled = true;
        });
        document.getElementById('dict-next-btn').disabled = true;
        setTimeout(() => {
            dictState.current++;
            if (dictState.current < dictState.questions.length) renderDictQuestion();
            else {
                const scoreRatio = dictState.correct / dictState.questions.length;
                let level = scoreRatio >= 0.9 ? 'advanced' : scoreRatio >= 0.5 ? 'intermediate' : 'beginner';
                document.getElementById('dict-test-modal').classList.remove('active');
                finalizeProfile(level);
            }
        }, 1200);
    }

    function skipDictTest() {
        document.getElementById('dict-test-modal').classList.remove('active');
        finalizeProfile(ageToLevel(pendingAge || 12));
    }

    function finalizeProfile(level) {
        const profile = { name: pendingName || '', age: pendingAge || 12, level, completedOnboarding: true };
        saveProfile(profile);
        applyPersonalization(profile);
    }

    function reopenOnboarding() {
        const profile = loadProfile();
        if (profile) {
            document.getElementById('onboard-name').value = profile.name || '';
            document.getElementById('onboard-age').value = profile.age || '';
        }
        document.getElementById('onboarding-modal').classList.add('active');
    }

    // ===== PWA LOCK — 0 external requests; manifest + SW via Blob URL only. =====
    try {
        const iconSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%230B132B'/%3E%3Cpath d='M18 16h28v32l-14-6-14 6z' fill='none' stroke='%23FFD700' stroke-width='3'/%3E%3C/svg%3E";
        const manifest = {
            name: "Pasmagology", short_name: "Pasmagology",
            theme_color: "#0B132B", background_color: "#0B132B",
            display: "standalone", start_url: ".",
            icons: [{ src: iconSvg, sizes: "512x512", type: "image/svg+xml" }]
        };
        const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        document.head.appendChild(Object.assign(document.createElement("link"), { rel: "manifest", href: url }));
        if ("serviceWorker" in navigator) {
            const swCode = `self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('fetch',e=>{});`;
            const swUrl = URL.createObjectURL(new Blob([swCode], { type: "text/javascript" }));
            navigator.serviceWorker.register(swUrl).catch(() => {});
        }
        let deferredPrompt = null;
        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault(); deferredPrompt = e;
            document.getElementById("install-btn").style.display = "inline-block";
        });
        window.installApp = function () {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => {
                deferredPrompt = null;
                document.getElementById("install-btn").style.display = "none";
            });
        };
        if (window.matchMedia("(display-mode: standalone)").matches) {
            document.getElementById("install-btn").style.display = "none";
        }
    } catch (e) {}

    window.onload = renderApp;
</script>
<footer id="site-footer">
    <div class="footer-brand">بصمجولوجي · Pasmagology</div>
    <div class="footer-line">المنتج الثاني من مشروع «جسر التفكير لتعلم اللغات مجانًا»</div>
    <div class="footer-line" dir="ltr">Product #2 of “The Thinking Bridge for Free Language Learning”</div>
</footer>
</body>
</html>"""


def render_html(game_json: dict) -> str:
    """
    Renders the given game_json strictly into a single HTML string containing
    all CSS, JS, and HTML without any external resources.
    """
    try:
        json_str = json.dumps(game_json, ensure_ascii=False).replace('</', '<\\/')
        html = HTML_TEMPLATE.replace('/*__GAME_JSON__*/ {}', json_str)
        if len(html) > 200 * 1024:
            print(f"WARNING: HTML > 200KB ({len(html)//1024} KB)")
        return html
    except Exception as e:
        logger.error(f"Error rendering HTML: {e}")
        return f"<html><body dir='rtl'><h1>خطأ في العرض</h1><p>{str(e)}</p></body></html>"


if __name__ == "__main__":
    dummy_game = {
        "meta": {"title": "دورة الكيمياء التجريبية", "age_band": "High School", "language": "Arabic", "source_pages": 5},
        "glossary": [
            {"en": "Atom", "ar": "ذرة", "category": "General"},
            {"en": "Molecule", "ar": "جزيء", "category": "General"},
            {"en": "Compound", "ar": "مركب", "category": "General"},
            {"en": "Reaction", "ar": "تفاعل", "category": "General"}
        ],
        "cards": [
            {"icon": "🧪", "title_en": "H2O", "title_ar": "الماء", "body_ar": "سائل الحياة", "body_en": "Water is life", "source_page": 1, "exam_hack": "Always neutral"},
            {"icon": "🔥", "title_en": "Fire", "title_ar": "النار", "body_ar": "تفاعل احتراق", "body_en": "Combustion", "source_page": 2, "exam_hack": "Needs oxygen"}
        ],
        "formulas": [
            {"latex": "E = mc^2", "plain": "E = mc^2", "meaning_ar": "تكافؤ الكتلة والطاقة", "source_page": 1}
        ],
        "battle": [], "exam": []
    }
    for i in range(25):
        dummy_game["battle"].append({
            "category": f"Cat {i%5}", "points": ((i//5)+1)*100,
            "question_ar": f"سؤال التحدي {i+1}",
            "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
            "correct": i % 4, "explanation_ar": f"شرح {i+1}"
        })
    for i in range(10):
        dummy_game["exam"].append({
            "question_ar": f"السؤال {i+1}",
            "options": ["أ", "ب", "ج", "د"],
            "correct": 0, "explanation_ar": f"الشرح {i+1}",
            "difficulty": "hard" if i % 3 == 2 else "easy",
            "source_page": 1
        })
    out_html = render_html(dummy_game)
    with open("test_render.html", "w", encoding="utf-8") as f:
        f.write(out_html)
    print("test_render.html generated successfully.")
