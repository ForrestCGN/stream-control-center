# Loyalty Giveaways Modul

Stand: 2026-06-08  
Version: 0.1.0  
STEP: LWG-4D

## Zweck

`loyalty_giveaways` ist das Backend-Grundsystem fuer Verlosungen im Loyalty-Hauptbereich.

## Dateien

```text
backend/modules/loyalty_giveaways.js
```

## Status

Aktuell Backend-Grundsystem:

```text
- create/list/get/update/copy/delete
- open/close-entries/finish/cancel
- Rounds-Grundlage
- Prize-Grundlage
- Event-/Audit-Grundlage
```

Noch nicht:

```text
- Tickets
- Gewinnerziehung
- Rad-Berechtigung
- Dashboard
- Punktebuchung
```

## Datenbank

```text
loyalty_giveaways
loyalty_giveaway_rounds
loyalty_giveaway_prizes
loyalty_giveaway_events
```

## EventBus

Geplante/gesendete Events:

```text
loyalty.giveaway.created
loyalty.giveaway.copied
loyalty.giveaway.opened
loyalty.giveaway.entries_closed
loyalty.giveaway.finished
loyalty.giveaway.cancelled
loyalty.giveaway.deleted
```

Wenn `ctx.eventBus` vorhanden ist, wird er genutzt. Zusätzlich wird per `broadcastWS` gemeldet.

## Lebenszyklus

```text
draft
open
closed_for_entries
drawing
waiting_for_wheel
waiting_next_round
prizes_exhausted
finished
cancelled
deleted
```

In LWG-4D werden nur die sicheren Grundstatus aktiv genutzt.

## Fairness-Regel

LWG-4D zieht noch keine Gewinner. Die spaetere Gewinnerziehung muss backendseitig per `crypto.randomInt` erfolgen und darf keine API zum Setzen von Gewinnern bieten.
