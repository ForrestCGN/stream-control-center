# TODO – stream-control-center

Stand: 2026-06-18 – EVS52.14 getestet/stabil

## Bestätigt / erledigt

- [x] Echte produktive Chatquelle gefunden und zentral angebunden.
- [x] Sound- und Satz-System hängen an derselben normalisierten Twitch-Chatmessage.
- [x] `twitch.chat.message` kommt über Communication-Bus bei `stream_events` an.
- [x] Alte Direct-/Wildcard-Fallback-Wege aus EVS52.6–EVS52.8 wurden aus dem produktiven Runtime-Pfad entfernt.
- [x] Async-Command-Bug behoben: normale Chatmessages werden nicht mehr fälschlich als `!event` behandelt.
- [x] Bot-/Systemaccount-Self-Loop behoben.
- [x] Ignorierte Accounts aktuell: `heimaufsichtcgn`, `kofistreambot`, `streamstickers`, `streamelements`.
- [x] Echte Mods/Spieler bleiben spielberechtigt: `forrestcgn`, `engelcgn`, `roxxyfoxxycgn`, `tronic6`.
- [x] Punkte-Historie im aktuellen Event.
- [x] Sound- und Satz-/Text-Punkte werden gemeinsam addiert und getrennt angezeigt.
- [x] Soundantworten live getestet: `soundAnswerMatches=2`, `soundAnswerMisses=0`.
- [x] Satz-Teiltreffer live getestet.
- [x] Teiltreffer-Chatmeldungen nennen keine Satznummer/Satzzuordnung mehr.
- [x] Teiltreffer-Anzahl zählt eindeutige Wörter/Teile aus der Usernachricht, nicht Satz-Treffer.
- [x] Satzlösung live getestet: Chatmeldung, Punkte, Overlay.
- [x] Duplicate live getestet: bereits gelöster Satz wird nicht erneut gewertet.
- [x] Wartezeit überspringen live getestet.
- [x] Active-Event-Guard live geprüft: nur ein aktives Event.
- [x] Ranking/User-Historie geprüft.

## Offen / nächste sinnvolle technische Aufräumarbeiten

- [ ] Bot-/Systemaccount-Blockliste in Dashboard-Einstellungen verschieben.
- [ ] Textvarianten `text.word_hit.neutral.chat` im Dashboard/Textvarianten-System prüfen und pflegbar machen.
- [ ] Diagnosezähler `textWordHitChatOutputsBundled` prüfen, da er im letzten Test `0` blieb.
- [ ] Report-Feld `phraseSolves.points` prüfen, da Punkte im Chat/Ranking korrekt waren, aber im Report leer angezeigt wurden.
- [ ] Satzlösungs-Overlay optisch nachziehen: Text rechts/untere Zeile ist etwas knapp.
- [ ] Optional Satzstatus kurzzeitig nach Lösung/auf Button anzeigen, nicht dauerhaft.
- [ ] Doku-Altlasten rund um EVS52.6–EVS52.8 in älteren Testskripten prüfen und ggf. markieren/entfernen.

## Später / Feature-Ausbau

- [ ] Bot-/Self-Ignore-Liste dashboardfähig machen inklusive Rollen-/Owner-Rechte und Audit-Log.
- [ ] Satz-/Teiltreffer-Texte als Kategorien im zentralen Textvarianten-Editor pflegen.
- [ ] Dashboard-Testbereich für komplette Sound+Satz-Live-Simulation erweitern.
- [ ] Optional bessere Anzeige im Dashboard, welche Wörter/Sätze intern getroffen wurden, ohne es im Chat zu verraten.
- [ ] Optional detaillierten Testbericht im Dashboard anzeigen.

## Dauerhafte Regeln

- [ ] Nicht raten.
- [ ] Fehlende Dateien exakt anfordern.
- [ ] Keine Apply-/Patch-Scripte.
- [ ] Keine halben Teil-Dateien.
- [ ] Keine produktive DB ersetzen.
- [ ] ZIPs mit echten Zielpfaden ab Repo-Root.
- [ ] StepDone nach Einspielen, danach erst testen.
- [ ] Keine Funktionalität entfernen; ersetzte Diagnose-/Fallback-Altlasten nach Freigabe gezielt bereinigen.
