# CAN-42.26 Diagnose-Registry Planung

## Ziel

Die zentrale Dashboard-Diagnose soll ihre Modulliste künftig nicht mehr hart in `htdocs/dashboard/modules/diagnostics.js` pflegen. Stattdessen soll ein Backend-Endpunkt eine Registry liefern, aus der das Dashboard die Diagnose-Einträge automatisch aufbauen kann.

## Aktueller Zustand

Aktuell ist die Liste in `diagnostics.js` als statisches Array gepflegt. Das funktioniert, hat aber zwei Nachteile:

- Neue Module oder umbenannte Statusrouten müssen manuell im Frontend nachgetragen werden.
- Routen wie `VIP-System` können veralten, wenn das Backend geändert wird, z. B. `/api/vip/status` statt `/api/vip-sound/status`.

Nach CAN-42.24 ist `diagnostics.js` wieder die zentrale Datei für Liste, Auswahl, Statusladen und Standard-Diagnoseanzeige. Zusatz-Patcher sollen nicht mehr für Registry-/Dropdown-Logik genutzt werden.

## Gewünschter Zielzustand

Ein neuer GET-Endpunkt liefert eine strukturierte Diagnose-Registry:

```text
GET /api/diagnostics/registry
```

Beispiel-Antwort:

```json
{
  "ok": true,
  "module": "diagnostics_registry",
  "version": "0.1.0",
  "generatedAt": "2026-06-03T10:00:00.000Z",
  "entries": [
    {
      "key": "communication_bus",
      "label": "Communication-Bus",
      "group": "admin",
      "status": "/api/communication/status",
      "enabled": true,
      "source": "registry"
    },
    {
      "key": "obs",
      "label": "OBS",
      "group": "control",
      "status": "/api/obs/status",
      "enabled": true,
      "source": "registry"
    }
  ]
}
```

## Minimale Registry-Felder

Jeder Eintrag sollte mindestens enthalten:

```text
key       eindeutiger Frontend-Key
label     Anzeige im Dropdown
group     community/control/system/admin
status    GET-only Statusroute
enabled   ob der Eintrag angezeigt werden soll
source    registry/manual/module-meta
```

Optionale Felder:

```text
order          Sortierreihenfolge
priority       Wichtigkeit in Gesamtübersicht
module         Backend-Modulname, falls abweichend vom key
category       technische Kategorie
panelId        optionales Dashboard-Panel
routes         weitere read-only Zusatzrouten
notes          Hinweise
```

## Startliste aus aktuellem Stand

Diese Einträge sollen mindestens in der Registry landen:

```text
Birthday           /api/birthday/status
Todo               /api/todo/status
Tagebuch           /api/tagebuch/status
Hug-System         /api/hug/status
Commands           /api/commands/status
Message-Rotator    /api/message-rotator/status
Bus-Diagnose       /api/bus-diagnostics/status
Overlay-Monitor    /api/overlay-monitor/status
Sound-System       /api/sound/status
Medienverwaltung   /api/media/status
VIP-System         /api/vip-sound/status
Alerts             /api/alerts/status
Communication-Bus  /api/communication/status
OBS                /api/obs/status
```

## Umsetzungsvorschlag ohne Risiko

### Schritt 1: Backend-Endpunkt hinzufügen

Eine kleine neue Route im bestehenden Diagnostics-/Dashboard-Kontext oder in einem bestehenden Admin-/Diagnostics-Modul:

```text
/api/diagnostics/registry
```

Wichtig: Kein neues Modul, wenn ein bestehendes Diagnostics-Modul vorhanden ist. Wenn kein passendes Backend-Modul existiert, vorher entscheiden, ob ein kleines `diagnostics_registry`-Modul sinnvoll ist oder ob es in ein vorhandenes Diagnostics-Modul integriert wird.

### Schritt 2: Frontend-Fallback beibehalten

`diagnostics.js` behält zunächst die statische Liste als Fallback:

```text
Wenn /api/diagnostics/registry erreichbar:
  Registry verwenden
Sonst:
  statische READONLY_ENDPOINTS verwenden
```

So bleibt das Dashboard robust.

### Schritt 3: Dashboard lädt Registry einmal beim Öffnen

Beim Öffnen der Diagnose:

```text
loadRegistry()
loadAll()
render()
```

### Schritt 4: Validierung im Frontend

Das Dashboard akzeptiert nur sichere GET-only Einträge:

```text
status muss mit /api/ anfangen
key/label/status müssen vorhanden sein
doppelte keys werden verworfen oder überschrieben nach Priorität
```

### Schritt 5: Spätere automatische Erweiterung

Langfristig können Module ihre Statusroute über `MODULE_META` oder einen zentralen Registry-Helper anmelden. Für jetzt reicht eine zentral gepflegte Backend-Liste, damit nicht mehr das Frontend angepasst werden muss.

## Nicht-Ziele in CAN-42.26

```text
Keine Backend-Implementierung ohne gesondertes Go
Keine Datei-Löschung
Keine Statusrouten ändern
Keine Dashboard-Neustruktur
Keine Modul-/Helper-Umbenennung
Keine DB-Migration
```

## Empfohlener nächster Schritt

CAN-42.27: echten Backend-Dateistand prüfen und entscheiden, wo `/api/diagnostics/registry` am saubersten integriert wird.

Kandidaten:

```text
backend/modules/diagnostics.js
backend/modules/bus_diagnostics.js
neues Mini-Modul nur falls kein passender vorhandener Ort existiert
```

Vor Umsetzung prüfen:

```text
Welche Backend-Datei registriert aktuell /api/bus-diagnostics/status?
Gibt es schon ein generisches diagnostics backend module?
Welche Module exportieren MODULE_META mit routesPrefix/statusRoute?
```
