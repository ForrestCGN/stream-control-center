# CHANGELOG

## 2026-05-11 - STEP249 DeathCounter Command rawInput Parser-Fix

- DeathCounter Command-Parser für Streamer.bot-`rawInput` robuster gemacht.
- Der erste Token wird entfernt, wenn er dem aktuellen Command entspricht, z. B. `!dcount`, `.dcount`, `!rip`, `!tode`.
- `!dcount` ohne weitere Parameter toggelt dadurch wieder zuverlässig.
- `!rip @Name` und `!tode @Name` funktionieren auch bei Übergabe des kompletten Rohtexts.
- Keine Dashboard-, DB-, Count-Migrations-, Overlay- oder EventSub-Änderung.
