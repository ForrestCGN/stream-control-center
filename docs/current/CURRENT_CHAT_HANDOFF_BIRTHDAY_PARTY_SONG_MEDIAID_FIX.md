# CURRENT CHAT HANDOFF - STEP_BIRTHDAY_PARTY_SONG_MEDIAID_FIX

Stand: 2026-06-07

## Kontext

Forrest wollte kurzfristig über das Dashboard eine UserParty anlegen und abspielen können: Song hochladen/auswählen, User auswählen, Celebration/Party zuweisen und starten.

Der Dashboard-Step `STEP_BIRTHDAY_DASHBOARD_USERPARTY_PLAY` ergänzte bereits `Speichern & abspielen` und `Abspielen`-Buttons. Beim Test mit `tadesso_party` wurde festgestellt:

- Party existiert.
- User-Profil `tadesso` existiert.
- User ist `tadesso_party` zugeordnet.
- Backend-Start wird ausgelöst.
- Sound-Bundle scheitert, weil `songFile` als `media/birthday/party-songs/Geburtstags-Blues.mp3` gespeichert wurde.
- Sound-System sucht dadurch unter `/assets/sounds/media/birthday/party-songs/...` und meldet `file_not_found`.

## Dieser Step

Geändert wurde nur:

- `htdocs/dashboard/modules/birthday.js`

Der MediaField-Change-Handler speichert nun bei gewähltem Media-Asset bevorzugt:

```text
mediaid:<id>
```

statt eines relativen Pfades.

## Nicht geändert

- Backend
- DB
- Overlay
- Sound-System
- bestehende Datensätze
- globale MediaField-Komponente

## Nach dem Entpacken

```powershell
node -c htdocs\dashboard\modules\birthday.js
.\stepdone.cmd "STEP_BIRTHDAY_PARTY_SONG_MEDIAID_FIX"
```

## Nächster Test

1. Dashboard hart neu laden.
2. Birthday-System -> Partys.
3. Tadesso Party bearbeiten.
4. Song über `Medium auswählen` erneut auswählen oder hochladen.
5. Feld muss `mediaid:<id>` anzeigen.
6. Party speichern.
7. `Speichern & abspielen` testen.

## Erwartete Kontrollausgabe

```powershell
$p = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/parties"
$p.parties | Where-Object partyKey -eq "tadesso_party" | Select-Object partyKey,title,songFile | Format-List
```

Erwartung:

```text
songFile : mediaid:<id>
```

Wenn danach trotzdem kein Sound kommt, als Nächstes Backend-Ausgabe von `/api/birthday/command` prüfen. Dann liegt der Fehler nicht mehr am Dashboard-Pfad, sondern an Media-ID-Auflösung oder Sound-System-Payload.
