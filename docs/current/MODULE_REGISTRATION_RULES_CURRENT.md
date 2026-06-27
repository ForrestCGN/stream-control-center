# Modulregistrierung - Remote-Modboard

Stand: 2026-06-27  
Gilt ab: `0.2.4 - Routes-Status angeglichen`

## Zweck

Diese Datei beschreibt, wie neue Remote-Modboard-Module und Seiten registriert werden sollen.

Ziel ist eine saubere, wartbare Navigation ohne Wildwuchs:

- Module geben selbst an, zu welchem Hauptbereich sie gehoeren.
- Neue Hauptmenuepunkte sind erlaubt, aber nur ueber das zentrale Modulmanifest.
- Runtime-Scope `online`, `local`, `both` ist Pflicht.
- Sprachtexte laufen ueber zentrale `languages`-Dateien.
- Frontend-Metadaten sind nur Anzeige/Navigation. Sicherheit bleibt Backend-Sache.

## Zentrale Datei

Standard fuer neue Module/Seiten:

```text
remote-modboard/backend/public/assets/modules/module-manifest.js
```

Diese Datei ist die zentrale Quelle fuer:

- Hauptmodule / Hauptmenuegruppen,
- Seiten unter einem Hauptmodul,
- sichtbare Labels,
- Sprachschluessel,
- Script-Pfade,
- Runtime-Scope,
- Permission-Hinweise.

## Hauptmodul registrieren

Ein Hauptmenuepunkt entsteht ueber einen Eintrag in `manifest.modules`.

Beispiel:

```js
{
  id: 'local-dashboard',
  labelKey: 'module.localDashboard.label',
  descriptionKey: 'module.localDashboard.description',
  label: { de: 'Lokales Dashboard', en: 'Local Dashboard' },
  description: { de: 'Lokale Stream-PC-/LAN-Ansichten.', en: 'Local Stream PC / LAN views.' },
  icon: '⌂',
  order: 40,
  runtime: 'local',
  permission: 'local.dashboard.read',
  navSubId: 'nav-local-dashboard'
}
```

Pflichtfelder:

```text
id
labelKey
label fallback
descriptionKey
runtime
permission
navSubId
order
```

Regel:

- Ein neuer Hauptmenuepunkt ist nur sinnvoll, wenn es fachlich ein eigener Bereich ist.
- Keine neuen Hauptmenues fuer einzelne Kleinfunktionen.
- Wenn ein bestehender Bereich passt, muss `moduleId` auf diesen bestehenden Bereich zeigen.

## Seite registrieren

Eine Seite entsteht ueber einen Eintrag in `manifest.pages`.

Beispiel:

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

Pflichtfelder:

```text
moduleId
pageId
labelKey
titleKey
descriptionKey
tabKey
fallback label/title/description/tab
order
runtime
permission
script
```

Antwort auf die zentrale Frage:

```text
Ja: Die Seite gibt mit moduleId selbst an, wo sie hingehoert.
```

Wenn `moduleId` auf ein vorhandenes Hauptmodul zeigt, erscheint die Seite dort. Wenn ein neuer Hauptmenuepunkt gebraucht wird, muss zusaetzlich ein passender Eintrag in `manifest.modules` vorhanden sein.

## Duerfen Module neue Menuepunkte anlegen?

Ja, aber kontrolliert.

Erlaubter Standard:

```text
Neuer Hauptmenuepunkt = neuer Eintrag in manifest.modules
Neue Seite darunter = neuer Eintrag in manifest.pages mit passender moduleId
```

Nicht gewuenscht:

- Module erzeugen ungefragt beliebige Navigation zur Laufzeit.
- Jede einzelne Funktion bekommt ein eigenes Hauptmenue.
- Menuepunkte werden nur in Modul-JS-Dateien versteckt registriert, ohne Manifest-Eintrag.

Technisch gibt es `window.RemoteModboardModules.registerModule()` und `registerPage()`. Das ist als Runtime-API vorhanden, soll aber nicht der normale Weg fuer feste Produktmodule sein. Feste Module gehoeren ins zentrale Manifest.

## Runtime-Scope

Jedes Modul und jede Seite muss einen Runtime-Scope angeben:

```text
online = nur Webserver-/Onlinebetrieb
local  = nur lokaler Stream-PC-/LAN-Betrieb
both   = in beiden Modi sichtbar/nutzbar
```

Der aktuelle Modus kommt aus:

```text
/api/remote/status.runtimeMode
/api/remote/status.localDashboardProfile.runtimeMode
```

Frontend-Regel:

- passender Scope: normal sichtbar,
- nicht passender Scope: markiert/deaktiviert/gesperrt sichtbar,
- echte Sicherheit bleibt Backend-Sache.

## Permission-Feld

`permission` ist Pflicht, aber im Frontend nur ein Hinweis.

Beispiel:

```text
admin.users.read
admin.connections.read
local.streamPc.status.read
remote.modules.read
```

Regel:

- Frontend darf daraus Navigation/Badges/Hinweise ableiten.
- Backend muss jede echte Route selbst pruefen.
- Ein sichtbarer Button oder Menuepunkt ist niemals eine Berechtigung.

## Sprachdateien

Neue Labels duerfen nicht dauerhaft hart im Modul verteilt werden.

Pfad:

```text
remote-modboard/backend/public/assets/languages/de.js
remote-modboard/backend/public/assets/languages/en.js
```

Namensmuster:

```text
module.<moduleId>.label
module.<moduleId>.description
page.<moduleId>.<pageId>.label
page.<moduleId>.<pageId>.title
page.<moduleId>.<pageId>.description
page.<moduleId>.<pageId>.tab
```

Keine kryptische `i18n`-Benennung. Im Projekt heisst es sichtbar `languages`.

## Script-Pfade

Modul-Scripte liegen unter:

```text
remote-modboard/backend/public/assets/modules/<bereich>/<seite>.js
```

Beispiel:

```text
remote-modboard/backend/public/assets/modules/local-dashboard/stream-pc-status.js
```

Der Manifest-Eintrag nutzt den Browserpfad:

```text
/assets/modules/local-dashboard/stream-pc-status.js
```

## Sicherheitsgrenze fuer neue Module

Ein neues Frontend-Modul darf nicht nebenbei aktivieren:

- DB-Migration,
- neue produktive Writes,
- Agent-Actions,
- OBS-Steuerung,
- Sound-Steuerung,
- Overlay-Steuerung,
- Command-/Channelpoints-Steuerung,
- Shell-/Datei-/Prozess-Actions,
- freie URL-Ausfuehrung.

Solche Funktionen brauchen immer einen separaten Scope mit Backend-Route, Permission, Confirm-Write, Audit, Lock, Backup/Rollback und Readback.

## Kurzregel

```text
Module sagen ueber moduleId/pageId, wo sie hingehoeren.
Neue Hauptmenues entstehen ueber manifest.modules.
Neue Seiten entstehen ueber manifest.pages.
Runtime-Scope und Permission sind Pflicht.
Sprachtexte gehoeren in languages.
Backend entscheidet Sicherheit.
```
