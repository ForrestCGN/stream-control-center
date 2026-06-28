# Changelog

## Version 0.2.10I - Modboard Online/Lokal Architekturregel dokumentiert

- Doku-only: Architekturentscheidung fuer Online-/Lokalbetrieb festgehalten.
- Zielbild dokumentiert: eine UI, zwei Zugangswege, ein Agent als zentraler Executor fuer Streaming-PC-Aktionen.
- Zugangsregel dokumentiert:
  - Mods immer ueber `https://mods.forrestcgn.de/`,
  - Forrest/Engel zuhause lokal ueber `/dashboard-v2`,
  - Forrest/Engel unterwegs online ueber `https://mods.forrestcgn.de/`.
- UI-Regel verschaerft: Remote-Modboard ist einzige UI-Wahrheit; lokales Dashboard-v2 ist dieselbe App im lokalen Runtime-Profil.
- Agent-Regel dokumentiert: Alles, was den Streaming-PC aktiv betrifft, laeuft am Ende ueber den Stream-PC-Agent.
- User/Rechte-Sync dokumentiert: lokale und online Aenderungen werden synchronisiert; Sperren/Entzug wirken online sofort.
- Keine Codeaenderung, keine DB-Migration, keine produktiven Writes, keine neuen Agent-/OBS-/Sound-/Overlay-/Command-Actions.
