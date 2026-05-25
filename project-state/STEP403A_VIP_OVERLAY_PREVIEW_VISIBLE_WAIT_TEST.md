# STEP403A - VIP Overlay Preview Visible Wait Test

## Ausgangslage

STEP403 hat technisch bestanden:

- `vip.overlay.show` wurde an `vip_sound_overlay_v2` zugestellt.
- `vip.overlay.hide` wurde zugestellt.
- Beide Events wurden per Ack bestätigt.
- Das Sound-System wurde nicht ausgelöst.

Der sichtbare Test war jedoch nicht aussagekräftig, weil der Hide-Event nach ca. 1 Sekunde gesendet wurde. Bei Intro-Animation, OBS-Browser-Verzögerung und Preview-Rendering kann die Karte dadurch praktisch unsichtbar bleiben.

## Änderung in STEP403A

Keine Produktivdateien werden geändert. STEP403A liefert nur ein korrigiertes Diagnoseskript.

Ablauf:

1. Status prüfen.
2. `vip.overlay.show` senden.
3. Show-Ack prüfen.
4. Standardmäßig 7 Sekunden sichtbar warten.
5. `vip.overlay.hide` senden.
6. Hide-Ack prüfen.
7. Sound-System unverändert prüfen.
8. Communication-Watchdog prüfen.

## Produktivstatus

Der bestehende VIP-Flow bleibt unverändert:

- produktive VIP-Anzeige weiterhin über Sound-System
- Preview-Test über Communication-Bus
- keine Sound-Queue durch Preview
- keine Entfernung bestehender Funktionalität

## Nächster möglicher Schritt

Wenn STEP403A optisch und technisch PASS ist, kann STEP404 als Stable-Handoff erstellt werden. Danach kann entschieden werden, ob `vip.overlay.show/hide` später als echte alternative Steuerlogik genutzt werden soll.
