# CURRENT CHAT HANDOFF – LWG-4M.2

## Ziel
Giveaway Workflow im Backend schärfen:

```text
open
→ close
→ draw
```

## Codebasis
- Vorher: `STEP_LWG_4L_12`
- Jetzt: `STEP_LWG_4M_2`

## Änderungen

### Close
Neuer Alias:
- `POST /api/loyalty/giveaways/:giveawayUid/close`

Bestehender Endpunkt bleibt:
- `POST /api/loyalty/giveaways/:giveawayUid/close-entries`

Beide nutzen dieselbe Logik.

Close liefert:
- `messageKey = giveaway.closed`
- `message`
- `chatMessage`
- `shouldSendChat = true`

### Draw Guard
`POST /api/loyalty/giveaways/:giveawayUid/draw` blockiert jetzt, wenn Giveaway noch `open` ist.

Fehler:
- `giveaway_draw_requires_closed_entries`

Erwarteter Status:
- `closed_for_entries`

## Bewusste Grenze
Die Chatmeldung wird noch nicht automatisch an Twitch gesendet. LWG-4M.2 liefert sie nur sauber aus. Dashboard/Mod-Command kann sie danach weiterleiten.

## Nächster Schritt
- LWG-4M.3: Dashboard/Mod-Command Chat-Ausgabe verbinden oder Draw-Button-Workflow im Dashboard umstellen.
