# VIP30 / 30TageVIP

Stand: 2026-06-06  
Backend-Version: `0.8.14`  
Build: `step8.18.2-avatar-resolve-test-user`

## Status

VIP30 hat SoundPool, OverlaySets, manuellen Alert-Test und Avatar-Auflösung.

## Avatar-Auflösung

Wenn ein VIP30-Alert gebaut wird:

```txt
avatarUrl vorhanden
-> direkt an Overlay übergeben

avatarUrl leer + userLogin/displayName vorhanden
-> Twitch /helix/users Lookup
-> profile_image_url übernehmen

Lookup fehlschlägt
-> Overlay-Fallback mit Initial/Icon
```

## Manueller Test

Dashboard:

```txt
Aktionen -> VIP30 Alert testen
```

Neu:

```txt
Anzeigename/Login zum Auflösen
```

Der eingegebene Name wird als Twitch-Login-Kandidat verwendet und aufgelöst.

## Sicherheit

```txt
✅ kein Twitch VIP Grant
✅ kein Slot Write
✅ kein Redemption Fulfill/Cancel
✅ nur User-Lookup + Alert-Bundle
```

## Noch offen

Lange Namen im Overlay responsiv schöner darstellen. Das ist der nächste UI-Step.
