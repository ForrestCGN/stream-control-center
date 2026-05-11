# CHANGELOG

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
