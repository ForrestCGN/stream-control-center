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
- [x] Testevent `10.000 Bits` erzeugt 1 sicheren Shot.
- [x] `!shotdone` wurde nach offenem Test-Shot erfolgreich ausgeführt.
- [x] Dashboard-/API-Audit für Shot-Alarm ergänzt.
- [x] Confirm-Schutz für kritische Shot-Alarm-Aktionen ergänzt.
- [x] Audit-Route `/api/shot-alarm/dashboard-audit` ergänzt.
- [x] Dashboard sendet `confirmWrite:true` bei kritischen Aktionen.
- [x] Audit-Test erfolgreich: erlaubte und verweigerte Aktion werden geloggt.

## Shot-Alarm offen

- [ ] Audit-Action-Namen vereinheitlichen: `shot_alarm.resolve_pending` statt Mischung aus `_` und `-`.
- [ ] `!shotdone` im echten Twitch-Chat testen.
- [ ] Rechte in der Praxis prüfen: Engel/Roxxy, Broadcaster, Mod, nicht erlaubter User.
- [ ] Ko-fi/Tipeee Payment-Bus anbinden.
- [ ] Ko-fi/Tipeee Testevents über echte Anbieter prüfen, sobald Bus-Publisher umgesetzt ist.
- [ ] Soundpool-Auswahl im Dashboard anbinden.
- [ ] Echte Shot-Sounds hinterlegen/testen.
- [ ] Persistente Counter nach Neustart planen.
- [ ] Statistik/History im Dashboard ausbauen.
- [ ] Overlay im OBS-Livebild prüfen und feinjustieren.
- [ ] Dashboard-Audit später ggf. an zentrales Audit-System anbinden, falls vorhanden/freigegeben.
