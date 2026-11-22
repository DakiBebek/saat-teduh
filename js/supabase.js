/**
 * Integrasi Supabase Cloud Database & Auth
 * Sinkronisasi data Saat Teduh dan Jurnal Khotbah antar perangkat (HP & Laptop).
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
  }
}

// Cek sesi login saat ini
async function checkSession() {
  if (!supabaseClient) return;
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (session && session.user) {
      currentUser = session.user;
      updateAuthUI(currentUser);
      syncFromCloud();
    } else {
      currentUser = null;
      updateAuthUI(null);
    }
  } catch (err) {
    console.error("Gagal memeriksa sesi Supabase:", err);
  }
}

function setupAuthListeners() {
  if (!supabaseClient) return;
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
      currentUser = session.user;
      updateAuthUI(currentUser);
      await syncLocalToCloud();
      await syncFromCloud();
    } else {
      currentUser = null;
      updateAuthUI(null);
    }
  });
}

function updateAuthUI(user) {
  const authContainer = document.getElementById('auth-header-container');
  if (!authContainer) return;

  if (user) {
    const emailShort = user.email ? user.email.split('@')[0] : 'Akun';
    authContainer.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" title="Cloud Terhubung: ${user.email}">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="max-w-[100px] truncate">${emailShort}</span>
        </span>
        <button onclick="handleSignOut()" class="text-xs text-stone-500 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 p-1" title="Keluar Akun">
          Keluar
        </button>
      </div>
    `;
  } else {
    authContainer.innerHTML = `
      <button onclick="openAuthModal()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all" title="Masuk untuk sinkronisasi otomatis antar HP & Laptop">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
        <span>Sinkron Cloud</span>
      </button>
    `;
  }
}

// -------------------------------------------------------------
// SINKRONISASI DATA LOCALSTORAGE <-> SUPABASE
// -------------------------------------------------------------

// Tarik data dari Supabase Cloud ke LocalStorage
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
      // Tambahkan lokal dulu
      AppState.sermons.forEach(s => sermonMap.set(s.id, s));
      // Timpa atau tambah dari cloud
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

    // Render ulang tampilan aktif
    renderCurrentTab();
    updateStreakDisplay();
  } catch (err) {
    console.error("Gagal sinkron dari cloud:", err);
  }
}

// Unggah data lokal yang ada saat pertama kali login ke Cloud
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
      // Pastikan format id UUID valid untuk supabase
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

// Simpan SATU refleksi ke Supabase saat diedit
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

// Simpan SATU catatan khotbah ke Supabase
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

// Hapus catatan khotbah dari Supabase
async function deleteSermonFromCloud(sermonId) {
  if (!supabaseClient || !currentUser) return;
  try {
    await supabaseClient.from('sermons').delete().eq('id', sermonId);
  } catch (err) {
    console.error("Gagal hapus khotbah dari Supabase:", err);
  }
}

// -------------------------------------------------------------
// AUTH MODAL HANDLERS
// -------------------------------------------------------------
function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleSignIn(email, password) {
  if (!supabaseClient) return;
  const msgEl = document.getElementById('auth-error-msg');
  if (msgEl) msgEl.textContent = '';

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    if (msgEl) msgEl.textContent = error.message;
  } else {
    closeAuthModal();
  }
}

async function handleSignUp(email, password) {
  if (!supabaseClient) return;
  const msgEl = document.getElementById('auth-error-msg');
  if (msgEl) msgEl.textContent = '';

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) {
    if (msgEl) msgEl.textContent = error.message;
  } else {
    alert('Pendaftaran berhasil! Akun Anda sudah aktif dan siap sinkron.');
    closeAuthModal();
  }
}

async function handleSignOut() {
  if (!supabaseClient) return;
  if (confirm('Keluar dari akun Supabase? Catatan di perangkat ini akan tetap tersimpan.')) {
    await supabaseClient.auth.signOut();
    currentUser = null;
    updateAuthUI(null);
  }
}

// Jalankan inisialisasi saat window dimuat
window.addEventListener('DOMContentLoaded', () => {
  initSupabase();
});
