# Local Dashboard Replacement Plan - Current

Stand: 2026-06-28

Aktueller Stand: `0.2.16 - lokale OBS-Inventarquelle read-only vorbereitet`.

Remote-Modboard bleibt die einzige UI-Wahrheit. Das lokale Dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.

## Aktueller OBS-Stand

OBS ist im Remote-Modboard sichtbar und read-only.

0.2.15 hat die Inventarstruktur vorbereitet:

```text
inventory.prepared: true
inventory.active: false
scenes: []
sources: []
audioSources: []
counts: { scenes: 0, sources: 0, audioSources: 0, total: 0 }
```

0.2.16 bereitet die lokale OBS-Inventarquelle read-only vor:

```text
inventory.sourcePrepared: true
inventory.sourceMode: local_adapter_remote_agent_component_status
inventory.sourceRoute: /api/remote-agent/status
inventory.sourceField: componentStatus.obs.inventory
inventory.sourceActive: false
```

Die UI zeigt weiterhin den Inventarbereich fuer Szenen, Quellen und Audio. Der lokale Adapter kann spaeter read-only Inventarlisten aus `remote_agent`-Komponentenstatus anzeigen, sobald der Agent diese Daten separat liefert. Aktuell wird keine echte OBS-Inventar-Abfrage aktiviert.

## Sicherheitsgrenzen

```text
keine OBS-Kommandos
keine OBS-WebSocket-Requests im Online-Backend
keine Agent-Actions
keine Szenenwechsel
keine Mute-/Unmute-Aktionen
keine Quellen-Sichtbarkeit aendern
keine Media-Steuerung
keine Shell-/Datei-/Prozess-Actions
keine DB-Migration
keine produktiven Writes
```

## Naechste Richtung

Als naechster Code-Step kann eine echte lokale OBS-Inventar-Abfrage read-only separat geplant werden. Diese muss klar getrennt bleiben von OBS-Steuerung und Agent-Actions.
