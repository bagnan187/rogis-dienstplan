# ROGIS Dienstplan v6.4.4 Hotfix

Behebt den Laufzeitfehler `segs is not defined` in der Azubi-/Mentor-Zuordnung.

Zusätzlich wurde die Validierung erweitert: `npm run validate` führt jetzt einen echten Laufzeittest der Fahrplan-Generierung für mehrere Werk- und Wochenendtage aus. Dadurch werden ReferenceErrors im Generator vor einem Deploy erkannt.

Keine neue D1-Migration erforderlich.
