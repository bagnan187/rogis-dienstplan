# Einrichtung nur mit dem Handy

## 1. ZIP entpacken
Auf iPhone in der Dateien-App das ZIP antippen; dadurch entsteht der Ordner `ROGIS_Dienstplan_GitHub_Cloudflare`.

## 2. GitHub-Repository anlegen
1. github.com öffnen und anmelden.
2. Neues Repository, z. B. `rogis-dienstplan`.
3. Sichtbarkeit `Private` ist völlig in Ordnung.
4. Repository erstellen.
5. `Add file` → `Upload files` und **den Inhalt** des entpackten Ordners hochladen (`src`, `public`, `migrations`, `docs`, `wrangler.jsonc`, `package.json`, `.gitignore`, `README.md`).

## 3. D1-Datenbank erstellen
1. Cloudflare Dashboard → `Storage & Databases` / `D1`.
2. `Create database`.
3. Name: `rogis-dienstplan-db`.
4. Datenbank öffnen und die **Database ID / UUID** kopieren.

## 4. D1-ID in GitHub eintragen
1. In GitHub `wrangler.jsonc` öffnen.
2. Stift / Edit antippen.
3. `PASTE_D1_DATABASE_ID_HERE` durch die kopierte UUID ersetzen.
4. Commit changes.

## 5. Cloudflare mit GitHub verbinden
1. Cloudflare → Workers & Pages → Create application.
2. `Connect GitHub`.
3. Repository `rogis-dienstplan` auswählen.
4. Root directory: leer / Repository-Wurzel.
5. Build command: leer lassen (kein Build nötig).
6. Deploy command: `npx wrangler deploy`.
7. Deploy starten.

Cloudflare installiert die in `package.json` angegebene Wrangler-Version und deployed den Worker samt `public/`-Assets.

## 6. Kontrolle
Öffne zuerst:

`https://<dein-worker>.workers.dev/api/health`

Erwartet: `{"ok":true,...}`.

Danach Startseite öffnen und einloggen.

## 7. Spätere Updates
Wenn du später eine neue Version von ChatGPT erhältst, ersetzt du die geänderten Dateien im GitHub-Repository. Jeder Push/Commit auf den verbundenen Branch löst automatisch ein neues Cloudflare-Deployment aus. Die D1-Datenbank und gespeicherten Dienstpläne bleiben bestehen.

## Wichtig
- `wrangler.jsonc` nicht wieder mit einer Platzhalter-D1-ID überschreiben.
- D1 nicht löschen, sonst sind Passwörter, gespeicherte Pläne und Einsprüche weg.
- Ein normales Seiten-Reload verändert gespeicherte Wochenpläne nicht.


## Manuelle Dienstbearbeitung

Nach dem Login als Admin: **Alle Dienste** öffnen, Tag wählen und beim Mitarbeiter **Bearbeiten** antippen. Urlaub/Krank/Frei/Reserve/Organisation oder einen individuellen Dienst speichern. Die Änderung liegt in D1 und bleibt bei Reloads und Neugenerierungen bestehen.
