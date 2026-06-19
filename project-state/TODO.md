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
- [x] Berechtigungen für Engel/Roxxy/Broadcaster/Mods technisch umgesetzt.
- [x] `!shotdone` Dry-Run und Execute erfolgreich getestet.

## Shot-Alarm offen

- [ ] Finalen Post-Command-Countercheck nach `!shotdone` im Live-System noch einmal ausführen: `shotsOpen`, `shotsDrunk`, `shotsAddedTotal`, `lastError`.
- [ ] `!shotdone` im echten Twitch-Chat testen.
- [ ] Rechte in der Praxis prüfen: Engel/Roxxy, Broadcaster, Mod, nicht erlaubter User.
- [ ] Ko-fi/Tipeee Payment-Bus anbinden.
- [ ] Soundpool-Auswahl im Dashboard anbinden.
- [ ] Echte Shot-Sounds hinterlegen/testen.
- [ ] Persistente Counter nach Neustart planen.
- [ ] Statistik/History im Dashboard ausbauen.
- [ ] Overlay im OBS-Livebild prüfen und feinjustieren.
- [ ] Dashboard-Aktionen mit Rechte-/Audit-Konzept prüfen.
