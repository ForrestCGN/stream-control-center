# Changelog

## STEP289 – Sound-System Bus Event Mirror / Native Status Output

Datum: 2026-05-24T13:45:00Z

- `backend/modules/sound_system.js` auf STEP289 erweitert.
- Additiven `soundBus`-Config-Block ergänzt.
- `soundBus` als erlaubten DB-Settings-Block für `/api/sound/settings` ergänzt.
- `/api/sound/status` um `step` und `soundBus`-Status erweitert.
- Communication-Bus-Events für Sound-State, Queue, Items, Bundles, Device, Discord und Client-Acks vorbereitet.
- Bestehenden WebSocket-Status `op: sound_system` erhalten.
- Bestehende Sound-APIs nicht verändert.
- Keine Queue-, Bundle-, Dedupe-, Cooldown- oder Interrupt-Logik verändert.
- Keine Caller-Module umgestellt.
- Keine Funktionalität entfernt.

## STEP288 – Sound-System Bus Audit & Migrationsplan

Datum: 2026-05-24T13:40:00Z

- Sound-System als zentralen nächsten Bus-Migrationsblock analysiert.
- Sound-System-Nutzer dokumentiert.
- Schutzregeln für Queue, Bundles, activeBundleLock, Dedupe, Cooldowns und Interrupts dokumentiert.
- Sicheren Migrationspfad festgelegt: Sound-System bleibt Master, Bus zuerst nur Event-/Status-Schicht.
- Keine Code-Änderung.
