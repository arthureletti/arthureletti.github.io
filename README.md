# Portfolio — Arthur Eletti

> Portfolio Data Analyst · BUT Science des Données — IUT de Niort

## Stack
React 18 · TypeScript · Vite · Tailwind CSS v4 · Motion · Lucide · Sonner · shadcn/ui

## Démarrage rapide

```bash
npm install        # ou pnpm install
npm run dev        # http://localhost:5173
npm run build      # build production → /dist
npm run preview    # prévisualiser le build
```

## Déploiement Vercel (recommandé)

1. Push ce dossier sur GitHub
2. Connecte-toi sur [vercel.com](https://vercel.com)
3. **New Project** → importe le repo
4. Framework preset : **Vite** (auto-détecté)
5. Deploy → ton portfolio est en ligne 🎉

## Structure

```
src/
├── app/
│   ├── components/
│   │   ├── layout/      Navbar, Footer
│   │   ├── home/        HeroBanner, StatCounter, FeaturedProjects, SkillsCloud, ContactCTA
│   │   ├── projects/    ProjectCard, ProjectGrid, TagFilterBar, SearchInput
│   │   ├── about/       TimelineItem
│   │   ├── contact/     ContactForm
│   │   └── common/      TagBadge, SocialLinks, BackButton, Skeleton
│   ├── data/
│   │   └── mockData.ts  ← TES DONNÉES ICI
│   ├── pages/           ProjectsPage, AboutPage, ContactPage, ProjectDetailPage
│   └── providers/       ThemeProvider
└── styles/
    ├── theme.css        ← COULEURS ICI
    └── fonts.css
```

## Personnalisation

- **Données** : `src/app/data/mockData.ts`
- **Couleurs** : `src/styles/theme.css` (variables `--grad-start`, `--grad-mid`, `--grad-end`)
- **Photo** : remplacer `profile.avatarUrl` par une vraie URL ou `/public/photo.jpg`
- **CV** : déposer ton CV dans `/public/cv.pdf`
