(function () {
  try {
    var saved = localStorage.getItem('tb.theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'light' || (!saved && !prefersDark)) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    }
  } catch (e) {}

  setTimeout(function() {
    var root = document.getElementById('root');
    if (root && root.childElementCount <= 1) { // includes noscript
      var msg = document.createElement('div');
      msg.dir = 'rtl';
      msg.lang = 'ar';
      msg.style.cssText = 'padding:2rem;text-align:center;font-family:Cairo,sans-serif;color:#f9fafb;';
      msg.innerHTML = '<p>التطبيق مش بيفتح على جهازك. جرّب تقفله وتفتحه تاني.</p><p>لو المشكلة كملت، كلّم عمرو على واتساب: <a href="https://wa.me/201272718167" style="color:#0d9488;font-weight:bold">واتساب</a></p>';
      root.appendChild(msg);
    }
  }, 3000);
})();
