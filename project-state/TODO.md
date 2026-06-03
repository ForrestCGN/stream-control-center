# TODO

## CAN-42 Diagnose-Standard

Erledigt:

```text
CAN-42.0 bis CAN-42.10: Zentrale Admin-Diagnose und Tagebuch-Diagnose-Seiten bereinigt/standardisiert.
CAN-42.11: Commands /status um standardisierten diagnostics-Block erweitert.
CAN-42.12: Hug /status um standardisierten diagnostics-Block erweitert.
CAN-42.12b: Dashboard-Anzeige für Hug-Version/Routen in zentraler Diagnose nachgezogen.
```

Offen:

```text
Message-Rotator auf diagnostics-Standard prüfen/angleichen.
VIP-System / VIP-Sound auf diagnostics-Standard prüfen/angleichen.
Media / Sound-System Detailstatus prüfen.
Alle Modulstatus langfristig mit diagnostics.ok/health/warnings/errors/counts vereinheitlichen.
Zentrale diagnostics.js später generisch erweitern, damit solche Display-Fixes nicht modulbezogen nötig sind.
```

Regeln bleiben verbindlich:

```text
Keine Funktionalität entfernen.
Bestehende produktive Routen nicht umbauen, wenn nur Diagnose angepasst wird.
Status-/Diagnose-Endpunkte bevorzugt read-only halten.
Dashboard-Diagnose bleibt zentrale Sammelstelle für Modulgesundheit.
```
