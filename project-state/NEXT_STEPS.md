# NEXT_STEPS

## Direkt nach STEP444

1. Syntax prüfen:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\vip_sound_overlay.js
node --check backend\modules\sound_system.js
```

2. STEP444 abschließen:

```powershell
.\stepdone.cmd "STEP444 VIP Bus-First Candidate Documented"
```

## Danach möglich

### Option A – sicherer nächster Technik-Step
STEP445 – Konfigurierbaren, aber standardmäßig deaktivierten Produktiv-Schalter vorbereiten.

Ziel: Eine Config-/Runtime-Option vorbereiten, die den normalen VIP-Command später auf Bus-First umschalten könnte, aber im Default weiterhin deaktiviert bleibt.

Schutzregeln:
- Default bleibt Legacy.
- Keine automatische Aktivierung.
- Guard bleibt aktiv.
- Rollback auf Legacy muss jederzeit möglich sein.
- DailyUsage-Verhalten bleibt unverändert, solange nicht separat getestet.

### Option B – Dashboard-Vorbereitung
STEP445 – Admin-/Dashboard-Testschalter vorbereiten.

Ziel: Den bereits stabilen Admin-Testpfad über Dashboard/Control-Center steuerbar machen, ohne produktiven Chat-Command umzuschalten.

### Option C – Produktiv-Umschaltung noch nicht vorbereiten
Weitere Diagnose-/Audit-Felder ergänzen, bevor ein Produktiv-Schalter überhaupt angelegt wird.
