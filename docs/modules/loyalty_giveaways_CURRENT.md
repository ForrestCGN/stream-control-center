# Module: loyalty_giveaways – Current LWG-4Q.11

Stand: 2026-06-11

## Zweck

Das Modul verwaltet Loyalty-Giveaways inklusive Classic-Giveaways, kostenpflichtigen Tickets, Chat-Claim und Glücksrad-/Wheel-Giveaways mit Giveaway-gebundenem Bound-Wheel.

## Aktuell bestätigter Stand

```text
STEP LWG-4Q.11 – Manual Winner Flow and Prize Quantity Cleanup
ModuleBuild: STEP_LWG_4Q_11
```

Bestätigt mit:

```powershell
powershell -ExecutionPolicy Bypass -File .\Test_LWG_4Q11_manual_winner_flow_ForrestCGN.ps1
```

Ergebnis:

```text
=== TEST OK: Alle aktivierten Szenarien erfolgreich ===
```

## Fachlogik: Classic Giveaway

Classic Giveaways folgen jetzt dem manuellen Streamer-Flow:

```text
open → entries → close entries → draw winner → optional draw another winner → manual finish
```

Regeln:

```text
- Kein automatisches Ende nach winnerCount.
- Der Streamer entscheidet live, ob ein weiterer Gewinner gezogen wird.
- Bereits gezogene Gewinner werden nicht erneut gezogen.
- Übrige Teilnehmer bleiben mit ihren Tickets/Chancen im Topf.
- Wenn keine gültigen Teilnehmer mehr übrig sind, wird ein weiterer Draw blockiert.
- Finish passiert manuell.
```

## Fachlogik: Wheel Giveaway

Wheel-Giveaways nutzen ein Giveaway-gebundenes Glücksrad.

```text
close entries → draw winner → wheel claim/spin → prize field consumed → next winner/spin → exhausted → finished
```

Regeln:

```text
- Gewinne/Felder werden im Bound-Wheel verwaltet.
- Ein Gewinner bekommt eine Wheel-Permission und dreht.
- Nach dem Spin wird der Gewinn/Feldbestand verbraucht.
- Wenn keine nutzbaren Felder/Gewinne mehr vorhanden sind, endet das Giveaway.
```

## Bound-Wheel Architektur

```text
Globale Presets sind Vorlagen.
Wheel-Giveaways bekommen ein eigenes Bound-Wheel.
Bound-Wheel-Felder gehören zum Giveaway und sind die Grundlage für die konkrete Preisvergabe.
```

Wichtige Tabellen/Routen aus früherem Stand bleiben relevant:

```text
loyalty_giveaway_bound_wheel_fields
GET  /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields
POST /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields
PUT  /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields/:fieldUid
POST /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields/:fieldUid/delete
```

## Paid Tickets

```text
- costAmount > 0 bucht Loyalty-Punkte beim Entry-Erstellen.
- Max Tickets wird geprüft.
- Insufficient Balance wird blockiert.
- Refund ist explicit-only: refundPaidTickets=true.
- Double refund ist idempotent verhindert.
- Transaktionen bleiben als Audit bestehen.
```

## Chat-Claim

```text
- Bei normalen Giveaways optional.
- Gewinner kann auf Chat-Claim warten.
- Nach Confirm bleibt Finish manuell.
- Bei Wheel-Giveaways ist die Drehung der Claim/Preisfluss; zusätzlicher normaler Chat-Claim soll in der UI nicht angeboten werden.
```

## Archivieren / Löschen

```text
Archivieren:
- nur status=finished.
- setzt Archiv-/deleted-Status.

Löschen:
- Hard-Delete.
- entfernt Giveaway und abhängige Giveaway-Daten.
- Loyalty-Transaktionen bleiben als Audit erhalten.
```

## Dashboard-Status

Nicht final bestätigt.

Geplante/gewünschte UI-Regeln:

```text
- Gewinneranzahl aus Formular raus.
- Gewinn-Menge aus Formular raus.
- Rundenmodus aus Formular raus.
- Ticket-Übernahme aus Formular raus.
- Chat-Claim Timeout und Claim-Modus nur anzeigen, wenn Chat-Claim Checkbox aktiv ist.
- Bei Wheel-Giveaways normale Gewinnfelder ausblenden; Gewinne über Glücksrad-Editor pflegen.
- Buttontext korrekt: „Glücksrad erstellen“ ohne Bound-Wheel, „Glücksrad bearbeiten“ mit Bound-Wheel.
```

## Offene Punkte

```text
- Dashboard-UI nach 4Q.11 sauber einzeln testen.
- Kein großer UI-Testlauf mit mehreren parallelen Test-Giveaways mehr.
- Nach erfolgreicher UI-Prüfung Doku erneut aktualisieren.
```
