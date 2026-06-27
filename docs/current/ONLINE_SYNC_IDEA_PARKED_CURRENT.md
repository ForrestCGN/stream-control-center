# Geparkte Idee - Kontrollierter Online-Sync

Stand: 2026-06-27  
Status: Idee geparkt, nicht umgesetzt

## Ursprung

Forrest fragte nach Version `0.2.5 - Lokales Dashboard vorbereitet`, ob lokale Dashboard-Aenderungen spaeter automatisch auf die Internetseite uebertragen werden koennten.

## Kurzantwort

Ja, grundsaetzlich ist das moeglich. Es soll aber nicht als blinder Auto-Upload gebaut werden, sondern als kontrollierte Sync-Schicht.

## Zielbild

```text
Lokales Dashboard
-> Aenderung lokal speichern
-> Aenderung als Entwurf / wartet auf Sync markieren
-> Sync-Modul prueft Typ, Rechte und Ziel
-> Forrest/Admin gibt frei
-> Webserver prueft Permission, Confirm-Write, Audit, Lock, Backup/Readback
-> Aenderung wird online aktiv
```

## Grundregel

```text
Lokal aendern ist nicht automatisch oeffentlich live.
```

## Moegliche Modi

```text
1. Nur lokal speichern
2. Fuer Online-Sync vormerken
3. Freigeben und online uebernehmen
```

## Potenziell syncbare harmlose Bereiche

- Dashboard-Texte,
- Anzeige-/Overlay-Konfigurationen,
- Modul-Einstellungen,
- Stream-Titel-Vorlagen,
- Sound-Zuordnungen als Konfiguration,
- Rollen-/Anzeige-Metadaten.

## Kritische Bereiche - niemals blind automatisch

- Benutzerrechte,
- Admin-Notizen,
- Commands,
- Channelpoints,
- OBS-Aktionen,
- Sounds ausloesen,
- Dateien loeschen/ueberschreiben,
- Prozesse starten,
- Shell-Befehle,
- freie URL-Ausfuehrung.

## Voraussetzungen fuer spaetere Umsetzung

Ein spaeterer Online-Sync braucht immer:

- eigenen Backend-Scope,
- klare erlaubte Aenderungstypen,
- Permission pro Aenderungstyp,
- Confirm-Write,
- Audit-Log,
- Locking,
- Backup/Rollback,
- Readback,
- Konfliktanzeige lokal/online,
- keine Secret-Ausgabe,
- keine ungepruefte Dateisystem- oder Prozessaktion.

## Aktuelle Entscheidung

Nicht jetzt bauen. Beim lokalen Dashboard aber Datenstrukturen so planen, dass spaeter ein kontrollierter Sync moeglich bleibt.
