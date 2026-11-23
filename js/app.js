/**
 * Aplikasi Saat Teduh Kristen - Main Controller
 * Mengatur Renungan Harian, Ayat Hari Ini, Jurnal Khotbah Minggu,
 * Refleksi, Streak, Generator Gambar, dan Backup Data.
 */

// Inisialisasi State Aplikasi
const AppState = {
  selectedDate: new Date(),
  currentTab: 'devotional', // 'devotional', 'verse', 'sermon', 'history', 'settings'
  fontSize: localStorage.getItem('st_fontSize') || 'base',
  theme: localStorage.getItem('st_theme') || 'light',
  reflections: JSON.parse(localStorage.getItem('st_reflections') || '{}'),
  sermons: JSON.parse(localStorage.getItem('st_sermons') || '[]'),
  activeSermonFilter: '',
  editingSermonId: null
};

// Helper: Format tanggal ISO YYYY-MM-DD
function getIsoDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Inisialisasi Aplikasi saat DOM Siap
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(AppState.theme);
  applyFontSize(AppState.fontSize);
  updateStreakDisplay();
  setupNavigation();
  setupDateControls();
  renderCurrentTab();
  setupAudioControls();
  setupReflectionAutosave();
  setupSermonHandlers();
  setupSettingsHandlers();
  setupNotificationSettings();
});

// -------------------------------------------------------------
// NAVIGASI ANTAR TAB
// -------------------------------------------------------------
function setupNavigation() {
  const navButtons = document.querySelectorAll('[data-tab-target]');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab-target');
      switchTab(target);
    });
  });

  const mobileNavButtons = document.querySelectorAll('[data-mobile-tab-target]');
  mobileNavButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-mobile-tab-target');
      switchTab(target);
    });
  });
}

function switchTab(tabName) {
  AppState.currentTab = tabName;

  // Update styling tombol navigasi desktop
  document.querySelectorAll('[data-tab-target]').forEach(btn => {
    const isTarget = btn.getAttribute('data-tab-target') === tabName;
    if (isTarget) {
      btn.classList.add('bg-amber-100', 'text-amber-900', 'dark:bg-amber-900/40', 'dark:text-amber-200', 'font-semibold');
      btn.classList.remove('text-stone-600', 'dark:text-stone-300', 'hover:bg-stone-100', 'dark:hover:bg-stone-800');
    } else {
      btn.classList.remove('bg-amber-100', 'text-amber-900', 'dark:bg-amber-900/40', 'dark:text-amber-200', 'font-semibold');
      btn.classList.add('text-stone-600', 'dark:text-stone-300', 'hover:bg-stone-100', 'dark:hover:bg-stone-800');
    }
  });

  // Update styling navigasi bawah di HP (Mobile Bottom Nav)
  document.querySelectorAll('[data-mobile-tab-target]').forEach(btn => {
    const isTarget = btn.getAttribute('data-mobile-tab-target') === tabName;
    if (isTarget) {
      btn.classList.add('text-amber-600', 'dark:text-amber-400', 'font-bold');
      btn.classList.remove('text-stone-400', 'dark:text-stone-500');
    } else {
      btn.classList.remove('text-amber-600', 'dark:text-amber-400', 'font-bold');
      btn.classList.add('text-stone-400', 'dark:text-stone-500');
    }
  });

  // Tampilkan tab view yang sesuai
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  const activeView = document.getElementById(`tab-${tabName}`);
  if (activeView) {
    activeView.classList.remove('hidden');
  }

  // Scroll kembali ke atas halaman saat ganti tab (terutama di layar HP)
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Render konten tab
  renderCurrentTab();
}

function renderCurrentTab() {
  switch (AppState.currentTab) {
    case 'devotional':
      renderDevotionalView();
      break;
    case 'verse':
      renderVerseView();
      break;
    case 'sermon':
      renderSermonView();
      break;
    case 'history':
      renderHistoryView();
      break;
    case 'settings':
      renderSettingsView();
      break;
  }
}

// -------------------------------------------------------------
// TAB 1: SAAT TEDUH HARIAN & REFLEKSI
// -------------------------------------------------------------
function setupDateControls() {
  const prevBtn = document.getElementById('btn-prev-day');
  const nextBtn = document.getElementById('btn-next-day');
  const todayBtn = document.getElementById('btn-today');
  const datePicker = document.getElementById('devotional-date-picker');

  if (datePicker) {
    datePicker.value = getIsoDate(AppState.selectedDate);
    datePicker.addEventListener('change', (e) => {
      const [year, month, day] = e.target.value.split('-').map(Number);
      AppState.selectedDate = new Date(year, month - 1, day);
      renderDevotionalView();
      renderVerseView();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      AppState.selectedDate.setDate(AppState.selectedDate.getDate() - 1);
      syncDatePicker();
      renderDevotionalView();
      renderVerseView();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      AppState.selectedDate.setDate(AppState.selectedDate.getDate() + 1);
      syncDatePicker();
      renderDevotionalView();
      renderVerseView();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      AppState.selectedDate = new Date();
      syncDatePicker();
      renderDevotionalView();
      renderVerseView();
    });
  }
}

function syncDatePicker() {
  const datePicker = document.getElementById('devotional-date-picker');
  if (datePicker) {
    datePicker.value = getIsoDate(AppState.selectedDate);
  }
}

function renderDevotionalView() {
  const devotional = getDevotionalForDate(AppState.selectedDate);
  const isoKey = getIsoDate(AppState.selectedDate);
  const savedReflection = AppState.reflections[isoKey] || {};

  // Update foto ilustrasi renungan yang se-tema
  const devoImage = document.getElementById('devo-image');
  const devoImageCaption = document.getElementById('devo-image-caption');
  if (devoImage) {
    devoImage.classList.add('opacity-0');
    const fallbackImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
    devoImage.src = devotional.image || fallbackImage;
    devoImage.alt = devotional.title;
    devoImage.onerror = function() {
      this.src = fallbackImage;
      this.classList.remove('opacity-0');
    };
  }
  if (devoImageCaption) {
    devoImageCaption.textContent = devotional.imageCaption || devotional.theme;
  }

  // Update metadata header
  document.getElementById('devo-date-display').textContent = devotional.dateString;
  document.getElementById('devo-theme-badge').textContent = devotional.theme;
  document.getElementById('devo-title').textContent = devotional.title;
  document.getElementById('devo-passage').textContent = devotional.passage;
  document.getElementById('devo-key-verse').textContent = `"${devotional.keyVerse}"`;
  document.getElementById('devo-verse-ref').textContent = `— ${devotional.verseRef}`;

  // External link Alkitab online
  const bibleLink = document.getElementById('devo-bible-link');
  if (bibleLink) {
    const encodedPassage = encodeURIComponent(devotional.passage);
    bibleLink.href = `https://alkitab.sabda.org/search.php?search=${encodedPassage}`;
  }

  // Render teks renungan dengan paragraf rapi
  const contentContainer = document.getElementById('devo-content');
  contentContainer.innerHTML = devotional.content
    .split('\n\n')
    .map(p => `<p class="mb-4 leading-relaxed">${p}</p>`)
    .join('');

  // Panduan Doa & Aksi
  document.getElementById('devo-prayer').textContent = devotional.prayer;
  document.getElementById('devo-action').textContent = devotional.actionStep;

  // Pertanyaan Refleksi Prompts
  const promptsList = document.getElementById('devo-reflection-prompts');
  if (promptsList && devotional.reflectionQuestions) {
    promptsList.innerHTML = devotional.reflectionQuestions
      .map(q => `<li class="flex items-start gap-2"><span class="text-amber-600 font-bold">•</span><span>${q}</span></li>`)
      .join('');
  }

  // Isi data form refleksi jika sudah pernah diisi
  document.getElementById('refl-heart-state').value = savedReflection.heartState || '';
  document.getElementById('refl-rhema').value = savedReflection.rhema || '';
  document.getElementById('refl-action').value = savedReflection.action || '';
  document.getElementById('refl-prayer').value = savedReflection.prayer || '';

  // Status Tombol Selesai
  const completeBtn = document.getElementById('btn-toggle-complete');
  if (completeBtn) {
    if (savedReflection.isCompleted) {
      completeBtn.innerHTML = `
        <span class="inline-flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
          Sudah Saat Teduh Hari Ini (Selesai)
        </span>
      `;
      completeBtn.classList.remove('bg-amber-600', 'hover:bg-amber-700', 'text-white');
      completeBtn.classList.add('bg-emerald-100', 'text-emerald-800', 'border', 'border-emerald-300', 'dark:bg-emerald-950/40', 'dark:text-emerald-300');
    } else {
      completeBtn.innerHTML = `
        <span class="inline-flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Tandai Selesai Saat Teduh
        </span>
      `;
      completeBtn.classList.add('bg-amber-600', 'hover:bg-amber-700', 'text-white');
      completeBtn.classList.remove('bg-emerald-100', 'text-emerald-800', 'border', 'border-emerald-300', 'dark:bg-emerald-950/40', 'dark:text-emerald-300');
    }
  }

  // Tombol Share WhatsApp
  const shareBtn = document.getElementById('btn-share-devotional');
  if (shareBtn) {
    shareBtn.onclick = () => {
      const waText = `*Saat Teduh Hari Ini* 📖\n_${devotional.dateString}_\n\n*${devotional.title}*\nBacaan: ${devotional.passage}\n\n"${devotional.keyVerse}" (${devotional.verseRef})\n\nMari luangkan waktu bersaat teduh dan mendekat kepada Tuhan hari ini. Damai Kristus menyertai kita! ✨`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`, '_blank');
    };
  }
}

// Autosave Refleksi dengan Debounce
function setupReflectionAutosave() {
  const fields = ['refl-heart-state', 'refl-rhema', 'refl-action', 'refl-prayer'];
  let saveTimeout;

  const saveHandler = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveCurrentReflection();
      showSaveNotification();
    }, 450);
  };

  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', saveHandler);
      el.addEventListener('change', saveHandler);
    }
  });

  // Handler Tombol Tandai Selesai
  const completeBtn = document.getElementById('btn-toggle-complete');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      const isoKey = getIsoDate(AppState.selectedDate);
      if (!AppState.reflections[isoKey]) {
        AppState.reflections[isoKey] = {};
      }
      const isNowComplete = !AppState.reflections[isoKey].isCompleted;
      AppState.reflections[isoKey].isCompleted = isNowComplete;
      AppState.reflections[isoKey].updatedAt = new Date().toISOString();

      // Simpan input form saat ini
      saveCurrentReflection();

      if (isNowComplete) {
        triggerConfettiCelebration();
      }

      updateStreakDisplay();
      renderDevotionalView();
    });
  }
}

function saveCurrentReflection() {
  const isoKey = getIsoDate(AppState.selectedDate);
  const devotional = getDevotionalForDate(AppState.selectedDate);

  if (!AppState.reflections[isoKey]) {
    AppState.reflections[isoKey] = {};
  }

  AppState.reflections[isoKey] = {
    ...AppState.reflections[isoKey],
    date: isoKey,
    dateString: devotional.dateString,
    title: devotional.title,
    passage: devotional.passage,
    heartState: document.getElementById('refl-heart-state')?.value || '',
    rhema: document.getElementById('refl-rhema')?.value || '',
    action: document.getElementById('refl-action')?.value || '',
    prayer: document.getElementById('refl-prayer')?.value || '',
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem('st_reflections', JSON.stringify(AppState.reflections));

  // Simpan ke Supabase jika terhubung
  if (typeof saveReflectionToCloud === 'function') {
    saveReflectionToCloud(AppState.reflections[isoKey]);
  }
}

function showSaveNotification() {
  const indicator = document.getElementById('save-status-indicator');
  if (indicator) {
    indicator.textContent = '✓ Tersimpan otomatis';
    indicator.classList.remove('opacity-0');
    setTimeout(() => {
      indicator.classList.add('opacity-0');
    }, 2000);
  }
}

// -------------------------------------------------------------
// TAB 2: VERSE OF THE DAY (AYAT HARI INI)
// -------------------------------------------------------------
function renderVerseView() {
  const verse = getVerseOfTheDay(AppState.selectedDate);

  document.getElementById('vod-date').textContent = verse.dateString;
  document.getElementById('vod-theme').textContent = verse.theme;
  document.getElementById('vod-text').textContent = `"${verse.text}"`;
  document.getElementById('vod-passage').textContent = verse.passage;
  document.getElementById('vod-prompt').textContent = verse.reflectionPrompt;

  // Tombol Salin Ayat
  const copyBtn = document.getElementById('btn-copy-verse');
  if (copyBtn) {
    copyBtn.onclick = () => {
      const fullText = `"${verse.text}"\n— ${verse.passage} (TB)\n\nAyat Hari Ini • Saat Teduh`;
      navigator.clipboard.writeText(fullText).then(() => {
        copyBtn.innerHTML = `
          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span>Tersalin!</span>
        `;
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
            <span>Salin Ayat</span>
          `;
        }, 2200);
      });
    };
  }

  // Tombol Bagikan WhatsApp
  const shareBtn = document.getElementById('btn-share-verse-wa');
  if (shareBtn) {
    shareBtn.onclick = () => {
      const waText = `✝️ *Verse of the Day • ${verse.dateString}*\n\n"${verse.text}"\n— *${verse.passage}* (TB)\n\n💭 _Renungan Singkat:_\n${verse.reflectionPrompt}\n\nSemoga menjadi berkat dan kekuatan bagimu hari ini! 🙏✨`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`, '_blank');
    };
  }

  // Generator Unduh Gambar Story (HTML5 Canvas)
  const downloadImgBtn = document.getElementById('btn-download-verse-image');
  if (downloadImgBtn) {
    downloadImgBtn.onclick = () => {
      generateVerseCardImage(verse);
    };
  }
}

// Generator Gambar Kartu Ayat yang Estetik dengan Canvas
function generateVerseCardImage(verse) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = 1080;
  const height = 1920; // 9:16 Instagram Story / WhatsApp Status
  canvas.width = width;
  canvas.height = height;

  // Background Gradient Teduh & Elegan
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1c1917'); // stone 900
  gradient.addColorStop(0.5, '#292524'); // stone 800
  gradient.addColorStop(1, '#0c0a09'); // stone 950
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Akses garis bingkai dekoratif emas
  ctx.strokeStyle = '#c29b38';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 60, width - 120, height - 120);

  // Cross Icon Simbol Salib Halus di Atas
  ctx.fillStyle = '#c29b38';
  // Vertikal
  ctx.fillRect(width / 2 - 4, 180, 8, 80);
  // Horisontal
  ctx.fillRect(width / 2 - 25, 205, 50, 8);

  // Header Subtitle
  ctx.textAlign = 'center';
  ctx.fillStyle = '#a8a29e';
  ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('VERSE OF THE DAY', width / 2, 310);

  ctx.fillStyle = '#e7e5e4';
  ctx.font = '400 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(verse.dateString, width / 2, 360);

  // Teks Ayat (Wrap text)
  ctx.fillStyle = '#fafaf9';
  ctx.font = 'italic 500 52px "Playfair Display", Georgia, serif';
  const maxWidth = width - 240;
  const words = `"${verse.text}"`.split(' ');
  let line = '';
  let y = 600;
  const lineHeight = 80;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, width / 2, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, width / 2, y);

  // Referensi Ayat
  y += 120;
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`— ${verse.passage} (TB)`, width / 2, y);

  // Pertanyaan Perenungan di Bagian Bawah
  y += 180;
  ctx.fillStyle = '#a8a29e';
  ctx.font = 'italic 34px "Plus Jakarta Sans", sans-serif';
  const promptWords = `Refleksi: ${verse.reflectionPrompt}`.split(' ');
  let pLine = '';
  for (let n = 0; n < promptWords.length; n++) {
    const testLine = pLine + promptWords[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(pLine, width / 2, y);
      pLine = promptWords[n] + ' ';
      y += 55;
    } else {
      pLine = testLine;
    }
  }
  ctx.fillText(pLine, width / 2, y);

  // Footer Branding
  ctx.fillStyle = '#78716c';
  ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Aplikasi Saat Teduh Kristen', width / 2, height - 120);

  // Download Trigger
  const link = document.createElement('a');
  link.download = `Ayat-Hari-Ini-${verse.passage.replace(/\s+/g, '-')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// -------------------------------------------------------------
// TAB 3: JURNAL MINGGUAN KHOTBAH GEREJA
// -------------------------------------------------------------
function setupSermonHandlers() {
  const addBtn = document.getElementById('btn-add-sermon');
  const cancelBtn = document.getElementById('btn-cancel-sermon');
  const form = document.getElementById('sermon-form');
  const searchInput = document.getElementById('sermon-search-input');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openSermonModal();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      closeSermonModal();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSermonNote();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.activeSermonFilter = e.target.value.toLowerCase();
      renderSermonList();
    });
  }
}

function openSermonModal(sermonId = null) {
  AppState.editingSermonId = sermonId;
  const modal = document.getElementById('sermon-modal');
  const modalTitle = document.getElementById('sermon-modal-title');

  if (sermonId) {
    const sermon = AppState.sermons.find(s => s.id === sermonId);
    if (sermon) {
      modalTitle.textContent = 'Edit Catatan Khotbah Minggu';
      document.getElementById('sermon-date').value = sermon.date;
      document.getElementById('sermon-session').value = sermon.session || 'Ibadah Raya 1';
      document.getElementById('sermon-church').value = sermon.church || '';
      document.getElementById('sermon-preacher').value = sermon.preacher || '';
      document.getElementById('sermon-title').value = sermon.title || '';
      document.getElementById('sermon-passage').value = sermon.passage || '';
      document.getElementById('sermon-notes').value = sermon.notes || '';
      document.getElementById('sermon-rhema').value = sermon.rhema || '';
      document.getElementById('sermon-action').value = sermon.action || '';
    }
  } else {
    modalTitle.textContent = 'Catat Khotbah Gereja Minggu Ini';
    document.getElementById('sermon-date').value = getIsoDate(new Date());
    document.getElementById('sermon-session').value = 'Ibadah Raya 1';
    document.getElementById('sermon-church').value = '';
    document.getElementById('sermon-preacher').value = '';
    document.getElementById('sermon-title').value = '';
    document.getElementById('sermon-passage').value = '';
    document.getElementById('sermon-notes').value = '';
    document.getElementById('sermon-rhema').value = '';
    document.getElementById('sermon-action').value = '';
  }

  modal.classList.remove('hidden');
}

function closeSermonModal() {
  const modal = document.getElementById('sermon-modal');
  modal.classList.add('hidden');
  AppState.editingSermonId = null;
}

function saveSermonNote() {
  const dateVal = document.getElementById('sermon-date').value;
  const dateObj = new Date(dateVal);
  const dateString = dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const sermonData = {
    id: AppState.editingSermonId || 'sermon-' + Date.now(),
    date: dateVal,
    dateString: dateString,
    session: document.getElementById('sermon-session').value,
    church: document.getElementById('sermon-church').value,
    preacher: document.getElementById('sermon-preacher').value,
    title: document.getElementById('sermon-title').value,
    passage: document.getElementById('sermon-passage').value,
    notes: document.getElementById('sermon-notes').value,
    rhema: document.getElementById('sermon-rhema').value,
    action: document.getElementById('sermon-action').value,
    createdAt: new Date().toISOString()
  };

  if (AppState.editingSermonId) {
    const idx = AppState.sermons.findIndex(s => s.id === AppState.editingSermonId);
    if (idx !== -1) {
      AppState.sermons[idx] = sermonData;
    }
  } else {
    AppState.sermons.unshift(sermonData);
  }

  localStorage.setItem('st_sermons', JSON.stringify(AppState.sermons));
  if (typeof saveSermonToCloud === 'function') {
    saveSermonToCloud(sermonData);
  }
  closeSermonModal();
  renderSermonList();
}

function deleteSermon(id) {
  if (confirm('Apakah kamu yakin ingin menghapus catatan khotbah ini?')) {
    AppState.sermons = AppState.sermons.filter(s => s.id !== id);
    localStorage.setItem('st_sermons', JSON.stringify(AppState.sermons));
    if (typeof deleteSermonFromCloud === 'function') {
      deleteSermonFromCloud(id);
    }
    renderSermonList();
  }
}

function renderSermonView() {
  renderSermonList();
}

function renderSermonList() {
  const container = document.getElementById('sermon-list-container');
  const emptyState = document.getElementById('sermon-empty-state');
  if (!container) return;

  let filtered = AppState.sermons;
  if (AppState.activeSermonFilter) {
    const query = AppState.activeSermonFilter;
    filtered = filtered.filter(s =>
      (s.title && s.title.toLowerCase().includes(query)) ||
      (s.preacher && s.preacher.toLowerCase().includes(query)) ||
      (s.church && s.church.toLowerCase().includes(query)) ||
      (s.passage && s.passage.toLowerCase().includes(query)) ||
      (s.notes && s.notes.toLowerCase().includes(query))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = filtered.map(sermon => `
    <div class="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              ${sermon.session || 'Ibadah Minggu'}
            </span>
            <span class="text-xs text-stone-500 dark:text-stone-400">
              ${sermon.dateString}
            </span>
          </div>
          <h3 class="text-xl font-bold text-stone-900 dark:text-stone-100 font-serif-bible">
            ${sermon.title || 'Tanpa Judul'}
          </h3>
          <p class="text-sm font-medium text-amber-700 dark:text-amber-400">
            Nats: ${sermon.passage || '-'}
          </p>
        </div>
        <div class="flex items-center gap-2 no-print">
          <button onclick="openSermonModal('${sermon.id}')" class="p-2 text-stone-600 hover:text-amber-600 dark:text-stone-300 dark:hover:text-amber-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-sm flex items-center gap-1" title="Edit">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            Edit
          </button>
          <button onclick="shareSermonWhatsApp('${sermon.id}')" class="p-2 text-stone-600 hover:text-emerald-600 dark:text-stone-300 dark:hover:text-emerald-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-sm flex items-center gap-1" title="Bagikan WA">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            Bagikan
          </button>
          <button onclick="deleteSermon('${sermon.id}')" class="p-2 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-sm" title="Hapus">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>

      <div class="text-xs text-stone-500 dark:text-stone-400 mb-4 flex flex-wrap gap-4 border-b border-stone-100 dark:border-stone-700 pb-3">
        <span>⛪ Gereja: <strong class="text-stone-700 dark:text-stone-300">${sermon.church || '-'}</strong></span>
        <span>🎙️ Pembicara: <strong class="text-stone-700 dark:text-stone-300">${sermon.preacher || '-'}</strong></span>
      </div>

      <!-- Poin Khotbah -->
      <div class="space-y-4 text-sm text-stone-700 dark:text-stone-200">
        <div>
          <h4 class="font-semibold text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-1.5">
            📝 Poin Utama Khotbah:
          </h4>
          <div class="bg-stone-50 dark:bg-stone-900/60 p-4 rounded-xl border border-stone-200/60 dark:border-stone-700/60 whitespace-pre-line leading-relaxed">
            ${sermon.notes || 'Belum ada catatan.'}
          </div>
        </div>

        ${sermon.rhema ? `
          <div class="bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
            <h4 class="font-semibold text-amber-900 dark:text-amber-200 mb-1">
              ✨ Pesan Rhema untukku:
            </h4>
            <p class="text-amber-950 dark:text-amber-100 italic leading-relaxed">${sermon.rhema}</p>
          </div>
        ` : ''}

        ${sermon.action ? `
          <div class="bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
            <h4 class="font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
              🎯 Komitmen Tindakan Nyata Minggu Ini:
            </h4>
            <p class="text-emerald-950 dark:text-emerald-100 leading-relaxed">${sermon.action}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function shareSermonWhatsApp(id) {
  const sermon = AppState.sermons.find(s => s.id === id);
  if (!sermon) return;

  const text = `⛪ *Catatan Khotbah Minggu* 📖\n_${sermon.dateString} (${sermon.session || 'Ibadah'})_\n\n*Tema:* ${sermon.title}\n*Nats Alkitab:* ${sermon.passage}\n*Gereja / Pengkhotbah:* ${sermon.church || '-'} / ${sermon.preacher || '-'}\n\n*Poin Utama:* \n${sermon.notes}\n\n✨ *Pesan Rhema:* \n${sermon.rhema || '-'}\n\n🎯 *Komitmen Minggu Ini:* \n${sermon.action || '-'}\n\nKiranya firman ini terus bertumbuh dan berbuah dalam hidup kita! 🙏`;

  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
}

// -------------------------------------------------------------
// TAB 4: RIWAYAT & ARSIP SAAT TEDUH
// -------------------------------------------------------------
function renderHistoryView() {
  const container = document.getElementById('history-list-container');
  const emptyState = document.getElementById('history-empty-state');
  if (!container) return;

  const entries = Object.values(AppState.reflections)
    .filter(r => r.rhema || r.prayer || r.action || r.isCompleted)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (entries.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = entries.map(entry => `
    <div class="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm p-6">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${entry.isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300'}">
            ${entry.isCompleted ? '✓ Selesai' : 'Belum Selesai'}
          </span>
          <span class="text-xs text-stone-500 dark:text-stone-400 ml-2">
            ${entry.dateString || entry.date}
          </span>
        </div>
        ${entry.heartState ? `
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/50">
            Kondisi Hati: ${entry.heartState}
          </span>
        ` : ''}
      </div>

      <h3 class="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif-bible mb-1">
        ${entry.title || 'Renungan Harian'}
      </h3>
      <p class="text-xs text-stone-500 dark:text-stone-400 mb-4">
        Bacaan: ${entry.passage || '-'}
      </p>

      <div class="space-y-3 text-sm">
        ${entry.rhema ? `
          <div class="bg-stone-50 dark:bg-stone-900/60 p-3.5 rounded-xl border border-stone-200/60 dark:border-stone-700">
            <h5 class="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1">Pesan Firman / Rhema:</h5>
            <p class="text-stone-800 dark:text-stone-200 leading-relaxed">${entry.rhema}</p>
          </div>
        ` : ''}

        ${entry.action ? `
          <div class="bg-amber-50/70 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
            <h5 class="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Langkah Penerapan:</h5>
            <p class="text-amber-950 dark:text-amber-100 leading-relaxed">${entry.action}</p>
          </div>
        ` : ''}

        ${entry.prayer ? `
          <div class="bg-blue-50/70 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-800/40">
            <h5 class="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Doa Pribadi:</h5>
            <p class="text-blue-950 dark:text-blue-100 italic leading-relaxed">${entry.prayer}</p>
          </div>
        ` : ''}
      </div>

      <div class="mt-4 pt-3 border-t border-stone-100 dark:border-stone-700 flex justify-end">
        <button onclick="jumpToDevotionalDate('${entry.date}')" class="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1">
          Buka Renungan Tanggal Ini →
        </button>
      </div>
    </div>
  `).join('');
}

function jumpToDevotionalDate(isoDateStr) {
  const [y, m, d] = isoDateStr.split('-').map(Number);
  AppState.selectedDate = new Date(y, m - 1, d);
  syncDatePicker();
  switchTab('devotional');
}

// -------------------------------------------------------------
// TAB 5: PENGATURAN & CADANGAN DATA (BACKUP/RESTORE)
// -------------------------------------------------------------
function setupSettingsHandlers() {
  // Theme selectors
  document.querySelectorAll('[data-theme-choice]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.getAttribute('data-theme-choice');
      applyTheme(t);
    });
  });

  // Font size selectors
  document.querySelectorAll('[data-font-choice]').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.getAttribute('data-font-choice');
      applyFontSize(f);
    });
  });

  // Export JSON Backup
  const exportBtn = document.getElementById('btn-export-data');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const backup = {
        app: "SaatTeduhKristen",
        exportDate: new Date().toISOString(),
        reflections: AppState.reflections,
        sermons: AppState.sermons
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Saat-Teduh-Backup-${getIsoDate(new Date())}.json`;
      a.click();
    });
  }

  // Import JSON Backup
  const importFile = document.getElementById('input-import-file');
  if (importFile) {
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.reflections) {
            AppState.reflections = { ...AppState.reflections, ...data.reflections };
            localStorage.setItem('st_reflections', JSON.stringify(AppState.reflections));
          }
          if (data.sermons && Array.isArray(data.sermons)) {
            // Gabungkan catatan khotbah tanpa duplikasi ID
            const existingIds = new Set(AppState.sermons.map(s => s.id));
            const newSermons = data.sermons.filter(s => !existingIds.has(s.id));
            AppState.sermons = [...newSermons, ...AppState.sermons];
            localStorage.setItem('st_sermons', JSON.stringify(AppState.sermons));
          }
          alert('Data cadangan berhasil dipulihkan!');
          location.reload();
        } catch (err) {
          alert('Gagal membaca file cadangan. Format JSON tidak valid.');
        }
      };
      reader.readAsText(file);
    });
  }
}

function renderSettingsView() {
  // Update akun di tab pengaturan
  if (typeof updateAuthUI === 'function' && typeof currentUser !== 'undefined') {
    updateAuthUI(currentUser);
  }

  // Update state tombol tema
  document.querySelectorAll('[data-theme-choice]').forEach(btn => {
    const isCur = btn.getAttribute('data-theme-choice') === AppState.theme;
    btn.classList.toggle('ring-2', isCur);
    btn.classList.toggle('ring-amber-500', isCur);
  });

  // Update statistik
  const totalRefl = Object.values(AppState.reflections).filter(r => r.isCompleted).length;
  const totalSermons = AppState.sermons.length;

  document.getElementById('stat-total-reflections').textContent = totalRefl;
  document.getElementById('stat-total-sermons').textContent = totalSermons;
}

function applyTheme(themeName) {
  AppState.theme = themeName;
  localStorage.setItem('st_theme', themeName);

  document.body.classList.remove('theme-sepia', 'theme-dark');
  if (themeName === 'sepia') {
    document.body.classList.add('theme-sepia');
  } else if (themeName === 'dark') {
    document.body.classList.add('theme-dark');
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function applyFontSize(size) {
  AppState.fontSize = size;
  localStorage.setItem('st_fontSize', size);

  const devoContent = document.getElementById('devo-content');
  if (!devoContent) return;

  devoContent.classList.remove('text-base', 'text-lg', 'text-xl');
  if (size === 'large') {
    devoContent.classList.add('text-lg');
  } else if (size === 'xlarge') {
    devoContent.classList.add('text-xl');
  } else {
    devoContent.classList.add('text-base');
  }
}

// -------------------------------------------------------------
// STREAK TRACKER & CELEBRATION
// -------------------------------------------------------------
function updateStreakDisplay() {
  const streakBadge = document.getElementById('streak-count-display');
  if (!streakBadge) return;

  let currentStreak = 0;
  let checkDate = new Date();

  // Hitung berapa hari berturut-turut selesai
  while (true) {
    const iso = getIsoDate(checkDate);
    const refl = AppState.reflections[iso];
    if (refl && refl.isCompleted) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Jika hari ini belum ditandai, periksa apakah kemarin selesai
      if (currentStreak === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayIso = getIsoDate(checkDate);
        const yRefl = AppState.reflections[yesterdayIso];
        if (yRefl && yRefl.isCompleted) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }

  streakBadge.textContent = `${currentStreak} Hari Berturut-turut`;
}

function triggerConfettiCelebration() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.remove('hidden');

  const particles = [];
  const colors = ['#c29b38', '#52796f', '#e0a96d', '#60a5fa', '#34d399', '#f472b6'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 14,
      color: colors[Math.floor(Math.random() * colors.length)],
      radius: Math.random() * 6 + 3,
      alpha: 1,
      decay: Math.random() * 0.015 + 0.01
    });
  }

  let animId;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.alpha -= p.decay;

      if (p.alpha > 0) {
        alive++;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    if (alive > 0) {
      animId = requestAnimationFrame(update);
    } else {
      canvas.classList.add('hidden');
      cancelAnimationFrame(animId);
    }
  }

  update();
}

// -------------------------------------------------------------
// AMBIENT AUDIO PLAYER CONTROLLER
// -------------------------------------------------------------
function setupAudioControls() {
  const audioBtn = document.getElementById('btn-toggle-ambient');
  const audioEq = document.getElementById('ambient-equalizer');
  const audioText = document.getElementById('ambient-status-text');

  if (audioBtn && window.ambientPlayer) {
    audioBtn.addEventListener('click', () => {
      const playing = window.ambientPlayer.toggle();
      if (playing) {
        if (audioEq) audioEq.classList.remove('hidden');
        if (audioText) audioText.textContent = 'Musik Doa: Aktif';
        audioBtn.classList.add('bg-amber-100', 'text-amber-900', 'dark:bg-amber-900/60', 'dark:text-amber-200');
      } else {
        if (audioEq) audioEq.classList.add('hidden');
        if (audioText) audioText.textContent = 'Musik Doa';
        audioBtn.classList.remove('bg-amber-100', 'text-amber-900', 'dark:bg-amber-900/60', 'dark:text-amber-200');
      }
    });
  }
}

// -------------------------------------------------------------
// PENGINGAT NOTIFIKASI SAAT TEDUH (SETTINGS TAB)
// -------------------------------------------------------------
function setupNotificationSettings() {
  const toggle = document.getElementById('toggle-notif-enabled');
  const timePicker = document.getElementById('notif-time-picker');
  const testBtn = document.getElementById('btn-test-notification');

  if (!window.NotificationManager) return;

  const currentSettings = window.NotificationManager.getSettings();
  if (toggle) toggle.checked = currentSettings.enabled;
  if (timePicker) timePicker.value = currentSettings.time || '06:00';

  if (toggle) {
    toggle.addEventListener('change', async (e) => {
      if (e.target.checked) {
        const granted = await window.NotificationManager.requestPermission();
        if (!granted) {
          e.target.checked = false;
          alert('Izin notifikasi tidak diberikan. Harap aktifkan izin notifikasi pada pengaturan browser / ponsel Anda.');
          return;
        }
        const settings = window.NotificationManager.getSettings();
        settings.enabled = true;
        window.NotificationManager.saveSettings(settings);
      } else {
        const settings = window.NotificationManager.getSettings();
        settings.enabled = false;
        window.NotificationManager.saveSettings(settings);
      }
    });
  }

  if (timePicker) {
    timePicker.addEventListener('change', (e) => {
      const settings = window.NotificationManager.getSettings();
      settings.time = e.target.value;
      window.NotificationManager.saveSettings(settings);
    });
  }

  if (testBtn) {
    testBtn.addEventListener('click', () => {
      window.NotificationManager.sendTestNotification();
    });
  }
}

