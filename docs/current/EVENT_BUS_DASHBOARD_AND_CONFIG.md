# Event-Bus Dashboard & Config

Stand: 2026-05-30

## Einordnung

Der bestehende Dashboard-Bereich `Bus-Diagnose` ist der zentrale Event-Bus-/Communication-Bus-Bereich. Er soll nicht als unsortierte Sammelseite wachsen, sondern nach Bedien- und Diagnosekategorien aufgebaut sein.

## Kategorien

```text
Uebersicht
Clients
Events & ACKs
Integrationen
Issues
Config
Rohdaten
```

## Config-Grundsatz

Event-Bus-Config gehoert in die zentrale Datenbankschicht:

```text
backend/core/database.js
aktuell SQLite: D:\Streaming\stramAssets\data\sqlite\app.sqlite
spaeter adapterfaehig fuer MySQL/MariaDB
```

Dashboard-Seiten greifen niemals direkt auf SQLite/Dateien zu, sondern nur auf Backend-APIs.

## API

```text
GET  /api/communication/settings
POST /api/communication/settings
POST /api/communication/settings/reset-defaults?confirm=1
```

Alias:

```text
GET  /api/event-bus/settings
POST /api/event-bus/settings
POST /api/event-bus/settings/reset-defaults?confirm=1
```

## Speicher

```text
Tabelle: communication_bus_settings
Modul: backend/modules/communication_bus_settings.js
```

## Aktueller Scope

Die Config wird DB-basiert gespeichert und im Dashboard bearbeitbar gemacht. Produktive Runtime-Uebernahme in den laufenden Communication Bus bleibt ein separater, bewusst geplanter Schritt.

## Nicht Teil dieses Stands

```text
OBS-Refresh
Overlay-Reparatur
produktiver Flow-Umbau
Sound-/Alert-/VIP-Umschaltung
Secrets/Tokens
Datenbankmigration aus dem Dashboard
```
