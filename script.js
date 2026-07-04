/**
 * ══════════════════════════════════════════════════════════════════
 * SK AUTH — Secure Authentication Experience
 * script.js | Vanilla JS, fully modular, no inline HTML JS.
 *
 * MODULES:
 *  1. Theme Toggle
 *  2. Auth Tab Switcher
 *  3. Password Show/Hide
 *  4. Caps Lock Detection
 *  5. Validation Helpers
 *  6. Real-time Field Validation
 *  7. Password Strength Meter
 *  8. Confirm Password Match
 *  9. Progress Ring
 * 10. Country Code Picker
 * 11. Toast Notification System
 * 12. Confetti Particle Burst
 * 13. Feature Carousel (Decorative Panel)
 * 14. Form Submission Handlers
 * 15. Keyboard / Accessibility Enhancements
 * 16. Init
 * ══════════════════════════════════════════════════════════════════
 */

'use strict';

/* ────────────────────────────────────────────────────────────────
   1. THEME TOGGLE
──────────────────────────────────────────────────────────────── */
const ThemeModule = (() => {
  const STORAGE_KEY = 'dusk-orchard-theme';
  const htmlEl   = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');
  const toggleIcon= document.getElementById('toggle-icon');

  /** Apply the saved or preferred theme on load */
  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    apply(saved || preferred);
    toggleBtn.addEventListener('click', toggle);
  }

  function toggle() {
    const current = htmlEl.getAttribute('data-theme');
    apply(current === 'dark' ? 'light' : 'dark');
  }

  function apply(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    // Animate icon morph
    toggleIcon.style.transform = 'rotate(360deg) scale(0)';
    setTimeout(() => {
      toggleIcon.textContent = theme === 'dark' ? '☽' : '☀';
      toggleIcon.style.transform = 'rotate(0deg) scale(1)';
    }, 150);
  }

  return { init };
})();


/* ────────────────────────────────────────────────────────────────
   2. AUTH TAB SWITCHER
──────────────────────────────────────────────────────────────── */
const TabModule = (() => {
  const tabLogin     = document.getElementById('tab-login');
  const tabRegister  = document.getElementById('tab-register');
  const panelLogin   = document.getElementById('panel-login');
  const panelRegister= document.getElementById('panel-register');
  const indicator    = document.getElementById('tab-indicator');

  // Inline-switch links inside panels
  const switchToReg  = document.getElementById('switch-to-register');
  const switchToLog  = document.getElementById('switch-to-login');

  function init() {
    // Measure tab widths after paint for indicator
    requestAnimationFrame(setIndicator);

    tabLogin.addEventListener('click',    () => activate('login'));
    tabRegister.addEventListener('click', () => activate('register'));

    // Keyboard: arrow key navigation within tablist
    [tabLogin, tabRegister].forEach(tab => {
      tab.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { tabRegister.focus(); activate('register'); }
        if (e.key === 'ArrowLeft')  { tabLogin.focus();    activate('login'); }
      });
    });

    switchToReg?.addEventListener('click', e => { e.preventDefault(); activate('register'); });
    switchToLog?.addEventListener('click', e => { e.preventDefault(); activate('login'); });
  }

  function activate(which) {
    const isLogin = which === 'login';

    // Tab ARIA
    tabLogin.classList.toggle('active', isLogin);
    tabRegister.classList.toggle('active', !isLogin);
    tabLogin.setAttribute('aria-selected', String(isLogin));
    tabRegister.setAttribute('aria-selected', String(!isLogin));
    tabLogin.tabIndex    = isLogin ? 0 : -1;
    tabRegister.tabIndex = isLogin ? -1 : 0;

    // Panels
    if (isLogin) {
      panelLogin.hidden   = false;
      panelRegister.hidden = true;
      panelLogin.style.animation = 'none';
      requestAnimationFrame(() => {
        panelLogin.style.animation = 'fadeSlideInLeft 0.35s ease';
      });
    } else {
      panelLogin.hidden   = true;
      panelRegister.hidden = false;
      panelRegister.style.animation = 'none';
      requestAnimationFrame(() => {
        panelRegister.style.animation = 'fadeSlideIn 0.35s ease';
      });
    }

    setIndicator();
    // Focus the active panel's first input
    setTimeout(() => {
      const firstInput = (isLogin ? panelLogin : panelRegister).querySelector('input');
      firstInput?.focus();
    }, 80);
  }

  function setIndicator() {
    const activeTab = tabLogin.classList.contains('active') ? tabLogin : tabRegister;
    indicator.style.width  = `${activeTab.offsetWidth}px`;
    indicator.style.transform = `translateX(${activeTab.offsetLeft - 4}px)`;
  }

  return { init, activate };
})();


/* ────────────────────────────────────────────────────────────────
   3. PASSWORD SHOW / HIDE
──────────────────────────────────────────────────────────────── */
const PasswordToggleModule = (() => {
  function init() {
    document.querySelectorAll('.toggle-pw').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input    = document.getElementById(targetId);
        if (!input) return;
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.querySelector('.eye-icon').style.display    = isHidden ? 'none' : '';
        btn.querySelector('.eye-off-icon').style.display= isHidden ? '' : 'none';
        btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
      });
    });
  }
  return { init };
})();


/* ────────────────────────────────────────────────────────────────
   4. CAPS LOCK DETECTION
──────────────────────────────────────────────────────────────── */
const CapsLockModule = (() => {
  function init() {
    // Map: input id → warning element id
    const pairs = [
      ['login-password',  'login-caps-warn'],
      ['reg-password',    'reg-caps-warn'],
    ];

    pairs.forEach(([inputId, warnId]) => {
      const input = document.getElementById(inputId);
      const warn  = document.getElementById(warnId);
      if (!input || !warn) return;
      input.addEventListener('keyup', e => {
        warn.style.display = e.getModifierState('CapsLock') ? '' : 'none';
      });
    });
  }
  return { init };
})();


/* ────────────────────────────────────────────────────────────────
   5. VALIDATION HELPERS
──────────────────────────────────────────────────────────────── */
const Validators = {
  /**
   * Email OR username: allow @ format or alphanumeric usernames.
   * For login field we are lenient, accepting either form.
   */
  emailOrUsername(value) {
    if (!value.trim()) return 'Please enter your email or username.';
    // Check if it looks like an email attempt (contains @)
    if (value.includes('@')) {
      return Validators.email(value);
    }
    // Username: 3–32 chars, alphanumeric + underscore/dash
    if (!/^[a-z0-9_-]{3,32}$/i.test(value)) {
      return 'Username must be 3–32 characters (letters, numbers, _ or -).';
    }
    return null;
  },

  email(value) {
    if (!value.trim()) return 'Email address is required.';
    // RFC 5322 simplified regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return 'Please enter a valid email address.';
    }
    return null;
  },

  name(value) {
    if (!value.trim()) return 'Full name is required.';
    if (value.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!/^[A-Za-zÀ-ÿ\s'-]{2,64}$/.test(value.trim())) {
      return 'Name contains invalid characters.';
    }
    return null;
  },

  /**
   * Phone validation: accepts common international formats.
   * Strips formatting chars (space, dash, dot, parens) then checks digit count.
   */
  phone(value) {
    if (!value.trim()) return 'Phone number is required.';
    const stripped = value.replace(/[\s\-\.\(\)]/g, '');
    if (!/^\+?[0-9]{7,15}$/.test(stripped)) {
      return 'Enter a valid phone number (7–15 digits).';
    }
    return null;
  },

  passwordLogin(value) {
    if (!value) return 'Password is required.';
    return null;
  },

  passwordNew(value) {
    if (!value) return 'Password is required.';
    if (value.length < 8) return 'Password must be at least 8 characters.';
    return null;
  },

  confirmPassword(pw, confirm) {
    if (!confirm) return 'Please confirm your password.';
    if (pw !== confirm) return 'Passwords do not match.';
    return null;
  },
};


/* ────────────────────────────────────────────────────────────────
   6. REAL-TIME FIELD VALIDATION
──────────────────────────────────────────────────────────────── */
const ValidationModule = (() => {
  /**
   * Marks a field group as valid or invalid, updates status icon and error.
   * @param {string} groupId - ID of the .field-group wrapper
   * @param {string|null} errorMsg - null means valid
   */
  function setFieldState(groupId, errorMsg) {
    const group = document.getElementById(groupId);
    if (!group) return;
    const errorEl = group.querySelector('.field-error');

    group.classList.toggle('is-valid',   !errorMsg);
    group.classList.toggle('is-invalid', !!errorMsg);

    if (errorEl) {
      errorEl.textContent = errorMsg || '';
    }
  }

  /**
   * Clears a field's validation state (neither valid nor invalid).
   */
  function clearFieldState(groupId) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.classList.remove('is-valid', 'is-invalid');
    const errorEl = group.querySelector('.field-error');
    if (errorEl) errorEl.textContent = '';
  }

  /**
   * Attaches blur + input listeners to a field for real-time validation.
   * @param {string} inputId
   * @param {string} groupId
   * @param {Function} validator - returns error string or null
   */
  function attach(inputId, groupId, validator) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let touched = false;

    input.addEventListener('blur', () => {
      touched = true;
      const error = validator(input.value);
      setFieldState(groupId, error);
    });

    input.addEventListener('input', () => {
      if (!touched) return;
      const error = validator(input.value);
      setFieldState(groupId, error);
    });
  }

  /** Run validator on all provided field specs, return true if all valid */
  function validateAll(specs) {
    let allValid = true;
    specs.forEach(({ inputId, groupId, validator }) => {
      const input = document.getElementById(inputId);
      const error = validator(input?.value || '');
      setFieldState(groupId, error);
      if (error) allValid = false;
    });
    return allValid;
  }

  function init() {
    // Login fields
    attach('login-email',    'fg-login-email',    Validators.emailOrUsername);
    attach('login-password', 'fg-login-password', Validators.passwordLogin);

    // Register fields
    attach('reg-name',    'fg-reg-name',    Validators.name);
    attach('reg-email',   'fg-reg-email',   Validators.email);
    attach('reg-phone',   'fg-reg-phone',   Validators.phone);
    attach('reg-password','fg-reg-password', Validators.passwordNew);
  }

  return { init, setFieldState, clearFieldState, validateAll };
})();


/* ────────────────────────────────────────────────────────────────
   7. PASSWORD STRENGTH METER
──────────────────────────────────────────────────────────────── */
const StrengthModule = (() => {
  const segments  = [0,1,2,3].map(i => document.getElementById(`seg-${i}`));
  const labelEl   = document.getElementById('strength-label');
  const tipEl     = document.getElementById('strength-tip');
  const descEl    = document.getElementById('pw-strength-desc');

  const LEVELS = [
    { label: 'Weak',      cls: 'weak',      filled: 1, color: 'filled-1' },
    { label: 'Fair',      cls: 'fair',      filled: 2, color: 'filled-2' },
    { label: 'Strong',    cls: 'strong',    filled: 3, color: 'filled-3' },
    { label: 'Excellent', cls: 'excellent', filled: 4, color: 'filled-4' },
  ];

  const TIPS = {
    0: 'Try using a mix of characters.',
    1: 'Add uppercase letters or numbers.',
    2: 'Add a symbol like !, @, or # to strengthen it.',
    3: 'Try a longer passphrase for extra security.',
    4: '🎉 Great password!',
  };

  /**
   * Calculate strength score (0–4) based on entropy checks.
   */
  function score(pw) {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)  s++;
    if (pw.length >= 14) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    // Clamp to 0–4
    return Math.min(4, s);
  }

  function update(pw) {
    const s = score(pw);
    // Map score → level index (score 0 = no level shown)
    const levelIdx = pw ? Math.max(0, s - 1) : -1;

    segments.forEach((seg, i) => {
      seg.className = 'strength-seg';
      if (pw && i < s) {
        seg.classList.add(`filled-${Math.min(s, 4)}`);
      }
    });

    if (!pw) {
      labelEl.textContent = '—';
      labelEl.className   = 'strength-label';
      tipEl.textContent   = '';
      descEl.textContent  = '';
      return;
    }

    const level = LEVELS[levelIdx] || LEVELS[0];
    labelEl.textContent = level.label;
    labelEl.className   = `strength-label ${level.cls}`;
    tipEl.textContent   = TIPS[s] || '';
    descEl.textContent  = `Password strength: ${level.label}. ${tipEl.textContent}`;
  }

  function init() {
    const pwInput = document.getElementById('reg-password');
    if (!pwInput) return;
    pwInput.addEventListener('input', () => update(pwInput.value));
  }

  return { init, score };
})();


/* ────────────────────────────────────────────────────────────────
   8. CONFIRM PASSWORD LIVE MATCH
──────────────────────────────────────────────────────────────── */
const ConfirmMatchModule = (() => {
  const matchIcon = document.getElementById('match-icon');

  function init() {
    const pwInput  = document.getElementById('reg-password');
    const cfmInput = document.getElementById('reg-confirm');
    if (!pwInput || !cfmInput) return;

    function check() {
      const pw  = pwInput.value;
      const cfm = cfmInput.value;
      if (!cfm) {
        matchIcon.textContent = '';
        ValidationModule.clearFieldState('fg-reg-confirm');
        return;
      }
      if (pw === cfm) {
        matchIcon.textContent = '✓';
        matchIcon.style.color = 'var(--color-teal)';
        ValidationModule.setFieldState('fg-reg-confirm', null);
      } else {
        matchIcon.textContent = '✗';
        matchIcon.style.color = 'var(--color-error)';
        ValidationModule.setFieldState('fg-reg-confirm', 'Passwords do not match.');
      }
    }

    cfmInput.addEventListener('input', check);
    pwInput.addEventListener('input', () => { if (cfmInput.value) check(); });
  }
  return { init };
})();


/* ────────────────────────────────────────────────────────────────
   9. PROGRESS RING (Registration completion %)
──────────────────────────────────────────────────────────────── */
const ProgressModule = (() => {
  const CIRCUMFERENCE = 2 * Math.PI * 22; // ~138.23
  const fill    = document.getElementById('progress-fill');
  const pctEl   = document.getElementById('progress-pct');

  // Fields to track: [inputId, validator]
  const FIELDS = [
    ['reg-name',    Validators.name],
    ['reg-email',   Validators.email],
    ['reg-phone',   Validators.phone],
    ['reg-password',Validators.passwordNew],
    ['reg-confirm', val => {
      const pw = document.getElementById('reg-password')?.value || '';
      return Validators.confirmPassword(pw, val);
    }],
  ];

  function compute() {
    let done = 0;
    FIELDS.forEach(([id, validator]) => {
      const input = document.getElementById(id);
      if (input && !validator(input.value)) done++;
    });
    const pct    = Math.round((done / FIELDS.length) * 100);
    const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
    if (fill)  fill.style.strokeDashoffset = offset;
    if (pctEl) pctEl.textContent = `${pct}%`;

    // Color transitions based on completion
    if (fill) {
      if (pct < 40)       fill.style.stroke = 'var(--color-amber)';
      else if (pct < 80)  fill.style.stroke = 'var(--color-violet)';
      else                fill.style.stroke = 'var(--color-teal)';
    }
    if (pctEl) {
      if (pct < 40)       pctEl.style.color = 'var(--color-amber)';
      else if (pct < 80)  pctEl.style.color = 'var(--color-violet)';
      else                pctEl.style.color = 'var(--color-teal)';
    }
  }

  function init() {
    if (!fill) return;
    fill.style.strokeDasharray  = CIRCUMFERENCE;
    fill.style.strokeDashoffset = CIRCUMFERENCE;

    FIELDS.forEach(([id]) => {
      document.getElementById(id)?.addEventListener('input', compute);
    });
    compute();
  }
  return { init };
})();


/* ────────────────────────────────────────────────────────────────
   10. COUNTRY CODE PICKER
──────────────────────────────────────────────────────────────── */
const CountryCodeModule = (() => {
  // Curated list of popular countries with dial codes
  const COUNTRIES = [
    { flag: '🇺🇸', name: 'United States',   dial: '+1' },
    { flag: '🇬🇧', name: 'United Kingdom',   dial: '+44' },
    { flag: '🇮🇳', name: 'India',            dial: '+91' },
    { flag: '🇨🇦', name: 'Canada',           dial: '+1' },
    { flag: '🇦🇺', name: 'Australia',        dial: '+61' },
    { flag: '🇩🇪', name: 'Germany',          dial: '+49' },
    { flag: '🇫🇷', name: 'France',           dial: '+33' },
    { flag: '🇧🇷', name: 'Brazil',           dial: '+55' },
    { flag: '🇯🇵', name: 'Japan',            dial: '+81' },
    { flag: '🇰🇷', name: 'South Korea',      dial: '+82' },
    { flag: '🇨🇳', name: 'China',            dial: '+86' },
    { flag: '🇷🇺', name: 'Russia',           dial: '+7' },
    { flag: '🇮🇹', name: 'Italy',            dial: '+39' },
    { flag: '🇪🇸', name: 'Spain',            dial: '+34' },
    { flag: '🇲🇽', name: 'Mexico',           dial: '+52' },
    { flag: '🇿🇦', name: 'South Africa',     dial: '+27' },
    { flag: '🇳🇬', name: 'Nigeria',          dial: '+234' },
    { flag: '🇦🇪', name: 'UAE',              dial: '+971' },
    { flag: '🇸🇬', name: 'Singapore',        dial: '+65' },
    { flag: '🇳🇿', name: 'New Zealand',      dial: '+64' },
    { flag: '🇵🇰', name: 'Pakistan',         dial: '+92' },
    { flag: '🇧🇩', name: 'Bangladesh',       dial: '+880' },
    { flag: '🇵🇭', name: 'Philippines',      dial: '+63' },
    { flag: '🇮🇩', name: 'Indonesia',        dial: '+62' },
    { flag: '🇹🇷', name: 'Turkey',           dial: '+90' },
    { flag: '🇦🇷', name: 'Argentina',        dial: '+54' },
    { flag: '🇨🇴', name: 'Colombia',         dial: '+57' },
    { flag: '🇳🇱', name: 'Netherlands',      dial: '+31' },
    { flag: '🇸🇪', name: 'Sweden',           dial: '+46' },
    { flag: '🇳🇴', name: 'Norway',           dial: '+47' },
  ];

  const btn       = document.getElementById('country-code-btn');
  const dropdown  = document.getElementById('country-dropdown');
  const flagEl    = document.getElementById('cc-flag');
  const codeEl    = document.getElementById('cc-code');
  const searchEl  = document.getElementById('cc-search');
  const listEl    = document.getElementById('cc-list');

  let selected = COUNTRIES[0];
  let isOpen   = false;

  function renderList(filter = '') {
    const query = filter.toLowerCase();
    const filtered = COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(query) || c.dial.includes(query)
    );
    listEl.innerHTML = filtered.map((c, i) => `
      <li role="option" aria-selected="${c === selected}" data-index="${i}"
          tabindex="0" class="${c === selected ? 'selected' : ''}">
        <span>${c.flag}</span>
        <span class="cc-name">${c.name}</span>
        <span class="cc-dial">${c.dial}</span>
      </li>
    `).join('');

    listEl.querySelectorAll('li').forEach((li, i) => {
      const country = filtered[i];
      li.addEventListener('click',  () => select(country));
      li.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(country); }
        if (e.key === 'Escape') close();
      });
    });
  }

  function select(country) {
    selected     = country;
    flagEl.textContent = country.flag;
    codeEl.textContent = country.dial;
    close();
  }

  function open() {
    dropdown.hidden = false;
    isOpen = true;
    btn.setAttribute('aria-expanded', 'true');
    renderList();
    requestAnimationFrame(() => searchEl?.focus());
  }

  function close() {
    dropdown.hidden = true;
    isOpen = false;
    btn.setAttribute('aria-expanded', 'false');
    btn.focus();
  }

  function init() {
    if (!btn || !dropdown) return;
    btn.addEventListener('click', () => isOpen ? close() : open());

    searchEl?.addEventListener('input', () => renderList(searchEl.value));

    // Close on outside click
    document.addEventListener('click', e => {
      if (isOpen && !btn.contains(e.target) && !dropdown.contains(e.target)) close();
    });

    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) close();
    });
  }

  return { init };
})();


/* ────────────────────────────────────────────────────────────────
   11. TOAST NOTIFICATION SYSTEM
──────────────────────────────────────────────────────────────── */
const ToastModule = (() => {
  const container = document.getElementById('toast-container');

  const ICONS = {
    success: '✓',
    error:   '✕',
    info:    'ℹ',
    warning: '⚠',
  };

  const TITLES = {
    success: 'Success',
    error:   'Error',
    info:    'Info',
    warning: 'Warning',
  };

  /**
   * Show a toast notification.
   * @param {string} type - 'success' | 'error' | 'info' | 'warning'
   * @param {string} message
   * @param {number} [duration=4000] - ms before auto-dismiss
   */
  function show(type = 'info', message = '', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-atomic', 'true');

    // Touch swipe to dismiss
    let startX = 0;
    toast.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
    toast.addEventListener('touchend',   e => {
      if (Math.abs(e.changedTouches[0].clientX - startX) > 60) dismiss(toast);
    });

    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${ICONS[type]}</span>
      <div class="toast-body">
        <div class="toast-title">${TITLES[type]}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Dismiss notification">×</button>
      <div class="toast-progress" style="animation-duration:${duration}ms;color:var(--color-${type === 'error' ? 'error' : type === 'success' ? 'teal' : type === 'warning' ? 'amber' : 'violet'})"></div>
    `;

    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));
    toast.addEventListener('click', () => dismiss(toast));

    const timer = setTimeout(() => dismiss(toast), duration);
    toast._timer = timer;
  }

  function dismiss(toast) {
    clearTimeout(toast._timer);
    toast.classList.add('dismissing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }

  return { show };
})();


/* ────────────────────────────────────────────────────────────────
   12. CONFETTI PARTICLE BURST
──────────────────────────────────────────────────────────────── */
const ConfettiModule = (() => {
  const canvas = document.getElementById('confetti-canvas');
  const ctx    = canvas?.getContext('2d');

  // Brand-palette confetti colors
  const COLORS = [
    '#5B2A86', '#7B42B0', '#0F6B63', '#1A8C82',
    '#D97B4F', '#E8966E', '#F0EAF8', '#EDD9C0',
  ];

  let particles = [];
  let rafId     = null;
  let running   = false;

  function resize() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    const angle  = (Math.random() * 60 - 30) * (Math.PI / 180); // spray upward
    const speed  = 5 + Math.random() * 8;
    return {
      x:     canvas.width  / 2 + (Math.random() - 0.5) * 200,
      y:     canvas.height / 2,
      vx:    Math.sin(angle) * speed,
      vy:    -Math.abs(Math.cos(angle) * speed),
      size:  4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot:   Math.random() * 360,
      rotV:  (Math.random() - 0.5) * 8,
      alpha: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    };
  }

  function fire() {
    if (!canvas || !ctx) return;
    resize();
    canvas.style.display = 'block';
    running = true;
    particles = Array.from({ length: 90 }, createParticle);
    animate();
    setTimeout(stop, 3000);
  }

  function animate() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.25; // gravity
      p.vx  *= 0.99; // air drag
      p.rot += p.rotV;
      p.alpha = Math.max(0, p.alpha - 0.012);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    particles = particles.filter(p => p.alpha > 0);
    if (particles.length > 0) {
      rafId = requestAnimationFrame(animate);
    } else {
      stop();
    }
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
    if (canvas) canvas.style.display = 'none';
    if (ctx)    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];
  }

  return { fire };
})();


/* ────────────────────────────────────────────────────────────────
   13. FEATURE CAROUSEL
──────────────────────────────────────────────────────────────── */
const CarouselModule = (() => {
  const slides = document.querySelectorAll('.feature-slide');
  const dots   = document.querySelectorAll('.dot');
  let current  = 0;
  let interval = null;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo((current + 1) % slides.length); }

  function init() {
    if (!slides.length) return;
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(interval);
        goTo(i);
        startAuto();
      });
    });
    startAuto();
  }

  function startAuto() {
    interval = setInterval(next, 5000);
  }

  return { init };
})();


/* ────────────────────────────────────────────────────────────────
   14. FORM SUBMISSION HANDLERS
──────────────────────────────────────────────────────────────── */
const FormModule = (() => {
  // ── Login form ──────────────────────────────────────────────
  function initLogin() {
    const form   = document.getElementById('form-login');
    const btn    = document.getElementById('btn-login-submit');
    if (!form || !btn) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const valid = ValidationModule.validateAll([
        { inputId: 'login-email',    groupId: 'fg-login-email',    validator: Validators.emailOrUsername },
        { inputId: 'login-password', groupId: 'fg-login-password', validator: Validators.passwordLogin },
      ]);
      if (!valid) return;

      // Disable all panel inputs during processing
      const panel = document.getElementById('panel-login');
      panel?.classList.add('is-processing');

      // Loading state — update label
      btn.querySelector('.btn-label').textContent = 'Signing In…';
      setButtonState(btn, 'loading');

      // Simulate async auth call
      await simulateRequest(1800);

      panel?.classList.remove('is-processing');
      btn.querySelector('.btn-label').textContent = 'Sign In';

      setButtonState(btn, 'success');

      // Show premium success overlay — no redirect, dismiss after ~2 s
      SuccessOverlayModule.show(
        '✓ Login Successful',
        'Welcome back to SK Auth!',
        2000,             // extra ms to hold after animations finish
        () => {           // onDone: reset button once overlay fully closes
          setButtonState(btn, 'idle');
          btn.querySelector('.btn-label').textContent = 'Sign In';
        }
      );
    });
  }

  // ── Register form ────────────────────────────────────────────
  function initRegister() {
    const form = document.getElementById('form-register');
    const btn  = document.getElementById('btn-register-submit');
    if (!form || !btn) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const pw  = document.getElementById('reg-password')?.value  || '';
      const cfm = document.getElementById('reg-confirm')?.value   || '';

      const valid = ValidationModule.validateAll([
        { inputId: 'reg-name',    groupId: 'fg-reg-name',    validator: Validators.name },
        { inputId: 'reg-email',   groupId: 'fg-reg-email',   validator: Validators.email },
        { inputId: 'reg-phone',   groupId: 'fg-reg-phone',   validator: Validators.phone },
        { inputId: 'reg-password',groupId: 'fg-reg-password',validator: Validators.passwordNew },
        { inputId: 'reg-confirm', groupId: 'fg-reg-confirm', validator: v => Validators.confirmPassword(pw, v) },
      ]);
      if (!valid) {
        ToastModule.show('error', 'Please fix the errors above before continuing.', 4000);
        return;
      }

      // Check strength
      const strength = StrengthModule.score(pw);
      if (strength < 2) {
        ValidationModule.setFieldState('fg-reg-password', 'Please use a stronger password.');
        ToastModule.show('warning', 'Your password is too weak. Add uppercase, numbers, or symbols.', 5000);
        return;
      }

      // Disable all panel inputs during processing
      const regPanel = document.getElementById('panel-register');
      regPanel?.classList.add('is-processing');

      // Loading state — update label
      btn.querySelector('.btn-label').textContent = 'Creating Account…';
      setButtonState(btn, 'loading');
      await simulateRequest(2200);

      regPanel?.classList.remove('is-processing');
      btn.querySelector('.btn-label').textContent = 'Create Account';
      setButtonState(btn, 'success');

      ToastModule.show('success', 'Account created! Welcome to SK Auth 🌅', 4000);
      ConfettiModule.fire();

      // Show premium success overlay — no redirect, dismiss after ~2.5 s
      SuccessOverlayModule.show(
        '✓ Account Created Successfully',
        'Welcome to SK Auth!',
        2500,             // extra ms to hold after animations finish
        () => {           // onDone: reset button once overlay fully closes
          setButtonState(btn, 'idle');
          btn.querySelector('.btn-label').textContent = 'Create Account';
        }
      );
    });
  }

  /** Simulate an async network request */
  function simulateRequest(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update button visual state.
   * @param {HTMLElement} btn
   * @param {'idle'|'loading'|'success'} state
   */
  function setButtonState(btn, state) {
    btn.classList.remove('is-loading', 'is-success');
    btn.disabled = false;
    if (state === 'loading') {
      btn.classList.add('is-loading');
      btn.disabled = true;
    } else if (state === 'success') {
      btn.classList.add('is-success');
    }
  }

  function init() {
    initLogin();
    initRegister();
  }
  return { init };
})();


/* ────────────────────────────────────────────────────────────────
   15. SOCIAL LOGIN BUTTONS
──────────────────────────────────────────────────────────────── */
const SocialModule = (() => {
  function init() {
    ['btn-google-login', 'btn-github-login', 'btn-google-reg', 'btn-github-reg'].forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const provider = id.includes('google') ? 'Google' : 'GitHub';
        ToastModule.show('info', `${provider} sign-in coming soon! Stay tuned.`, 3500);
      });
    });
  }
  return { init };
})();


/* ────────────────────────────────────────────────────────────────
   15b. FORGOT PASSWORD LINK
──────────────────────────────────────────────────────────────── */
const ForgotModule = (() => {
  function init() {
    document.getElementById('forgot-link')?.addEventListener('click', e => {
      e.preventDefault();
      ToastModule.show('info', 'Password reset link will be sent to your email.', 4000);
    });
  }
  return { init };
})();


/* ────────────────────────────────────────────────────────────────
   15c. SUCCESS OVERLAY MODULE
   Shows a premium animated checkmark overlay, then dismisses it
   and returns the user to the current page (no redirect).
──────────────────────────────────────────────────────────────── */
const SuccessOverlayModule = (() => {
  const overlay = document.getElementById('success-overlay');
  const titleEl = document.getElementById('success-title');
  const msgEl   = document.getElementById('success-msg');
  const barEl   = document.getElementById('success-bar');

  // Total visible time (ms) the overlay stays on screen before fading out.
  // Breakdown: ~1.4 s for staggered animations + dismissDelay for the user to read.
  const ANIM_LEAD   = 1400; // ms until all staggered animations finish
  const FADE_OUT_MS = 500;  // ms for the fade-out transition

  /**
   * Show the success overlay, play the animation, then quietly close it.
   * No redirect. The user stays on the current page.
   *
   * @param {string} title      - Heading shown in the overlay
   * @param {string} message    - Sub-message shown below the heading
   * @param {number} dismissMs  - Extra ms to keep the overlay visible after
   *                              animations finish (default 1800 ms)
   * @param {Function} [onDone] - Optional callback invoked after overlay closes
   */
  function show(title = '✓ Success!', message = 'All done!', dismissMs = 1800, onDone) {
    if (!overlay) return;

    // ── Populate content ──────────────────────────────────────────
    if (titleEl) titleEl.textContent = title;
    if (msgEl)   msgEl.textContent   = message;

    // ── Reset SVG animations so they replay cleanly each time ─────
    const ring  = overlay.querySelector('.success-circle-ring');
    const check = overlay.querySelector('.success-check');
    [ring, check].forEach(el => {
      if (!el) return;
      el.style.animation = 'none';
      el.getBoundingClientRect(); // force reflow
      el.style.animation = '';   // re-apply CSS animation
    });

    // ── Sync the progress bar to match total visible time ─────────
    const barTotal = ANIM_LEAD + dismissMs; // total time bar shrinks over
    if (barEl) {
      barEl.style.animation = 'none';
      barEl.getBoundingClientRect();
      barEl.style.animation = `shrinkBar linear ${barTotal}ms 1.4s forwards`;
    }

    // ── Show overlay ──────────────────────────────────────────────
    overlay.hidden = false;
    overlay.style.animation = 'none';
    overlay.getBoundingClientRect();
    overlay.style.animation = 'overlayFadeIn 0.4s ease forwards';

    // ── Schedule dismiss (no redirect) ───────────────────────────
    const totalVisible = ANIM_LEAD + dismissMs;
    setTimeout(() => {
      // Fade out
      overlay.style.animation = `overlayFadeOut ${FADE_OUT_MS}ms ease forwards`;
      setTimeout(() => {
        // Hide and reset so it can be shown again
        overlay.hidden = true;
        overlay.style.animation = '';
        if (typeof onDone === 'function') onDone();
      }, FADE_OUT_MS);
    }, totalVisible);
  }

  return { show };
})();


/* ────────────────────────────────────────────────────────────────
   16. KEYBOARD / ACCESSIBILITY ENHANCEMENTS
──────────────────────────────────────────────────────────────── */
const A11yModule = (() => {
  function init() {
    // Enter-to-submit in forms (already default for most browsers,
    // but re-enforce for custom fieldsets)
    ['form-login', 'form-register'].forEach(formId => {
      const form = document.getElementById(formId);
      form?.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
          // Find submit button inside this form and click it
          const submitBtn = form.querySelector('button[type="submit"]');
          submitBtn?.click();
        }
      });
    });

    // Tab order: make switch links and social buttons properly focusable
    // (Already have tabindex in HTML — just confirm focus ring visibility via CSS)
  }
  return { init };
})();


/* ────────────────────────────────────────────────────────────────
   16. INIT — Bootstrap all modules on DOMContentLoaded
──────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeModule.init();
  TabModule.init();
  PasswordToggleModule.init();
  CapsLockModule.init();
  ValidationModule.init();
  StrengthModule.init();
  ConfirmMatchModule.init();
  ProgressModule.init();
  CountryCodeModule.init();
  CarouselModule.init();
  FormModule.init();
  SocialModule.init();
  ForgotModule.init();
  A11yModule.init();

  // Resize confetti canvas on window resize
  window.addEventListener('resize', () => {
    const canvas = document.getElementById('confetti-canvas');
    if (canvas && canvas.style.display !== 'none') {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });
});
