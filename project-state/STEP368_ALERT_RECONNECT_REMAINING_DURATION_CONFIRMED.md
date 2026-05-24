# STEP368 – Alert Reconnect Remaining Duration bestätigt

## Status
Bestanden / bestätigt.

## Bezug
Dieser Schritt dokumentiert den Abschluss von:

- STEP365_ALERT_RECONNECT_REMAINING_DURATION
- STEP367_ALERT_RECONNECT_REMAINING_DURATION_TEST

## Ausgangsproblem
Beim Aktualisieren der OBS Alert-Browserquelle während eines laufenden Alerts wurde der laufende Alert visuell erneut an das Overlay gesendet.

Der Sound/TTS wurde korrekt nicht neu gestartet, aber die Anzeige erhielt erneut die volle Alert-Dauer. Dadurch konnte die Anzeige nach ein oder zwei OBS-Reloads deutlich länger sichtbar bleiben als der Sound.

## Fix aus STEP365
Beim Reconnect wird nicht mehr die volle Alert-Dauer gesendet. Das Backend berechnet stattdessen die Restlaufzeit des laufenden Alerts und sendet nur diese an das reconnectete Overlay.

Relevante Recovery-Daten:

- `originalDurationMs`
- `elapsedMs`
- `remainingMs`
- `startedAt`
- `expectedEndsAt`
- `recoveryMode = reconnect_resend_remaining_duration`

## Testergebnis aus STEP367
Der Live-Test mit OBS-Reload während eines laufenden Alerts war erfolgreich.

Beobachtung aus Log:

- erster Reconnect: `remainingMs=10155`, `elapsedMs=13055`, `totalMs=23210`
- zweiter Reconnect: `remainingMs=6460`, `elapsedMs=16750`, `totalMs=23210`

Damit wurde bestätigt:

- Restlaufzeit wird kleiner
- Anzeige bekommt nicht erneut die volle Dauer
- Sound/TTS startet nicht doppelt
- Queue bleibt stabil
- Alert-Lifecycle wird nach Ende sauber geleert

## Ergebnis
Der Fehler „OBS Alert-Quelle aktualisieren verlängert Anzeige künstlich“ ist behoben.

## Nicht geändert

- kein Dashboard-Umbau
- keine Sound-System-Änderung
- keine Queue-Änderung
- keine DB-Migration
- kein Birthday-System-Fix
- kein Wechsel von Legacy-Overlay auf Bus-Overlay

## Offener separater Befund
Der separate Sound-System-Befund bleibt offen:

- `current=null`
- `currentBundle=null`
- `activeBundleLock` blieb gesetzt
- Birthday-/VIP-Queue wurde dadurch blockiert
- Workaround: `POST /api/sound/clear`

Dieser Punkt ist als Known-Issue dokumentiert und soll später separat im Sound-System gefixt werden.

## Nächster sinnvoller Bus-Schritt
STEP369_ALERT_OUTPUT_BUS_CONTRACT_AUDIT

Ziel:
Vor einem Wechsel von Alert `outputMode=legacy` auf einen saubereren Bus-/Overlay-Vertrag prüfen, welche Events, Payloads und Acks aktuell wirklich genutzt werden und welche Felder für einen stabilen Alert-Bus verpflichtend sein müssen.
