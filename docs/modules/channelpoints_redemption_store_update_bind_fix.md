# STEP512 Channelpoints Redemption Store Update Bind Fix v0.9.2

## Ziel

Behebt den Fehler `Unknown named parameter 'created_at'` beim Speichern echter Twitch-Kanalpunkte-Einlösungen nach EventBus-Ausführung.

## Ursache

Bei echten EventSub-Redemptions wurde der Reward bereits durch `executeReward()` ausgeführt und dabei lokal als Redemption eingetragen. Anschließend wollte `storeNormalizedRedemption()` denselben Eintrag aktualisieren. Für das UPDATE wurde jedoch das komplette Parameterobjekt inklusive `created_at` übergeben, obwohl `created_at` im UPDATE-SQL nicht verwendet wird. Der zentrale Datenbank-Wrapper lehnt ungenutzte Named-Parameter ab.

## Änderung

- `backend/modules/channelpoints.js` auf Version `0.9.2` / Build `redemption-store-update-bind-fix` gesetzt.
- UPDATE in `storeNormalizedRedemption()` nutzt jetzt ein eigenes `updateParams` ohne `created_at`.
- INSERT bleibt unverändert und nutzt weiterhin `created_at`.
- Keine neue Tabelle.
- Keine DB-Migration.
- Keine Dashboard-Änderung.
- EventBus-Flow aus STEP511 bleibt erhalten.

## Erwartung nach Test

Nach echter Twitch-Einlösung sollte `/api/channelpoints/eventsub/redemption/status` nicht mehr `Unknown named parameter 'created_at'` zeigen.

Erwartete Werte:

```text
received > 0
receivedFromBus > 0
stored > 0
executed > 0
failed = 0 fuer neue Events
```
