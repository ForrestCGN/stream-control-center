# NEXT STEPS – Event-System ab EVS44

## Schritt 1 – EVS44 Status prüfen

Wenn der Stream wieder online ist:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s.runtimeGate | Select-Object active,status,reason,label,chatEvaluationActive
$s.runtimeGate.eventRuntimeState | Select-Object runtimeStatus,phase,nextAutoStartAt,recoveryReason,recoveryNote
```

Erwartung:

```text
runtimeStatus = active
phase = waiting
nextAutoStartAt gesetzt
```

Falls nicht: EVS44.1 Auto-Resume-Fix planen.

## Schritt 2 – Dashboard Button Guard prüfen

Im Dashboard:

- Bei offline_waiting darf `Wartezeit überspringen` nicht sichtbar sein.
- Bei manual_paused nur Fortsetzen/Status anzeigen.
- Bei active/waiting/online darf Skip-Wait sichtbar sein.

## Schritt 3 – Winner Overlay neu aufbauen

Vorgehen:

1. Aktuelle Overlay-Datei prüfen.
2. Design/Ablauf für Fresh Rebuild kurz bestätigen.
3. Auf `go` warten.
4. Stabil sichtbare Demo-Basis bauen.
5. Erst danach Effekte/Animationen verfeinern.

Nicht sofort wieder zu komplex bauen. Erst Sichtbarkeit und Ablauf, dann Show-Feinschliff.
