# RDAP_LOGIN1_CENTER_LAYOUT_FIX

Stand: 2026-06-24

## Zweck

Reiner Frontend-/CSS-Fix fuer die Login- und Access-Denied-Seite des Remote-Modboards.

Der Browsercheck zeigte, dass die Login-Karte oben links in die Ecke gequetscht war. Dieser Step setzt Login- und Denied-Szene sauber in die Mitte des Bildschirms und gibt der Card mehr Luft, ohne Auth-/Backend-/DB-Logik zu veraendern.

## Geaendert

```text
remote-modboard/backend/public/assets/remote-modboard.css
docs/current/RDAP_LOGIN1_CENTER_LAYOUT_FIX.md
```

## Nicht geaendert

```text
Backend
Auth-Logik
DB
Migration
Remote-Writes
Agent-Actions
OBS/Sound/Overlay/Command-Steuerung
User-/Rollenverwaltung
```

## Test

- Login-Seite nicht mehr oben links gequetscht
- Login-Card auf Desktop zentriert mit sauberem Abstand
- Access-Denied-Seite ebenfalls sauber positioniert
- Dashboard nach erfolgreichem Login unveraendert
- Avatar/Usermenue bleibt unveraendert
