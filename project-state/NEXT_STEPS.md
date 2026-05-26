# NEXT_STEPS

Stand: 2026-05-26 / nach STEP477

## Unmittelbar als nächstes

`STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE`

Vorgeschlagene Module:

1. `twitch.js`
2. `twitch_presence.js`
3. `discord.js`
4. `obs.js`
5. `scene_control.js`
6. `tagebuch.js`
7. `todo.js`
8. `message_rotator.js`
9. `hug.js`
10. `birthday.js`

## Danach

`STEP479_SHOUTOUT_DASHBOARD_TABS`

## Prüfhinweis

```bat
cd D:\Git\stream-control-center

dir docs\modules\clip-shoutout-vso-deep-dive.md

dir docs\moduleslerts-deep-dive.md

dir docs\modules\sound-system-deep-dive.md

dir docs\modulesip-sound-overlay-deep-dive.md

dir docs\modules\clips-deep-dive.md

dir docs\modules	ts-system-deep-dive.md
```

Keine JS-Dateien geändert, daher kein `node --check` nötig.

## Nach STEP478

1. Optional weiter reine Doku: `STEP479_MODULE_DOCS_SECONDARY_MODULES_DEEP_DIVE` für kleinere/sekundäre Module.
2. Danach Facharbeit am Shoutout-System: `STEP480_SHOUTOUT_DASHBOARD_TABS`.
3. Vor Shoutout-UI-Arbeiten echte Dashboard-Dateien aus GitHub/dev prüfen.

## Nächster Fach-STEP nach STEP479

```text
STEP480_SHOUTOUT_DASHBOARD_TABS
```

Ziel: Shoutout-Dashboard in Tabs/Unterbereiche aufteilen, nachdem die Doku-/Cleanup-Runde abgeschlossen ist.


## Nach STEP481

Direkter Fach-STEP bleibt weiterhin das Shoutout-System.

Zusätzlich als späterer Technik-Cleanup möglich:

`STEP482_SERVER_MODULE_LOGGING_AND_META`

Ziel: `backend/server.js` so erweitern, dass Modul-Ladezustand, Versionen und Prefixe kompakt geloggt werden und später an den EventBus/Monitoring angebunden werden können.
