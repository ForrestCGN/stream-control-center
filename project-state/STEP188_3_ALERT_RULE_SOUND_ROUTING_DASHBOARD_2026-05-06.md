# STEP188.3 - Alert Rule Sound Routing Dashboard

Stand: 2026-05-06

## Zweck

Dashboard-Erweiterung fuer die in STEP188.2 eingefuehrten Alert-Regel-Sound-Routing-Felder.

## Betroffene Dateien

```text
htdocs/dashboard/modules/alerts.js
htdocs/dashboard/modules/alerts.css
```

## Geaendert

Im bestehenden Alert-Regel-Editor wurde eine neue Sektion ergaenzt:

```text
Sound-Ausgabe & Queue
```

Neue Felder pro einzelner Alert-Regel:

```text
sound_output_target  -> Standard / Audiogeraet / OBS Overlay
sound_category       -> Standard / Alert / Kritisch / Kanalpunkte / VIP / Fun / TTS / Admin / System
sound_priority       -> optionale Sound-System-Queue-Prioritaet
sound_volume         -> optionale Sound-Lautstaerke in Prozent
```

## Verhalten

Leer gelassene Werte bedeuten weiterhin:

```text
Globale Alert-/Sound-System-Settings verwenden.
```

Damit bleiben bestehende Regeln kompatibel.

## Fachregel

- Geld-/Support-Alerts wie Bits, Subs, Ko-fi und Tipeee koennen pro Regel hoehere Sound-Prioritaeten bekommen.
- Kanalpunkte und Community-SoundAlerts koennen niedriger priorisiert werden.
- Videos bleiben weiterhin immer Overlay.
- Audio-Dateien folgen der Regel-Konfiguration bzw. dem globalen Fallback.

## Tests

Lokaler Syntaxcheck:

```text
node -c htdocs/dashboard/modules/alerts.js
OK
```

Nach Live-Deploy testen:

1. Dashboard oeffnen.
2. Alert-Center -> Regeln / Staffelungen.
3. Bestehende Regel bearbeiten.
4. Neue Sektion `Sound-Ausgabe & Queue` pruefen.
5. Werte setzen, speichern.
6. Regel erneut oeffnen und pruefen, ob Werte erhalten bleiben.
7. Test-Alert ausloesen und `/api/sound/status` pruefen.

## Offen

- SoundAlert-Inbox / Import-Workflow ist separat STEP189.
- generated_beep + outputTarget=device bleibt bewusst offen.
