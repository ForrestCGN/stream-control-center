# NEXT_STEPS Ergänzung – nach STEP201.1

Stand: 2026-05-08

## Nächster Schritt

### STEP201.2 – /routes-Endpunkte nachziehen

Reihenfolge:

```text
1. alerts
2. soundalerts
3. tagebuch
4. todo
5. vip
```

Regel:

```text
Nur Read-only.
Keine bestehende Route entfernen.
Keine Handler doppelt kopieren.
Keine Schreib-/Admin-Aliase blind ergänzen.
```

## Danach

### STEP201.3 – /integration-check-Endpunkte nachziehen

Priorität:

```text
soundalerts
tagebuch
todo
vip
messages/message_rotator
```

### STEP201.4 – VIP Alias-Plan

Nur planen, nicht direkt umbauen:

```text
/api/vip als Alias für /api/vip-sound-overlay und /api/vip-sound
alte Prefixe bleiben
zuerst status/config/settings/routes/integration-check
```
