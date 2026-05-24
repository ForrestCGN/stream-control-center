# STEP303 – Sound Dashboard Bus-Monitor Auto Refresh

Stand: 2026-05-24

## Ergebnis

Der Sound Dashboard Bus-Monitor wurde um einen rein lesenden Auto-Refresh erweitert.

## Datei

```text
htdocs/dashboard/modules/sound.js
```

## Änderung

- Auto-Refresh alle 5 Sekunden, wenn `activeSection === 'busmonitor'`.
- Auto-Refresh stoppt beim Verlassen des Tabs.
- Manuelles `Status neu laden` bleibt rein lesend.
- Refresh nutzt ausschließlich `GET /api/sound/status`.
- Anzeige der letzten Aktualisierungszeit ergänzt.

## Nicht geändert

- Keine Backend-Logik.
- Keine Sound-Queue.
- Keine Bundle-/activeBundleLock-Logik.
- Keine SoundBus-Event-Logik.
- Keine Alert-/Discord-/TTS-/VIP-Module.
- Keine DB-Migration.

## Prüfung

```cmd
node --check htdocs/dashboard/modules/sound.js
```

Ergebnis: OK.
