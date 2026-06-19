# TODO

Stand: 2026-06-19

## Shot-Alarm erledigt

- [x] Backend-Modul `shot_alarm` erstellt.
- [x] Twitch-Support-Events über Communication Bus angebunden.
- [x] Regeln für Subs/Resubs/GiftSubs/Bomben/Bits umgesetzt.
- [x] Ko-fi/Tipeee Payment-Bus an Shot-Alarm angebunden.
- [x] 10-Sekunden-Auslosungsphase umgesetzt.
- [x] Ergebnisaggregation statt Einzelwurf-Spam umgesetzt.
- [x] Offene/getrunkene/gesamt Counter umgesetzt.
- [x] `!shotdone` / `!shotgetrunken` Command angebunden.
- [x] Dashboard-Audit/Safety für kritische Schreibaktionen ergänzt.
- [x] History-ID-Konflikt behoben.
- [x] Audit-Action-Namen bereinigt.
- [x] Dashboard-Einordnung korrigiert: `Community → Event-System → Shot-Alarm`.
- [x] Shot-Alarm-Texte im bestehenden Event-System-Texte-Dropdown verfügbar.
- [x] Shot-Alarm-Config getrennt und sicher verfügbar.
- [x] Dashboard-Subtabs Status/Logs/Statistik/Overlay/Sounds ergänzt.
- [x] Shot-Log/Statistik aus Safety/Audit getrennt.
- [x] Overlay auf Topbar/DeathCounter-Stil umgebaut.
- [x] Overlay blendet produktiv nur bei aktivem Shot-Alarm und Live-Status ein.
- [x] Offline-Testfenster per `?force=1` ergänzt.
- [x] Overlay-Heartbeat für Monitor ergänzt.
- [x] Sounds über Media-System/Sound-System eingebunden.
- [x] Zufällige Soundliste für Shot-Ergebnis-Sounds umgesetzt.
- [x] Sound-System-Queue wird genutzt.
- [x] Shot-Sounds laufen mit `target=both`, `outputTarget=device`, `category=alert`.
- [x] Overlay-Hold bis Sounddauer + Puffer umgesetzt.
- [x] Test-Auslösung resolved wieder sauber und bleibt nicht bei `draw_started` hängen.
- [x] Frische Shot-Session als manueller Fallback ergänzt.
- [x] Automatische Anbindung an zentrale Twitch-Stream-Session-Events ergänzt.
- [x] Override-Test bestätigt: Shot-Alarm übernimmt zentrale Session-ID.

## Shot-Alarm offen / nächste Prüfungen

- [ ] Echte Twitch-Stream-ID beim Abendstream prüfen.
- [ ] Nach Live-Start prüfen, ob Shot-Alarm automatisch die neue echte `streamSessionId` übernimmt.
- [ ] Prüfen, dass alte Test-Shots nicht in die neue Live-Session laufen.
- [ ] Shot-Alarm im Livebetrieb starten und ein kontrolliertes Test-Event prüfen.
- [ ] Event-/Overlay-Queue für mehrere schnelle Support-Events prüfen/absichern.
- [ ] Statistik/History weiter streamerfreundlich ausbauen.
- [ ] Dashboard-Rechte/Rollen langfristig an Benutzerverwaltung anbinden.
- [ ] Falls nötig: `ending`-Status zusätzlich hart blockieren, falls dieser je wieder als live sichtbar bleibt.

## Nicht vergessen

Bei weiteren Steps immer aktuelle echte Dateien/ZIPs als Source of Truth verwenden. Keine parallelen Strukturen und keine Funktionalität entfernen.
