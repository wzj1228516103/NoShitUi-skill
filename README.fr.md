# NoShitUi-skill

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · Français · [Deutsch](README.de.md) · [Português](README.pt.md)

<div align="center">
  <h3>Une UI sans usine à gaz — un Skill de découverte, de sélection et de mise en œuvre d'interfaces avec l'IA</h3>
  <p><sub>Less Shit UI, More Intentional Interfaces.</sub></p>
</div>

> Un Skill à charger selon les besoins pour les sites web, les interfaces produit et l'exploration de pistes de design : il aide l'IA à comprendre d'abord l'intention de l'interface, à choisir ensuite des ressources UI open source sur des critères explicites et à les intégrer avec des modifications minimales et vérifiables.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Codex Skill](https://img.shields.io/badge/Codex-Skill-2563EB.svg)](SKILL.md)
[![Catalog](https://img.shields.io/badge/catalog-open--source%20UI-0ea5e9.svg)](open-source-ui-resources/references/ui-libraries.md)

## Présentation du projet

NoShitUi-skill s'attaque à une source fréquente de reprises dans le travail UI : disposer de nombreuses bibliothèques de composants, de modèles, de sites d'inspiration et d'extraits de code sans critères de choix clairs. On finit alors par assembler plusieurs systèmes de design, avec une apparence incohérente, des interactions incomplètes et des licences mal identifiées.

Le Skill organise le travail en quatre phases :

1. **Découvrir les ressources** : distinguer les sites d'inspiration, le code source des composants, les bibliothèques UI complètes, les icônes, les graphiques et les modèles.
2. **Comparer les options** : filtrer selon le framework du projet, l'environnement d'exécution, les composants couverts, l'accessibilité, les possibilités de thème, la taille du bundle, les licences et l'état de maintenance.
3. **Mettre en œuvre** : choisir une stratégie principale de composants et réaliser une page ou un parcours utilisateur représentatif avec un minimum de modifications.
4. **Vérifier la livraison** : contrôler la mise en page responsive, le focus au clavier, les états interactifs, le résultat du build et les sources des ressources tierces.

Le fichier [`SKILL.md`](SKILL.md) à la racine est le point d'entrée directement installable ; [`open-source-ui-resources/`](open-source-ui-resources/) contient les règles détaillées, les catalogues de ressources et les scripts de maintenance.

## La théorie « No Shit UI »

Une UI devenue une usine à gaz ne résulte pas d'une seule décision de design. Elle se construit à force de « prenons quelque chose de tout fait », « ajoutons d'abord un composant » et « nous harmoniserons plus tard ».

Le principe tient en une phrase :

> **Comprendre l'intention de l'interface avant de choisir les ressources ; définir les règles visuelles avant de copier des composants.**

Trois règles :

- Vérifier séparément les sources de l'inspiration, du code, des polices, des images, des icônes et des éléments de marque. Ne pas confondre un site de présentation avec un dépôt de code open source.
- Privilégier une stratégie principale de composants par projet. Ajouter des primitives sans styles, des icônes ou des ressources d'animation uniquement pour combler une lacune précise.
- Accorder autant d'importance aux états interactifs et au comportement mobile qu'à l'apparence ; une capture statique ne suffit pas à valider l'interface.

## Capacités principales

| Capacité | Question adaptée | Livrables principaux |
| --- | --- | --- |
| Découverte de ressources | « Quels sites UI et bibliothèques open source puis-je consulter ? » | Catalogue classé, explication des usages, liens officiels et indications sur les conditions d'utilisation |
| Choix d'une solution UI | « Comment choisir entre MUI, shadcn/ui, Radix et Element Plus ? » | Comparaison de l'écosystème, du modèle de styles, de la couverture, des coûts et des licences |
| Recommandation pour un projet | « Recommande une solution adaptée à la stack actuelle. » | Une stratégie principale, une alternative et les raisons du choix |
| Mise en œuvre d'une page | « Intègre la solution de composants retenue au projet. » | Une page ou un parcours utilisateur minimal et représentatif, un thème et un relevé des sources |
| Vérification de la qualité | « Cette modification UI est-elle fiable ? » | Vérification sur ordinateur et mobile, du focus au clavier, des états et du build |

Ces capacités se déclenchent directement en langage naturel, sans mémoriser de commande slash. Vous pouvez aussi appeler explicitement `$noshit-ui-skill`.

## Exemples de résultats (aperçu rapide, à titre de démonstration)

### Page d’accueil en ligne

La page d’accueil associe un blanc froid et des tons argentés à des effets de lumière bleue, des fenêtres flottantes présentant de vrais projets et un effet de parallaxe au mouvement du pointeur.

- **20 exemples fonctionnels** : recherche par mots-clés, catégories et filtre 3D pour accéder à chaque démonstration.
- **Huit langues** : chinois simplifié, anglais, japonais, coréen, espagnol, français, allemand et portugais, avec des liens vers les guides README correspondants.
- **Ordinateur et mobile** : la mise en page et les aperçus s’adaptent à l’écran et respectent la préférence système de réduction des animations.

<p align="center">
  <a href="https://wzj1228516103.github.io/NoShitUi-skill/?lang=fr"><img src="docs/screenshots/concepts/showcase-desktop.png" alt="Page d’accueil argentée et bleue de NoShitUi-skill avec des aperçus flottants de projets, affichée en chinois" width="920"></a>
</p>

<details>
  <summary>Voir la page d’accueil sur mobile</summary>
  <p align="center">
    <img src="docs/screenshots/concepts/showcase-mobile.png" alt="Page d’accueil mobile argentée et bleue avec texte et aperçus flottants disposés à la verticale, affichée en chinois" width="320">
  </p>
</details>

### 20 exemples interactifs

Le carrousel présente les 20 projets réalisés, en commençant par les quatre expériences 3D : OBJECT, rooted., DRIFT et ORBITAL. Il montre ensuite les interfaces opérationnelles, le tableau de commandes shadcn, le catalogue UI ATLAS et tous les autres concepts de marque et de mouvement. La page d’accueil suit le même ordre, avec un filtre 3D, des catégories et une recherche. Le projet reste centré sur la découverte, le choix, l’intégration et la vérification des ressources. [Explorer la présentation complète en ligne](https://wzj1228516103.github.io/NoShitUi-skill/) · [Consulter le code des exemples](https://github.com/wzj1228516103/NoShitUi-skill/tree/showcase-source/ui-atlas-demo) · [Explorer le catalogue visuel des ressources](https://wzj1228516103.github.io/NoShitUi-skill/resources.html)

Consultez [3 études de choix reproductibles (en anglais)](docs/case-studies/README.md) : SHADCN/OPS, NODE et OBJECT relient contraintes, alternatives, sources et licences, implémentation et vérification. [Index des études de cas](https://wzj1228516103.github.io/NoShitUi-skill/case-studies.html).

L’atlas en ligne est une démonstration sélective ; consultez le [catalogue de bibliothèques du Skill](open-source-ui-resources/references/ui-libraries.md) pour la liste complète.

<p align="center">
  <img src="docs/screenshots/concepts/ui-atlas-showcase.gif" alt="Les 20 projets, avec les expériences 3D en premier" width="920">
</p>
<p align="center"><sub>OBJECT// · rooted. · DRIFT. · ORBITAL/ · TEMPO · FRAME · STAY · NODE · LOOP · SOURCE · ARCHIVE · PLATE · PRECISION_ · SHADCN/OPS · UI ATLAS · FORME · OFFGRID · NOVA//25 · AETHER · KINETIC_</sub></p>

## Méthode de travail

### 1. Identifier d'abord le type de tâche

- **Découverte** : si la demande porte uniquement sur des recommandations, fournir une sélection courte, classée, avec les liens officiels, sans modifier le projet.
- **Sélection** : examiner d'abord la stack, les versions, le routage, la solution de styles et les dépendances existantes du projet, puis proposer une solution principale et expliquer les compromis.
- **Implémentation** : installer ou copier des ressources seulement après une demande explicite de modification du code, puis réaliser un cas d'usage minimal et vérifiable.
- **Maintenance** : lors de la mise à jour du catalogue, vérifier les sources officielles, les licences et les références locales, puis exécuter le script de contrôle.

### 2. Choisir une stratégie principale

- **Système complet avec styles** : adapté aux outils d'administration, formulaires, tableaux et produits riches en opérations CRUD ; à privilégier pour couvrir rapidement de nombreux composants.
- **Primitives sans styles** : adaptées aux produits dotés d'une identité de marque précise et nécessitant le contrôle du DOM et du CSS ; vérifier en particulier la gestion du focus et le comportement au clavier.
- **Approche avec propriété du code source** : adaptée aux équipes souhaitant intégrer le code des composants dans leur projet et le maintenir elles-mêmes sur la durée ; conserver les sources des copies et les licences des dépendances.
- **Approche CSS/classes utilitaires** : adaptée aux équipes prêtes à prendre en charge la composition des composants, les interactions et l'accessibilité.

Par défaut, recommander une stratégie principale de composants, avec au plus une ressource complémentaire d'icônes ou de comportement pour un usage précis. Ne pas intégrer plusieurs systèmes de design complets simplement parce que les exemples de différents sites sont séduisants.

### 3. Documenter les raisons de l'adoption

Pour les ressources effectivement installées ou copiées, documenter au minimum :

| Critère | Points à vérifier |
| --- | --- |
| Compatibilité | Framework, versions, SSR/RSC, navigateurs et gestionnaire de paquets |
| Couverture | Besoins réels en tableaux, dates, téléversement, palettes de commandes, graphiques, navigation, etc. |
| Coût d'intégration | peer dependencies, Provider, styles globaux, taille du bundle et charge liée aux mises à niveau |
| Maîtrise du produit | Tokens de thème, contrôle du DOM, propriété du code source et méthodes de personnalisation |
| Exigences de qualité | Clavier, focus, sémantique, lecteurs d'écran, RTL, localisation et reduced motion |
| Licences | Autorisations distinctes pour les paquets directs, le code copié, les modèles, les polices, les images, les icônes et les exemples |
| Indices de maintenance | Versions compatibles, publications récentes, traitement des problèmes et avis de sécurité |

## Catalogue de ressources

Le catalogue détaillé se trouve dans [`open-source-ui-resources/references/`](open-source-ui-resources/references/) et comprend :

- **Systèmes React avec styles** : MUI, Ant Design, Mantine, Chakra UI, PrimeReact, Fluent UI.
- **Primitives React sans styles et approches avec code source** : shadcn/ui, Radix UI, React Aria, Headless UI, Base UI.
- **Systèmes de composants Vue** : Element Plus, Naive UI, Vuetify, Quasar, PrimeVue, Arco Design Vue, Reka UI.
- **Solutions Svelte et indépendantes du framework** : Skeleton, Bits UI, Melt UI, shadcn-svelte, Bootstrap, Bulma, Pico CSS, Tailwind CSS, daisyUI.
- **Icônes et visualisation** : Lucide, Heroicons, Tabler Icons, Phosphor, Apache ECharts, Recharts, Nivo.
- **Inspiration et références de modèles d'interface** : Mobbin, Page Flows, Godly, Awwwards, UIverse, HyperUI, Component Gallery, Component Party.
- **Mouvement et interfaces spécialisées** : Motion, assistant-ui, React Flow / Svelte Flow, TanStack Table.
- **Édition et interaction** : Tiptap, Lexical, dnd-kit, React Hook Form, TanStack Virtual, React DayPicker.
- **Sources visuelles avec restrictions supplémentaires** : React Bits, Animate UI ; consultez le LICENSE réel et ses conditions Commons Clause avant adoption.

Le [registre de vérification](open-source-ui-resources/references/library-verification.md) contient les versions datées, les contraintes de dépendances et les sources des licences. Ces relevés ne demandent pas de mettre à jour un projet existant.

Ce catalogue n'est pas un registre exhaustif. Les sites de présentation servent principalement à étudier la hiérarchie, les parcours, les espacements, les états et les adaptations responsive. Seuls les dépôts officiels, les paquets ou les pages identifiant explicitement leur code source peuvent servir de sources de code réutilisable. Il faut toujours vérifier séparément les conditions applicables au code, aux images, aux polices, aux icônes et aux éléments de marque de chaque ressource.

## Installation

Installer le dépôt comme Skill Codex :

```bash
npx skills add https://github.com/wzj1228516103/NoShitUi-skill -g -a codex -y
npx skills list -g -a codex
```

La présence de `noshit-ui-skill` dans la liste confirme l'installation. Rouvrez Codex, puis décrivez directement votre objectif d'interface.

## Exemples d'utilisation

```text
Compare MUI, Mantine et shadcn/ui pour cette interface d'administration React. Tiens compte du SSR, de l'accessibilité, de la taille du bundle et de la personnalisation du thème, puis implémente une page de tableau représentative.
```

```text
Je cherche uniquement de l'inspiration ; ne modifie pas le code. Recommande des sites UI à étudier pour une page d'accueil SaaS, un parcours d'onboarding mobile et une interface d'administration de données, en précisant lesquels servent seulement de références.
```

```text
Ce projet Vue 3 utilise déjà Element Plus. Examine d'abord les dépendances et le thème existants, puis recommande une solution complémentaire pour les icônes sans ajouter une seconde bibliothèque complète de composants.
```

```text
Vérifie si cette modification UI introduit des conflits de styles globaux, une perte du focus au clavier, un débordement horizontal sur mobile, des états loading/empty/error manquants ou des sources de ressources tierces mal identifiées. Pour l'instant, inspecte seulement ; ne modifie rien.
```

## Structure du dépôt

```text
.
├─ SKILL.md                              # Point d'entrée du Skill installable à la racine
├─ README.*.md                           # Présentation et guides en plusieurs langues
├─ agents/openai.yaml                    # Métadonnées de l'interface Codex
├─ .github/workflows/check-catalog.yml
├─ open-source-ui-resources/
│  ├─ SKILL.md                           # Règles de découverte et d'intégration
│  ├─ references/ui-libraries.md         # Bibliothèques UI classées par framework et usage
│  ├─ references/ui-websites.md          # Sites d'inspiration, de composants et de modèles UI
│  ├─ references/selection-and-adoption.md
│  ├─ references/library-verification.md
│  ├─ scripts/check_catalog.py           # Vérification des références locales et des liens
│  └─ scripts/test_check_catalog.py
```

## Vérification et maintenance

Le [guide d’évaluation du comportement](evals/README.md) décrit les scénarios fixes du Skill et leurs preuves. Le [guide de régression navigateur](tests/browser/README.md) explique les contrôles sur ordinateur, mobile et de récupération. Les tests navigateur et d’assemblage de la lampe précèdent le déploiement.

Après avoir modifié le catalogue de ressources, exécuter :

```bash
python open-source-ui-resources/scripts/check_catalog.py
python -m unittest discover -s open-source-ui-resources/scripts -p "test_*.py"
```

La CI exécute les tests de régression hors ligne et vérifie les deux entrées du Skill, le catalogue et les liens et images locaux des huit README. Vérifiez les liens externes manuellement selon les besoins.

Lorsque le réseau est disponible, vérifier aussi les liens externes :

```bash
python open-source-ui-resources/scripts/check_catalog.py --check-links
```

Les liens bloqués, soumis à une limitation de requêtes ou ayant expiré doivent être marqués comme « non vérifiés » ; ils ne doivent pas être considérés automatiquement comme invalides. Pour une intégration réelle, exécuter également les contrôles typecheck, lint et build du projet. Sur ordinateur et mobile, vérifier les débordements, les cibles tactiles, le focus, les fenêtres modales, les états loading, empty et error, ainsi que le comportement reduced-motion.

## Périmètre et limites

- Adapté à la recherche d'inspiration UI, au choix de composants, à la comparaison de directions de design, aux prototypes d'interface et aux petites intégrations.
- La présence d'une ressource dans le catalogue ne déclenche pas automatiquement son installation ou sa copie ; avant l'implémentation, confirmer les contraintes du projet et l'autorisation de l'utilisateur.
- Ne remplace pas un audit formel d'accessibilité, une revue des licences, une autorisation de marque, des tests de charge ou une approbation de mise en production.
- Ne considère pas « gratuit », « copiable », « MIT » et « open source » comme une seule et même promesse ; les licences doivent être vérifiées pour chaque paquet, fichier et ressource.
- Si la source officielle, la version ou les conditions ne peuvent pas être confirmées, conserver la ressource uniquement comme référence d'inspiration jusqu'à disposer des éléments nécessaires.

## Références et licences

- [Component Gallery](https://component.gallery/) : comparer les modèles de composants de différents systèmes de design.
- [Component Party](https://component-party.dev/) : comparer la façon d'écrire les composants dans React, Vue, Svelte et d'autres frameworks.
- [Radix UI](https://www.radix-ui.com/) et [React Aria](https://react-spectrum.adobe.com/react-aria/) : étudier les interactions sans styles et les comportements d'accessibilité.

Ce projet n'est pas un produit officiel des projets cités et ne bénéficie pas de leur soutien officiel. Le contenu original du Skill est sous [licence MIT](LICENSE) ; les projets tiers du catalogue, les ressources distantes et les composants copiés dans d'autres projets sont soumis à leurs propres licences ou aux conditions de leur site. Les informations sur les sources conservées dans ce dépôt figurent dans [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).

Les Issues et les suggestions d'amélioration sont les bienvenues.
