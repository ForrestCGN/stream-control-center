# STEP199.3 - TTS User-Statistik

Stand: 2026-05-08

## Ziel

TTS bekommt eine saubere User-Statistik: Wer hat wie oft TTS genutzt, wie viele Zeichen verbraucht, welche Engine wurde genutzt und wann war die letzte Nutzung.

## Geänderte Dateien

- `backend/modules/tts_system.js`
- `htdocs/dashboard/modules/tts.js`

## Backend

Neue Route:

```text
GET /api/tts/stats/users
```

Unterstützte Query-Parameter:

```text
range=today|7d|30d|month|all
sort=requests|chars|duration|failed|google|piper|last|user
limit=1..500
source=...
mode=...
role=...
engine=...
status=...
```

Die Route liest aus `tts_events` und gruppiert nach `user_login`.

Rückgabe enthält:

- `totals`
- `byRole`
- `rows`

Pro User:

- `userLogin`
- `userDisplay`
- `roleKey`
- `requestsTotal`
- `requestsOk`
- `requestsFailed`
- `charsTotal`
- `durationMsTotal`
- `googleRequests`
- `piperRequests`
- `chatRequests`
- `dashboardRequests`
- `alertRequests`
- `firstUsedAt`
- `lastUsedAt`

## Dashboard

Der bestehende TTS-Dashboard-Bereich bekommt einen neuen Tab:

```text
User-Statistik
```

Enthält:

- Zeitraumfilter: Heute, 7 Tage, 30 Tage, dieser Monat, Gesamt
- Sortierung: Anzahl, Zeichen, Dauer, Fehler, Google, Piper, letzte Nutzung, User
- KPI-Kacheln: User, Requests, Zeichen, Dauer
- Tabelle pro User
- Rolle-Auswertung

## Bewusst nicht geändert

- keine neue Admin-Datei
- keine neue Tabelle
- keine bestehende TTS-Funktionalität entfernt
- keine Änderung an Playback/Queue/Sound-System-Logik

## Tests

Nach Deploy und Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/stats/users" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/stats/users?range=month&sort=chars" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/stats/users?range=7d&sort=last" | ConvertTo-Json -Depth 30
```

Dashboard:

```text
/dashboard -> System -> TTS -> User-Statistik
```
