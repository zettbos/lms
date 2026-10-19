# MASTER BLUEPRINT: REVISI 99 - CLOUD-NATIVE STUDENT PROGRESS SYNC & REALTIME ANALYTICS MONITORING
====================================================================================================
STATUS DOKUMEN   : SELESAI DITERAPKAN (IMPLEMENTED & FULLY VERIFIED)
ARSITEK SISTEM   : ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
KODE REVISI      : REV-20261019-PROGRESS-CLOUD-SYNC-REALTIME
TANGGAL PERANCANGAN : 19 Oktober 2026
LANDASAN TEORI   : Event-Driven Realtime Propagation, State Synchronization, Multi-Device Cloud-Native Progress
====================================================================================================

---

## 1. LATAR BELAKANG & DIAGNOSIS MASALAH

### 🔴 MASALAH: Monitoring Progres Siswa di Admin Masih 0% & Belum Realtime
- **Gejala:** 
  Pada panel Admin tab "Monitoring Progres Belajar Seluruh Siswa" (2.458 Siswa), seluruh metrik kelulusan, siswa belajar, dan materi selesai masih tertulis `0 dari 36 Materi (0%) • Belum Mulai`, padahal siswa di luar sana sudah mulai belajar dan menekan tombol *"Tandai Selesai"*.
- **Akar Masalah (Root Cause):**
  1. **Progress Tersimpan Lokal di Browser Siswa:** Pada [classroom.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/controllers/classroom.js), ketika siswa menekan *"Tandai Selesai & Lanjut"* (`advanceToNextLesson`), data hanya disimpan ke memori lokal `localStorage.setItem('zett_progress', ...)`. Data ini tertahan di HP/laptop siswa dan sama sekali tidak pernah dikirimkan ke cloud.
  2. **Tabel Database `member_progress` Kosong Melompong:** Meskipun tabel `member_progress` telah dibuat di Supabase, belum pernah ada pemanggilan API atau Supabase query (`insert`/`upsert`/`delete`) dari JavaScript untuk mencatat progres belajar siswa.
  3. **Admin Monitoring Membaca LocalStorage Laptop Sendiri:** Dashboard Admin di [admin.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/controllers/admin.js) menghitung persentase dari `AppState.progress[m.email]` yang ada di memori browser laptop Admin sendiri. Karena siswa belajar di perangkat lain dan belum mengunggah progres ke Cloud, laptop Admin tidak memiliki data progres dari 2.458 siswa tersebut.
  4. **Multi-Device Siswa Terputus:** Siswa yang belajar di HP dan kemudian login di laptop pribadinya akan mendapati progresnya kembali 0% karena progres tidak ditarik dari Cloud saat login.

---

## 2. ARSITEKTUR SOLUSI CLOUD-NATIVE & REALTIME

```
[ Siswa Menandai Selesai di HP / Laptop ]
                   │
                   ▼ (1) Auto-Push Instan
   [ Supabase: public.member_progress ]
        (user_email, lesson_id, now())
         │                          │
         │ (2) Realtime Event       │ (3) Auto-Pull saat Login
         ▼ (postgres_changes)       ▼
[ Admin Monitoring Dashboard ]   [ Siswa Buka di Device Lain ]
(Angka Terupdate Realtime!)       (Centang Hijau Tersinkron!)
```

### 🎯 1. Auto-Push Sisi Siswa (`classroom.js` & `supabase.js`)
- Saat siswa mencentang materi selesai (`advanceToNextLesson(true)` atau `toggleLessonCompletion`):
  - Sistem memperbarui state lokal `AppState.progress[user.email]`.
  - Sistem memanggil `ZettSupabase.pushMemberLessonProgress(user.email, lesson.id)` untuk meng-upsert baris ke `public.member_progress` di Supabase.
- Saat siswa membatalkan centang materi selesai:
  - Sistem menghapus dari state lokal.
  - Sistem memanggil `ZettSupabase.removeMemberLessonProgress(user.email, lesson.id)` untuk men-delete baris dari `public.member_progress` di Supabase.

### 🎯 2. Auto-Pull Sisi Siswa saat Login & Masuk Kelas (`auth.js` & `classroom.js`)
- Saat siswa berhasil login di perangkat mana pun (HP atau laptop), sistem otomatis memanggil `ZettSupabase.pullMemberProgress(user.email)`.
- Mengisi `AppState.progress[user.email]` dengan seluruh `lesson_id` yang sudah diselesaikan dari Cloud.
- Menjamin pengalaman belajar lintas perangkat (*seamless multi-device progress*).

### 🎯 3. Auto-Pull & Refresh Sisi Admin (`admin.js` & `supabase.js`)
- Pada fungsi `renderAdminAnalytics()` dan `switchAdminTab('analytics')`:
  - Sistem memanggil `ZettSupabase.pullAllMembersProgressForAdmin()`.
  - Menarik seluruh data rekap dari tabel `member_progress` dan memetakannya ke `AppState.progress`.
  - Ditambahkan tombol aksi manual **`[🔄 Tarik Progres Cloud]`** di toolbar monitoring admin untuk sinkronisasi paksa jika koneksi lambat.

### 🎯 4. Realtime Subscription Channel (`supabase.js`)
- Memasang listener Supabase Realtime channel `realtime-member-progress`:
  - Mendengarkan event `INSERT` dan `DELETE` pada tabel `member_progress`.
  - Begitu ada siswa di mana pun yang menandai materi selesai, `AppState.progress` otomatis diperbarui seketika dan metrik di Admin Panel langsung bergerak secara realtime tanpa perlu reload browser!

---

## 3. BERKAS-BERKAS YANG DIMODIFIKASI

1. `revisi.md`: Master Blueprint Revisi 99.
2. `js/core/supabase.js`:
   - Penambahan `pushMemberLessonProgress(userEmail, lessonId)`
   - Penambahan `removeMemberLessonProgress(userEmail, lessonId)`
   - Penambahan `pullMemberProgress(userEmail)`
   - Penambahan `pullAllMembersProgressForAdmin()`
   - Penambahan `subscribeToMemberProgressRealtime(callback)`
3. `js/controllers/classroom.js`:
   - Integrasi `pushMemberLessonProgress` dan `removeMemberLessonProgress` pada penyelesaian materi.
   - Integrasi `pullMemberProgress` saat membuka ruang belajar.
4. `js/controllers/auth.js`:
   - Integrasi `pullMemberProgress` saat autentikasi/login berhasil.
5. `js/controllers/admin.js`:
   - Integrasi `pullAllMembersProgressForAdmin` saat tab Analytics/Monitoring dibuka.
   - Inisialisasi realtime listener untuk pembaruan instan saat Admin berada di tab Monitoring.
6. `index.html`:
   - Penambahan tombol `[🔄 Tarik Progres Cloud]` di toolbar monitoring progres siswa.
   - Menaikkan cache buster seluruh script JS ke `?v=99`.
7. `prd.md`: Dokumentasi spesifikasi versi `v1.9.0 (REVISI 99)`.
