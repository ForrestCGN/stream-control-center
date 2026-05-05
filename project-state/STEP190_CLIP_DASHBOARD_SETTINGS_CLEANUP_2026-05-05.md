# STEP190 - Clip Dashboard Settings Cleanup

Stand: 2026-05-05

## Ziel

Clip-Dashboard Settings auf sinnvolle Bedienfelder reduzieren.

## Betroffene Dateien

- `htdocs/dashboard/modules/clips.js`
- `htdocs/dashboard/modules/clips.css`

## Backend/DB

Keine Backend-Änderung.
Keine DB-Änderung.
Keine direkten Datei-/DB-Zugriffe im Dashboard.

## Änderung

Die normalen Settings-Gruppen wurden auf bedienbare Felder reduziert.

### Basis

- Clip-System aktiv
- Backend-Create aktiv
- Standard-Clip-Titel
- Game an eigenen Titel anhängen
- History speichern

### OBS Replay

- OBS Replay speichern
- OBS Save-Delay in ms
- Lokale Datei suchen/umbenennen
- Wartezeit nach OBS-Save in ms
- Replay-Ordner

### Discord

- Discord-Post aktiv
- Discord Channel-ID
- Nur posten, wenn Stream live ist

`discordChannelMode` und `discordChannelKey` bleiben Backend-/Legacy-/Import-Felder, werden aber nicht mehr in der normalen Dashboard-Bedienung angezeigt.

### Chat

- Startmeldung senden
- Ergebnisnachricht senden
- Chatantworten aktiv

### Erweitert

Technische Werte bleiben erreichbar, aber reduziert und klar markiert:

- Replay-Gesamtlänge
- Sekunden vor !clip
- Sekunden nach !clip
- Suchfenster lokale Datei
- Twitch Clip-Zielwert
- Twitch Polling-Abstand
- Twitch Polling-Versuche
- Duplikat-Regel

## Bewusst nicht umgesetzt

- Kein Backend-Umbau
- Keine Migration weg von JSON
- Keine Entfernung bestehender Backend-Funktionalität
