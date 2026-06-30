# TODO

## RDAP Media Index aktueller Block nach 0.2.93

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
- [ ] 0.2.94: Read-only DB Context API fuer Media-Index planen und bauen.
- [ ] Spaeter: `MEDIA_INDEX_SCHEMA_WRITE_ENABLED=false` explizit in Env fuehren, damit Diagnose-Ausgaben vollstaendig sind.
- [ ] Spaeter: FullSyncCompare persistenter/neu anforderbar machen, weil Runtime-Snapshot nach Service-Restart leer ist.
- [ ] Spaeter: Gated Delta-Upsert separat planen, erst nach sauberer Read-only-Diagnose.

## RDAP Media Index Verlauf lokal/remote

- [x] 0.2.73: `backend/modules/remote_agent.js` inline fuer Media-System-Scan erweitern.
- [x] 0.2.73 lokal Syntax/Status pruefen.
- [x] 0.2.73 per `stepdone.cmd` nach GitHub/dev pushen.
- [x] 0.2.75: Remote-Modboard akzeptiert `media`-Root read-only.
- [x] 0.2.75: Kontextfelder kommen remote an.
- [x] 0.2.75: Webserver-Deploy/live bestaetigt.
- [x] 0.2.77: Media-Index-Diff/Preview akzeptiert `media`-Root read-only.
- [x] 0.2.77: Preview zeigt `media`-Items mit Kontextfeldern.
- [x] 0.2.77: Webserver-Deploy/live fachlich bestaetigt.
- [x] 0.2.79: Diff-Endpoint `moduleBuild`/`routeBuild` Anzeige-Polish bestaetigt.
