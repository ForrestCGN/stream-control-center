# STEP523 – Sound-System Auto-Output Defaults Fix

Stand: 2026-05-27

## Problem

Channelpoints übergibt bei Media-Rewards inzwischen `outputTargetMode: auto` und erzwingt kein Overlay mehr. Das Sound-System fiel bei fehlendem `outputTarget` trotzdem noch auf den alten Play-Default `defaults.outputTarget: overlay` zurück. Dadurch wurden Audio-Rewards trotz Ausgabe-Modus „Audiogerät“ über das Overlay gestartet.

## Änderung

Die Sound-System-Config wird als zentrale Standardquelle korrigiert:

- `output.defaultTarget` bleibt `device`
- `defaults.outputTarget` wird ebenfalls auf `device` gesetzt
- `output.targets.both.enabled` wird aktiviert
- `targets.discord` und `targets.both` sind aktiviert
- `test_ping` nutzt ebenfalls `outputTarget: device`

Damit gilt:

- Audio/Sound ohne explizites Output-Override läuft über Device
- Video wird vom Sound-System-Code weiterhin auf Overlay gezwungen
- Channelpoints-Ziel `both` kann Stream + Discord nutzen
- Queue-Entscheidung bleibt beim Sound-System

## Hinweis

Wenn in der SQLite-Tabelle `sound_settings` ein eigener `defaults`-Block gespeichert wurde, kann dieser die JSON-Config überschreiben. Dann muss der Dashboard-Speicherpfad später zusätzlich den `defaults.outputTarget` synchron setzen oder ein Sound-System-Codefix folgen, der `output.defaultTarget` in `normalizePlayRequest()` bevorzugt.
