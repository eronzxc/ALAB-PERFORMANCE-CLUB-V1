# 🔥 Alab Performance Club — XAMPP Setup Guide

## Mga Kailangan
- XAMPP (Apache + MySQL + PHP 7.4+)
- Browser (Chrome, Firefox, Edge)

---

## HAKBANG 1 — Kopyahin ang Folder

I-paste ang `alab` folder sa loob ng XAMPP htdocs:

```
Windows:  C:\xampp\htdocs\alab\
Mac/Linux: /Applications/XAMPP/htdocs/alab/
```

Dapat ganito ang structure:
```
htdocs/
└── alab/
    ├── index.html
    ├── styles.css
    ├── database.sql       ← SQL para sa database
    ├── api/
    │   ├── config.php
    │   ├── members.php
    │   ├── attendance.php
    │   ├── payments.php
    │   ├── classes.php
    │   └── dashboard.php
    └── src/
        ├── main.js
        ├── components/
        │   ├── Dashboard.js
        │   ├── Members.js
        │   ├── Attendance.js
        │   ├── Payments.js
        │   └── Classes.js
        └── data/
            └── store.js
```

---

## HAKBANG 2 — I-setup ang Database

1. Buksan ang XAMPP Control Panel
2. I-start ang **Apache** at **MySQL**
3. Pumunta sa browser: `http://localhost/phpmyadmin`
4. Mag-click ng **"Import"** tab (o kaya "SQL" tab)
5. I-upload o i-paste ang laman ng `database.sql`
6. I-click ang **"Go"** button

**O kaya sa MySQL CLI:**
```bash
mysql -u root -p < database.sql
```

---

## HAKBANG 3 — I-check ang Config (kung may password ang MySQL)

Buksan ang `api/config.php` at i-edit:
```php
define('DB_USER', 'root');   // ← username mo
define('DB_PASS', '');       // ← password mo (wala by default sa XAMPP)
define('DB_NAME', 'alab_db');
```

---

## HAKBANG 4 — Buksan ang App

I-type sa browser:
```
http://localhost/alab/
```

✅ Tapos na! Hindi na kailangan ng Live Server — gumagana na sa XAMPP.

---

## API Endpoints (para sa reference)

| Endpoint              | Method | Description              |
|-----------------------|--------|--------------------------|
| `/alab/api/members.php`    | GET    | Lahat ng members         |
| `/alab/api/members.php`    | POST   | Mag-add ng member        |
| `/alab/api/members.php?id=X` | DELETE | Mag-delete ng member  |
| `/alab/api/attendance.php` | GET    | Lahat ng attendance      |
| `/alab/api/attendance.php?today=1` | GET | Ngayon lang     |
| `/alab/api/attendance.php` | POST   | Mag-check in             |
| `/alab/api/payments.php`   | GET    | Lahat ng payments        |
| `/alab/api/payments.php`   | POST   | Mag-record ng payment    |
| `/alab/api/classes.php`    | GET    | Lahat ng classes         |
| `/alab/api/classes.php`    | POST   | Mag-add ng class         |
| `/alab/api/dashboard.php`  | GET    | Dashboard statistics     |

---

## Troubleshooting

**"Database connection failed"**
→ Siguraduhing naka-start ang MySQL sa XAMPP
→ I-check ang `api/config.php` — tama ba ang DB_USER at DB_PASS?

**"Table doesn't exist"**
→ Hindi pa nai-import ang `database.sql` — ulitin ang Hakbang 2

**Blangko ang page / CORS error**
→ Siguraduhing sa `http://localhost/alab/` binubuksan, hindi `file://`

**Hindi naglo-load ang API**
→ Siguraduhing naka-start ang Apache sa XAMPP Control Panel
