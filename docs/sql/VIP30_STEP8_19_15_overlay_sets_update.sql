-- VIP30 STEP8.19.15 Overlay-Textsets auf Simple Name-Position umstellen
-- Ziel-DB laut Projektregel: D:\Streaming\stramAssets\data\sqlite\app.sqlite
-- Vorher Backup machen.
UPDATE vip30_settings
SET setting_value = "[{\"id\": \"heimleitung-upgrade-simple\", \"enabled\": true, \"weight\": 3, \"namePosition\": \"top\", \"kicker\": \"Upgrade im CGN-Altersheim\", \"headline\": \"wird Ehrenbewohner\", \"subline\": \"Die Rentner begrüßen freundlich, die Heimleitung nickt anerkennend.\", \"message\": \"Ein kleines VIP-Upgrade wurde genehmigt.\", \"brand\": \"CGN VIP-Lounge\"}, {\"id\": \"kleine-upgrades-simple\", \"enabled\": true, \"weight\": 2, \"namePosition\": \"top\", \"kicker\": \"30 Tage VIP\", \"headline\": \"hat sich 30 Tage VIP gegönnt\", \"subline\": \"Keine Extrawurst, nur ein paar liebevolle Kleinigkeiten.\", \"message\": \"Die VIP-Lane an der Essensausgabe ist kurz geöffnet.\", \"brand\": \"CGN Altersheim\"}, {\"id\": \"empfangskomitee-simple\", \"enabled\": true, \"weight\": 2, \"namePosition\": \"bottom\", \"kicker\": \"Rentner-Empfangskomitee\", \"headline\": \"Herzlich willkommen\", \"subline\": \"Die Bewohner rücken ein Stück zur Seite und machen Platz im Aufenthaltsraum.\", \"message\": \"Das Upgrade läuft ab jetzt dreißig Tage.\", \"brand\": \"CGN VIP-Lounge\"}, {\"id\": \"heimleitung-bescheid-simple\", \"enabled\": true, \"weight\": 1, \"namePosition\": \"bottom\", \"kicker\": \"Offizielle Heimdurchsage\", \"headline\": \"VIP-Upgrade für\", \"subline\": \"Die Heimleitung hat geprüft, genickt und freundlich abgestempelt.\", \"message\": \"Der neue Ehrenbewohner bekommt kleine Sonderleistungen mit Würde.\", \"brand\": \"CGN Heimleitung\"}]",
    value_type = 'json',
    category = 'alerts',
    label = 'VIP30 Overlay-Textsets',
    description = 'VIP30 Overlay-Textsets. Felder: id, enabled, weight, namePosition(top/bottom), kicker, headline, subline, message, brand. Username wird automatisch separat angezeigt.',
    editable = 1,
    updated_at = datetime('now')
WHERE setting_key = 'alerts.overlaySets';
