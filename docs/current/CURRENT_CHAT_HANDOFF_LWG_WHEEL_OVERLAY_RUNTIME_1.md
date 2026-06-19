# Current Chat Handoff – LWG Wheel Overlay Runtime 1

Datum: 2026-06-19
Projekt: stream-control-center / Loyalty-Giveaways / Giveaway-bound Glücksrad
Arbeitsstand: Nach LWG-Dashboard-Copy-Bound-Wheel-Fixes und Overlay-Runtime-Fix

## Kurzstatus

Das Giveaway-bound Wheel-System wurde heute mit einer kopierten Test-Giveaway-Instanz erfolgreich durch den Backend-Flow getestet.

Bestätigt:

- Giveaway-Kopie wird im Dashboard angezeigt.
- Kopieren-Button ist auch bei Entwürfen sichtbar.
- Beim Kopieren wird das gebundene Giveaway-Glücksrad mitkopiert.
- Die Kopie hat ein eigenes Bound-Wheel.
- Die Kopie hat 8 Felder.
- Die Kopie ist startbereit.
- Open → Entries → Close → Draw funktioniert.
- Wheel-Permission wird erzeugt.
- Wheel-Claim funktioniert.
- Spin wird serverseitig erzeugt.
- Winner wird auf `wheel_completed` gesetzt.
- Ergebnisfeld wird im Winner gespeichert.
- Bound-Wheel-Feld `quantityRemaining` wird reduziert.
- Bus/WS liefert den Spin an das Overlay.

Getestete Kopie:

```text
giveaway_1781856708568_9653eba68a211017
```

Gebundenes Rad:

```text
giveawaywheel_1781856708568_839fb2b118fc40a3
```

Testgewinner im manuellen Test:

```text
una_solala
```

Testergebnis im Wheel:

```text
Roadside Research
```

Hinweis: `una_solala` gewann nur, weil die Ausschlussliste im manuellen Funktionstest bewusst übersprungen wurde. Die Exclusion-Funktion ist weiterhin offen und muss sauber ins Dashboard integriert werden.

## Durchgeführte Schritte / ZIPs

### LWG_DASHBOARD_COPY_BUTTON_4

Ziel:

- Kopieren-Button auch bei Draft/Edit-Status sichtbar machen.
- Gebundenes Wheel beim Kopieren korrekt auf die neue Giveaway-Kopie übertragen.

Ergebnis:

- Kopierte Giveaway-Instanz hatte eigenes Bound-Wheel.
- Felder: 8
- Startbereit: Ja

### LWG_EVENING_FULL_FLOW_TEST_2

Ziel:

- Readiness-Test und Abend-Flow-Test per Script vorbereiten.
- Status, Giveaway, Bound-Wheel, Open/Entry/Close/Draw/Wheel prüfen.

Ergebnis:

- NoWrite Readiness erfolgreich.
- Schreibender Flow lief bis zur Ausschlussliste, brach dort wegen Platzhalter-Dateiname ab.
- Danach wurde der Flow manuell fortgesetzt.

### Manuell getesteter Flow

1. Giveaway geöffnet.
2. Test-Entries hinzugefügt:
   - forrest_test
   - una_solala
   - engelcgn
   - udowb
   - urlug
3. Ausschlussliste übersprungen.
4. Giveaway geschlossen.
5. Gewinner gezogen.
6. Wheel-Permission erzeugt.
7. Wheel-Claim ausgelöst.
8. Spin abgeschlossen.
9. Ergebnis gespeichert.

### LWG_WHEEL_OVERLAY_RUNTIME_1

Ziel:

- Wheel-Overlay soll nicht dauerhaft sichtbar sein.
- Overlay soll per Bus/WS sichtbar werden.
- Overlay soll nach Ergebnis wieder ausblenden.
- Reset soll Overlay sofort ausblenden.
- Feldtexte sollen nicht mehr quer über das Rad laufen.

Betroffene Datei:

```text
htdocs/overlays/loyalty/wheel_overlay.html
```

Geplantes/geliefertes Verhalten:

- Initial unsichtbar.
- `loyalty.wheel.spin` → Overlay einblenden.
- `loyalty.wheel.finished` → Ergebnis anzeigen, danach Auto-Hide.
- `loyalty.wheel.reset` → sofort ausblenden/reset.
- Zusätzliche Show/Hide-Bus-Events vorbereitet:
  - `loyalty.wheel.overlay.show`
  - `loyalty.wheel.overlay.hide`
  - `overlay.loyalty.wheel.show`
  - `overlay.loyalty.wheel.hide`
- Feldtexte werden in den Segmenten kompakter, maximal zweizeilig und gekürzt.
- Winner-Banner begrenzt lange Namen.

Wichtig: Dieser Overlay-Fix wurde vor Chatwechsel noch nicht vollständig final verifiziert. Nächster Chat soll damit starten.

## Beobachtungen / offene Punkte

### Overlay-Layout

Beim ersten echten Spin vor Runtime-Fix war das Rad sichtbar, aber noch nicht streamtauglich:

- lange Feldnamen überlappten stark,
- Text lief quer über Nachbarfelder,
- Winner-Text unten war sehr breit,
- Overlay blieb dauerhaft sichtbar.

Neue Idee des Nutzers:

- Texte je Feld von oben nach unten im Segment darstellen,
- notfalls zweizeilig,
- An-/Ausschalten über Bus wie beim Shot-Overlay.

### Winner-/Finale-Overlay

Zwischendurch war `event_winner_overlay.html` sichtbar. Das gehört nicht zum Wheel-Overlay.

Vermutung:

- alter Runtime-State oder OBS-Quelle sichtbar,
- separat später prüfen.

Für den Wheel-Test wurde das erstmal ignoriert.

### Ausschlussliste

Aktuell noch nicht sauber integriert.

Soll langfristig ins Dashboard:

- globale Ausschlussliste,
- ggf. pro Giveaway zusätzliche Ausschlüsse,
- Speicherung bevorzugt per Twitch User-ID,
- Fallback Login/DisplayName,
- Dashboardfreundliche Verwaltung,
- Draw muss ausgeschlossene User zuverlässig ignorieren.

Der bisherige Script-Workaround ist für Dauerbetrieb zu fehleranfällig.

## Nächste Testschritte im neuen Chat

1. Sicherstellen, dass `LWG_WHEEL_OVERLAY_RUNTIME_1.zip` entpackt wurde.
2. `stepdone` ausführen, falls noch nicht passiert:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "LWG-WHEEL-OVERLAY-RUNTIME-1 Overlay show-hide und Textlayout"
```

3. OBS-/Browserquelle für Wheel-Overlay refreshen.
4. Prüfen: Wheel-Overlay ist initial unsichtbar.
5. Direkten Spin-Test mit Bound-Wheel-Feldern ausführen.
6. Prüfen:
   - Overlay blendet bei Spin ein,
   - echte Giveaway-Felder sind sichtbar,
   - Texte überlappen nicht massiv,
   - Ergebnis erscheint,
   - Overlay blendet nach Hold-Zeit wieder aus.
7. Wenn Textlayout noch nicht gut ist: Segmenttext endgültig umbauen auf vertikale Segmentboxen / 2-Zeilen-Layout.

## Wichtige Arbeitsregel für nächsten Chat

Nicht blind weiterbauen. Erst testen, was `LWG_WHEEL_OVERLAY_RUNTIME_1` wirklich macht. Danach gezielt nachbessern.
