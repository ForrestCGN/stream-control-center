# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.19 - lokale OBS-Inventar UI als Mod-Bedienflaeche read-only vorbereitet`.

Verbindlich:

```text
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales Dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI, keine separate lokale Navigation, kein eigenes lokales Design.
```

## Stand

0.2.18D bereitete den lokalen OBS-Inventar-Read ueber die vorhandene `obs_shared`-Verbindung vor.

0.2.19 richtet die OBS-Seite als spaetere Mod-Bedienflaeche aus:

```text
- Seitentitel: OBS Bedienung.
- Aktuelle OBS-Program-Szene wird prominent angezeigt.
- Produktive Szenen sind OBS-Szenen ohne fuehrenden Unterstrich `_`.
- Interne `_`-Szenen werden in der normalen Mod-Ansicht ausgeblendet.
- Audioquellen werden mit read-only Mute-Status angezeigt.
- Quellen erscheinen nur als kompakte Vorschau; komplette Technikdetails gehoeren spaeter in Admin / Diagnose.
- Rollen-/Rechte-Zielbild ist sichtbar vorbereitet: obs.read, obs.scene.switch, obs.audio.mute, obs.source.visibility.
- Es gibt weiterhin keine OBS-Steuerung, keine Agent-Actions und keine Writes.
```

## Architekturgrenzen

```text
- Webserver baut keine OBS-WebSocket-Verbindung auf.
- Echte lokale OBS-Inventardaten kommen nur ueber local_remote_modboard_adapter -> /api/remote-agent/status -> componentStatus.obs.inventory.
- Der lokale remote_agent nutzt fuer Inventar nur die bestehende obs_shared-Verbindung.
- Keine freien OBS-Payloads.
- Keine Set*-Requests im remote_agent fuer Inventar/UI.
```

## Lokal pruefen

```text
GET /api/remote-agent/obs/inventory/status
GET /api/remote-agent/status
GET /api/remote/local-dashboard/obs/status
/dashboard-v2/ -> System / OBS
```

Erwartung:

```text
- aktuelle Szene sichtbar
- produktive Szenen ohne `_` sichtbar
- interne `_`-Szenen nicht in der normalen Szenenliste
- Audioquellen read-only sichtbar
- keine Bedienbuttons, keine OBS-Actions
```

## Online pruefen

```text
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/local-dashboard/obs/status
```

Online bleibt OBS Placeholder/read-only. Die UI ist dennoch dieselbe Remote-Modboard-App.

Weiterarbeit: Danach kann ein separater Step das read-only Allowlist-/Rechte-Modell fuer spaetere OBS-Szenenwechsel planen. Keine produktiven OBS-Actions ohne separaten freigegebenen Step.
