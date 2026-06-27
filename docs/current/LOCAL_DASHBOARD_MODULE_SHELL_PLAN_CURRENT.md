# Lokales Dashboard - Modul-Shell-Plan

Stand: 2026-06-27  
Gilt ab: `0.2.4 - Routes-Status angeglichen`  
Vorbereitet in: `RDAP126_LOCAL_DASHBOARD_MODULE_SHELL_PLAN`

## Zweck

Diese Datei plant den ersten lokalen Dashboard-Modulbereich fuer Stream-PC/LAN, ohne bereits Code oder produktive Aktionen zu aktivieren.

Ziel:

- lokalen Hauptbereich fuer spaetere LAN-Ansichten sauber definieren,
- erste read-only Seiten strukturieren,
- Modulregistrierungsregeln anwenden,
- Runtime-Scope `local` sauber nutzen,
- keine OBS-/Sound-/Overlay-/Command-/Shell-/Datei-/Prozess-Actions aktivieren.

RDAP126 ist bewusst ein Plan-/Doku-Step. Die eigentliche UI-Implementierung folgt erst in einem separaten Code-Step.

## Geplanter Hauptbereich

Neues Hauptmodul im Manifest:

```js
{
  id: 'local-dashboard',
  labelKey: 'module.localDashboard.label',
  descriptionKey: 'module.localDashboard.description',
  label: { de: 'Lokales Dashboard', en: 'Local Dashboard' },
  description: { de: 'Lokale Stream-PC- und LAN-Ansichten.', en: 'Local Stream PC and LAN views.' },
  icon: '⌂',
  order: 40,
  runtime: 'local',
  permission: 'local.dashboard.read',
  navSubId: 'nav-local-dashboard'
}
```

Regel:

- Dieser Hauptbereich erscheint nur im lokalen Runtime-Kontext.
- Im Onlinemodus darf er hoechstens als gesperrt/markiert sichtbar sein, wenn die UI das bewusst so darstellt.
- Sicherheit entscheidet spaeter weiterhin das Backend.

## Geplante Seiten

### 1. Lokaler Stream-PC Status

```js
{
  moduleId: 'local-dashboard',
  pageId: 'stream-pc-status',
  labelKey: 'page.localDashboard.streamPcStatus.label',
  titleKey: 'page.localDashboard.streamPcStatus.title',
  descriptionKey: 'page.localDashboard.streamPcStatus.description',
  tabKey: 'page.localDashboard.streamPcStatus.tab',
  label: { de: 'Stream-PC Status', en: 'Stream PC Status' },
  title: { de: 'Stream-PC Status', en: 'Stream PC Status' },
  description: { de: 'Lokaler Stream-PC Status read-only.', en: 'Local Stream PC status read-only.' },
  tab: { de: 'read-only', en: 'read-only' },
  order: 10,
  runtime: 'local',
  permission: 'local.streamPc.status.read',
  script: '/assets/modules/local-dashboard/stream-pc-status.js'
}
```

Zielinhalt spaeter:

- Runtime-Modus,
- lokaler Dashboard-Name,
- Host/Port-Hinweis,
- Agent-Verbindungsstatus read-only,
- Heartbeat-Alter, falls vorhanden,
- Sicherheitsstatus: Actions blockiert.

Darf nicht enthalten:

- OBS-Steuerung,
- Sound-/Overlay-Ausloeser,
- Shell-/Prozessbuttons,
- freie Dateiansicht,
- Secret-/Env-Dumps.

### 2. Lokale Verbindungen

```js
{
  moduleId: 'local-dashboard',
  pageId: 'lan-connections',
  labelKey: 'page.localDashboard.lanConnections.label',
  titleKey: 'page.localDashboard.lanConnections.title',
  descriptionKey: 'page.localDashboard.lanConnections.description',
  tabKey: 'page.localDashboard.lanConnections.tab',
  label: { de: 'LAN-Verbindungen', en: 'LAN Connections' },
  title: { de: 'LAN-Verbindungen', en: 'LAN Connections' },
  description: { de: 'Lokale Verbindungsuebersicht fuer Stream-PC und LAN.', en: 'Local connection overview for Stream PC and LAN.' },
  tab: { de: 'read-only', en: 'read-only' },
  order: 20,
  runtime: 'local',
  permission: 'local.connections.read',
  script: '/assets/modules/local-dashboard/lan-connections.js'
}
```

Zielinhalt spaeter:

- lokaler Modus aktiv/inaktiv,
- erlaubte CIDR-Bereiche nur als konfigurierte Zusammenfassung,
- Hinweis auf Forrest/Engel-LAN-Zielbild,
- kein Scan des Netzwerks,
- keine Client-IP-Liste als Pflichtfunktion.

### 3. Lokale Betriebs-Hinweise

```js
{
  moduleId: 'local-dashboard',
  pageId: 'local-runtime-help',
  labelKey: 'page.localDashboard.localRuntimeHelp.label',
  titleKey: 'page.localDashboard.localRuntimeHelp.title',
  descriptionKey: 'page.localDashboard.localRuntimeHelp.description',
  tabKey: 'page.localDashboard.localRuntimeHelp.tab',
  label: { de: 'Lokalbetrieb', en: 'Local Mode' },
  title: { de: 'Lokalbetrieb', en: 'Local Mode' },
  description: { de: 'Read-only Hinweise zu Env, Startprofil und Sicherheitsgrenzen.', en: 'Read-only notes for env, startup profile and safety boundaries.' },
  tab: { de: 'Hinweise', en: 'Notes' },
  order: 30,
  runtime: 'local',
  permission: 'local.runtime.help.read',
  script: '/assets/modules/local-dashboard/local-runtime-help.js'
}
```

Zielinhalt spaeter:

- sichere Kurzfassung von `REMOTE_MODBOARD_MODE=local`,
- sichere Kurzfassung der `SCC_AGENT_*` Variablen ohne Secrets,
- Link/Hinweis auf die Doku `LOCAL_STREAM_PC_ENV_START_PROFILE_CURRENT.md`,
- klare Sicherheitsgrenze.

## Sprachkeys

Neue Keys gehoeren in:

```text
remote-modboard/backend/public/assets/languages/de.js
remote-modboard/backend/public/assets/languages/en.js
```

Geplante deutsche Keys:

```text
module.localDashboard.label = Lokales Dashboard
module.localDashboard.description = Lokale Stream-PC- und LAN-Ansichten.

page.localDashboard.streamPcStatus.label = Stream-PC Status
page.localDashboard.streamPcStatus.title = Stream-PC Status
page.localDashboard.streamPcStatus.description = Lokaler Stream-PC Status read-only.
page.localDashboard.streamPcStatus.tab = read-only

page.localDashboard.lanConnections.label = LAN-Verbindungen
page.localDashboard.lanConnections.title = LAN-Verbindungen
page.localDashboard.lanConnections.description = Lokale Verbindungsuebersicht fuer Stream-PC und LAN.
page.localDashboard.lanConnections.tab = read-only

page.localDashboard.localRuntimeHelp.label = Lokalbetrieb
page.localDashboard.localRuntimeHelp.title = Lokalbetrieb
page.localDashboard.localRuntimeHelp.description = Read-only Hinweise zu Env, Startprofil und Sicherheitsgrenzen.
page.localDashboard.localRuntimeHelp.tab = Hinweise
```

Englische Keys analog vorbereiten.

## Datenquellen fuer spaetere Implementierung

Erlaubte read-only Quellen fuer den ersten UI-Code-Step:

```text
GET /api/remote/status
GET /api/remote/agent/status
GET /api/remote/routes
```

Diese Endpunkte duerfen nur gelesen werden. Keine neuen produktiven Writes.

## Permission-Namen

Geplante Frontend-/Backend-Permissions als Namensbasis:

```text
local.dashboard.read
local.streamPc.status.read
local.connections.read
local.runtime.help.read
```

Wichtig:

- Das Frontend darf diese Werte nur als Hinweis/Badge nutzen.
- Backend-Routen muessen bei echten Daten/Actions immer selbst pruefen.
- Ein sichtbarer Menuepunkt ist keine Berechtigung.

## Muss eine Seite selbst angeben, wo sie hingehoert?

Ja.

Eine Seite legt ueber `moduleId` fest, unter welchem Hauptmodul sie erscheint.

```text
moduleId: 'local-dashboard' -> unter Lokales Dashboard
pageId: 'stream-pc-status' -> konkrete Seite Stream-PC Status
```

Wenn ein bestehender Hauptbereich passt, wird dessen `moduleId` verwendet. Ein neuer Hauptmenuepunkt entsteht nur, wenn ein passender Eintrag in `manifest.modules` existiert.

## Duerfen Module neue Menuepunkte anlegen?

Ja, aber nur kontrolliert.

Standard:

```text
Neuer Hauptmenuepunkt -> manifest.modules
Neue Seite darunter   -> manifest.pages mit passender moduleId
```

Nicht Standard:

- einzelne Modul-JS-Dateien bauen heimlich Navigation,
- jedes Feature bekommt sein eigenes Hauptmenue,
- Runtime-Registrierung ersetzt das zentrale Manifest.

Die Runtime-API `window.RemoteModboardModules.registerModule()` und `registerPage()` bleibt fuer spaetere Plugin-/Sonderfaelle moeglich, ist aber nicht der normale Weg fuer feste Produktmodule.

## Sicherheitsgrenze

RDAP126 aktiviert nichts.

Nicht umgesetzt:

- keine Codeaenderung,
- kein neuer Menuepunkt live,
- keine neuen Frontend-Scripte,
- keine DB-Migration,
- keine neuen produktiven Writes,
- keine Agent-Actions,
- keine OBS-Steuerung,
- keine Sound-Steuerung,
- keine Overlay-Steuerung,
- keine Command-/Channelpoints-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- keine Firewall-Aenderung,
- kein Autostart,
- kein Windows-Dienst.

## Naechster sinnvoller Code-Step

```text
RDAP127_LOCAL_DASHBOARD_MODULE_SHELL_IMPLEMENTATION_READONLY
```

Ziel fuer RDAP127:

- Manifest um `local-dashboard` und drei lokale Seiten erweitern,
- Sprachdateien um Keys ergaenzen,
- drei minimale read-only Page-Scripte erstellen,
- Runtime-Scope `local` nutzen,
- keine Actions aktivieren,
- keine DB-Migration.
