(function () {
  try {
    var savedV10 = localStorage.getItem('tb.theme.v10');
    var savedLegacy = localStorage.getItem('tb.theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    void savedLegacy;
    void prefersDark;
    var theme = savedV10 === 'amoled-obsidian' ? 'amoled-obsidian' : 'midnight-navy';
    document.documentElement.classList.remove('light', 'theme-emerald', 'theme-sapphire');
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = 'dark';

    var uiMode = localStorage.getItem('tb.uiMode');
    if (uiMode === 'easy' || uiMode === 'standard' || uiMode === 'pro') {
      document.documentElement.setAttribute('data-ui-mode', uiMode);
    }
  } catch (e) {}

  setTimeout(function() {
    var root = document.getElementById('root');
    if (root && document.documentElement.dataset.appReady !== 'true') {
      var msg = document.createElement('div');
      msg.dir = 'rtl';
      msg.lang = 'ar';
      msg.style.cssText = 'padding:2rem;text-align:center;font-family:Readex Pro,sans-serif;color:#F8FAFC;background:#0B1120;';
      var p1 = document.createElement('p');
      p1.textContent = 'التطبيق مش بيفتح على جهازك. جرّب تقفله وتفتحه تاني.';
      var p2 = document.createElement('p');
      p2.appendChild(document.createTextNode('لو المشكلة كملت، ابعتلنا على '));
      var link = document.createElement('a');
      link.href = 'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/issues';
      link.style.cssText = 'color:#10B981;font-weight:bold';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'الدعم الفني على GitHub';
      p2.appendChild(link);
      msg.appendChild(p1);
      msg.appendChild(p2);
      root.appendChild(msg);
    }
  }, 3000);
})();
