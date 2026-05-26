# Changelog

## Commands Backend v0.1.5 — safe-edit-param-fix

- Fix für `Unknown named parameter 'createdAt'` beim Bearbeiten bestehender Commands.
- UPDATE-Parameter werden jetzt ohne `createdAt` gesendet.
- INSERT-Parameter werden jetzt ohne `id` gesendet.
- Safe-Edit-Logik bleibt erhalten.
