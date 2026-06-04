# Shoutout Text Dashboard Tab

Stand: CAN-44.19

## Zweck

Der gemeinsame Texte-Tab macht die neuen Shoutout-Textkeys aus CAN-44.18 im Dashboard bearbeitbar.

## Abhängigkeiten

Backend-Routen:

```text
GET  /api/clip-shoutout/texts
POST /api/clip-shoutout/texts
GET  /api/clip-shoutout/texts/migration
```

Backend-Tabellen:

```text
module_text_variants
module_texts
```

Helper:

```text
helper_texts
core/database
helper_config
helper_core
```

## Dashboard-Dateien

```text
htdocs/dashboard/modules/shoutout_texts.js
htdocs/dashboard/modules/shoutout_texts.css
```

`index.html` lädt beide Dateien.

## Bedienkonzept

Der Texte-Tab wird in das bestehende Shoutout-System injiziert, ohne das Haupt-Dashboard vollständig umzubauen.

Kategorien:

```text
shoutout.chat
shoutout.auto
shoutout.official
shoutout.dashboard
shoutout.system
```

## Grenzen dieses Steps

- Kein vollständiger Dashboard-Umbau.
- Keine Runtime-Umstellung.
- Keine automatische Migration alter Config-Texte.
- Legacy-Key `auto.greeting` bleibt sichtbar, solange er in der DB existiert.

## Weiterer Umbau

Später soll das Shoutout-Dashboard neu strukturiert werden:

```text
Übersicht
Chat-Shoutout
AutoShoutout
Queues
Texte
Verlauf
Statistik
Eingehend
Diagnose
Einstellungen
```
