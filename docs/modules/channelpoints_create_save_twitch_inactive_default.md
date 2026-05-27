# STEP527 - Channelpoints Create Save Twitch Inactive Default

Version: Backend 0.9.13 / Dashboard 1.0.9

## Ziel

Neue Kanalpunkte-Rewards werden beim Speichern lokal angelegt und direkt als Twitch-Reward erstellt, aber standardmaessig nicht sichtbar/einloesbar gemacht.

## Verhalten

- Neuer Reward + Speichern:
  - lokal anlegen
  - Twitch-Reward erstellen/aktualisieren
  - Twitch `is_enabled=false`
- Bestehender Reward + Speichern:
  - lokal aktualisieren
  - Twitch-Reward aktualisieren
  - bisherigen Twitch-Aktivstatus beibehalten
- Uebersicht:
  - Aktiv/Inaktiv-Schalter steuert nur Twitch-Sichtbarkeit

## Grund

Der Editor soll kein eigenes Aktiv-Haekchen mehr haben. Speichern ist nur Speichern/Synchronisieren. Sichtbar/einloesbar wird ein Reward erst ueber den Twitch-Aktiv-Schalter in der Uebersicht.

## Checks

```bat
node --check backend\modules\channelpoints.js
node --check htdocs\dashboard\modules\channelpoints.js
```
