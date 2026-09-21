-- 015_orientation_seed.sql — Contenu initial assistant orientation (modifiable depuis /direction)
-- Les tarifs/adresses marqués "(indicatif)" sont des EXEMPLES : l'admin les corrige dans Direction > Orientation.

insert into public.orientation_topics (slug, category, title, content, keywords, is_published, sort_order) values

-- ================= FILIERES =================
('a4', 'filieres', 'Série A4 — Lettres, Arts & Sciences Humaines',
$$La série A4 est la voie littéraire : philosophie, français, histoire-géographie, anglais (LV1) + allemand ou espagnol (LV2), SVT et mathématiques pour la culture générale.

Matières dominantes : philosophie, français, histoire-géographie, langues vivantes.

Profil idéal : tu aimes lire, écrire, débattre et comprendre la société.

Débouchés : droit, lettres, journalisme, communication, relations internationales, administration publique, enseignement.

Admission : BEPC puis orientation en Seconde A (littéraire) selon ton profil et tes notes en matières littéraires.$$
, 'a4, litteraire, lettres, philosophie, francais, histoire, geographie, anglais, droit, journalisme, communication, lettres modernes', true, 10),

('d', 'filieres', 'Série D — Sciences Expérimentales & Agronomie',
$$La série D est la voie des sciences de la vie : mathématiques, physique-chimie et SVT au cœur du programme, plus français, philosophie, histoire-géographie et anglais.

Matières dominantes : mathématiques, physique-chimie, SVT.

Profil idéal : tu es rigoureux, tu aimes les expériences, la biologie et résoudre des problèmes concrets (santé, agriculture, environnement).

Débouchés : médecine, pharmacie, agronomie, biotechnologie, environnement, professorat de sciences.

Admission : BEPC avec un bon niveau en maths et sciences, orientation en Seconde scientifique.$$
, 'd, scientifique, maths, mathematiques, physique, chimie, svt, biologie, medecine, pharmacie, agronomie, sante, laboratoire', true, 20),

('f2', 'filieres', 'Série F2 — Électronique & Informatique Industrielle',
$$La série F2 forme aux circuits électroniques, aux systèmes automatisés, aux microcontrôleurs et à la maintenance informatique et réseaux.

Matières dominantes : mathématiques, physique, électronique analogique et numérique, travaux pratiques en atelier.

Épreuves au BAC : français, histoire-géo, maths, sciences physiques, anglais, philo + électronique analytique.

Profil idéal : tu aimes démonter, câbler, programmer et comprendre comment les appareils fonctionnent.

Débouchés : technicien supérieur en électronique, maintenance réseaux et systèmes, BTS industriel. Taux de réussite BAC1 2025 au Togo : 68,9 %.

Admission : BEPC, étude de dossier (relevé BEPC + bulletins de 3e légalisés).$$
, 'f2, electronique, informatique, circuits, maintenance, reseaux, microcontroleur, automatisme, atelier, bts industriel', true, 30),

('f3', 'filieres', 'Série F3 — Électrotechnique',
$$La série F3 forme à la production, au transport, à la distribution et à l'utilisation de l'énergie électrique, en industrie comme dans le bâtiment.

Matières dominantes : mathématiques, physique, électrotechnique, schémas et travaux pratiques (câblage, tableaux, sécurité).

Épreuves au BAC : français, histoire-géo, maths, sciences physiques, anglais, philo + électrotechnique.

Profil idéal : tu aimes l'énergie, les installations, le concret des chantiers et des usines.

Débouchés : électrotechnicien, installateur industriel, maintenance, BTS électrotechnique. Taux de réussite BAC1 2025 au Togo : 40,6 % — une série exigeante, l'assiduité en atelier fait la différence.

Admission : BEPC, étude de dossier.$$
, 'f3, electrotechnique, electricite, energie, cablage, installation, industriel, usine, tableau electrique, bts', true, 40),

('f4', 'filieres', 'Série F4 — Génie Civil & Bâtiment',
$$La série F4 forme à la conception et à la conduite de chantiers : calcul de structures, dessin technique et DAO/CAO, métré, organisation de chantier.

Matières dominantes : mathématiques, physique, construction, dessin technique, métré, travaux pratiques.

Épreuves au BAC : français, histoire-géo, maths, sciences physiques, anglais, philo + métré.

Profil idéal : tu aimes dessiner, mesurer, construire et voir un ouvrage sortir de terre.

Débouchés : conducteur de travaux, dessinateur-projeteur BTP, chef d'équipe, BTS génie civil. Taux de réussite BAC1 2025 au Togo : 23,6 % — la régularité en dessin et en maths est décisive.

Admission : BEPC, étude de dossier.$$
, 'f4, genie civil, batiment, btp, construction, chantier, dessin technique, dao, cao, metre, conducteur travaux, macon', true, 50),

('g1', 'filieres', 'Série G1 — Techniques Administratives & Secrétariat',
$$La série G1 prépare aux métiers du bureau et de l'administration : secrétariat de direction, communication professionnelle, bureautique, économie et droit.

Matières dominantes : français, économie générale, économie organisationnelle, droit, informatique/bureautique, mathématiques.

Profil idéal : tu es organisé, à l'aise à l'écrit et à l'oral, et tu aimes faire tourner un bureau.

Débouchés : secrétaire de direction, assistant de gestion, BTS bureautique. Taux de réussite BAC1 2025 au Togo : 73,3 % — la meilleure des séries tertiaires.

Admission : BEPC, étude de dossier.$$
, 'g1, secretariat, administratif, administration, bureautique, assistant direction, communication, informatique, tertiaire', true, 60),

('g2', 'filieres', 'Série G2 — Comptabilité & Gestion',
$$La série G2 forme aux chiffres de l'entreprise : comptabilité générale et analytique, mathématiques financières, fiscalité, droit des affaires, économie.

Matières dominantes : comptabilité, maths générales et financières, économie, droit, gestion.

Profil idéal : tu aimes les chiffres, la rigueur, et comprendre comment l'argent circule dans une entreprise.

Débouchés : assistant comptable, gestionnaire de paie, BTS comptabilité et gestion, banque, expertise-comptable. Taux de réussite BAC1 2025 au Togo : 64,6 %.

Admission : BEPC avec un goût affirmé pour les maths, étude de dossier.$$
, 'g2, comptabilite, gestion, finance, banque, fiscalite, droit affaires, paie, chiffres, bts comptabilite', true, 70),

('g3', 'filieres', 'Série G3 — Techniques Commerciales',
$$La série G3 forme aux métiers de la vente et du marketing : négociation, relation client, mercatique, techniques d'exportation, gestion de la force de vente.

Matières dominantes : français, économie générale et organisationnelle, droit commercial, mercatique, mathématiques, informatique.

Profil idéal : tu aimes convaincre, le contact humain et l'action sur le terrain.

Débouchés : commercial et technico-commercial, assistant marketing, BTS action commerciale, entrepreneuriat. Taux de réussite BAC1 2025 au Togo : 62,8 %.

Admission : BEPC, étude de dossier.$$
, 'g3, commerce, commercial, marketing, vente, negociation, client, mercatique, entreprise, bts commercial', true, 80),

('cap-maconnerie', 'filieres', 'CAP Maçonnerie',
$$Le CAP Maçonnerie forme en atelier des ouvriers qualifiés du gros œuvre : élévation de murs, béton, finition, escaliers, lecture de plans, métré, sécurité.

Programme (cadre UEMOA/APC) : 22 modules sur environ 2160 heures — élévation de murs, béton, finition, escaliers, fosses septiques, pavés, caniveaux, implantation, terrassement, gestion de micro-entreprise et recherche d'emploi.

Profil idéal : tu veux un métier manuel concret et travailler vite, avec possibilité de créer ta propre équipe.

Débouchés : maçon qualifié, chef d'équipe BTP, insertion professionnelle immédiate, création d'entreprise.

Admission (indicatif — à confirmer au secrétariat) : après le CEPD, formation en 2 à 3 ans.$$
, 'cap, maconnerie, macon, btp, chantier, beton, metier manuel, professionnel, ouvrier, formation courte', true, 90),

('cap-electricite', 'filieres', 'CAP Électricité Bâtiment',
$$Le CAP Électricité forme aux installations électriques résidentielles : câblage, tableaux, mise en conformité, normes et sécurité.

Programme (cadre UEMOA/APC) : modules métier (câblage, tableaux, dépannage) + modules généraux (lecture de schémas, sécurité, gestion de micro-entreprise, recherche d'emploi).

Profil idéal : tu aimes les installations, le courant, le dépannage, et un métier toujours demandé.

Débouchés : électricien installateur, technicien de maintenance bâtiment, insertion professionnelle immédiate.

Admission (indicatif — à confirmer au secrétariat) : après le CEPD, formation en 2 à 3 ans.$$
, 'cap, electricite, electricien, cablage, installation, batiment, depannage, metier manuel, professionnel', true, 100),

-- ================= INFOS =================
('frais-scolarite', 'infos', 'Frais de scolarité (tarifs indicatifs)',
$$Voici les tarifs indicatifs 2025-2026 (à confirmer chaque rentrée au secrétariat) :

- Second cycle général (A4, D) : 75 000 F CFA / an (indicatif).
- Séries techniques et tertiaires (F2, F3, F4, G1, G2, G3) : 95 000 F CFA / an (indicatif, ateliers inclus).
- CAP (maçonnerie, électricité) : 60 000 F CFA / an (indicatif).

Frais de dossier à l'inscription : 5 000 F CFA (indicatif). Paiement possible en tranches — renseigne-toi au secrétariat pour l'échéancier.$$
, 'frais, prix, tarif, scolarite, combien, cout, paiement, argent, tranches, echeancier', true, 200),

('inscription-admission', 'infos', 'Inscription & admission : comment entrer à IPP La Paix',
$$Après le BEPC, trois voies :
1. Seconde générale : Seconde A (littéraire) ou Seconde scientifique, selon ton profil et tes notes.
2. Seconde technique (E, F, G) : BEPC + étude de dossier — notice d'inscription, demande manuscrite, acte de naissance légalisé, relevé BEPC légalisé, bulletins de 3e légalisés, attestation de scolarité, quittance de 1 000 F CFA (procédure officielle LETP/CRETFP).
3. Lycées scientifiques publics d'excellence (hors IPP) : concours national, moyenne BEPC ≥ 16/20, 17 ans max.
4. CAP : après le CEPD (indicatif — à confirmer).

À IPP La Paix : dépose ton dossier au secrétariat ou démarre ta pré-inscription en ligne. La rentrée a lieu en septembre/octobre selon le calendrier ministériel.$$
, 'inscription, admission, bepc, dossier, seconde, rentree, comment entrer, conditions, recrutement, concours', true, 210),

('pieces-dossier', 'infos', 'Pièces à fournir pour le dossier',
$$Pour ton dossier d'inscription, prépare (originaux + copies) :
- Acte de naissance (copie légalisée).
- Relevé de notes du BEPC (copie légalisée, sauf entrée en 6e/2nde sans BEPC selon le cas).
- Bulletins de la classe précédente (copies légalisées pour le technique).
- Attestation de scolarité de l'ancien établissement.
- 4 photos d'identité récentes.
- Quittance des frais de dossier.

Liste indicative — le secrétariat te confirme la liste exacte pour ton niveau.$$
, 'pieces, dossier, documents, acte naissance, bulletins, photos, fournir, papier, joindre', true, 220),

('calendrier-examens', 'infos', 'Examens officiels : BEPC, BAC1, BAC2',
$$- BEPC (fin 3e) : épreuves écrites en juin, résultats fin juin/début juillet.
- BAC1 — probatoire (fin Première) : écrits en mai, résultats mi-juin. Taux 2025 au Togo : 60,5 % en général, 60,1 % en technique.
- BAC2 — baccalauréat (fin Terminale) : écrits mi-juin. Par série (taux BAC1 2025) : G1 73 %, F2 69 %, G2 65 %, G3 63 %, F3 41 %, F4 24 %.
- CAP : épreuves pratiques anticipées (juin) puis écrits (juillet).

Les dates exactes de chaque session sont affichées au tableau et publiées dans les actualités du site.$$
, 'examen, bepc, bac, bac1, bac2, probatoire, cap, epreuves, dates, resultats, taux reussite, calendrier', true, 230),

('contact', 'infos', 'Nous contacter',
$$Institut Polytechnique Privé LA PAIX (adresse d'exemple — à confirmer) :
Rue 12, Quartier Bè, Lomé – Togo.
Téléphone (exemple — à confirmer) : +228 90 00 00 00.
Secrétariat : lundi–vendredi 7h30–17h30, samedi 8h–12h (horaires indicatifs).

Écris-nous aussi depuis la page Contact du site — nous répondons en général sous 48 h ouvrées.$$
, 'contact, adresse, telephone, ou etes vous, localisation, secretariat, horaires, appeler, venir, quartier', true, 240),

('comment-choisir', 'infos', 'Bien choisir sa série après le BEPC',
$$Trois questions pour t'orienter :
1. Quelles matières te réussissent ? Les maths et la physique ouvrent D, F et G2. Les lettres ouvrent A4. Le manuel ouvre F, G et les CAP.
2. Études longues ou métier rapide ? Université (médecine, droit) via A4/D ; BTS puis emploi via F/G ; travail immédiat via CAP.
3. Quel rythme ? Les séries F et CAP demandent beaucoup d'atelier et de pratique ; A4 et D demandent de la rédaction et de la rigueur.

Fais aussi notre quiz d'orientation (2 minutes, sans compte) sur la page Orientation — il te propose tes 2 meilleures filières.$$
, 'choisir, orientation, quelle serie, conseil, hesiter, quiz, test, aide choix, apres bepc', true, 250)

on conflict (slug) do update set
  category = excluded.category,
  title = excluded.title,
  content = excluded.content,
  keywords = excluded.keywords,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order,
  updated_at = now();
