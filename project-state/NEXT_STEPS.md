# NEXT_STEPS

Stand: RDAP89_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN  
Datum: 2026-06-26

## Naechster Step

```text
RDAP90_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_DISABLED_BUILD_PLAN
```

## Ziel

```text
Minimalen Runtime-Accept-Code-Step planen.
Noch keine Actions.
Noch keine OBS-/Sound-/Overlay-/Command-Steuerung.
Keine Secret-Ausgabe.
```

## Ausgangspunkt RDAP89

```text
- RDAP88 hat korrekten Bearer sicher getestet.
- Korrekter Bearer liefert runtime_not_effectively_enabled.
- RDAP89 hat Runtime-Enable-Plan dokumentiert.
- AGENT_RUNTIME_ENABLED=true allein darf nicht reichen.
- Zwei-Stufen-Freigabe ist als Pflicht festgelegt.
- Heartbeat/Online/Actions bleiben getrennte Stufen.
```

## RDAP90 planen

```text
- Exakten zweiten Freigabeschalter definieren.
- Bestehenden disabled Guard erweitern oder fachlich sauber separieren.
- Keine parallele Struktur erfinden, wenn Erweiterung passt.
- Entscheiden, ob der erste Accept-Step nur WebSocket annimmt oder weiter reject-only bleibt.
- Tests fuer alle Ablehnungsgruende definieren.
- Tests fuer Secret-Safety definieren.
- Klare Rueckfall-/Deaktivierungsstrategie definieren.
```

## Strikt nicht machen

```text
Keine Agent-Actions in RDAP90.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine produktiven Writes.
Keine DB-Migration ohne separaten Plan.
Keine neue Permission ohne separaten Plan.
Keine produktive Agent-Action-Queue.
Keine Secret-Ausgabe.
```

## Admin-Notes

```text
Admin-Notes eingefroren.
Nur bei echtem Fehler wieder anfassen.
```
