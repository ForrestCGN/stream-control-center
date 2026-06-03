# NEXT STEPS CAN-42.34

## Status

CAN-42.34 hat alle noch aktiv geladenen Dashboard-Extensions geprüft.

## Ergebnis

Keine weitere Datei wird jetzt gelöscht.

Behalten:

- `commands_readonly_diagnostics.*`
- `hug_diagnostics_ext.*`
- `message_rotator_diagnostics_ext.*`
- `bus_diagnostics_readonly_summary.*`
- `bus_diagnostics_subpage_safety_ext.*`
- `overlay_monitor_safety_ext.*`

## Warum behalten?

Die Dateien sind weiterhin aktiv geladen und liefern entweder:

- Read-only-Diagnosekarten,
- Safety-Hinweise,
- Markierung manueller Aktionen,
- oder erweiterte Fachdiagnose für komplexe Module.

## Nächster Schritt

CAN-42.35: Dauerhafte Dokumentation dieser bewusst behaltenen Extensions.

Dabei sollten dokumentiert werden:

- Zweck
- geladene Hauptseite
- Read-only-/Safety-Funktion
- späterer Integrationskandidat ja/nein
- keine Neuanlage solcher Dateien bei neuen Modulen ohne explizites Go

## Danach

Zurück zur fachlichen Modul-Arbeit.
