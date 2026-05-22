# CURRENT_SYSTEM_STATUS

## Command-System

Aktueller Stand: STEP273C1.

Das Command-System besitzt nun:
- Backend-Core mit DB-Registry und Logs.
- Dashboard-Modul mit Tabs.
- Action-Typen.
- Modul-Command-Catalog über `/api/commands/catalog`.

Wichtige Regel:
Neue Module sollen künftig ihren Command-Katalog pflegen oder zentral im Command-System-Katalog ergänzt werden. Dadurch kann das Dashboard Modul-Actions per Kategorie/Dropdown anbieten, statt technische Routen manuell zu erraten.

Medienverwaltung ist noch nicht Teil dieses Steps und soll als zentraler Systembereich folgen.
