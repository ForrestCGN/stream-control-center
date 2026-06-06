# VIP30 / 30TageVIP

Stand: 2026-06-06  
Backend-Version: `0.8.9` / `step8.14-overlay-sets-design05`  
Dashboard-Stand: `STEP8.15 OverlaySet Editor`

## Status

VIP30 STEP8.14 ist vollständig live getestet. STEP8.15 verbessert die Dashboard-Bearbeitung der OverlaySets.

## Erfolgreich getestete Flows

```txt
✅ Twitch Reward Einlösung
✅ EventSub Redemption
✅ VIP30 Bridge
✅ Twitch VIP Grant
✅ Slot Write
✅ Redemption Fulfill
✅ Sound-System Bundle
✅ CGN Split Lounge Overlay
✅ manueller VIP-Remove
✅ Slot-Freigabe external_removed
```

## OverlaySets

VIP30 nutzt gewichtete, zusammengehörige Textsets:

```txt
id
enabled
weight
kicker
headline
subline
message
perks
brand
```

## Dashboard STEP8.15

`alerts.overlaySets` wird jetzt im Dashboard als Karten-Editor dargestellt.

Funktionen:

```txt
- Textset hinzufügen
- Textset duplizieren
- Textset entfernen
- aktiv/deaktivieren
- Gewichtung einstellen
- Kicker/Headline/Subline/Message/Brand bearbeiten
- Perks als Zeilen bearbeiten
```

Der Editor schreibt weiterhin in das bestehende Setting:

```txt
alerts.overlaySets
```

## Auto-Reload

Dashboard-Aktualisierung darf aktive Eingaben nicht überschreiben.

STEP8.15 nutzt deshalb:

```txt
dirty-state pro Setting
focus-schutz im Config-Tab
Auto-Refresh für read-only Statusdaten
Verwerfen-&-Neu-laden Button
```

## Designreferenzen

```txt
docs/design/CGN_SPLIT_LOUNGE_DESIGN.md
docs/design/VIP30_SPLIT_LOUNGE_DESIGN.md
```
