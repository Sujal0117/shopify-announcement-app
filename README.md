# 📢 Shopify Announcement App

A production-ready Shopify embedded app that lets merchants write announcements inside Shopify Admin. Announcements are saved to MongoDB, synced to a Shopify shop metafield, and displayed on the storefront via a Theme App Extension (App Embed Block).

---

## Flow

```
Admin Dashboard → Node/Express Backend → MongoDB → Shopify Shop Metafield → Theme App Extension → Storefront Banner
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Shopify App | Shopify CLI 3.x |
| Frontend | React 18, Vite, Shopify Polaris, App Bridge |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Shopify API | GraphQL Admin API (2025-01) |
| Theme Extension | Liquid, App Embed Block |
| Deployment | Render / Railway / Vercel |

---

## Screenshots

> _Add screenshots here after running the app_

| Admin Dashboard | Announcement Form | History Table | Storefront Banner |
|---|---|---|---|
| ![dashboard](docs/screenshots/dashboard.png) | ![form](docs/screenshots/form.png) | ![history](docs/screenshots/history.png) | ![banner](docs/screenshots/banner.png) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli) >= 3.x — `npm install -g @shopify/cli`
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or local MongoDB)
- [Shopify Partner account](https://partners.shopify.com/)
- A Shopify development store

---

## 1. Shopify Partner Setup

1. Log in to [partners.shopify.com](https://partners.shopify.com)
2. Go to **Apps → Create app → Create app manually**
3. Note your **API key** and **API secret**
4. Under **App setup → URLs**, set:
   - App URL: `https://your-app-url.com`
   - Allowed redirect URLs: `https://your-app-url.com/api/auth/callback`
5. Under **API scopes**, add: `write_metafields, read_metafields, read_themes`

---

## 2. Development Store Setup

1. In the Partner Dashboard, go to **Stores → Add store → Development store**
2. Create the store and install your app on it
3. Note the store URL (e.g. `my-dev-store.myshopify.com`)

---

## 3. MongoDB Setup

### MongoDB Atlas (recommended)
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write access
3. Whitelist your IP (or `0.0.0.0/0` for development)
4. Copy the connection string (SRV format)

### Local MongoDB
```bash
mongod --dbpath /data/db
# Connection string: mongodb://localhost:27017/shopify_announcement
```

---

## 4. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_APP_URL=https://your-tunnel-url.trycloudflare.com
SCOPES=write_metafields,read_metafields,read_themes
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shopify_announcement
SHOP=your-dev-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_access_token
SESSION_SECRET=minimum-32-character-random-secret
NODE_ENV=development
PORT=3000
```

---

## 5. Installation & Running

### Install dependencies

```bash
# Root
npm install

# Backend
cd web && npm install

# Frontend
cd client && npm install
```

### Run with Shopify CLI (recommended)

```bash
# From project root
shopify app dev
```

This will:
- Start the Express backend
- Start the Vite dev server
- Create a Cloudflare tunnel
- Open the app in your dev store

### Run manually (two terminals)

```bash
# Terminal 1 — Backend
cd web && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

---

## 6. Shopify CLI Commands

```bash
# Start development (with tunnel)
shopify app dev

# Build for production
shopify app build

# Deploy to Shopify
shopify app deploy

# Show app info
shopify app info

# Generate a new extension
shopify app generate extension
```

---

## 7. Theme App Extension

### Generate the extension (if starting fresh)

```bash
shopify app generate extension
# Select: Theme app extension
# Name: announcement-banner
```

### Enable App Embed Block on storefront

1. Go to your Shopify Admin → **Online Store → Themes**
2. Click **Customize** on your active theme
3. In the left panel, click the **App embeds** icon (puzzle piece)
4. Find **Announcement Banner** and toggle it **ON**
5. Adjust colors/font size in the settings panel
6. Click **Save**

The banner will now appear on every page when the `my_app.announcement` metafield is set.

---

## 8. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/announcement` | Save new announcement |
| `GET` | `/api/announcement/history` | Get paginated history |
| `GET` | `/api/announcement/current` | Get current from Shopify |
| `DELETE` | `/api/announcement/:id` | Soft-delete a record |
| `DELETE` | `/api/announcement/metafield/clear` | Clear Shopify metafield |
| `GET` | `/health` | Health check |

### POST /api/announcement

```json
// Request
{ "text": "Sale 50% OFF — Today only!" }

// Response
{
  "success": true,
  "message": "Announcement saved successfully",
  "data": {
    "id": "...",
    "shop": "my-store.myshopify.com",
    "announcementText": "Sale 50% OFF — Today only!",
    "metafieldId": "gid://shopify/Metafield/...",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### GET /api/announcement/history

```
?page=1&limit=10&search=sale
```

---

## 9. Deployment

### Render (recommended for backend)

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your repository
4. Set root directory to `web`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables in the Render dashboard
8. Note the deployment URL, set as `SHOPIFY_APP_URL`

```bash
# Using render.yaml (auto-deploy)
# Commit and push — Render will pick up render.yaml automatically
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Vercel (frontend only)

```bash
# Install Vercel CLI
npm install -g vercel

cd client
vercel --prod
```

---

## 10. Project Structure

```
shopify-announcement-app/
├── shopify.app.toml              # Shopify app config
├── render.yaml                   # Render deployment config
├── railway.toml                  # Railway deployment config
├── vercel.json                   # Vercel deployment config
├── .env.example                  # Environment variable template
├── README.md
│
├── web/                          # Express backend
│   ├── index.js                  # Server entry point
│   ├── package.json
│   ├── config/
│   │   ├── shopify.js            # Shopify app config + session storage
│   │   └── database.js           # MongoDB connection
│   ├── routes/
│   │   └── announcement.js       # API route definitions
│   ├── controllers/
│   │   └── announcementController.js
│   ├── services/
│   │   └── shopifyService.js     # GraphQL metafield functions
│   ├── models/
│   │   └── Announcement.js       # Mongoose model (history, no overwrite)
│   ├── middleware/
│   │   ├── errorHandler.js       # Central error handling
│   │   └── shopifyAuth.js        # Session validation
│   └── utils/
│       ├── logger.js             # Structured logger
│       └── validateEnv.js        # Env var validation
│
├── client/                       # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # App Bridge + Polaris providers
│       ├── pages/
│       │   └── AnnouncementPage.jsx   # Main admin page
│       ├── components/
│       │   ├── AnnouncementForm.jsx   # Form with preview + counter
│       │   └── HistoryTable.jsx       # Paginated history table
│       ├── hooks/
│       │   ├── useAnnouncement.js     # Save/load announcement state
│       │   └── useHistory.js          # History pagination + delete
│       └── services/
│           └── announcementService.js # API fetch wrapper
│
└── extensions/
    └── announcement-banner/      # Theme App Extension
        ├── shopify.extension.toml
        ├── blocks/
        │   └── announcement_embed.liquid  # App Embed Block
        └── locales/
            └── en.default.json
```

---

## 11. Metafield Reference

| Property | Value |
|---|---|
| Namespace | `my_app` |
| Key | `announcement` |
| Type | `single_line_text_field` |
| Owner | Shop |

Access in Liquid:
```liquid
{{ shop.metafields.my_app.announcement.value }}
```

---

## 12. Features

- ✅ Announcement editor with character counter (500 char limit)
- ✅ Auto-save draft to `localStorage` (survives page refresh)
- ✅ Live announcement preview
- ✅ Paginated history table (newest first)
- ✅ Search history
- ✅ Delete history records (soft delete)
- ✅ Toast notifications
- ✅ Loading skeletons
- ✅ Responsive UI (Polaris)
- ✅ Sticky responsive banner on storefront
- ✅ Close button with session persistence
- ✅ Smooth CSS transitions
- ✅ Dark mode banner support
- ✅ Keyboard accessible (Escape to close)
- ✅ Mobile-friendly banner

---

## 13. Troubleshooting

**App not loading in admin?**
- Ensure `SHOPIFY_APP_URL` matches the tunnel URL
- Check OAuth redirect URLs in Partner Dashboard

**Metafield not updating?**
- Verify `SHOPIFY_ACCESS_TOKEN` is set and has `write_metafields` scope
- Check backend logs for GraphQL errors

**Banner not showing on storefront?**
- Enable the App Embed Block in Theme Editor
- Confirm an announcement has been saved (metafield must be non-empty)

**MongoDB connection error?**
- Check that your IP is whitelisted in Atlas
- Verify the `MONGODB_URI` connection string format

---

## License

MIT
