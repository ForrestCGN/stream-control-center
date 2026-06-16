# NEXT_STEPS – stream-control-center

Stand: 2026-06-16

## Neuer Chat / nächster Startpunkt

Im neuen Chat mit diesem Block weitermachen:

```text
LC-MINIGAMES-2B Kosten-Live-Test abschließen
```

## Ausgangslage

```text
Loyalty Core läuft live-only.
Shadow-Migration ist abgeschlossen.
Shadow ist leer: candidates=0 totalShadow=0.
/api/loyalty/status bestätigt mode=live, enabled=true, shadowMode=false, pointsState=active.
Cleanup-3 ist geprüft: Hauptstatus ist auf Aktiv/Inaktiv bereinigt.
streamElementsStillActive/importStatus sind aus dem normalen Hauptstatus entfernt.
Legacy-Hinweise bleiben nur im Diagnosebereich.
Urlug und Tronic6 wurden erfolgreich geprüft.
Raffle-Teilnahmekosten sind eingebaut.
Config speichert entryCostAmount=10 und entryCostEnabled=true korrekt.
Text-DB-Cleanup ist bestätigt.
Keine aktiven mehrzeiligen Textvarianten mehr in /api/loyalty/giveaways/texts.
Kosten-Live-Test steht noch aus.
```

## Schritt 1 – aktuellen Raffle-Stand prüfen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/raffle/config" | ConvertTo-Json -Depth 6
```

Erwartung bei aktivem Kostentest:

```text
entryCostAmount = 10
entryCostEnabled = true
```

## Schritt 2 – Balance vor Join prüfen

Für einen echten Testuser oder einen bewusst gewählten Account:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/balance/tronic6?displayName=Tronic6" | ConvertTo-Json -Depth 8
```

Oder für Urlug als Kontrollreferenz:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/balance/urlug?displayName=Urlug" | ConvertTo-Json -Depth 8
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

## Schritt 4 – Doppeljoin prüfen

Im Chat erneut:

```text
!join
```

Erwartung:

```text
already_joined Text
keine zweite Abbuchung
```

## Schritt 5 – zu wenig Punkte testen

Mit Testuser oder reduziertem Konto:

```text
!join
```

Erwartung:

```text
Keine Teilnahme.
Kein Abzug.
Textkey: raffle.public.insufficient_balance
```

## Schritt 6 – Cancel/Refund testen

Bei laufender kostenpflichtiger Raffle:

```text
Raffle abbrechen/canceln
```

Erwartung:

```text
Bezahlte Teilnahmen werden erstattet.
refundTransactions wird befüllt.
Balance ist nach Refund wieder korrekt.
```

## Schritt 7 – normaler Abschluss testen

```text
Raffle normal auslaufen lassen oder sauber auslosen.
```

Erwartung:

```text
Keine Erstattung.
Gewinner erhalten Auszahlung.
payoutTransactions wird befüllt.
```

## Danach

Wenn Kosten-Live-Test bestätigt ist:

```text
1. Doku erneut aktualisieren.
2. LC-MINIGAMES-2B als bestätigt markieren.
3. Danach nächsten Loyalty-Block planen.
```

Später separater technischer Cleanup, nicht im Raffle-Test:

```text
- Shadow-DB-Spalten nur nach vollständiger Referenzprüfung droppen.
- Legacy-Diagnosefelder nur entfernen, wenn keine Diagnose-/Fallback-Funktion mehr gebraucht wird.
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
```
