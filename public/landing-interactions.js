(function () {
  'use strict';
  var crYear = document.getElementById('cr-year');
  if (crYear) crYear.textContent = new Date().getFullYear();

  if (localStorage.getItem('tb.subscribed') === 'true') {
    var ee = document.getElementById('easter-egg');
    if (ee) ee.classList.add('active');
  }

  function toggleIosGuide() {
    var m = document.getElementById('ios-modal');
    if (m) m.classList.toggle('active');
  }

  function toggleLanguage() {
    var lang = document.documentElement.lang;
    if (lang === 'ar') {
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    } else {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    }
  }

  function handleSubscription(e) {
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
  }

  document.addEventListener('DOMContentLoaded', function() {
    var ua = (navigator.userAgent || '').toLowerCase();
    var isAndroidOrNative =
      /android/.test(ua) ||
      Boolean(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());

    if (isAndroidOrNative) {
      var iosModal = document.getElementById('ios-modal');
      if (iosModal && iosModal.parentNode) iosModal.parentNode.removeChild(iosModal);
      var iosButtons = document.querySelectorAll('.toggle-ios-guide');
      iosButtons.forEach(function(el) {
        el.style.display = 'none';
      });
    }

    var toggleLanguageBtn = document.getElementById('btn-toggle-language');
    if (toggleLanguageBtn) {
      toggleLanguageBtn.addEventListener('click', toggleLanguage);
    }

    if (!isAndroidOrNative) {
      var iosGuideTriggers = document.querySelectorAll('.toggle-ios-guide');
      iosGuideTriggers.forEach(function(el) {
        el.addEventListener('click', toggleIosGuide);
      });
    }

    var iosModalContent = document.getElementById('ios-modal-content');
    if (iosModalContent) {
      iosModalContent.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }

    var subscribeForm = document.getElementById('subscribe-form');
    if (subscribeForm) {
      subscribeForm.addEventListener('submit', handleSubscription);
    }
  });
})();
