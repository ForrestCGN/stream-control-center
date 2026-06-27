# Current Status – stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Aktueller Arbeitsstand

Aktueller Stand nach Chat-Command-/Chat-Output-Fix:

```text
loyalty_giveaways: 0.1.18 / LWG_CHAT_OUTPUT_1B
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Zuletzt bestätigt

### LWG_CHAT_COMMANDS_1 – bestätigt

`!ticket`, `!wheel` und `!rad` sind für die normale Giveaway-/Wheel-Runtime aktiv.

```text
!ticket      → normales Giveaway / Entry-Erstellung
!wheel       → Gewinner mit offener Wheel-Permission löst Rad-Claim aus
!rad         → Alias von !wheel
!join        → bleibt Raffle-Command
!raffle      → bleibt Raffle-Command
```

Die zentralen Commands waren bestätigt:

```text
available=true
active=true
commandsActive=true
ticket.enabled=true
wheel.enabled=true
wheel.aliases=[rad]
targetUrl=/api/loyalty/giveaways/runtime/chat-command
```

### Interaktiver Komplett-Test – fachlich bestanden

Test-Giveaway:

```text
giveaway_1781869724371_2cdf71cc66cc312a
Titel: Test
Modus: wheel_single
```

Bestätigt im Testlauf:

```text
- Giveaway wurde geöffnet.
- una_solala wurde per API als gesperrter Entry hinzugefügt.
- 3 erlaubte User kamen per !ticket in das Giveaway.
- Draw aus open wurde korrekt blockiert.
- Giveaway wurde auf closed_for_entries gesetzt.
- Runde 1 Gewinner: RoxxyFoxxyCGN → Wheel-Claim per Chat erkannt.
- Runde 2 Gewinner: EngelCGN → Wheel-Claim per Chat erkannt.
- Runde 3 Gewinner: ForrestCGN → Wheel-Claim per Chat erkannt.
- Danach war kein eligible User mehr vorhanden.
- Verfügbare Felder wurden korrekt von 8 auf 5 reduziert.
- Alle erwarteten Gewinner waren wheel_completed.
```

Damit sind bestätigt:

```text
Chat-Commands funktionieren fachlich.
Sperrliste/Exclusion-Fairness funktioniert.
Bound-Wheel-Feldverbrauch funktioniert.
Mehrere Gewinner werden nacheinander gezogen und drehen jeweils selbst per !wheel/!rad.
```

## Chat-Ausgabe

### LWG_CHAT_OUTPUT_1 – gebaut und live grundsätzlich bestätigt

Problem nach `LWG_CHAT_COMMANDS_1`:

```text
!ticket erstellt den Entry korrekt, aber es kommt keine Chat-Bestätigung.
```

Ursache:

```text
Die direkte Chat-Ausgabe in buildCommandRuntimeResponse() griff bisher nur für raffle.*.
```

Umsetzung in `LWG_CHAT_OUTPUT_1`:

```text
Direkte Chat-Ausgaben werden jetzt auch für ticket.* und wheel.* über vorhandene Helper/Textvarianten gesendet.
```

Live-Beobachtung danach:

```text
!ticket sendet Chat-Bestätigung.
!wheel / !rad sendet Chat-Bestätigung.
```

### LWG_CHAT_OUTPUT_1B – gebaut, Test offen

Nach `LWG_CHAT_OUTPUT_1` wurde festgestellt:

```text
Einige Chatmeldungen enthielten zwei Sätze/Varianten in einer Nachricht.
```

Beispiel:

```text
ForrestCGN, dein Ticket wurde von der Heimleitung abgestempelt. Du bist mit 1 Ticket(s) im Lostopf. ForrestCGN, die Rentnergang hat 1 Ticket(s) für dich in die Lostrommel geworfen.
```

Ursache:

```text
Legacy-/DB-Textblöcke können mehrere Varianten als Mehrzeiler enthalten.
Der Textpicker kann so einen Mehrzeiler als eine Variante wählen.
helper_chat_output sendet daraus eine einzeilige Chatnachricht mit mehreren Sätzen.
```

Umsetzung in `LWG_CHAT_OUTPUT_1B`:

```text
Nach der Textauflösung und vor dem Chat-Senden wird geprüft:
Wenn der gewählte Text mehrere nicht-leere Zeilen enthält,
wird zufällig genau eine Zeile ausgewählt und nur diese gesendet.
```

Wichtig:

```text
Keine neuen Texte hartcodiert.
Keine DB-Handarbeit.
Vorhandene Helper/Textvarianten bleiben Quelle.
```

Teststatus:

```text
LWG_CHAT_OUTPUT_1B ist gebaut.
Live-Test steht noch aus: !ticket und !wheel/!rad dürfen nur noch eine Einzelvariante senden.
```

## Verwendete Textkeys

```text
ticket.success
ticket.no_active
ticket.invalid_amount
ticket.max_reached
ticket.insufficient_balance
wheel.no_permission
wheel.success
```

## Bestätigte Wheel-Funktion

`LWG_BOUND_WHEEL_FIELD_COUNT_1` bleibt bestätigt:

```text
2+ verfügbare Gewinne  → normaler Glücksrad-Spin mit exakt diesen verfügbaren Feldern
1 verfügbarer Gewinn   → Codepfad vorbereitet: Direktvergabe ohne normalen Wheel-Spin
0 verfügbare Gewinne   → Codepfad vorbereitet: Claim/Spin blockiert
```

Giveaway-bound Wheels werden nicht mehr optisch auf 12 Felder aufgefüllt.

## Gewinn-Sperrliste / Exclusions

Die dateibasierte Gewinn-Sperrliste ist aktiv:

```text
config/loyalty_giveaway_exclusions.json
```

Fachliche Regel:

```text
User dürfen als Entry sichtbar bleiben, sind aber beim Draw nicht eligible und können dadurch nicht gewinnen.
```

Live-Status nach `LWG_GIVEAWAY_EXCLUSIONS_1B`:

```text
giveawayExclusions.enabled = True
giveawayExclusions.count = 10
giveawayExclusions.rawItemsCount = 10
giveawayExclusions.ignoredInvalidCount = 0
giveawayExclusions.loaded = True
lastError =
```

## Später wieder anfassen

- `LWG_CHAT_OUTPUT_1B` live testen: `!ticket` darf nur noch eine Chat-Variante senden.
- `!wheel`/`!rad` live testen: nur eine Chat-Variante senden.
- Testscript 1.3 mit frischem Test-Giveaway bis sauberem `PASS/SUCCESS` laufen lassen.
- Dashboard-Editor für Gewinn-Sperrliste bauen.
- Exclusions DB-basiert speichern.
- Twitch-User-ID als primären Schlüssel nutzen.
- Draw-/Log-Tab mit Exclusion-Details erweitern.
- Verhalten bei 1/0 verbleibenden Gewinnen gezielt testen.
