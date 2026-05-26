# TODO

Stand: 2026-05-26

## Kanalpunkte – offen / später prüfen

### Hoch

- Completion Policy live gegen Twitch vollständig verifizieren:
  - Erfolgreiche Aktion → `FULFILLED`
  - Fehler/Blockierung → optional `CANCELED`
  - Punkte-Rückgabe in Twitch prüfen
- Prüfen, ob bei sofort abgeschlossenen Twitch-Redemptions kein unnötiger Fulfill/Cancel-Versuch passiert.

### Mittel

- UI-Begriffe für Abschlussoptionen im Dashboard weiter schärfen:
  - `Sofort bei Twitch abschließen`
  - `Nach erfolgreicher Ausführung abschließen`
  - `Bei Fehler Punkte zurückgeben`
- Alte Dashboard-Test-Redemptions optional später aus normalen Verlaufsausgaben ausblendbar machen.
- Encoding-/Dateipfad-Anzeige bei Umlauten prüfen:
  - `GewA_1_4rzGurke.mp3`
  - alte Anzeige `GewÃ¼rzGurke.mp3`
- Weitere Reward-Typen planen und jeweils klein testen.

### Niedrig

- Dashboard-Hilfetexte für Twitch-Farbe/Farbpresets bei Bedarf kürzen.
- EventBus-Diagnose für Kanalpunkte-Verarbeitung später im Bus-Dashboard sichtbarer machen.
- Später prüfen, ob Channelpoints-Modul eine maschinenlesbare `meta`-Struktur für Loader/Monitoring bekommen soll.

## Erledigt

- Gewürzgurke als erster echter Twitch Reward end-to-end getestet.
- EventBus-Flow für echte Twitch Redemptions funktioniert.
- Twitch Create/Update/Delete Foundation vorhanden.
- Farbauswahl mit Presets eingebaut.
