# =============================================================
# PARTIE 1 - Sondage sur la population des communes de PACA
# =============================================================

setwd("C:/Users/arthu/OneDrive - Université de Poitiers (1)/SAE/s2/statsInf")

library(readxl)
library(sampling)

donnees = read_excel("population_francaise_communes.xlsx", sheet = "Communes")

str(donnees)
head(donnees)

# On ne garde que les communes de PACA
donnees = subset(donnees,
                 `Nom de la région` == "Provence-Alpes-Côte d'Azur",
                 select = c("Code département", "Commune", "Population totale"))

colnames(donnees) = c("codeDep", "com", "popTot")

U      = donnees$com
N      = length(U)
T_reel = sum(donnees$popTot)   # total habitants PACA (valeur de référence)

# -------------------------------------------------------------
# PARTIE A : SONDAGE ALÉATOIRE SIMPLE - 10 répétitions
# -------------------------------------------------------------

resultat = data.frame(Pop_exacte = numeric(), Pop_estim = numeric(), Marge = numeric())

for (i in 1:10) {

  n = 50
  E = sample(U, n)
  donnees1 = donnees[donnees$com %in% E, ]

  xbar   = mean(donnees1$popTot)
  idcmoy = t.test(donnees1$popTot)$conf.int

  T_est = N * xbar
  idcT  = idcmoy * N
  marge = (idcT[2] - idcT[1]) / 2

  new_row = data.frame(Pop_exacte = T_reel, Pop_estim = T_est, Marge = marge)
  resultat = rbind(resultat, new_row)
}

resultat
write.csv2(resultat, "resultat.csv")

# -------------------------------------------------------------
# PARTIE B : SONDAGE STRATIFIÉ - 10 répétitions
# -------------------------------------------------------------

summary(donnees$popTot)

# Découpage en 6 strates selon la taille de la commune
donnees$strate = cut(donnees$popTot,
                     breaks = c(0, 500, 1000, 2000, 4500, 20000, Inf),
                     labels = c(1, 2, 3, 4, 5, 6))

donneesstrat = donnees[, c("com", "popTot", "strate")]

resultat2 = data.frame(Pop_exacte = numeric(), Pop_estim = numeric(), Marge = numeric())

for (i in 1:10) {

  data = donneesstrat[order(donneesstrat$strate), ]

  Nh = table(data$strate)
  N  = sum(Nh)
  gh = Nh / N

  n  = 50
  nh = round(c(n*Nh[1]/N, n*Nh[2]/N, n*Nh[3]/N, n*Nh[4]/N, n*Nh[5]/N, n*Nh[6]/N))
  fh = nh / Nh

  # tirage stratifié SANS remise
  st    = strata(data, stratanames = c("strate"), size = nh, method = "srswor")
  data1 = getdata(data, st)

  ech1 = data1[data1$strate == 1, ]
  ech2 = data1[data1$strate == 2, ]
  ech3 = data1[data1$strate == 3, ]
  ech4 = data1[data1$strate == 4, ]
  ech5 = data1[data1$strate == 5, ]
  ech6 = data1[data1$strate == 6, ]

  m1 = mean(ech1$popTot) ; var1 = var(ech1$popTot)
  m2 = mean(ech2$popTot) ; var2 = var(ech2$popTot)
  m3 = mean(ech3$popTot) ; var3 = var(ech3$popTot)
  m4 = mean(ech4$popTot) ; var4 = var(ech4$popTot)
  m5 = mean(ech5$popTot) ; var5 = var(ech5$popTot)
  m6 = mean(ech6$popTot) ; var6 = var(ech6$popTot)

  Xbarst = (Nh[1]*m1 + Nh[2]*m2 + Nh[3]*m3 + Nh[4]*m4 + Nh[5]*m5 + Nh[6]*m6) / N

  # variance de l'estimateur (facteur de correction fini : 1 - fh)
  varXbarst = gh[1]^2*(1-fh[1])*var1/nh[1] + gh[2]^2*(1-fh[2])*var2/nh[2] +
              gh[3]^2*(1-fh[3])*var3/nh[3] + gh[4]^2*(1-fh[4])*var4/nh[4] +
              gh[5]^2*(1-fh[5])*var5/nh[5] + gh[6]^2*(1-fh[6])*var6/nh[6]

  alpha = 0.05
  binf  = Xbarst - qnorm(1-alpha/2) * sqrt(varXbarst)
  bsup  = Xbarst + qnorm(1-alpha/2) * sqrt(varXbarst)

  Tstr  = N * Xbarst
  marge = (bsup - binf) * N / 2

  new_row = data.frame(Pop_exacte = T_reel, Pop_estim = Tstr, Marge = marge)
  resultat2 = rbind(resultat2, new_row)
}

resultat2
write.csv2(resultat2, "resultat2.csv")


# =============================================================
# PARTIE 2 - Enquête Sport Étudiant 2024
# Relation entre sport et des variables qualitatives
# =============================================================

d = read.csv2("EnqueteSportEtudiant2024.csv", fileEncoding = "UTF-8-BOM", quote = "")

# Conserver uniquement les répondants valides
# Note : bourse exclue du filtre global (trop de valeurs manquantes -> perte de ~133 individus)
d = subset(d,
           sexe          %in% c("Un homme", "Une femme") &
           sport         %in% c("Oui", "Non")            &
           niveau        != ""                            &
           alternant     %in% c("Non", "Oui")            &
           deptformation %in% c("GEA", "HSE", "SD")      &
           reussite      != "")

# Mise en facteur
d$sport        = factor(d$sport,        levels = c("Non", "Oui"))
d$fan          = factor(d$fan,          levels = c("Non", "Oui"))
d$deptformation= factor(d$deptformation)
d$sexe         = factor(d$sexe,         levels = c("Un homme", "Une femme"))
d$niveau       = factor(d$niveau,       levels = c("BUT1", "BUT2", "BUT3", "Licence Pro"))
d$alimentation = factor(d$alimentation, levels = c("Non", "Oui"))
d$alternant    = factor(d$alternant,    levels = c("Non", "Oui"))
d$reussite     = factor(d$reussite)

head(d[, c("fan", "deptformation", "sexe", "niveau",
           "alimentation", "alternant", "reussite", "sport")])


# -------------------------------------------------------------
# TABLEAUX CROISÉS
# -------------------------------------------------------------

TCD_fan          = table(Sport = d$sport, Fan          = d$fan)
TCD_deptformation= table(Sport = d$sport, Dept         = d$deptformation)
TCD_reussite     = table(Sport = d$sport, Reussite     = d$reussite)
TCD_alimentation = table(Sport = d$sport, Alimentation = d$alimentation)
TCD_sexe         = table(Sport = d$sport, Sexe         = d$sexe)
TCD_alternant    = table(Sport = d$sport, Alternant    = d$alternant)
TCD_niveau       = table(Sport = d$sport, Niveau       = d$niveau)

TCD_fan
TCD_deptformation
TCD_reussite
TCD_alimentation
TCD_sexe
TCD_alternant
TCD_niveau

# -------------------------------------------------------------
# TESTS KHI-DEUX
# -------------------------------------------------------------

khideux_fan          = chisq.test(TCD_fan,           correct = FALSE)
khideux_deptformation= chisq.test(TCD_deptformation, correct = FALSE)
khideux_reussite     = chisq.test(TCD_reussite,      correct = FALSE)
khideux_alimentation = chisq.test(TCD_alimentation,  correct = FALSE)
khideux_sexe         = chisq.test(TCD_sexe,           correct = FALSE)
khideux_alternant    = chisq.test(TCD_alternant,      correct = FALSE)
khideux_niveau       = chisq.test(TCD_niveau,         correct = FALSE)

khideux_fan
khideux_deptformation
khideux_reussite
khideux_alimentation
khideux_sexe
khideux_alternant
khideux_niveau

# -------------------------------------------------------------
# V DE CRAMER
# -------------------------------------------------------------

n = nrow(d)

p = nrow(TCD_fan)          ; q = ncol(TCD_fan)          ; m = min(p-1, q-1)
V_fan = sqrt(khideux_fan$statistic / (n*m))
V_fan

p = nrow(TCD_deptformation); q = ncol(TCD_deptformation); m = min(p-1, q-1)
V_deptformation = sqrt(khideux_deptformation$statistic / (n*m))
V_deptformation

p = nrow(TCD_reussite)     ; q = ncol(TCD_reussite)     ; m = min(p-1, q-1)
V_reussite = sqrt(khideux_reussite$statistic / (n*m))
V_reussite

p = nrow(TCD_alimentation) ; q = ncol(TCD_alimentation) ; m = min(p-1, q-1)
V_alimentation = sqrt(khideux_alimentation$statistic / (n*m))
V_alimentation

p = nrow(TCD_sexe)         ; q = ncol(TCD_sexe)         ; m = min(p-1, q-1)
V_sexe = sqrt(khideux_sexe$statistic / (n*m))
V_sexe

p = nrow(TCD_alternant)    ; q = ncol(TCD_alternant)    ; m = min(p-1, q-1)
V_alternant = sqrt(khideux_alternant$statistic / (n*m))
V_alternant

p = nrow(TCD_niveau)       ; q = ncol(TCD_niveau)       ; m = min(p-1, q-1)
V_niveau = sqrt(khideux_niveau$statistic / (n*m))
V_niveau

# --- Tableau récapitulatif ---
recap = data.frame(
  Variable  = c("fan", "deptformation", "reussite", "alimentation",
                "sexe", "alternant", "niveau"),
  p_valeur  = round(c(khideux_fan$p.value, khideux_deptformation$p.value,
                      khideux_reussite$p.value, khideux_alimentation$p.value,
                      khideux_sexe$p.value, khideux_alternant$p.value,
                      khideux_niveau$p.value), 5),
  V_Cramer  = round(c(V_fan, V_deptformation, V_reussite, V_alimentation,
                      V_sexe, V_alternant, V_niveau), 4)
)

recap = recap[order(-recap$V_Cramer), ]
print(recap, row.names = FALSE)
