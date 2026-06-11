# TODO – stream-control-center

Stand: 2026-06-11

## Erledigt / bestätigt

- [x] LWG-4Q.1 Paid Tickets buchen Loyalty-Punkte beim Ticket-Kauf.
- [x] LWG-4Q.2 / 4Q.2a Refund ist explizit steuerbar und idempotent.
- [x] LWG-4Q.3 Prepared Giveaway Cards sichtbar gemacht.
- [x] LWG-4Q.8 Routing weitgehend auf neues Giveaway-Control umgestellt.
- [x] LWG-4Q.9 / 4Q.9a Löschen = Hard-Delete, Archivieren nur kontrolliert; Transaction-Fix bestätigt.
- [x] LWG-4Q.10 API-Szenarien mit Classic, Paid, Claim und Wheel bestätigt.
- [x] LWG-4Q.11 Manual Winner Flow API-seitig bestätigt.
- [x] STEP209 / LWG-5.1 Loyalty Safety Layer + Gamble vorbereitet.
- [x] STEP210 / LWG-5.2 API-/Status-Cleanup vorbereitet.
- [x] STEP211 / LWG-5.3 Doku-/Projektstand für Loyalty Safety + Gamble Prepared aktualisiert.

## Offen / wichtig – Loyalty LWG-5

- [ ] STEP210 nach Übernahme per stepdone.cmd dokumentieren, falls noch nicht erledigt.
- [ ] STEP211 nach Übernahme per stepdone.cmd dokumentieren.
- [ ] Nach STEP210 Backend neu starten und Status kurz prüfen.
- [ ] `!punkte` / `!points` Runtime testen, noch ohne Command-Aktivierung.
- [ ] Prüfen, ob `!punkte` nur verfügbare Kekskrümel + Rang ausgibt.
- [ ] Prüfen, ob Ranking `rankTotal`/`total` dashboardfreundlich ausgegeben wird.
- [ ] Prüfen, ob `!punkte @user` für normale User blockiert und für Mod/Streamer erlaubt ist.
- [ ] Prüfen, ob `!givepoints` ab Mod korrekt vorbereitet ist.
- [ ] Prüfen, ob `!setpoint` nur Streamer/Owner erlaubt und Differenzbuchung nutzt.
- [ ] Textvarianten für Points/Gamble im Dashboard/Textsystem prüfen.
- [ ] Nach erfolgreichem Points-Test `!punkte` gezielt aktivieren.
- [ ] Gamble im Shadow-Modus mit Dummy-Usern testen.
- [ ] Gamble-Percent-Einsätze testen: z. B. `50%` von verfügbar.
- [ ] Gamble-Insufficient-Balance testen.
- [ ] Gamble-Cooldown testen.
- [ ] Gamble-Transaktionshistorie/Audit prüfen.

## Offen / wichtig – Giveaways/UI

- [ ] Dashboard-UI nach LWG-4Q.11 manuell sauber prüfen, aber nur noch in kleinen Einzelschritten.
- [ ] Prüfen, ob im Formular wirklich nicht mehr sichtbar sind: Gewinneranzahl, Gewinn-Menge, Rundenmodus, Ticket-Übernahme.
- [ ] Prüfen, ob Chat-Claim-Felder nur sichtbar sind, wenn Checkbox aktiv ist.
- [ ] Prüfen, ob bei Wheel-Giveaways die Gewinnpflege ausschließlich über den Glücksrad-/Bound-Wheel-Editor läuft.
- [ ] Prüfen, ob „Glücksrad erstellen“ nur bei fehlendem Bound-Wheel erscheint und „Glücksrad bearbeiten“ nur bei vorhandenem Bound-Wheel.
- [ ] Prüfen, ob Loyalty → Kachel Giveaways und oberer Tab Giveaways beide das neue Giveaway-Control öffnen.
- [ ] UI-Teststrategie vereinfachen: pro Test nur ein Giveaway erzeugen, genau einen UI-Punkt prüfen, danach löschen.
- [ ] Doku nach finalem UI-Test erneut aktualisieren.

## Nicht wiederholen

- [ ] Keine großen UI-assisted Scripts mehr, die mehrere fast gleiche Giveaways gleichzeitig erzeugen.
- [ ] Keine PowerShell-Scripts mit ungetesteter JS-Syntax wie `||`.
- [ ] Keine Annahmen über Backend-Abläufe treffen, wenn ein API-Test das echte Verhalten zeigen kann.
- [ ] Keine Aktivierung aller Commands auf einmal.
- [ ] Keine Tests mit kompletten JSON-Dumps, wenn gezielte Felder reichen.
