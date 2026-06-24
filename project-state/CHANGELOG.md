# CHANGELOG - stream-control-center

## 2026-06-24 - RDAP_USERMENU2_CLEAN_PROFILE_ACTIONS_AND_DOCS

Zusammenfassung:

- Self-Profilpanel aufgeräumt
- `Mein Login` und `Zugriff` aus dem Profilpanel entfernt
- `Profil aktualisieren` bleibt erhalten
- `Ausloggen` bleibt im Profilpanel erhalten
- Doku, TODO, NEXT_STEPS, FILES, CURRENT_STATUS und Handoff/PROMPT aktualisiert
- Keine Backend-/Auth-/DB-/Remote-Action-Änderungen

## 2026-06-24 - RDAP_TOPBAR1_REMOVE_DUPLICATE_LOGOUT

Zusammenfassung:

- Doppelten `Ausloggen`-Button aus der Topbar entfernt
- Logout bleibt im Profilpanel
- Keine Backend-/Auth-/DB-Änderungen

## 2026-06-24 - RDAP_ADMIN_USERS1_READONLY_OVERVIEW

Zusammenfassung:

- Admin -> User & Rollen read-only ergänzt
- Bekannte Dashboard-User sichtbar
- Rollen-/Gruppen-/Permissions-Modell sichtbar
- Keine DB-Writes/Remote-Actions

## 2026-06-24 - RDAP_AUTH4_DOCS_FINALIZE

Stand:

```text
RDAP_AUTH4_SELF_TWITCH_PROFILE_SYNC
```

Zusammenfassung:

- Bestätigten Auth4-Stand dokumentiert
- Avatar-/Profil-Sync-Stand festgehalten
- Projektstatus/TODO/NEXT_STEPS/FILES aktualisiert
- Keine Code-/Backend-/DB-/Frontend-Dateien geändert

## 2026-06-24 - RDAP_AUTH4_SELF_TWITCH_PROFILE_SYNC

Zusammenfassung:

- Self-Service `Profil aktualisieren` im Profilpanel ergänzt
- Eigene Twitch-Daten können neu synchronisiert werden
- Aktualisiert eigenen Anzeigenamen/Login/Avatar
- Keine Admin-Userverwaltung
- Keine Rollen-/Freigabe-Writes
- Keine Remote-Actions

## 2026-06-24 - RDAP_LAYOUT2_GRID_SPACING_FIX

Zusammenfassung:

- Grid-/Spacing-Fehler korrigiert
- `metrics-grid`/`metric-grid` Klassenabweichung behoben
- Progress-Klassen an V13-Struktur angepasst
- Login/Avatar/Usermenü unverändert gelassen

## 2026-06-24 - RDAP_LOGIN1_CENTER_LAYOUT_FIX

Zusammenfassung:

- Login-Seite zentriert
- Access-Denied-Seite zentriert
- Kein Backend/Auth/DB geändert

## 2026-06-24 - RDAP_AUTH3_TWITCH_AVATAR_PROFILE_IMAGE

Zusammenfassung:

- DB-Spalten für Twitch-Avatar vorbereitet/angelegt
- Twitch `profile_image_url` wird gespeichert
- `/api/remote/auth/me` kann Avatar liefern
- Avatar oben rechts sichtbar nach neuem Login

## 2026-06-24 - RDAP_USERMENU1_SELF_PROFILE_PANEL

Zusammenfassung:

- Avatar/Name oben rechts klickbar
- Self-Profilpanel eingebaut
- Eigene Rollen/Rechte/Session read-only sichtbar
- Logout im Profilpanel

## 2026-06-24 - RDAP_PERMISSIONS1_ROLE_ALLOWLIST_UI

Zusammenfassung:

- Read-only Zugriff-/Rollenmodell-UI vorbereitet
- DB/Auth-Modell sichtbar
- Keine DB-Writes und keine Rollenverwaltung

## 2026-06-24 - RDAP_DESIGN1C_TRUE_V13_PORT

Zusammenfassung:

- Remote-Modboard näher an Dashboard-v2 Design-Test v13 portiert
- V13-Topbar/Sidebar/Card-Struktur übernommen
- Auth/Login/Diagnose erhalten

## 2026-06-24 - RDAP_WORKFLOW_MASTERPROMPT_FIX

Zusammenfassung:

- RDAP-Webserver-Deploy-Arbeitsweise verbindlich dokumentiert
- Korrektes Muster dokumentiert: frischer GitHub/dev-Clone nach `/opt/stream-control-center/_deploy_tmp/STEP_NAME`, danach `sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev`
- Keine Code-/Auth-/Design-Dateien geändert
