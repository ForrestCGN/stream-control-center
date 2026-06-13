# NEXT STEPS

Stand: EVS-7b / Dashboard Tabs Layout Split  
Datum: 2026-06-13

## Sofort nach Entpacken

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-7b Dashboard Tabs Layout Split"
```

## Danach Dashboard prüfen

- Event-System im Dashboard öffnen.
- Prüfen, ob Tabs sichtbar sind.
- Tab `Übersicht` prüfen.
- Tab `Event` prüfen.
- Tab `Sound-Spiel` prüfen.
- Tab `Text-Spiel` prüfen.
- Tab `Texte` prüfen.
- Prüfen, ob Textvarianten weiterhin bearbeitbar sind.

## Nächster sinnvoller Entwicklungsstep

Empfehlung:

```text
EVS-8 – Event Config Dashboard Prep
```

Ziel:

- allgemeine Event-Regeln dashboardfähig machen
- Default-Punkte, Cooldowns, Anzeige-/Hinweis-Modi vorbereiten
- Text-Config und Event-Config klar trennen
- später für Mods/Streamer einfach bedienbar halten

Danach:

```text
EVS-9 – Text Runtime / Chat Detection Prep
```
