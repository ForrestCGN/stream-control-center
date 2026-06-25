# RDAP_WORKFLOW_DEPLOY_STANDARD_UPDATE_2026-06-25

Stand: 2026-06-25  
Typ: Doku-/Workflow-Update

## Zweck

Dieses Doku-Update korrigiert die verbindliche RDAP-/Remote-Modboard-Arbeitsweise, vor allem den Server-Deploy.

## Geändert

- Master-Prompt auf Stand RDAP33B aktualisiert.
- RDAP-Arbeitsweise auf Stand RDAP33B aktualisiert.
- Webserver-Deploy-Standard korrigiert:
  - kurzer relativer `_deploy_tmp`-Stil
  - keine langen absoluten Clone-Zielpfade als Standard
  - kein zusätzlicher manueller `systemctl restart` direkt nach `remote-modboard-deploy.sh`
- RDAP33B-Live-Befund ergänzt:
  - Audit-Tabelle blockiert Writes wegen fehlendem `resource_type`
  - Lock-Tabelle wirkt als erster Lock-Write-Kandidat brauchbar
  - nächster Step RDAP34 Schema-Decision/Migration-Plan

## Verbindlicher Server-Deploy-Standard

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

## Nicht geändert

- keine Backend-Dateien
- keine UI-Dateien
- keine DB-Änderung
- keine produktiven Writes
- kein Webserver-Deploy nötig
