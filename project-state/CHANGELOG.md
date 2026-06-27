# Changelog

## RDAP121 - Zentrale Sprachdateien

- Sichtbare Version `0.2.2` eingefuehrt.
- Deutscher kurzer Buildname `Zentrale Sprachdateien` eingefuehrt.
- Zentrale Frontend-Sprach-Registry `RemoteModboardLanguages` erstellt.
- Sprachdateien `de.js` und `en.js` vorbereitet.
- Modulmanifest um `labelKey`, `titleKey`, `descriptionKey` und `tabKey` erweitert.
- Modul-Registry nutzt Sprachschluessel mit Fallback auf bestehende Texte.
- Moduluebersicht zeigt Sprachdatei-Hinweis read-only an.
- Frontend-Metadaten und Sprachtexte bleiben Anzeige/Navigation; Backend bleibt Sicherheitsinstanz.
- Keine DB-Migration, keine neuen produktiven Writes, keine Agent-Actions.
