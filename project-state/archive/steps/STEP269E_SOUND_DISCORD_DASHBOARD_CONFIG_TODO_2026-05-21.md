# STEP269E - Sound-/Discord-Routing spaeter dashboardfaehig machen

Stand: 2026-05-21

## Ziel

Die in STEP269A bis STEP269C bestaetigte Sound-/Discord-Integration soll spaeter nicht dauerhaft nur ueber Code-/DB-Defaults gesteuert werden, sondern sauber im Dashboard/Control-Center konfigurierbar sein.

## Aktueller bestaetigter Stand

- Sound-System bleibt Master fuer Queue, Prioritaet, Cooldowns und Bundle-Lock.
- Discord ist ein Ausgabeziel des Sound-Systems, keine zweite fachliche Queue.
- `target=both` spielt Stream/Device bzw. Overlay und Discord.
- Automatisches Discord-Routing funktioniert fuer passende Kategorien/Quellen.
- VIP-/Mod-Sounds wurden von hartem `target=stream` auf konfigurierbares `soundSystemTarget` umgestellt und laufen bestaetigt nach Discord.

## Spaeter dashboardfaehig machen

Folgende Einstellungen sollen spaeter im Dashboard konfigurierbar werden:

- Discord-Ausgabe global aktiv/deaktivierbar.
- Auto-Routing aktiv/deaktivierbar.
- Kategorien fuer Discord-Routing editierbar, z. B. `alert`, `alert_critical`, `channel_reward`, `vip`, `crew`, `tts`.
- Quellen fuer Discord-Routing editierbar, z. B. `alert_system`, `alert_tts`, `soundalerts`, `vip_mod`, `tts_system`.
- Standard-Ziel pro Modul bzw. Bereich:
  - SoundAlerts/Kanalpunkte
  - VIP-/Mod-Sounds
  - Alerts
  - Alert-TTS
  - normales Chat-TTS
- Zielwerte pro Bereich:
  - `stream`
  - `discord`
  - `both`
- Discord-Voice-Status im Dashboard anzeigen:
  - Bot ready
  - Voice verbunden
  - aktueller Discord-Sound
  - Queue-Laenge
  - letzter Fehler
- Testbutton im Dashboard fuer Discord-Soundausgabe.
- Optional pro Sound/Regel ueberschreibbar, ohne bestehende Defaults zu zerstoeren.

## Technische Leitplanken

- Dashboard greift nicht direkt auf SQLite oder Dateien zu.
- Einstellungen laufen ueber vorhandene Backend-APIs/Settings-Strukturen.
- Keine parallele Discord-Queue neben dem Sound-System bauen.
- Keine Alert-/SoundAlert-/VIP-/TTS-Module doppelt an Discord koppeln, wenn das Sound-System bereits Master ist.
- JSON darf Seed/Fallback bleiben; aktive Verwaltung soll spaeter DB-/Settings-basiert erfolgen.
- Keine Funktionalitaet entfernen.

## Geeignete spaetere Umsetzung

Wahrscheinlicher spaeterer STEP:

```text
Sound-System Dashboard: Discord Routing Settings
```

Betroffene Bereiche dann voraussichtlich:

```text
backend/modules/sound_system.js
htdocs/dashboard/modules/sound_system.js
htdocs/dashboard/modules/sound_system.css
project-state/*
docs/current/CURRENT_SYSTEM_STATUS.md
```

Nur umsetzen, wenn der aktuelle Live-Test mit Alerts, SoundAlerts, VIP-/Mod-Sounds und TTS stabil bleibt.
