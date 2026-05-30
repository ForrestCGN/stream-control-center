# Event-Bus Overlay-Clients – aktueller Status

Stand: 2026-05-30  
Gültiger Stand: STEP618B

## Ziel

Im Event-Bus-/Bus-Diagnose-Bereich soll primär sichtbar sein, ob Overlays verbunden sind.

Der relevante Dashboard-Pfad ist:

```text
Admin → Bus-Diagnose → Clients
```

## Quelle

Die Anzeige basiert auf der Communication-Bus-Client-Registry:

```text
GET /api/communication/status
→ status.clients
```

## Overlay-Erkennung

Ein Client gilt nur dann als Overlay, wenn mindestens eine dieser Bedingungen zutrifft:

```text
client.type == "overlay"
client.id beginnt mit "overlay:"
client.mode == "overlay"
```

Nicht mehr gültig:

```text
client.module enthält "overlay"
client.name enthält "overlay"
client.capabilities enthalten "overlay"
```

Grund: Backend-Module wie `module:overlay_monitor` dürfen nicht als Browser-/Overlay-Client gezählt werden.

## Dashboard-Anzeige

Der Clients-Tab zeigt oben eine Overlay-Zusammenfassung:

```text
Overlays gesamt
Online
Stale
Offline
Dead
Ignored/Sonstige
```

Darunter eine Overlay-Tabelle mit:

```text
Overlay-ID
Status
Modul/Version
Heartbeat
Kontakt/Grund
Capabilities
```

## Bekannte Einschränkung

Nur Overlays, die sich tatsächlich beim Communication Bus registrieren, erscheinen in dieser Übersicht.

Ein Overlay ohne Bus-Client-Skript oder ohne `hello`/Heartbeat ist dort nicht sichtbar.

## Nicht Teil dieses Stands

```text
OBS-Browserquelle prüfen
OBS-Refresh
Overlay automatisch reparieren
Runtime-Config anwenden
produktive Alert-/Sound-/VIP-Umschaltung auf Bus
```
