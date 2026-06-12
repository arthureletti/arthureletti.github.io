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
  type: 'pdf' | 'pbix' | 'xlsx' | 'csv' | 'github' | 'colab' | 'r' | 'other';
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
    id: '2b',
    slug: 'sae-statistiques-inference',
    title: 'SAE Statistiques & Inférence — Sondage PACA et Enquête Sport Étudiant',
    summary: 'Rapport d\'analyse statistique en R : estimation de la population PACA par sondage (SAS vs stratifié) et étude des liens entre pratique sportive et variables sociodémographiques par tests khi-deux.',
    body: `# SAE – Statistiques et Inférence

## Contexte du projet

Projet de SAE (Situation d'Apprentissage et d'Évaluation) réalisé en binôme avec Mathéo Brigaud dans le cadre du BUT Science des Données (IUT de Niort, 2024–2025), encadré par M. Ibazizen.

Le rapport présente deux études statistiques complémentaires menées sur des données réelles sous le logiciel **R**.

---

## Partie 1 — Sondage sur la population des communes de PACA

### Objectif
Estimer le nombre total d'habitants de la région **Provence-Alpes-Côte d'Azur** à partir d'un échantillon de communes, sans recenser la totalité des **961 communes** de la région.

### Sondage aléatoire simple (SAS)
Tirage d'un échantillon de **n = 50 communes** sans remise. L'estimateur du total est T̂ = N × x̄, avec intervalle de confiance à 95 % via le test de Student. Procédure répétée **10 fois** pour observer la variabilité.

**Résultats :** marge d'erreur moyenne de **3 191 660 habitants**, estimation moyenne à **−12,7 %** du total réel (5 174 034 hab.).

### Sondage stratifié
Les communes sont réparties en **6 strates homogènes** selon leur taille (< 500 hab. jusqu'à > 20 000 hab.) avec **allocation proportionnelle**. L'estimateur de la moyenne stratifiée est x̄_st = Σ (Nh/N) × m_h.

**Résultats :** marge d'erreur réduite à **1 296 906 habitants** (−59 % vs SAS), estimation moyenne à seulement **−0,8 %** du total réel.

### Conclusion Partie 1
Le sondage stratifié produit des estimations **nettement plus précises** à taille d'échantillon identique. En divisant la population en strates homogènes, on réduit la variance interne et donc l'incertitude globale — résultat illustrant l'intérêt de la stratification quand une variable auxiliaire est corrélée à la variable d'intérêt.

---

## Partie 2 — Enquête Sport Étudiant 2024

### Objectif
Identifier quelles variables sociodémographiques ou comportementales sont **significativement liées** à la pratique sportive déclarée, parmi 375 répondants étudiants en BUT à l'Université de Poitiers (361 après nettoyage — 75,3 % de pratiquants).

### Méthodologie
Pour 7 variables candidates (fan de sport, département de formation, réussite, alimentation, sexe, statut alternant, niveau), construction de tableaux croisés puis :
- **Test du khi-deux** (H₀ : indépendance entre sport et la variable)
- **V de Cramer** pour mesurer l'intensité de la liaison (0 = aucune, 1 = parfaite)

### Résultats — 6 variables significatives (p < 0,05)

| Variable | p-valeur | V de Cramer |
|---|---|---|
| Fan de sport | < 0,001 | **0,4453** (modérée) |
| Réussite perçue | 0,001 | 0,2077 |
| Département (GEA/HSE/SD) | < 0,001 | 0,2063 |
| Alimentation | < 0,001 | 0,2028 |
| Sexe | 0,001 | 0,1783 |
| Statut alternant | 0,020 | 0,1222 |

La variable **fan** est la plus discriminante : 196/272 pratiquants sont fans vs 19/89 non-pratiquants. La filière **GEA** est nettement moins sportive que HSE et SD.

### Conclusion Partie 2
La pratique sportive est un **comportement multifactoriel** — aucune variable prise isolément ne prédit fortement la pratique. Une approche multivariée (régression logistique) permettrait d'affiner ces conclusions.

---

## Technologies utilisées

- **R** (readxl, sampling, chisq.test, V de Cramer)
- **Excel** (visualisation des résultats, graphiques)`,
    coverUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    files: [
      { label: 'Rapport d\'analyse (PDF)',              url: '/projets/sae-statistiques-inference/rapport.pdf',                      type: 'pdf'   },
      { label: 'Script R corrigé',                     url: '/projets/sae-statistiques-inference/script.R',                         type: 'r'     },
      { label: 'Sujet de la SAE',                      url: '/projets/sae-statistiques-inference/sujet.pdf',                        type: 'pdf'   },
      { label: 'Données enquête sport (.csv)',          url: '/projets/sae-statistiques-inference/EnqueteSportEtudiant2024.csv',     type: 'csv'   },
      { label: 'Données enquête sport (.xlsx)',         url: '/projets/sae-statistiques-inference/EnqueteSportEtudiant2024.xlsx',    type: 'xlsx'  },
      { label: 'Population communes France (.xlsx)',    url: '/projets/sae-statistiques-inference/population_francaise_communes.xlsx', type: 'xlsx' },
    ],
    featured: false,
    status: 'published',
    publishedAt: '2025-05-01',
    tags: [tags[5], tags[4], tags[6]],
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
