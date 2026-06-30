# NEXT_STEPS

## Naechster RDAP-Block

`RDAP_0.2.119_LOCAL_LOGS_READONLY_API_DESIGN`

## Ziel

Konkretes Design fuer eine lokale Logs-read-only-API vorbereiten.

## Vorher pruefen

```text
Welche lokalen 8080 Status-/Recent-/Log-Routen existieren bereits?
Welche Datei/Modul ist Owner fuer lokalen Agent-/Dashboard-Status?
Gibt es bestehende sichere Log-/Recent-Strukturen?
Welche Route darf Remote-Modboard spaeter lesen?
Wie wird Offline/Stream-PC nicht erreichbar sauber angezeigt?
```

## Regeln

```text
keine Writes
keine Migration
keine Loeschung
keine Agent-Actions
keine lokalen Steueraktionen
keine OBS-/Sound-/Overlay-Steuerung
keine Admin-Notizen weiter ausbauen
erst Design, dann API
```

## Spaeterer moeglicher Folgeschritt

`RDAP_0.2.120_LOCAL_LOGS_READONLY_API_SKELETON`

Nur wenn 0.2.119 Design bestaetigt ist.
