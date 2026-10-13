# NoShitUi-skill

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · Français · [Deutsch](README.de.md) · [Português](README.pt.md)

> Un Skill pour découvrir, comparer et intégrer des ressources UI open source, puis vérifier le résultat.

NoShitUi-skill aide un agent IA à concevoir des interfaces web en partant des besoins du projet. Il distingue les références visuelles du code réutilisable, recommande une stratégie de composants cohérente et conserve les informations sur les sources et les licences.

**Comprendre l'intention de l'interface avant de choisir les ressources ; définir les règles visuelles avant de copier des composants.**

## Fonctionnement

1. **Découvrir** : classer les bibliothèques UI, composants, modèles, icônes, graphiques et sites d'inspiration.
2. **Comparer** : examiner le framework, l'environnement d'exécution, les composants nécessaires, l'accessibilité, les thèmes, la taille du bundle, les licences et la maintenance.
3. **Intégrer** : choisir une stratégie principale et réaliser une page ou un parcours représentatif avec des modifications limitées et vérifiables.
4. **Vérifier** : contrôler l'affichage sur ordinateur et mobile, le clavier, le focus, les états interactifs, la compilation et les sources des ressources.

Le Skill s'adapte aux tâches de découverte, de sélection, d'implémentation et de maintenance. Une demande de recommandations produit une liste commentée ; une demande d'intégration commence par l'examen du projet existant.

## Installation

```bash
npx skills add https://github.com/wzj1228516103/NoShitUi-skill -g -a codex -y
npx skills list -g -a codex
```

Vérifiez que `noshit-ui-skill` apparaît dans la liste, puis rouvrez Codex. Décrivez votre objectif en langage naturel ou mentionnez explicitement `$noshit-ui-skill`.

## Exemples d'utilisation

```text
Compare MUI, Mantine et shadcn/ui pour cette interface d'administration React. Tiens compte du SSR, de l'accessibilité, de la taille du bundle et de la personnalisation du thème, puis implémente une page de tableau représentative.
```

```text
Ce projet Vue 3 utilise déjà Element Plus. Examine les dépendances et le thème existants, puis recommande une bibliothèque d'icônes complémentaire sans ajouter un second système complet de composants.
```

## Ressources

- [SKILL.md](SKILL.md) : point d'entrée du Skill.
- [Bibliothèques UI](open-source-ui-resources/references/ui-libraries.md) : catalogue organisé par framework et usage.
- [Sites UI](open-source-ui-resources/references/ui-websites.md) : inspiration, composants et modèles d'interaction.
- [Sélection et adoption](open-source-ui-resources/references/selection-and-adoption.md) : critères de comparaison et règles d'intégration.

Un site d'inspiration n'est pas automatiquement une source de code open source. Vérifiez séparément les conditions applicables au code, aux polices, aux images, aux icônes et aux marques. Utilisez une stratégie principale de composants et n'ajoutez des ressources complémentaires que pour répondre à un besoin précis.

## Vérification et licence

Après une modification du catalogue :

```bash
python open-source-ui-resources/scripts/check_catalog.py
```

Ajoutez `--check-links` pour vérifier les liens externes lorsque le réseau est disponible. Un lien bloqué, limité ou en timeout reste non vérifié ; cela ne prouve pas qu'il est invalide. Pour une intégration réelle, exécutez aussi les contrôles du projet et vérifiez les états de chargement, vides et d'erreur, ainsi que la réduction des animations.

Le contenu original du Skill est sous [licence MIT](LICENSE). Les ressources tierces restent soumises à leurs propres licences et conditions. Consultez [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). Le Skill ne remplace pas un audit formel d'accessibilité, de licences ou de performances.

## Aperçu des résultats

Les [exemples en ligne](https://wzj1228516103.github.io/NoShitUi-skill/) illustrent les résultats possibles. Le projet reste centré sur le Skill ; les [sources des exemples](https://github.com/wzj1228516103/NoShitUi-skill/tree/showcase-source/ui-atlas-demo) sont conservées dans la branche `showcase-source`.

[Voir l'aperçu animé dans le README principal](README.md#产出示例快速浏览仅作展示).
