# STEP201.1 Status-Notiz – API-Prefix-/Alias-Entscheidung

Stand: 2026-05-08

## Kurzfassung

API-Prefix-Strategie dokumentiert.

## Entscheidung

```text
Bestehende Routen bleiben.
Neue Standard-Routen dürfen als Alias ergänzt werden.
Keine bestehenden Streamer.bot-/Dashboard-/Overlay-Flows brechen.
Read-only zuerst.
```

## Wichtigste Fälle

```text
Sound-System: fertig, kein Alias nötig
TTS: fertig, kein Alias nötig
Alerts: /api/alerts/routes fehlt
SoundAlerts: /routes und /integration-check fehlen
VIP: echte Prefixe sind /api/vip-sound-overlay und /api/vip-sound, /api/vip wäre später nur Alias
Tagebuch: Legacy-Routen behalten, Standard-Endpunkte schrittweise ergänzen
```

## Nächster Schritt

```text
STEP201.2 – /routes-Endpunkte nachziehen
```
