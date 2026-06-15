# NEXT CHAT PROMPT – LC-CORE-POINTS-3E

Wir machen mit dem Projekt `stream-control-center` für ForrestCGN weiter.

Bitte auf Deutsch arbeiten, direkt und strikt schrittweise.

Wichtig:

- Erst prüfen, dann planen, dann auf mein ausdrückliches `go` warten.
- Keine Umsetzung ohne `go`.
- Keine Funktionalität entfernen.
- Keine Patch-/Regex-/Apply-Scripte.
- Nur vollständige echte Ersatzdateien liefern.
- ZIPs immer mit echten Zielpfaden ab Repo-Root.
- Nach ZIP: StepDone nennen.

Bitte zuerst lesen/berücksichtigen:

```text
docs/current/CURRENT_CHAT_HANDOFF_LC_CORE_POINTS_3E_DOCUMENTED.md
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/FILES.md
docs/current/CHANGELOG.md
docs/modules/twitch_events_loyalty_bonus_events.md
MASTER_PROMPT_stream_control_center_CLEAN_2026-06-15.txt
```

Projektbasis:

```text
GitHub: ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-System: D:\Streaming\stramAssets
Dashboard: http://127.0.0.1:8080/dashboard
Produktive SQLite: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Aktuell bestätigter Stand:

```text
LC-CORE-POINTS-3B: live bestätigt
LC-CORE-POINTS-3C: live bestätigt
LC-CORE-POINTS-3C1: Hotfix bestätigt
LC-CORE-POINTS-3D: live bestätigt
LC-CORE-POINTS-3E: live bestätigt
```

Technischer Kernstand:

```text
backend/modules/loyalty.js  version 0.1.17
backend/modules/twitch.js   version 0.1.10
```

Loyalty verarbeitet Twitch-Bonus-Events jetzt über:

```text
Twitch EventSub
→ twitch.js
→ twitch_events.handleEventSubNotification(...)
→ Communication Bus
→ loyalty gezielte Subscription
→ recordEventBonus(...)
```

Bestätigte Live-Events:

```text
channel.cheer  / akighosty
channel.follow / bossmod_cgn
```

Legacy-Direktforward zu Loyalty:

```text
standardmäßig deaktiviert
TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD=true reaktiviert ihn nur als Notfall-Fallback
```

Nächster sinnvoller Schritt:

```text
Twitch Events als zentrale Alert-Event-Quelle vorbereiten.
```

Aber zuerst nur prüfen:

1. Welche Alert-Events gibt es aktuell?
2. Wie bekommt `alert_system.js` aktuell Follow/Sub/Resub/Gift/Cheer/Raid?
3. Welche Eventtypen liefert `twitch_events.js` schon sauber?
4. Welche Daten braucht das Alert-System zusätzlich?
5. Welche Legacy-Pfade dürfen noch nicht entfernt werden?
6. Welche Tests sind minimal nötig?

Dann Ziel/Dateien/Änderung/Nicht geändert/Tests nennen und auf `go` warten.
