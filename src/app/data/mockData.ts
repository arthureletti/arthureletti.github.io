export interface Tag {
  id: string;
  name: string;
  label: string;
  color: string;
  category: 'ML' | 'SQL' | 'Stats' | 'Viz' | 'Other';
}

export interface ProjectFile {
  label: string;
  url: string;
  type: 'pdf' | 'pbix' | 'xlsx' | 'csv' | 'github' | 'colab' | 'other';
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  coverUrl: string;
  githubUrl?: string;
  pdfUrl?: string;
  colabUrl?: string;
  files?: ProjectFile[];
  featured: boolean;
  status: 'draft' | 'published' | 'ongoing';
  publishedAt: string;
  tags: Tag[];
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  iconName: string;
  category: string;
}

export interface Profile {
  bio: string;
  avatarUrl: string;
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  cvUrl: string;
  openToWork: boolean;
}

export const tags: Tag[] = [
  { id: '1', name: 'python',        label: 'Python',        color: '#E85D04', category: 'Other' },
  { id: '2', name: 'sql',           label: 'SQL',           color: '#059669', category: 'SQL'   },
  { id: '3', name: 'visualisation', label: 'Visualisation', color: '#BE185D', category: 'Viz'   },
  { id: '4', name: 'excel-vba',     label: 'Excel / VBA',   color: '#D97706', category: 'Other' },
  { id: '5', name: 'statistiques',  label: 'Statistiques',  color: '#DC2626', category: 'Stats' },
  { id: '6', name: 'r-lang',        label: 'R',             color: '#7C3AED', category: 'Other' },
  { id: '7', name: 'enquete',       label: 'Enquête',       color: '#0369A1', category: 'Stats' },
  { id: '8', name: 'mysql',         label: 'MySQL',         color: '#059669', category: 'SQL'   },
  { id: '9', name: 'power-bi',      label: 'Power BI',      color: '#F2C811', category: 'Viz'   },
];

export const projects: Project[] = [
  {
    id: '0',
    slug: 'les-chemins-du-bonheur-power-bi',
    title: 'Les Chemins du Bonheur — Malte & Suisse, Power BI',
    summary: 'Rapport Power BI de 8 pages comparant le bonheur de Malte et la Suisse à travers 4 piliers (esprit, corps, cœur, âme) sur données Eurostat 2013–2024.',
    body: `# Les Chemins du Bonheur — Malte & Suisse

## Contexte du projet

Projet de **Data Visualisation** réalisé en groupe de 4 dans le cadre du BUT Science des Données (IUT de Niort, Avril–Mai 2026), encadré par T. AGBAHOUNGBATA.

L'objectif était de choisir deux pays de l'Union Européenne et de **raconter une histoire** autour d'indicateurs démographiques, sociaux et économiques, en identifiant :
- **5 différences** significatives entre les deux pays
- **5 ressemblances**
- **5 écarts** significatifs par rapport à la moyenne européenne

Notre groupe a choisi **Malte (MT)** et la **Suisse (CH)** — deux petits pays aux profils opposés — autour d'une question centrale : *qu'est-ce qui rend un peuple heureux ?*

## Structure du rapport (8 pages)

### Page 1 — Présentation : Les Chemins du Bonheur
Introduction narrative autour de 4 piliers du bonheur : **L'esprit, Le corps, Le cœur, L'âme**.

### Page 2 — Portraits croisés
Comparaison démographique : densité de population (Malte : 1 820 hab/km² — 1er de l'UE), structure par âge, taux d'évolution 2014–2025, part des 65 ans et plus.

### Page 3 — L'esprit (bonheur intellectuel)
Satisfaction de vie (Suisse : 7,7 / Malte : 7,5 — tous deux au-dessus de la moyenne UE de 7,2), taux de diplômés du supérieur, chômage, emploi des jeunes diplômés, compétences PISA à 15 ans.

### Page 4 — Le corps (bonheur physique)
Espérance de vie (Suisse : 83,5 ans / Malte : 82,3 ans), mortalité infantile, facteurs de risque (obésité, tabagisme, alcool, pollution PM2.5), dépenses de santé par habitant.

### Page 5 — Le cœur (bonheur relationnel)
Taux de mariage et divorce, recul de la nuptialité, taux de surpeuplement, âge moyen au premier enfant.

### Page 6 — L'âme (croire donne-t-il un sens ?)
Pratique religieuse (52 % des Maltais vs 16 % des Suisses), confiance interpersonnelle, bénévolat, confiance envers les institutions — radar des 5 indicateurs.

### Page 7 — Synthèse
Score WHR Global (World Happiness Report 2024) : Suisse #2 mondiale / Malte #26. Radar des 4 piliers comparatif.

### Page 8 — Sources & Méthodologie
9 datasets Eurostat (base EU Niort), données externes OMS, OCDE, European Social Survey, Eurobaromètre, FMI.

## Données utilisées

- **Base interne** : 9 datasets Eurostat (population, mortalité, nuptialité, fertilité, divorces 2013–2024)
- **Données externes** : World Happiness Report 2024, OMS/GHO, OCDE Health, European Social Survey, Eurobaromètre, Agence Européenne pour l'Environnement

## Résultats clés

Malgré des profils opposés (foi vs institutions, communauté vs individualisme), **Malte (#26) et la Suisse (#2)** arrivent toutes deux dans le top 30 mondial du bonheur. Le bonheur n'a pas de formule unique — il demande un pilier solide, n'importe lequel.

## Technologies utilisées

- **Power BI** (rapport interactif 8 pages, navigation par boutons)
- **Eurostat Data Browser** (extraction et traitement des données)
- DAX pour les mesures calculées`,
    coverUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    files: [
      { label: 'Rapport Power BI (export PDF)',  url: '/chemins-bonheur-rapport.pdf',  type: 'pdf'  },
      { label: 'Fichier Power BI (.pbix)',        url: '/chemins-bonheur-rapport.pbix', type: 'pbix' },
      { label: 'Sujet du projet',                url: '/chemins-bonheur-sujet.pdf',    type: 'pdf'  },
    ],
    featured: true,
    status: 'published',
    publishedAt: '2026-05-01',
    tags: [tags[8], tags[4], tags[2]],
  },
  {
    id: '1',
    slug: 'greensd-gestion-logistique-verte',
    title: 'GreenSD — Application de gestion logistique verte',
    summary: 'Application complète pour une entreprise de logistique écologique : base MySQL, interface graphique, suivi CO₂ et chatbot intégré.',
    body: `# Contexte du projet\n\nDans ce projet mené en binôme, nous avons développé une application complète pour une entreprise de logistique écologique.\n\n## Ce que nous avons réalisé\n\n- Nettoyage et intégration de données CSV dans une base **MySQL**\n- Création d'une **interface graphique** permettant de visualiser les tables, effectuer des insertions et exécuter des requêtes SQL\n- Suivi des livraisons, des véhicules écologiques, des tournées des livreurs et des **émissions CO₂ estimées**\n- Intégration d'un **chatbot** directement dans l'interface pour guider l'utilisateur\n\n## Technologies utilisées\n\n- Python (interface graphique)\n- MySQL (base de données)\n- CSV (données sources)`,
    coverUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
    githubUrl: 'https://github.com/arthureletti',
    files: [
      { label: 'Code source GitHub', url: 'https://github.com/arthureletti', type: 'github' },
    ],
    featured: true,
    status: 'published',
    publishedAt: '2026-04-01',
    tags: [tags[0], tags[1], tags[7]],
  },
  {
    id: '2',
    slug: 'conversion-json-csv-python',
    title: 'Gestion de fichiers : conversion JSON vers CSV en Python',
    summary: 'Script Python de nettoyage et conversion de données de pollution atmosphérique depuis JSON vers CSV exploitable sous Excel.',
    body: `# Contexte du projet\n\nDans ce projet réalisé en binôme, nous avons développé un script Python permettant de lire un fichier JSON contenant des données de concentration de polluants dans l'air.\n\n## Fonctionnalités\n\n- Lecture d'un fichier **JSON** de données environnementales\n- Nettoyage des données : gestion des erreurs, filtrage des lignes incomplètes, reformatage des dates\n- Export en **CSV** exploitable sous Excel\n\n## Technologies utilisées\n\n- Python (json, csv, os)`,
    coverUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
    files: [
      { label: 'Code source GitHub', url: 'https://github.com/arthureletti', type: 'github' },
    ],
    featured: false,
    status: 'published',
    publishedAt: '2026-03-15',
    tags: [tags[0]],
  },
  {
    id: '3',
    slug: 'tableau-de-bord-notes-excel-vba',
    title: 'Tableau de bord de gestion des notes — Excel VBA',
    summary: "Outil Excel interactif avec tableau de bord, graphiques de moyennes, validation automatique d'année et profil radar par compétence.",
    body: `# Contexte du projet\n\nJ'ai conçu un outil de gestion de notes sous Excel intégrant un tableau de bord interactif.\n\n## Fonctionnalités\n\n- Saisie des notes par **compétence** et par **semestre**\n- Visualisation des moyennes sous forme de **graphiques**\n- Validation automatique de l'année\n- **Profil radar** représentant l'évolution de l'étudiant\n\n## Technologies utilisées\n\n- Excel / VBA (macros)`,
    coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    featured: false,
    status: 'published',
    publishedAt: '2026-04-10',
    tags: [tags[3], tags[2]],
  },
  {
    id: '4',
    slug: 'ecrans-impacts-etudiants-niortais',
    title: 'Écrans : quels impacts sur les étudiants niortais ?',
    summary: "Enquête auprès de 373 étudiants de l'IUT de Niort sur les usages du téléphone portable et leurs conséquences sur le sommeil et la concentration.",
    body: `# Contexte du projet\n\nEnquête complète auprès de **373 étudiants** de l'IUT de Niort sur leurs usages du téléphone portable.\n\n## Résultats clés\n\n- Les réseaux sociaux dominent les usages\n- Majorité des étudiants utilise son téléphone plus de **3h par jour**\n- Lien significatif entre dépendance au téléphone et **troubles du sommeil / concentration**`,
    coverUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    featured: false,
    status: 'published',
    publishedAt: '2026-05-20',
    tags: [tags[6], tags[4], tags[2]],
  },
  {
    id: '5',
    slug: 'rearmement-demographique-communes-natalite',
    title: 'Le réarmement démographique en France : communes à forte natalité',
    summary: 'Étude statistique sur 29 communes françaises du dernier centile de natalité à partir des données INSEE 2022.',
    body: `# Contexte du projet\n\nÉtude statistique complète sur les communes françaises à forte natalité.\n\n## Méthodologie\n\n- Source : **données INSEE 2022**\n- Échantillon : **29 communes** du dernier centile\n- Analyse démographique, sociale et économique`,
    coverUrl: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800',
    featured: false,
    status: 'published',
    publishedAt: '2026-05-01',
    tags: [tags[4], tags[6]],
  },
  {
    id: '6',
    slug: 'prediction-valeurs-foncieres-regression-lineaire',
    title: 'Prédiction des valeurs foncières par régression linéaire',
    summary: 'Modélisation du prix de vente de biens immobiliers en R par régression linéaire simple, avec calcul manuel des moindres carrés et export CSV.',
    body: `# Contexte du projet\n\nModélisation du prix de biens immobiliers en **R**, calcul manuel des coefficients par moindres carrés, évaluation via R² et export des prédictions en CSV.`,
    coverUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    featured: false,
    status: 'published',
    publishedAt: '2026-04-25',
    tags: [tags[5], tags[4]],
  },
  {
    id: '7',
    slug: 'quimper-limerick-economie-culture',
    title: 'Quimper et sa ville jumelée Limerick',
    summary: 'Présentation économique et culturelle de Quimper et Limerick, en français et en anglais.',
    body: `# Contexte du projet\n\nPrésentation de l'économie et de la culture de **Quimper** et sa ville jumelée **Limerick**, en français et en anglais.`,
    coverUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800',
    featured: false,
    status: 'published',
    publishedAt: '2025-11-01',
    tags: [tags[6]],
  },
  {
    id: '8',
    slug: 'questionnaire-reseaux-sociaux',
    title: "Conception d'un questionnaire sur les réseaux sociaux",
    summary: "Conception méthodologique d'un questionnaire mesurant les habitudes et motivations d'utilisation des réseaux sociaux.",
    body: `# Contexte du projet\n\nConception d'un questionnaire sur les habitudes et motivations d'utilisation des réseaux sociaux : questions neutres, échelles de Likert, structuration logique.`,
    coverUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800',
    featured: false,
    status: 'published',
    publishedAt: '2025-10-15',
    tags: [tags[6], tags[4]],
  },
];

export const skills: Skill[] = [
  { id: '1',  name: 'Python',        level: 3, iconName: 'code-2',           category: 'Langages' },
  { id: '2',  name: 'SQL',           level: 3, iconName: 'database',         category: 'Langages' },
  { id: '3',  name: 'R',             level: 2, iconName: 'bar-chart',        category: 'Langages' },
  { id: '4',  name: 'VBA',           level: 2, iconName: 'table',            category: 'Langages' },
  { id: '5',  name: 'SAS',           level: 1, iconName: 'cpu',              category: 'Langages' },
  { id: '6',  name: 'Excel',         level: 4, iconName: 'file-spreadsheet', category: 'Outils'   },
  { id: '7',  name: 'Power BI',      level: 3, iconName: 'bar-chart-3',      category: 'Outils'   },
  { id: '8',  name: 'PowerPoint',    level: 4, iconName: 'presentation',     category: 'Outils'   },
  { id: '9',  name: 'Word',          level: 4, iconName: 'file-text',        category: 'Outils'   },
  { id: '10', name: 'Git',           level: 2, iconName: 'git-branch',       category: 'Outils'   },
  { id: '11', name: 'Statistiques',  level: 3, iconName: 'trending-up',      category: 'Méthodes' },
  { id: '12', name: 'Visualisation', level: 3, iconName: 'pie-chart',        category: 'Méthodes' },
  { id: '13', name: 'Enquête',       level: 3, iconName: 'clipboard-list',   category: 'Méthodes' },
];

export const profile: Profile = {
  bio: "Étudiant en 1ère année de BUT Science des Données à l'IUT de Niort (Université de Poitiers). En recherche d'une alternance du 01/09/2026 au 01/07/2028. Passionné par l'analyse de données, la visualisation et les bases de données.",
  avatarUrl: '/photo.jpg',
  email: 'arthureletti9@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/arthur-eletti-08418735b/',
  githubUrl: 'https://github.com/arthureletti',
  cvUrl: '/cvAlternanceNiort.pdf',
  openToWork: true,
};

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  organization: string;
  description: string;
  type: 'experience' | 'education';
}

export const timeline: TimelineItem[] = [
  {
    id: 'edu1',
    date: '2025 — Présent',
    title: 'BUT Science des Données (1ère année)',
    organization: 'IUT de Niort — Université de Poitiers',
    description: 'Formation couvrant la statistique, Python, R, SQL, SAS, la visualisation de données et la gestion de bases de données.',
    type: 'education',
  },
  {
    id: 'edu2',
    date: '2024 — 2025',
    title: "BUT Informatique — Réalisation d'applications",
    organization: 'IUT du Limousin, site de Limoges',
    description: "Première année de BUT Informatique, parcours développement d'applications.",
    type: 'education',
  },
  {
    id: 'edu3',
    date: '2023 — 2024',
    title: 'Baccalauréat mention Assez Bien',
    organization: 'Lycée Pierre Bourdan, Guéret',
    description: 'Spécialités mathématiques et physique-chimie, option mathématiques expertes.',
    type: 'education',
  },
  {
    id: 'exp1',
    date: 'Juil. — Août 2025',
    title: 'Hôte de caisse',
    organization: 'Brico Leclerc, Guéret',
    description: 'Accueil et encaissement clients. Compétences : adaptabilité, communication, autonomie, patience, travail en équipe.',
    type: 'experience',
  },
  {
    id: 'exp2',
    date: 'Été 2024 & Juil. 2025',
    title: 'Agent logistique polyvalent',
    organization: 'Dilisco, Chéniers',
    description: "Entreprise de distribution de livres. Supervision de marchandises, gestion de stocks, rigueur et réactivité.",
    type: 'experience',
  },
];
