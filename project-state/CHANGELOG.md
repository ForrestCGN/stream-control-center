# CHANGELOG

## 2026-05-11 - STEP258 DeathCounter Active Database Storage

- DeathCounter V2 nutzt die importierten DB-Tabellen jetzt als aktive Storage-Quelle.
- `readState()` liest DB-first und nutzt `deathcounter.v2.json` nur noch als Fallback, falls DB nicht lesbar ist.
- `updateState()` schreibt Aenderungen in die DB und synchronisiert JSON weiter per Dual-Write.
- Integration-Check um `active_database_storage` erweitert.
- Kein optionaler Storage-Mode-Schalter eingebaut.
- Keine Overlay-, Dashboard- oder Streamer.bot-Aenderung.

## 2026-05-11 - STEP257 DeathCounter DB Read-Test

- Neue Route `GET /api/deathcounter/v2/storage/read-test` ergaenzt.
- Route baut aus importierten DB-Zeilen einen DeathCounter-Public-State.
- Ergebnis wird mit dem weiterhin aktiven JSON-Public-State verglichen.
- Integration-Check um `database_storage_read_test` erweitert.
- Keine DB-Schreiboperationen, kein Import, kein Storage-Wechsel und keine produktive Aktivierung des DB-Storage.

## 2026-05-11 - STEP256 DeathCounter Storage Consistency Check

- Neue Route `GET /api/deathcounter/v2/storage/consistency` ergaenzt.
- Route vergleicht aktuellen JSON-State mit den importierten DB-Zeilen.
- Geprueft werden Spieler, Games, Counts und Overlay-State.
- Integration-Check um `database_storage_consistency` erweitert.
- Keine DB-Schreiboperationen, kein Import und kein Storage-Wechsel.

## 2026-05-11 - STEP255 DeathCounter Guarded Storage Import

- Neue Route `POST /api/deathcounter/v2/storage/import` ergaenzt.
- Import schreibt nur nach explizitem `confirm=IMPORT_DEATHCOUNTER_V2`.
- Import ist nur erlaubt, wenn die Zieltabellen leer sind und die STEP254-Validation importbereit ist.
- Vor dem Import wird standardmaessig ein Backup von `deathcounter.v2.json` unter `data/deathcounter/backups/` erstellt.
- Importiert werden Spieler, Games, Counts und Overlay-State in die vorbereiteten DB-Tabellen.
- `deathcounter_events` wird nicht aus JSON rekonstruiert.
- Aktiver Storage bleibt `json_state_file`; keine Umstellung der produktiven Count-Logik.

## 2026-05-11 - STEP254 DeathCounter Storage Validation

- Neue Route `GET /api/deathcounter/v2/storage/validate` ergaenzt.
- Route validiert JSON-State gegen geplante DB-Zielzeilen und vorbereitete Tabellen.
- Prueft u. a. doppelte Player/Games/Counts, fehlende Referenzen und Overlay-IDs.
- Integration-Check um `database_storage_validation` erweitert.
- Keine DB-Schreiboperationen, kein Import, kein Storage-Wechsel.

## 2026-05-11 - STEP253 DeathCounter Storage Preview

- Neue Read-only-Route `GET /api/deathcounter/v2/storage/preview` ergänzt.
- Die Route baut aus dem produktiven JSON-State eine Vorschau für `deathcounter_players`, `deathcounter_games`, `deathcounter_counts`, `deathcounter_overlay_state` und `deathcounter_events`.
- Optional: `limit` und `includeRows` für kompakte Vorschau-Ausgaben.
- `/api/deathcounter/v2/integration-check` prüft jetzt zusätzlich `database_storage_preview`.
- Keine Count-Migration, kein DB-Import, keine Storage-Umschaltung und keine Änderung an Overlay/Streamer.bot.

## 2026-05-11 - STEP252 DeathCounter DB-Schema Storage-Grundlage

- DeathCounter V2 bereitet jetzt eine eigene DB-Storage-Grundlage vor.
- Neue Tabellen werden sanft per `CREATE TABLE IF NOT EXISTS` angelegt.
- Tabellen: `deathcounter_players`, `deathcounter_games`, `deathcounter_counts`, `deathcounter_overlay_state`, `deathcounter_events`.
- Schema-Version wird unter `deathcounter_v2_storage` in `schema_versions` geführt.
- `/api/deathcounter/v2/config`, `/settings` und `/integration-check` zeigen den vorbereiteten Storage-Status.
- Produktiver Storage bleibt weiterhin `data/deathcounter/deathcounter.v2.json`.
- Es werden keine Counts migriert, importiert, überschrieben oder auf DB-Lesen/Schreiben umgeschaltet.

## 2026-05-11 - STEP251 DeathCounter Dashboard Extra Players

- Dashboard-Tab `Steuerung` um Zusatzspieler-Verwaltung erweitert.
- Zusatzspieler können hinzugefügt, entfernt und komplett geleert werden.
- Dashboard nutzt dafür die vorhandene `dcount`-Command-API mit `sendChat=0`.
- Übersicht/Sichtbare-Spieler-Anzeige berücksichtigt jetzt `selectedPlayerIds` plus `extraPlayerIds`.
- Styling für Zusatzspieler-Pills und Zusatzspieler-Steuerung ergänzt.
- Keine Backend-, Overlay-, Streamer.bot-, DB- oder Count-Migration.
