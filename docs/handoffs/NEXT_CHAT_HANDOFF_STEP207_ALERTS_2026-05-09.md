# NEXT CHAT HANDOFF – STEP207 Alert-Regel TTS Dashboard Settings

Projekt: stream-control-center  
Branch: dev  
Stand: 2026-05-09

## Aktueller Stand

STEP206 hat Alert-TTS technisch aktiviert:

- Alert-Sound zuerst
- danach TTS
- Alert bleibt bis TTS-Ende sichtbar
- `raw.alertTts` wird in `alert_events` gespeichert

STEP207 räumt den Dashboard-Regel-Editor für TTS auf.

## Geänderte Dateien

- `htdocs/dashboard/modules/alerts.js`
- `htdocs/dashboard/modules/alerts.css`

## Wichtig

Keine Backend-/DB-Änderung in STEP207.  
Keine Funktionalität entfernen.  
Regeln bleiben unverändert.

## Nach dem Entpacken

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "fix: improve alert rule tts settings ui"
```

## Nachtest

- Alert-Dashboard öffnen
- Regel bearbeiten
- TTS-Ausgabe Aus/An prüfen
- Bits/Donation/Resub-Typen prüfen
- Backend-Neustart ist für diesen UI-Step normalerweise nicht nötig; Browser hart neu laden reicht.

