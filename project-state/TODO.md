# TODO – stream-control-center

Stand: 2026-06-18 – EVS52.16

## Bestaetigt / erledigt

- [x] Chatquelle laeuft zentral ueber Twitch-Events/Communication-Bus zu `stream_events`.
- [x] Sound- und Satz-System nutzen dieselbe normalisierte Chatmessage.
- [x] EVS52.6 Direct-Bridge, EVS52.7 Presence-Direct-Bridge und EVS52.8 Wildcard-Fallback wurden aus dem Runtime-Pfad entfernt.
- [x] Keine zwei aktiven Events mehr ueber Dashboard-/Test-Start.
- [x] Skip-Wait funktioniert bei genau einem aktiven Event.
- [x] Bot-/Self-Filter verhindert Feedback-Loops durch `heimaufsichtcgn`, `kofistreambot`, `streamstickers`, `streamelements`.
- [x] EngelCGN, RoxxyFoxxyCGN, Tronic6 und ForrestCGN bleiben spielberechtigt.
- [x] Soundantworten werden erkannt und gewertet.
- [x] Satz-Teiltreffer werden erkannt und neutral gemeldet.
- [x] Teiltreffer-Chatmeldungen nennen keine Satznummer/Satz-Zuordnung.
- [x] Satzloesung, Overlay und Duplicate funktionieren.
- [x] EVS52.15 Report-/Diagnose-Cleanup: `textWordHitChatOutputsBundled` und `phraseSolves.points` korrigiert.
- [x] EVS52.16 Dashboard-Auswertungsbutton: Button ist nur sichtbar, wenn Auswertung wirklich moeglich ist.

## Offen / spaeter

- [ ] EVS52.16 nach Deploy testen: beendetes Event mit Ranking zeigt Button, nicht auswertbare Events zeigen keinen Button.
- [ ] Bot-/Ignore-Liste in Dashboard-Einstellungen verschieben.
- [ ] Textvarianten fuer Teiltreffer/Satzloesung dashboardfaehig bearbeiten/pruefen.
- [ ] Satzloesungs-Overlay optisch verbessern.
- [ ] Nach naechstem stabilen Teststand Doku/Handoff aktualisieren.

## Dauerhafte Regeln

- [ ] Nicht raten; echte Dateien pruefen.
- [ ] Fehlende Dateien exakt anfordern.
- [ ] Keine Apply-/Patch-Scripte.
- [ ] ZIPs mit echten Zielpfaden ab Repo-Root.
- [ ] StepDone nach Einspielen, danach testen.
- [ ] Keine produktive DB ersetzen oder blind migrieren.
