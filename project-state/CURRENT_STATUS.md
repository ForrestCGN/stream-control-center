# CURRENT_STATUS

## Stand: CAN-32.1 vorbereitet

CAN-32.1 ergänzt die Bus-Diagnose-Übersicht um eine kleine Sicherheits-/Read-only-Zusammenfassung.

## Aktueller Arbeitsbereich

```text
CAN-32: Dashboard/EventBus read-only Diagnose glätten
```

## Änderung CAN-32.1

Betroffene Dateien:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css
```

Wichtig:

```text
Die bestehende htdocs/dashboard/modules/bus_diagnostics.js bleibt unverändert.
Die Ergänzung wird nach bus_diagnostics.js geladen.
```

## Inhalt

Neue Karte in Bus-Diagnose > Übersicht:

```text
Sicherheits- / Read-only-Zusammenfassung
- Status read-only
- Recovery Route read-only
- Flow touched
- Queue touched
- Sound touched
- Overlay touched
- Recovery prepare
- Recovery execute
```

## Sicherheit

```text
Nur read-only Anzeige.
Nur GET /api/bus-diagnostics/status.
Nur GET /api/bus-diagnostics/recovery-preflight.
Keine produktiven Aktionen.
Keine Recovery-Ausführung.
Keine OBS-Aktion.
Keine Sound-/Queue-/Twitch-/DB-Aktion.
Keine Funktionalität entfernt.
```

## Erwartete Prüfung

```text
Dashboard öffnen.
Bus-Diagnose > Übersicht öffnen.
Karte "Sicherheits- / Read-only-Zusammenfassung" erscheint oben.
Werte zeigen "ja/nein".
Recovery execute bleibt nein / gesperrt.
```

## Nächster Schritt

```text
CAN-32.1 anwenden und Dashboard-Sichtprüfung machen.
```
