# RDAP50_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Plan-only / Doku

## Zweck

RDAP50 plant den naechsten kleinen, aber sichtbaren Schritt nach RDAP49B:

```text
Die Bruecke von Admin -> User-Detail zu Admin -> Admin-Notizen soll sauberer werden.
```

RDAP49 hat bereits live bestaetigt:

```text
Admin -> User-Detail ist sichtbar.
ForrestCGN / tw:127709954 kann ausgewaehlt werden.
Rollen/Gruppen/Sessions werden read-only angezeigt.
Button Admin-Notizen oeffnen ist sichtbar.
```

RDAP50 legt fest, wie diese Bruecke in RDAP51 verbessert werden soll, ohne eine zweite Notiz-Implementierung zu bauen.

## Ausgangslage

Bestaetigter Stand aus RDAP49B:

```text
Bereich: Admin -> User-Detail
Ausgewaehlter User: ForrestCGN @forrestcgn / tw:127709954
Rollen: 1 / owner
Gruppen: 0
Sessions: 4
Sicherheitskarte: Keine Schreibverwaltung sichtbar
Button: Admin-Notizen oeffnen sichtbar
```

Die bestehende Admin-Notizen-Struktur kann bereits:

```text
- Zieluser auswaehlen.
- Zieluser suchen/filtern.
- Admin-Notizen fuer den Zieluser lesen.
- Neue Notiz fuer den Zieluser erstellen, wenn admin.users.note.write erlaubt ist.
- Zieluser programmgesteuert setzen ueber window.RdapAdminNotes.selectTargetUser(user).
```

## Ziel fuer RDAP51

Empfohlener naechster Code-Step:

```text
RDAP51_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PREPARED
```

Typ:

```text
Frontend-only
```

Ziel:

```text
Der Wechsel von User-Detail zu Admin-Notizen soll eindeutig, sichtbar und rueckverfolgbar sein.
```

## Geplanter Scope RDAP51

RDAP51 soll klein bleiben, aber den Workflow spuerbar verbessern:

```text
1. Button "Admin-Notizen oeffnen" bleibt im User-Detail.
2. Klick setzt weiterhin den Zieluser ueber die vorhandene RDAP44/RDAP47 API.
3. Admin-Notizen-Seite zeigt danach einen klaren Hinweis:
   "Aus User-Detail geoeffnet: ForrestCGN / tw:127709954".
4. Optionaler Ruecksprung/Button:
   "Zurueck zum User-Detail".
5. Der Ruecksprung nutzt den vorhandenen User-Detail-Zustand.
6. Keine zweite Admin-Notizen-Liste.
7. Keine neue Backend-Route.
8. Keine DB-Migration.
9. Keine Permission-Schreibfunktion.
```

## Akzeptanzkriterien RDAP51

```text
- In Admin -> User-Detail ist der Button Admin-Notizen oeffnen sichtbar.
- Klick auf den Button oeffnet Admin -> Admin-Notizen.
- Der Zieluser in Admin-Notizen ist derselbe User aus User-Detail.
- Ein sichtbarer Kontext-Hinweis bestaetigt die Herkunft aus User-Detail.
- Optionaler Ruecksprung zu User-Detail funktioniert.
- Read/Create der Admin-Notizen bleiben unveraendert.
- Kein Backend-Code geaendert.
- Keine DB-Migration.
- Kein Admin-Note Update/Deactivate/Delete.
- Keine Rollen-/Permission-Schreibverwaltung.
```

## Technischer Ansatz

Bestehende API weiterverwenden:

```text
window.RdapAdminNotes.selectTargetUser(user)
window.RdapAdminNotes.openUserDetail(user)
```

Empfohlene Umsetzung in RDAP51:

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js erweitern.
```

Warum dort:

```text
Die Datei enthaelt bereits Admin-Notizen-Zieluser-Auswahl und Admin-User-Detail.
Der Bruecken-Workflow gehoert genau zwischen diese beiden bestehenden Frontend-Bereiche.
```

Nicht empfohlen:

```text
Keine neue Admin-Notizen-Datei.
Keine neue User-Detail-Datei.
Keine neue Backend-Route.
Keine neue Datenbanktabelle.
Keine neue Permission-Logik.
```

## Safety-Grenzen

RDAP51 bleibt reiner UI-/Komfort-Step:

```text
Keine produktiven Writes.
Keine Remote-Actions.
Keine Agent-Actions.
Keine OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

Admin-Notizen-Schreiben bleibt exakt wie bisher:

```text
Nur vorhandene Create-Funktion.
Nur sichtbar bei serverseitig erkannter write-Berechtigung.
Backend prueft weiterhin confirmWrite, Permission, Audit, Lock und Readback.
```

## Warum nicht direkt Permission-/Rollen-Write?

Rollen-/Permission-Schreibverwaltung waere ein eigener grosser Sicherheitsblock:

```text
- Owner/Admin-Pruefung.
- confirmWrite.
- Audit mit Grund.
- Lock.
- Backup/Rollback.
- Readback.
- klare UI gegen versehentliche Rechtevergabe.
```

Deshalb wird zuerst die sichere Navigation zwischen User-Detail und Admin-Notizen verbessert.

## Geaenderte Dateien in RDAP50

```text
docs/current/RDAP50_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP50.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Kein Webserver-Deploy

```text
RDAP50 ist Plan-only / Doku.
Kein Webserver-Deploy noetig.
```
