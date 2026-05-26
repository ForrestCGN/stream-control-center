# NEXT_STEPS

Stand: 2026-05-26 / nach STEP495

## Direkt testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/rewards"
```

Browser:

```text
http://127.0.0.1:8080/dashboard/
```

## Erwartung

- Community -> Kanalpunkte öffnet das Modul.
- Dashboard zeigt Tabs.
- Suche/Filter funktionieren.
- Reward-Liste links, Editor rechts.
- Lokales Aktivieren/Deaktivieren funktioniert weiterhin.

## Nächster sinnvoller Schritt

`STEP496_COMMANDS_DASHBOARD_ALIGNMENT`

Ziel: Command-Dashboard mit dem Kanalpunkte-Muster vergleichen und ggf. strukturell angleichen.
