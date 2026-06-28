# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.22E - Local/Online OBS Status Parity read-only, fast gut; spaeter in echten Situationen testen`.

Verbindlich:

```text
GitHub/dev ist Wahrheit.
Vor Planung/Code echte Dateien aus GitHub/dev lesen.
Erst Plan nennen, dann auf explizites go warten.
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI.
```

## Bestaetigter Stand

```text
0.2.20C: Stream-PC-Agent verbindet per WSS; Heartbeat slim; OBS-Live-Szene kommt online an.
0.2.21: OBS Allowlist-/Rechte-Modell read-only vorbereitet.
0.2.22B: Online Inventory-Sync empfaengt echte OBS-Listen.
0.2.22C: Lokaler /api/remote-agent/obs/inventory/status liefert echte OBS-Listen.
0.2.22D: Live -> Wartet/Offline soll ohne Browser-Reload aktualisieren.
0.2.22E: Lokale und Online-OBS-Seite nutzen gleiche Anzeige-/Refresh-Logik.
```

## Bestaetigte Werte

```text
Online Inventory: scenes=19, sources=48, audioSources=35, total=102.
Lokales Inventory: scenes=19, sources=48, audioSources=35, total=102.
currentScene: Live Gameplay Forrest&Engel.
```

## Datenklassen

```text
Heartbeat = klein/stabil, Verbindung/Agent-Zustand, ca. 30s.
Live-State = schnelle kleine Daten, aktuell OBS-Szene, ca. 500ms.
Inventory-Sync = Szenen/Quellen/Audio separat, read-only, ca. 30s.
```

## Sicherheitsgrenzen

```text
Keine OBS-Steuerung.
Keine Agent-Actions.
Keine produktiven Writes.
Keine DB-Migration.
Keine Shell-/Datei-/Prozess-Actions.
Keine freien OBS requestType Payloads.
Webserver baut keine OBS-WebSocket-Verbindung auf.
Live-State und Inventory-Sync nur in Memory.
```

## Noch zu testen

```text
OBS an/aus.
Agent an/aus.
Szenenwechsel.
OBS-Neustart.
Webserver-Neustart.
Lokal vs online.
Reload vs ohne Reload.
Inventory-Sync nach ca. 30s.
Live -> Wartet/Offline ohne Reload.
```

## Naechster sinnvoller Step

Erst nach Sichttest entscheiden. Wahrscheinlich: OBS-Seite sprachlich/mod-tauglich nachschaerfen oder naechster read-only Bedienvorbereitungs-Step. Keine OBS-Actions ohne separaten freigegebenen Control-Step.
