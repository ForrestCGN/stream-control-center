# TODO – Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Bestätigt / erledigt

- [x] `LWG_BOUND_WHEEL_FIELD_COUNT_1` live getestet.
- [x] Giveaway-bound Wheel füllt nicht mehr visuell auf 12 Felder auf.
- [x] Bound-Wheel-Spin nutzt bei 2+ verfügbaren Gewinnen exakt die verfügbaren Felder.
- [x] Live-Test: `fieldsCount=7`, `visualFieldsCount=7`, `visualMinVisibleSlots=7`.
- [x] Gewinn `Valheim` wurde korrekt reduziert.
- [x] Bug erkannt: `una_solala` wurde im alten Draw gezogen, obwohl User nicht gewinnen darf.
- [x] `LWG_GIVEAWAY_EXCLUSIONS_1` eingespielt und fachlich bestätigt.
- [x] Datei `config/loyalty_giveaway_exclusions.json` aktiv: `enabled=true`, `count=10`.
- [x] Draw-Test mit frischem Test-Giveaway durchgeführt.
- [x] Gesperrter User bleibt als Entry sichtbar.
- [x] Gesperrter User ist beim Draw nicht eligible.
- [x] Draw-Metadata enthält `exclusionInfo`.
- [x] Wheel-Claim nach Exclusion-Draw funktioniert.
- [x] Bound-Wheel-Feld wird nach Claim reduziert.

## Aktueller Mini-Step

- [ ] `LWG_GIVEAWAY_EXCLUSIONS_1B` einspielen.
- [ ] Status prüfen: Version `0.1.15`, Build `LWG_GIVEAWAY_EXCLUSIONS_1B`.
- [ ] Status prüfen: `giveawayExclusions.enabled=true`, `count=10`, `rawItemsCount=10`, `ignoredInvalidCount=0`.
- [ ] Optional Exportformat ohne `enabled` gegenprüfen, wenn später neue Exportdateien übernommen werden.

## Gewinn-Sperrliste / Exclusions – später

- [ ] Dashboard-Editor für gesperrte User bauen.
- [ ] DB-basierte Verwaltung statt reiner JSON-Datei.
- [ ] Twitch-User-ID als primärer Schlüssel.
- [ ] Login/DisplayName als Anzeige/Fallback.
- [ ] Anzeige im Draw-/Log-Tab: `rawEntries`, `excludedEntries`, `eligibleEntries`.
- [ ] Optional pro Giveaway eigene zusätzliche Sperrliste.

## Später wieder anfassen – Dashboard-Config Wheel

- [ ] Verhalten bei 1 verbleibendem Gewinn konfigurierbar machen.
- [ ] Verhalten bei 0 verfügbaren Gewinnen im Dashboard sichtbar machen.
- [ ] Exakte Feldanzahl vs. Mindestfeldanzahl getrennt konfigurieren.
- [ ] Späteres Letzter-Gewinn-Overlay planen, aber nicht heute erzwingen.

## Weitere offene Punkte

- [ ] Direkten Reset-/Hide-Test sauber möglich machen.
- [ ] Test-Giveaway nach Abschluss löschen oder eindeutig als Test markieren.
- [ ] Gamble-Alias-Bug separat prüfen: `aliases` zeigt `[object`, `object]`.
