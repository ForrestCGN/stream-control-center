# ADMIN_MODULE_REGISTRY_DESIGN_CONTRACT

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Zielvertrag fuer Modul-/Page-Registry

## Ziel

Das Remote-Modboard soll langfristig modular und erweiterbar werden.

Neue Module und Menuepunkte sollen nicht mehr per Einzelpatch an Navigation, Header und Panels verteilt werden. Ein Modul soll sich selbst beschreiben, und die App-Shell soll daraus Navigation und Seitenzustand ableiten.

## Grundsatz

```text
Ein Modul beschreibt sich.
Die App-Shell ordnet es ein.
Der Router zeigt es an.
Das Feature rendert nur seinen Inhalt.
```

## Zuständigkeiten

### App-Shell / Haupt-Router

Zuständig fuer:

```text
- Module/Page-Registry
- Navigation aufbauen
- Header setzen
- aktive Navigation setzen
- sichtbares Panel setzen
- currentPage halten
- Page-Change-Events senden
- spaeter: Permission-basierte Anzeige
```

### Modul-Registry

Zuständig fuer:

```text
- Module sammeln
- Pages sammeln
- Reihenfolge verwalten
- Duplikate verhindern
- Metadaten validieren
```

### Feature-/Page-Dateien

Zuständig fuer:

```text
- Inhalt der eigenen Page rendern
- eigene Daten laden
- eigene Buttons/Formulare binden
- eigene Fehler/Notice-Texte anzeigen
```

Nicht zustaendig fuer:

```text
- globale Navigation injizieren
- Header direkt setzen
- fremde Panels sichtbar/unsichtbar schalten
- eigenen Router bauen
- aktive Nav-Klassen anderer Seiten reparieren
```

## Modulmodell

Ein Modul:

```text
id
label
icon
order
status
pages[]
```

Eine Page:

```text
pageId
moduleId
label
title
tab
order
permission
status
mount/render/init
```

## Admin-Zielstruktur

```text
Admin
- Admin-Uebersicht
- Benutzerverwaltung
- User-Detail
- Admin-Notizen
- Rollen & Rechte
- Sicherheit
- Audit / Locks
```

## Sichtbarkeitsregel

Es darf immer nur eine Page aktiv sein.

```text
currentPage = genau eine pageId
Header = Meta dieser pageId
aktive Navigation = Link dieser pageId
sichtbares Panel = Panel dieser pageId
```

Wenn diese vier Werte auseinanderlaufen, ist das ein Bug.

## Erweiterungsregel

Ein neues Modul darf kuenftig nur an einer Stelle registriert werden muessen.

Nicht mehr:

```text
index.html bearbeiten
remote-modboard.js erweitern
Feature-Datei injiziert Navigation
Feature-Datei setzt Header
Feature-Datei versteckt Panels
CSS kaschiert falschen State
```

Sondern:

```text
Moduldatei hinzufuegen
Page registrieren
Feature rendern lassen
```

## Sicherheitsregel

Die Registry ist kein Freifahrtschein fuer Aktionen.

```text
Eine sichtbare Page bedeutet nicht automatisch Schreibrecht.
Writes bleiben serverseitig durch Permission, Confirm-Write, Audit, Lock und Readback geschuetzt.
```

## Reihenfolge der Umsetzung

```text
1. Frontend-Registry-Fundament.
2. Admin-Modul als erster Nutzer.
3. Admin-Notizen/User-Detail sauber registrieren.
4. Alte Injektions-/Router-Speziallogik entfernen/entlasten.
5. Spaeter Backend-Manifest und Permission-Filter.
```
