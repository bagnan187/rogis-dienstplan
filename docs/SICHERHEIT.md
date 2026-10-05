# Sicherheit / Betrieb

- Erstpasswort: `Start123`; Passwortwechsel beim ersten Login ist verpflichtend.
- Passwörter werden nur als Hash + Salt in D1 gespeichert.
- Sitzungen laufen nach 14 Tagen ab.
- Adminrechte sind im Mitarbeiterstamm auf fünf Personen begrenzt.
- Für einen echten längerfristigen Produktivbetrieb sollten später zusätzlich Rate-Limits, Passwort-Reset und Audit-Logs ergänzt werden.
