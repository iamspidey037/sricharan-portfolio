# Sri Charan's Portfolio CMS — Production-Ready Setup Guide

> A full-stack, self-manageable personal portfolio website with a complete admin CMS.
> Built for **Sri Charan** — ECE Student · Embedded AI · Edge AI Developer.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS |
| Animations | Framer Motion |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (access + refresh tokens) · bcrypt (12 salt rounds) |
| File Storage | Cloudinary (images/video) · Local (code files, docs) |
| Rich Text | Tiptap (WYSIWYG editor) |
| Email | Nodemailer (SMTP) |
| Deployment | Vercel (frontend + API) |

---

## 📋 Prerequisites

- **Node.js** 18.17+ (check: `node -v`)
- **npm** 9+ or **pnpm** 8+
- **MongoDB Atlas** account (free tier works perfectly)
- **Cloudinary** account (free tier: 25GB storage)
- **Vercel** account for deployment

---

## 🚀 Local Development Setup

### Step 1: Clone & Install

```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
npm install
```

### Step 2: Set Up Environment Variables

```bash
cp .env.example .env.local
```

Now edit `.env.local` and fill in ALL values:

**Required:**
- `MONGODB_URI` — Your MongoDB Atlas connection string
- `JWT_ACCESS_SECRET` — 64-char random hex (generate below)
- `JWT_REFRESH_SECRET` — Different 64-char random hex

**Generate secrets:**
```bash
node -e "console.log('ACCESS:', require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('REFRESH:', require('crypto').randomBytes(64).toString('hex'))"
```

### Step 3: Set Up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free account
2. Create a **free M0 cluster** (512MB, sufficient for portfolio)
3. Under **Database Access** → Add new user (username + strong password)
4. Under **Network Access** → Add IP Address → `0.0.0.0/0` (allow all, for Vercel)
5. Click **Connect** → **Compass / Drivers** → Copy connection string
6. Replace `<password>` with your DB user password
7. Add `/portfolio` before `?retryWrites` → this creates the `portfolio` database
8. Paste into `MONGODB_URI` in `.env.local`

### Step 4: Set Up Cloudinary (Optional but recommended for images)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to **Settings → Upload → Add upload preset**
3. Name it `portfolio_uploads`, set **Signing Mode: Unsigned**
4. Copy your **Cloud Name, API Key, API Secret** from the dashboard
5. Fill in `CLOUDINARY_*` values in `.env.local`

### Step 5: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 6: Create Admin Account

1. Visit [http://localhost:3000/admin/setup](http://localhost:3000/admin/setup)
2. Create your admin account:
   - **Username**: lowercase, numbers, underscores (e.g., `sricharan`)
   - **Password**: Must have 8+ chars, uppercase, lowercase, number, symbol
3. Click **Create Admin Account**
4. Login at [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### Step 7: Seed Sample Data (Optional)

```bash
npm run seed
```

This creates sample sections, projects (Spidey, TinyML detector, etc.), certifications, and blog posts.

---

## 🌐 Vercel Deployment

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/portfolio.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Add all environment variables from `.env.local`
5. Click **Deploy**

### Step 3: Custom Domain
1. In Vercel → Project → Domains → Add your domain
2. Update `NEXT_PUBLIC_BASE_URL` in Vercel env vars to your domain

---

## 🔐 Security Notes

- **JWT secrets** must be strong (64+ chars) and never shared
- **MongoDB** IP whitelist `0.0.0.0/0` is needed for Vercel serverless (no fixed IPs)
- **Passwords** are hashed with bcrypt (12 salt rounds)
- **Rate limiting** on login: 5 attempts, then 15-min lockout
- **HTTP-only cookies** prevent XSS from stealing tokens
- **File uploads** validate MIME type (not just extension)
- Admin routes are protected by Next.js middleware (JWT verification at edge)

---

## 📁 Admin Panel Usage Guide

### Accessing Admin
- URL: `yourdomain.com/admin/login`
- Login with username + password you set up

### Managing Content
1. **Dashboard** (`/admin/dashboard`) — Stats, quick actions, recent activity
2. **Content Manager** (`/admin/content`) — Tree view of ALL sections
   - Click any section to edit it
   - Right-click or hover for Edit / Duplicate / Delete options
3. **Section Editor** — Full editor with:
   - Rich text content (WYSIWYG + Markdown)
   - Visibility: 🔴 Private | 🟡 Shared | 🟢 Public
   - Status: Draft | Published | Archived
   - Tags, tech stack, external links
   - Share link generator (secret URL for recruiters)
4. **File Manager** (`/admin/files`) — Upload and organize all media
5. **Messages** (`/admin/messages`) — Contact form inbox with reply
6. **Settings** (`/admin/settings`) — Theme colors, SEO, SMTP, etc.

### Visibility System
| Level | Who Can See |
|---|---|
| 🟢 **Public** | All website visitors |
| 🟡 **Shared** | Anyone with the secret link (optional password + expiry) |
| 🔴 **Private** | Only you when logged in as admin |

### Creating Your First Project
1. Go to **Content Manager** → **New Section**
2. Select Type: **Item** (for a project entry)
3. Set Visibility: **Private** (draft it first)
4. Fill in title, description
5. Click the section → Full Editor opens
6. Add rich text content, tech stack tags, external links
7. Change Visibility to **Public** and Status to **Published**
8. Save → Appears on your portfolio!

---

## 🎨 Customizing Theme

In **Admin → Settings → Site Settings**:
- **Primary Color** — Default: Electric Blue `#00D4FF`
- **Secondary Color** — Default: Neon Green `#00FF88`  
- **Background Style** — Circuit board / Particles / Solid
- **Default Theme** — Dark (recommended) / Light

Or directly in `app/globals.css` → `:root` and `.dark` / `.light` blocks.

---

## 🔧 Troubleshooting

**"Cannot connect to MongoDB"**
- Check `MONGODB_URI` in `.env.local`
- Ensure your IP is whitelisted in MongoDB Atlas (or use `0.0.0.0/0`)
- Check DB user has read/write access

**"Invalid JWT secret"**
- Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set in `.env.local`
- They must be different from each other

**"File upload fails"**
- If using Cloudinary: check API key, secret, and upload preset name
- Ensure upload preset is set to **Unsigned** in Cloudinary

**"Admin login redirects to setup"**
- Run `npm run seed` or create admin at `/admin/setup` first

**Build fails on Vercel**
- Check all env vars are set in Vercel dashboard (not just `.env.local`)
- `NEXT_PUBLIC_BASE_URL` must match your actual domain

---

## 📜 License

MIT License — Feel free to use this for your own portfolio!

---

*Built with ❤️ for Sri Charan — ECE Student · Embedded AI · Edge AI Developer · KITS Karimnagar*
