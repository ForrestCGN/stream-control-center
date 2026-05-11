## STEP245 - DeathCounter Streamer.bot Minimal-Bridge Doku

Stand: 2026-05-11

- DeathCounter Streamer.bot-Zielstruktur ist dokumentiert.
- `!rip`, `!tode` und `!dcount` sollen künftig nur noch per FetchURL an `/api/deathcounter/v2/command` übergeben.
- Backend verarbeitet Parsing, Settings, Textvarianten, Counts/Overlay-State und Chat-Ausgabe über `helper_chat_output`.
- Streamer.bot soll im Normalfall keine Chat-Ausgabe mehr ausführen.
- `streamerbot_send` / `streamerbot_message` bleibt als optionaler Fallback dokumentiert.
- Alte C#-Prepare-/Parsing-Skripte können nach erfolgreichem Live-Test ersetzt werden.
- Keine Code-, Backend-, Dashboard-, DB-, Count-, Overlay- oder Streamer.bot-Export-Änderung.

Referenz:

```text
project-state/STEP245_DEATHCOUNTER_STREAMERBOT_MINIMAL_BRIDGE_2026-05-11.md
```

---

## STEP244 - DeathCounter Statistik Game-Filter

Stand: 2026-05-11

- DeathCounter Dashboard-Statistik kann jetzt nach Spiel gefiltert werden.
- Filter nutzt vorhandene JSON-State-Daten aus `player.games`.
- Optionen: Aktuelles Spiel, Alle Spiele / AllTime und einzelne Spiele.
- Keine Backend-, DB-, Count-, Overlay- oder Streamer.bot-Änderung.

Referenz:

```text
project-state/STEP244_DEATHCOUNTER_STATISTIC_GAME_FILTER_2026-05-11.md
```

---

Aktueller DeathCounter-Stand:

```text
STEP238    Command-API
STEP239    Backend-Chatversand über Bot
STEP240    DB-Settings
STEP241    DB-Textvarianten
STEP242    Dashboard-Basis
STEP242.1  Sichtbare-Spieler-Fix
STEP242.2  Dashboard-Tabs/Layout-Fix
STEP243    Dashboard UX Cleanup
STEP244    Statistik Game-Filter
STEP245    Streamer.bot Minimal-Bridge Doku
```
