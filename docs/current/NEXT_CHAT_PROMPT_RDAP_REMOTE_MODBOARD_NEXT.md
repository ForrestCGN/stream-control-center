# NEXT CHAT PROMPT - Remote-Modboard Weiterarbeit

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wahrheit / Arbeitsbasis

- GitHub/dev und lokales Repo `D:\Git\stream-control-center` sind Wahrheit.
- Erst echte Dateien/Dokus lesen, dann Plan nennen, dann auf `go` warten.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach Checks und `git status`.
- Nur wenn sauber/nachvollziehbar: `stepdone.cmd`.
- `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen, nicht bei Doku-only.

## Aktueller Stand

```text
0.2.14B - OBS read-only UI Label-Fix
```

## Wichtig

OBS ist sichtbar, bleibt aber read-only. 0.2.14B korrigiert nur sichtbare Label-/Title-Rohkeys.

Keine grosse Navigation neu bauen. Die alte grobe Zielstruktur kann spaeter separat geplant werden:

```text
Live / Control / Loyalty / Community / System / Admin
```

Naechster Schritt: Sichttest, dann stepdone. Danach klein weiterplanen.
