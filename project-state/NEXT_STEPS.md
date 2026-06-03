# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-38.0 neuen Arbeitsblock bewusst auswählen.
```

## Zuletzt abgeschlossen

```text
CAN-33: Commands-Modul dokumentiert und Dashboard Read-only Diagnosekarte sichtbar geprüft.
CAN-34: Todo-Modul dokumentiert und Dashboard Read-only Diagnosekarte nach Stabilitätsfix sichtbar geprüft.
CAN-35: Tagebuch-Modul dokumentiert und Dashboard Read-only Diagnosekarte sichtbar geprüft.
CAN-36: Message-Rotator-Modul dokumentiert und vorhandener Diagnose-Tab erweitert; Positionstest erfolgreich.
CAN-37: Hug-System dokumentiert und vorhandener Diagnose-Tab erweitert; Sichttest erfolgreich.
```

## Mögliche nächste Kandidaten

```text
1. EventBus read-only Diagnose weiter ausbauen.
2. Overlay-Monitor Dashboard-Details optisch weiter vereinfachen.
3. Bus-Diagnose Unterseiten weiter glätten, z. B. Recovery/Issues/Raw klarer strukturieren.
4. Nächstes Community-/Runtime-Modul an Status-/Doku-Regeln anpassen.
5. Langfristigen DB-Core-Treiberwechsel separat planen, aber nicht direkt umsetzen.
```

## Empfehlung

```text
CAN-38.0: Nächsten kleinen, sicheren Arbeitsblock bewusst auswählen.
```

Mögliche sichere Richtung nach Commands/Todo/Tagebuch/Message-Rotator/Hug:

```text
- EventBus read-only Diagnose weiter ausbauen
- Overlay-Monitor Dashboard-Details optisch weiter vereinfachen
- nächstes Modul analysieren und dokumentieren
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
