# MODULE DOCS DEEP DIVE STATUS – 2026-05-27

## Aktualisiert

- Channelpoints: STEP517 bis STEP527 zusammengefasst.
- Sound-System-Routing für Channelpoints dokumentiert.
- Media-Dateinamen-/UTF8-Cleanup dokumentiert.
- Handoff für neuen Chat aktualisiert.

## Kritisch

Der zuletzt relevante Ladefehler war:

```text
[module] FAILED: channelpoints.js
deleteRewardFromTwitch is not defined
```

Nach STEP527 muss das Channelpoints-Hauptmodul wieder geladen sein.

## Aktueller Fokus beim nächsten Weiterarbeiten

- STEP527 anwenden/testen.
- Neuen Reward speichern: Twitch wird erstellt, bleibt inaktiv.
- Übersichtsschalter aktiviert/deaktiviert nur Twitch.
