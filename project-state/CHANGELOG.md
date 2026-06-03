# Changelog

## CAN-42.32

- Dokumentation für den bereinigten Diagnose-/Registry-Stand aktualisiert.
- Verbindliche New-Module-Regel ergänzt: neue Module müssen direkt auf Statusroute, `diagnostics`-Block und Registry-Coverage geprüft werden.
- Master-Prompt-Ergänzung für neue Module vorbereitet.
- Keine Backend-Logik geändert.
- Keine Dashboard-Logik geändert.
- Keine produktiven Flows geändert.

## CAN-42.31

- Cleanup-Verifikation für alte Dashboard-Diagnose-Dateien ergänzt.
- Repo und Live wurden nach Cleanup bestätigt: keine alten Dateien und keine alten Referenzen mehr vorhanden.

## CAN-42.30

- Alte, nicht mehr geladene Dashboard-Diagnose-Dateien entfernt.
- Entfernte Kandidaten u. a. `diagnostics_generic_details.js`, `diagnostics_hug_display_fix.js`, alte `*_readonly_diagnostics.*` Dateien.

## CAN-42.29

- Registry-/Coverage-Anzeige im Dashboard verständlicher gemacht.

## CAN-42.28 / CAN-42.28b

- Registry-Coverage ergänzt.
- Normalisierung für geladene Modulnamen korrigiert.

## CAN-42.27

- Backend-Registry-Endpunkt `GET /api/diagnostics/registry` eingeführt.
- Dashboard lädt Diagnose-Liste aus Registry mit lokalem Fallback.
