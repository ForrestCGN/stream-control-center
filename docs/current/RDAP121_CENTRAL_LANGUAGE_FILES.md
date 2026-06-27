# RDAP121 - Zentrale Sprachdateien

Stand: 2026-06-27

## Ziel

RDAP121 baut auf RDAP120 auf und fuehrt eine zentrale Frontend-Sprachstruktur ein.

Sichtbarer Stand:

```text
v0.2.2 - Zentrale Sprachdateien
```

## Neu

```text
remote-modboard/backend/public/assets/languages/registry.js
remote-modboard/backend/public/assets/languages/de.js
remote-modboard/backend/public/assets/languages/en.js
```

Die neue Registry stellt bereit:

- `window.RemoteModboardLanguages.register(locale, entries)`
- `window.RemoteModboardLanguages.t(key, fallback, params)`
- `window.RemoteModboardLanguages.resolve(value, fallback)`
- `window.RemoteModboardLanguages.getLocale()`
- `window.RemoteModboardLanguages.getAvailableLocales()`

Deutsch bleibt Standardsprache. Englisch ist vorbereitet.

## Modultexte

Das Modulmanifest enthaelt jetzt `labelKey`, `titleKey`, `descriptionKey` und `tabKey` fuer Module/Seiten.

Fallbacks bleiben erhalten, damit Module nicht brechen, falls ein Key fehlt.

## Sicherheitsgrenze

Diese Aenderung betrifft nur UI-Texte, Modul-Metadaten und Anzeige.

Nicht geaendert:

- keine DB-Migration,
- keine neuen produktiven Writes,
- keine Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung.
