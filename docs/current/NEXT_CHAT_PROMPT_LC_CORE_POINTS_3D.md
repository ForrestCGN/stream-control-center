# NEXT CHAT PROMPT – stream-control-center / LC-CORE-POINTS-3D

Wir machen mit dem Projekt `stream-control-center` für ForrestCGN weiter.

Bitte arbeite auf Deutsch, ruhig, direkt und strikt schrittweise.

Wichtig: Erst prüfen, dann planen, dann auf mein ausdrückliches `go` warten. Keine Umsetzung ohne `go`.

Bitte zuerst lesen/berücksichtigen:

- `docs/current/CURRENT_CHAT_HANDOFF_LC_CORE_POINTS_3D_DOCUMENTED.md`
- `docs/current/CURRENT_STATUS.md`
- `docs/current/TODO.md`
- `docs/current/NEXT_STEPS.md`
- `docs/current/FILES.md`
- `docs/current/CHANGELOG.md`
- `MASTER_PROMPT_stream_control_center_CLEAN_2026-06-15.txt`

Projektbasis:

```text
GitHub: ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-System: D:\Streaming\stramAssets
Dashboard: http://127.0.0.1:8080/dashboard
Produktive SQLite: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Harte Regeln:

```text
- GitHub/dev und echte Dateien sind Single Source of Truth.
- Keine Funktionalität entfernen.
- Keine Datenbank ersetzen oder neu bauen.
- Keine Apply-/Patch-/Regex-/Set-Content-Scripte.
- Änderungen nur als vollständige Ersatzdateien mit echten Zielpfaden im ZIP.
- Nach Datei-/Doku-ZIP StepDone nennen.
- Vor Umsetzung erst Dateien prüfen, Ziel/Dateien/Änderungen/Nichtänderungen/Tests nennen und auf go warten.
```

Aktueller bestätigter Stand:

```text
LC-CORE-POINTS-3B: live bestätigt
LC-CORE-POINTS-3C: live bestätigt
LC-CORE-POINTS-3C1: Hotfix bestätigt
LC-CORE-POINTS-3D: live bestätigt
```

Kurzstand:

```text
- twitch_events ist jetzt produktiver zentraler Weg für Loyalty-Bonus-Events.
- loyalty.js Version 0.1.17 nutzt 7 gezielte Bus-Subscriptions.
- twitch.js Version 0.1.9 leitet Support-EventSub-Events an twitch_events weiter.
- Legacy EventSub→Loyalty Direktforward ist standardmäßig deaktiviert.
- Notfall-Fallback per TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD=true bleibt möglich.
```

Bestätigter Live-Test:

```text
channel.cheer / akighosty
supportEvents.forwarded = 1
loyalty.received = 1
loyalty.processed = 1
loyalty.skipped = 0
legacy.forwarded = 0
legacy.skipped = 1
errors/failed = 0
```

Nächster sinnvoller Schritt:

```text
LC-CORE-POINTS-3E – weitere echte Eventtypen prüfen und entscheiden, ob der deaktivierte Legacy-Direktforward später komplett entfernt wird.
```

Alternativ, wenn Forrest zum ursprünglichen Ziel zurück möchte:

```text
Twitch Events → Alert-System Integration planen.
```

Wichtig: Alert-System erst planen, nicht direkt umbauen. Loyalty ist jetzt der erste bestätigte Consumer von Twitch Events.
