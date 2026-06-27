# LC-CORE-POINTS-3D – Doku-Update-Notizen

Stand: 2026-06-15

Diese Datei ist eine Ergänzung für die aktuellen Projektstandsdateien, falls `CURRENT_STATUS.md`, `TODO.md`, `NEXT_STEPS.md`, `FILES.md` und `CHANGELOG.md` im Zielsystem bereits umfangreiche Inhalte enthalten und nicht blind überschrieben werden sollen.

## Für CURRENT_STATUS.md

```text
LC-CORE-POINTS-3D abgeschlossen und live bestätigt.
Twitch EventSub Support-Events laufen für Loyalty nun über den zentralen twitch_events → Communication Bus → loyalty Pfad.
loyalty.js Version 0.1.17 nutzt 7 gezielte Subscriptions für follow/sub/resub/subgift/giftbomb/cheer/raid.
twitch.js Version 0.1.9 leitet Support-EventSub-Events an twitch_events weiter.
Der alte EventSub→Loyalty Direktforward ist standardmäßig deaktiviert und nur noch per TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD=true als Notfall-Fallback aktivierbar.
Live-Test mit channel.cheer / akighosty bestätigt: supportEvents.forwarded=1, loyalty.processed=1, loyalty.skipped=0, legacy.forwarded=0, errors=0.
```

## Für NEXT_STEPS.md

```text
Nächster Schritt: LC-CORE-POINTS-3E – weitere echte Twitch-Eventtypen prüfen (Follow, Sub/Resub, Raid, GiftSub/GiftBomb) und danach entscheiden, ob der deaktivierte Legacy-Direktforward komplett entfernt oder noch als Notfall-Fallback behalten wird.
Danach: Twitch Events → Alert-System Integration separat planen. Alert-System nicht ohne eigene Prüfung umbauen.
```

## Für TODO.md

```text
- [ ] Echte Eventtypen zusätzlich testen: Follow, Sub/Resub, Raid, GiftSub/GiftBomb.
- [ ] Prüfen, ob legacyLoyaltyDirectForward nach weiteren Tests komplett entfernt werden kann.
- [ ] Alert-System als nächsten Consumer von twitch_events separat planen.
- [ ] Donation-/Tip-Events separat als neutrales Payment-/Donation-Event planen, nicht als Twitch-natives Event.
```

## Für CHANGELOG.md

```text
2026-06-15 – LC-CORE-POINTS-3D
- Loyalty Twitch-Bonus-Events laufen jetzt produktiv über twitch_events und Communication Bus.
- Loyalty-Subscription von breiter received-Subscription auf 7 gezielte Channels umgestellt.
- twitch.js leitet Support-EventSub-Events an twitch_events weiter.
- Legacy EventSub→Loyalty Direktforward standardmäßig deaktiviert, Env-Fallback bleibt möglich.
- Hotfix für /api/twitch/eventsub/status eingespielt.
- Live-Test mit channel.cheer erfolgreich: neuer Bus-Weg verarbeitet Event allein, Legacy schreibt nicht mehr.
```

## Für FILES.md

```text
Geänderte Dateien:
- backend/modules/loyalty.js – Version 0.1.17, gezielte Twitch-Event-Bonus-Subscriptions.
- backend/modules/twitch.js – Version 0.1.9, Support-EventSub-Forward zu twitch_events, Legacy-Direktforward standardmäßig deaktiviert.

Neue/aktualisierte Doku:
- docs/current/CURRENT_CHAT_HANDOFF_LC_CORE_POINTS_3D_DOCUMENTED.md
- docs/current/NEXT_CHAT_PROMPT_LC_CORE_POINTS_3D.md
- docs/current/LC_CORE_POINTS_3D_DOC_UPDATE_NOTES.md
```
