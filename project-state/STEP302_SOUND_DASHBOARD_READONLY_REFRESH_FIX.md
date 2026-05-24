# STEP302 – Sound Dashboard Bus-Monitor Readonly Refresh Fix

Stand: 2026-05-24

## Ergebnis

Der Bus-Monitor im Sound-Dashboard bleibt jetzt auch beim Button **Status neu laden** rein lesend.

## Änderung

```text
htdocs/dashboard/modules/sound.js
```

- Button im Bus-Monitor von `reload` auf `refresh-status` geändert.
- Neue Funktion `refreshStatusOnly()` ergänzt.
- `refreshStatusOnly()` ruft nur `GET /api/sound/status` auf.

## Nicht geändert

- Globaler Sound-System-Button `Neu laden` bleibt unverändert.
- Keine Backend-Änderung.
- Keine Sound-/Queue-/Bundle-/Bus-Logik geändert.

## Test

```cmd
node --check htdocs/dashboard/modules/sound.js
```

Ergebnis: OK.
