# 🚀 Quick Start Guide

## Get Running in 60 Seconds

### 1️⃣ Install Dependencies
```bash
npm install
```
This installs Next.js 15, React 19, Framer Motion, Tailwind CSS, and all dependencies.

### 2️⃣ Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3️⃣ Explore the Website
- **Hero**: Scroll to see parallax effects and fade animations
- **Classes**: Filter by dance style, hover over cards
- **Schedule**: Click "Book Now" to open the booking modal
- **Booking**: Select a time slot, fill out the form, see success animation
- **Instructors**: Scroll to experience multi-layer parallax
- **Custom Cursor**: Move your mouse around (desktop only)

---

## 📁 Project Structure (Simplified)

```
my-dance-studio/
│
├── 📄 README.md              ← Project overview
├── 📄 SETUP.md               ← Detailed setup instructions
├── 📄 FEATURES.md            ← Complete feature list
├── 📄 DESIGN_SYSTEM.md       ← Design tokens & patterns
│
├── 📦 src/
│   ├── 🎯 app/
│   │   ├── layout.tsx        ← Root layout (SEO)
│   │   ├── page.tsx          ← Main page (homepage)
│   │   ├── globals.css       ← Animations & styles
│   │   └── actions.ts        ← Server Actions
│   │
│   ├── 🧩 components/
│   │   ├── Hero.tsx          ← Cinematic hero
│   │   ├── Navigation.tsx    ← Responsive nav
│   │   ├── ClassesGrid.tsx   ← Classes with parallax
│   │   ├── BookingModal.tsx  ← Booking system
│   │   ├── Instructors.tsx   ← Team section
│   │   └── ... (10 components)
│   │
│   ├── 📊 data/
│   │   ├── types.ts          ← TypeScript types
│   │   ├── classes.ts        ← 8 dance classes
│   │   ├── schedule.ts       ← 22 time slots
│   │   └── instructors.ts    ← 8 instructors
│   │
│   └── 🛠️ lib/
│       └── utils.ts          ← Helper functions
│
└── ⚙️ Config Files
    ├── tailwind.config.ts    ← Custom theme
    ├── tsconfig.json         ← TypeScript
    └── next.config.ts        ← Next.js
```

---

## 🎨 Key Features to Test

### 1. Custom Cursor (Desktop Only)
- Move your mouse around
- Hover over buttons and links
- Click to see compression effect

### 2. Hero Section
- Scroll down slowly to see text fade
- Watch background scale effect
- See floating stats animation

### 3. Classes Filter
- Click different dance styles
- Watch smooth transitions
- Hover over class cards

### 4. Booking Modal
- Click "Book Now" button
- Select different days
- Filter by dance style
- Fill out booking form
- See success animation with spring physics

### 5. Parallax Effects
- Scroll through Classes section
- Scroll through Instructors section
- Notice background elements moving at different speeds

### 6. Mobile Menu
- Resize browser to mobile width
- Click hamburger menu
- See smooth slide-down animation

---

## 🎯 What You Get

✅ **13 Components** - All professionally designed
✅ **50+ Animations** - Framer Motion throughout
✅ **Mock Data** - 8 classes, 22 slots, 8 instructors
✅ **Booking System** - Full multi-step flow
✅ **Custom Cursor** - Premium feel
✅ **Parallax Effects** - Multi-layer depth
✅ **100% Responsive** - Mobile to desktop
✅ **TypeScript** - Fully typed
✅ **Next.js 15** - Latest features
✅ **Server Actions** - Ready for backend

---

## 🔧 Common Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Utilities
npm run lint         # Check for errors
```

---

## 🎨 Customization Quick Tips

### Change Main Accent Color
**File**: `tailwind.config.ts`
```typescript
terracotta: "#D97757",  // Change this hex code
```

### Add Your Logo
**File**: `src/components/Navigation.tsx`
```tsx
<motion.a href="#hero">
  Your Logo Here  {/* Replace text */}
</motion.a>
```

### Update Contact Info
**File**: `src/components/Contact.tsx` and `src/components/Footer.tsx`
```tsx
// Update phone, email, address
```

### Add Real Video Background
**File**: `src/components/Hero.tsx`
```tsx
// Uncomment video tag
// Add video file to public/videos/
```

### Connect to Backend
**File**: `src/app/actions.ts`
```tsx
// Add database connection
// Add email service
// Add payment processing
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Overview, stack, getting started |
| **SETUP.md** | Detailed installation & deployment |
| **FEATURES.md** | Complete feature documentation |
| **DESIGN_SYSTEM.md** | Colors, typography, patterns |
| **QUICKSTART.md** | This file - fastest path to running |

---

## 🆘 Troubleshooting

### Issue: Custom cursor not showing
**Solution**: Custom cursor only works on desktop. Mobile uses native touch.

### Issue: Animations choppy
**Solution**: Enable hardware acceleration in browser settings.

### Issue: Modal not opening
**Solution**: Check browser console for errors. Run `npm install` again.

### Issue: TypeScript errors
**Solution**: Install dependencies first: `npm install`

---

## 🌟 Next Steps

1. ✅ Run `npm install`
2. ✅ Run `npm run dev`
3. ✅ Open http://localhost:3000
4. ✅ Explore the website
5. ✅ Read FEATURES.md for details
6. ✅ Customize colors and content
7. ✅ Add your branding
8. ✅ Connect to backend
9. ✅ Deploy to Vercel

---

## 🚀 Deploy to Vercel (1 Click)

```bash
npm install -g vercel
vercel
```

Or push to GitHub and connect to Vercel for automatic deployments.

---

## 💡 Pro Tips

- Test on mobile device for best responsive experience
- Use Chrome DevTools to throttle network and see loading states
- Read DESIGN_SYSTEM.md to understand the component patterns
- Explore FEATURES.md for complete feature documentation
- Check out Framer Motion docs for advanced animations

---

## 🎉 You're Ready!

Your high-end dance studio website is ready to impress. Every interaction has been carefully crafted to feel premium and purposeful.

**Enjoy building!** 💃🕺

