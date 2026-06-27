Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
- GitHub/dev ist Wahrheit.
- Erst echte Dateien lesen, dann Plan nennen, dann auf `go` warten.
- Keine Code-/ZIP-Erstellung vor `go`.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine parallelen Strukturen erfinden.
- Modulnamen sichtbar deutsch/klar halten, nicht kryptisch.
- Sichtbar Version + kurzer deutscher Buildname verwenden, keine langen RDAP-Namen in Normalanzeigen.

Aktueller Stand:
- RDAP119 hat die UI modularisiert und erste Seiten als Module nachladbar gemacht.
- RDAP120 hat Version `0.2.1`, deutschen Buildnamen, Modulmanifest, Permission-Metadaten und Runtime-Scope eingefuehrt.
- RDAP121 hat Version `0.2.2`, deutschen Buildnamen `Zentrale Sprachdateien`, zentrale Sprach-Registry und Sprachdateien `de/en` eingefuehrt.
- Modulmanifest nutzt jetzt Sprachschluessel mit Fallbacks.
- Frontend-Rechte sind nur Anzeige/Navigation; Backend bleibt Sicherheitsinstanz.
- Keine DB-Migration.
- Keine neuen produktiven Writes.
- Keine Agent-Actions.

Wichtige Dateien:
- `remote-modboard/backend/server.js`
- `remote-modboard/backend/src/app.js`
- `remote-modboard/backend/src/routes/status.routes.js`
- `remote-modboard/backend/public/index.html`
- `remote-modboard/backend/public/assets/remote-modboard.js`
- `remote-modboard/backend/public/assets/languages/registry.js`
- `remote-modboard/backend/public/assets/languages/de.js`
- `remote-modboard/backend/public/assets/languages/en.js`
- `remote-modboard/backend/public/assets/modules/module-manifest.js`
- `remote-modboard/backend/public/assets/modules/modules/catalog.js`

Naechster sinnvoller Schritt:
`RDAP122_LOCAL_DASHBOARD_RUNTIME_PROFILE`

Ziel:
- lokalen Modus wirklich aktivierbar machen,
- LAN-Profil sauber definieren,
- UI-Badge fuer Online/Lokal-Modus anzeigen,
- lokale Nutzung als Ersatz fuer altes Dashboard vorbereiten,
- weiterhin keine OBS-/Sound-/Shell-/Agent-Actions.
