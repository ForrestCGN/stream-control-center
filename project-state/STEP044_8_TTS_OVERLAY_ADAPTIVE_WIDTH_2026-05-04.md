# STEP044.8 - TTS Overlay Adaptive Width

Stand: 2026-05-04

## Zweck

Dieser Mini-STEP passt nur das TTS-Overlay-Layout an.

Problem aus dem Test:

- Bei sehr kurzen Texten wirkt die feste 900px-Card zu breit und leer.
- Gleichzeitig duerfen lange Texte und lange Twitch-Anzeigenamen das Layout nicht zerlegen.

## Geaenderte Datei

- `htdocs/overlays/_overlay-tts.html`

## Änderungen

- Card-Breite ist nun adaptiv.
- Standard-Maximalbreite bleibt `width=900`.
- Neue Mindestbreite: `minWidth=560`.
- Kurze Texte erzeugen eine kompaktere Card.
- Lange Texte duerfen bis zur Maximalbreite wachsen.
- Sehr lange Texte bleiben per Line-Clamp gekuerzt.
- Lange Anzeigenamen bleiben einzeilig mit Ellipsis.
- Avatar-Layout bleibt stabil.
- Keine Änderung an Backend, TTS, Sound-System oder DB.

## OBS URL Empfehlung

```text
http://127.0.0.1:8080/overlays/_overlay-tts.html?position=bottom&width=900&minWidth=560&bottom=110&scale=1&poll=1
```

Optional kompakter:

```text
http://127.0.0.1:8080/overlays/_overlay-tts.html?position=bottom&width=860&minWidth=520&bottom=110&scale=1&poll=1
```

## Dashboard-Vormerkung

Spaeter in `tts_settings` / `ttsOverlay` dashboardfaehig machen:

- `width`
- `minWidth`
- `bottom`
- `scale`
- `avatarSize`
- `maxTextLines`
- `showInnerBorder`
- `showAvatar`

## Test

Kurztext:

```text
!tts test
```

Langer Name / langer Text:

```text
!tts Dies ist ein sehr langer Testtext fuer das TTS Overlay mit langen Namen wie CrazyMeescheinchen, damit wir sehen ob die Card sauber bleibt.
```

Erwartung:

- Kurztext wirkt nicht mehr verloren.
- Lange Namen werden sauber gekuerzt.
- Lange Texte laufen nicht aus der Box.
- Ton kommt weiterhin ueber Sound-System.
