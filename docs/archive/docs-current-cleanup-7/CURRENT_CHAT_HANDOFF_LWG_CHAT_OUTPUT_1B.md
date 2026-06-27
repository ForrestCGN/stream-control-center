# Current Chat Handoff – LWG Chat Output 1B

Datum: 2026-06-19
Projekt: stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

## Arbeitsweise

- Erst echten aktuellen Stand prüfen, dann planen, dann auf Forrests `go` warten.
- Nicht raten; fehlende/unklare Dateien exakt anfragen.
- Keine Funktionalität entfernen.
- Vorhandene Systeme nutzen: Communication/EventBus, Twitch-Events, Sound-/Overlay-System, Helper, DB-/Config-/Dashboard-Patterns.
- ZIPs immer mit echten Zielpfaden ab Repo-Root liefern.
- Nach ZIP-/Datei-Steps immer StepDone-Befehl angeben.
- Bei ZIP-/Datei-Steps wird StepDone nach Einspielen/Deployen ausgeführt und erst danach getestet.
- Dashboard-/Modul-Lösungen müssen streamer- und modfreundlich sein.

## Aktueller Stand

```text
loyalty_giveaways: 0.1.18 / LWG_CHAT_OUTPUT_1B
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Was erledigt wurde

### LWG_CHAT_COMMANDS_1

`!ticket`, `!wheel` und `!rad` wurden aktiv geschaltet.

Bestätigt:

```text
!ticket → normales Giveaway
!wheel / !rad → Gewinner-Wheel-Claim
!join / !raffle → bleiben Raffle
```

### Interaktiver Test

Test-Giveaway:

```text
giveaway_1781869724371_2cdf71cc66cc312a
```

Bestanden:

```text
- Draw aus open blockiert.
- 3 erlaubte User kamen per !ticket rein.
- una_solala blieb Entry, war aber nicht eligible.
- 3 Gewinner wurden nacheinander gezogen.
- Jeder Gewinner konnte per !wheel/!rad drehen.
- Alle 3 Gewinner wurden wheel_completed.
- Verfügbare Felder: 8 → 5.
- Danach kein eligible User mehr.
```

### LWG_CHAT_OUTPUT_1

Problem:

```text
!ticket erstellt Entry, aber sendet keine Chat-Bestätigung.
```

Fix:

```text
Direkte Chat-Ausgabe jetzt auch für ticket.* und wheel.*.
```

Live-Beobachtung:

```text
!ticket und !wheel/!rad senden grundsätzlich Chatmeldungen.
```

### LWG_CHAT_OUTPUT_1B

Neues Problem nach 1:

```text
Teilweise wurden zwei Textvarianten/Sätze in einer Chatnachricht gepostet.
```

Ursache:

```text
Legacy-/DB-Textblöcke können mehrere Varianten als Mehrzeiler enthalten.
Der Textpicker kann so einen Mehrzeiler als eine Variante wählen.
```

Fix:

```text
Vor dem Chat-Senden wird ein Mehrzeilen-Textblock auf genau eine zufällige nicht-leere Zeile reduziert.
```

Wichtig:

```text
Keine neuen Texte hartcodiert.
Keine DB-Handarbeit.
Vorhandene Textvarianten/Helper werden genutzt.
```

## Nächster Schritt in diesem Bereich

Später testen:

```text
1. Backend mit LWG_CHAT_OUTPUT_1B starten.
2. Neues/frisches Test-Giveaway öffnen.
3. User schreibt !ticket.
4. Prüfen: Entry erstellt + genau eine Chat-Bestätigung sichtbar.
5. Draw + Gewinner schreibt !wheel oder !rad.
6. Prüfen: Wheel-Claim + genau eine Chat-Bestätigung sichtbar.
7. Testscript 1.3 bis SUCCESS laufen lassen.
```

Letzter Testkandidat:

```text
giveaway_1781879638591_c1734bfe1e834396
Status: draft
CanOpen: true
```

## UID-Befehl

```powershell
$base = "http://127.0.0.1:8080"

$r = Invoke-RestMethod "$base/api/loyalty/giveaways?limit=20"

$r.rows |
  Select-Object giveawayUid,title,status,mode,wheelEnabled,setupComplete,canOpen,createdAt |
  Format-Table -AutoSize
```
