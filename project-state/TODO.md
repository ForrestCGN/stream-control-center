# TODO

## RDAP Media Index / Media Picker aktueller Block nach 0.2.104

- [x] 0.2.79: Diff-Endpoint `moduleBuild`/`routeBuild` Anzeige-Polish bestaetigt.
- [x] 0.2.83: FullSync Summary ueber komplette Listen bestaetigt.
- [x] 0.2.85: Upsert Preview readonly bestaetigt, 412 Kandidaten.
- [x] 0.2.86: Upsert Execute Foundation blocked bestaetigt.
- [x] 0.2.87: Schema Extension Foundation blocked bestaetigt.
- [x] 0.2.88: Schema Extension Execute gated ausgefuehrt, 6 Kontextspalten angelegt.
- [x] 0.2.89: Upsert with Context gated implementiert; erster Execute-Fehler analysiert, kein Write passiert.
- [x] 0.2.90: 500 bei fehlendem Candidate-Array verhindert.
- [x] 0.2.91: Candidate-Feld-Fix und produktiver Upsert bestaetigt, `media=412` in DB.
- [x] Gates nach produktivem Execute geschlossen halten und pruefen.
- [x] 0.2.93: Post-Upsert Verify readonly bestaetigt: FullSync 744, DB 744, Upsert Preview 0 Kandidaten, Audit success.
- [x] 0.2.94: Read-only DB Context API fuer Media-Index gebaut und live bestaetigt.
- [x] 0.2.95: Context Read API Docs Handoff erledigt.
- [x] 0.2.96: Media-Picker/API-Consumer readonly online umgesetzt.
- [x] 0.2.97: Media-Picker Context UI Polish.
- [x] 0.2.98: Page-Size-Dropdown.
- [x] 0.2.99: Mod-friendly Filters.
- [x] 0.2.100: CGN Design Polish.
- [x] 0.2.101: Pagination and Dedup live ok.
- [x] 0.2.102: Online Media-Picker Docs Handoff.
- [x] 0.2.103: Local Media-Picker Alignment Plan.
- [x] 0.2.104: Local Media-Picker Readonly Alignment.
- [ ] 0.2.105: Local Media-Picker Verify and Polish.
- [ ] Spaeter: `MEDIA_INDEX_SCHEMA_WRITE_ENABLED=false` explizit in Env fuehren, damit Diagnose-Ausgaben vollstaendig sind.
- [ ] Spaeter: FullSyncCompare persistenter/neu anforderbar machen, weil Runtime-Snapshot nach Service-Restart leer ist.
- [ ] Spaeter: Gated Delta-Upsert separat planen, erst nach sauberer Read-only-Diagnose.

## Leitlinie UI

- [x] Mod-UI statt Entwickler-UI: alltaegliche Begriffe verwenden.
- [x] CGN-Design beachten: dunkles Lila/Blau, Neon-Cyan/Violett, runde Panels, Glow/Chips.
- [x] Keine weissen Browser-Standard-Dropdowns.
- [x] Keine technischen Warnboxen ohne echten Fehler.
- [x] Lokale Media-Ansicht an Online-Media-Picker angleichen, ohne zweite UI-Logik.
