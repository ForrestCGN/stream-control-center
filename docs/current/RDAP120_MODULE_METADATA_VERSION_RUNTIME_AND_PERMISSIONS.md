# RDAP120 - Modul-Metadaten, Version und Rechte

Stand: 2026-06-27

## Ziel

RDAP120 setzt auf RDAP119 auf und bereinigt die neue modulare Oberfläche:

- sichtbare Version statt kryptischem RDAP-Buildnamen,
- kurzer deutscher Buildname,
- zentrales Modulmanifest,
- deutsche Modul-/Seitennamen mit später erweiterbarer Lokalisierung,
- Permission-Metadaten pro Modul/Seite,
- Runtime-Scope pro Modul/Seite (`online`, `local`, `both`).

## Version

Aktueller sichtbarer Stand:

```text
v0.2.1 - Modul-Metadaten und Rechte
```

RDAP-Stepnamen bleiben nur für ZIP/Commit/Deploy-Nachvollziehbarkeit.

## Modulmanifest

Neu:

```text
remote-modboard/backend/public/assets/modules/module-manifest.js
```

Das Manifest enthält:

- `modules[]` mit Bereich, Icon, Reihenfolge, Permission, Runtime-Scope,
- `pages[]` mit Seite, Label, Titel, Beschreibung, Script-Pfad, Permission, Runtime-Scope,
- deutsche Labels als aktiver Standard,
- englische Labels als vorbereitete Struktur.

## Sicherheitsgrenze

Frontend-Metadaten sind nur Navigation/Anzeige. Sie ersetzen keine Backend-Prüfung.

Produktive Aktionen bleiben weiterhin nur über Backend-Scope, Permission, Confirm-Write, Audit, Lock und Readback erlaubt.

Nicht geändert:

- keine DB-Migration,
- keine neuen produktiven Writes,
- keine Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung.
