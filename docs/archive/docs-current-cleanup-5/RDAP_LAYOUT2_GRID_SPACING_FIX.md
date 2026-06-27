# RDAP_LAYOUT2_GRID_SPACING_FIX

Stand: 2026-06-24

## Zweck

Der Browser-Test zeigte, dass die Status-Kacheln im Remote-Modboard nicht wie im Dashboard-v2-Design-Test-v13 als Grid dargestellt wurden, sondern als große untereinander gestapelte Karten.

Ursache: Die RDAP-HTML-Struktur verwendete teilweise `metrics-grid`, während die V13-CSS-Vorlage `metric-grid` stylt. Zusätzlich nutzten die Kacheln `metric-bar`, während die V13-Vorlage `cgn-progress` vorsieht.

## Geändert

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
```

## Änderungen

- Status-Kachelbereiche wieder auf `metric-grid` gestellt.
- Progress-Balken wieder auf `cgn-progress` / `cgn-progress--warn` gestellt.
- CSS-Robustheitsalias für `metrics-grid` ergänzt, damit solche Bereiche künftig nicht erneut zu großen Einzelkarten zusammenfallen.
- Responsive Grid-Regeln für Desktop, Tablet und Mobile abgesichert.

## Nicht geändert

- Kein Backend.
- Keine Auth-Logik.
- Keine DB/Migration.
- Keine Avatar-Logik.
- Keine Remote-Writes.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.

## Test

- Dashboard öffnen.
- Übersicht prüfen: Service/Auth/Login/Writes müssen als 4 Kacheln nebeneinander erscheinen.
- Benutzer & Rechte -> Zugriff prüfen: vier Kacheln ebenfalls als Grid.
- Login-Seite bleibt zentriert.
- Avatar/Usermenü bleibt unverändert.
