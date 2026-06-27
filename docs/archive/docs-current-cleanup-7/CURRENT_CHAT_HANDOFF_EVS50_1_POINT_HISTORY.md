# CURRENT CHAT HANDOFF – EVS50.1 Point History / Aktuelles Event

Stand: 2026-06-18

## Ziel

Im Dashboard unter `Event-System → Aktuelles Event` sollen Spieler in der Rangliste direkt anklickbar sein. Beim Klick öffnet ein Detailfenster für genau dieses Event und genau diesen User.

## Umgesetzt

### Dashboard

Dateien:

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

Änderungen:

- Ranglisten-Zeilen im Tab `Aktuelles Event` sind jetzt klickbare Buttons.
- Klick auf einen User öffnet das bestehende User-Statistik-Popup per `openUserStats`.
- Popup wird mit `eventUid` des aktuellen Events geladen.
- Popup-Zähler zeigen jetzt:
  - Punkte gesamt
  - Sound-Punkte
  - Satz-/Text-Punkte
  - Punkte-Einträge
  - Worttreffer
  - Satzlösungen
- Timeline wurde im UI als Punkte-Verlauf benannt: wann, wofür, wie viele Punkte.
- Sound-Bereich heißt nicht mehr „Sound-Spiel später“, sondern „Sound-Punkte“.

### Backend

Datei:

```text
backend/modules/stream_events.js
```

Änderungen:

- Bestehende Statistik-Route bleibt Grundlage:

```text
GET /api/stream-events/statistics/user/:login?eventUid=<eventUid>
```

- User-Timeline wurde erweitert:
  - Sound-Punkte aus `stream_events_score_entries` bleiben sichtbar.
  - Text-Worttreffer und Satzlösungen bleiben sichtbar.
  - Sonstige/manuelle Punkte-Einträge werden ebenfalls in der Timeline sichtbar.
  - Sound-Timeline nutzt, wenn vorhanden, den Soundtitel aus `metadata.title`.

## Wichtig

Punkte werden nicht ins Loyalty-System geschrieben. Es geht weiterhin nur um Event-Punkte aus `stream_events`.

Sound und Satz/Text addieren sich über dieselbe Tabelle:

```text
stream_events_score_entries
```

Quelle/Art wird über `source_type` getrennt:

```text
sound_solved
text_word_hit
text_phrase_solve
manual/sonstige
```

## Tests nach Einspielen

```powershell
cd D:\Git\stream-control-center
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/statistics/users?eventUid=EVENT_UID_HIER"
$r.users | Select-Object userLogin,userDisplayName,totalPoints,soundPoints,wordPoints,phrasePoints,scoreEntries | Format-Table -AutoSize

$u = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/statistics/user/forrestcgn?eventUid=EVENT_UID_HIER"
$u.user | Format-List
$u.timeline | Select-Object kind,gameType,label,points,createdAt | Format-Table -AutoSize
```

Dashboard-Sichttest:

```text
Event-System → Aktuelles Event → User in Rangliste anklicken
```

Erwartung:

```text
Detailfenster öffnet sich.
Sound-/Text-Punkte sind getrennt sichtbar.
Punkte-Verlauf zeigt Zeitpunkt, Quelle/Grund und Punkte.
```

## Nächster sinnvoller Step

EVS50.2 – Satz-System-Testbereich im Dashboard erweitern:

- Satz-Testevent erstellen
- falsche Antwort senden
- Teiltreffer senden
- richtige Satzantwort senden
- Report/Ranking/Runtime-Parts direkt anzeigen
- prüfen, ob Text-Teilspiel sauber abgeschlossen wird
