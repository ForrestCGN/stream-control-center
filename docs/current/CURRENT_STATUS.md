# Current Status – stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Aktueller bestätigter Bereich

Step `LWG_CHAT_COMMANDS_1` wurde live eingespielt und bestätigt.

Bestätigt:

```text
loyalty_giveaways: 0.1.16 / LWG_CHAT_COMMANDS_1
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

Zusätzlich bleibt der vorherige Exclusion-Stand fachlich bestätigt:

```text
LWG_GIVEAWAY_EXCLUSIONS_1B
```

## Aktivierte Chat-Commands

`!ticket`, `!wheel` und `!rad` sind jetzt für die normale Giveaway-/Wheel-Runtime aktiv.

Bestätigte Command-Zuordnung:

```text
!ticket       → normales Giveaway, erstellt Entry im aktuell offenen Giveaway
!wheel / !rad → Gewinner mit offener Wheel-Permission dreht das gebundene Giveaway-Rad
!join         → bleibt Raffle-Command
!raffle       → bleibt Raffle-Command
```

Live bestätigt über:

```text
GET /api/loyalty/giveaways/commands
GET /api/loyalty/giveaways/central-commands
```

Erwarteter/ bestätigter Stand:

```text
commands.active = true
centralCommands.available = true
centralCommands.active = true
centralCommands.commandsActive = true

ticket.enabled = true
wheel.enabled = true
wheel.aliases = [rad]
join.enabled = true
raffle.enabled = true
```

`ticket` und `wheel` wurden über `LWG_CHAT_COMMANDS_1` aktiviert. `join` und `raffle` bleiben unverändert Raffle-Commands.

## Bestätigter interaktiver Komplett-Test

Test-Giveaway:

```text
Giveaway: giveaway_1781869724371_2cdf71cc66cc312a
Titel:    Test
Mode:     wheel_single
```

Ablauf:

```text
1. Giveaway aus draft geöffnet.
2. Gesperrter User una_solala wurde per API als Entry hinzugefügt.
3. 3 erlaubte Testuser sind per !ticket beigetreten.
4. Draw aus open wurde korrekt blockiert.
5. Giveaway wurde auf closed_for_entries gesetzt.
6. Draw-Runde 1: RoxxyFoxxyCGN gewann und drehte per !wheel/!rad.
7. Draw-Runde 2: EngelCGN gewann und drehte per !wheel/!rad.
8. Draw-Runde 3: ForrestCGN gewann und drehte per !wheel/!rad.
9. Danach war kein eligible User mehr vorhanden.
```

Bestätigte PASS-Punkte:

```text
Aktive Entries korrekt: 4
Gesperrter User ist sichtbar unter den Entries
Draw aus OPEN korrekt blockiert
ExclusionInfo in Runde 1 korrekt
Pending Wheel-Permission fuer Gewinner vorhanden
Wheel-Claim durch Chat erkannt: RoxxyFoxxyCGN
Wheel-Claim durch Chat erkannt: EngelCGN
Wheel-Claim durch Chat erkannt: ForrestCGN
Nach 3 Gewinnern ist kein eligible User mehr vorhanden
Finale verfügbare Felder korrekt: 8 -> 5
Alle erwarteten Gewinner sind wheel_completed
```

Damit ist bestätigt:

```text
- !ticket erreicht die Giveaway-Runtime.
- !wheel / !rad erreicht die Wheel-Claim-Runtime.
- Gesperrte User bleiben sichtbar, gewinnen aber nicht.
- Pro Draw bekommt nur der gezogene Gewinner eine Wheel-Permission.
- Jeder Chat-Wheel-Claim wird erkannt und abgeschlossen.
- Der Feldbestand sinkt pro erfolgreichem Wheel-Claim korrekt.
```

## Bestätigte Wheel-Funktion

Step `LWG_BOUND_WHEEL_FIELD_COUNT_1` bleibt bestätigt:

```text
2+ verfügbare Gewinne  → normaler Glücksrad-Spin mit exakt diesen verfügbaren Feldern
1 verfügbarer Gewinn   → Codepfad vorbereitet: Direktvergabe ohne normalen Wheel-Spin
0 verfügbare Gewinne   → Codepfad vorbereitet: Claim/Spin blockiert
```

Live-Test mit Giveaway `giveaway_1781856708568_9653eba68a211017`:

```text
Vor Test: 8 Bound-Wheel-Felder, davon 7 verfügbar
Claim für urlug → Gewinn Valheim
Spin-Metadata: fieldsCount=7, visualFieldsCount=7, visualMinVisibleSlots=7
Nach Test: Roadside Research=0, Valheim=0, verfügbar=6
```

Damit ist bestätigt: Giveaway-bound Wheels werden nicht mehr optisch auf 12 Felder aufgefüllt.

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

## Bestätigter Exclusion-Test vor LWG_CHAT_COMMANDS_1

Frisches Test-Giveaway:

```text
Giveaway:     giveaway_1781865117837_a56d3fcb009a15a2
Titel:        Test
Bound-Wheel:  giveawaywheel_1781865117837_3d9cfcef7469aef2
```

Test-Entries:

```text
una_solala   active  → gesperrt
udowb        active  → erlaubt
engelcgn     active  → erlaubt
```

Draw-Ergebnis:

```text
Winner: udowb
eligibleEntriesCount: 2
rawEntriesCount: 3
excludedEntriesCount: 1
excluded[0].userLogin: una_solala
excluded[0].reason: login
```

Claim-/Wheel-Ergebnis:

```text
Permission: wheelperm_1781865357312_f86f36711269e3e3
Spin:       spin_1781865515072_d11827bafa8cd593
Gewinn:     Roadside Research
Status:     wheel_completed
Feldverbrauch: Roadside Research quantityRemaining 1 → 0
fieldsCount=8, visualFieldsCount=8, giveawayBoundWheelExactFields=true
```

## Aktueller Testscript-Stand

Aktuell erzeugter Testscript-Step:

```text
LWG_TESTSCRIPT_1_3_interactive_giveaway_wheel_summary_fix.zip
```

Ziel:

```text
tools/tests/loyalty_giveaway_wheel_interactive_test.ps1
```

Fachlicher Test mit Script 1.2 war bereits bestanden; Script 1.3 behebt nur den finalen Summary-/Argumenttypen-Abbruch nach den PASS-Zeilen.

## Später wieder anfassen – Dashboard-Config

Die Gewinn-Sperrliste ist aktuell bewusst dateibasiert, damit der Stream sicher läuft.

Später muss daraus eine dashboardfähige Verwaltung werden:

- User hinzufügen/entfernen/aktivieren/deaktivieren.
- Twitch-User-ID primär speichern und nutzen.
- Login/DisplayName als Anzeige und Fallback behalten.
- Sichtbar machen, wie viele Entries beim Draw durch Sperrliste ausgeschlossen wurden.
- Optional pro Giveaway zusätzliche Sperren erlauben.

Auch die harte Wheel-Regel muss später dashboardfähig konfigurierbar werden:

- Verhalten bei 1 verbleibendem Gewinn.
- Verhalten bei 0 verbleibenden Gewinnen.
- Exakte Feldanzahl vs. Mindestfeldanzahl getrennt für Bound-Wheels und Standalone-/Preset-Wheels.
