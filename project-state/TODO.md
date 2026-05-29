# TODO

Stand: 2026-05-27

## Channelpoints

- [ ] Nach STEP527 prüfen, ob `channelpoints.js` wieder geladen wird.
- [ ] Neuen Reward anlegen und bestätigen: Twitch wird erstellt, aber inaktiv.
- [ ] Twitch Aktiv/Inaktiv-Schalter in Übersicht testen.
- [ ] Bestehenden aktiven Reward bearbeiten und prüfen: Aktivstatus bleibt erhalten.
- [ ] Bestehenden inaktiven Reward bearbeiten und prüfen: bleibt inaktiv.
- [ ] Offline-Twitch-Meldung bei Rewards mit `max_per_stream > 0` dokumentiert halten.

## Sound / Media

- [ ] `/api/sound/status` prüfen: `defaults.outputTarget=device`.
- [ ] Media-Dateinamen-Fix nur mit Real-STEP524 verwenden.
- [ ] Alte mojibake-Dateinamen nur gezielt reparieren, nicht pauschal löschen/verschieben.

## Doku / Projektstand

- [ ] Diese Doku nach erfolgreichem Test ggf. mit finalen Testergebnissen ergänzen.
- [ ] Bei Chatwechsel erneut `dokumentieren und aktualisieren` durchführen.


## TODO – STEP528 Overlay Health/Refresh

- [ ] Echte aktuelle Dateien prüfen: obs.js, scene_control.js, overlay_data.js, sound_system.js, ws-client.js, relevante Overlays.
- [ ] Vorhandene OBS-Refresh-Möglichkeiten ermitteln.
- [ ] Overlay-Heartbeat-Konzept definieren.
- [ ] Dashboard-Statuskarte für Overlay-Gesundheit planen.
- [ ] Refresh-Routen für einzelne Sources und Gruppen planen.
- [ ] Konfiguration für Overlay-Gruppen statt hart codierter Namen planen.
- [ ] Streamer.bot-kompatible GET-Fallbacks prüfen.
