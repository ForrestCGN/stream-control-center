# START HERE FOR NEW CHAT

Aktueller Stand: `RDAP_0.2.23_PARK_OBS_START_MEDIA_DOCS` - OBS ist bei `0.2.22E` geparkt, naechster Fokus ist Media-System im Remote-Modboard.

Verbindlich:

```text
GitHub/dev ist Wahrheit.
Vor Planung/Code echte Dateien aus GitHub/dev lesen.
Erst Plan nennen, dann auf explizites go warten.
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI.
```

## OBS-Stand beim Parken

```text
0.2.20C: Stream-PC-Agent verbindet per WSS; Heartbeat slim; OBS-Live-Szene kommt online an.
0.2.21: OBS Allowlist-/Rechte-Modell read-only vorbereitet.
0.2.22B: Online Inventory-Sync empfaengt echte OBS-Listen.
0.2.22C: Lokaler /api/remote-agent/obs/inventory/status liefert echte OBS-Listen.
0.2.22D: Live -> Wartet/Offline soll ohne Browser-Reload aktualisieren.
0.2.22E: Lokale und Online-OBS-Seite nutzen gleiche Anzeige-/Refresh-Logik.
```

Bestaetigte Werte:

```text
Online Inventory: scenes=19, sources=48, audioSources=35, total=102.
Lokales Inventory: scenes=19, sources=48, audioSources=35, total=102.
currentScene: Live Gameplay Forrest&Engel.
```

OBS bleibt geparkt. Offene OBS-Sichttests und spaetere Mod-UX-Korrekturen stehen in `project-state/PARKED_TODOS.md`.

## Neuer Fokus

```text
Media-System ins Remote-Modboard bringen.
```

Naechster Schritt:

```text
1. Echte Media-/Sound-/Dashboard-Dateien aus GitHub/dev lesen.
2. Bestehende Media-/Sound-Struktur aufnehmen.
3. Kleinen read-only Media-Modboard-Step planen.
4. Auf go warten.
```

## Sicherheitsgrenzen

```text
Keine OBS-Steuerung.
Keine Agent-Actions.
Keine produktiven Writes.
Keine DB-Migration.
Keine Shell-/Datei-/Prozess-Actions.
Keine freien OBS requestType Payloads.
Keine Media-Uploads oder Deletes ohne separaten freigegebenen Write-Step.
Keine Secrets in Logs, Status, UI oder Doku.
```
