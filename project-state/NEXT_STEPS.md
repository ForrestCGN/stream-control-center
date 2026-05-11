# NEXT STEPS - stream-control-center

Stand: 2026-05-11

## Priorität A - Nächster Entwicklungsblock

### 1. Hug/Rehug prüfen und ggf. ins aktuelle Systemmuster bringen

Vor Änderung prüfen:

```text
backend/modules/hug.js
htdocs/dashboard/modules/hug.js
config/hug_system.json
module_text_variants / module-bezogene Hug-Texte
bestehende Routen /api/hug/*
bestehende Dashboard-Routen /api/dashboard/community/hug/*
```

Ziele:

```text
- keine bestehende Hug/Rehug-Funktion brechen
- vorhandene DB-Struktur nicht ersetzen
- Texte variantenfähig/dashboardfähig halten
- Settings/Config sauber kapseln
- Dashboard nur über Backend-APIs
```

## Priorität B - UI/Modul-Konsistenz

Aus STEP234 prüfen:

```text
soundalerts: Section + JS/CSS vorhanden, aber nicht direkt in window.CGN.modules registriert
tts: Section + JS/CSS vorhanden, aber nicht direkt in window.CGN.modules registriert
loyalty: Section + JS/CSS vorhanden, aber nicht direkt in window.CGN.modules registriert
sound_system: Modul-ID nutzt sound.js/sound.css
```

Entscheiden, ob das Absicht ist oder vereinheitlicht werden soll.

## Priorität C - Tools/Testskripte sortieren

Viele alte STEP-Testskripte liegen noch unter `tools/`.

Späterer separater STEP:

```text
- aktive Deploy-/Easy-Skripte behalten
- alte STEP201/STEP202-Testskripte archivieren
- nichts löschen ohne vorheriges Manifest
```

## Priorität D - Optionale Automatisierung

Später sinnvoll:

```text
tools/generate_project_maps.js
```

Ziel:

```text
- Route-Map automatisch aus Backend-Dateien erzeugen
- Dashboard-Map automatisch aus index/app.js erzeugen
- Config-/DB-Map teilweise automatisch erzeugen
```

## Aktuell nicht anfassen

```text
app.sqlite
Secrets / .env
produktive Alert-/Loyalty-/Discord-/Twitch-Logik
historische Analyse-Snapshots
```
