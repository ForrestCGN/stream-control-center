# TODO – Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Bestätigt / erledigt

- [x] `LWG_BOUND_WHEEL_FIELD_COUNT_1` live getestet.
- [x] Giveaway-bound Wheel füllt nicht mehr visuell auf 12 Felder auf.
- [x] Bound-Wheel-Spin nutzt bei 2+ verfügbaren Gewinnen exakt die verfügbaren Felder.
- [x] Gewinn-Sperrliste / Exclusions umgesetzt und bestätigt.
- [x] `LWG_GIVEAWAY_EXCLUSIONS_1B` eingespielt und live bestätigt.
- [x] Robuster Exclusion-Loader lädt 10 Einträge: `rawItemsCount=10`, `ignoredInvalidCount=0`, `loaded=True`.
- [x] `LWG_CHAT_COMMANDS_1` umgesetzt und live bestätigt.
- [x] `!ticket` ist für normale Giveaways aktiv.
- [x] `!wheel` und Alias `!rad` sind für Gewinner-Wheel-Claims aktiv.
- [x] `!join` und `!raffle` bleiben Raffle-Commands.
- [x] Interaktiver Komplett-Test mit `!ticket`, Sperrliste, 3 Gewinnern und Wheel-Claims fachlich bestanden.
- [x] Testscript 1.3 für finalen Summary-Fix erstellt.
- [x] `LWG_CHAT_OUTPUT_1` gebaut: Chat-Ausgabe für `ticket.*` und `wheel.*` über vorhandene Helper/Textvarianten.
- [x] `LWG_CHAT_OUTPUT_1` grundsätzlich live bestätigt: Chatmeldungen erscheinen bei `!ticket` und `!wheel`/`!rad`.
- [x] Doppel-/Mehrsatz-Problem analysiert: Legacy-/DB-Mehrzeiler können als eine Variante gewählt werden.
- [x] `LWG_CHAT_OUTPUT_1B` gebaut: Mehrzeilen-Textblöcke werden vor Chat-Ausgabe auf genau eine zufällige Einzelzeile reduziert.

## Aktueller Stand

```text
loyalty_giveaways: 0.1.18 / LWG_CHAT_OUTPUT_1B
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Noch zu testen

- [ ] `LWG_CHAT_OUTPUT_1B` live testen:
  - [ ] `!ticket` erstellt Entry.
  - [ ] `!ticket` sendet genau eine Chat-Bestätigung aus vorhandenen `ticket.*` Textvarianten.
  - [ ] `!wheel`/`!rad` löst Wheel-Claim aus.
  - [ ] `!wheel`/`!rad` sendet genau eine Chat-Bestätigung aus vorhandenen `wheel.*` Textvarianten.
  - [ ] Keine zusammengesetzten Doppeltexte mehr in einer Chatnachricht.
- [ ] Testscript 1.3 mit frischem Test-Giveaway bis zum sauberen `PASS/SUCCESS`-Abschluss laufen lassen.

## Gewinn-Sperrliste / Exclusions – später

- [ ] Dashboard-Editor für gesperrte User bauen.
- [ ] DB-basierte Verwaltung statt reiner JSON-Datei.
- [ ] Twitch-User-ID als primärer Schlüssel.
- [ ] Login/DisplayName als Anzeige/Fallback.
- [ ] Anzeige im Draw-/Log-Tab: `rawEntries`, `excludedEntries`, `eligibleEntries`.
- [ ] Optional pro Giveaway eigene zusätzliche Sperrliste.

## Wheel-Config – später

- [ ] Verhalten bei 1 verbleibendem Gewinn konfigurierbar machen.
- [ ] Verhalten bei 0 verfügbaren Gewinnen im Dashboard sichtbar machen.
- [ ] Exakte Feldanzahl vs. Mindestfeldanzahl getrennt konfigurieren.
- [ ] Späteres Letzter-Gewinn-Overlay planen.

## Weitere offene Punkte

- [ ] Test-Giveaways nach Abschluss löschen oder eindeutig als Test markieren.
- [ ] Gamble-Alias-Bug separat prüfen: `aliases` zeigt `[object`, `object]`.
