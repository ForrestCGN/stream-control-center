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
0.2.14C - OBS read-only Online-Status-Fix
```

## Wichtig

OBS ist sichtbar und bleibt read-only.

0.2.14:
- OBS read-only in der UI sichtbar.

0.2.14B:
- sichtbare OBS-Label-/Title-Rohkeys korrigiert.

0.2.14C:
- Online-Backend-Status und Routes mit sichtbarer OBS-Seite synchronisiert.
- `/api/remote/status` enthaelt `obsPage`.
- `/api/remote/routes` enthaelt `/api/remote/local-dashboard/obs/status` und `/model`.
- `/api/remote/local-dashboard/obs/status` liefert read-only Online-Placeholder.
- Webserver-Deploy wurde ausgefuehrt und erfolgreich geprueft.

Keine grosse Navigation neu bauen. Die alte grobe Zielstruktur kann spaeter separat geplant werden:

```text
Live / Control / Loyalty / Community / System / Admin
```

Mein Konto gehoert oben rechts, nicht links.

OBS ist aktuell unter System sichtbar. Wenn spaeter verschoben wird, dann eher klein Richtung `Control -> OBS`, aber nicht in diesem Step.

## Naechster sinnvoller Step

```text
0.2.15 - OBS Inventar read-only vorbereiten
```

Ziel:
- Szenen/Quellen/Audio read-only vorbereiten.
- Weiterhin keine Steuerung.
- Keine Szenenwechsel.
- Keine Mutes.
- Keine Quellen-Sichtbarkeit aendern.
- Keine Media-Steuerung.
- Keine produktiven Writes.
- Keine Agent-Actions ohne separates Action-Modell.

Vor jedem neuen Code-Step: echte Dateien aus GitHub/dev lesen, Plan nennen, auf `go` warten.
