# STEP193.6.1 - SoundAlerts OBS Loader Standard

Stand: 2026-05-06

## Anlass

SoundAlerts erkennt die externe Browser Source als offline, wenn die SoundAlerts-Quelle in OBS deaktiviert oder nicht mehr aktiv geladen ist. Dadurch kann SoundAlerts nicht mehr sauber genutzt werden.

Gleichzeitig soll weder Bild noch Ton ueber das SoundAlerts-Overlay ausgegeben werden. Die Ausgabe soll weiterhin ueber das eigene Sound-System und die eigenen Overlays laufen.

## Entscheidung

Aktuell wird kein Node-/Headless-Browser-Loader gebaut. Stattdessen bleibt eine minimale OBS-Browserquelle als Loader dauerhaft aktiv.

## OBS-Standard

```text
OBS-Quelle: _SoundAlerts_Loader
URL: https://source.soundalerts.com/alert/6f35ccb8-42c5-4fd8-8a4d-154d1d47627f
Groesse: 1 x 1 px
Sichtbar: Ja
Audio: im OBS-Mixer stumm
Quelle herunterfahren, wenn nicht sichtbar: Aus
Browser aktualisieren, wenn Szene aktiv wird: Aus
Audio ueber OBS steuern: An
```

Optional kann die Quelle zusaetzlich ausserhalb der Leinwand positioniert werden, solange sie aktiv geladen bleibt.

## Wichtige Regel

```text
Die Quelle darf nicht per Auge deaktiviert werden.
Die Quelle darf nicht aus der aktiven Szenenstruktur entfernt werden.
Die Quelle bleibt als Loader aktiv, ist 1x1 px klein und stummgeschaltet.
```

## Ausgabe-Regel

```text
SoundAlerts-Overlay = nur Loader / Aktivhaltung
Eigenes Sound-System = Audio-/Video-Ausgabe
```

## Bewusst nicht umgesetzt

- Kein Node-Headless-Browser-Loader.
- Kein verstecktes SoundAlerts-Iframe im eigenen Sound-System-Overlay.
- Keine Backend-Aenderung.
- Keine DB-Aenderung.
- Keine neue API.

## Warum kein Iframe im eigenen Overlay?

Ein Cross-Origin-Iframe von SoundAlerts waere schwer sauber zu kontrollieren. Bild kann man verstecken, Audio aber nicht garantiert sauber abfangen. Deshalb bleibt der Loader vorerst in OBS, wo Audio sicher im Mixer stummgeschaltet werden kann.

## Naechster Schritt

Weiter mit `STEP193.6 - SoundAlerts Dashboard Layout Cleanup`.
