# Current Chat Handoff – STEP233 / Project Audit nach STEP232

Stand: 2026-06-11
Projekt: ForrestCGN / stream-control-center

## Zweck

Dieser Handoff friert den aktuellen Stand nach den Loyalty-/Gamble-Arbeiten und der problematischen Dashboard-Shell-Integration ein. Er ist ein Audit-/Sicherheitsstand, kein Feature-Step.

## Wichtigste Entscheidung

Keine weitere Dashboard-Arbeit ohne vorherige Prüfung der echten Dashboard-Struktur.

## Stabil bestätigte Bereiche

### Commands / Loyalty

- `!punkte` / `!points` aktiv.
- `!givepoints` aktiv und auf Mod+ beschränkt.
- `!setpoint` aktiv und auf Streamer/Owner beschränkt.
- Chat-Ausgabe über `twitch_presence` bestätigt.

### Gamble

- `!gamble` live aktiv.
- Gamble-Engine live aktiv.
- `!gamble 10%` bestätigt.
- Strukturierte Gamble-Daten bestätigt.
- Command-Log enthält strukturierte Gamble-Daten.

### Dashboard APIs

- Readonly API bestätigt.
- Write API bestätigt.
- Audit API bestätigt.
- Viewer-Block mit HTTP 403 bestätigt.
- Streamer-Write + Restore bestätigt.

### Detailseite

- `/dashboard/loyalty-gamble.html` existiert.
- HTTP 200 bestätigt.
- `data-dashboard-route="loyalty-gamble"` bestätigt.

## Problematischer Bereich

STEP232 / Dashboard Shell Integration wurde zu früh auf Basis ungeprüfter Dashboard-Annahmen gebaut.

Status:

- technisch test-passend
- fachlich/prozessual auditpflichtig
- nicht weiter darauf aufbauen, bis echte Dashboard-Struktur geprüft ist

## Harte Stop-Regel für neuen Chat

Bei Fortsetzung zuerst lesen/pruefen:

1. `project-state/CURRENT_STATUS.md`
2. `project-state/NEXT_STEPS.md`
3. `docs/current/CURRENT_CHAT_HANDOFF_STEP233_PROJECT_AUDIT.md`
4. echte Dashboard-Dateien
5. GitHub/dev und Live-Vergleich

Kein neuer Code-Step ohne vorher:

- Ziel
- geprüfte Dateien
- betroffene Dateien
- Änderung
- Nicht geändert
- Tests
- Risiko
- Warten auf `go`

## Verboten für nächsten Schritt

- keine Apply-Scripte
- keine Patch-Scripte
- keine Regex-Fixes
- keine Shell-Annahmen
- keine Dashboard-Komfortintegration
- keine neue Featurearbeit

## Nächster sinnvoller Schritt

STEP234 / Dashboard Audit & Bereinigungsentscheidung

Nur prüfen, nicht bauen.
