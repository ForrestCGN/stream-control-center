# Modul-Doku Deep-Dive Status

Stand: 2026-05-26 / STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE

## Ziel dieses STEPs

Dieser STEP beginnt die echte Modul-/Helper-Dokumentation in Tiefe. Im Gegensatz zu STEP475 geht es nicht nur um Struktur, sondern um konkrete Informationen aus den geprüften Backend-Dateien:

```text
Routen
Exporte
wichtige Funktionen
Config-/Env-Werte
Datenbanktabellen
Statusfelder
Abhängigkeiten
Tests
offene Punkte
```

## In diesem STEP vertieft dokumentiert

```text
docs/modules/core-communication-bus.md
docs/modules/core-stream-status.md
docs/modules/core-database-sqlite.md
docs/modules/core-security-audit.md
docs/modules/helpers-overview.md
docs/modules/helper-config-core.md
docs/modules/helper-texts-settings.md
docs/modules/helper-media-chat-twitch.md
```

## Bewusst nicht geändert

```text
Backend-Code
Dashboard-Code
Overlay-Code
Config-Dateien
Datenbank
project-state Archiv-Move-Script
Shoutout-System
```

## Nächster Doku-Block

Empfohlen:

```text
STEP477_MODULE_DOCS_STREAM_MODULES_DEEP_DIVE
```

Module:

```text
clip_shoutout
alert_system
sound_system
vip_sound_overlay
clips
tts_system
```

Danach:

```text
STEP478_MODULE_DOCS_COMMUNITY_AND_INTEGRATIONS_DEEP_DIVE
```

Erst danach sollte wieder am Shoutout-Dashboard weitergebaut werden, falls die Doku-Aufräumung ausreichend ist.
