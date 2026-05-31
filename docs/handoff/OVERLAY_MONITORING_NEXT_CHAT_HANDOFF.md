# Übergabe für neuen Chat – Overlay-Monitoring / OBS-Inventar / Reparaturbuttons

## Projektkontext

Projekt: `stream-control-center`  
Repo: `ForrestCGN/stream-control-center`  
Branch: `dev`  
Lokales Repo: `D:\Git\stream-control-center`  
Live-Ziel: `D:\Streaming\stramAssets`

## Aktueller Arbeitsstand

Wir haben den Overlay-Monitor im Dashboard stark erweitert.

Wichtige Steps:

- STEP625B: Monitoring-Issues active/resolved
- STEP626A: Overlay-Details-Tab
- STEP626E: OBS-Inventar als Baumstruktur
- STEP626G: Inventar-Warnstatus final korrigiert
- STEP627C: Rahmen gleichmäßiger Neon-Rand
- STEP628B: Reparaturaktionen für verschachtelte OBS-Quellen
- STEP628C: Icon-Reparaturbuttons mit Tooltips
- STEP628D: dynamischer Sichtbarkeitsbutton

## Aktuelle Funktionen

Dashboard `Control → Overlays` zeigt:

- Quellenstatus
- Overlay-Details
- OBS-Inventar
- Probleme
- Bus-Clients
- OBS-Rohquellen
- Rohdaten

OBS-Inventar:

- rekursive OBS-Struktur
- aktuelle Szene / inaktive Szenen
- CGN / extern / Platzhalter
- Bus- und Heartbeat-Zuordnung
- manuelles Aktualisieren

Reparaturicons:

- `↻` Browserquelle neu laden
- `🧹` Browsercache neu laden
- `👁️` Quelle einblenden, wenn aus
- `🙈` Quelle ausblenden, wenn an
- `⚡` Quelle kurz aus/an

## Wichtige technische Regeln

- Externe Quellen erwarten keinen CGN-Bus.
- Platzhalter/about:blank erwarten keinen CGN-Bus.
- CGN-Overlays sollen Heartbeats senden.
- Heartbeats werden nicht dauerhaft geloggt.
- Monitoring-Probleme werden als Issues active/resolved geführt.
- Reparaturaktionen sind nur manuell.

## Nächster möglicher Arbeitsblock

Entweder:

1. Reparaturaktionen weiter testen und ggf. Audit-Logging ergänzen.
2. Fehlende echte CGN-Overlays aus dem OBS-Inventar nachziehen.
3. Weitere Overlay-Designs auf Neon-Galaxy-v2 bringen.
4. Dashboard-UI später neu strukturieren.

## Testbefehle

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\overlay_monitor.js
node --check htdocs\dashboard\modules\overlays.js
.\stepdone.cmd "PASSENDE COMMIT MESSAGE"
```

Backend neu starten, wenn `backend/modules/overlay_monitor.js` geändert wurde.
