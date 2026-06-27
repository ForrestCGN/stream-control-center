# CURRENT_CHAT_HANDOFF_LWG_4Q_11

Stand: 2026-06-11

## Kontext

Es wurde am Loyalty-Giveaway-/CGN-Glücksrad-System gearbeitet. Im Verlauf wurden mehrere Steps von 4Q.1 bis 4Q.11 erstellt. Der letzte fachlich bestätigte API-Stand ist LWG-4Q.11.

Die Zusammenarbeit im letzten Teil wurde gestoppt, weil die UI-assisted Tests zu fehleranfällig und zu umständlich waren. Für die Fortsetzung ist wichtig, nicht auf diesen UI-Testansatz aufzubauen.

## Aktueller bestätigter Stand

```text
STEP LWG-4Q.11 – Manual Winner Flow and Prize Quantity Cleanup
ModuleBuild: STEP_LWG_4Q_11
```

Bestätigtes Artefakt:

```text
STEP_LWG-4Q.11_manual_winner_flow_prize_quantity_cleanup.zip
```

Bestätigter API-Test:

```text
Test_LWG_4Q11_manual_winner_flow_ForrestCGN.ps1
=== TEST OK: Alle aktivierten Szenarien erfolgreich ===
```

## Wichtige fachliche Regeln

### Normales Giveaway

```text
- Der Streamer bestimmt live, wie viele Gewinner gezogen werden.
- Es gibt keinen Formularwert „Gewinneranzahl“ als Auto-Ende.
- Es gibt keine sichtbare „Gewinn-Menge“ im normalen Formular.
- Weitere Gewinner werden aus denselben bisherigen Teilnehmern gezogen.
- Bereits gezogene Gewinner werden nicht erneut gezogen.
- Tickets der übrigen Teilnehmer bleiben erhalten.
- Beenden erfolgt manuell durch den Streamer.
```

### Glücksrad-Giveaway

```text
- Gewinne/Felder liegen im Giveaway-gebundenen Glücksrad.
- Ein gezogener Gewinner dreht einmal.
- Der gedrehte Gewinn wird verbraucht.
- Wenn keine nutzbaren Gewinne mehr übrig sind, endet das Giveaway automatisch.
```

### Archivieren / Löschen

```text
- Archivieren nur bei status=finished.
- Löschen ist immer Hard-Delete.
- Loyalty-Transaktionen bleiben Audit.
```

### Paid Tickets

```text
- Ticket-Kauf bucht Punkte ab.
- Rückerstattung nur explizit mit refundPaidTickets=true.
- Double refund ist blockiert.
```

## Offener / nicht bestätigter Teil

Dashboard-UI ist nach 4Q.11 nicht final bestätigt.

Bekannte noch zu prüfende UI-Punkte:

```text
- Gewinneranzahl nicht mehr sichtbar.
- Gewinn-Menge nicht mehr sichtbar.
- Rundenmodus nicht mehr sichtbar.
- Ticket-Übernahme nicht mehr sichtbar.
- Chat-Claim-Zusatzfelder nur sichtbar, wenn Checkbox aktiv ist.
- Wheel-Giveaway-Gewinne nur über Glücksrad-/Bound-Wheel-Editor pflegen.
- Buttontext: ohne Bound-Wheel „Glücksrad erstellen“, mit Bound-Wheel „Glücksrad bearbeiten“.
- Loyalty → Kachel Giveaways und oberer Tab Giveaways öffnen beide das neue Giveaway-Control.
```

## Was nicht wiederholt werden sollte

```text
- Keine großen UI-assisted Scripts mit mehreren gleichzeitig erzeugten Test-Giveaways.
- Keine ungetesteten PowerShell-Scripts mit JavaScript-Syntax.
- Keine Vermutungen über Backend-Statuswechsel ohne API-Test.
```

## Empfohlene Fortsetzung

```text
1. Aktuelle Dateien aus Repo/Live prüfen.
2. Nur einen einzelnen UI-Punkt testen.
3. Ein einziges Test-Giveaway erzeugen.
4. Sichtprüfung durchführen.
5. Giveaway hard-delete löschen.
6. Erst danach nächster UI-Punkt.
```

## Relevante Dateien

```text
backend/modules/loyalty_giveaways.js
backend/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_giveaways.css
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
htdocs/dashboard/index.html
```
