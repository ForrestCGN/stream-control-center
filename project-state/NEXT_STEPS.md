# Next Steps

Stand: 2026-06-27

Naechster sinnvoller technischer Step:

```text
RDAP124_LOCAL_STREAM_PC_LAN_START_DOCS_AND_MODULE_REGISTRATION_RULES
```

Ziel:

1. Lokalen Stream-PC/LAN-Startbetrieb konkretisieren.
2. Lokale Env-/Start-Konfiguration sauber dokumentieren.
3. Forrest-/Engel-LAN-Nutzung vorbereiten.
4. Neue lokale Dashboard-Seiten nur nach Modulregistrierungsregeln planen oder read-only vorbereiten.
5. Keine Agent-Actions aktivieren.
6. Keine OBS-/Sound-/Overlay-/Command-/Shell-/Datei-/Prozess-Actions aktivieren.

Bei neuen Modulen vorher lesen:

```text
docs/current/MODULE_REGISTRATION_RULES_CURRENT.md
remote-modboard/backend/public/assets/modules/module-manifest.js
remote-modboard/backend/public/assets/languages/de.js
remote-modboard/backend/public/assets/languages/en.js
```

Wichtige Regel:

```text
Neue Hauptmenues entstehen ueber manifest.modules.
Neue Seiten entstehen ueber manifest.pages.
Seiten geben mit moduleId an, wo sie hingehoeren.
```
