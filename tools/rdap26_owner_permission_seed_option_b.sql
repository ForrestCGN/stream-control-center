-- RDAP26 Option B: DB-Rollen/Permissions sauber seeden
-- Projekt: stream-control-center / Remote-Modboard
-- Datum: 2026-06-25
--
-- Zweck:
--   ForrestCGN bekommt echte DB-Rolle owner.
--   Rolle owner bekommt echte Permissions:
--     - remote.view
--     - admin.users.note.read
--
-- Wichtig:
--   Dieses SQL ist bewusst idempotent bzw. schonend aufgebaut.
--   Es setzt keine Admin-Notiz-Writes frei.
--   Es erstellt keine Admin-Notiztexte.
--   Es aktiviert keine Agent-/OBS-/Sound-/Overlay-/Command-Actions.
--
-- Vor Ausfuehrung:
--   Backup der DB erstellen.
--   Tabellen/Spalten per Precheck pruefen.
--
-- Erwartete vorhandene Tabellen laut Code:
--   dashboard_users
--   dashboard_user_roles
--   dashboard_role_permissions
--
-- Ziel-User aus RDAP25:
--   user_uid = 'tw:127709954'
--   login_name = 'forrestcgn'

START TRANSACTION;

-- 1) User muss aus Login-Smoke-Test existieren.
-- Kein INSERT in dashboard_users, weil der Login den User bereits erzeugt hat.
SELECT user_uid, display_name, login_name, status
FROM dashboard_users
WHERE user_uid = 'tw:127709954'
LIMIT 1;

-- 2) Owner-Rolle fuer Forrest setzen.
-- Variante mit minimalen Pflichtspalten, passend zum Read-Code:
-- dashboard_user_roles(user_uid, role_key, revoked_at)
INSERT INTO dashboard_user_roles (user_uid, role_key, revoked_at)
SELECT 'tw:127709954', 'owner', NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM dashboard_user_roles
  WHERE user_uid = 'tw:127709954'
    AND role_key = 'owner'
    AND revoked_at IS NULL
);

-- 3) Owner-Rollen-Permissions setzen.
-- Der Read-Code liest dashboard_role_permissions(role_key, permission_key, effect).
INSERT INTO dashboard_role_permissions (role_key, permission_key, effect)
SELECT 'owner', 'remote.view', 'allow'
WHERE NOT EXISTS (
  SELECT 1
  FROM dashboard_role_permissions
  WHERE role_key = 'owner'
    AND permission_key = 'remote.view'
    AND effect = 'allow'
);

INSERT INTO dashboard_role_permissions (role_key, permission_key, effect)
SELECT 'owner', 'admin.users.note.read', 'allow'
WHERE NOT EXISTS (
  SELECT 1
  FROM dashboard_role_permissions
  WHERE role_key = 'owner'
    AND permission_key = 'admin.users.note.read'
    AND effect = 'allow'
);

-- 4) Read-back innerhalb der Transaktion.
SELECT role_key
FROM dashboard_user_roles
WHERE user_uid = 'tw:127709954'
  AND revoked_at IS NULL
ORDER BY role_key;

SELECT role_key, permission_key, effect
FROM dashboard_role_permissions
WHERE role_key = 'owner'
  AND permission_key IN ('remote.view', 'admin.users.note.read')
ORDER BY permission_key, effect;

COMMIT;
