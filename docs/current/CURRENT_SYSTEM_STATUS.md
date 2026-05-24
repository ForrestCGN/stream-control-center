# Current System Status

Stand: STEP294 – Discord Resolver Retest bestätigt
Aktualisiert: 2026-05-24T14:30:00Z

## Aktueller Fokus

Kommunikations-/Sound-/Alert-Stabilisierung über Communication Bus, ohne bestehende Produktionswege zu entfernen.

## Alert-System

- Alert native Output Mode vorhanden.
- Getestete Modi:
  - `legacy`
  - `legacy_and_bus`
  - `bus_first`
- `bus_only` ist vorbereitet, aber nicht freigegeben.
- Produktiv sicherer Standard bleibt weiterhin `legacy`, solange kein expliziter Testbetrieb gewünscht ist.
- Overlay Watchdog läuft und meldete in den Tests `acknowledged`.

## Sound-System / SoundBus

- Sound-System bleibt Master für Audio, Queue, Bundles und Prioritäten.
- SoundBus ist als Event-/Status-Schicht ergänzt.
- `/api/sound/status` enthält Top-Level `soundBus`.
- SoundBus wurde aktiviert und getestet.
- Einzel-Sound-Test bestanden.
- Alert-Bundle-Test bestanden.
- V5 Real Queue/Bundle Regression bestanden.
- SoundBus verursacht keine Queue-/Bundle-Störung.

## Discord Media Resolver

STEP291 zeigte einen Nebenbefund:

```text
discordFailed = 3
sound nicht gefunden: media/alerts/bits/100-249.mp3
```

STEP292 grenzte dies als Discord-Pfadresolver-Problem ein. STEP293 erweiterte `backend/modules/discord.js` für Media-Registry-Pfade. STEP294 bestätigte den Retest:

```text
discordFailed = 0
failed = 0
deviceFailed = 0
queuedCount = 0
activeBundleLock = leer
bundlesQueued = 3
bundleItemsQueued = 6
```

## Wichtige Schutzregeln

- Keine Funktionalität entfernen.
- Keine Sound-Queue-Logik ändern, wenn nur Bus/Status/Resolver betroffen ist.
- `activeBundleLock` nicht ohne gezielte Regressionstests anfassen.
- SQLite nicht überschreiben oder neu bauen.
- Dashboard nur über APIs, nicht direkt auf Dateien/SQLite.
- Nach Codeänderungen Syntaxcheck und Tests dokumentieren.

## Nächster empfohlener Schritt

STEP295 – SoundBus Betriebsentscheidung / nächster Migrationsblock.

Optionen:

- `soundBus.enabled = true` als stabilen Stand belassen und Monitoring/Dashboard nachziehen.
- Oder SoundBus wieder deaktivieren, bevor weitere größere Umbauten starten.
- Danach gezielt den nächsten Bus-Consumer oder Debug-/Dashboard-Block planen.
