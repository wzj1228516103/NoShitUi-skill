# NoShitUi-skill

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · Deutsch · [Português](README.pt.md)

> Ein Skill zum Finden, Vergleichen und Integrieren von Open-Source-Ressourcen für Benutzeroberflächen sowie zur Prüfung des Ergebnisses.

NoShitUi-skill hilft einem KI-Agenten, Weboberflächen anhand der Anforderungen des Projekts umzusetzen. Er unterscheidet visuelle Inspiration von wiederverwendbarem Code, empfiehlt eine einheitliche Komponentenstrategie und dokumentiert Quellen und Lizenzbedingungen.

**Erst die Absicht der Oberfläche klären, dann Ressourcen auswählen; erst visuelle Regeln festlegen, dann Komponenten kopieren.**

## Ablauf

1. **Finden**: UI-Bibliotheken, Komponenten, Vorlagen, Icons, Diagramme und Inspirationsseiten einordnen.
2. **Vergleichen**: Framework, Laufzeitumgebung, benötigte Komponenten, Barrierefreiheit, Themes, Bundle-Größe, Lizenzen und Wartungszustand berücksichtigen.
3. **Integrieren**: Eine Hauptstrategie wählen und eine repräsentative Seite oder einen Nutzerablauf mit kleinen, überprüfbaren Änderungen umsetzen.
4. **Prüfen**: Darstellung auf Desktop und Mobilgeräten, Tastaturbedienung, Fokus, Interaktionszustände, Build und Quellen kontrollieren.

Der Skill unterstützt Recherche, Auswahl, Umsetzung und Pflege. Für eine reine Empfehlung liefert er eine erläuterte Auswahl; vor einer Integration untersucht er das vorhandene Projekt.

## Installation

```bash
npx skills add https://github.com/wzj1228516103/NoShitUi-skill -g -a codex -y
npx skills list -g -a codex
```

Prüfe, ob `noshit-ui-skill` in der Liste erscheint, und öffne Codex erneut. Beschreibe dein Ziel in natürlicher Sprache oder rufe den Skill ausdrücklich mit `$noshit-ui-skill` auf.

## Beispiele

```text
Vergleiche MUI, Mantine und shadcn/ui für diese React-Verwaltungsoberfläche. Berücksichtige SSR, Barrierefreiheit, Bundle-Größe und Theme-Anpassung und implementiere anschließend eine repräsentative Tabellenseite.
```

```text
Dieses Vue-3-Projekt verwendet bereits Element Plus. Prüfe zuerst die vorhandenen Abhängigkeiten und das Theme und empfehle dann eine ergänzende Icon-Bibliothek, ohne ein zweites vollständiges Komponentensystem einzuführen.
```

## Ressourcen

- [SKILL.md](SKILL.md): Einstiegspunkt des Skills.
- [UI-Bibliotheken](open-source-ui-resources/references/ui-libraries.md): Katalog nach Framework und Einsatzzweck.
- [UI-Websites](open-source-ui-resources/references/ui-websites.md): Inspiration, Komponenten und Interaktionsmuster.
- [Auswahl und Integration](open-source-ui-resources/references/selection-and-adoption.md): Vergleichskriterien und Integrationsregeln.

Eine Inspirationsseite ist nicht automatisch eine Quelle für Open-Source-Code. Prüfe die Bedingungen für Code, Schriften, Bilder, Icons und Marken jeweils separat. Verwende eine Hauptstrategie für Komponenten und ergänze Ressourcen nur für konkrete Lücken.

## Prüfung und Lizenz

Nach Änderungen am Katalog:

```bash
python open-source-ui-resources/scripts/check_catalog.py
```

Mit `--check-links` lassen sich externe Links bei verfügbarer Netzwerkverbindung prüfen. Blockierte, gedrosselte oder zeitlich abgebrochene Anfragen bleiben ungeprüft und belegen keinen ungültigen Link. Führe bei einer Integration auch die Prüfungen des Projekts aus und kontrolliere Lade-, Leer- und Fehlerzustände sowie die Reduzierung von Animationen.

Die ursprünglichen Skill-Inhalte stehen unter der [MIT-Lizenz](LICENSE). Ressourcen Dritter unterliegen ihren eigenen Lizenzen und Nutzungsbedingungen; siehe [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). Der Skill ersetzt keine formelle Prüfung von Barrierefreiheit, Lizenzen oder Leistung.

## Ergebnisvorschau

Die [Online-Beispiele](https://wzj1228516103.github.io/NoShitUi-skill/) zeigen mögliche Ergebnisse. Im Mittelpunkt des Projekts steht der Skill; der [Quellcode der Beispiele](https://github.com/wzj1228516103/NoShitUi-skill/tree/showcase-source/ui-atlas-demo) liegt im Branch `showcase-source`.

[Animierte Vorschau im Haupt-README ansehen](README.md#产出示例快速浏览仅作展示).
