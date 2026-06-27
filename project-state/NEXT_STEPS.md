# Next Steps

Stand: 2026-06-27

Naechster sinnvoller technischer Schritt nach `0.2.10C - Dashboard-v2 V13/Modboard-Design wirklich uebernommen`:

```text
0.2.10D - Dashboard-v2 Topbar V13 exakt nachziehen
```

Grund:

```text
Forrest hat im lokalen Sichttest bestaetigt:
Die obere feste Leiste/Topbar sieht noch nicht gut aus.
```

Ziel:

1. Topbar im lokalen Dashboard-v2 exakt gegen Netz-Modboard/V13 angleichen.
2. Dazu echte Referenzen lesen:
   - `docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md`
   - `docs/reference/dashboard-v2-design-test-v13/index.html`
   - `docs/reference/dashboard-v2-design-test-v13/assets/dashboard-v2-design-test-v13.css`
   - `docs/reference/dashboard-v2-design-test-v13/assets/dashboard-v2-design-test-v13.js`
   - `remote-modboard/backend/public/index.html`
   - `remote-modboard/backend/public/assets/remote-modboard.css`
   - `remote-modboard/backend/public/assets/remote-modboard.js`
3. Topbar-Spalten, Hoehe, Abstaende, Breadcrumb, Suche, Quick-Chips, Refresh, DE, Lock und Userbereich korrigieren.
4. `body.is-scrolled .cgn-topbar` inklusive heller Rand/Glow/Shadow sauber uebernehmen/testen.
5. Keine fachliche Erweiterung, bis die Topbar passt.
6. Keine Backend-/DB-/Action-Aenderung.
7. `/dashboard` stabil lassen.

Pflicht-Pruefdateien fuer 0.2.10D:

```text
frontend/dashboard-v2/src/layout/Topbar.jsx
frontend/dashboard-v2/src/layout/AppShell.jsx
frontend/dashboard-v2/src/styles/global.css
frontend/dashboard-v2/src/app/navigation.js
frontend/dashboard-v2/src/app/moduleRegistry.js
htdocs/dashboard-v2/index.html
htdocs/dashboard-v2/assets/*
```

Danach erst wieder sinnvoll:

```text
0.2.11 - Moduluebersicht read-only vorbereiten
```

Nicht sofort bauen:

```text
Kontrollierter Online-Sync lokaler Aenderungen
OBS-/Sound-/Overlay-/Command-Steuerung
produktive lokale Writes
```
