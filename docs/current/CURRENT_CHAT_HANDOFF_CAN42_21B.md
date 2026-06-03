# CURRENT CHAT HANDOFF CAN-42.21b

Aktueller Stand: CAN-42.21b vorbereitet.

Änderung: `diagnostics_generic_details.js` ergänzt die zentrale Dashboard-Diagnose um die fehlenden Einträge Communication-Bus und OBS. Die bestehende VIP-Sound-Route bleibt `/api/vip-sound/status`.

Nächster Test:

```powershell
.\stepdone.cmd "CAN-42.21b Dashboard diagnostics registry fix"
node -c htdocs\dashboard\modules\diagnostics_generic_details.js
```

Dann Dashboard hart neu laden und prüfen, ob im Dropdown zusätzlich vorhanden ist:

- Communication-Bus
- OBS

Folgeidee: automatische Diagnose-Registry aus Backend-Metadaten planen.
