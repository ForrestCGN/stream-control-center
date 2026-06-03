# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-41.3b anwenden und Sichtprüfung machen.
```

## Prüfung

```text
Dashboard > Community > Birthday-System
```

Erwartung:

```text
kein großer Safety-Hinweis mehr
keine admin/media/show/reload Badges an Buttons
Birthday-Modul funktioniert optisch wieder normal
keine Show
kein Sound
kein Chat
kein Tagebuch
keine Admin-POSTs
```

## Danach sinnvoll

```text
CAN-41.4 - Birthday Read-only Diagnosekarte planen/umsetzen
```

Ziel für Diagnose:

```text
echte Statuswerte statt Warntext
Modulversion
Schema-Version
Modul aktiv
Auto-Gratulation aktiv
Chat-Hook installiert
heutige Geburtstage
registrierte Einträge
Show aktiv/inaktiv
letzter Fehler
```

## Dashboard-Regel ab CAN-41.3b

```text
Keine großen Warn-/Safety-Schilder mehr als Standard.
Keine Badge-Flut an normalen Buttons.
Spätere Mod-Freigaben über Rollen/Rechte/Freigaben.
Kritische Aktionen später gezielt mit Confirm + Audit-Logging.
Hinweise nur dort, wo sie wirklich fachlich helfen.
Diagnosekarten sollen echte Statuswerte zeigen, nicht nur Warntexte.
```

## Weiterhin nicht machen ohne separaten Go-Schritt

```text
Keine Birthday-Show-/Sound-/Chat-/Tagebuch-/Upload-/Import-/Admin-POST-Aktion ohne eigenen Go-Schritt.
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
Keine Funktionalität entfernen.
```
