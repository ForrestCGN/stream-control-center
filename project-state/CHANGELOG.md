# CHANGELOG

## 2026-05-11 - STEP251 DeathCounter Dashboard Extra Players

- Dashboard-Tab `Steuerung` um Zusatzspieler-Verwaltung erweitert.
- Zusatzspieler können hinzugefügt, entfernt und komplett geleert werden.
- Dashboard nutzt dafür die vorhandene `dcount`-Command-API mit `sendChat=0`.
- Übersicht/Sichtbare-Spieler-Anzeige berücksichtigt jetzt `selectedPlayerIds` plus `extraPlayerIds`.
- Styling für Zusatzspieler-Pills und Zusatzspieler-Steuerung ergänzt.
- Keine Backend-, Overlay-, Streamer.bot-, DB- oder Count-Migration.
