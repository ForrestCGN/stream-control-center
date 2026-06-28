# Current Status

Stand: 2026-06-28

Aktuell: `0.2.19 - lokale OBS-Inventar UI als Mod-Bedienflaeche read-only vorbereitet`.

Umgesetzt:

```text
- OBS-Seite ist auf spaetere Mod-Bedienung ausgerichtet, bleibt aber read-only.
- Aktuelle OBS-Szene wird prominent angezeigt.
- Produktive Szenen werden aus inventory.scenes gefiltert: Name beginnt nicht mit `_`.
- Interne `_`-Szenen werden in der normalen Mod-Ansicht ausgeblendet.
- Audioquellen zeigen read-only Mute-Status, ohne Mute/Unmute-Button.
- Quellen werden nur als kompakte Vorschau angezeigt.
- Rollen-/Rechte-Zielbild fuer spaetere OBS-Bedienung ist sichtbar vorbereitet.
```

Nicht umgesetzt / weiterhin verboten:

```text
keine OBS-Steuerung
keine Agent-Actions
keine produktiven Writes
keine DB-Migration
keine Shell-/Datei-/Prozess-Actions
keine freien OBS requestType Payloads
```
