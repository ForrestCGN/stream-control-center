# Shoutout-System – Text Backend Foundation

Stand: CAN-44.18 / 2026-06-04

## Ziel

Gemeinsame Backend-Basis für alle Shoutout-Texte:

```text
Chat-Shoutout
AutoShoutout
Offizieller Twitch-Shoutout
Dashboard/Systemtexte
```

## Standard

Alle neuen Shoutout-Texte sollen langfristig über den bestehenden `helper_texts` und `module_text_variants` laufen.

Wichtig:

```text
- keine neue Parallel-Textstruktur
- keine hart codierten neuen Textsysteme
- Config-Texte bleiben Fallback
- bestehende Datenbank wird nur sanft erweitert/genutzt
```

## Routen

```text
GET  /api/clip-shoutout/texts
POST /api/clip-shoutout/texts
GET  /api/clip-shoutout/texts/migration
```

## Textkey-Zielstruktur

```text
shoutout.chat.*
shoutout.auto.*
shoutout.official.*
shoutout.dashboard.*
shoutout.system.*
```

## Dashboard-Folge

Der spätere gemeinsame Tab `Texte` soll diese Backend-Routen nutzen und die alten verteilten Textfelder zusammenführen.

## Runtime-Folge

Die Runtime-Nutzung der neuen Keys wird bewusst später umgestellt. Dieser Step ist nur Backend-Fundament und Migrationssicht.
