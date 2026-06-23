# RDAP6D Expected Results

Stand: 2026-06-23

## Erwartete Tabellen

- `schema_migrations`
- `dashboard_users`
- `dashboard_identities`
- `dashboard_roles`
- `dashboard_user_roles`
- `dashboard_groups`
- `dashboard_user_groups`
- `dashboard_permissions`
- `dashboard_role_permissions`
- `dashboard_module_permissions`
- `dashboard_sessions`
- `dashboard_locks`
- `dashboard_audit_log`

## Erwartete Rollen

- `owner`
- `admin`
- `lead_mod`
- `mod`
- `media_manager`
- `readonly`

Nicht erlaubt:

- `sound_profi` in `dashboard_roles`

## Erwartete Gruppe/Marker

- `sound_profi`
  - `group_type = group_marker`
  - `grants_permissions_by_itself = 0`

## Erwartete Rechte-Pruefung

- `dashboard_role_permissions` darf keine Zeilen mit `role_key = sound_profi` enthalten.
- `dashboard_module_permissions` darf existieren und leer sein.
- Spaetere Sound-Profi-Rechte duerfen nur gezielt ueber `subject_type = group`, `subject_key = sound_profi`, `target_type` und `target_key` vergeben werden.
