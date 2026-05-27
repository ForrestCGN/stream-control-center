# Channelpoints STEP521 – Output-Ziel an Sound-System delegieren

Stand: Backend v0.9.9 / Dashboard v1.0.5

## Ziel

Channelpoints entscheidet bei Sound-/Video-Rewards nicht mehr hart `outputTarget=overlay`. Standard ist jetzt: **Auto – Sound-System entscheidet**.

## Verhalten

- Media-Rewards übergeben weiterhin Media-ID, Media-Typ, Ziel (`stream`, `discord`, `both`), Kategorie `channel_reward`, Priorität und Queue-Wunsch.
- Ein `outputTarget` wird nur noch gesetzt, wenn es im Dashboard ausdrücklich erzwungen wurde.
- Alte Payloads mit `outputTarget=overlay` gelten ohne `outputTargetExplicit=true` nicht mehr als bewusst erzwungen.
- Das Sound-System bleibt zuständig für Device/Overlay/Both und Discord-Routing.

## Dashboard

Neue Auswahl im Media-Bereich:

- Auto – Sound-System entscheidet
- Device erzwingen
- Overlay erzwingen
- Device + Overlay erzwingen

Standard: Auto.

## Keine Änderungen

- Keine neue Datenbank.
- Keine Änderung am Sound-System.
- Keine neue Parallel-Queue in Channelpoints.
- EventBus-/Redemption-Flow bleibt unverändert.
