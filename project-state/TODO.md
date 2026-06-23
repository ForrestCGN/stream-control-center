# TODO

Stand: DASHUI2.DOC1 / Frontend-Tech-Entscheidung konkretisiert  
Datum: 2026-06-23

## Offen / nächste Planung

### DASHUI3 / Minimaler React-Prototyp

Status: offen, nur nach explizitem `go`.

Aufgaben:

- entscheiden, ob DASHUI3 direkt als Code-Prototyp gebaut wird oder erst als weitere Detailplanung
- `frontend/dashboard-v2/` als neue Frontend-Quelle planen/erstellen
- `React + Vite` Minimalsetup vorbereiten
- AppShell mit Topbar, Sidebar, PageHeader und ModuleTabs bauen
- eine Beispielseite erstellen, bevorzugt Remote Agent/Uebersicht
- Modul-Registry und Navigation-Registry minimal anlegen
- CGN-Basisstyles/Tokens anlegen
- Build-Output nach `htdocs/dashboard-v2/` vorbereiten
- keine produktive Modulmigration
- keine alten Dashboard-v1-Dateien umbauen

### RDAP5 / Webserver-App-Minimalplanung

Status: offen.

Aufgaben:

- Webserver-Node-App-Konzept fuer `127.0.0.1:3000` planen
- WSS-Endpunkt fuer Agent planen
- Agent-Registry planen
- Session-/Login-Basismodell planen
- Audit-Grundstruktur planen
- Reverse-Proxy-/nginx-Planung vorbereiten
- noch keine produktiven Remote-Actions

### Agent / Sicherheit

Status: offen.

Aufgaben:

- Secret-Handling konkretisieren
- Agent-Config-Beispiel spaeter ohne echte Secrets erstellen
- Allowlist-Struktur fuer spaetere Agent-Actions planen
- Payload-Validierung planen
- Request-Timeouts und Expiry-Regeln spaeter in Code uebernehmen

### Permissions / Locks

Status: offen.

Aufgaben:

- RDAP4-Modell spaeter in konkrete DB-/API-Planung ueberfuehren
- `resourceKey`-Konventionen weiter sammeln
- Edit-Session-/Lock-UI fuer Dashboard-v2 planen
- Lock-Audit-Anzeigen planen
- Konfliktanzeige bei `resourceVersion` planen

### Doku-Nachpflege

Status: offen.

Aufgaben:

- alte Referenzen auf `modboard.forrestcgn.de` bei Gelegenheit auf `mods.forrestcgn.de` vereinheitlichen
- DASHUI2 nach Einspielen per StepDone bestaetigen
- neue DASHUI2-Dateien in spaeteren neuen Chats als Pflichtkontext aufnehmen

## Dauerhaft beachten

- Keine Funktionalität entfernen.
- Keine produktive SQLite löschen, ersetzen oder droppen.
- Keine Patch-/Apply-/Regex-/Append-Scripte.
- Vollständige Dateien mit echten Zielpfaden liefern.
- Node-Neustart nur nennen, wenn Backend-Dateien geändert wurden.
- Bei reinen Doku-/Frontend-Static-Steps keinen Backend-Neustart verlangen.
- Tests/Diagnose getrennt von normaler Bedienoberfläche halten.
- GitHub/dev bleibt Prüfquelle, solange keine aktuelleren Live-Dateien oder ZIPs vorliegen.
