# ROGIS Dienstplan Update v5.6

Neu:
- echte Planversions-Historie mit Aktivieren älterer Versionen
- Durchwürfeln erzeugt neue Zufallsverteilung + neue aktive Version
- komplette Woche verwerfen und neu erzeugen (optional inklusive manueller Overrides)
- einzelne Person neu generieren
- individuelle Generationskriterien pro Mitarbeiter

Nach dem Entpacken und Pushen die D1-Migration einmal remote ausführen:

    npx wrangler d1 migrations apply rogis-dienstplan-db --remote

Die Worker-Startlogik legt die neuen Tabellen ebenfalls automatisch an; die Migration sichert zusätzlich vorhandene aktive Alt-Pläne in der Versionshistorie.
