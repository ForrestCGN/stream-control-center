# Local Dashboard Replacement Plan Current

Stand: `0.2.22E`

Remote-Modboard bleibt die einzige UI-Wahrheit. Das lokale `dashboard-v2` ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.

## Erreicht

```text
0.2.19: OBS-Seite als spaetere Mod-Bedienflaeche read-only vorbereitet.
0.2.20C: Online OBS-Live-State ueber Agent-WSS bestaetigt.
0.2.21: Allowlist-/Rechte-Modell read-only vorbereitet.
0.2.22B: Online Inventory-Sync empfaengt echte OBS-Listen.
0.2.22C: Lokaler Inventory-Endpunkt liefert echte OBS-Listen.
0.2.22E: Lokal/online gleiche Status-/Refresh-Logik vorbereitet.
```

## Datenmodell fuer Lokal/Online

```text
Heartbeat: klein/stabil, Verbindung/Agent-Zustand, ca. 30s.
Live-State: aktuelle OBS-Szene und spaeter kleine Live-Werte, ca. 500ms.
Inventory-Sync: Szenen/Quellen/Audio, separat, read-only, ca. 30s.
```

## Bestaetigt

```text
Lokal und online: 19 Szenen, 48 Quellen, 35 Audioquellen.
Aktuelle Szene: Live Gameplay Forrest&Engel.
```

## Grenzen

```text
Keine OBS-Steuerung.
Keine Agent-Actions.
Keine Writes.
Keine DB-Migration.
Keine freien OBS-Payloads.
Webserver baut keine OBS-WebSocket-Verbindung auf.
```

## Naechster Ausbau

Erst Sichttest mit echten Situationen. Danach Mod-UX sprachlich sauber machen oder naechsten read-only Bedienvorbereitungs-Step planen. Echte Steuerung erst spaeter in einem separat freigegebenen Control-Step.
