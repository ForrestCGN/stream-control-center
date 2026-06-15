# NEXT_STEPS – stream-control-center

Stand: 2026-06-15 19:55

## Direkt nächster sinnvoller Schritt

```text
LC-MINIGAMES-2A Struktur-Cleanup
```

Ziel:

```text
Mini-Spiele bleibt Übersicht/Bedienung/Status.
Raffle-Config wird in Loyalty -> Einstellungen -> Bereich Raffle/Mini-Spiele-Raffle verschoben.
Raffle-Texte werden über Loyalty -> Texte -> Bereich Raffle gepflegt.
Commands/Rechte/Cooldowns langfristig über Loyalty -> Chat & Befehle.
```

## Vor LC-MINIGAMES-2A prüfen

```text
Aktuelle Dateien aus Repo/Live als Source of Truth nehmen.
Keine Funktionalität entfernen.
Bestehende Raffle-Config und API nicht brechen.
Bestehende Gamble-Config nicht umbauen.
```

## Danach priorisiert

### A. Raffle-Texte im Textbereich verbessern

```text
Bereichsfilter Raffle sichtbar/komfortabel machen.
Raffle-Keys schnell auffindbar machen.
Varianten löschen/deaktivieren bleibt möglich.
```

### B. Raffle-Laufzeit-Test im Chat

```text
!raffle
!join
Gewinnermeldung prüfen
Punktebuchung als raffle_win prüfen
Pool darf nicht öffentlich im Chat stehen
```

### C. Subscriber-Tier-Erkennung prüfen

```text
Viele Watch-Buchungen nutzen subscriber_multiplier_fallback.
Tier-2/Tier-3-Erkennung später testen.
```

### D. GiftSub-Receiver-Konfig/Buchung abgleichen

```text
Dashboard-Konfig small_bonus/tierAmounts vs reale event_bonus-Buchungen prüfen.
```

### E. Alert Shadow weiter beobachten

```text
Keine Produktivumschaltung.
Mehrere Streams Shadow prüfen.
Später alte direkte Alert-Route ablösen, wenn stabil.
```
