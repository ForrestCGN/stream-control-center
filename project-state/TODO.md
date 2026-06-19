# TODO

Stand: 2026-06-19

## Shot-Alarm erledigt

- [x] Backend-Modul `shot_alarm` erstellt.
- [x] Twitch-Support-Events über Communication Bus angebunden.
- [x] Finale Regeln für Subs/Resubs/GiftSubs/Bomben/Bits umgesetzt.
- [x] Bits-Blocklogik umgesetzt.
- [x] 10-Sekunden-Auslosungsphase umgesetzt.
- [x] Ergebnisaggregation statt Einzelwurf-Spam umgesetzt.
- [x] Offene/getrunkene/gesamt Counter umgesetzt.
- [x] Overlay-Statusleiste unten und kleine Ergebnis-Karte oben umgesetzt.
- [x] DB-Config via `module_settings` umgesetzt.
- [x] DB-Textvarianten via `module_text_variants` umgesetzt.
- [x] History-Tabelle `shot_alarm_history` angelegt.
- [x] Dashboard-Einordnung final korrigiert: `Community → Event-System → Shot-Alarm`.
- [x] Shot-Alarm-Texte im bestehenden Event-System-Texte-Dropdown verfügbar.
- [x] Shot-Alarm-Config im sicheren Config-Bereich-Dropdown verfügbar.
- [x] Event-System-Config bleibt vollständig erhalten.
- [x] `!shotdone` Command über bestehendes Command-/Chat-System angebunden.
- [x] Alias `!shotgetrunken` ergänzt.
- [x] Berechtigungen für Engel/Roxxy/Broadcaster/Mods umgesetzt.
- [x] Dashboard-/API-Audit für Shot-Alarm-Aktionen ergänzt.
- [x] Confirm-Schutz für kritische Aktionen ergänzt.
- [x] Ko-fi Payment-Bus-Event `payment.kofi.received` angebunden.
- [x] Tipeee Payment-Bus-Event `payment.tipeee.received` angebunden.
- [x] Ko-fi/Tipeee Testevents erreichen Shot-Alarm über den Bus.
- [x] History-ID-Fix gegen doppelte `shot_alarm_history.id` umgesetzt.
- [x] End-to-End-Test Payment → Shot-Alarm → `!shotdone` erfolgreich.

## Shot-Alarm offen

- [ ] Audit-Action-Namen vereinheitlichen: `shot_alarm.resolve_pending`.
- [ ] Echte Anbieter-Testevents über Ko-fi/Tipeee-Dashboard/Webhook prüfen, falls Webhooks aktiv sind.
- [ ] Echte Twitch-Chat-Tests mit `!shotdone` und `!shotgetrunken`.
- [ ] Soundpool-Auswahl im Dashboard an vorhandenes Sound-/Media-System anbinden.
- [ ] Echte Shot-Sounds hinterlegen/testen.
- [ ] Persistente Counter nach Neustart planen.
- [ ] Statistik/History im Dashboard ausbauen.
- [ ] Overlay im OBS-Livebild prüfen und feinjustieren.
- [ ] Dashboard-Aktionen später an zentrales Rechte-/Audit-Konzept anbinden, wenn final freigegeben.
