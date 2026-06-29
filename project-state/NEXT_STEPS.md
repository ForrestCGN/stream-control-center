# Next Steps

Nach `0.2.32`:

## 1. Direkt testen

```text
RDAP_0.2.32_MEDIA_PERSISTENT_INDEX_FOUNDATION_PLAN_NO_CODE
```

Pruefen:

```text
- START_HERE verweist auf 0.2.32.
- Neue Plan-Doku ist vorhanden:
  docs/current/RDAP_0.2.32_MEDIA_PERSISTENT_INDEX_FOUNDATION_PLAN_NO_CODE.md
- CURRENT_STATUS/NEXT_STEPS/TODO/FILES/CHANGELOG sind aktualisiert.
- Keine Runtime-Dateien wurden geaendert.
- Keine neuen Runtime-Dateien wurden erstellt.
- Keine DB-Migration wurde eingefuehrt.
- Kein Webserver-Deploy noetig, weil Doku-only.
```

## 2. Naechste sinnvolle Entscheidung

```text
A) kleiner UI/i18n-Fix-Plan fuer sichtbare Translation-Keys
B) Persistent-Index-Migration/Foundation weiter planen
C) stoppen
```

Empfehlung:

```text
Zuerst UI/i18n-Fix separat klein planen, weil im Online-Modboard sichtbar:
- module.media.label
- page.media.library.title
- page.media.library.label
```

## 3. UI/i18n-Fix-Plan nur nach Dateipruefung

Vor einem UI/i18n-Fix mindestens lesen:

```text
remote-modboard/backend/public/assets/runtime-profile.js
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/modules/*
remote-modboard/backend/public/assets/languages/*
htdocs/dashboard-v2/assets/*
```

Regeln:

```text
- Kein DB-Code.
- Keine Agent-Aenderung.
- Keine Media-Persistenz.
- Nur Labels/Dictionary/Key-Mapping.
- Eine UI, zwei Runtime-Profile bleibt bestehen.
```

## 4. Persistent Index spaeter nur nach eigenem Go

```text
RDAP_0.2.33_MEDIA_PERSISTENT_INDEX_MIGRATION_FOUNDATION_READONLY
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
