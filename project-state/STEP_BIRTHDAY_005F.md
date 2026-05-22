# STEP_BIRTHDAY_005F – Birthday Dashboard Party UX Cleanup

## Ziel

Die Party-Verwaltung im Birthday-Dashboard wurde übersichtlicher getrennt und besser bedienbar gemacht.

## Änderungen

- Party-Show-Tab wurde auf Show-/Medienstatus reduziert.
- Neuer Tab `Partys` trennt:
  - Party-Presets verwalten
  - User einer Party zuordnen
  - User-Songs/Zuweisungen anzeigen
- Party-Auswahl-Dropdown zum direkten Bearbeiten vorhandener Partys ergänzt.
- Button `Neue Party` ergänzt.
- User-Zuordnung kann per bestehendem User/Song-Profil gefüllt werden.
- User→Party-Dropdown zeigt vorhandene Party-Presets sauber an.
- Party-Preset-Liste und User-Zuordnung sind getrennt, damit die Seite nicht mehr so überladen wirkt.

## Betroffene Dateien

- `backend/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.css`
- Projektstatus/Doku-Dateien

## Nicht geändert

- Keine Änderung an Sound-System-Queue.
- Keine Änderung an Show-Ablauf.
- Keine Änderung an Upload-/Dauerlogik.
- Keine Funktionalität entfernt.
