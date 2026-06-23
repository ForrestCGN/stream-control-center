# NEXT STEPS

Stand: DASHUI6C / dashboard-v2 Static Route  
Datum: 2026-06-23

## Nächster Schritt nach Installation

1. Installieren/deployen.
2. Lokalen Node neu starten.
3. Dashboard-v2 öffnen:

```text
http://127.0.0.1:8080/dashboard-v2/
```

4. Altes Dashboard gegenprüfen:

```text
http://127.0.0.1:8080/dashboard/
```

## Danach sinnvoll

```text
DASHUI7 / Erste read-only Statusseite mit echter API-Anbindung planen
```

Empfohlener Kandidat:

```text
Remote Agent Status
```

Regeln:

- zuerst read-only
- keine Speichern-/Start-/Stop-/Löschen-Aktion
- keine produktive Modulmigration
- keine Schreibfunktion ohne Permission/Lock/Audit
