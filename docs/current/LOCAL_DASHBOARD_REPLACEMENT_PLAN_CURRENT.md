# Lokaler Dashboard-Ersatz - aktueller Plan

Stand: 2026-06-28

## Aktueller Stand

```text
0.2.14C - OBS read-only Online-Status-Fix
```

## UI-Regel

```text
Remote-Modboard = UI-Wahrheit.
Dashboard-v2 lokal = dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
```

Keine zweite lokale UI. Keine grosse Navigation neu bauen.

## OBS

OBS ist als erstes fachliches Modul vorbereitet.

0.2.13:

```text
/api/remote/local-dashboard/obs/status
/api/remote/local-dashboard/obs/model
```

0.2.14:

```text
OBS read-only in der UI sichtbar.
```

0.2.14B:

```text
OBS-Label/Title korrigiert, damit keine Rohkeys wie page.system.obs.label angezeigt werden.
```

0.2.14C:

```text
Online-Backend-Status und Routes wurden mit der sichtbaren OBS-read-only UI synchronisiert.
```

Online geprüft:

```text
/api/remote/status enthaelt obsPage.
/api/remote/routes enthaelt OBS Status/Model.
/api/remote/local-dashboard/obs/status liefert read-only Placeholder.
```

## Sicherheit

- read-only,
- keine OBS-Kommandos,
- keine Szenenwechsel,
- kein Mute/Unmute,
- keine Quellen-Sichtbarkeit,
- keine Media-Steuerung,
- keine Agent-Actions,
- keine Shell-/Datei-/Prozess-Actions,
- keine DB-Migration,
- keine produktiven Writes.

## Naechster sinnvoller Code-Step

```text
0.2.15 - OBS Inventar read-only vorbereiten
```

Ziel spaeter:
- Szenen/Quellen/Audio read-only vorbereiten,
- weiterhin keine Steuerung,
- keine Szenenwechsel,
- keine Mutes,
- keine Writes,
- keine Agent-Actions ohne separates Action-Modell.
