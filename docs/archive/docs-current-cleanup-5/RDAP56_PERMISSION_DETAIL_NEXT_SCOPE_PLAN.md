# RDAP56_PERMISSION_DETAIL_NEXT_SCOPE_PLAN

Datum: 2026-06-26
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP56 plant den naechsten fachlichen Scope nach dem live bestaetigten Permission-Read-Detail-Strang RDAP52 bis RDAP55B.

RDAP56 ist Plan-only/Doku-only. Es wird nichts gebaut.

## Ausgangspunkt

Bestaetigter Stand aus RDAP55B:

```text
Admin -> User-Detail funktioniert weiter.
ForrestCGN @forrestcgn / tw:127709954 ist auswaehlbar.
Effektive Rollen-Rechte bleiben sichtbar.
8 Rollenrechte werden angezeigt.
Modulbezogene Rechte bleibt sichtbar.
0 Targets wird verstaendlich erklaert.
Diagnose zeigt rolePermissions/modulePermissions-Zaehler.
Keine Schreibbuttons fuer Rollen/Gruppen/Permissions/Sessions sichtbar.
```

Live-Diagnose:

```text
rolePermissions gesamt: 21
effektive Rollenrechte: 8
modulePermissions gesamt: 0
passende Module-/Targets: 0
Quelle: /api/remote/auth/model
```

## Bewertung

Der Permission-Read-Detail-Strang ist fachlich nutzbar und live bestaetigt.

Direkt danach keine Permission-Writes bauen.
Direkt danach keine Rollen-/Gruppenverwaltung bauen.
Direkt danach keine DB-Migration bauen.

Sinnvoll ist zuerst eine bewusste Scope-Entscheidung, ob read-only weiter verbessert wird oder ob der Strang vorerst abgeschlossen wird.

## Option A: Permission-Read-Details abschliessen

Der aktuelle Stand reicht vorerst aus.

Vorteile:

```text
- Kein weiterer UI-Aufwand.
- Kein Risiko fuer bestehende Admin-Notizen-Bridge.
- Keine neue Code-Aenderung.
- Fokus kann auf den naechsten grossen RDAP-Bereich wechseln.
```

Dann waere der naechste Step kein weiterer Permission-Detail-Polish, sondern ein neuer sauber geplanter Bereich.

## Option B: Read-only Rechte-Kategorien verbessern

Kleiner Frontend-only Folge-Step, aber nur read-only.

Moegliche Anzeige-Kategorien:

```text
Admin
- admin.audit.read
- admin.roles.manage
- admin.users.manage
- admin.users.note.read
- admin.users.note.write

Agent / Status
- agent.status.read

Dashboard / Remote
- dashboard.read
- remote.view
```

Ziel:

```text
Rechte sind schneller erfassbar, ohne eine Schreibverwaltung zu bauen.
```

Technischer Scope fuer einen moeglichen RDAP57:

```text
Nur bestehendes Asset erweitern:
remote-modboard/backend/public/assets/rdap53-permission-read-detail.js

Keine app.js-Aenderung.
Keine index.html-Aenderung.
Keine neue Backend-Route.
Keine DB-Migration.
Keine Writes.
```

## Option C: Read-only Erklaerung einzelner Permission-Keys

Kleiner Frontend-only Folge-Step, aber nur Anzeige.

Moegliche Zusatztexte:

```text
admin.audit.read -> Audit-/Protokollansicht lesen.
admin.roles.manage -> Modell zeigt Verwaltungsrecht, aber UI-Writes sind weiterhin nicht gebaut.
admin.users.manage -> Modell zeigt Verwaltungsrecht, aber User-Schreibverwaltung bleibt deaktiviert.
admin.users.note.read -> Admin-Notizen lesen.
admin.users.note.write -> Admin-Notiz Create ist bewusst vorbereitet; Update/Deactivate/Delete bleiben aus.
agent.status.read -> Agent-/Statusdaten lesen.
dashboard.read -> Dashboard anzeigen.
remote.view -> Remote-Modboard anzeigen.
```

Wichtig:

```text
Diese Texte duerfen keine Freigabe suggerieren.
Sie sind Erklaerung, keine Sicherheitsentscheidung.
```

## Option D: UX-/Doku-Plan fuer spaetere Permission-Verwaltung

Plan-only, noch keine Umsetzung.

Moegliche Themen:

```text
- Welche Write-Sicherungen waeren noetig?
- Wer darf Rollen/Gruppen vergeben?
- Welche Confirm-/Audit-/Lock-/Backup-Regeln gelten?
- Welche UI-Bereiche bleiben bis dahin ausgeblendet?
```

Das waere ein spaeterer, separater Write-Scope mit eigenem Plan, nicht Teil von RDAP56.

## Empfehlung

Empfohlen ist ein kleiner Plan-Step fuer RDAP57:

```text
RDAP57_PERMISSION_READ_DETAIL_CATEGORIES_POLISH_PREPARED
```

Richtung:

```text
Frontend-only.
Bestehende RDAP53-Datei erweitern.
Rollenrechte read-only nach Bereichen gruppieren.
Gefaehrliche/administrative Rechte klar als Modellanzeige markieren.
Keine Writes.
Keine neue Backend-Route.
Keine DB-Migration.
```

## Akzeptanzkriterien fuer RDAP57, falls umgesetzt

```text
Admin -> User-Detail bleibt erreichbar.
ForrestCGN bleibt auswaehlbar.
Effektive Rollen-Rechte bleiben sichtbar.
Rechte werden read-only nach Bereichen gruppiert.
Admin-/Write-nahe Rechte werden als Modellanzeige erklaert, nicht als UI-Freigabe.
Modulbezogene Rechte / 0 Targets Erklaerung bleibt erhalten.
Diagnose bleibt erhalten.
Keine Permission-/Rollen-/Gruppen-Schreibbuttons sichtbar.
Admin-Notizen-Bridge bleibt funktionsfaehig.
```

## Explizit nicht tun

```text
Keine Permission-Writes.
Keine Rollen-/Gruppen-Schreibverwaltung.
Keine Session-Revocation.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein physisches Delete.
Keine neue Backend-Write-Route.
Keine DB-Migration.
Keine Fake-Targets.
Keine Community-Read-Anbindung fuer Admin-Notizen.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```
