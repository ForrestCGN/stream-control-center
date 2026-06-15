# TODO – stream-control-center

Stand: 2026-06-15

## Sofort / vor Stream

- [ ] Letzten Dashboard-Code deployen/einspielen.
- [ ] `node -c` für betroffene JS-Dateien ausführen.
- [ ] Letzten StepDone ausführen, falls noch offen: `LC-DASHBOARD-TEXTS-4 Multi Module Text API`.
- [ ] Dashboard prüfen: Start, Core, Einstellungen, Texte, Logs.
- [ ] Testwerte kontrollieren und ggf. zurücksetzen:
  - [ ] Raid `maxAmount` wieder auf 250, falls 249 nur Test war.
  - [ ] `watch.amount` prüfen.
  - [ ] `subscriberMultiplier` prüfen.
  - [ ] `subscriberTierAmounts` prüfen.
- [ ] Loyalty Status prüfen.
- [ ] Twitch EventSub / twitch_events prüfen.
- [ ] Alert Shadow prüfen, aber nicht produktiv umschalten.

## Punkteimport

- [ ] Importquelle klären: CSV, JSON, SQLite, StreamElements Export oder anderes.
- [ ] Spalten/Felder prüfen.
- [ ] User-Matching festlegen: Twitch Login, Twitch User ID, DisplayName.
- [ ] Importmodus festlegen:
  - [ ] additiv als Transaktion
  - [ ] ersetzen nur wenn ausdrücklich erlaubt
- [ ] Dry-Run bauen.
- [ ] Backup/Snapshot vor echtem Import.
- [ ] Import mit Zusammenfassung/Audit ausführen.
- [ ] Nach Import Stichproben im Dashboard/Userkonto prüfen.

## Dashboard / Loyalty offen

- [ ] Start-Übersicht weiter kompakt verbessern: wenige Modul-Karten, keine Detailflut.
- [ ] Logs später um Giveaways und weitere Module erweitern, falls echte Datenquellen vorhanden.
- [ ] Texte: prüfen, ob alle Module sichere Varianten-IDs liefern.
- [ ] Texte: vorhandene Varianten nur dann bearbeitbar machen, wenn API sichere UID/ID liefert.
- [ ] Settings: weitere Modulbereiche erst anbinden, wenn echte Backend-Speicherung sicher ist.

## Alert-System offen

- [ ] Alert-Twitch-Events-Bus-Anbindung weiter im Shadow-Modus über mehrere Streams beobachten.
- [ ] Später ALERT-TWITCH-1C planen: alten Alert-Direktpfad diagnostisch sichtbar/schaltbar machen.
- [ ] Noch nicht: Alert produktiv auf Bus umstellen.
