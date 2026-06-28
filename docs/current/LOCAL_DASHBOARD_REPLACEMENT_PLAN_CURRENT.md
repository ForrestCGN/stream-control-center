# Lokaler Dashboard-Ersatz - aktueller Plan

Stand: 2026-06-28

## Aktueller Stand

```text
0.2.14B - OBS read-only UI Label-Fix
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

## Sicherheit

- read-only,
- keine OBS-Kommandos,
- keine Szenenwechsel,
- kein Mute/Unmute,
- keine Quellen-Sichtbarkeit,
- keine Media-Steuerung,
- keine Agent-Actions,
- keine Shell-/Datei-/Prozess-Actions.
