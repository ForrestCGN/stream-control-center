# CURRENT_SYSTEM_STATUS - STEP245 Update

DeathCounter V2 Streamer.bot-Minimal-Bridge wurde dokumentiert.

- `!rip`, `!tode` und `!dcount` sollen künftig nur noch FetchURL auf `/api/deathcounter/v2/command` ausführen.
- Backend übernimmt Parsing, Settings, Textvarianten, DeathCounter-Logik und Chat-Ausgabe über `helper_chat_output`.
- Streamer.bot soll im Normalfall keine eigene Chat-Ausgabe mehr ausführen.
- `streamerbot_send` / `streamerbot_message` bleibt als optionaler Fallback dokumentiert.
- Alte C#-Parsing-/Prepare-Skripte können nach erfolgreichem Live-Test ersetzt werden.

Keine Code-, Backend-, Dashboard-, DB-, Count-, Overlay- oder Streamer.bot-Export-Änderung in diesem STEP.
