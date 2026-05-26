# Channelpoints – Redemptions Page Cleanup (STEP504)

Ziel: Die normale Einlösungen-Seite bleibt simpel und zeigt nur Verlauf/Status/Statistik.

## Ergebnis

- Keine Dummy-/Preview-Bedienung mehr direkt auf der Einlösungen-Seite.
- Einlösungen-Seite zeigt letzte Einlösungen, Gesamtzahl, ausgeführt, offen/empfangen, blockiert/ignoriert und Fehler.
- Test-/Preview-Werkzeuge liegen in Diagnose unter einem einklappbaren Bereich.
- Keine Backend-Änderung, kein Twitch-Write, keine DB-Migration.

## Fachliche Regel

- Reward inaktiv: nicht ausführen.
- Reward aktiv + Aktion vollständig: bei Einlösung ausführen.
- Reward ohne Aktion: darf nicht aktiviert werden und wird nicht ausgeführt.
