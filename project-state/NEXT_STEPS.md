# Next Steps

Stand: 2026-06-28

Naechster Schritt nach `0.2.11`:

```text
0.2.11 lokal testen und abschliessen.
```

Pruefen:

```text
- node --check .\backend\modules\local_remote_modboard_adapter.js
- /api/remote/local-dashboard/runtime-profile liefert ok=true.
- /api/remote/local-dashboard/runtime-profile zeigt ui.source=remote-modboard.
- agentExecutor.status=planned und active=false.
- rightsSync.status=planned und active=false.
- safety/readOnly bleibt true.
- /dashboard-v2/ zeigt weiter Remote-Modboard-Optik.
```

Danach sinnvoll:

```text
0.2.12 - Agent-Executor-Schnittstelle diagnostisch/read-only vorbereiten
```

Dabei beachten:

```text
- Remote-Modboard ist UI-Wahrheit.
- Dashboard-v2 lokal ist dieselbe App im lokalen Runtime-Profil.
- Mods nutzen immer https://mods.forrestcgn.de/.
- Forrest/Engel nutzen zuhause lokal und unterwegs online.
- Alles, was den Streaming-PC aktiv betrifft, laeuft am Ende ueber den Agent.
- User/Rechte duerfen lokal und online geaendert werden und muessen synchronisiert werden.
- Sperren/Entzug wirken online sofort.
```
