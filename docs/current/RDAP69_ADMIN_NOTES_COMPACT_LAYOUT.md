# RDAP69_ADMIN_NOTES_COMPACT_LAYOUT

Stand: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Ziel

```text
Admin-Notes Layout kompakter und uebersichtlicher machen, ohne Backend-Funktion, ohne neue Permission und ohne neue Schreibrechte.
```

## Ausgangslage

```text
RDAP67 ist live deployed.
Serverchecks sind ok.
Browserpruefung ist fachlich ok.
Admin-Notes sind sichtbar.
Bearbeiten und Speichern funktionieren.
Navigation ist stabil.
Delete/Deactivate sind nicht sichtbar.
```

## Befund vor RDAP69

```text
RDAP67 trennt Metadaten und Notiztext besser, aber die Ansicht ist noch nicht optimal uebersichtlich.
Obere Statuskarten nehmen viel Platz ein.
Create-Karte ist zu gross.
Liste startet zu weit unten.
Notizkarten koennen kompakter und klarer werden.
```

## Umsetzung

Geaendert:

```text
remote-modboard/backend/public/assets/remote-modboard.js
```

Art:

```text
Frontend-only Compact-Layout ueber idempotente Style-Injection rdap69AdminNotesCompactLayoutStyle.
Die RDAP67-Style-Injection wird beim Laden entfernt, falls sie noch vorhanden ist.
Keine Backend-/DB-/Permission-Aenderung.
Keine neue Navigation.
Keine neue Schreibfunktion.
```

## Inhaltliche Layout-Aenderungen

```text
- obere Admin-Notes-Statuskarten kompakter
- Statuskarten mit geringerer Hoehe und kleineren Abstaenden
- Aktion/Create weniger dominant
- Create-Karte kompakter und mit weniger Leerflaeche
- Liste hoeher und zentraler
- Notizkarten kompakter
- Metadaten kleiner und platzsparender
- Notiztext klar, aber mit weniger Innenabstand
- Bearbeiten-Editor kompakter
- Erfolg/Fehler/Info-Hinweise weiterhin sichtbar, aber platzsparender
```

## Sicherheitsgrenzen

```text
Keine Backend-Route.
Keine DB-Migration.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
Kein Haupt-Router-Umbau.
```

## Erwartete Checks lokal

```powershell
cd D:\Git\stream-control-center

node --check .emote-modboardackend\publicssetsemote-modboard.js
node --check .emote-modboardackend\publicssetsdap28-admin-notes.js

git status --short
git diff --stat
```

## Erwartete Live-Pruefung nach Deploy

```text
- Admin -> Admin-Notizen weiterhin sichtbar.
- obere Statuskarten sind kompakter.
- Create-Bereich ist weniger dominant.
- Liste startet hoeher.
- Notizkarten sind kompakter und weiterhin lesbar.
- Create funktioniert weiterhin.
- Update-Speichern funktioniert weiterhin.
- Erfolg/Fehler sichtbar.
- User-Detail funktioniert weiterhin.
- Navigation bleibt stabil.
- Delete/Deactivate sind nicht sichtbar.
```
