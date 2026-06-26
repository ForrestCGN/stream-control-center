# RDAP75_ADMIN_NOTES_PAGE_DESIGN_CONTRACT_AND_FINDINGS

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP75 stoppt weitere kleine Layout-Patches an der Admin-Notes-Ansicht und legt einen verbindlichen Seitenaufbau fuer die naechsten RDAP-Schritte fest.

Dieser Step ist Doku-only.

## Anlass

Nach RDAP74 ist die Admin-Notes-Seite technisch nutzbar und die Header-Aktionen wurden entdoppelt. In der Live-Browserpruefung wurden aber zwei fachliche/UI-Probleme sichtbar:

```text
- Beim Wechsel des Zielusers darf die Notizen-Anzahl nur fuer den aktuell ausgewaehlten User gelten.
- Der Haupt-Header darf nicht "User-Detail" anzeigen, wenn sichtbar die Admin-Notes-Seite aktiv ist.
```

Ausserdem soll das Admin-Notes-Layout nicht weiter in kleinen isolierten CSS-Schritten wachsen, damit keine gewuerfelte Dashboard-Oberflaeche entsteht.

## Live-Findings nach RDAP74

```text
RDAP74 Live-Stand:
- Admin-Notes-Seite ist sichtbar.
- Header-Aktionen "Notizen neu laden" und "Neue Notiz" stehen im oberen Header.
- Separate doppelte Toolbar wurde reduziert/entfernt.
- Liste ist sichtbar.
- Delete/Deactivate sind nicht sichtbar.
```

Offene Befunde:

```text
- User-Kontext/Notizen-Anzahl muessen eindeutig sein:
  Beispiel Zielbild: ForrestCGN · 4 Notizen, EngelCGN · 0 Notizen.

- Wenn der Zieluser gewechselt wird, muss die Liste wirklich fuer genau diesen User neu geladen/angezeigt werden.

- Header/Router-State muss zur sichtbaren Seite passen:
  Admin-Notizen darf nicht unter dem Haupttitel "User-Detail" angezeigt werden.

- Weitere Optik-Verbesserungen sollen erst nach klarer Seitenstruktur erfolgen.
```

## Verbindlicher Seitenaufbau Admin-Notizen

### 1. Seitenheader

```text
Titel: Admin-Notizen
Rechts: Notizen neu laden | Neue Notiz
```

Regeln:

```text
- Der Seitenheader gehoert zur sichtbaren Seite.
- Wenn Admin-Notizen sichtbar ist, muss der Header "Admin-Notizen" zeigen.
- Der Header darf nicht von User-Detail oder anderen Admin-Seiten uebrig bleiben.
```

### 2. Zieluser-Auswahl

```text
Zieluser
Admin-Notizen fuer ausgewaehlten User
```

Regeln:

```text
- Der ausgewaehlte User ist der Kontext fuer alle Inhalte darunter.
- Auswahl, Suche und Reload duerfen sichtbar bleiben, aber kompakt.
- Die Auswahl darf nicht den Eindruck erzeugen, die Liste gehoere noch zu einem alten User.
```

### 3. Notizen-Liste

Zielbild:

```text
Notizen fuer ForrestCGN
4 Notizen geladen
```

Bei anderem User:

```text
Notizen fuer EngelCGN
0 Notizen geladen
```

Regeln:

```text
- Anzahl bezieht sich immer auf den aktuell ausgewaehlten User.
- Notizkarten zeigen ein menschliches Datum/Uhrzeit.
- Technische noteUid ist nicht Hauptueberschrift.
- Technische IDs duerfen spaeter nur in Details/Diagnose sichtbar sein.
```

### 4. Create-Formular

```text
Neue Notiz
```

Regeln:

```text
- Create ist nur nach Klick auf "Neue Notiz" sichtbar.
- Create bleibt nur bei Schreibrecht sichtbar.
- confirmWrite:true bleibt unveraendert.
- Backend entscheidet weiter ueber Session, Permission, Audit, Lock und Readback.
```

### 5. Diagnose/Technik

Regeln:

```text
- Diagnosewerte wie canRead, canWrite, Schema, confirmWrite-Hinweise, Admin-only, Read/Create/Update sind nicht Teil der normalen Hauptansicht.
- Sie duerfen spaeter in "Diagnose anzeigen" oder einem Admin-Diagnosebereich wieder verfuegbar sein.
- Sie duerfen nicht prominent zwischen Header und Liste stehen.
```

## Naechste Code-Steps

### RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX

Ziel:

```text
- Header/Router-State sauber synchronisieren.
- Wenn Admin-Notizen sichtbar ist, muss Haupt-Header/Admin-Navigation dazu passen.
- User-Detail darf nicht als Header stehen bleiben, wenn Admin-Notizen aktiv ist.
```

Scope:

```text
Frontend-only.
Keine Backend-Route.
Keine DB-Migration.
Keine neue Permission.
Kein Delete/Deactivate.
```

### RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX

Ziel:

```text
- Zieluser-Wechsel laedt/zeigt eindeutig Notizen fuer den aktuell ausgewaehlten User.
- Notizen-Anzahl bezieht sich auf den aktuell ausgewaehlten User.
- UI-Text zeigt "Notizen fuer <DisplayName>" und "<n> Notizen geladen".
```

Scope:

```text
Frontend-only, sofern die vorhandene Readroute den User-Kontext bereits korrekt unterstuetzt.
Keine Backend-Route, ausser ein spaeterer Befund zeigt zwingend das Gegenteil.
Keine DB-Migration.
Keine neue Permission.
Kein Delete/Deactivate.
```

## Weiterhin verboten

```text
Kein Admin-Note Deactivate.
Kein physisches Delete.
Keine Community-Read-Freigabe.
Keine DB-Migration.
Keine neue Permission.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Session-Revocation UI.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
Keine parallele Zweitnavigation.
```
