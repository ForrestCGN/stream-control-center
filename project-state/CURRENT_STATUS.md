# CURRENT STATUS - stream-control-center

Stand: 2026-05-09

## Aktueller Hauptfokus - Loyalty / Kekskrümel

Der Loyalty-/Kekskrümel-Block ist der nächste große Arbeitsbereich.

Vorhandene Referenzen:

- `project-state/STEP194_STREAMELEMENTS_LOYALTY_MIGRATION_ARCHITECTURE_2026-05-07.md`
- `project-state/STEP202_LOYALTY_CAPTURE_AND_MIGRATION_PREP_2026-05-09.md`
- `project-state/STEP202_1_LOYALTY_DB_FIRST_STANDARD_2026-05-09.md`
- `project-state/STEP202_2_LOYALTY_SHADOW_MODE_AND_BONUS_RULES_2026-05-09.md`

Aktueller Stand:

- Keine Loyalty-Code-Dateien vorhanden.
- Keine Loyalty-DB-Tabellen angelegt.
- Kein Loyalty-Dashboard-Modul vorhanden.
- StreamElements ist weiterhin aktiv.
- Die aktuellen StreamElements-Loyalty-Settings wurden per Screenshot bestätigt.
- User-Punkte-Import ist kein Blocker mehr für die erste technische Umsetzung.
- Loyalty soll zuerst im Shadow Mode parallel zu StreamElements laufen.

Verbindliche Loyalty-Regeln:

```text
Alles, was Kekskrümel gibt, nimmt, prüft, reserviert, erstattet oder verändert, läuft ausschließlich über das Loyalty-System.
```

```text
DB ist Hauptspeicher.
JSON ist nur Seed/Fallback/technische Boot-Konfig.
```

```text
Das neue Loyalty-System läuft zuerst parallel im Shadow Mode.
StreamElements bleibt aktiv.
User-Punkte aus StreamElements werden später importiert.
```

Bestätigte StreamElements-Werte:

```text
Currency name: Kekskrümel
Watch amount: 2
Interval: 10 Minuten
Subscriber multiplier: 3x
Follower bonus: 10
Tip bonus: 10 pro 1,00 EUR
Subscriber bonus: 50
Cheer bonus: 10 pro 100 Bits
Raid bonus: 50
Ignored users: STREAMELEMENTS, FORRESTCGN
Punkteverfall: nach mehr als 1 Jahr Inaktivität
```

Technische Auslegung:

```text
Subscriber erhalten Watch amount 2 x Subscriber multiplier 3 = 6 Kekskrümel.
```

Geplante zusätzliche Bonus-Regeln:

```text
resub_bonus
gift_sub_giver_bonus
gift_sub_receiver_bonus
sub_streak_bonus
```

Alle Bonus-Regeln sollen DB-basiert, dashboardfähig und als eigene Transaktionstypen nachvollziehbar sein.

## Aktueller TTS-Stand nach STEP200

Der TTS-Block ist technisch umgesetzt, live getestet, im Dashboard eingebunden und nutzt jetzt das globale DB-basierte Textvarianten-System.

Backend:

- `backend/modules/tts_system.js`
- DB-Zugriffe laufen über `backend/core/database.js`.
- Settings laufen über `backend/modules/helpers/helper_settings.js`.
- Textvarianten laufen über `backend/modules/helpers/helper_texts.js`.
- JSON `config/tts_config.json` bleibt Seed/Fallback/technische Boot-Konfig.
- JSON `config/tts_messages.json` bleibt Seed/Fallback fuer TTS-Texte.

Dashboard:

- `htdocs/dashboard/modules/tts.js`
- `htdocs/dashboard/modules/tts.css`
- Einbindung in `htdocs/dashboard/index.html`

## Aktueller SoundAlerts-Stand nach STEP193.17.2

SoundAlerts ist bis `STEP193.17.2` technisch umgesetzt, live getestet und dokumentiert. Der aktuelle Backend-Stand ist `soundalerts_bridge` Version `0.1.14`.

Backend:

- `backend/modules/soundalerts_bridge.js`
- Version: `0.1.14`
- DB-Zugriffe laufen über `backend/core/database.js`.
- Settings laufen über `backend/modules/helpers/helper_settings.js`.
- JSON `config/soundalerts_bridge.json` bleibt Seed/Fallback.

Dashboard:

- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`

## Bewusst offen

- Stream Store / Reward-Items erfassen.
- Giveaway-Settings und Historie prüfen.
- Aktive Chat-Games priorisieren.
- Gewünschte Commands/Aliase festlegen.
- Danach `STEP203 - Loyalty Core DB + Basis-API Shadow Mode`.
- TTS Settings-Tab später von Raw-JSON auf fachliche Formulare aufteilen.
- MariaDB-Adapter später zentral implementieren.
