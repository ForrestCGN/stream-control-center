# CURRENT CHAT HANDOFF – Loyalty Games / Wheel LWG-3

Stand: 2026-06-08

## Kurzstatus

```text
STEP LWG-3 – Loyalty Games Dashboard Read-only.
```

## Bestaetigt

```text
LWG-1 Backend laeuft im Live-System.
LWG-2 Overlay angebunden.
LWG-2.1 Repeat-Spin-Fix funktioniert.
```

## Neu in LWG-3

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
```

## Dashboard-Flow

```text
Community -> Loyalty Games
```

Anzeige:

```text
- Modulstatus
- Wheel-Status
- DB-/Schema-Diagnose
- aktive Session
- letztes Ergebnis
- Feldliste
- Session-History
- Routen/Hinweise
```

## Nicht geaendert

```text
Kein Backend.
Keine Config-Save-Route.
Keine Datenbankmigration.
Keine Punktkosten.
Keine Reward-Ausfuehrung.
Keine Aenderung an loyalty.js.
```

## Test nach StepDone

```powershell
.\stepdone.cmd "STEP LWG-3 Loyalty Games Dashboard Readonly"
```

```text
http://127.0.0.1:8080/dashboard
Community -> Loyalty Games
```

## Naechster Schritt

```text
STEP LWG-4 – Kosten/Reservierung/Refund planen
```
