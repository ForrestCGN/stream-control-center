# STEP525 - Channelpoints Simplified Twitch Activation Flow v0.9.11

## Ziel

Das Dashboard trennt nicht mehr zwischen lokaler Aktivierung und Twitch-Aktivierung.

Neue Regel:

- Editor: kein separates Aktiv-Häkchen mehr.
- Speichern legt den Reward lokal an oder ändert ihn lokal und synchronisiert ihn direkt zu Twitch.
- Übersicht: Aktiv/Inaktiv-Schalter steuert nur Twitch-Sichtbarkeit/Einlösbarkeit.
- Lokale Spalte `system_enabled` bleibt intern aus Kompatibilitätsgründen bestehen, wird aber im Dashboard nicht mehr als Bedienkonzept verwendet.

## Backend

Datei:

- `backend/modules/channelpoints.js`

Änderungen:

- Version `0.9.11`, Build `simplified-twitch-activation-flow`.
- `POST /api/channelpoints/rewards` speichert lokal und führt danach Twitch Create/Update aus.
- `PUT/PATCH /api/channelpoints/rewards/:idOrKey` speichert lokal und führt danach Twitch Update/Create-Fallback aus.
- `POST /api/channelpoints/rewards/:idOrKey/enable` aktiviert/erstellt den Reward auf Twitch, ohne lokale Aktivierungslogik umzuschalten.
- `POST /api/channelpoints/rewards/:idOrKey/disable` deaktiviert den Reward auf Twitch, ohne lokale Aktivierungslogik umzuschalten.
- Fehlende lokale Aktion blockiert das Speichern/Synchronisieren zu Twitch nicht mehr. Sie blockiert nur weiterhin die lokale Ausführung einer Einlösung.

## Dashboard

Dateien:

- `htdocs/dashboard/modules/channelpoints.js`
- `htdocs/dashboard/modules/channelpoints.css`

Änderungen:

- Aktiv-Häkchen im Editor entfernt.
- Speichern-Button heißt nun sinngemäß `Speichern & zu Twitch synchronisieren`.
- `Speichern & aktivieren` entfällt.
- Übersicht zeigt `Twitch aktivieren` / `Twitch deaktivieren`.
- Statusfilter `Aktiv/Inaktiv` beziehen sich auf Twitch.

## Wichtig

Standardwerte bleiben:

```text
cooldown_seconds = 0
max_per_stream = 0
max_per_user_per_stream = 0
```

Wenn Twitch beim Speichern nicht erreichbar ist oder die Berechtigung fehlt, bleibt der lokale Reward gespeichert und die API liefert `twitchSync.ok=false` mit Fehlertext zurück.

## Check

```bat
cd D:\Git\stream-control-center
node --check backend\modules\channelpoints.js
node --check htdocs\dashboard\modules\channelpoints.js
.\stepdone.cmd "STEP525 Channelpoints Simplified Twitch Activation Flow v0.9.11"
```
