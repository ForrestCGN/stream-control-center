# STEP515 - Channelpoints Redemption Completion Policy v0.9.4

## Ziel

Kanalpunkte-Einlösungen sollen nach der lokalen Ausführung optional an Twitch zurückgemeldet werden:

- erfolgreiche Ausführung -> `FULFILLED`
- Fehler oder blockierte Ausführung -> optional `CANCELED`

Damit können Punkte bei Fehlern zurückgegeben werden, statt eine Einlösung sofort beim Einlösen als erledigt zu markieren.

## Geänderte Dateien

- `backend/modules/channelpoints.js`
- `backend/modules/channelpoints_eventsub_bus_bridge.js` (unverändert mitgeliefert)
- `htdocs/dashboard/modules/channelpoints.js`
- `htdocs/dashboard/modules/channelpoints.css`

## Versionen

- Backend `channelpoints.js`: `0.9.4`
- Backend Build: `redemption-completion-policy`
- Dashboard UI: `1.0.2`
- Dashboard Build: `redemption-completion-policy-ui`

## Reward-Optionen im Dashboard

Im Reward-Editor gibt es nun diese Twitch-Optionen:

1. **Sofort bei Twitch abschließen**
   - setzt beim Twitch-Create/Update `should_redemptions_skip_request_queue`
   - Twitch markiert die Einlösung sofort als erledigt
   - eine spätere automatische Punkterückgabe per `CANCELED` ist dann nicht mehr vorgesehen

2. **Nach erfolgreicher Ausführung abschließen**
   - unser System setzt nach erfolgreicher lokaler Aktion die Redemption bei Twitch auf `FULFILLED`

3. **Bei Fehler Punkte zurückgeben**
   - unser System setzt bei Fehler oder Blockierung die Redemption bei Twitch auf `CANCELED`
   - Twitch gibt dadurch die Kanalpunkte zurück

4. **Twitch pausieren**
   - setzt `is_paused` beim Twitch-Update

## Speicherung

Es wird keine neue Tabelle angelegt.

Die Twitch-/Completion-Optionen werden in `channelpoints_rewards.action_payload_json` unter `twitch` gespeichert:

```json
{
  "twitch": {
    "background_color": "#9147FF",
    "should_redemptions_skip_request_queue": false,
    "fulfill_after_success": true,
    "cancel_on_failure": true
  }
}
```

`auto_fulfill` bleibt als bestehendes Kompatibilitätsfeld erhalten und steuert weiterhin `should_redemptions_skip_request_queue` mit.

## Ablauf

Empfohlener Standard für automatische Sound-/Overlay-Rewards:

```text
Sofort bei Twitch abschließen: AUS
Nach erfolgreicher Ausführung abschließen: AN
Bei Fehler Punkte zurückgeben: AN
```

Ablauf:

```text
Twitch EventSub
-> Communication Bus
-> channelpoints.js
-> lokale Aktion ausführen
-> bei Erfolg Twitch-Redemption FULFILLED
-> bei Fehler optional Twitch-Redemption CANCELED
-> Verlauf speichern
```

## Status

`GET /api/channelpoints/eventsub/redemption/status` zeigt nun zusätzlich Completion-Statistiken:

- `fulfilledOnTwitch`
- `canceledOnTwitch`
- `completionSkipped`
- `completionFailed`
- `lastCompletionAt`
- `lastCompletionAction`
- `lastCompletionStatus`

## Wichtig

- Keine neue DB-Migration.
- Keine neue Tabelle.
- Keine HTTP-Brücke zwischen Modulen.
- EventSub bleibt EventBus-getrieben.
- Twitch Reward Create/Update/Delete bleibt unverändert erhalten.
