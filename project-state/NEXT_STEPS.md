# NEXT STEPS – nach STEP301

## STEP302 – Sound Dashboard Bus-Monitor Readonly Refresh Fix

Ziel:

- Den Button `Status neu laden` im Bus-Monitor strikt lesend machen.
- Keine Backend-Reload-Aktion durch diesen Button auslösen.
- Stattdessen nur Dashboard-/Statusdaten neu laden.

Voraussichtliche Datei:

```text
htdocs/dashboard/modules/sound.js
```

Optional nur falls Styling nötig:

```text
htdocs/dashboard/modules/sound.css
```

## Wichtig

- Keine Sound-Queue ändern.
- Keine Bundle-/`activeBundleLock`-Logik ändern.
- Keine SoundBus-Event-Logik ändern.
- Keine Alert-/Discord-/TTS-/VIP-Module ändern.
- Bestehende globale Sound-System-Steuerbuttons bleiben unverändert.
