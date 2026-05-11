# CURRENT_SYSTEM_STATUS - STEP248 Update

DeathCounter V2 Dashboard wurde um Spieler-Detail Quick-Corrections erweitert.

- Spieler-Detailkarte enthält jetzt `+1 Tod`, `-1 Tod` und `Steuerung öffnen`.
- Korrekturen laufen über die bestehende `/api/deathcounter/v2/command`-API.
- Chat-Ausgabe ist bei Dashboard-Korrekturen deaktiviert (`sendChat=0`).
- `-1 Tod` ist weiterhin durch Bestätigung geschützt.
- Die Korrektur wirkt bewusst nur auf das aktuelle Spiel.

Keine Backend-, DB-, Count-Migrations-, Overlay- oder Streamer.bot-Änderung in diesem STEP.
