# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-32.1 anwenden und Dashboard-Sichtprüfung machen.
```

## Prüfung

```text
Dashboard öffnen.
Bus-Diagnose > Übersicht.
Karte "Sicherheits- / Read-only-Zusammenfassung" muss sichtbar sein.
```

Erwartung:

```text
Read-only sichtbar.
Flow/Queue/Sound/Overlay touched bleiben nein.
Recovery execute bleibt nein.
Keine produktiven Buttons.
Keine Recovery-Ausführung.
```

## Danach sinnvoll

```text
CAN-32.2 Testergebnis dokumentieren.
```

## Mögliche Kandidaten danach

```text
1. EventBus read-only Diagnose weiter ausbauen.
2. Ein konkretes Modul an Bus-/Status-/Doku-Regeln anpassen.
3. Dashboard-Kosmetik in Overlay-Monitor / Bus-Diagnose weiter glätten.
4. Langfristigen DB-Core-Treiberwechsel separat planen, aber nicht direkt umsetzen.
```

## Weiterhin nicht machen ohne separaten Go-Schritt

```text
Keine produktive Sound-Bus-Migration.
Kein produktiver Sound-Bus-Play.
Kein Queue-Clear.
Keine Twitch-/Redemption-Write-Aktion durch Shadow.
Kein automatischer Shadow-Mitulauf fuer alle Rewards.
Kein EventSub-/Twitch-Redemption-Test ohne separate Freigabe.
Keine Enable/Test/Migration-Buttons in der Sound-Shadow Card.
Keine OBS-Reparatur.
Kein Source-Refresh.
Keine automatische Recovery.
Keine DB-Migration.
Kein DB-Treiberwechsel.
Keine Dashboard-Testbuttons fuer produktive Aktionen.
```
