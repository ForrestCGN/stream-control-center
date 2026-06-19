# TODO – Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Bestätigt / erledigt

- [x] `LWG_BOUND_WHEEL_FIELD_COUNT_1` live getestet.
- [x] Giveaway-bound Wheel füllt nicht mehr visuell auf 12 Felder auf.
- [x] Bound-Wheel-Spin nutzt bei 2+ verfügbaren Gewinnen exakt die verfügbaren Felder.
- [x] Live-Test: `fieldsCount=7`, `visualFieldsCount=7`, `visualMinVisibleSlots=7`.
- [x] Gewinn `Valheim` wurde korrekt reduziert; Restbestand danach `6`.
- [x] Single-Remaining-Regel im Backend vorbereitet: 1 verbleibender Gewinn wird direkt vergeben.
- [x] 0 verfügbare Gewinne werden backendseitig blockiert.
- [x] Bug erkannt: `una_solala` wurde im alten Draw gezogen, obwohl User nicht gewinnen darf.
- [x] `LWG_GIVEAWAY_EXCLUSIONS_1` eingespielt und live bestätigt.
- [x] Datei `config/loyalty_giveaway_exclusions.json` ins Repo/Live-System übernommen.
- [x] Draw-Test mit Sperrliste durchgeführt:
  - gesperrte User bleiben als Entry sichtbar,
  - gesperrte User sind beim Draw nicht eligible,
  - Draw-Metadata enthält `exclusionInfo`,
  - gesperrte User können nicht gewinnen.
- [x] Wheel-Claim nach Exclusion-Draw getestet.
- [x] Bound-Wheel-Feldverbrauch nach Claim bestätigt.
- [x] `LWG_GIVEAWAY_EXCLUSIONS_1B` eingespielt und live bestätigt.
- [x] Robuster Exclusion-Loader lädt 10 Einträge: `rawItemsCount=10`, `ignoredInvalidCount=0`, `loaded=True`.
- [x] `LWG_CHAT_COMMANDS_1` eingespielt und live bestätigt.
- [x] `!ticket` für normale Giveaway-Entries aktiviert.
- [x] `!wheel` und Alias `!rad` für Wheel-Claims aktiviert.
- [x] `!join` und `!raffle` unverändert als Raffle-Commands bestätigt.
- [x] Zentrale Command-Registry bestätigt:
  - `ticket.enabled=true`
  - `wheel.enabled=true`
  - `targetUrl=/api/loyalty/giveaways/runtime/chat-command`
- [x] Interaktiver Komplett-Test mit `!ticket` + `!wheel/!rad` erfolgreich:
  - 4 Entries,
  - 1 gesperrter sichtbarer Entry,
  - 3 erlaubte Gewinner,
  - 3 Chat-Wheel-Claims,
  - kein weiterer eligible User,
  - Felder `8 -> 5`,
  - alle erwarteten Gewinner `wheel_completed`.

## Aktueller bestätigter Stand

```text
loyalty_giveaways: 0.1.16 / LWG_CHAT_COMMANDS_1
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Bestätigter kompletter Testlauf

```text
Giveaway: giveaway_1781869724371_2cdf71cc66cc312a
Blocked:  una_solala
Entries:  una_solala + RoxxyFoxxyCGN + EngelCGN + ForrestCGN
Draw 1:   RoxxyFoxxyCGN → Wheel-Claim erkannt
Draw 2:   EngelCGN      → Wheel-Claim erkannt
Draw 3:   ForrestCGN    → Wheel-Claim erkannt
Final:    keine eligible User mehr
Fields:   8 -> 5
```

## Gewinn-Sperrliste / Exclusions

Dateibasierter Sofort-Fix:

```text
config/loyalty_giveaway_exclusions.json
```

Regel:

```text
User dürfen teilnehmen/sichtbar bleiben, können aber nicht gewinnen.
```

Offen für später:

- [ ] Dashboard-Editor für gesperrte User bauen.
- [ ] DB-basierte Verwaltung statt reiner JSON-Datei.
- [ ] Twitch-User-ID als primärer Schlüssel.
- [ ] Login/DisplayName als Anzeige/Fallback.
- [ ] Anzeige im Draw-/Log-Tab: `rawEntries`, `excludedEntries`, `eligibleEntries`.
- [ ] Optional pro Giveaway eigene zusätzliche Sperrliste.

## Später wieder anfassen – Dashboard-Config Wheel

Die Runtime-Wheel-Regel ist heute bewusst fest eingebaut, damit der Stream funktioniert.

Später muss das als streamerfreundliche Dashboard-Konfiguration umgesetzt werden:

- [ ] Verhalten bei 1 verbleibendem Gewinn konfigurierbar machen:
  - Direktvergabe,
  - separates Letzter-Gewinn-Overlay,
  - optional normaler Spin trotz 1 Feld.
- [ ] Verhalten bei 0 verfügbaren Gewinnen im Dashboard sichtbar machen.
- [ ] Exakte Feldanzahl vs. Mindestfeldanzahl getrennt konfigurieren:
  - Giveaway-bound Wheels: Standard exakt verfügbare Felder.
  - Standalone-/Preset-Wheels: `minVisibleSlots` weiter möglich.
- [ ] Späteres Letzter-Gewinn-Overlay planen, aber nicht heute erzwingen.

## Weitere offene Punkte

- [ ] Testscript 1.3 mit frischem Test-Giveaway einmal nur auf sauberen `SUCCESS`-Abschluss prüfen.
- [ ] Test-Giveaways nach Abschluss löschen oder eindeutig als Test markieren.
- [ ] Giveaway-/Wheel-Dashboard-UX für Live-Draw später streamerfreundlich bauen:
  - Button „Gewinner ziehen“,
  - Anzeige Gewinner + Bitte `!rad`,
  - Status „wartet auf Rad-Dreh“,
  - Button „Nächsten Gewinner ziehen“ erst nach abgeschlossenem Wheel-Claim.
- [ ] Gamble-Alias-Bug separat prüfen: `aliases` zeigt `[object`, `object]`.
