# Next Chat Handoff – STEP208 Alert Overlay Username Layout

Stand: 2026-05-09
Projekt: stream-control-center
Branch: dev

## Thema

Alert Overlay Design-Fix für lange Usernamen bei Twitch-Bits-Alerts.

## Aktueller Stand

Die Alert-Overlay-Datei wurde in mehreren kleinen Schritten angepasst:

- STEP208: Grundfix Username/Value-Struktur
- STEP208.1: Runtime-Fit gegen Umbruch
- STEP208.2: keine Ellipsis bei Usernamen
- STEP208.3: Full-Username-Row für maximal lange Namen

## Betroffene Datei

```text
htdocs/overlays/_overlay-alerts-v2.html
```

## Wichtigste Entscheidung

Bei Support-Alerts darf der Username nicht mit `...` gekürzt werden. Lieber wird:

1. die Schrift verkleinert,
2. die Textfläche verbreitert,
3. bei sehr langen Namen der linke Initial-Kreis ausgeblendet.

## Test

Maximaltest mit 25 Zeichen:

```text
CrazyMeerschweinchenTV123
```

Erwartung:

```text
CrazyMeerschweinchenTV123
cheert mit 1500 Bits
```

Vollständig sichtbar, ohne Ellipsis, ohne Umbruch.

## Nicht anfassen

- TTS ist bereits über STEP206/207 funktional.
- Sound-System nicht ändern.
- Queue nicht ändern.
- Backend nicht ändern, solange es nur um Overlay-Design geht.
- Keine Funktionalität entfernen.

## Nächste mögliche Designpunkte

- Nachrichtentext unten minimal lesbarer machen.
- Card-Höhe/Spacing für sehr lange Nachrichten prüfen.
- Optional separate Anzeigeprofile für Bits/Subs/Donations verfeinern.

