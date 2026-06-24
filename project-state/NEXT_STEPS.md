# NEXT STEPS - stream-control-center

Stand: RDAP_DESIGN1B_LAYOUT_FIX
Datum: 2026-06-24

## Sofort

1. ZIP lokal einspielen
2. Browser-Design prüfen
3. Bei Erfolg `stepdone.cmd`
4. Danach Webserver-Deploy aus frischem GitHub/dev-Clone

## Webserver-Deploy-Regel

Erst nach lokalem `installstep.cmd`, Test und `stepdone.cmd`.

Auf dem Webserver immer frisch klonen:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Nicht verwenden:

```text
/opt/stream-control-center/tools/remote-modboard-deploy.sh
```

## Danach

### Secrets rotieren

```bash
openssl rand -base64 48
openssl rand -base64 48
nano /etc/stream-control-center/remote-modboard.env
systemctl restart scc-remote-modboard.service
```

### Nächste geplante Arbeit

- Design im Browser final bewerten
- falls Design passt: Auth-/Rollen-/Rechte-UI planen
- falls Design noch nicht passt: nur gezielte Layout-Korrektur, keine Backend-Arbeit
