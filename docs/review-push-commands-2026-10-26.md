# Commit e push della revisione

Eseguire dal proprio terminale. Questi percorsi includono solo il lavoro della revisione; non usare `git add .`, dato che il working tree contiene anche modifiche precedenti.

```sh
cd /Users/andreagalliazzo/Desktop/animaldex

git add -- \
  api/identify-animal.js api/request-animal-add.js server/supabaseAuth.js \
  package.json scripts/build-animals-grid-data.mjs \
  public/data/animal-details/.gitignore \
  src/Animaldex_sora.jsx src/animals-data-grid.js \
  src/animalsFull.worker.js src/animalsWorkerClient.js src/supabaseClient.js \
  src/animalDetails.js src/animalDetails.test.js \
  src/supabasePagination.js src/supabasePagination.test.js \
  src/socialProfiles.js src/socialProfiles.test.js \
  src/userProgressStorage.js src/userProgressStorage.test.js \
  src/app.smoke.test.js tests/api.test.cjs \
  tests/sql/security_fixture.sql tests/sql/security_assertions.sql \
  supabase/migrations/20261025165601_review_security_performance.sql \
  docs/full-stack-review-2026-10-26.md docs/review-push-commands-2026-10-26.md

git add -p -- vercel.json
git diff --cached --stat
git diff --cached --check
git commit -m "Migliora caricamento, isolamento account e sicurezza Animaldex"
git push origin main
```

In `git add -p`, selezionare le modifiche alla cache e alle durate delle due API. Le regole `/content-studio` e l'aggiunta della sezione `/home` erano già presenti prima della revisione: non includerle automaticamente in questo commit. Se Git raggruppa interventi diversi nello stesso blocco, usare `s` per separarlo oppure `e` per modificarlo. Per `/home`, includere solo il cambio di cache se si include anche la sezione preesistente; altrimenti lasciare quel blocco fuori e rivalutarlo con il lavoro originale.

I JSON dei singoli animali sono generati automaticamente dai comandi di build/start/test e non vanno aggiunti a Git. La rimozione di `src/animalsFull.worker.js` è intenzionale.

Il push non applica la migrazione Supabase. Pubblicare prima il frontend aggiornato, poi applicare solo il file della migrazione al progetto Apex corretto. I file `tests/sql/` sono riservati a un database locale usa e getta e non devono essere eseguiti sul progetto online.
