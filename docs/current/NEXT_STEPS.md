# NEXT_STEPS – stream-control-center

Stand: 2026-06-16

## Neuer Chat / nächster Startpunkt

Im neuen Chat mit diesem Block weitermachen:

```text
LC-MINIGAMES-2C4 Raffle Live-Test: Logs, Kosten und Statistik gegen echten Ablauf prüfen
```

## Ausgangslage

```text
Loyalty Core läuft live-only.
Shadow-Migration ist abgeschlossen.
Shadow ist leer: candidates=0 totalShadow=0.
/api/loyalty/status bestätigt mode=live, enabled=true, shadowMode=false, pointsState=active.
Raffle-Logs funktionieren grundsätzlich.
Raffle-Statistik funktioniert grundsätzlich.
Mini-Spiel-Auswahl ist kompakt und funktional geprüft.
Design-Feinschliff wird später gemacht.
```

## Wichtige aktuelle UI-Regel

```text
Logs = Buchungen und Ereignisse.
Raffle-Seite = Statistik und Raffle-Status.
Einstellungen = dauerhafte Config.
Texte = Textvarianten.
Chat & Befehle = Command-Konfiguration.
```

Nicht wieder alles in eine lange Mini-Spiele-Seite packen.

## Schritt 1 – Raffle-Config prüfen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/raffle/config" | ConvertTo-Json -Depth 6
```

Erwartung bei aktivem Kostentest:

```text
entryCostAmount = 10
entryCostEnabled = true
```

Für kostenlosen Test:

```text
entryCostAmount = 0
entryCostEnabled = false
```

## Schritt 2 – Balance vor Join prüfen

Für einen echten Testuser oder einen bewusst gewählten Account:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/balance/tronic6?displayName=Tronic6" | ConvertTo-Json -Depth 8
```

Referenzwerte nach Migration:

```text
Urlug   balanceLive=1006852 balanceShadow=0 activeBalance=1006852
Tronic6 balanceLive=12536   balanceShadow=0 activeBalance=12536
```

## Schritt 3 – Raffle starten und Join testen

Im Chat:

```text
!raffle
!join
```

Prüfen:

```text
User wird eingetragen.
Bei Kosten > 0 wird Betrag abgezogen.
Chattext kommt als eine Variante, nicht als Sammeltext.
```

## Schritt 4 – Logs prüfen

Dashboard:

```text
Loyalty -> Logs
Event = Raffle
Status = Alle
```

Dann einzelne Filter prüfen:

```text
Gestartet
Teilnahme
Bezahlt
Gewinn
Beendet
Abgebrochen
Erstattet
```

Wichtige Erwartung:

```text
Bei Punktebewegungen steht der betroffene User in der User-Spalte.
Bei Start/Abbruch steht der auslösende User/System in der User-Spalte.
Details erklären verständlich, was passiert ist.
```

## Schritt 5 – Doppeljoin prüfen

Im Chat erneut:

```text
!join
```

Erwartung:

```text
already_joined Text
keine zweite Abbuchung
kein doppelter kostenpflichtiger Join
```

## Schritt 6 – zu wenig Punkte testen

Mit Testuser oder reduziertem Konto:

```text
!join
```

Erwartung:

```text
Keine Teilnahme.
Kein Abzug.
Textkey: raffle.public.insufficient_balance
Log/Details zeigen keinen falschen bezahlten Join.
```

## Schritt 7 – Cancel/Refund testen

Bei laufender kostenpflichtiger Raffle:

```text
Raffle abbrechen/canceln
```

Erwartung:

```text
Bezahlte Teilnahmen werden erstattet.
Event=Raffle Status=Abgebrochen sichtbar.
Event=Raffle Status=Erstattet sichtbar.
Balance ist nach Refund korrekt.
```

## Schritt 8 – normaler Abschluss testen

```text
Raffle normal auslaufen lassen oder sauber auslosen.
```

Erwartung:

```text
Keine Erstattung.
Gewinner erhalten Auszahlung.
Event=Raffle Status=Gewinn sichtbar.
Event=Raffle Status=Beendet sichtbar.
Raffle-Statistik aktualisiert Gewinner/Gewonnen/Teilnahmen/Starter.
```

## Danach

Wenn der Raffle-Live-Test bestätigt ist:

```text
1. Doku erneut aktualisieren.
2. LC-MINIGAMES-2C als stabil markieren.
3. Dann nächsten Loyalty-Block planen.
```

## Nicht tun

```text
Keine produktive SQLite ersetzen.
Keine Raffle-Commands im Raffle-Config-Bereich bearbeiten.
Keine alten raffle.* Textkeys reaktivieren.
Keine Alerts produktiv umschalten.
Keine neue Raffle-Parallelstruktur bauen.
Keinen Shadow-Modus wieder aktivieren.
Keine Shadow-DB-Spalten ohne Referenzprüfung droppen.
Keine technischen Raffle-Unterevents als Event-Dropdown-Chaos einbauen.
```
