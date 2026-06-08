# Portfolio — Arthur Eletti

> Data Analyst · BUT Science des Données — IUT de Niort

## Déploiement GitHub Pages

### 1. Configurer le nom du repo dans vite.config.ts

```ts
base: '/NOM_DU_REPO/',  // ex: '/portfolio/' ou '/arthureletti.github.io/' si c'est ton repo principal
```

> **Cas spécial** : si ton repo s'appelle exactement `arthureletti.github.io`,
> alors mets `base: '/'` (pas de sous-dossier).

### 2. Activer GitHub Pages dans les paramètres du repo

- Aller dans **Settings → Pages**
- Source : **GitHub Actions**

### 3. Push sur main → déploiement automatique

```bash
git add .
git commit -m "fix: github pages config"
git push origin main
```

Le workflow `.github/workflows/deploy.yml` se déclenche automatiquement.
Ton site sera disponible sur `https://arthureletti.github.io/NOM_DU_REPO/`

---

## Dev local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build production
npm run preview  # prévisualiser le build
```

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
│   │   ├── common/      TagBadge, SocialLinks, BackButton, Skeleton
│   │   └── ui/          composants shadcn
│   ├── data/
│   │   └── mockData.ts  ← TES DONNÉES ICI
│   ├── pages/
│   └── providers/
└── styles/
    └── theme.css        ← COULEURS ICI
```

## Personnalisation rapide

| Quoi | Où |
|---|---|
| Nom, bio, email, liens | `src/app/data/mockData.ts` → `profile` |
| Projets | `src/app/data/mockData.ts` → `projects` |
| Compétences | `src/app/data/mockData.ts` → `skills` |
| Couleurs du dégradé | `src/styles/theme.css` → `--grad-start/mid/end` |
| CV PDF | `public/cv.pdf` |
| Photo de profil | `profile.avatarUrl` dans mockData.ts |
