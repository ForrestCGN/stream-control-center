# VIP30 / 30TageVIP

Stand: 2026-06-06  
Aktueller stabiler Arbeitsstand: STEP8.18.3 + finale Doku STEP8.18.4

## Kurzbeschreibung

VIP30 ist ein Node-basiertes 30-Tage-VIP-System im `stream-control-center`.

Es verarbeitet Twitch-Kanalpunkte-Redemptions über EventSub/Bridge, vergibt VIP, schreibt Slots, fulfilled/cancelt Redemptions korrekt und löst einen Sound-System-Alert mit Overlay aus.

## Status

```txt
✅ System funktionsfähig
✅ Live-Redemption getestet
✅ VIP-Grant getestet
✅ Slot-Write getestet
✅ Redemption-Fulfill getestet
✅ Sound-Bundle getestet
✅ Overlay getestet
✅ SoundPool getestet
✅ OverlaySets/Zufallstexte getestet
✅ Avatar im manuellen Test angezeigt
✅ externer VIP-Remove getestet
```

## Backend

Aktuelle Backend-Version:

```txt
moduleVersion: 0.8.14
moduleBuild: step8.18.2-avatar-resolve-test-user
```

Wichtige Funktionen:

```txt
triggerVip30AlertSoundBundle()
buildVip30SoundBundlePayload()
pickWeightedVip30Sound()
pickWeightedVip30OverlaySet()
twitchResolveUserProfile()
enrichVip30ResultUserProfile()
triggerVip30ManualAlertTest()
```

## Dashboard

Tabs:

```txt
Übersicht
Slots
Logs
Config
Sounds
Texte
Aktionen
Diagnose
```

### Sounds

Setting:

```txt
alerts.soundPool
```

Beispiel:

```json
[
  {
    "id": "vip30-sound-1",
    "enabled": true,
    "weight": 1,
    "mediaId": 1413,
    "mediaPath": "",
    "durationMs": 0,
    "label": "VIP30 Sound 1"
  }
]
```

Regel:

```txt
durationMs = 0 -> Auto aus Media-System/ffprobe
durationMs > 0 -> manuelle Dauer in ms
```

### Texte

Setting:

```txt
alerts.overlaySets
```

Beispiel:

```json
[
  {
    "id": "heimleitung-upgrade",
    "enabled": true,
    "weight": 3,
    "kicker": "Upgrade im CGN-Altersheim",
    "headline": "{displayName} wird Ehrenbewohner.",
    "subline": "Die Rentner begrüßen freundlich.",
    "message": "Ein kleines VIP-Upgrade wurde genehmigt.",
    "perks": ["Keks extra", "Sessel vorgewärmt"],
    "brand": "CGN VIP-Lounge"
  }
]
```

## Manueller Alert-Test

Endpunkt:

```txt
POST /api/vip30/alert/test
```

Dashboard:

```txt
Aktionen -> Anzeigename/Login zum Auflösen -> VIP30 Alert testen
```

Sicherheit:

```txt
kein Twitch VIP Grant
kein Slot Write
kein Redemption Fulfill/Cancel
nur Twitch User-Lookup + Alert-Bundle
```

## Avatar-Auflösung

Ablauf:

```txt
avatarUrl vorhanden -> direkt verwenden
avatarUrl fehlt -> Twitch /helix/users Lookup per userId oder login
Lookup erfolgreich -> profile_image_url an Overlay übergeben
Lookup fehlgeschlagen -> Overlay-Fallback mit Initial/Icon
```

Beim echten Alertpfad wird vor dem Bundle-Bau ebenfalls versucht, fehlende Avatare zu ergänzen.

## Offenes Overlay-Thema

Im neuen Chat soll das Overlay verbessert werden:

```txt
lange Namen
Headline-Fit
Textgrößen/Lesbarkeit
Chips/Perks
Card-Proportionen
Avatarbereich
```

Funktionalität dabei nicht entfernen.
