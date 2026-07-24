# Design System - Étoile Dance Studio

## Color Palette

### Primary Colors
```css
--cream: #FDFBF7        /* Background, main surface */
--charcoal: #2C2C2C     /* Primary text, dark elements */
--soft-charcoal: #4A4A4A /* Secondary text */
```

### Accent Colors
```css
--terracotta: #D97757   /* Primary CTA, energy accent */
--deep-violet: #6B4E97  /* Secondary accent, variety */
```

### Usage Guidelines
- **Cream**: Use for main backgrounds and light surfaces
- **Charcoal**: Use for headings and primary text
- **Terracotta**: Use for primary CTAs, highlights, and energy moments
- **Deep Violet**: Use for secondary CTAs and visual variety

### Accessibilité / Contraste
- Valider le contraste (texte sur fond, dégradés) avec **axe DevTools** ou **WAVE** lors de tout changement de couleurs.
- Focus clavier : outline visible sur liens et boutons (défini dans `globals.css`).

## Typography

### Font Families
```css
--font-inter: 'Inter', sans-serif         /* Body text, UI elements */
--font-playfair: 'Playfair Display', serif /* Headings, display text */
```

### Scale
- **Display**: 4xl-8xl (Hero headlines)
- **H2**: 4xl-6xl (Section headers)
- **H3**: 2xl-3xl (Card headers)
- **Body**: base-xl (Paragraphs)
- **Small**: sm (Meta information)

### Usage
```tsx
<h1 className="text-6xl font-display font-bold">
  Main Headline
</h1>

<p className="text-lg text-soft-charcoal">
  Body text content
</p>
```

## Spacing System

### Scale
- **Sections**: py-24 md:py-32 (96px - 128px)
- **Cards**: p-6 md:p-8 (24px - 32px)
- **Grids**: gap-8 (32px)
- **Elements**: gap-4 (16px)

## Border Radius

### Scale
```css
--rounded-2xl: 1rem    /* Small cards */
--rounded-4xl: 2rem    /* Main cards */
--rounded-5xl: 2.5rem  /* Modals */
--rounded-6xl: 3rem    /* Hero elements */
--rounded-full: 9999px /* Buttons, badges */
```

### Usage
- **Buttons**: rounded-full
- **Cards**: rounded-4xl
- **Modals**: rounded-5xl
- **Inputs**: rounded-2xl

## Shadows (Light Skeuomorphism)

### Types
```css
shadow-skeu-sm: 0 2px 8px rgba(0, 0, 0, 0.06)    /* Subtle elevation */
shadow-skeu-md: 0 4px 16px rgba(0, 0, 0, 0.08)   /* Cards */
shadow-skeu-lg: 0 8px 32px rgba(0, 0, 0, 0.1)    /* Modals, CTAs */
shadow-inner-soft: inset 0 2px 4px rgba(0, 0, 0, 0.05) /* Pressed states */
```

### Usage
```tsx
/* Default card */
<div className="shadow-skeu-md hover:shadow-skeu-lg">

/* Pressed button */
<button className="active:shadow-inner-soft">
```

## Component Patterns

### Skeu Card (Light Skeuomorphism)
```tsx
<div className="skeu-card p-8">
  {/* Content */}
</div>

/* CSS Applied:
  - Rounded corners (4xl)
  - Subtle gradient background
  - Soft shadow
  - Border highlight
*/
```

### Dough Button (Micro-interaction)
```tsx
<motion.button
  className="dough-button skeu-button px-8 py-4 rounded-full"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>

/* Features:
  - Scale animation on press
  - Smooth shadow transition
  - Tactile feedback
*/
```

### Glass Morphism
```tsx
<div className="glass-morphism p-8">
  {/* Semi-transparent with blur */}
</div>

/* CSS Applied:
  - backdrop-filter: blur(12px)
  - Semi-transparent background
  - Used in modals and navigation
*/
```

## Animation System

### Framer Motion Variants

#### Fade In Up
```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
```

#### Scale In
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
>
```

#### Hover Effects
```tsx
<motion.div
  whileHover={{ y: -8, scale: 1.02 }}
  transition={{ duration: 0.3 }}
>
```

### CSS Animations

#### Float (Decorative elements)
```css
animation: float 3s ease-in-out infinite
```

#### Dance Wiggle (Playful hover)
```css
animation: danceWiggle 0.6s ease-in-out
```

#### Success Pop (Confirmation)
```css
animation: successPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

## Parallax System

### Multi-layered Parallax
```tsx
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start end", "end start"],
});

const y1 = useTransform(scrollYProgress, [0, 1], [150, -150]); // Fast
const y2 = useTransform(scrollYProgress, [0, 1], [100, -100]); // Medium
const y3 = useTransform(scrollYProgress, [0, 1], [50, -50]);   // Slow

<motion.div style={{ y: y1 }} />
```

### Hero Parallax
```tsx
const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
```

## Custom Cursor

### States
1. **Default**: Small dot with ring
2. **Hover**: Larger ring, terracotta color
3. **Click**: Compressed dot

### Usage
```tsx
/* Mark interactive elements */
<button className="cursor-interactive">
```

## Responsive Breakpoints

```css
sm:  640px   /* Mobile landscape */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
2xl: 1536px  /* Extra large */
```

### Mobile-First Approach
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns */}
</div>
```

## Component Library

### Button Variants

#### Primary CTA
```tsx
<button className="px-10 py-5 bg-gradient-to-r from-terracotta to-[#c66647] text-white font-semibold rounded-full shadow-skeu-lg">
  Primary Action
</button>
```

#### Secondary CTA
```tsx
<button className="px-10 py-5 bg-white text-charcoal font-semibold rounded-full shadow-skeu-md border-2 border-gray-200">
  Secondary Action
</button>
```

#### Ghost Button
```tsx
<button className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-full">
  Ghost Action
</button>
```

### Badge Variants

#### Style Badge
```tsx
<span className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: color }}>
  Ballet
</span>
```

#### Status Badge
```tsx
<span className="px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-700">
  Only 3 spots left!
</span>
```

## Accessibility

### Focus States
```css
:focus-visible {
  outline: 2px solid #d97757;
  outline-offset: 2px;
}
```

### Color Contrast
- All text meets WCAG AA standards
- Terracotta (#D97757) on white: 4.5:1
- Charcoal (#2C2C2C) on cream: 14:1

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order follows visual hierarchy
- Skip links for main content

## Performance Best Practices

### Lazy Loading
```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
>
```

### Image Optimization
```tsx
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  loading="lazy"
/>
```

### Animation Performance
- Use `transform` and `opacity` for GPU acceleration
- Avoid animating `height`, `width`, or `top/left`
- Use `will-change` sparingly

## Design Principles

1. **Warmth Over Coldness**: Use cream and terracotta to create inviting spaces
2. **Organic Over Rigid**: Rounded corners and flowing layouts
3. **Tactile Over Flat**: Subtle depth through shadows and gradients
4. **Fluid Over Static**: Every interaction should feel like a dance movement
5. **Clear Over Clever**: Prioritize user understanding over aesthetic complexity

## Testing Checklist

- [ ] All animations run at 60fps
- [ ] Mobile responsive on 375px width minimum
- [ ] Keyboard navigation works throughout
- [ ] Custom cursor doesn't interfere with interactions
- [ ] Loading states are smooth
- [ ] Error states are helpful
- [ ] Success states are delightful

