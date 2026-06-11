# CURRENT_STATUS – stream-control-center

Stand: 2026-06-11

## Aktueller bestätigter Hauptstand

```text
STEP LWG-4Q.11 – Manual Winner Flow and Prize Quantity Cleanup
```

Der aktuell bestätigte technische Stand betrifft das Modul **Loyalty / Giveaways / CGN-Glücksrad**.

Der Backend-/API-Stand ist bestätigt durch:

```powershell
powershell -ExecutionPolicy Bypass -File .\Test_LWG_4Q11_manual_winner_flow_ForrestCGN.ps1
```

Ergebnis:

```text
ModuleBuild: STEP_LWG_4Q_11
=== TEST OK: Alle aktivierten Szenarien erfolgreich ===
```

## Bestätigte Fachlogik LWG-4Q.11

### Normales Giveaway

```text
Teilnehmer sammeln
Teilnahme schließen
Gewinner auslosen
optional weiteren Gewinner auslosen
optional weiteren Gewinner auslosen
Streamer beendet manuell
```

Bestätigte Regeln:

```text
- Normale Giveaways enden nicht automatisch nach einer Gewinneranzahl.
- Es gibt keine sichtbare Gewinneranzahl mehr als Flow-Steuerung.
- Es gibt keine sichtbare Gewinn-Menge mehr im normalen Formular.
- Weitere Gewinner werden aus den bisherigen Teilnehmern gezogen.
- Bereits gezogene Gewinner werden nicht erneut gezogen.
- Tickets/Chancen der übrigen Teilnehmer bleiben erhalten.
- Wenn keine gültigen Teilnehmer mehr vorhanden sind, ist kein weiterer Draw möglich.
- Finaler Abschluss passiert per Streamer-Aktion „Beenden“.
```

### Glücksrad-Giveaway

```text
Teilnehmer sammeln
Teilnahme schließen
Gewinner auslosen
Gewinner dreht das Giveaway-gebundene Glücksrad
Gewinn/Feld wird verbraucht
nächsten Gewinner ziehen
wenn keine nutzbaren Gewinne/Felder mehr vorhanden sind → Giveaway beendet
```

Bestätigte Regeln:

```text
- Gewinne/Felder werden im Bound-Wheel / Glücksrad-Editor gepflegt.
- Die Drehung dient als Claim/Preisvergabe.
- Das Giveaway endet automatisch, wenn keine nutzbaren Glücksrad-Gewinne mehr vorhanden sind.
```

### Paid Tickets / Loyalty-Punkte

Bestätigt:

```text
- Kostenpflichtige Tickets buchen Loyalty-Punkte beim Ticket-Kauf ab.
- Insufficient Balance wird blockiert.
- Cancel ohne refundPaidTickets=true erstattet nicht.
- Cancel mit refundPaidTickets=true erstattet idempotent.
- Double-Refund ist verhindert.
- Loyalty-Transaktionen bleiben als Audit erhalten.
```

### Archivieren / Löschen

Bestätigt:

```text
- Archivieren ist nur bei status=finished erlaubt.
- Löschen bedeutet echtes Hard-Delete.
- Hard-Delete entfernt das Giveaway wirklich aus der API-Liste.
- Die Hard-Delete-Transaction wurde in LWG-4Q.9a repariert.
```

## Aktuell nicht sauber bestätigt

Die Dashboard-UI nach 4Q.11 ist noch nicht vollständig bestätigt.

Bekannt:

```text
- Backend/API ist grün.
- UI-Hilfsscripts nach 4Q.11 waren zu fehleranfällig und wurden abgebrochen.
- Künftige UI-Tests sollten nur noch einzeln und minimal laufen: ein Giveaway, ein Prüfpunkt, danach löschen.
```

## Letzte wichtige Artefakte

```text
STEP_LWG-4Q.11_manual_winner_flow_prize_quantity_cleanup.zip
Test_LWG_4Q11_manual_winner_flow_ForrestCGN.ps1
```

## Wichtige Arbeitsregeln

```text
Keine Funktionalität entfernen.
Keine produktive SQLite-Datei ersetzen oder überschreiben.
Keine Tokens/.env/Secrets in ZIPs aufnehmen.
Bestehende Transaktionen/Audit-Daten nicht löschen.
Bei weiteren Änderungen zuerst echte aktuelle Dateien/Repo/Live-Stand prüfen.
Bei UI-Tests maximal ein Test-Giveaway pro Szenario erzeugen.
Keine großen UI-assisted Scripts mit mehreren parallelen Testfällen mehr verwenden.
```
