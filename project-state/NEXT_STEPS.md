# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-41.2 anwenden.
```

## Danach sinnvoll

```text
CAN-41.3 - Birthday Dashboard Read-only Diagnose/Sicherheits-Hinweis ergänzen
```

Möglicher Inhalt:

```text
- keine Backend-Änderung
- produktive Birthday-Show-/Sound-/Upload-/Admin-Aktionen klarer markieren
- GET-only Statusübersicht anzeigen
- GET /show/queue vermeiden oder klar als nicht streng read-only markieren
- keine POSTs
- keine Show
- kein Sound
- kein Chat
- kein Tagebuch
```

## Zuletzt abgeschlossen

```text
CAN-33: Commands-Modul dokumentiert und Dashboard Read-only Diagnosekarte sichtbar geprüft.
CAN-34: Todo-Modul dokumentiert und Dashboard Read-only Diagnosekarte nach Stabilitätsfix sichtbar geprüft.
CAN-35: Tagebuch-Modul dokumentiert und Dashboard Read-only Diagnosekarte sichtbar geprüft.
CAN-36: Message-Rotator-Modul dokumentiert und vorhandener Diagnose-Tab erweitert; Positionstest erfolgreich.
CAN-37: Hug-System dokumentiert und vorhandener Diagnose-Tab erweitert; Sichttest erfolgreich.
CAN-38: Bus-Diagnose/EventBus dokumentiert und Read-only Summary ohne MutationObserver sichtbar geprüft.
CAN-39: Overlay-Monitor dokumentiert und Sicherheits-Hinweis sichtbar geprüft.
CAN-40: Bus-Diagnose-Unterseiten reduziert und Sichttest erfolgreich.
CAN-41.1: Birthday-/Geburtstags-Modul read-only analysiert.
```

## Weiterhin nicht machen ohne separaten Go-Schritt

```text
Keine produktive Sound-Bus-Migration.
Kein produktiver Sound-Bus-Play.
Kein Queue-Clear.
Keine Twitch-/Redemption-Write-Aktion durch Shadow.
Kein automatischer Shadow-Mitulauf fuer alle Rewards.
Kein EventSub-/Twitch-Redemption-Test ohne separate Freigabe.
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
Keine Bus-Diagnose-Recovery-/OBS-/Refresh-/Queue-/Sound-/DB-/Chat-Aktion ohne eigenen Go-Schritt.
Keine Overlay-Monitor-OBS-Reparatur-/Source-Refresh-/Show-Hide-Toggle-Cycle-Aktion ohne eigenen Go-Schritt.
Keine Birthday-Show-/Sound-/Chat-/Tagebuch-/Upload-/Import-/Admin-POST-Aktion ohne eigenen Go-Schritt.
```
