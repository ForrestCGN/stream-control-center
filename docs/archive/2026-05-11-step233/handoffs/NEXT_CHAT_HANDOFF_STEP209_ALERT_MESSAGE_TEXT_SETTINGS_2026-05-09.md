# NEXT CHAT HANDOFF – STEP209 Alert Message Text Settings

Stand: 2026-05-09

## Projekt

Repository:

- `https://github.com/ForrestCGN/stream-control-center`
- Branch: `dev`

Lokale Pfade:

- Repo: `D:\Git\stream-control-center`
- Live-System: `D:\Streaming\stramAssets`

## Aktueller Stand

STEP209 ist funktional abgeschlossen.

Das Alert-Overlay unterstützt jetzt einstellbare Nachrichtentexte im Display-Profil.

Neue Settings:

- `messageEnabled`
- `messageScale`
- `messageWidthMode`
- `messageMaxLines`
- `messageWeight`

Betroffene Dateien:

- `htdocs/dashboard/modules/alerts.js`
- `htdocs/dashboard/modules/alerts.css`
- `htdocs/overlays/_overlay-alerts-v2.html`

## Ergebnis

Bestätigt:

- Dashboard-Felder erreichbar
- Nachrichtengröße reagiert
- Live-Vorschau reagiert
- Overlay übernimmt Einstellungen
- keine Funktionalität entfernt
- keine Backend-/DB-/TTS-/Sound-/Queue-Änderung

## Wichtig

Nicht weiter an STEP209 herumbasteln, außer es gibt neue konkrete Bugs.

Das allgemeine Design des Dashboard-Bereichs ist noch uneinheitlich. Das soll später als separater UI-Cleanup gemacht werden.

## Offene spätere Aufgabe

Neuer Step-Vorschlag:

`STEP210 – Alert Dashboard Design Cleanup`

Ziel:

- einheitliche Kacheln
- einheitliche Farben
- keine zufälligen Sonderstile
- bessere Abstände
- einheitliche Label- und Hilfetexte
- Design-/Live-Vorschau-Bereich optisch aufräumen
- keine Alert-Logik ändern

## Arbeitsregel

Keine Funktionalität entfernen. Bestehende Settings, Routen, Alerts, TTS, Sound-System und Queue nicht anfassen, wenn nur UI-Design geändert wird.
