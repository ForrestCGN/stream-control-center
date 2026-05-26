# Channelpoints – Redemption History / User Tracking

Stand: STEP506  
Dashboard UI: 0.9.7 / `redemption-history-user-tracking`

## Ziel

Der Kanalpunkte-Bereich zeigt nun klarer, **wer wann welchen Reward ausgelöst hat**. Die Daten kommen aus der bereits vorhandenen Tabelle `channelpoints_redemptions`.

## Gespeicherte Verlaufsdaten

Die bestehende Redemption-Tabelle enthält bereits die wichtigen Felder:

- `twitch_redemption_id`
- `twitch_reward_id`
- `reward_key`
- `user_id`
- `user_login`
- `user_display_name`
- `user_input`
- `status`
- `result_json`
- `redeemed_at`
- `created_at`
- `updated_at`

Damit kann das Dashboard anzeigen:

- Zeitpunkt der Einlösung
- User / Login / Twitch-ID
- Reward / lokaler Reward-Key
- optionale User-Eingabe
- Aktion bzw. Ergebnis
- Status

## Dashboard-Änderungen

- Die Einlösungen-Seite wurde als Verlaufstabelle erweitert.
- Die Statistik zeigt zusätzlich Top-User.
- Die Datenmenge für den Dashboard-Verlauf wurde von 25 auf 100 Einträge erhöht.
- Keine neue Tabelle.
- Keine neue DB-Anbindung.
- Keine eigene SQLite-Logik.
- Keine neuen Modi.
- Kein Twitch-Write.

## DB-Regel

Weiterhin gilt: Datenbankzugriff läuft über den vorhandenen zentralen Core-Database-Helper. Neue direkte SQLite-/MariaDB-Anbindungen sind nicht Bestandteil dieses Steps.
