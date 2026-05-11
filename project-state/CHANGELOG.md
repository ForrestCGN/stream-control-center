# CHANGELOG

## 2026-05-11 - STEP246 DeathCounter Game-Change ueber Twitch EventSub

- `backend/modules/twitch.js` erkennt `channel.update` EventSub-Notifications und synchronisiert das Spiel zum DeathCounter.
- DeathCounter wird per lokaler API `/api/deathcounter/v2/game` aktualisiert.
- `/api/twitch/eventsub/status` enthaelt den neuen Bereich `deathcounterSync`.
- Keine Chat-Ausgabe, keine Count-/DB-/Dashboard-/Overlay-Migration.
- Streamer.bot-Game-Changed-Action ist nach erfolgreichem Live-Test nicht mehr noetig.

## 2026-05-11 - STEP245 DeathCounter Streamer.bot Minimal-Bridge Doku

- DeathCounter Streamer.bot-Zielstruktur dokumentiert.
- Minimal-URLs für `!rip`, `!tode` und `!dcount` dokumentiert.
- Backend/Bot ist primäre Chat-Ausgabe; Streamer.bot-Fallback bleibt optional.
- Alte C#-Prepare-/Parsing-Skripte sind nach Live-Test ersetzbar.
- Keine Code-, Backend-, Dashboard-, DB-, Count-, Overlay- oder Streamer.bot-Export-Änderung.

## 2026-05-11 - STEP244 DeathCounter Statistik Game-Filter

- DeathCounter-Dashboard: Statistik-Tab um Spiele-Auswahl erweitert.
- KPIs, Toplisten und Spielerwert-Tabelle reagieren auf `Aktuelles Spiel`, `Alle Spiele / AllTime` und einzelne Spiele aus dem vorhandenen State.
- Keine Backend-, DB-, Count- oder Overlay-Änderung.
