# Linkfy Backend

## Prasyarat

Sebelum memulai, pastikan sistem Anda telah memiliki:

- Node.js (versi 14 atau lebih tinggi)
- PostgreSQL (versi 12 atau lebih tinggi)
- npm atau yarn package manager

## Cara Mengkloning dan Menjalankan Proyek

### 1. Clone Repository

```bash
git clone https://github.com/mfarzz/search-engine.git
```

### 2. Install Dependencies

```bash
npm install
# atau jika menggunakan yarn
yarn install
```

### 3. Konfigurasi Database

1. Salin file `.env.example` menjadi `.env`
```bash
cp .env.example .env
```

2. Sesuaikan konfigurasi database di file `.env`:
```
DEV_DB_USERNAME=postgres
DEV_DB_PASSWORD=password_postgre
DEV_DB_NAME=nama_database
DEV_DB_HOST=host
DEV_DB_PORT=posrt
```

### 4. Migrasi Database

Jalankan migrasi untuk membuat struktur tabel:

```bash
npx sequelize-cli db:migrate
# atau
yarn sequelize-cli db:migrate
```

Opsional: Jalankan seeder jika ingin mengisi data awal:
```bash
npx sequelize-cli db:seed:all
```

### 5. Menjalankan Aplikasi

```bash
# Mode development
npm run dev
# atau
yarn dev

# Mode production
npm start
# atau
yarn start
```

Aplikasi akan berjalan di `http://localhost:3000`

## Struktur Proyek

```
.
├── bin/                   # Binary files dan startup scripts
├── config/
│   └── config.js         # Konfigurasi aplikasi dan database
├── controllers/
│   ├── auth/            # Controller autentikasi
│   ├── dashboard/       # Controller dashboard
│   ├── feedback/        # Controller feedback
│   ├── managementLink/  # Controller management link
│   ├── managementUser/  # Controller management user
│   ├── pencarianLink/   # Controller pencarian link
│   └── riwayatLink/     # Controller riwayat link
├── middlewares/          # Middleware aplikasi
├── migrations/           # File migrasi database
├── models/              # Model Sequelize
├── node_modules/        # Dependencies
├── routes/
│   ├── auth.router.js   # Route autentikasi
│   └── user.router.js   # Route user
├── seeders/             # Data seeder
├── uploads/             # Directory untuk file uploads
├── utils/
│   ├── cookieHandler.utils.js  # Utility untuk handling cookies
│   └── textVectorizer.utils.js # Utility untuk text vectorization
├── .env                 # Environment variables
├── .gitignore          # Git ignore file
├── app.js              # Entry point aplikasi
├── package-lock.json   # Lock file untuk dependencies
├── package.json        # Project metadata dan dependencies
└── README.md           # Dokumentasi proyek
```

## Endpoints API

### Authentication Routes (`/auth`)
- `POST /auth/login` - Login user
- `GET /auth/google` - Get Google OAuth URL
- `GET /auth/google/callback` - Google OAuth callback handler
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Logout user (requires auth: admin, user, umum)
- `PUT /auth/change-password` - Change user password (requires auth: admin, user, umum)

### User Management
- `GET /list-user` - Get all users (requires auth: admin)
- `POST /add-user` - Add new user (requires auth: admin)
- `POST /add-user-bulk` - Bulk add users via Excel file (requires auth: admin)
- `DELETE /delete-user/:userId` - Delete user (requires auth: admin)
- `PUT /edit-user/:userId` - Edit user (requires auth: admin)

### Link Management
- `GET /list-link` - Get all links (requires auth: admin, user)
- `POST /add-link` - Add new link with image (requires auth: admin, user)
- `DELETE /delete-link/:id` - Delete link (requires auth: admin, user)
- `PUT /edit-link/:linkId` - Edit link with image (requires auth: admin, user)
- `GET /all-user` - Get all users (requires auth: admin, user)

### Link Search
- `GET /search-link` - Search links (optional auth)
- `POST /click-link` - Record link click (optional auth)
- `GET /explore-link` - Explore available links (optional auth)
- `GET /query-history` - Get search query history (optional auth)
- `DELETE /delete-query-history` - Delete search query history (optional auth)

### Link History
- `GET /last-visited` - Get recently visited links (optional auth)
- `GET /most-visited` - Get most visited links (optional auth)

### Feedback
- `POST /add-feedback` - Submit feedback (optional auth)

### Dashboard
- `GET /count-link` - Get total link count (requires auth: admin)
- `GET /count-user-login` - Get user login statistics (requires auth: admin)
- `GET /hourly` - Get hourly access statistics (requires auth: admin)
- `GET /daily` - Get today's statistics (requires auth: admin)
- `GET /summary` - Get real-time summary (requires auth: admin)
- `GET /daily-stats` - Get daily statistics (requires auth: admin)
- `GET /hourly-link` - Get hourly link statistics (requires auth: admin)
- `GET /daily-link` - Get daily link statistics (requires auth: admin)
- `GET /top-link` - Get top performing links (requires auth: admin)
- `GET /top-link-daily` - Get daily top performing links (requires auth: admin)


## Scripts yang Tersedia

- `npm run dev` - Menjalankan aplikasi dalam mode development
- `npm start` - Menjalankan aplikasi dalam mode production

## Kontribusi

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b fitur/AmazingFeature`)
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin fitur/AmazingFeature`)
5. Buat Pull Request

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file [LICENSE.md](LICENSE.md) untuk detail.

## Kontak

Nama Anda - Muhammad Fariz
Email - mfarix730@gmail.com

Link Proyek: [https://github.com/mfarzz/search-engine](https://github.com/mfarzz/search-engine)
