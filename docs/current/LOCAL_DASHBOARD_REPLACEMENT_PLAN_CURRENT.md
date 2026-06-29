# Local Dashboard Replacement Plan Current

Stand: `RDAP_0.2.24_MEDIA_READONLY_FOUNDATION`

Remote-Modboard bleibt die einzige UI-Wahrheit. Das lokale `dashboard-v2` ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.

## Erreicht

```text
0.2.19: OBS-Seite als spaetere Mod-Bedienflaeche read-only vorbereitet.
0.2.20C: Online OBS-Live-State ueber Agent-WSS bestaetigt.
0.2.21: OBS Allowlist-/Rechte-Modell read-only vorbereitet.
0.2.22B: Online Inventory-Sync empfaengt echte OBS-Listen.
0.2.22C: Lokaler Inventory-Endpunkt liefert echte OBS-Listen.
0.2.22E: Lokal/online gleiche OBS Status-/Refresh-Logik vorbereitet.
0.2.23: OBS geparkt, Media-System als neuer Fokus dokumentiert.
0.2.24: Media-System read-only Foundation lokal und online vorbereitet.
```

## Media-Regel fuer Lokal/Online

```text
Lokal: Stream-PC kann spaeter echte Media-Ordner read-only inventarisieren.
Online: Webserver zeigt keine Fake-Dateien und bekommt lokale Media-Daten spaeter nur per Agent-WSS Memory-only Sync.
```

## Media 0.2.24 Grenzen

```text
GET /api/remote/media/status ist read-only.
Keine Uploads.
Keine Deletes.
Keine Edits.
Keine Dateiscans.
Keine DB-Migration.
Keine Agent-Actions.
```

## OBS-Stand

```text
OBS ist bei 0.2.22E geparkt.
```

## Naechster Ausbau

```text
RDAP_0.2.25_MEDIA_LOCAL_INVENTORY_READONLY
```

Ziel: lokale Media-Ordner sicher und begrenzt read-only anzeigen. Echte Schreibfunktionen erst spaeter mit Permission-Middleware, Audit und Confirm.
