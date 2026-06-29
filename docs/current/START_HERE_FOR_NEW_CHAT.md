# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.25 - Media Local Inventory Readonly`.

Verbindlich:

```text
GitHub/dev ist Wahrheit.
Vor Planung/Code echte Dateien aus GitHub/dev lesen.
Erst Plan nennen, dann auf explizites go warten.
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI.
```

## Bestaetigter/aktueller Fokus

```text
OBS ist bei 0.2.22E geparkt.
Media-System ist neuer Fokus.
0.2.24: Media-Foundation read-only.
0.2.25: lokales Media-Inventar read-only vorbereitet.
```

## Lokal/Online

```text
Lokal: echte Media-Dateien liegen auf dem Stream-PC unter htdocs/assets/*.
Online: Webserver hat keinen direkten Zugriff auf lokale Stream-PC-Dateien.
Online-Media-Inventar braucht spaeter Agent-WSS-Sync, memory-only.
```

## Sicherheitsgrenzen

```text
Keine Media-Uploads.
Keine Media-Deletes.
Keine Media-Edits.
Keine DB-Migration.
Keine Agent-Actions.
Keine Shell-/Datei-/Prozess-Actions.
Keine absoluten Pfade in API/UI.
```

## Naechster sinnvoller Step

Erst 0.2.25 lokal/online testen. Danach Media-Agent-Inventory-Sync read-only oder echte Permission-Middleware fuer spaetere Writes planen.
