# STEP320 – Sound Dashboard Control Center

Stand: 2026-05-24

## Ziel

Der Sound-System-Bereich im Dashboard wurde von reinem Monitoring zu einem sicheren Control-Center erweitert.

## Geändert

```text
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
```

## Funktionen

- Neuer Bereich `Sound Control Center` in Übersicht und Queue-Tab.
- Aktueller Sound sichtbar.
- Queue-Anzahl sichtbar.
- Pause/Resume sichtbar und steuerbar.
- Stop aktueller Sound.
- Skip aktueller Sound.
- Queue leeren mit Browser-Bestätigung.
- Bundle-Lock und Current Bundle sichtbar.
- Fehlerzähler für Sound/Device/Discord sichtbar.
- Queue-Zeilen zeigen mehr Kontext: Quelle, Kategorie, User, Bundle-Rolle, Bundle-ID und Datei.

## Sicherheits-/Architekturgrenzen

- Keine Backend-Logik geändert.
- Keine Queue-Logik geändert.
- Keine Bundle-/activeBundleLock-Logik geändert.
- Keine SoundBus-Eventlogik geändert.
- Keine Alert-/Discord-/TTS-/VIP-Module geändert.
- Keine DB-Migration.
- Es werden ausschließlich vorhandene Sound-Backend-APIs verwendet.

## API-Nutzung

Lesend:

```text
GET /api/sound/status
```

Steuerung über bestehende APIs:

```text
POST /api/sound/pause
POST /api/sound/resume
POST /api/sound/stop
POST /api/sound/skip
POST /api/sound/clear
```

`Queue leeren` erfordert im Dashboard eine zusätzliche Browser-Bestätigung.
