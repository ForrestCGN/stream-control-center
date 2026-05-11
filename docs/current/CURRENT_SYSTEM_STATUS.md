# CURRENT_SYSTEM_STATUS - STEP249 Update

DeathCounter V2 Command-Parser wurde für Streamer.bot-`rawInput` korrigiert.

- `rawInput` und `input0` bis `input9` werden jetzt normalisiert.
- Wenn der erste Token der aktuelle Command ist, wird er vor der Auswertung entfernt.
- Erkannte Prefixe: `!`, `.`, `/`.
- Dadurch toggelt `!dcount` wieder, auch wenn Streamer.bot den kompletten Chattext übergibt.
- `!rip @Name`, `!rip @Name del`, `!tode` und `!tode @Name` bleiben kompatibel.

Empfohlene Streamer.bot-FetchURLs nutzen künftig `rawInput=%rawInput%`.

Keine Dashboard-, DB-, Count-Migrations-, Overlay- oder EventSub-Änderung in diesem STEP.
