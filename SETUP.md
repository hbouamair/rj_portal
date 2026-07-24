# Setup Guide - Étoile Dance Studio Website

## Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- Framer Motion (animations)
- Tailwind CSS (styling)
- Lucide React (icons)
- TypeScript

### 2. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 3. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
my-dance-studio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles & animations
│   │   └── actions.ts          # Server Actions for booking
│   ├── components/             # React Components
│   │   ├── CustomCursor.tsx    # Morphing cursor effect
│   │   ├── Navigation.tsx      # Responsive navigation
│   │   ├── Hero.tsx            # Cinematic hero section
│   │   ├── ClassCard.tsx       # Individual class card
│   │   ├── ClassesGrid.tsx     # Classes with parallax
│   │   ├── Schedule.tsx        # Schedule CTA section
│   │   ├── BookingModal.tsx    # Glassmorphic booking modal
│   │   ├── Instructors.tsx     # Instructors with parallax
│   │   ├── Contact.tsx         # Contact information
│   │   └── Footer.tsx          # Footer section
│   ├── data/                   # Mock Data & Types
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── classes.ts          # Dance class data
│   │   ├── schedule.ts         # Weekly schedule data
│   │   └── instructors.ts      # Instructor profiles
│   └── lib/
│       └── utils.ts            # Utility functions
├── tailwind.config.ts          # Tailwind customization
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies

```

## Key Features Implemented

### 1. 2026 Design Trends
- ✅ **Snug Simple Aesthetic**: Warm cream (#FDFBF7) palette with soft charcoal
- ✅ **Light Skeuomorphism**: Subtle shadows, tactile gradients, and rounded corners (3xl-6xl)
- ✅ **Organic Shapes**: Fluid, rounded designs avoiding rigid grids
- ✅ **Terracotta Accent**: Vibrant energy color (#D97757)

### 2. Advanced Motion & Animations
- ✅ **Cinematic Hero**: Full-screen gradient background with scroll storytelling
- ✅ **Framer Motion**: Fluid dance-like transitions throughout
- ✅ **Shared Element Transitions**: Using `layoutId` for smooth morphs
- ✅ **Custom Cursor**: Morphing cursor that changes on hover
- ✅ **Dough-like Buttons**: Pressed states with scale animations
- ✅ **Multi-layer Parallax**: Different scroll speeds for depth

### 3. Professional Booking System
- ✅ **Interactive Schedule**: Bento-grid calendar with day selector
- ✅ **Style Filtering**: Filter classes by dance style
- ✅ **Real-time Availability**: Color-coded urgency indicators
- ✅ **Glassmorphic Modal**: Beautiful backdrop blur effect
- ✅ **Multi-step Flow**: Schedule → Form → Success
- ✅ **Success Animation**: Delightful confirmation with spring physics
- ✅ **Server Actions**: Next.js 15 Server Actions for form submission

### 4. Technical Excellence
- ✅ **100% Mobile Responsive**: Breakpoints for mobile, tablet, and desktop
- ✅ **Thumb-friendly Navigation**: Mobile menu optimized for touch
- ✅ **Performance Optimized**: Lazy loading with Framer Motion viewport detection
- ✅ **TypeScript**: Fully typed for reliability
- ✅ **SEO Ready**: Metadata and semantic HTML
- ✅ **Accessibility**: Focus states and ARIA labels

## Customization Guide

### Colors

Edit `tailwind.config.ts` to change the color scheme:

```typescript
colors: {
  cream: "#FDFBF7",
  charcoal: "#2C2C2C",
  terracotta: "#D97757",
  "deep-violet": "#6B4E97",
}
```

### Adding Real Video Background

Replace the gradient in `src/components/Hero.tsx` with your video:

```tsx
<video
  autoPlay
  loop
  muted
  playsInline
  className="w-full h-full object-cover"
>
  <source src="/videos/hero-dance.mp4" type="video/mp4" />
</video>
```

Place your video file in `public/videos/`.

### Adding Instructor Photos

Add images to `public/images/instructors/` and update the `instructors.ts` data:

```typescript
{
  id: "elena",
  name: "Elena Rousseau",
  image: "/images/instructors/elena.jpg",
  // ... other fields
}
```

### Contact form – receiving emails

The contact form sends messages to **Mouniaarji@gmail.com** via [Resend](https://resend.com).

1. Create an account at [resend.com](https://resend.com) and get an API key.2. Create a file `.env.local` in the project root and add:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```
3. Restart the dev server (`npm run dev`). Submissions will be sent to your inbox with a branded HTML email (RJ Studio colors and layout).

Optional: after verifying your domain in Resend, set `RESEND_FROM_EMAIL=RJ Studio <contact@yourdomain.com>` so emails come from your domain.

### Connecting to a Backend

The project includes `src/app/actions.ts` with Server Actions. To connect to a real backend:

1. Set up your database (PostgreSQL, MongoDB, etc.)
2. Add your database client (Prisma, Drizzle, etc.)
3. Update the `bookClass` and `getSlotAvailability` functions
4. Add environment variables in `.env.local`

Example with Prisma:

```typescript
export async function bookClass(data: BookingFormData) {
  const booking = await prisma.booking.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      slotId: data.slotId,
    }
  });
  return { success: true, bookingId: booking.id };
}
```

## Design Philosophy

This website embraces cutting-edge 2026 design trends:

1. **Warm & Inviting**: The cream and terracotta palette creates a welcoming, energetic atmosphere
2. **Tactile Digital Experience**: Light skeuomorphism makes UI elements feel touchable
3. **Fluid Motion**: Every interaction flows like a dance movement
4. **Performance First**: Optimized animations that run at 60fps
5. **User-Centric**: Clear CTAs, real-time feedback, and delightful micro-interactions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Animations not smooth?
- Ensure hardware acceleration is enabled in your browser
- Check that you're running the latest version of browsers

### Custom cursor not showing?
- Custom cursor only works on desktop devices
- Mobile devices use native touch interaction

### Modal not opening?
- Check browser console for errors
- Ensure all dependencies are installed correctly

## Need Help?

If you encounter any issues:
1. Check that all dependencies are installed: `npm install`
2. Clear Next.js cache: `rm -rf .next`
3. Restart the dev server: `npm run dev`

## Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Other Platforms

This is a standard Next.js 15 application and can be deployed to:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## License

This project is for demonstration purposes. Feel free to use and modify for your own projects.

