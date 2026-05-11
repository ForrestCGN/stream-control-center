# CHANGELOG

## 2026-05-11 - STEP248 DeathCounter Spieler-Detail Quick-Corrections

- Spieler-Detailansicht im DeathCounter-Dashboard um direkte Korrektur-Aktionen erweitert.
- `+1 Tod` und `-1 Tod` können jetzt direkt aus der Detailkarte für den ausgewählten Spieler ausgelöst werden.
- Korrektur wirkt bewusst auf das aktuelle Spiel und nutzt die bestehende Command-API mit `sendChat=0`.
- `-1 Tod` bleibt mit Bestätigungsdialog abgesichert.
- Keine Backend-, DB-, Count-Migrations-, Overlay- oder Streamer.bot-Änderung.
