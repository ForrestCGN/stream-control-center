# VIP30 STEP8.19.16 – Dashboard Texte-Editor Name-Position

## Zweck
Sicherer Dashboard-Zwischenschritt kurz vor Stream:
- Kein Backend-Umbau
- Keine Live-/Twitch-/Reward-/Slot-Logik geändert
- Nur VIP30 Dashboard Texte-Tab für das neue Overlay-Prinzip angepasst

## Dateien
- `htdocs/dashboard/modules/vip30.js`
- `htdocs/dashboard/modules/vip30.css`
- optional mitgeliefert:
  - `config/examples/vip30_overlay_sets_simple_name_position.json`
  - `docs/sql/VIP30_STEP8_19_15_overlay_sets_update.sql`

## Geändert
- `alerts.overlaySets` unterstützt im Dashboard jetzt `namePosition`
  - `top` = Username über Headline
  - `bottom` = Username unter Headline
- Neue Textsets im Dashboard verwenden keine `{displayName}`-Headline mehr.
- Legacy-Platzhalter `{displayName}` / `{login}` werden in der Dashboard-Anzeige defensiv aus Headline entfernt.
- Texte-Tab-Hinweise wurden auf neues Prinzip angepasst.
- Pro Textset gibt es eine Mini-Preview.
- Perks/Chips bleiben als Legacy-Feld erhalten, sind aber als im neuen VIP30-Overlay nicht sichtbar markiert.

## Nicht geändert
- Backend
- SQLite-Schema
- Live-Reward
- Twitch VIP Vergabe/Entzug
- Redemption Fulfill/Cancel
- Slots
- Cleanup
- Sound-System-Bundle
- Media-System
- Overlay-Playback

## Schneller Test
1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Deploy nach normalem Workflow.
3. Dashboard öffnen.
4. VIP30 > Texte:
   - Textsets sichtbar?
   - Name-Position Dropdown sichtbar?
   - Mini-Preview sichtbar?
   - Texte speichern funktioniert?
5. VIP30 > Aktionen:
   - Alert-Test mit `CrazyMeerschweinchen`.

## Syntaxcheck
```cmd
cd /d D:\Git\stream-control-center
node -c htdocs\dashboard\modules\vip30.js
```

## StepDone
```cmd
cd /d D:\Git\stream-control-center
.\stepdone.cmd "VIP30 STEP8.19.16 Dashboard Texte-Editor Name-Position"
```
