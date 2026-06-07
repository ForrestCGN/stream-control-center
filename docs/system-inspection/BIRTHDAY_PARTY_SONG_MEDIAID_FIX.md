# STEP_BIRTHDAY_PARTY_SONG_MEDIAID_FIX

Stand: 2026-06-07

## Ziel

Der Birthday-Dashboard-MediaField-Workflow für Party-Songs und User-Songs speichert ausgewählte Medien jetzt als stabile Media-Registry-Referenz `mediaid:<id>` statt als relativen Pfad wie `media/birthday/party-songs/...`.

## Anlass

Beim Test der Tadesso-Party wurde die Party korrekt angelegt und dem User korrekt zugewiesen. Der Start wurde ausgelöst, aber das Sound-Bundle brach ab, weil der gespeicherte Party-Song als `media/birthday/party-songs/Geburtstags-Blues.mp3` gespeichert war. Das Sound-System interpretierte diesen Wert als Pfad relativ zu `htdocs/assets/sounds/` und suchte dadurch unter `/assets/sounds/media/birthday/party-songs/Geburtstags-Blues.mp3`. Ergebnis: `file_not_found`.

## Geänderte Datei

- `htdocs/dashboard/modules/birthday.js`

## Änderung

Im Birthday-Dashboard wurde der MediaField-Change-Handler angepasst:

- Wenn ein Media-Asset eine gültige ID hat, wird im Ziel-Feld `mediaid:<id>` gespeichert.
- Nur wenn keine ID vorhanden ist, bleibt der Legacy-Fallback auf `relativePath`/`webPath` erhalten.
- Zusätzlich werden `data-media-id` und `data-media-relative-path` am Ziel-Feld gesetzt, damit der aktuelle Zustand im DOM nachvollziehbar bleibt.
- Die Placeholder für Party-Song und User-Song wurden auf `mediaid:1234` angepasst.

## Nicht geändert

- Kein Backend-Code
- Keine Datenbank-Migration
- Keine bestehenden Party-/User-Daten
- Kein Sound-System
- Kein Overlay
- Keine globale MediaField-Komponente
- Keine Funktionalität entfernt

## Erwartetes Verhalten

Nach Auswahl oder Upload eines Party-Songs über den MediaPicker/MediaField steht im Feld `Song-Datei optional` nicht mehr ein Pfad wie:

```text
media/birthday/party-songs/Geburtstags-Blues.mp3
```

sondern:

```text
mediaid:<id>
```

Beim Speichern der Party wird diese Media-ID in `birthday_parties.song_file` gespeichert. Das Birthday-Backend unterstützt `mediaid:<id>` bereits und baut daraus ein Sound-System-Payload mit `mediaId`.

## Wichtig für bestehende falsche Einträge

Bereits falsch gespeicherte Party-Songs werden durch diesen Dashboard-Fix nicht automatisch migriert. Für die Tadesso-Party muss der Song im Dashboard einmal neu über `Medium auswählen` gewählt/hochgeladen und anschließend die Party gespeichert werden.

## Tests

```powershell
node -c htdocs\dashboard\modules\birthday.js
```

Danach im Dashboard:

1. Birthday-System öffnen.
2. Tab `Partys` öffnen.
3. Tadesso Party bearbeiten.
4. Bei `Song-Datei optional` über `Medium auswählen` den Song neu wählen oder hochladen.
5. Prüfen, dass im Feld `mediaid:<id>` steht.
6. `Party speichern`.
7. User `@Tadesso` der `Tadesso Party` zuweisen.
8. `Speichern & abspielen`.

Kontrolle:

```powershell
$p = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/parties"
$p.parties | Where-Object partyKey -eq "tadesso_party" | Select-Object partyKey,title,songFile,songDurationMs,songVolume | Format-List
```

Erwartung:

```text
songFile : mediaid:<id>
```

Danach:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/state"
$s | ConvertTo-Json -Depth 8
```

## Stepdone

```powershell
.\stepdone.cmd "STEP_BIRTHDAY_PARTY_SONG_MEDIAID_FIX"
```
