# CAN-44.13.5 – AutoShoutout Modul-Doku korrekt einsortiert

Stand: 2026-06-04

## Zweck

Dieser Schritt korrigiert die Dokumentationsstruktur für AutoShoutout.

Forrest hat darauf hingewiesen, dass Modul-Dokus im bestehenden Bereich `docs/modules` geführt werden und dort über `docs/modules/README.md` auffindbar sein sollen.

## Geänderte Dateien

```text
docs/modules/README.md
docs/modules/clip-shoutout-vso.md
docs/modules/CLIP_SHOUTOUT_AUTOSHOUTOUT.md
docs/current/CAN44_13_5_DOCS_MODULES_INDEX_UPDATE.md
```

## Änderungen

```text
- AutoShoutout in docs/modules/README.md aufgenommen
- Shoutout-/AutoShoutout-Dokuabschnitt ergänzt
- Aktueller AutoShoutout-Stand in README aufgenommen
- clip-shoutout-vso.md aktualisiert und auf AutoShoutout-Fachdatei verlinkt
- AutoShoutout-Fachdatei um API-Routen und DB-Tabellen erweitert
```

## Keine Code-Änderung

Dieser Schritt enthält ausschließlich Doku-Dateien.

## Aktueller AutoShoutout-Stand

```text
clip_shoutout Version: 0.2.24
CAN-44.13.3: clear-target funktionsfähig
CAN-44.13.5: Doku in docs/modules integriert
```

## Nach Einspielen

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "CAN-44.13.5 AutoShoutout Docs Modules Index Update"
```
