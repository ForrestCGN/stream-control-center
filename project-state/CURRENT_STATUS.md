# Current Status – stream-control-center

Stand: 2026-05-20

## STEP238 - Message-Rotator Output-Mode

- Message-Rotator ist weiterhin STABLE.
- Ausgabeart ist jetzt konfigurierbar:
  - `chat`
  - `announcement`
- Globale Settings liegen weiter in `message_rotator_settings`.
- Texte liegen weiter in `module_text_variants` mit `module_name = message_rotator`.
- Dashboard kann globale Ausgabeart/Farbe und pro Item Overrides speichern.
- Runtime liefert Streamer.bot-Steuerfelder, damit Streamer.bot normal posten oder Twitch-Announcement nutzen kann.
- Default bleibt `chat`; vorhandene Abläufe brechen dadurch nicht.

# Current Status – stream-control-center

Stand: 2026-05-18

## Loyalty / Kekskrümel

- Loyalty läuft weiterhin im Shadow-Modus.
- Aktuelle Version: `0.1.11`.
- STEP207 ergänzt AutoRunner Boot Recovery:
  - Wenn Node/Backend während eines aktiven Streams neu startet und der gespeicherte Stream-State weiterhin live ist, startet der AutoRunner beim Modul-Init automatisch wieder.
  - Dadurch soll verhindert werden, dass Watch-Punkte nach einem Backend-Neustart bis Streamende ausfallen.
- STEP208 ergänzt Subscribe/Resub-Dedupe:
  - Wenn Twitch für denselben User kurz nacheinander `subscribe` und `resub` liefert, wird der vorherige Subscribe kompensiert.
  - Der Resub bleibt die maßgebliche Buchung.
  - Standard-Zeitfenster: 60 Sekunden.
- Keine GiftSub-/GiftBomb-, Watch-Punkte- oder DB-Schema-Logik wurde in STEP208 geändert.

## DeathCounter V2

- DeathCounter DB-Storage ist STABLE.
- Produktiv liest und schreibt der DeathCounter aus/in die DB.
- JSON wird nicht mehr automatisch dual geschrieben.
- JSON-Backup/Export erfolgt manuell über `!dcount backup` / `!dcount export` bzw. API-Export.
- Overlay ist optisch an den Alert-Außenrahmen angepasst.
- STEP263 verlangsamt die Overlay-Slide-Transition minimal, ohne Funktionalität zu ändern.

## Aktive Projektregel

Keine Funktionalität entfernen. Bestehende APIs, Streamer.bot-Flows, Overlay-Logik und DB-Struktur bleiben erhalten, sofern nicht explizit anders entschieden.

## STEP239 - Message-Rotator Backend Direct Output

Der Message-Rotator wurde so erweitert, dass er nicht mehr zwingend Streamer.bot zum Senden benötigt.

Neue/erweiterte Einstellung:

```text
messageOptions.deliveryMode = backend | streamerbot | response_only
messageOptions.outputMode = chat | announcement
messageOptions.announcementColor = primary | blue | green | orange | purple
```

Standardziel für den neuen Betrieb:

```text
deliveryMode = backend
outputMode = announcement
```

Bei `deliveryMode=backend` sendet das Backend direkt über Twitch Helix:

```text
chat         -> /helix/chat/messages
announcement -> /helix/chat/announcements
```

`deliveryMode=streamerbot` bleibt als Fallback/Handoff erhalten. `commit=0` bleibt weiterhin reine Vorschau ohne Senden.
