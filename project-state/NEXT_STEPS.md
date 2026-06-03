# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-37.2 anwenden.
```

## Danach sinnvoll

```text
CAN-37.3 - Hug Dashboard Diagnose-Tab prüfen/erweitern
```

Möglicher Inhalt:

```text
- vorhandenen Diagnose-Tab prüfen
- produktive Buttons wie "Hug-Reload testen" klarer markieren
- Status-/Schema-/DB-/Textpaar-Zähler anzeigen
- Integration-Check anzeigen
- Read-only Routen als erlaubt markieren
- produktive Hug/Rehug/Command/Reload/Admin-POST-Routen als gesperrt markieren
```

## Wichtiger Sicherheits- und Stabilitätshinweis

```text
CAN-37.3 vorhandenen Diagnose-Tab nutzen, keinen Extra-Tab.
Keine Hug/Rehug/Stats/Top/Reload/Admin-POST-Tests.
Kein MutationObserver.
Kein Dauer-Rendering.
Keine Chat-Ausgabe.
```

## Zuletzt abgeschlossen

```text
CAN-33: Commands-Modul dokumentiert und Dashboard Read-only Diagnosekarte sichtbar geprüft.
CAN-34: Todo-Modul dokumentiert und Dashboard Read-only Diagnosekarte nach Stabilitätsfix sichtbar geprüft.
CAN-35: Tagebuch-Modul dokumentiert und Dashboard Read-only Diagnosekarte sichtbar geprüft.
CAN-36: Message-Rotator-Modul dokumentiert und vorhandener Diagnose-Tab erweitert; Positionstest erfolgreich.
CAN-37.1: Hug-System analysiert.
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
Keine Tagebuch-Entry-/Stream-/Reset-/Reload-/Admin-POST-Tests ohne eigenen Go-Schritt.
Keine Message-Rotator-Start-/Stop-/Tick-/Next-/Manual-/Reload-/Live-Status-/Admin-POST-Tests ohne eigenen Go-Schritt.
Keine Hug-/Rehug-/HugAll-/on-off-/Stats-/Top-/Reload-/Text-Store-Reload-/Admin-POST-Tests ohne eigenen Go-Schritt.
```
