# Local Dashboard Replacement Plan Current

Stand: `0.2.20C`

Remote-Modboard bleibt die einzige UI-Wahrheit. Das lokale `dashboard-v2` ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.

## Erreicht

```text
0.2.19: OBS-Seite als spaetere Mod-Bedienflaeche read-only vorbereitet.
0.2.20: Online OBS-Live-State ueber Agent-WSS vorbereitet.
0.2.20B: Heartbeat abgespeckt; Live-State separat schnell gehalten.
0.2.20C: Scene-Mapping korrigiert; Online-Live-Szene bestaetigt.
```

## Datenmodell fuer Lokal/Online

```text
Heartbeat:
- klein
- stabil
- Verbindung/Agent-Zustand
- ca. alle 30 Sekunden

Live-State:
- schnell
- aktuelle OBS-Szene und spaeter weitere kleine Live-Werte
- ca. alle 250-500 ms
- online nur in Memory

Inventory:
- groessere Listen
- Szenen, Quellen, Audioquellen
- langsam/manuell oder selten
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

OBS-Allowlist-/Rechte-Modell read-only vorbereiten. Echte Steuerung erst spaeter in einem separat freigegebenen Control-Step.
