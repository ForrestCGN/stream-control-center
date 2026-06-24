# CHANGELOG - stream-control-center

## 2026-06-24 - RDAP_DESIGN1C_DOCS_FINALIZE

Stand:

```text
RDAP_DESIGN1C_TRUE_V13_PORT / RDAP_DESIGN1C_DOCS_FINALIZE
```

Zusammenfassung:

- `RDAP_DESIGN1C_TRUE_V13_PORT` als bestätigten Remote-Modboard-Designstand dokumentiert
- Vorherige Zwischenstände `RDAP_DESIGN1` und `RDAP_DESIGN1B` als überholt markiert
- V13-Port als neue Designbasis für weitere RDAP-UI-Arbeiten festgehalten
- Nächsten sinnvollen Step `RDAP_PERMISSIONS1_ROLE_ALLOWLIST_UI` gesetzt
- EngelCGN-Testzugriff über Allowlist-Hinweis dokumentiert
- Weiterhin keine Remote-Writes, Agent-Actions oder OBS-/Sound-/Overlay-/Command-Steuerung aktiviert
- Keine Code-/Backend-/Auth-/DB-Dateien in diesem Doku-Abschluss geändert

## 2026-06-24 - RDAP_DESIGN1C_TRUE_V13_PORT

Stand:

```text
RDAP_DESIGN1C_TRUE_V13_PORT
```

Zusammenfassung:

- Remote-Modboard-Frontend näher an `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE` portiert
- V13-Klassen/Struktur übernommen: `cgn-galaxy`, `cgn-topbar`, `cgn-layout`, `cgn-sidebar`, `cgn-nav`, `nav-group`, `nav-sub`, `nav-link`, `cgn-content`, `page-header`, `cgn-card`, `cgn-chip`
- RDAP-IDs/API-Bindings erhalten
- Login-/Denied-/Dashboard-Ansichten im V13-Stil umgesetzt
- Keine Backend-/Auth-/DB-/Routen-Änderungen

## 2026-06-24 - RDAP_DESIGN1B_LAYOUT_FIX

Stand:

```text
RDAP_DESIGN1B_LAYOUT_FIX
```

Zusammenfassung:

- Remote-Modboard-Layout nach erstem Browsercheck korrigiert
- Navigation wieder als kompakte Sidebar umgesetzt
- Feste Topbar nach Dashboard-v2/Design-Test-v13-Richtung eingebaut
- Status-Chips in die Topbar gelegt
- Content-Bereich sauber neben Sidebar strukturiert
- Login-/Denied-Seite im gleichen CGN-/Neon-Galaxy-Stil belassen
- Keine Backend-/Auth-/DB-/JS-Logik geändert
- Keine Remote-Writes, Agent-Actions, OBS-/Sound-/Overlay-/Command-Steuerung aktiviert

## 2026-06-24 - RDAP_WORKFLOW_MASTERPROMPT_FIX

Stand:

```text
RDAP_WORKFLOW_MASTERPROMPT_FIX
```

Zusammenfassung:

- RDAP-Webserver-Deploy-Arbeitsweise verbindlich dokumentiert
- Falsche Annahme `/opt/stream-control-center/tools/remote-modboard-deploy.sh` korrigiert
- Korrektes Muster dokumentiert: frischer GitHub/dev-Clone nach `/opt/stream-control-center/_deploy_tmp/STEP_NAME`, danach `sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev`
- Keine Code-/Auth-/Design-Dateien geändert
