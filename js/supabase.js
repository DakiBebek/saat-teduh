/**
 * Integrasi Supabase Cloud Database & Auth
 * - Halaman Login / Registrasi Otomatis (Gated App)
 * - Registrasi Langsung Masuk (Tanpa perlu verifikasi email)
 * - Sinkronisasi data Saat Teduh dan Jurnal Khotbah antar perangkat (HP & Laptop)
 */

const SUPABASE_URL = "https://ivxdcsdhucbpmvolbmuy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2eGRjc2RodWNicG12b2xibXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzMzE3MDIsImV4cCI6MjExMDkwNzcwMn0.hhoaes8YYVanIjCIBI6BBtQ8jLEERByZxGqdcVQDu4M";

let supabaseClient = null;
let currentUser = null;

function initSupabase() {
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    checkSession();
    setupAuthListeners();
  } else {
    console.warn("Supabase SDK belum dimuat.");
    // Fallback: biarkan mode lokal berjalan jika offline
    toggleAppVisibility(true);
  }
}

// Cek sesi login saat ini
async function checkSession() {
  if (!supabaseClient) return;
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (session && session.user) {
      currentUser = session.user;
      toggleAppVisibility(true);
      updateAuthUI(currentUser);
      syncFromCloud();
    } else {
      currentUser = null;
      // Periksa apakah pengguna memilih mode tamu
      const isGuest = sessionStorage.getItem('st_guest_mode') === 'true';
      if (isGuest) {
        toggleAppVisibility(true);
        updateAuthUI(null);
      } else {
        toggleAppVisibility(false); // Tampilkan halaman login
      }
    }
  } catch (err) {
    console.error("Gagal memeriksa sesi Supabase:", err);
    toggleAppVisibility(true);
  }
}

function setupAuthListeners() {
  if (!supabaseClient) return;
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
      currentUser = session.user;
      sessionStorage.removeItem('st_guest_mode');
      toggleAppVisibility(true);
      updateAuthUI(currentUser);
      await syncLocalToCloud();
      await syncFromCloud();
    } else {
      currentUser = null;
      const isGuest = sessionStorage.getItem('st_guest_mode') === 'true';
      if (!isGuest) {
        toggleAppVisibility(false);
      } else {
        updateAuthUI(null);
      }
    }
  });
}

// Mengatur visibilitas antara Halaman Login vs Halaman Utama Aplikasi
function toggleAppVisibility(isLoggedInOrGuest) {
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.getElementById('app-container');

  if (isLoggedInOrGuest) {
    if (loginScreen) loginScreen.classList.add('hidden');
    if (appContainer) appContainer.classList.remove('hidden');
  } else {
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (appContainer) appContainer.classList.add('hidden');
  }
}

function continueAsGuest() {
  sessionStorage.setItem('st_guest_mode', 'true');
  toggleAppVisibility(true);
  updateAuthUI(null);
}

function updateAuthUI(user) {
  const accountCard = document.getElementById('settings-account-card');
  if (!accountCard) return;

  if (user) {
    const initial = (user.email ? user.email[0] : 'U').toUpperCase();
    accountCard.innerHTML = `
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-lg flex items-center justify-center shrink-0">
            ${initial}
          </div>
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <h4 class="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 font-serif-bible">
                Akun Terhubung
              </h4>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Cloud Aktif
              </span>
            </div>
            <p class="text-xs text-stone-600 dark:text-stone-300 font-medium break-all">
              ${user.email}
            </p>
            <p class="text-[11px] text-stone-400 mt-1">
              Refleksi & catatan khotbah tersinkron otomatis antar HP & Laptop.
            </p>
          </div>
        </div>

        <button onclick="handleSignOut()" class="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center justify-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span>Keluar Akun (Logout)</span>
        </button>
      </div>
    `;
  } else {
    accountCard.innerHTML = `
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h4 class="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 font-serif-bible">
              Akun & Sinkronisasi Cloud
            </h4>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
              Mode Tamu (Offline)
            </span>
          </div>
          <p class="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Catatan saat ini hanya tersimpan di memori HP ini. Masuk atau buat akun agar otomatis tersimpan di cloud Supabase.
          </p>
        </div>

        <button onclick="openLoginView()" class="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
          <span>Masuk / Buat Akun Cloud</span>
        </button>
      </div>
    `;
  }
}

// -------------------------------------------------------------
// SINKRONISASI DATA LOCALSTORAGE <-> SUPABASE
// -------------------------------------------------------------
async function syncFromCloud() {
  if (!supabaseClient || !currentUser) return;

  try {
    // 1. Tarik Refleksi
    const { data: cloudReflections, error: errRefl } = await supabaseClient
      .from('reflections')
      .select('*')
      .order('date', { ascending: false });

    if (!errRefl && cloudReflections) {
      cloudReflections.forEach(row => {
        const iso = row.date;
        if (!AppState.reflections[iso] || new Date(row.updated_at) > new Date(AppState.reflections[iso].updatedAt || 0)) {
          AppState.reflections[iso] = {
            date: row.date,
            dateString: row.date_string,
            title: row.title,
            passage: row.passage,
            heartState: row.heart_state,
            rhema: row.rhema,
            action: row.action_plan,
            prayer: row.prayer,
            isCompleted: row.is_completed,
            updatedAt: row.updated_at
          };
        }
      });
      localStorage.setItem('st_reflections', JSON.stringify(AppState.reflections));
    }

    // 2. Tarik Catatan Khotbah
    const { data: cloudSermons, error: errSerm } = await supabaseClient
      .from('sermons')
      .select('*')
      .order('date', { ascending: false });

    if (!errSerm && cloudSermons) {
      const sermonMap = new Map();
      AppState.sermons.forEach(s => sermonMap.set(s.id, s));
      cloudSermons.forEach(row => {
        sermonMap.set(row.id, {
          id: row.id,
          date: row.date,
          dateString: row.date_string,
          session: row.session,
          church: row.church,
          preacher: row.preacher,
          title: row.title,
          passage: row.passage,
          notes: row.notes,
          rhema: row.rhema,
          action: row.action_plan,
          createdAt: row.created_at
        });
      });
      AppState.sermons = Array.from(sermonMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
      localStorage.setItem('st_sermons', JSON.stringify(AppState.sermons));
    }

    if (typeof renderCurrentTab === 'function') renderCurrentTab();
    if (typeof updateStreakDisplay === 'function') updateStreakDisplay();
  } catch (err) {
    console.error("Gagal sinkron dari cloud:", err);
  }
}

async function syncLocalToCloud() {
  if (!supabaseClient || !currentUser) return;

  try {
    // 1. Upload Refleksi Lokal
    const reflEntries = Object.values(AppState.reflections);
    for (const r of reflEntries) {
      if (r.date) {
        await supabaseClient.from('reflections').upsert({
          user_id: currentUser.id,
          date: r.date,
          date_string: r.dateString,
          title: r.title,
          passage: r.passage,
          heart_state: r.heartState,
          rhema: r.rhema,
          action_plan: r.action,
          prayer: r.prayer,
          is_completed: !!r.isCompleted,
          updated_at: r.updatedAt || new Date().toISOString()
        }, { onConflict: 'user_id,date' });
      }
    }

    // 2. Upload Khotbah Lokal
    for (const s of AppState.sermons) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.id);
      const rowId = isUuid ? s.id : undefined;

      await supabaseClient.from('sermons').upsert({
        ...(rowId ? { id: rowId } : {}),
        user_id: currentUser.id,
        date: s.date,
        date_string: s.dateString,
        session: s.session,
        church: s.church,
        preacher: s.preacher,
        title: s.title,
        passage: s.passage,
        notes: s.notes,
        rhema: s.rhema,
        action_plan: s.action
      });
    }
  } catch (err) {
    console.error("Gagal upload lokal ke cloud:", err);
  }
}

async function saveReflectionToCloud(reflectionData) {
  if (!supabaseClient || !currentUser) return;
  try {
    await supabaseClient.from('reflections').upsert({
      user_id: currentUser.id,
      date: reflectionData.date,
      date_string: reflectionData.dateString,
      title: reflectionData.title,
      passage: reflectionData.passage,
      heart_state: reflectionData.heartState,
      rhema: reflectionData.rhema,
      action_plan: reflectionData.action,
      prayer: reflectionData.prayer,
      is_completed: !!reflectionData.isCompleted,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,date' });
  } catch (err) {
    console.error("Gagal simpan refleksi ke Supabase:", err);
  }
}

async function saveSermonToCloud(sermonData) {
  if (!supabaseClient || !currentUser) return;
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sermonData.id);
    const rowId = isUuid ? sermonData.id : undefined;

    const { data, error } = await supabaseClient.from('sermons').upsert({
      ...(rowId ? { id: rowId } : {}),
      user_id: currentUser.id,
      date: sermonData.date,
      date_string: sermonData.dateString,
      session: sermonData.session,
      church: sermonData.church,
      preacher: sermonData.preacher,
      title: sermonData.title,
      passage: sermonData.passage,
      notes: sermonData.notes,
      rhema: sermonData.rhema,
      action_plan: sermonData.action
    }).select().single();

    if (!error && data && data.id) {
      sermonData.id = data.id;
    }
  } catch (err) {
    console.error("Gagal simpan khotbah ke Supabase:", err);
  }
}

async function deleteSermonFromCloud(sermonId) {
  if (!supabaseClient || !currentUser) return;
  try {
    await supabaseClient.from('sermons').delete().eq('id', sermonId);
  } catch (err) {
    console.error("Gagal hapus khotbah dari Supabase:", err);
  }
}

// -------------------------------------------------------------
// AUTH ACTIONS: LOGIN, REGISTER (TANPA VERIFIKASI EMAIL), LOGOUT
// -------------------------------------------------------------
async function handleLoginSubmit(event) {
  event.preventDefault();
  if (!supabaseClient) return;

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const isRegisterMode = document.getElementById('auth-mode-toggle').dataset.mode === 'register';
  const msgEl = document.getElementById('login-status-message');
  const submitBtn = document.getElementById('btn-auth-submit');

  msgEl.className = "text-xs font-medium";
  msgEl.textContent = isRegisterMode ? "Sedang mendaftarkan akun..." : "Sedang masuk...";
  submitBtn.disabled = true;

  try {
    if (isRegisterMode) {
      // 1. Registrasi Akun
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
      });

      if (error) {
        msgEl.className = "text-xs font-medium text-rose-600 dark:text-rose-400";
        msgEl.textContent = `Pendaftaran gagal: ${error.message}`;
        submitBtn.disabled = false;
        return;
      }

      // 2. Langsung Auto-Login tanpa menunggu verifikasi email!
      const { data: loginData, error: loginErr } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (!loginErr && loginData.session) {
        currentUser = loginData.session.user;
        toggleAppVisibility(true);
        updateAuthUI(currentUser);
      } else {
        // Jika login langsung berhasil atau butuh 1 klik
        msgEl.className = "text-xs font-medium text-emerald-600 dark:text-emerald-400";
        msgEl.textContent = "Pendaftaran sukses! Sedang memuat saat teduh...";
        setTimeout(() => {
          checkSession();
        }, 800);
      }
    } else {
      // Login Biasa
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        msgEl.className = "text-xs font-medium text-rose-600 dark:text-rose-400";
        msgEl.textContent = `Gagal masuk: ${error.message}`;
        submitBtn.disabled = false;
        return;
      }

      currentUser = data.user;
      toggleAppVisibility(true);
      updateAuthUI(currentUser);
    }
  } catch (e) {
    msgEl.className = "text-xs font-medium text-rose-600 dark:text-rose-400";
    msgEl.textContent = "Terjadi kesalahan koneksi. Silakan coba lagi.";
  } finally {
    submitBtn.disabled = false;
  }
}

function toggleAuthMode() {
  const toggleBtn = document.getElementById('auth-mode-toggle');
  const title = document.getElementById('auth-card-title');
  const subtitle = document.getElementById('auth-card-subtitle');
  const submitBtn = document.getElementById('btn-auth-submit');
  const msgEl = document.getElementById('login-status-message');
  msgEl.textContent = '';

  const isRegister = toggleBtn.dataset.mode === 'register';

  if (isRegister) {
    // Ubah ke mode LOGIN
    toggleBtn.dataset.mode = 'login';
    title.textContent = 'Masuk ke Saat Teduh';
    subtitle.textContent = 'Lanjutkan perjalanan rohani dan renungan harianmu.';
    submitBtn.textContent = 'Masuk (Login)';
    toggleBtn.innerHTML = 'Belum punya akun? <span class="font-bold underline text-amber-600">Daftar Baru (Tanpa Verifikasi)</span>';
  } else {
    // Ubah ke mode REGISTER
    toggleBtn.dataset.mode = 'register';
    title.textContent = 'Buat Akun Saat Teduh';
    subtitle.textContent = 'Daftar instan tanpa ribet, langsung aktif tanpa tunggu email.';
    submitBtn.textContent = 'Daftar & Langsung Masuk';
    toggleBtn.innerHTML = 'Sudah punya akun? <span class="font-bold underline text-amber-600">Masuk di sini</span>';
  }
}

function openLoginView() {
  sessionStorage.removeItem('st_guest_mode');
  toggleAppVisibility(false);
}

async function handleSignOut() {
  if (!supabaseClient) return;
  if (confirm('Keluar dari akun? Catatan Anda tetap tersimpan aman di cloud.')) {
    await supabaseClient.auth.signOut();
    currentUser = null;
    sessionStorage.removeItem('st_guest_mode');
    toggleAppVisibility(false);
  }
}

// Inisialisasi saat window dimuat
window.addEventListener('DOMContentLoaded', () => {
  initSupabase();
});
