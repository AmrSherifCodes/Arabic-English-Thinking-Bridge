(function () {
  try {
    var saved = localStorage.getItem('tb.theme') || 'dark';
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.remove('dark', 'light', 'theme-emerald', 'theme-sapphire');

    if (saved === 'light' || (!saved && !prefersDark)) {
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    } else if (saved === 'emerald') {
      document.documentElement.classList.add('dark', 'theme-emerald');
      document.documentElement.style.colorScheme = 'dark';
    } else if (saved === 'sapphire') {
      document.documentElement.classList.add('dark', 'theme-sapphire');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
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
