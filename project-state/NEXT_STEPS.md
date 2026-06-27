# Next Steps

Stand: 2026-06-27

Naechster sinnvoller technischer Schritt:

```text
Version 0.2.6 - Lokale Statusdaten verbessert
```

Ziel:

1. Echte Dateien aus GitHub/dev lesen.
2. Bestehende lokalen Dashboard-Seiten weiterverwenden.
3. Read-only Statusdaten sicher anzeigen.
4. Keine Actions aktivieren.
5. Keine DB-Migration.
6. Keine neuen produktiven Writes.

Moegliche Datenquellen:

```text
/api/remote/status
/api/remote/agent/status
/api/remote/routes
```

Moegliche Verbesserungen:

- Stream-PC Status mit echten sicheren Feldern anzeigen,
- LAN/Zugriff mit aktuellem Runtime-Modus und LAN-Freigabe anzeigen,
- Start/Env-Hinweise lesbarer machen,
- Onlinebetrieb klar als `Onlinemodus` markieren,
- lokale Seiten bleiben `runtime: local`.

Geparkte Idee fuer spaeter:

```text
Kontrollierter Online-Sync lokaler Aenderungen
```

Diese Idee nicht sofort bauen. Erst lokales Dashboard read-only stabilisieren.
