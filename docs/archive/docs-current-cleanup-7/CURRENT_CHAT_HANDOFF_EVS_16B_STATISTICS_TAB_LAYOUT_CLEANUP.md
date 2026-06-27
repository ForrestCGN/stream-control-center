# CURRENT CHAT HANDOFF – EVS-16b Statistik Tab Layout Cleanup

Stand: 2026-06-13

## Ziel
Der Statistik-Bereich war zu unübersichtlich, weil Ranking, Text-Report, Sound-Report und Userliste nur als lose Button-Reihe nebeneinander standen.

## Umsetzung
- Statistik-Tab in echte Untertabs aufgeteilt:
  - Übersicht
  - Ranking
  - Text-Spiel
  - Sound-Spiel
  - User
- Die alte Ladebutton-Reihe wurde entfernt.
- Jeder Untertab zeigt nur den passenden Bereich.
- Der Button „Aktuellen Bereich aktualisieren“ lädt nur den sichtbaren Statistikbereich nach.
- Kein Seitenreload.
- User-Auswahl bleibt im User-Bereich und öffnet weiterhin das scrollbare User-Detail-Popup mit AutoReload.

## Geänderte Dateien
- `htdocs/dashboard/modules/stream_events.js`
- `htdocs/dashboard/modules/stream_events.css`

## Nicht geändert
- Backend
- Datenbank
- Sound-Playback
- Twitch-Chat-Ausgabe
- EventBus-Struktur

## Test
```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
```

Dashboard:
- Event-System -> Statistik
- Untertabs wechseln: Übersicht / Ranking / Text-Spiel / Sound-Spiel / User
- „Aktuellen Bereich aktualisieren“ lädt nur den aktiven Bereich.
