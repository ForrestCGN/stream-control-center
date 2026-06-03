# CURRENT_STATUS

## Aktueller Arbeitsstand CAN-42.14c

CAN-42.14c vorbereitet: Generischer Dashboard-Diagnoseblock verwendet noch glattere deutsche Labels für Datenbank- und Statusfelder.

Änderung:

```text
htdocs/dashboard/modules/diagnostics_generic_details.js
```

Ergebnis:

- `DB Adapter` wird als `Datenbank-Typ` angezeigt.
- `DB Pfad` wird als `Datenbank-Pfad` angezeigt.
- `DB Schema` wird als `Datenbank-Schema` angezeigt.
- `DB Erwartet` wird als `Erwartetes Schema` angezeigt.
- `DB Fehler` wird als `Datenbank-Fehler` angezeigt.
- `Phase` wird als `Statusphase` angezeigt.
- Abschnittsüberschrift `Queue` wird als `Warteschlange` angezeigt.
- Abschnittsüberschrift `Runtime` wird als `Laufzeit` angezeigt.

Nicht geändert:

```text
backend/*
Statusrouten
DB
produktive Aktionen
Hug-/Command-/VIP-/Rotator-Logik
htdocs/dashboard/index.html
```

Keine Funktionalität entfernt.
