# NEXT STEPS

Stand: EVS-7 / Text-Config Dashboard Prep  
Datum: 2026-06-13

## Sofort nach Entpacken

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-7 Text Config Dashboard Prep"
```

## Danach Dashboard prüfen

- Event-System im Dashboard öffnen.
- Text-Config / Multi-Texte Bereich prüfen.
- Bestehende Textvariante bearbeiten und speichern.
- Neue Variante hinzufügen.
- Variante aktiv/inaktiv setzen.
- Dashboard neu laden und prüfen, ob Varianten erhalten bleiben.

## Nächster sinnvoller Entwicklungsstep

EVS-8 sollte noch nicht direkt Vollruntime werden, sondern zuerst entweder:

1. allgemeine Event-Config im Dashboard vorbereiten, oder
2. Text-Spiel-Runtime planen/anfangen.

Empfehlung:

```text
EVS-8 – Event Config Dashboard Prep
```

Ziel:

- globale Event-Regeln dashboardfähig machen
- Default-Punkte, Cooldowns, Anzeige-/Hinweis-Modi vorbereiten
- Text-Config und Event-Config klar trennen
- später für Mods/Streamer einfach bedienbar halten

Danach:

```text
EVS-9 – Text Runtime / Chat Detection Prep
```
