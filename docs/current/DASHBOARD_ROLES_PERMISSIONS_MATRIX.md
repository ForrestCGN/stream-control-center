# DASHBOARD ROLES PERMISSIONS MATRIX

Stand: 2026-06-22
Step: RDAP1 / Remote Dashboard Agent Plan
Status: Planung, keine Umsetzung

## 1. Ziel

Diese Datei plant die Rollen- und Rechtebasis für Dashboard-v2.

Wichtigster Grundsatz:

```text
Twitch-Rollen helfen bei der Erkennung.
Lokale Dashboard-Rollen und Permissions entscheiden, was jemand wirklich darf.
```

Es gibt kein blindes 1:1-Mapping von Twitch-Rollen auf Systemrechte.

---

## 2. Geplante Rollen

Geplante lokale Dashboard-Rollen:

```text
Owner
Admin
Lead-Mod
Mod
Readonly
Sound-Profi
Media-Manager optional
```

Kurzbeschreibung:

| Rolle | Zweck |
|---|---|
| Owner | Vollzugriff, Sicherheits-/Systemhoheit, finale Übernahme |
| Admin | Verwaltung, Module, Configs, User ohne Owner-Sonderrechte |
| Lead-Mod | starke Stream-/Mod-Steuerung, aber keine Security-/Systemrechte |
| Mod | Alltag: Events bedienen, Logs sehen, begrenzte Aktionen |
| Readonly | nur ansehen, keine produktiven Aktionen |
| Sound-Profi | Media/Sounds/Commands/Kanalpunkte im erlaubten Sound-Bereich |
| Media-Manager | optional: Media pflegen, aber keine Commands/Kanalpunkte |

---

## 3. Twitch-Rollen-Mapping

Twitch-Rollen liefern nur Vorschläge oder Vorauswahl.

Mögliche Vorschlagslogik:

| Twitch-Rolle | Lokaler Vorschlag |
|---|---|
| Broadcaster | Owner |
| Moderator | Mod oder Lead-Mod |
| VIP | kein automatischer Admin-Zugriff |
| Subscriber | kein automatischer Dashboard-Zugriff |
| Editor | optionale Spezialrolle, lokal bestätigen |

Regeln:

- Lokale Freigabe bleibt führend.
- Twitch-Mod bedeutet nicht automatisch Admin.
- VIP/Sub bedeutet nicht automatisch Dashboard-Zugriff.
- Rollen können manuell enger oder weiter gesetzt werden.
- Kritische Rechte müssen immer lokal bestätigt werden.

---

## 4. Permission-Gruppen

Geplante Permission-Gruppen:

```text
dashboard.view
stream.status.view

modules.view
modules.control.basic
modules.control.critical

texts.view
texts.edit
texts.approve

settings.view
settings.edit.safe
settings.edit.critical

media.view
media.upload
media.edit
media.delete
media.restore
media.assign

sounds.test
sounds.play.live
sounds.stop
sounds.pause

commands.view
commands.edit
commands.activate
commands.delete

channelpoints.view
channelpoints.edit
channelpoints.activate
channelpoints.delete

overlays.view
overlays.preview
overlays.edit.layout
overlays.control.visibility

logs.view.basic
logs.view.audit
logs.export

users.view
users.edit
roles.edit
permissions.edit

locks.view
locks.takeover

agent.view
agent.control
agent.actions.execute

system.view
system.diagnostics
system.security
```

---

## 5. Schutzstufen

Geplante Schutzstufen:

| Stufe | Bedeutung |
|---:|---|
| 0 | Lesen / Anzeigen |
| 1 | normale Bedienung |
| 2 | produktive Aktion |
| 3 | kritische Änderung |
| 4 | Security / System / Owner |

Beispiele:

| Bereich | Schutzstufe |
|---|---:|
| Dashboard ansehen | 0 |
| Event-Status ansehen | 0 |
| Sound testen ohne Live-Ausgabe | 1 |
| Sound live testen | 2 |
| Shot-Alarm starten/stoppen | 2 |
| Media hochladen | 2 |
| Media löschen | 3 |
| Texte bearbeiten | 2 |
| Config sicher ändern | 2 |
| kritische Config ändern | 3 |
| User/Rechte ändern | 4 |
| Agent deaktivieren | 4 |
| Audit-Logs ansehen | 3 bis 4 |

---

## 6. Grobe Rollenmatrix

| Permission/Bereich | Owner | Admin | Lead-Mod | Mod | Readonly | Sound-Profi | Media-Manager |
|---|---:|---:|---:|---:|---:|---:|---:|
| Dashboard ansehen | ja | ja | ja | ja | ja | ja | ja |
| Module ansehen | ja | ja | ja | ja | ja | ja | ja |
| Module normal bedienen | ja | ja | ja | begrenzt | nein | begrenzt | nein |
| Kritische Aktionen | ja | ja/begrenzt | begrenzt | nein | nein | nein | nein |
| Texte ansehen | ja | ja | ja | ja | ja | ja | ja |
| Texte bearbeiten | ja | ja | begrenzt | nein/begrenzt | nein | soundbezogen | nein |
| Configs ansehen | ja | ja | begrenzt | nein/begrenzt | nein | soundbezogen | mediabezogen |
| Configs bearbeiten | ja | ja | begrenzt | nein | nein | soundbezogen | mediabezogen |
| Media ansehen | ja | ja | ja | ja | ja | ja | ja |
| Media hochladen | ja | ja | begrenzt | nein/begrenzt | nein | ja | ja |
| Media bearbeiten | ja | ja | begrenzt | nein | nein | ja | ja |
| Media löschen | ja | ja/begrenzt | nein | nein | nein | ja, Papierkorb | ja, Papierkorb |
| Sounds testen | ja | ja | ja | begrenzt | nein | ja | begrenzt |
| Commands bearbeiten | ja | ja | begrenzt | nein | nein | ja, soundbezogen | nein |
| Kanalpunkte bearbeiten | ja | ja | begrenzt | nein | nein | ja, soundbezogen | nein |
| Overlays steuern | ja | ja | begrenzt | begrenzt | nein | soundbezogen | nein |
| Overlay-Layout bearbeiten | ja | ja | nein/begrenzt | nein | nein | nein/begrenzt | nein |
| Logs ansehen | ja | ja | ja | begrenzt | begrenzt | relevante Logs | relevante Logs |
| Audit-Logs ansehen | ja | ja/begrenzt | nein/begrenzt | nein | nein | eigene/relevante | nein/begrenzt |
| Locks übernehmen | ja | ja | begrenzt | nein | nein | eigene Bereiche | eigene Bereiche |
| User/Rollen/Rechte | ja | begrenzt | nein | nein | nein | nein | nein |
| System/Security | ja | begrenzt | nein | nein | nein | nein | nein |
| Agent-Verwaltung | ja | begrenzt | nein | nein | nein | nein | nein |

---

## 7. Owner

Owner darf:

- alles ansehen
- alles bedienen
- User verwalten
- Rollen verwalten
- Permissions verwalten
- Admins setzen
- Locks übernehmen
- Agenten verwalten/deaktivieren
- Security-Einstellungen ändern
- Audit-Logs sehen
- kritische Aktionen bestätigen
- finale Systementscheidungen treffen

Owner-Rechte sollten nicht automatisch an Twitch-Rollen außer Broadcaster-Vorschlag vergeben werden.

---

## 8. Admin

Admin darf typischerweise:

- Module verwalten
- Configs bearbeiten
- Texte bearbeiten
- Media verwalten
- Overlays verwalten
- Logs sehen
- eingeschränkt User verwalten
- Locks übernehmen
- Agent-Status sehen
- bestimmte Remote-Actions ausführen

Admin darf nicht automatisch:

- Owner entfernen
- Owner-Rechte vergeben
- Security-Secrets sehen
- Agent-Secrets im Klartext sehen
- kritische Systembereiche ohne Owner-Freigabe ändern

---

## 9. Lead-Mod

Lead-Mod darf typischerweise:

- Stream-Module bedienen
- Events steuern
- Giveaways/Glücksrad/Shot-Alarm bedienen
- relevante Logs sehen
- bestimmte Texte/Configs begrenzt bearbeiten
- bestimmte Locks übernehmen, falls freigegeben

Lead-Mod darf nicht automatisch:

- User/Rechte verwalten
- Agenten verwalten
- System/Security ändern
- DB-/Debugbereiche nutzen
- kritische Configs ändern

---

## 10. Mod

Mod darf typischerweise:

- Dashboard ansehen
- Streamstatus sehen
- freigegebene Module bedienen
- einfache Aktionen auslösen
- begrenzte Logs sehen

Mod darf nicht automatisch:

- Texte bearbeiten
- Configs bearbeiten
- Media löschen
- Commands bearbeiten
- Kanalpunkte bearbeiten
- User verwalten
- System/Agent/Security verwalten

---

## 11. Readonly

Readonly darf:

- freigegebene Bereiche ansehen
- Status sehen
- ggf. Logs eingeschränkt sehen

Readonly darf nicht:

- produktive Aktionen ausführen
- speichern
- löschen
- testen
- Locks erstellen
- Remote-Actions senden

---

## 12. Sound-Profi

Sound-Profi ist eine interne Dashboard-Spezialrolle, keine Twitch-Rolle.

Soll dürfen:

```text
media.view
media.upload
media.edit
media.delete optional mit Papierkorb
media.assign

sounds.test
sounds.pause optional
sounds.stop_current optional

commands.view
commands.edit soundbezogen

channelpoints.view
channelpoints.edit soundbezogen

logs.view.basic sound/media/commands

locks.view eigene Bereiche
locks.takeover eigene Bereiche optional
```

Soll nicht automatisch dürfen:

```text
users.edit
roles.edit
permissions.edit
system.security
agent.control
db.*
audit voll
owner actions
freie Diagnose/Testfunktionen
```

Wichtig:

- Sound-Profi darf Sound-/Media-/Command-/Kanalpunkte-Arbeit machen.
- Sound-Profi bekommt keine System-/Security-/Owner-Rechte.
- Live-Ausgaben brauchen ggf. separate Freigabe oder Bestätigung.

---

## 13. Media-Manager optional

Media-Manager könnte später dürfen:

```text
media.view
media.upload
media.edit
media.delete optional mit Papierkorb
media.restore
media.assign
logs.view.basic media
locks.view media
```

Media-Manager soll nicht automatisch dürfen:

```text
commands.edit
channelpoints.edit
sounds.play.live
system.*
users.*
roles.*
permissions.*
agent.*
```

Diese Rolle ist optional, falls Sound-Profi zu breit wird.

---

## 14. Modulfreigaben

Neben Rollen braucht es Modulfreigaben.

Beispiele:

```text
module.hug_system.view
module.hug_system.control
module.shot_alarm.view
module.shot_alarm.control
module.stream_events.view
module.stream_events.control
module.loyalty.view
module.loyalty.control
module.media.view
module.media.manage
module.overlays.view
module.overlays.manage
module.admin.view
```

Grund:

```text
Eine Rolle sagt, was eine Person grundsätzlich darf.
Modulfreigaben sagen, wo sie es darf.
```

---

## 15. Texte / Configs / Media / Commands / Kanalpunkte / Overlays / Logs / Admin / Locks

### Texte

- Lesen: viele Rollen möglich
- Bearbeiten: Admin, Owner, ggf. Lead-Mod/Sound-Profi bereichsweise
- Freigabe/Approve: Owner/Admin oder später Freigabe-Workflow

### Configs

- Lesen: Admin/Owner, ggf. Modulverantwortliche
- sichere Configs ändern: Admin/Owner, ggf. Lead-Mod bereichsweise
- kritische Configs ändern: Owner/Admin begrenzt

### Media

- ansehen: breit möglich
- hochladen: Admin/Owner/Sound-Profi/Media-Manager
- bearbeiten: Admin/Owner/Sound-Profi/Media-Manager
- löschen: nur mit Papierkorb, Audit und ggf. Bestätigung

### Commands

- ansehen: Admin/Owner/Sound-Profi/Lead-Mod bereichsweise
- bearbeiten: Admin/Owner, Sound-Profi soundbezogen
- löschen/deaktivieren: Admin/Owner, ggf. Sonderrecht

### Kanalpunkte

- ansehen: Admin/Owner/Sound-Profi/Lead-Mod bereichsweise
- bearbeiten: Admin/Owner, Sound-Profi soundbezogen
- aktivieren/deaktivieren: Admin/Owner, ggf. Sonderrecht

### Overlays

- ansehen/vorschau: viele Rollen möglich
- Sichtbarkeit steuern: Admin/Owner/Lead-Mod/Mod bereichsweise
- Layout bearbeiten: Admin/Owner, Spezialfreigabe

### Logs

- einfache Logs: Admin/Owner/Lead-Mod/Mod bereichsweise
- Audit-Logs: Owner/Admin, Spezialfreigabe
- Security-Logs: Owner

### Admin

- Admin-Bereich nur mit explizitem Recht sichtbar.
- Technische Tests/Diagnose nicht in normale Modulbereiche.

### Locks

Lock-pflichtige Bereiche:

```text
texts:*
settings:*
overlay:*
command:*
channelpoints:*
media:item:*
media:category:*
```

Lock-Regeln:

- Lock beim Klick auf Bearbeiten.
- Andere User sehen den Bereich nur lesend.
- Heartbeat hält Lock aktiv.
- Timeout bei Inaktivität.
- Speichern/Abbrechen gibt Lock frei.
- Logout gibt Lock frei.
- Owner/Admin darf übernehmen.
- Lock-Aktionen werden auditierbar geloggt.

---

## 16. Offene Fragen

Noch zu klären:

1. Soll Lead-Mod Texte bearbeiten dürfen oder nur bestimmte Module bedienen?
2. Soll Sound-Profi Media wirklich löschen dürfen oder nur in Papierkorb verschieben?
3. Braucht Media-Manager eine eigene Rolle oder reicht Sound-Profi?
4. Welche Mods bekommen lokale Dashboard-Zugänge?
5. Welche Rechte brauchen Engel/Roxxy konkret?
6. Welche Aktionen brauchen zusätzliche Bestätigung?
7. Welche Admin-Unterbereiche sollen Admins sehen, ohne Owner zu sein?
8. Wie granular sollen Modulfreigaben werden?
9. Wie werden temporäre Rechte für Events vergeben?
10. Wie werden gesperrte User/entzogene Twitch-Rollen synchron behandelt?

---

## 17. Nicht Teil dieses Steps

Nicht Teil dieses Planungssteps:

- keine Auth-Implementierung
- kein Permission-Code
- keine DB-Migration
- kein Dashboard-v2-Code
- kein Agent-Code
- keine Twitch-Login-Änderung
