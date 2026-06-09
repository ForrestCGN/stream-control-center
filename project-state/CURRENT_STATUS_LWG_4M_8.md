# CURRENT_STATUS – Loyalty Giveaways / Glücksrad

Stand: LWG-4M.8 dokumentiert / Runtime-Test bestätigt
Aktualisiert: 2026-06-09 09:08:00 UTC

## Aktueller bestätigter Stand

### Backend
- Datei: `backend/modules/loyalty_giveaways.js`
- Aktiver Build im Live-Test: `STEP_LWG_4M_5`
- Status-API bestätigt: `ok=true`, `lastError` leer.

### Dashboard
- Datei: `htdocs/dashboard/modules/loyalty_games.js`
- LWG-4M.6 Dashboard-Fix bestätigt.
- Bei `Classic Single` und `Classic Multi` wird das Wheel-Preset-Feld nicht mehr als nutzbare Auswahl angezeigt.
- Bei `Wheel Single` und `Wheel Multi` bleibt die Wheel-Preset-Auswahl sichtbar.

## LWG-4M.7 Runtime-Test – bestätigt

Getesteter Ablauf:

```text
Wheel-Giveaway erstellt
→ Bound-Wheel draft
→ Giveaway open
→ Bound-Wheel active/locked
→ Ticket erstellt
→ Close setzt closed_for_entries
→ Draw erstellt Winner + Wheel-Permission
→ Claim/Spin funktioniert
→ Permission used
→ Giveaway finished
```

Bestätigte Testwerte:

```text
giveawayUid      = giveaway_1780995545068_2c87a1f1f5ac29b6
boundWheelUid   = giveawaywheel_1780995545068_2f414cc03a97a9f0
sourcePresetUid = preset_1780938582009_ab6884df2558206a
permissionUid   = wheelperm_1780995765045_4e8e39d2032285a6
spinUid          = spin_1780995865591_48baaf46f23b9a1f
sessionUid       = wheel_1780995865590_7106f4aa22a4e171
resultLabel      = Niete
```

Bestätigte Permission-Metadata:

```text
wheelPresetUid  = preset_1780938582009_ab6884df2558206a
wheelSnapshotUid = giveawaywheel_1780995545068_2f414cc03a97a9f0
boundWheelUid   = giveawaywheel_1780995545068_2f414cc03a97a9f0
sourcePresetUid = preset_1780938582009_ab6884df2558206a
wheelScope      = giveaway
wheelContext    = giveaway_bound_wheel
resultLabel     = Niete
```

## Bestätigte Guards

- Draw aus `open` wird korrekt blockiert mit `giveaway_draw_requires_closed_entries`.
- Close funktioniert auch dann weiter, wenn Twitch Presence Chat nicht verbunden ist (`twitch_chat_not_connected` ist nicht blockierend).
- Draw nach Close funktioniert.
- Claim/Spin setzt die Permission auf `used`.
- Giveaway wird nach Claim/Spin auf `finished` gesetzt.

## Aktuelle Einschränkung

Die Option `Neues Rad für dieses Giveaway` erzeugt aktuell nur eine Bound-Wheel-Hülle ohne eigene Feldbasis. Solange kein Bound-Wheel-Field-Editor bzw. kein echter Bound-Wheel-Field-Snapshot existiert, ist diese Option fachlich noch nicht sinnvoll nutzbar.

Für Live-/Runtime-Tests und praktische Nutzung muss derzeit eine Vorlage verwendet werden:

```text
Wheel-Preset: Vorlage kopieren: <aktives Preset>
```

## Nächster sinnvoller Schritt

Entscheidung:

1. Kurzfristig: `Neues Rad für dieses Giveaway` im Dashboard deaktivieren/ausblenden, bis der Field-Editor vorhanden ist.
2. Danach/alternativ: Echten Bound-Wheel-Field-Editor bzw. Field-Snapshot bauen.
