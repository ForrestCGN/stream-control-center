# Channelpoints STEP522 – Sound-System Routing Defaults

Stand: STEP522 / Backend 0.9.10 / Dashboard UI 1.0.6

## Ziel

Channelpoints soll bei Sound- und Video-Rewards nicht selbst entscheiden, ob über Overlay, Device oder beides abgespielt wird. Diese Entscheidung gehört zentral ins Sound-System.

## Änderungen

- Media-Rewards setzen kein `outputTarget` mehr.
- Alte/gespeicherte `outputTarget`-Werte werden im Channelpoints-Ausführungspfad ignoriert.
- `outputTargetMode` wird nur noch als `sound_system` markiert.
- Sound-/Video-Rewards werden immer an das Sound-System mit Queue-Verhalten übergeben.
- `playBehavior` ist für Media-Rewards immer `queue`.
- `queueIfBusy` ist für Media-Rewards immer `true`.
- Standard-Ziel für Media-Rewards ist `both` = Stream + Discord.
- Das Dashboard entfernt die Queue-/Ausgabe-Auswahl im normalen Media-Editor.
- Das Dashboard zeigt stattdessen einen Hinweis, dass Sound-System Routing, Queue, Priorität, Device/Overlay und Discord-Ausgabe entscheidet.

## Erwartete Logik

```text
Channelpoints Redemption
→ Media-ID + Media-Typ + Ziel + Kategorie + Priorität
→ /api/sound/play
→ Sound-System entscheidet Queue, OutputTarget, Device/Overlay, Discord-Routing
```

## Bewusst nicht enthalten

- Kein Umbau am Sound-System.
- Kein neues Override-System.
- Keine neue Datenbank.
- Keine Entfernung bestehender Reward-Funktionen.

Output-Overrides sollen später im Sound-System beziehungsweise über dessen Regelwerk sauber umgesetzt werden.
