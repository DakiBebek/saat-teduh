/**
 * Sistem Pengingat Saat Teduh (Web Notification API + Fallback Banner Toast)
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

  // Banner toast in-app yang selalu pasti muncul di layar HP
  showInAppToast(title, body) {
    const existing = document.getElementById('st-inapp-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'st-inapp-toast';
    toast.className = 'fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-stone-900 text-white rounded-2xl p-4 shadow-2xl border border-amber-500/40 flex items-start gap-3 transform transition-all duration-300';
    toast.innerHTML = `
      <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xl">
        🔔
      </div>
      <div class="flex-1">
        <h4 class="text-xs sm:text-sm font-bold text-amber-300 font-serif-bible">${title}</h4>
        <p class="text-[11px] sm:text-xs text-stone-200 mt-1 leading-snug">${body}</p>
      </div>
      <button onclick="this.parentElement.remove()" class="text-stone-400 hover:text-white p-1 text-xs">✕</button>
    `;

    document.body.appendChild(toast);

    // Getar HP jika didukung
    if ('vibrate' in navigator) {
      try { navigator.vibrate([200, 100, 200]); } catch (e) {}
    }

    // Auto dismiss setelah 7 detik
    setTimeout(() => {
      if (toast && toast.parentElement) {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }
    }, 7000);
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
      console.warn('requestPermission fallback:', e);
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

    let sent = false;

    // Coba Service Worker notification
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, defaultOptions);
          sent = true;
        }
      } catch (e) {
        console.warn('SW notification fallback:', e);
      }
    }

    // Coba new Notification jika SW belum ready
    if (!sent && this.isSupported() && Notification.permission === 'granted') {
      try {
        new Notification(title, defaultOptions);
        sent = true;
      } catch (err) {
        console.warn('new Notification fallback:', err);
      }
    }

    // Selalu tampilkan In-App Toast agar dijamin 100% muncul di layar HP
    this.showInAppToast(title, defaultOptions.body);

    return sent;
  },

  async sendTestNotification() {
    const verse = typeof getVerseOfTheDay === 'function' ? getVerseOfTheDay(new Date()) : null;
    const body = verse 
      ? `"${verse.text.slice(0, 90)}..." — ${verse.passage}`
      : 'Waktunya saat teduh dan mendekat kepada Tuhan hari ini.';

    // Minta izin notifikasi jika didukung
    if (this.isSupported() && Notification.permission !== 'granted') {
      try {
        await this.requestPermission();
      } catch (e) {}
    }

    await this.showNotification('Saat Teduh Kristen 🕊️', { body });
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
