# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-36.2 anwenden.
```

## Danach sinnvoll

```text
CAN-36.3 - Message-Rotator Dashboard Read-only Diagnosekarte planen
```

Möglicher Inhalt:

```text
- Modulversion anzeigen
- Runtime-State anzeigen
- active / startedAt / stoppedAt anzeigen
- Chat-Zähler anzeigen
- SendCount anzeigen
- letzte Ausgabe anzeigen
- Config-Quelle anzeigen
- Item-Zähler anzeigen
- Textvarianten-/Texthelper-Status anzeigen
- Integration-Check anzeigen
- Live-Status-Config anzeigen, ohne Force-Abfrage
- Read-only Routen als erlaubt markieren
- Start/Stop/Tick/Next/Manual/Reload/Admin-POST-Routen als gesperrt markieren
```

## Wichtiger Sicherheits- und Stabilitätshinweis

```text
CAN-36.3 direkt als eigener Diagnose-Tab planen.
Keine MutationObserver-Schleife.
Kein Dauer-Rendering.
Nur kontrolliertes Click-/Show-Handling wie CAN-34.3c.
Keine /next oder /manual Vorschau in der Diagnosekarte.
Keine /live-status Force-Abfrage in der Diagnosekarte.
```

## Zuletzt abgeschlossen

```text
CAN-29: Discord ready/clientReady DeprecationWarning behoben.
CAN-30: SQLite ExperimentalWarning analysiert und dokumentiert/akzeptiert.
CAN-31: WS connect/disconnect Log durch Summary entschärft und live bestätigt.
CAN-32: Bus-Diagnose Übersicht um read-only Sicherheits-Zusammenfassung erweitert und sichtbar geprüft.
CAN-33: Commands-Modul dokumentiert und Dashboard Read-only Diagnosekarte sichtbar geprüft.
CAN-34: Todo-Modul dokumentiert und Dashboard Read-only Diagnosekarte nach Stabilitätsfix sichtbar geprüft.
CAN-35: Tagebuch-Modul dokumentiert und Dashboard Read-only Diagnosekarte sichtbar geprüft.
CAN-36.1: Message-Rotator-Modul analysiert.
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
```
