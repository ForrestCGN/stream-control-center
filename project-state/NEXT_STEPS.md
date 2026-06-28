# Next Steps

Stand: 2026-06-28

Naechster Schritt nach `0.2.10I`:

```text
0.2.10H lokal abschliessen: Sichttest und stepdone, wenn passend.
```

Pruefen:

```text
- CSS/JS laden sichtbar, keine nackte HTML-Seite.
- Dashboard-Szene wird angezeigt, nicht Login-Szene.
- Topbar/Sidebar/Layout entsprechen Remote-Modboard.
- /api/remote/local-dashboard/adapter/status zeigt assetFallback local-files oder upstream-redirect.
```

Danach nicht mehr lokale UI nachbauen.

## Naechste fachliche Planung

```text
0.2.11 - Architekturgrundlage fuer Runtime-Profil/Agent-Executor/User-Rechte-Sync vorbereiten
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
