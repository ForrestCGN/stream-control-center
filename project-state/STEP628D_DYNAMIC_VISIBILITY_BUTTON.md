# Projektstand – STEP628D Dynamischer Sichtbarkeitsbutton

## Ziel

Der Sichtbarkeitsbutton der manuellen OBS-Reparaturaktionen ist jetzt abhängig vom aktuellen Zustand der Quelle eindeutig erkennbar.

## Änderungen

- Sichtbare Quellen zeigen `🙈` mit Tooltip/ARIA-Label `Quelle ausblenden`.
- Ausgeblendete Quellen zeigen `👁️` mit Tooltip/ARIA-Label `Quelle einblenden`.
- `↻` Browserquelle neu laden bleibt unverändert.
- `🧹` Browsercache neu laden bleibt unverändert.
- `⚡` Quelle kurz aus/an bleibt unverändert.
- Platzhalter/about:blank bekommen weiterhin keine Reparaturbuttons.
- Es wurde keine neue Backend-Logik benötigt; die bestehende `toggle`-Aktion aus STEP628B/628C wird weiterverwendet.

## Geänderte Dateien

- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`

## Nicht geändert

- Keine OBS-Automatik.
- Keine Reparatur ohne Nutzerklick.
- Keine Backend-API-Änderung.
- Keine OBS-Quellen wurden umbenannt oder verändert.
