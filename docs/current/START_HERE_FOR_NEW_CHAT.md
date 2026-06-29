# START HERE FOR NEW CHAT

Aktueller Stand: `RDAP_0.2.24_MEDIA_READONLY_FOUNDATION`.

Verbindlich:

```text
GitHub/dev ist Wahrheit.
Vor Planung/Code echte Dateien aus GitHub/dev lesen.
Erst Plan nennen, dann auf explizites go warten.
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI.
```

## Aktueller Fokus

```text
Media-System ins Remote-Modboard bringen.
```

## Bestaetigter Stand

```text
0.2.22E: OBS Local/Online Status Parity read-only vorbereitet; OBS ist danach geparkt.
0.2.23: Doku-only, OBS geparkt und Media-System als neuer Fokus dokumentiert.
0.2.24: Media-System read-only Foundation im Remote-Modboard vorbereitet.
```

## 0.2.24 erreicht

```text
- Navigationsbereich Media vorbereitet.
- Seite Medienuebersicht / Media-System vorbereitet.
- Remote-Modboard und lokales dashboard-v2 nutzen dieselbe Media-UI-Grundlage.
- Neuer read-only Endpunkt: GET /api/remote/media/status.
- Lokal/Online-Hinweise vorbereitet.
- Upload, Bearbeiten und Loeschen bleiben deaktiviert.
- Permission-Zielmodell sichtbar: media.read, media.upload, media.edit, media.delete.
- Keine Dateiscans, keine Uploads, keine Deletes, keine DB-Migration, keine Agent-Actions.
```

## Lokal/Online-Regel fuer Media

```text
Lokal: echte Media-Dateien liegen auf dem Stream-PC.
Online: Webserver hat keinen direkten Zugriff auf Stream-PC-Media-Dateien.
Online-Inventar spaeter nur per Agent-WSS Memory-only Sync.
Keine Fake-Daten anzeigen.
```

## Sicherheitsgrenzen

```text
Keine OBS-Steuerung.
Keine Agent-Actions.
Keine produktiven Writes.
Keine Uploads ohne separaten Permission-/Audit-Step.
Keine Deletes ohne separaten Permission-/Audit-/Confirm-Step.
Keine DB-Migration ohne separaten freigegebenen Step.
Keine Shell-/Datei-/Prozess-Actions.
Keine Secrets in Logs, Status, UI oder Doku.
```

## Naechster sinnvoller Step

```text
RDAP_0.2.25_MEDIA_LOCAL_INVENTORY_READONLY
```

Ziel:

```text
Lokale Media-Ordner read-only inventarisieren, begrenzt und sicher:
- htdocs/assets/sounds
- htdocs/assets/videos
- htdocs/assets/images
```

Vor 0.2.25 wieder echte Dateien aus GitHub/dev lesen, besonders Media-/Sound-/Asset-nahe Dateien.
