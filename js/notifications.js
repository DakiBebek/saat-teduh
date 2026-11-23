/**
 * Sistem Pengingat Saat Teduh (Web Notification API)
 * Memungkinkan pengguna mengatur jam pengingat harian di HP/Browser
 */

const NotificationManager = {
  SETTINGS_KEY: 'st_notification_settings',
  
  // Ambil pengaturan yang tersimpan
  getSettings() {
    const defaultSettings = {
      enabled: false,
      time: '06:00', // Default jam 6 pagi
      lastNotifiedDate: ''
    };
    try {
      const saved = localStorage.getItem(this.SETTINGS_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  },

  // Simpan pengaturan
  saveSettings(settings) {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Gagal menyimpan pengaturan notifikasi', e);
    }
  },

  // Periksa dukungan Web Notification
  isSupported() {
    return 'Notification' in window;
  },

  // Request izin notifikasi
  async requestPermission() {
    if (!this.isSupported()) {
      alert('Browser di perangkat ini tidak mendukung Web Notification.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.error('Error saat meminta izin notifikasi:', e);
      return false;
    }
  },

  // Tampilkan notifikasi langsung (bisa via Service Worker atau new Notification)
  async showNotification(title, options = {}) {
    const defaultOptions = {
      icon: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=192&auto=format&fit=crop&q=80',
      badge: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=96&auto=format&fit=crop&q=80',
      vibrate: [200, 100, 200],
      tag: 'saat-teduh-reminder',
      renotify: true,
      ...options
    };

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          return registration.showNotification(title, defaultOptions);
        }
      } catch (e) {
        console.warn('Fallback ke new Notification:', e);
      }
    }

    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        return new Notification(title, defaultOptions);
      } catch (err) {
        console.error('Gagal memicu Notification:', err);
      }
    }
  },

  // Kirim tes notifikasi
  async sendTestNotification() {
    if (!this.isSupported()) {
      alert('Browser ini tidak mendukung notifikasi.');
      return;
    }

    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        alert('Izin notifikasi belum diberikan. Silakan izinkan di setelan browser atau sistem HP Anda.');
        return;
      }
    }

    // Ambil ayat hari ini sebagai isi notifikasi
    const verse = typeof getVerseOfTheDay === 'function' ? getVerseOfTheDay(new Date()) : null;
    const body = verse 
      ? `"${verse.text.slice(0, 85)}..." — ${verse.passage}`
      : 'Waktunya mengambil waktu hening sejenak bersama Tuhan hari ini.';

    await this.showNotification('Saat Teduh Kristen 🕊️', {
      body: body,
      data: { url: window.location.href }
    });

    alert('🔔 Notifikasi percobaan telah dikirim ke perangkat Anda!');
  },

  // Cek apakah waktu sekarang cocok dengan waktu pengingat
  checkAndNotify() {
    const settings = this.getSettings();
    if (!settings.enabled || Notification.permission !== 'granted') return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const todayIso = typeof getIsoDate === 'function' ? getIsoDate(now) : now.toISOString().split('T')[0];

    // Jika jam sama dan belum ternotifikasi hari ini
    if (currentTimeStr === settings.time && settings.lastNotifiedDate !== todayIso) {
      settings.lastNotifiedDate = todayIso;
      this.saveSettings(settings);

      const verse = typeof getVerseOfTheDay === 'function' ? getVerseOfTheDay(now) : null;
      const body = verse
        ? `Waktunya saat teduh: "${verse.text.slice(0, 80)}..." — ${verse.passage}`
        : 'Mari hening sejenak, berdoa, dan merenungkan firman Tuhan hari ini.';

      this.showNotification('Waktunya Saat Teduh 🕊️', {
        body: body,
        data: { url: window.location.href }
      });
    }
  },

  // Inisialisasi Service Worker & Interval Pengingat
  init() {
    // Daftarkan service worker jika didukung
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('Gagal mendaftarkan service worker:', err);
      });
    }

    // Interval cek setiap 30 detik untuk akurasi waktu
    setInterval(() => {
      this.checkAndNotify();
    }, 30000);

    // Cek langsung saat pertama dibuka
    this.checkAndNotify();
  }
};

// Jalankan init
if (typeof window !== 'undefined') {
  window.NotificationManager = NotificationManager;
  document.addEventListener('DOMContentLoaded', () => {
    NotificationManager.init();
  });
}
