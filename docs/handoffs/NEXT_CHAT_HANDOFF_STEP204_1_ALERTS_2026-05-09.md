# NEXT CHAT HANDOFF – STEP204.1 Twitch Sub/Gift Rule Cleanup

Stand: 2026-05-09  
Projekt: stream-control-center

## Ausgangspunkt

STEP204 hat das Twitch-Mapping erweitert. STEP204.1 hat danach die produktiven Alert-Regeln per API bereinigt und getestet.

## Wichtigster Stand

Sub/Gift/Resub sind jetzt fachlich getrennt:

```text
sub = normaler Sub, channel.subscribe is_gift=false
gifted_sub_received = empfangener GiftSub, channel.subscribe is_gift=true, aktuell bewusst ignoriert
resub = channel.subscription.message
gift_sub = channel.subscription.gift total 1-4
gift_bomb = channel.subscription.gift total >=5
```

## Aktueller Live-Regelbestand

```text
ID 55 | twitch | sub       | Sub Standard                          | 0+    | Sound 44 | aktiv
ID 56 | twitch | sub       | Sub Regel deaktiviert - war falsch... | 10-20 | Sound 43 | inaktiv
ID 36 | twitch | resub     | Re-Sub                                | -     | Sound 40 | aktiv
ID 54 | twitch | gift_sub  | Gift Subs 1-4                         | 1-4   | Sound 50 | aktiv
ID 39 | twitch | gift_bomb | Sub-Bombe 5-9                         | 5-9   | Sound 42 | aktiv
ID 40 | twitch | gift_bomb | Sub-Bombe 10-20                       | 10-20 | Sound 43 | aktiv
ID 61 | twitch | gift_bomb | Sub-Bombe ab 21                       | 21+   | Sound 43 | aktiv
```

## Bestätigte Tests

- Normaler Sub spielte `Sub Standard` mit Sound `Eigener Sub`.
- `gifted_sub_received` wurde bewusst ignoriert und hat keinen Sound/Overlay ausgelöst.
- Resub spielte `Re-Sub`.
- GiftSub 1 und 4 spielten `Gift Subs 1-4`.
- Sub-Bombe 5 und 7 spielten `Sub-Bombe 5-9`.
- Sub-Bombe 10 spielte `Sub-Bombe 10-20`.
- Sub-Bombe 21 spielte `Sub-Bombe ab 21`.

## Nächste sinnvolle Schritte

1. Aktuellen Stand mit stepdone committen:
   ```powershell
   cd D:\Git\stream-control-center
   .\stepdone.cmd "docs: document twitch sub gift alert rule cleanup"
   ```

2. Danach optional:
   - TTS pro Text-Event vorbereiten.
   - HypeTrain-Regeln analysieren/aufbauen.
   - Dashboard-UX für `meta_json.match` und Spezialbedingungen planen.
   - Optional `gifted_sub_received` als bewusst deaktivierbare Regel im Dashboard anzeigen.
