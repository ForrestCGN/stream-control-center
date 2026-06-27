# Changelog

## RDAP122 - Lokales Dashboard-Profil

- Sichtbare Version `0.2.3` eingefuehrt.
- Deutscher kurzer Buildname `Lokales Dashboard-Profil` eingefuehrt.
- `localDashboardProfile` in Config und Status-API vorbereitet.
- Runtime-Modus `online/local` wird in der UI sichtbar angezeigt.
- `REMOTE_MODBOARD_MODE=lan` wird weiter als `local` normalisiert.
- Modulmanifest auf Version `0.2.3` gesetzt und Runtime-Profile dokumentiert.
- Neues Frontend-Helferfile `runtime-profile.js` markiert Navigation anhand `runtime: online|local|both`.
- Zentrale Sprachdateien um Runtime-Texte erweitert.
- Keine DB-Migration, keine neuen produktiven Writes, keine Agent-Actions.

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
