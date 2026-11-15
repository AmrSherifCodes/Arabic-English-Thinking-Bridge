// Copyright Year
var crYearEl = document.getElementById('cr-year');
if (crYearEl) crYearEl.textContent = new Date().getFullYear();

// Check existing subscription status
if (localStorage.getItem('tb.subscribed') === 'true') {
  var ee = document.getElementById('easter-egg');
  if (ee) ee.classList.add('active');
}

// Handle Subscription Form
function handleSubscription(e) {
  e.preventDefault();
  var emailEl = document.getElementById('sub-email');
  var email = emailEl ? emailEl.value.trim() : '';
  if (!email) return;

  localStorage.setItem('tb.subscribed', 'true');
  var ee = document.getElementById('easter-egg');
  if (ee) ee.classList.add('active');

  // Mailto trigger for privacy-first email dispatch
  var mailtoUrl = 'mailto:amrsherifwork@gmail.com?subject=' + encodeURIComponent('Thinking Bridge Subscription') + '&body=' + encodeURIComponent('Please subscribe: ' + email);
  window.location.href = mailtoUrl;
}

// Toggle iOS Guide Modal
function toggleIosGuide() {
  var modal = document.getElementById('ios-modal');
  if (modal) modal.classList.toggle('active');
}

// Language Switcher placeholder
function toggleLanguage() {
  var currentLang = document.documentElement.lang;
  if (currentLang === 'ar') {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  } else {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
  }
}
