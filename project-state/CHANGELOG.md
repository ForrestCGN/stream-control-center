# CHANGELOG

## CAN-42.13

Message-Rotator Status-Diagnostics vorbereitet.

Geändert:

```text
backend/modules/message_rotator.js
```

Änderungen:

```text
MODULE_VERSION 0.1.0 -> 0.1.1
MODULE_BUILD diagnostics-standard ergänzt
MODULE_META.build ergänzt
/api/message-rotator/status liefert zusätzlich module/moduleVersion/moduleBuild/version/routes/routeCount/dataEndpoints/diagnostics
module.exports.getStatus ergänzt
```

Der neue `diagnostics`-Block ist read-only und enthält Counts, Runtime-, Config-, Settings-/Datenbank-, Warnungs- und Fehlerdaten.

Keine Rotator-Ausführung, keine Chat-Ausgabe, keine Start-/Stop-/Tick-/Next-/Manual-Logik, keine DB-Migration und keine Funktionalität entfernt.
