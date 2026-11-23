/**
 * Sistem Pengingat Saat Teduh (Web Notification API + Fallback Banner Toast + Audio Chime)
 * Data pengaturan disimpan per-akun (User ID / Email)
 */

const NotificationManager = {
  // Ambil key penyimpanan berdasarkan akun saat ini
  getStorageKey() {
    let userId = 'guest';
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.id) {
      userId = currentUser.id;
    } else if (typeof currentUser !== 'undefined' && currentUser && currentUser.email) {
      userId = currentUser.email;
    }
    return `st_notif_settings_${userId}`;
  },

  getSettings() {
    const defaultSettings = {
      enabled: false,
      time: '06:00',
      lastNotifiedDate: ''
    };
    try {
      const key = this.getStorageKey();
      const saved = localStorage.getItem(key);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
      return defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  },

  saveSettings(settings) {
    try {
      const key = this.getStorageKey();
      localStorage.setItem(key, JSON.stringify(settings));
    } catch (e) {
      console.error('Gagal menyimpan pengaturan notifikasi', e);
    }
  },

  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  // Suara lonceng doa lembut (Web Audio API Synthesizer)
  playChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio chime fallback:', e);
    }
  },

  // Banner notifikasi in-app yang selalu pasti muncul di layar HP
  showInAppToast(title, body) {
    this.playChime();

    const existing = document.getElementById('st-inapp-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'st-inapp-toast';
    toast.className = 'fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-[9999] bg-stone-900 text-white rounded-2xl p-4 shadow-2xl border-2 border-amber-500 flex items-start gap-3 transform transition-all duration-300';
    toast.innerHTML = `
      <div class="w-10 h-10 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 text-xl shadow-inner">
        🕊️
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-1.5 mb-0.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <h4 class="text-xs sm:text-sm font-bold text-amber-300 font-serif-bible">${title}</h4>
        </div>
        <p class="text-[11px] sm:text-xs text-stone-200 mt-1 leading-snug">${body}</p>
      </div>
      <button onclick="this.parentElement.remove()" class="text-stone-400 hover:text-white p-1 text-xs">✕</button>
    `;

    document.body.appendChild(toast);

    // Getar HP
    if ('vibrate' in navigator) {
      try { navigator.vibrate([200, 100, 200]); } catch (e) {}
    }

    // Auto dismiss setelah 8 detik
    setTimeout(() => {
      if (toast && toast.parentElement) {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
      }
    }, 8000);
  },

  async requestPermission() {
    if (!this.isSupported()) return false;
    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      return permission === 'granted';
    } catch (e) {
      console.warn('requestPermission error:', e);
      return false;
    }
  },

  async showNotification(title, options = {}) {
    const defaultOptions = {
      body: options.body || 'Waktunya saat teduh dan berdoa bersama Tuhan.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'saat-teduh-reminder',
      renotify: true,
      ...options
    };

    // 1. Tampilkan banner in-app visual + suara lonceng di HP
    this.showInAppToast(title, defaultOptions.body);

    // 2. Coba kirimkan ke bar status HP sistem (Service Worker)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, defaultOptions);
        }
      } catch (e) {
        console.warn('SW notification fallback:', e);
      }
    }

    // 3. Coba new Notification jika didukung
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        new Notification(title, defaultOptions);
      } catch (err) {
        console.warn('new Notification fallback:', err);
      }
    }
  },

  async sendTestNotification() {
    const verse = typeof getVerseOfTheDay === 'function' ? getVerseOfTheDay(new Date()) : null;
    const body = verse 
      ? `"${verse.text.slice(0, 90)}..." — ${verse.passage}`
      : 'Waktunya mengambil waktu hening sejenak bersama Tuhan hari ini.';

    // Minta izin notifikasi jika didukung
    if (this.isSupported() && Notification.permission !== 'granted') {
      try {
        await this.requestPermission();
      } catch (e) {}
    }

    await this.showNotification('Saat Teduh Hari Ini 🕊️', { body });
  },

  checkAndNotify() {
    const settings = this.getSettings();
    if (!settings.enabled) return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const todayIso = typeof getIsoDate === 'function' ? getIsoDate(now) : now.toISOString().split('T')[0];

    if (currentTimeStr === settings.time && settings.lastNotifiedDate !== todayIso) {
      settings.lastNotifiedDate = todayIso;
      this.saveSettings(settings);

      const verse = typeof getVerseOfTheDay === 'function' ? getVerseOfTheDay(now) : null;
      const body = verse
        ? `Waktunya saat teduh: "${verse.text.slice(0, 85)}..." — ${verse.passage}`
        : 'Mari hening sejenak, berdoa, dan merenungkan firman Tuhan hari ini.';

      this.showNotification('Waktunya Saat Teduh 🕊️', { body });
    }
  },

  init() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('Service worker register error:', err);
      });
    }

    setInterval(() => {
      this.checkAndNotify();
    }, 30000);

    this.checkAndNotify();
  }
};

// Handler Switch Toggle Notifikasi Langsung
async function handleNotificationToggle(checkbox) {
  if (!checkbox) return;
  const isChecked = checkbox.checked;
  const settings = NotificationManager.getSettings();

  if (isChecked) {
    settings.enabled = true;
    NotificationManager.saveSettings(settings);
    
    // Minta izin notifikasi sistem jika didukung
    if (NotificationManager.isSupported()) {
      await NotificationManager.requestPermission();
    }
    NotificationManager.showInAppToast('Pengingat Aktif 🔔', `Pengingat harian diset ke pukul ${settings.time || '06:00'}.`);
  } else {
    settings.enabled = false;
    NotificationManager.saveSettings(settings);
    NotificationManager.showInAppToast('Pengingat Dinonaktifkan', 'Notifikasi pengingat harian telah dimatikan.');
  }

  if (window.syncNotificationUI) {
    window.syncNotificationUI();
  }
}

// Global helper function dipanggil langsung oleh tombol uji coba
function triggerTestNotification(btn) {
  if (btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>⏳</span> <span>Mengirim...</span>';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 1500);
  }

  NotificationManager.sendTestNotification();
}

if (typeof window !== 'undefined') {
  window.NotificationManager = NotificationManager;
  window.triggerTestNotification = triggerTestNotification;
  window.handleNotificationToggle = handleNotificationToggle;
  document.addEventListener('DOMContentLoaded', () => {
    NotificationManager.init();
    if (window.syncNotificationUI) window.syncNotificationUI();
  });
}
