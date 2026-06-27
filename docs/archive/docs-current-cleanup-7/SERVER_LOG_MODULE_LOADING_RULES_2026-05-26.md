# Server-Log / Modul-Ladeprotokoll - Zielregel

Stand: 2026-05-26 / STEP481

## Ausgangspunkt

Im aktuellen Backend-Stand lädt `backend/server.js` Module aus `backend/modules/` und gibt bereits eine einfache Meldung wie `[module] loaded: <file>` aus. Das ist hilfreich, aber für Wartung und Debugging zu knapp.

## Ziel

Der Node-Server-Start soll künftig klarer anzeigen:

- welches Modul geladen wird,
- welcher Modulname erkannt wurde,
- welche Version erkannt wurde,
- welcher Route-/API-Prefix grob dazugehört,
- ob das Modul geladen, übersprungen oder fehlgeschlagen ist,
- wie viele Module erfolgreich/fehlerhaft/übersprungen wurden.

## Gewünschtes Logbild

```text
[module] loading: clip_shoutout.js
[module] loaded: clip_shoutout v0.2.10 routePrefix=/api/clip-shoutout status=ok
[module] skipped: twitch.js.bak_original_uploaded reason=not_js_runtime_module
[module] failed: example.js error=<message>
[server] modules loaded: 49 ok, 0 skipped, 0 failed
```

## Modul-Meta-Zielbild

Neue oder überarbeitete Module sollen perspektivisch eine maschinenlesbare Meta-Information bereitstellen, z. B.:

```js
module.exports.meta = {
  name: "example",
  version: "1.2.0",
  routePrefix: "/api/example",
  description: "Kurzbeschreibung"
};
```

Vor Einführung eines Standards muss geprüft werden, ob im Repo bereits ein besser passendes Meta-/Statusmuster existiert.

## Verbindung zum EventBus

Der EventBus soll perspektivisch nicht nur Nachrichten weiterreichen, sondern auch als zentrale Monitoring-/Überwachungsschicht dienen. Daher sollten Modul-Ladeinformationen später auch am Bus verfügbar sein:

- Modul registriert,
- Modul geladen,
- Modul fehlgeschlagen,
- Modulstatus,
- Modulversion,
- Heartbeat/Health,
- Warnungen/Fehler.

## Sicherheitsregeln

Nicht loggen:

- Secrets,
- Tokens,
- `.env`-Werte,
- Datenbankinhalte,
- komplette Config-Dumps,
- personenbezogene Runtime-Daten.

## Umsetzungshinweis

Dieser STEP ist nur Regelwerk/Doku. Die eigentliche Umsetzung gehört in einen späteren eigenen Code-STEP, z. B.:

`STEP482_SERVER_MODULE_LOGGING_AND_META`

Dabei zuerst prüfen:

- `backend/server.js`,
- `backend/modules/communication_bus.js`,
- vorhandene `module.exports`,
- vorhandene `version`/`moduleVersion`/`MODULE_VERSION`/`VERSION`/`MODULE_META`-Muster,
- Auswirkungen auf bestehende Modulinitialisierung.
