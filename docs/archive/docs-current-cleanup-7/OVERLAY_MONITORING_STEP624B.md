# Overlay Monitoring STEP624B

STEP624B ergänzt die szenenbezogene Overlay-Auswertung um rekursive Unter-Szenen.

Der Monitor zeigt jetzt alle Browser-/Overlayquellen, die in der aktuellen OBS-Szene direkt oder über eingebundene Szenen erreichbar sind. Sichtbarkeit wird als effektive Sichtbarkeit bewertet: Eine Quelle ist nur effektiv sichtbar, wenn alle Eltern-Items und die Quelle selbst sichtbar sind.

Die Anzeige bleibt read-only. Reparaturaktionen wie Browser-Cache-Refresh oder Quelle aus/ein folgen in einem späteren Step.
