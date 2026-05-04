# STEP035 - VIP Text API

Stand: 2026-05-04

## Ziel

VIP-/Mod-/Overlay-Texte aus `vip_sound_message_templates` sollen per API lesbar und bearbeitbar sein, damit das spätere Dashboard nicht direkt auf SQLite zugreifen muss.

## Geändert

- `backend/modules/vip_sound_overlay.js`
  - Version auf `1.8.2` erhöht.
  - Neue Text-API für `vip_sound_message_templates` ergänzt.
  - Keine Änderung an Sound-System-, Daily-Usage-, Twitch-, Rollen- oder Override-Logik.
  - Default-Text für `accepted_mod` entschärft, damit normale Mod-Sound-Annahmen nicht wie Sonderfreigaben klingen.

## Neue Routen

Unter beiden Prefixen verfügbar:

- `/api/vip-sound/*`
- `/api/vip-sound-overlay/*`

Neue Routen:

- `GET /api/vip-sound/texts`
- `GET /api/vip-sound/texts/event-keys`
- `POST /api/vip-sound/texts/upsert`
- `POST /api/vip-sound/texts/toggle`
- `POST /api/vip-sound/texts/delete`

## Filter

`GET /api/vip-sound/texts` unterstützt:

- `eventKey`
- `style`
- `enabled`
- `search` / `q`
- `limit`

Styles:

- `heimleitung` bleibt interne Chat-/Bot-Style-ID aus Kompatibilitätsgründen.
- `overlay` bleibt Overlay-Text-Style.
- sichtbarer Begriff bleibt `Heimaufsicht`.

## Beispiele

Texte anzeigen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/texts" | ConvertTo-Json -Depth 20
```

Event-Keys anzeigen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/texts/event-keys" | ConvertTo-Json -Depth 20
```

Nur normale Mod-Accept-Texte anzeigen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/texts?eventKey=accepted_mod&style=heimleitung" | ConvertTo-Json -Depth 20
```

Text hinzufügen oder vorhandenen gleichen Text aktualisieren:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/texts/upsert" `
  -ContentType "application/json" `
  -Body '{
    "eventKey": "accepted_mod",
    "style": "heimleitung",
    "messageText": "@{displayName}, Mod-Sound ist angenommen. Danke fuer deinen Einsatz im Mod-Team.",
    "enabled": true,
    "weight": 1
  }' | ConvertTo-Json -Depth 20
```

Text deaktivieren:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/texts/toggle?id=123&enabled=false" | ConvertTo-Json -Depth 20
```

Text löschen:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/texts/delete?id=123" | ConvertTo-Json -Depth 20
```

## Test-Erwartung

- `GET /api/vip-sound/status` zeigt Version `1.8.2`.
- `GET /api/vip-sound/texts` liefert vorhandene 29 Texte.
- `GET /api/vip-sound/texts/event-keys` gruppiert die Event-Keys.
- `POST /api/vip-sound/texts/upsert` kann neue Texte anlegen oder bestehende gleiche Texte aktualisieren.
- `POST /api/vip-sound/texts/toggle` kann Texte aktivieren/deaktivieren.
- Bestehende VIP-Sound-Funktion bleibt unverändert.

## Wichtig

- Keine SQLite-Datei committen.
- Keine Secrets committen.
- Die interne Style-ID `heimleitung` nicht blind umbenennen.
- Späteres Dashboard muss diese API nutzen und nicht direkt SQLite bearbeiten.
