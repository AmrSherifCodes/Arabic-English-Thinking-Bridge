(function () {
  'use strict';
  var crYear = document.getElementById('cr-year');
  if (crYear) crYear.textContent = new Date().getFullYear();
  if (localStorage.getItem('tb.subscribed') === 'true') {
    var ee = document.getElementById('easter-egg');
    if (ee) ee.classList.add('active');
  }
  window.toggleIosGuide = function () {
    var m = document.getElementById('ios-modal');
    if (m) m.classList.toggle('active');
  };
  window.toggleLanguage = function () {
    var lang = document.documentElement.lang;
    if (lang === 'ar') {
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    } else {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    }
  };
  window.handleSubscription = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    var el = document.getElementById('sub-email');
    if (!el) return;
    var email = el.value.trim();
    if (!email) return;
    localStorage.setItem('tb.subscribed', 'true');
    var ee2 = document.getElementById('easter-egg');
    if (ee2) ee2.classList.add('active');
    var url = 'mailto:amrsherifwork@gmail.com?subject=' +
      encodeURIComponent('Thinking Bridge Subscription') +
      '&body=' + encodeURIComponent('Please subscribe: ' + email);
    window.location.href = url;
  };
})();
