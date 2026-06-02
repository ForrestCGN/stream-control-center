# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-34.3 anwenden und Dashboard-Sichtprüfung machen.
```

## Prüfung

```text
Dashboard > Todo > Übersicht
```

Erwartung:

```text
Todo Read-only Diagnose sichtbar.
READ-ONLY OK oder PRÜFEN sichtbar.
Status OK / Schema OK / Integration OK sichtbar.
Read-only Routen als erlaubt sichtbar.
Produktive Routen als gesperrt sichtbar.
Keine Add-/Reload-/Admin-POST-Buttons in der Karte.
```

## Danach sinnvoll

```text
CAN-34.4 Testergebnis dokumentieren.
```

## Mögliche Kandidaten danach

```text
1. Todo-Diagnosekarte bei Bedarf optisch glätten.
2. Nächstes Modul an Status-/Doku-Regeln anpassen.
3. EventBus read-only Diagnose weiter ausbauen.
4. Overlay-Monitor Dashboard-Details optisch weiter vereinfachen.
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
Keine Commands-Execute-/Upsert-/Delete-Tests ohne eigenen Go-Schritt.
Keine Todo-Add-/Reload-/Admin-POST-Tests ohne eigenen Go-Schritt.
```
