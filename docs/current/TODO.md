# TODO – stream-control-center

Stand: 2026-06-12

## Erledigt / bestätigt

- [x] CAN44.27 AutoShoutout an Communication Bus angebunden.
- [x] CAN44.28 AutoShoutout-Bus-Capability korrigiert.
- [x] CAN44.29 AutoShoutout-Subscriber im Loyalty-Stil umgesetzt und live bestätigt.
- [x] AutoShoutout-Buspfad live getestet: `autoBusReceived`, `autoBusDelivered`, `autoTriggered` steigen; `autoBusErrors` bleibt 0.
- [x] `forrestcgn`-Testeintrag per `clear-target` erfolgreich bereinigt.
- [x] Fehlerursache der alten Dashboard-Anzeige gefunden: sichtbare AutoShoutout-Karte kommt aus `shoutout_v2.js`, nicht aus `auto_shoutout.js`.
- [x] CAN44.30 kompakte AutoShoutout-Aktivitätsliste in `auto_shoutout.js` vorbereitet.
- [x] CAN44.31 Bridge/Patch für ShoutoutV2-Aktivitätskarte vorbereitet.
- [x] Doku/TODO/NEXT_STEPS/FILES/CURRENT_STATUS/CHANGELOG für CAN44.31 aktualisiert.

## Offen / als Nächstes

- [ ] CAN44.31 Dateien live prüfen: `window.AutoShoutoutV2ActivityPatch?.build` muss `CAN44.31_AUTOSO_V2_ACTIVITY_MODAL_BRIDGE` liefern.
- [ ] Dashboard Community → Shoutout → AutoShoutout prüfen: Aktivitätsliste muss Zeit/Streamer/Status/Info anzeigen.
- [ ] Info-Modal testen: Öffnen, Schließen, ESC, Rohdaten aufklappen.
- [ ] Eingetragenen Auto-Streamer mit `!lurk` testen.
- [ ] Prüfen, dass `autoBusErrors` bei 0 bleibt.
- [ ] Testweise eingetragenes `forrestcgn` aus AutoShoutout-Streamer-Liste entfernen/deaktivieren.
- [ ] Test-Events für `forrestcgn` bei Bedarf per `clear-target` bereinigen.
- [ ] CAN44.31 in GitHub/dev übernehmen/committen.
- [ ] `stepdone.cmd "CAN44.31 AutoShoutout V2 Activity Bridge"` ausführen, wenn live bestätigt.

## Später / Verbesserungen

- [ ] Bridge-Logik optional direkt in `shoutout_v2.js` integrieren.
- [ ] AutoShoutout-Aktivitätsstatus weiter eindeutschen.
- [ ] Activity-Modal um Copy-JSON-Button ergänzen.
- [ ] ShoutoutV2-Diagnose um Bus-Subscriber-Status ergänzen.
- [ ] AutoShoutout-Streamer-Verwaltung optisch an restliche ShoutoutV2-Tabellen angleichen.
- [ ] Prüfen, ob `auto_shoutout.js` langfristig noch eigenständig gebraucht wird oder nur als Patch-/Bridge-Modul dient.

## Nicht wieder einführen

- [ ] Capability `twitch.chat.message.consumer` für AutoShoutout-Bus-Subscription.
- [ ] Direkte AutoShoutout-Fachlogik in `twitch_presence.js`.
- [ ] Stumpfe Aktivitätsanzeige `triggered · triggered` ohne Streamer/Zeit/Info.
- [ ] Änderungen an Dashboard-Dateien ohne vorher zu prüfen, welche Datei die sichtbare Ansicht rendert.
- [ ] SQLite-Datenbank ersetzen/neu bauen.
- [ ] Funktionalität entfernen, nur um eine UI-Anzeige zu vereinfachen.
