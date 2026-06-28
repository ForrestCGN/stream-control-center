# Local Dashboard Replacement Plan Current

Stand: 2026-06-28, `0.2.17`.

Remote-Modboard bleibt die einzige UI-Wahrheit. Lokales Dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.

## 0.2.17

Der lokale `remote_agent` kann OBS-Inventar read-only lesen, aber nur wenn lokal explizit aktiviert:

```text
STREAMING_PC_OBS_INVENTORY_READ_ENABLED=true
STREAMING_PC_OBS_PASSWORD=<optional, nur falls OBS Auth verlangt>
```

Default: deaktiviert.

Read-only Requests:

```text
GetSceneList
GetInputList
GetInputMute
GetCurrentProgramScene
```

Keine Steuerung:

```text
keine Szenenwechsel
keine Mutes setzen
keine Source-Visibility setzen
keine Media-Steuerung
keine Agent-Actions
keine Writes
```
