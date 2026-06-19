# Next Steps – LWG Chat Commands + interaktiver Wheel-Test bestätigt

Stand: 2026-06-19

## Aktueller Stand

`LWG_CHAT_COMMANDS_1` ist live bestätigt:

```text
loyalty_giveaways = 0.1.16 / LWG_CHAT_COMMANDS_1
loyalty_games     = 0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

Bestätigte Commands:

```text
!ticket       → Giveaway Entry
!wheel / !rad → Wheel Claim für gezogenen Gewinner
!join         → Raffle Join, unverändert
!raffle       → Raffle Control, unverändert
```

Die zentralen Commands zeigen:

```text
available = true
active = true
commandsActive = true
ticket.enabled = true
wheel.enabled = true
```

## Was wurde fachlich bestätigt?

Interaktiver Komplett-Test:

```text
Giveaway: giveaway_1781869724371_2cdf71cc66cc312a
Blocked: una_solala
Chat-Teilnehmer: 3 per !ticket
Dreh-Befehl: !wheel / !rad
```

Bestätigt:

```text
Draw aus open wird blockiert.
Giveaway kann auf closed_for_entries gesetzt werden.
Gesperrter User bleibt Entry, wird aber ausgeschlossen.
Runde 1: RoxxyFoxxyCGN gewann und Wheel-Claim wurde erkannt.
Runde 2: EngelCGN gewann und Wheel-Claim wurde erkannt.
Runde 3: ForrestCGN gewann und Wheel-Claim wurde erkannt.
Danach gibt es keinen eligible User mehr.
Feldbestand sinkt korrekt von 8 auf 5.
Alle erwarteten Gewinner sind wheel_completed.
```

## Nächster sinnvoller Schritt

Aktuell ist kein Muss-Fix am bestätigten Giveaway-/Wheel-Flow offen.

Sinnvolle nächste Schritte:

1. Testscript 1.3 mit neuem Test-Giveaway einmal nur auf sauberen `SUCCESS`-Abschluss prüfen.
2. Danach Dokumentation final bestätigen.
3. Test-Giveaways löschen oder eindeutig als Test markieren.
4. Dashboard-/UX-Planung für echten Live-Ablauf:
   - Event öffnen,
   - Tickets anzeigen,
   - Gewinner ziehen,
   - Wheel-Permission anzeigen,
   - „wartet auf !rad“ anzeigen,
   - nächster Gewinner erst nach abgeschlossenem Wheel-Claim.
5. Dashboard-Editor für Gewinn-Sperrliste planen.
6. Exclusions DB-basiert speichern.
7. Twitch-User-ID als primären Schlüssel in Entries ergänzen/nutzen.
8. Draw-/Log-Tab um Exclusion-Details erweitern.
9. 1-Gewinn-Direktvergabe gezielt in einem separaten Test-Giveaway testen.
10. 0-Gewinne-Blockpfad gezielt in einem separaten Test-Giveaway testen.

## Nicht vergessen

- Config `config/loyalty_giveaway_exclusions.json` nicht durch altes Exportformat ersetzen, außer `1B` oder neuer ist eingespielt.
- `!join` nicht für normale Giveaways verwenden; `!join` bleibt Raffle.
- `!ticket` ist der richtige Chat-Befehl für normale Giveaway-Teilnahme.
- `!wheel`/`!rad` nur für Gewinner mit offener Wheel-Permission.
