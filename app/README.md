# Between the Lines - D&D Campaign Manager

A Progressive Web App (PWA) for managing D&D campaign materials with Supabase backend.

## Features

- 📱 **PWA Support** - Install on mobile devices, works offline
- 🔐 **Authentication** - Secure user login with Supabase
- 📝 **Character Sheet** - Track your D&D character (coming soon)
- 📚 **Bookshelf** - Campaign bookshelf (coming soon)
- 🎨 **Galatea Fine Art** - Magic items shop gallery with modal details
- 📝 **Notes** - Campaign notes management (coming soon)
- 👑 **Admin Dashboard** - Admin tools (coming soon)

## Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Backend**: Supabase (Auth + Database)
- **Styling**: Custom CSS
- **PWA**: vite-plugin-pwa

## Setup

### 1. Install Dependencies

```bash
cd app
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Add your Supabase credentials to `.env`:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
app/
├── public/
│   └── items.json          # Magic items data
├── src/
│   ├── components/
│   │   ├── Gallery.jsx     # Items gallery grid
│   │   ├── Layout.jsx      # App layout with navigation
│   │   ├── Modal.jsx       # Item detail modal
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx # Authentication state
│   ├── lib/
│   │   └── supabase.js     # Supabase client config
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── Bookshelf.jsx   # Campaign bookshelf
│   │   ├── CharacterSheet.jsx
│   │   ├── GalateaFineArt.jsx # Magic items shop
│   │   ├── Login.jsx       # Authentication page
│   │   └── Notes.jsx
│   ├── App.jsx             # Main app with routing
│   └── main.jsx            # Entry point
└── vite.config.js          # Vite + PWA config
```

## Authentication

The app requires login to access any content. Pre-created user accounts are managed through Supabase Auth.

## PWA Installation

### On Mobile (iOS/Android):
1. Open the app in your browser
2. Tap Share (iOS) or Menu (Android)
3. Select "Add to Home Screen"

### On Desktop:
1. Look for the install icon in your browser's address bar
2. Click to install as a desktop app

## Next Steps

- [ ] Set up Supabase credentials in `.env`
- [ ] Migrate items from JSON to Supabase database
- [ ] Implement character sheet functionality
- [ ] Add notes editor
- [ ] Build admin dashboard

