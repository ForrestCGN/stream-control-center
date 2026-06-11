# CURRENT_STATUS_LWG_4Q_11

Stand: 2026-06-11

Bestätigter Stand:

```text
STEP LWG-4Q.11 – Manual Winner Flow and Prize Quantity Cleanup
```

Bestätigt durch API-Test:

```powershell
powershell -ExecutionPolicy Bypass -File .\Test_LWG_4Q11_manual_winner_flow_ForrestCGN.ps1
```

Ergebnis:

```text
ModuleBuild: STEP_LWG_4Q_11
=== TEST OK: Alle aktivierten Szenarien erfolgreich ===
```

Kurzfassung:

```text
Normales Giveaway:
- Gewinner werden manuell nacheinander gezogen.
- Kein Auto-Ende nach Gewinneranzahl.
- Ende per Streamer-Button „Beenden“.
- Bereits gezogene Gewinner werden nicht erneut gezogen.
- Übrige Teilnehmer bleiben mit Tickets/Chancen im Topf.

Glücksrad-Giveaway:
- Gewinne werden im Bound-Wheel gepflegt.
- Jeder Gewinner dreht einmal.
- Gewinn/Feld wird verbraucht.
- Giveaway endet, wenn keine nutzbaren Gewinne mehr vorhanden sind.

Paid Tickets:
- Abbuchung, insufficient balance, refund/no-refund und double-refund guard bestätigt.

Archiv/Löschen:
- Archivieren nur finished.
- Löschen = hard-delete.
```

Nicht bestätigt:

```text
Dashboard-UI nach 4Q.11 ist noch nicht abschließend sauber manuell bestätigt.
UI-assisted Scripts ab 4Q.11 waren zu fehleranfällig und sollten nicht als vertrauenswürdige Bestätigung gelten.
```
