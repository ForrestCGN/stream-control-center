# Aktueller Remote-Modboard-Stand

Stand: 2026-06-27  
Aktuelle sichtbare Version: `0.2.5 - Lokales Dashboard vorbereitet`

## Live-Bestaetigung

Am 2026-06-27 wurde der Webserver-Livebetrieb bestaetigt:

```text
/api/remote/status
version: 0.2.5
buildName: Lokales Dashboard vorbereitet
moduleBuild: Lokales Dashboard vorbereitet
runtimeMode: online
visibleLabel: Onlinemodus
```

`localDashboardProfile` meldet:

```text
localDashboardMenuPrepared: true
localDashboardReadOnlyPagesPrepared: true
localDashboardPages:
- stream-pc-status
- lan-access
- start-env

actionsEnabled: false
productiveWritesEnabled: false
agentActionsEnabled: false
```

## Aktueller Funktionsstand

- Remote-Modboard UI ist modularisiert.
- Zentrales Modulmanifest ist Quelle fuer Hauptmenues, Seiten, Runtime-Scope und Permission-Hinweise.
- Zentrale Sprachdateien `languages/de.js` und `languages/en.js` sind vorbereitet.
- Runtime-Scope `online`, `local`, `both` ist vorbereitet.
- Hauptbereich `Lokales Dashboard` ist vorbereitet.
- Drei lokale read-only Seiten sind vorbereitet:
  - Stream-PC Status,
  - LAN / Zugriff,
  - Start / Env.

## Sicherheitsstand

Weiterhin nicht aktiviert:

- keine DB-Migration,
- keine neuen produktiven Writes,
- keine Agent-Actions,
- keine OBS-Steuerung,
- keine Sound-Steuerung,
- keine Overlay-Steuerung,
- keine Command-/Channelpoints-Steuerung,
- keine Shell-/Datei-/Prozess-Actions.

Frontend-Metadaten steuern Anzeige und Navigation. Backend-Routen bleiben fuer echte Rechte, Scope, Confirm-Write, Audit, Lock, Backup/Rollback und Readback massgeblich.
