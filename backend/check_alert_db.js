const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('D:/Streaming/stramAssets/data/sqlite/app.sqlite');

console.log('integrity:', db.prepare('PRAGMA integrity_check').all());

console.log('schema_versions columns:', db.prepare("PRAGMA table_info(schema_versions)").all());

console.log('schema:', db.prepare('SELECT module_name, version, updated_at FROM schema_versions ORDER BY module_name').all());

console.log('alert tables:', db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'alert_%' ORDER BY name").all());

console.log('alert counts:', {
  alert_types: db.prepare('SELECT COUNT(*) AS count FROM alert_types').get(),
  alert_rules: db.prepare('SELECT COUNT(*) AS count FROM alert_rules').get(),
  alert_assets: db.prepare('SELECT COUNT(*) AS count FROM alert_assets').get(),
  alert_events: db.prepare('SELECT COUNT(*) AS count FROM alert_events').get(),
  alert_text_variants: db.prepare('SELECT COUNT(*) AS count FROM alert_text_variants').get(),
  alert_test_presets: db.prepare('SELECT COUNT(*) AS count FROM alert_test_presets').get(),
  alert_display_profiles: db.prepare('SELECT COUNT(*) AS count FROM alert_display_profiles').get()
});

db.close();
