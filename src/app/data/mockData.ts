export interface Tag {
  id: string;
  name: string;
  label: string;
  color: string;
  category: 'ML' | 'SQL' | 'Stats' | 'Viz' | 'Other';
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
];

export const projects: Project[] = [
  {
    id: '1',
    slug: 'greensd-gestion-logistique-verte',
    title: 'GreenSD — Application de gestion logistique verte',
    summary: 'Application complète pour une entreprise de logistique écologique : base MySQL, interface graphique, suivi CO₂ et chatbot intégré.',
    body: `# Contexte du projet\n\nDans ce projet mené en binôme, nous avons développé une application complète pour une entreprise de logistique écologique.\n\n## Ce que nous avons réalisé\n\n- Nettoyage et intégration de données CSV dans une base **MySQL**\n- Création d'une **interface graphique** permettant de visualiser les tables, effectuer des insertions et exécuter des requêtes SQL\n- Suivi des livraisons, des véhicules écologiques, des tournées des livreurs et des **émissions CO₂ estimées**\n- Intégration d'un **chatbot** directement dans l'interface pour guider l'utilisateur\n\n## Technologies utilisées\n\n- Python (interface graphique)\n- MySQL (base de données)\n- CSV (données sources)`,
    coverUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
    githubUrl: 'https://github.com/arthureletti',
    featured: true,
    status: 'published',
    publishedAt: '2024-06-01',
    tags: [tags[0], tags[1], tags[7]],
  },
  {
    id: '2',
    slug: 'conversion-json-csv-python',
    title: 'Gestion de fichiers : conversion JSON vers CSV en Python',
    summary: 'Script Python de nettoyage et conversion de données de pollution atmosphérique depuis JSON vers CSV exploitable sous Excel.',
    body: `# Contexte du projet\n\nDans ce projet réalisé en binôme, nous avons développé un script Python permettant de lire un fichier JSON contenant des données de concentration de polluants dans l'air.\n\n## Fonctionnalités\n\n- Lecture d'un fichier **JSON** de données environnementales\n- Nettoyage des données : gestion des erreurs, filtrage des lignes incomplètes, reformatage des dates\n- Export en **CSV** exploitable sous Excel\n\n## Technologies utilisées\n\n- Python (json, csv, os)`,
    coverUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
    githubUrl: 'https://github.com/arthureletti',
    featured: false,
    status: 'published',
    publishedAt: '2024-03-15',
    tags: [tags[0]],
  },
  {
    id: '3',
    slug: 'tableau-de-bord-notes-excel-vba',
    title: 'Tableau de bord de gestion des notes — Excel VBA',
    summary: 'Outil Excel interactif avec tableau de bord, graphiques de moyennes, validation automatique d\'année et profil radar par compétence.',
    body: `# Contexte du projet\n\nJ'ai conçu un outil de gestion de notes sous Excel intégrant un tableau de bord interactif.\n\n## Fonctionnalités\n\n- Saisie des notes par **compétence** et par **semestre**\n- Visualisation des moyennes sous forme de **graphiques**\n- Validation automatique de l'année\n- **Profil radar** représentant l'évolution de l'étudiant\n\n## Technologies utilisées\n\n- Excel / VBA (macros)`,
    coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    featured: false,
    status: 'published',
    publishedAt: '2024-04-10',
    tags: [tags[3], tags[2]],
  },
  {
    id: '4',
    slug: 'ecrans-impacts-etudiants-niortais',
    title: 'Écrans : quels impacts sur les étudiants niortais ?',
    summary: 'Enquête auprès de 373 étudiants de l\'IUT de Niort sur les usages du téléphone portable et leurs conséquences sur le sommeil et la concentration.',
    body: `# Contexte du projet\n\nEnquête complète auprès de **373 étudiants** de l'IUT de Niort sur leurs usages du téléphone portable.\n\n## Résultats clés\n\n- Les réseaux sociaux dominent les usages\n- Majorité des étudiants utilise son téléphone plus de **3h par jour**\n- Lien significatif entre dépendance au téléphone et **troubles du sommeil / concentration**`,
    coverUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    featured: false,
    status: 'published',
    publishedAt: '2024-05-20',
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
    publishedAt: '2024-05-01',
    tags: [tags[4], tags[6]],
  },
  {
    id: '6',
    slug: 'prediction-valeurs-foncieres-regression-lineaire',
    title: 'Prédiction des valeurs foncières par régression linéaire',
    summary: 'Modélisation du prix de vente de biens immobiliers en R par régression linéaire simple, avec calcul manuel des moindres carrés et export CSV.',
    body: `# Contexte du projet\n\nModélisation du prix de biens immobiliers en **R**, calcul manuel des coefficients par moindres carrés, évaluation via R² et export des prédictions en CSV.`,
    coverUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    githubUrl: 'https://github.com/arthureletti',
    featured: false,
    status: 'published',
    publishedAt: '2024-04-25',
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
    publishedAt: '2024-03-01',
    tags: [tags[6]],
  },
  {
    id: '8',
    slug: 'questionnaire-reseaux-sociaux',
    title: 'Conception d\'un questionnaire sur les réseaux sociaux',
    summary: 'Conception méthodologique d\'un questionnaire mesurant les habitudes et motivations d\'utilisation des réseaux sociaux.',
    body: `# Contexte du projet\n\nConception d'un questionnaire sur les habitudes et motivations d'utilisation des réseaux sociaux : questions neutres, échelles de Likert, structuration logique.`,
    coverUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800',
    featured: false,
    status: 'published',
    publishedAt: '2024-02-15',
    tags: [tags[6], tags[4]],
  },
];

export const skills: Skill[] = [
  { id: '1',  name: 'Python',        level: 3, iconName: 'code-2',         category: 'Langages' },
  { id: '2',  name: 'SQL',           level: 3, iconName: 'database',       category: 'Langages' },
  { id: '3',  name: 'R',             level: 2, iconName: 'bar-chart',      category: 'Langages' },
  { id: '4',  name: 'VBA',           level: 2, iconName: 'table',          category: 'Langages' },
  { id: '5',  name: 'Excel',         level: 4, iconName: 'file-spreadsheet', category: 'Outils' },
  { id: '6',  name: 'Power BI',      level: 3, iconName: 'bar-chart-3',    category: 'Outils'   },
  { id: '7',  name: 'PowerPoint',    level: 4, iconName: 'presentation',   category: 'Outils'   },
  { id: '8',  name: 'Word',          level: 4, iconName: 'file-text',      category: 'Outils'   },
  { id: '9',  name: 'Git',           level: 2, iconName: 'git-branch',     category: 'Outils'   },
  { id: '10', name: 'Statistiques',  level: 3, iconName: 'trending-up',    category: 'Méthodes' },
  { id: '11', name: 'Visualisation', level: 3, iconName: 'pie-chart',      category: 'Méthodes' },
  { id: '12', name: 'Enquête',       level: 3, iconName: 'clipboard-list', category: 'Méthodes' },
];

export const profile: Profile = {
  bio: "Étudiant en première année de BUT Science des Données à l'IUT de Niort. Passionné par la donnée sous toutes ses formes : analyse, visualisation, bases de données et statistiques. Je construis mes compétences projet après projet, avec rigueur et curiosité.",
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  email: 'arthureletti9@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/arthur-eletti-08418735b/',
  githubUrl: 'https://github.com/arthureletti',
  cvUrl: '/cv.pdf',
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
    id: '1',
    date: '2024 — Présent',
    title: 'BUT Science des Données (1ère année)',
    organization: 'IUT de Niort',
    description: 'Formation pluridisciplinaire couvrant la statistique, la programmation (Python, R, SQL), la visualisation de données et la gestion de bases de données.',
    type: 'education',
  },
];
