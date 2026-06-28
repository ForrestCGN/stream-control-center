# Local Dashboard Replacement Plan - Current

Stand: 2026-06-28

Aktueller Stand: `0.2.15 - OBS Inventar read-only vorbereitet`.

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

Die UI zeigt den Inventarbereich fuer Szenen, Quellen und Audio, aber ohne echte OBS-Abfrage.

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

Als naechster Code-Step kann eine lokale read-only OBS-Inventarquelle vorbereitet werden. Vorher muss entschieden werden, ob die Quelle ueber den lokalen Adapter oder ueber den Streaming-PC-Agent laufen soll.
