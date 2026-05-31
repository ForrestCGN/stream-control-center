# Overlay-Monitoring – aktueller Stand nach STEP628D

Stand: 2026-05-31  
Projekt: `stream-control-center`  
Bereich: `Control → Overlays`

## Kurzstatus

Der Overlay-Monitor ist jetzt als nutzbares Kontroll- und Reparaturwerkzeug im Dashboard aufgebaut.

Aktuell vorhanden:

- OBS-Inventar mit rekursiver Szenen-/Quellenstruktur
- Erkennung von verschachtelten OBS-Szenen
- Klassifizierung von Browserquellen als CGN / extern / Platzhalter
- Bus-/Heartbeat-Zuordnung für eigene CGN-Overlays
- Monitoring-Issues mit Active/Resolved-Logik
- Quellenstatus und Overlay-Details
- manuelle Reparaturaktionen für OBS-Browserquellen
- kompakte Icon-Buttons mit Tooltips
- dynamischer Sichtbarkeitsbutton je nach Zustand

## Wichtige Regeln

- Externe Quellen wie SoundAlerts, StreamStickers und ViewerAttack erwarten keinen CGN-Bus.
- `about:blank` und leere Browserquellen gelten als Platzhalter und erzeugen keine Bus-Warnung.
- Eigene CGN-Overlays sollen einen Bus-Client und Heartbeats senden.
- Heartbeats werden nicht dauerhaft geloggt.
- Fehler werden einmalig als `active` geführt und bei Behebung als `resolved` markiert.
- Reparaturaktionen sind ausschließlich manuell.
- Es gibt keine automatische Reparatur und keine automatischen OBS-Änderungen.

## Aktueller UI-Stand

Tabs im Overlay-Bereich:

- Übersicht
- Quellenstatus
- Overlay-Details
- OBS-Inventar
- Probleme
- Bus-Clients
- OBS-Rohquellen
- Rohdaten

## Reparatur-Icons

Die Reparaturbuttons sind kompakt und tooltip-basiert:

| Icon | Aktion |
|---|---|
| ↻ | Browserquelle neu laden |
| 🧹 | Browsercache neu laden |
| 👁️ | Quelle einblenden, wenn ausgeblendet |
| 🙈 | Quelle ausblenden, wenn sichtbar |
| ⚡ | Quelle kurz aus/an |

Der Sichtbarkeitsbutton ist seit STEP628D dynamisch:

- sichtbare Quelle: `🙈 Ausblenden`
- ausgeblendete Quelle: `👁️ Einblenden`

## Aktuell bestätigte Funktion

- `Kurz aus/an` funktioniert für verschachtelte Quellen.
- Rahmen-Mapping funktioniert mit `overlay:frame_overlay`.
- OBS-Inventarstatus ist nach STEP626G plausibel.
- Rahmen-Overlay wurde auf gleichmäßigen Neon-Rand im Deathcounter-Stil gebracht.
