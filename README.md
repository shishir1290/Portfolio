# Shishir Portfolio — Next.js + Three.js

A futuristic, dark-themed portfolio website for **Md Sadmanur Islam Shishir**, Full-Stack Developer.

## Tech Stack

- **Next.js 14** (App Router)
- **Three.js** — 3D icosahedron globe animation on hero
- **Canvas API** — interactive particle network background
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — (optional, installed for future enhancements)
- **Lenis** — smooth scroll
- **TypeScript**
- **Google Fonts**: Bebas Neue, Syne, Space Mono

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

### 3. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
shishir-portfolio/
├── app/
│   ├── layout.tsx       # Root layout with fonts
│   ├── page.tsx         # Main page
│   └── globals.css      # Global styles + design tokens
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── SmoothScroll.tsx
│   ├── three/
│   │   ├── ParticleBackground.tsx   # Canvas particle network
│   │   └── ThreeGlobe.tsx           # Three.js icosahedron globe
│   └── sections/
│       ├── HeroSection.tsx
│       ├── AboutSection.tsx
│       ├── SkillsSection.tsx
│       ├── ExperienceSection.tsx
│       ├── ProjectsSection.tsx
│       └── ContactSection.tsx
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Sections

1. **Hero** — Typewriter effect, Three.js globe, particle background
2. **About** — Bio, personal info, education timeline
3. **Skills** — Grouped by category with animated skill tags
4. **Experience** — Timeline with Pakiza Software Limited role
5. **Projects** — Featured + other projects with tech stack
6. **Contact** — Contact form + direct contact info

## Customization

- **Colors**: Edit CSS variables in `app/globals.css` and `tailwind.config.ts`
- **Projects**: Edit the `projects` array in `components/sections/ProjectsSection.tsx`
- **Skills**: Edit `skillGroups` in `components/sections/SkillsSection.tsx`
- **Personal Info**: Update text in the relevant section components

## Deployment

Deploy to **Vercel** in one command:

```bash
npx vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.
