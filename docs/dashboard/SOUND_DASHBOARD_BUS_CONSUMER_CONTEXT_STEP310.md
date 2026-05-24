# STEP310 – Dashboard SoundBus Consumer Context

Stand: 2026-05-24

## Änderung

Der Dashboard-Tab `Sound-System → Bus-Monitor` zeigt nicht mehr nur Zähler und letzten Event, sondern auch die letzten SoundBus-Ereignisse mit normalisiertem Kontext.

## Anzeige

Neu sichtbar:

- Quellen im Bus-Cache
- letzte SoundBus-Events
- Aktion
- Label/Sound-ID
- Quelle
- Kategorie
- User
- Bundle-Rolle
- Uhrzeit

## Verhalten

Der Bus-Monitor bleibt rein lesend:

```text
GET /api/sound/status
```

Keine Steuerung, kein Reload-POST, keine Queue-Änderung.
