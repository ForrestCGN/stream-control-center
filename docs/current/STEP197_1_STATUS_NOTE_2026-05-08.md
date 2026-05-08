# STEP197.1 Status Note - Alert Overlay Pfad korrigiert

STEP197 lag versehentlich unter `htdocs/overlay/_overlay-alerts-v2.html`.
Die echte OBS-Quelle `_AlertsV2` nutzt jedoch die Datei unter `htdocs/overlays/_overlay-alerts-v2.html`.

STEP197.1 legt den Audio-Dedupe-Fix auf den richtigen Pfad.

Wichtig: Der falsche Parallelpfad `htdocs/overlay/_overlay-alerts-v2.html` soll aus dem Repo entfernt werden.
