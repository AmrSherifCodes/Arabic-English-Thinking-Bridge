(function () {
  try {
    var savedV1 = localStorage.getItem('tb.theme.v1');
    var savedLegacy = localStorage.getItem('tb.theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.remove('dark', 'light', 'theme-emerald', 'theme-sapphire');

    if (savedV1 === 'midnight-cyan' || savedV1 === 'noir-mono' || savedV1 === 'royal-emerald') {
      document.documentElement.setAttribute('data-theme', savedV1);
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else if (savedV1 === 'daylight-cyan' || !savedV1) {
      if (!savedV1 && (savedLegacy === 'dark' || savedLegacy === 'emerald' || savedLegacy === 'sapphire')) {
        document.documentElement.classList.add('dark');
        if (savedLegacy === 'emerald') document.documentElement.classList.add('theme-emerald');
        if (savedLegacy === 'sapphire') document.documentElement.classList.add('theme-sapphire');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.setAttribute('data-theme', 'daylight-cyan');
        document.documentElement.classList.add('light');
        document.documentElement.style.colorScheme = 'light';
        void prefersDark;
      }
    }
  } catch (e) {}

  setTimeout(function() {
    var root = document.getElementById('root');
    if (root && document.documentElement.dataset.appReady !== 'true') {
      var msg = document.createElement('div');
      msg.dir = 'rtl';
      msg.lang = 'ar';
      msg.style.cssText = 'padding:2rem;text-align:center;font-family:Cairo,sans-serif;color:#f9fafb;';
      var p1 = document.createElement('p');
      p1.textContent = 'التطبيق مش بيفتح على جهازك. جرّب تقفله وتفتحه تاني.';
      var p2 = document.createElement('p');
      p2.appendChild(document.createTextNode('لو المشكلة كملت، ابعتلنا على '));
      var link = document.createElement('a');
      link.href = 'https://github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/issues';
      link.style.cssText = 'color:#0d9488;font-weight:bold';
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
