# STEP396_SAFE_GIT_COMMIT_PLAN

## Anlass

STEP395 meldete `STEP395_STATUS=READY_TO_COMMIT`, aber `git status` zeigte sehr viele untracked Dateien:

- alte STEP37x/38x Diagnose- und Projektdateien
- `.bak`-Dateien
- `_trace/`
- verworfene STEP386-Artefakte
- Bridge-Dateien, die nicht produktiv aktiv sein sollen

## Entscheidung

Kein breites `git add backend config htdocs project-state docs tools` verwenden.

Stattdessen:

1. Produktionsstatus behalten.
2. Nur bewusst gewünschte Dateien stagen.
3. Backups und verworfene Experimente nicht committen.
4. STEP386 und STEP376 bleiben gesperrt/verworfen.

## Produktiver Stand

```text
Produktiv: /overlays/_overlay-alerts-v2.html
Nicht produktiv: /overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge
Direct client: alert_overlay_v2_shadow
Bridge client: offline/nicht aktiv
```

## Empfohlene Commit-Botschaft

```text
STEP396: document stable direct alert overlay flow
```

