# NEXT STEPS – CAN-42.31

## Status

CAN-42.31 ergänzt einen reinen Verifikationsschritt für den Diagnose-Datei-Cleanup.

## Ausführen

```cmd
tools\check\CAN-42.31_verify_diagnostics_cleanup.cmd
```

## Danach

Wenn die lokalen Löschungen korrekt sind:

```cmd
02_LOKALE_AENDERUNGEN_ZU_GITHUB_HOCHLADEN.cmd
```

Wenn GitHub/dev sauber ist und Live aktualisiert werden soll:

```cmd
01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd
```

## Wichtig

CAN-42.31 löscht nichts. Es prüft nur den Stand in Repo und Live.

