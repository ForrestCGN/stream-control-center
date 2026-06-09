# CURRENT CHAT HANDOFF – Loyalty / Glücksrad / Giveaways

Stand: 2026-06-09

## Aktueller bestätigter Stand

```text
STEP LWG-4K.2 – Static Chat Routes Order Fix
```

## Wichtigste Regeln

```text
Keine Funktionalität entfernen.
Streamer.bot ist außen vor.
!join wird nicht verwendet.
Commands sind eingetragen, aber nicht aktiv.
Aktivierung erst nach gesonderter Planung und Go.
Chattexte über helper_texts / module_text_variants.
Keine neue Bus-/Helper-Parallelstruktur erfinden.
Bestehenden Communication-/CanBus verwenden.
Produktive SQLite nie ersetzen/überschreiben.
```

## Bestätigte Funktionskette

```text
1. Presets/Wheel funktionieren.
2. Overlay reagiert auf Wheel-Spin.
3. Giveaways können erstellt/geöffnet/beendet werden.
4. Entries/Tickets funktionieren.
5. Entry-Storno funktioniert.
6. Gewinnerziehung ohne Rad funktioniert per crypto.randomInt.
7. Wheel-Giveaway erzeugt pending Wheel-Permission.
8. Wheel-/Rad-Claim-Logik im Backend funktioniert über Permission.
9. Claim startet echten Wheel-Spin.
10. Ergebnis wird gespeichert.
11. Permission wird used.
12. Giveaway wird finished.
13. Inaktive Commands + Textvarianten sind eingetragen.
14. /commands und /texts funktionieren nach Routen-Reihenfolge-Fix.
```

## Letzte bestätigte Live-Tests

```text
/api/loyalty/giveaways/commands -> ok=true, active=false, count=2
/api/loyalty/giveaways/texts    -> ok=true, module=loyalty_giveaways, count=9, variantCount=27
```

## Nächster Schritt

```text
Prompt anpassen / Projektprompt aktualisieren
```

Danach optional:

```text
LWG-4K.3 – echte Node/Twitch-Command-Struktur prüfen und Aktivierungsplan
```

## Nicht sofort bauen

```text
- keine Command-Aktivierung
- keine Twitch-Command-Ausführung
- keine Channel-Point-Anbindung
- keine Punktebuchung
```
