# Modul-Doku — Commands

Stand: 2026-05-26

## Versionen

Backend:

```text
moduleVersion = 0.1.5
moduleBuild = safe-edit-param-fix
```

Dashboard:

```text
UI_VERSION = 0.1.9
UI_BUILD = preserve-modal-draft-state
```

## Ziel

Zentrales Chat-Command-System mit benutzerfreundlicher Dashboard-Verwaltung und sicherem Editierverhalten.

## Wichtige UI-Regeln

- Neuer Command öffnet Modal mit Standardwerten.
- Bestehender Command öffnet Modal mit gespeicherten Daten.
- Bearbeiten speichert bestehenden Command, legt nicht versehentlich einen neuen an.
- Löschen nur mit Rückfrage.
- Technische Felder nur unter `Erweitert`.
- `Nur Live` nicht in der normalen Oberfläche.
- MediaPicker-Auswahl darf Formularentwurf nicht zurücksetzen.

## Aktionen

Normale Auswahl:

```text
Song abspielen
Video abspielen
Text anzeigen
Modul-Befehl ausführen
Benutzerdefinierte Aktion
```

## Bekannte Fixes

- Duplikatfehler beim Speichern behoben.
- `Unknown named parameter 'createdAt'` behoben.
- Draft-State beim MediaPicker behoben.

## Offene Punkte

- Optional später zentrale Textverwaltung anbinden.
- Optional UI-Feinschliff.
- Neue Module sollen ihren Command-Katalog sauber dokumentieren.

