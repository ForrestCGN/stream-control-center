# Changelog

## RDAP120 - Modul-Metadaten, Version und Rechte

- Sichtbare Version `0.2.1` eingefuehrt.
- Deutscher kurzer Buildname `Modul-Metadaten und Rechte` eingefuehrt.
- Status-API um `version`, `buildName`, `runtimeMode`, `app` und `moduleMetadata` ergaenzt.
- `config.runtimeMode` im Public-Status sauber ausgegeben.
- Modulmanifest mit deutschen Labels, vorbereiteter Lokalisierung, Permission-Metadaten und Runtime-Scope erstellt.
- Moduluebersicht zeigt Metadaten read-only an.
- Frontend-Metadaten bleiben Anzeige/Navigation; Backend bleibt Sicherheitsinstanz.
- Keine DB-Migration, keine neuen produktiven Writes, keine Agent-Actions.
