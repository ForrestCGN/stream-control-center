# Next Steps

Nach `0.2.33`:

## 1. Direkt testen

```text
RDAP_0.2.33_UI_I18N_MEDIA_LABELS_FIX_PLAN
```

Pruefen:

```text
- START_HERE verweist auf 0.2.33.
- Neue Step-Doku ist vorhanden:
  docs/current/RDAP_0.2.33_UI_I18N_MEDIA_LABELS_FIX_PLAN.md
- CURRENT_STATUS/NEXT_STEPS/TODO/FILES/CHANGELOG sind aktualisiert.
- JS-Syntax fuer geaenderte UI-Dateien ist sauber.
- Keine Backend-Routen wurden geaendert.
- Keine DB-Migration wurde eingefuehrt.
- Keine neue Runtime-Datei wurde erstellt.
```

## 2. Sichttest

```text
Lokal:
http://127.0.0.1:8080/dashboard-v2

Online nach Deploy:
https://mods.forrestcgn.de/
```

Erwartung:

```text
Diese Keys werden nicht mehr roh angezeigt:
- module.media.label
- page.media.library.title
- page.media.library.label
```

## 3. Deploy-Hinweis

```text
0.2.33 betrifft Public-Assets.
Nach lokalem Check, stepdone/Push und frischem Webserver-Deploy online pruefen.
```

## 4. Persistent Index spaeter nur nach eigenem Go

```text
RDAP_0.2.34_MEDIA_PERSISTENT_INDEX_MIGRATION_FOUNDATION_READONLY
```

Nur wenn vorher bestaetigt:

```text
- DB-Migration ist erlaubt.
- Betroffene bestehende Dateien sind freigegeben.
- Keine neue Runtime-Datei, ausser Forrest genehmigt sie ausdruecklich.
- backend/core/database.js ist im Server-Kontext sauber nutzbar oder Alternative ist sauber begruendet.
```

## 5. Nicht tun

```text
Keine Technikmodule in Navigation anlegen.
Kein media-agent-sync Modul.
Kein OBS-Inventory-Protokoll fuer Media missbrauchen.
Keine Upload-/Delete-Buttons aktivieren.
Keine lokalen absoluten Pfade anzeigen.
Keine grossen Listen ohne Limit/Paging laden.
Keine DB-Migration ohne eigenen bestaetigten Step.
Keine bidirektionale Datei-Synchronisation ohne Sicherheitsmodell.
Keine Agent-Apply-Queue ohne Permission, Confirm, Audit, Backup und Conflict-Handling.
Keine neue Runtime-Datei als Standardloesung.
UI/i18n-Fix nicht mit Persistent-Index-Code vermischen.
```

## 6. Standard-Arbeitsweise Zusatz

```text
Wenn GitHub/dev per Connector unvollstaendig/abgeschnitten ist:
- Sammel-Script fuer Source-Dateien liefern.
- Source-ZIP vom Nutzer abwarten.
- Erst aus Source-ZIP echten Step-ZIP bauen.
- ZIP fuer Installation muss echte Zielpfade enthalten, keinen Wrapper-Ordner.

Check-Ausgaben:
- Keine vollen JSON-Waende als Standard.
- Webserver: `curl ... | jq '{kurze:Felder}'`.
- Windows lokal: PowerShell `Invoke-RestMethod` + `[pscustomobject]`.
```
