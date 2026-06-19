# Module Current – loyalty_giveaways / Giveaway-bound Wheel + Exclusions + Chat Commands

Stand: 2026-06-19

## Modulzweck

`loyalty_giveaways` verwaltet Loyalty-Giveaways, Entries, Gewinner, Chat-/Command-Runtime und gebundene Giveaway-Glücksräder.

## Aktueller Modulstand

```text
Version: 0.1.18
Build:   LWG_CHAT_OUTPUT_1B
```

## Chat-Commands

Aktiver Stand:

```text
!ticket      → Teilnahme am aktuell offenen normalen Giveaway
!wheel       → Gewinner mit offener Wheel-Permission löst Rad-Claim aus
!rad         → Alias von !wheel
!join        → Raffle-Teilnahme, bleibt unverändert
!raffle      → Raffle-Control, bleibt unverändert
```

Die Commands laufen über das zentrale Command-System auf:

```text
POST /api/loyalty/giveaways/runtime/chat-command
```

## Chat-Ausgabe

### Ab LWG_CHAT_OUTPUT_1

`buildCommandRuntimeResponse()` leitet nicht nur `raffle.*`, sondern auch `ticket.*` und `wheel.*` an die direkte Chat-Ausgabe weiter.

Wichtig:

```text
Keine neuen Texte im Code.
Vorhandene DB-/Textvarianten und Helper bleiben Quelle.
```

### Ab LWG_CHAT_OUTPUT_1B

Legacy-/DB-Textblöcke können mehrere Varianten als Mehrzeiler enthalten. Damit dadurch nicht mehrere Sätze in einer Twitch-Chatnachricht landen, wird nach der Textauflösung und vor dem Chat-Senden abgesichert:

```text
Wenn der gewählte Text mehrere nicht-leere Zeilen enthält,
wird zufällig genau eine Zeile ausgewählt und nur diese gesendet.
```

Damit bleibt Zufall erhalten, aber jede Command-Antwort sendet nur eine Einzelvariante.

Verwendete Textbereiche:

```text
chat_ticket
chat_wheel
chat_raffle
chat_giveaway
```

Relevante Textkeys:

```text
ticket.success
ticket.no_active
ticket.invalid_amount
ticket.max_reached
ticket.insufficient_balance
wheel.no_permission
wheel.success
```

## Bestätigter interaktiver Flow

```text
1. Giveaway öffnen.
2. 3 erlaubte User schreiben !ticket.
3. Gesperrter User una_solala wird per API eingetragen.
4. Giveaway schließen.
5. Draw 1 → Gewinner schreibt !wheel/!rad.
6. Draw 2 → Gewinner schreibt !wheel/!rad.
7. Draw 3 → Gewinner schreibt !wheel/!rad.
8. Weiterer Draw scheitert korrekt: kein eligible User mehr.
```

Bestätigter Test:

```text
Giveaway: giveaway_1781869724371_2cdf71cc66cc312a
Winner 1: RoxxyFoxxyCGN
Winner 2: EngelCGN
Winner 3: ForrestCGN
Felder: 8 → 5
Alle Gewinner: wheel_completed
```

## Gewinn-Sperrliste / Exclusions

Dateibasierte Config:

```text
config/loyalty_giveaway_exclusions.json
```

Regel:

```text
User dürfen als Entry sichtbar bleiben, werden aber beim Draw aus der eligible-Liste entfernt und können dadurch nicht gewinnen.
```

Status-Diagnose:

```text
giveawayExclusions.enabled
giveawayExclusions.path
giveawayExclusions.count
giveawayExclusions.rawItemsCount
giveawayExclusions.ignoredInvalidCount
giveawayExclusions.generatedAt
giveawayExclusions.loaded
giveawayExclusions.mtimeMs
giveawayExclusions.lastError
```

## Bestätigte Wheel-Funktion

`LWG_BOUND_WHEEL_FIELD_COUNT_1` wurde live bestätigt:

- Giveaway-bound Wheels füllen nicht mehr auf 12 sichtbare Felder auf.
- Bei 2+ verfügbaren Gewinnen wird exakt mit den verfügbaren Feldern gedreht.
- Feldverbrauch nach Wheel-Claim funktioniert.

## Offene Punkte

- `LWG_CHAT_OUTPUT_1B` live testen: `!ticket` und `!wheel`/`!rad` müssen genau eine Chatantwort senden.
- Testscript 1.3 sauber mit SUCCESS prüfen.
- Exclusions im Dashboard editierbar machen.
- Exclusions DB-basiert speichern.
- Twitch-User-ID langfristig als primären Schlüssel nutzen.
- Login/DisplayName als Anzeige und Fallback behalten.
- Pro-Giveaway zusätzliche Sperren planen.
- 1-Gewinn-Direktvergabe später gezielt testen.
- 0-Gewinne-Blockpfad später gezielt testen.
