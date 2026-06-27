# RDAP57_PERMISSION_READ_DETAIL_CATEGORIES_POLISH_PREPARED

Datum: 2026-06-26
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP57 setzt den in RDAP56 geplanten kleinen Frontend-only Polish um.

Ziel ist eine bessere read-only Einordnung der effektiven Rollenrechte im bestehenden Admin-User-Detail-Bereich.

## Ausgangspunkt

RDAP55B bestaetigte live:

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

RDAP56 plante als naechsten kleinen Scope eine read-only Gruppierung der Rollenrechte.

## Geaendert

Geaendert wurde nur:

```text
remote-modboard/backend/public/assets/rdap53-permission-read-detail.js
```

Die bestehende RDAP53/RDAP55-Datei wurde erweitert. Es wurde keine neue Parallelstruktur gebaut.

## Umgesetzt

Die Karte `Effektive Rollen-Rechte` gruppiert die read-only Modellanzeige jetzt nach Bereichen:

```text
Admin
Agent / Status
Dashboard / Remote
Sonstige Rechte
```

Admin-/Write-nahe Rechte werden deutlicher als Modellanzeige markiert:

```text
Modellanzeige: keine UI-Schreibfreigabe.
```

Zusaetzlich zeigen bekannte Permission-Keys kurze read-only Erklaerungen, zum Beispiel:

```text
admin.users.note.write -> Admin-Note Create ist bewusst vorbereitet/live; Update, Deactivate und Delete bleiben aus.
admin.roles.manage -> Modell zeigt ein Verwaltungsrecht; Rollen-/Gruppen-Schreibverwaltung ist in der UI weiterhin nicht gebaut.
agent.status.read -> Agent-/Statusdaten lesen; keine Agent-Actions.
dashboard.read -> Dashboard anzeigen.
remote.view -> Remote-Modboard anzeigen.
```

## Erhalten geblieben

```text
0-Targets-Erklaerung bleibt erhalten.
Diagnose bleibt erhalten.
Quelle bleibt /api/remote/auth/model.
Admin-Notizen-Bridge bleibt unberuehrt.
```

## Technischer Scope

```text
Frontend-only.
Bestehendes /api/remote/auth/model wird weiterverwendet.
Keine Aenderung an app.js.
Keine Aenderung an index.html.
Keine neue Backend-Route.
Keine Service-Aenderung.
Keine DB-Migration.
Keine Writes.
```

## Sicherheitsbewertung

RDAP57 ist nur Anzeige-/UX-Polish.

```text
Keine Permission-/Rollen-/Gruppen-Schreibbuttons.
Keine Session-Revocation.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein physisches Delete.
Keine Community-Read-Anbindung fuer Admin-Notizen.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

Die Anzeige administrativer oder write-naher Permission-Keys bleibt ausschliesslich eine read-only Modellanzeige. Sie ist keine UI-Freigabe und keine serverseitige Sicherheitsentscheidung.

## Lokaler Test

```powershell
node --check .\remote-modboard\backend\public\assets\rdap53-permission-read-detail.js
git status --short
git diff --stat
```

## Live-Test nach Deploy

```text
Admin -> User-Detail oeffnen.
ForrestCGN auswaehlen.
Effektive Rollen-Rechte muessen nach Bereichen gruppiert sein.
Admin-/Write-nahe Rechte muessen als Modellanzeige erklaert sein.
Modulbezogene Rechte / 0 Targets Erklaerung muss erhalten bleiben.
Diagnose muss erhalten bleiben.
Keine Schreibbuttons sichtbar.
Admin-Notizen-Bridge bleibt funktionsfaehig.
```

## Deploy-Hinweis

RDAP57 aendert eine Datei unter `remote-modboard/`.

Nach lokalem Test und `stepdone.cmd` ist ein Webserver-Deploy aus frischem GitHub/dev-Clone noetig:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP57_PERMISSION_READ_DETAIL_CATEGORIES_POLISH_PREPARED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP57_PERMISSION_READ_DETAIL_CATEGORIES_POLISH_PREPARED
cd RDAP57_PERMISSION_READ_DETAIL_CATEGORIES_POLISH_PREPARED
sudo bash tools/remote-modboard-deploy.sh RDAP57_PERMISSION_READ_DETAIL_CATEGORIES_POLISH_PREPARED dev
```

Kein zusaetzlicher manueller `systemctl restart` nach dem Deploy-Script.
