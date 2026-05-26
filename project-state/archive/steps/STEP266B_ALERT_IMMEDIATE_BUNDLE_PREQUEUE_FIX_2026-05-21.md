# STEP266B - Alert Immediate Bundle Prequeue Self-Block Fix

Stand: 2026-05-21

## Ziel

Das Alert-System sollte Alert-Sound und optionale Alert-TTS moeglichst frueh als gemeinsames Sound-System-Bundle an das Sound-System uebergeben.

Vor STEP266B liefen Alert-Bundles zwar wieder, aber haeufig ueber den spaeteren Fallback-Pfad:

```text
fallback_process_queue_missing_prequeue
```

Dadurch bestand weiterhin das Risiko, dass mehrere Alerts mit TTS in engen Situationen nicht sauber als zusammengehoerige Bundle-Einheit sortiert werden.

## Ursache

Die Immediate-Prequeue setzte am Event:

```js
event.alertBundlePrequeue.pending = true
```

Direkt danach wurde `prepareAndSendAlertSoundBundle(...)` aufgerufen.

Diese Funktion hatte aber eine Schutzbedingung, die bei `pending === true` sofort abbrach:

```js
if (event.alertBundlePrequeue && event.alertBundlePrequeue.pending) {
  return { ok: false, reason: 'bundle_prequeue_still_pending' };
}
```

Damit blockierte sich der Immediate-Prequeue-Pfad selbst.

## Fix

Die Schutzbedingung wurde minimal erweitert:

```js
if (event.alertBundlePrequeue && event.alertBundlePrequeue.pending && options.allowPendingPrequeue !== true) {
  return { ok: false, reason: 'bundle_prequeue_still_pending' };
}
```

Der interne Immediate-Prequeue-Aufruf nutzt jetzt:

```js
allowPendingPrequeue: true
```

Damit bleibt die Schutzlogik fuer andere Aufrufer erhalten, aber der selbst gestartete Immediate-Prequeue darf seine eigene Arbeit ausfuehren.

## Geaendert

```text
backend/modules/alert_system.js
```

## Bewusst nicht geaendert

```text
app.sqlite
config/**
backend/modules/sound_system.js
Sound-System Bundle-Core
Streamer.bot-Flows
Overlay-HTML
```

## Tests

Manueller Funktionstest nach Deploy und Node-Neustart:

- Zwei Alerts hintereinander ausgelöst.
- Beide Alerts starteten sauber nacheinander.
- TTS wurde jeweils beim passenden Alert abgespielt.
- Der sichtbare Alert blieb bis nach TTS sichtbar.
- Erst nach Ende inklusive TTS startete der naechste Alert.
- `raw.soundSystem.bundled` war beim neuesten Test-Alert `true`.

## Aktueller Status

STEP266B ist als funktional stabiler Hotfix bestaetigt.

Der Code soll jetzt nicht weiter veraendert werden, solange keine neue Fehlersituation nachweisbar ist.

## Offener naechster Pruefpunkt

Weiter beobachten, ob bei mehreren echten Live-Alerts mit TTS wieder Vermischungen auftreten.

Besonders pruefen:

```text
Alert 1 Sound + TTS bleiben zusammen
Alert 2 Sound + TTS bleiben zusammen
Overlay startet erst mit dem richtigen Bundle-Sound
Naechster Alert startet erst nach Ende des vorherigen Bundles inklusive TTS
```

Wenn erneut Vermischung auftritt, zuerst nur Diagnose aus `api/alerts/events?limit=...` und `api/sound/status` sammeln. Nicht sofort Sound-System, Config, DB, Streamer.bot oder Overlay anfassen.
