# Revisione Animaldex — 26 ottobre 2026

La revisione ha individuato problemi concreti nel caricamento dei dettagli, nella sincronizzazione dei progressi e nelle autorizzazioni social. Le correzioni applicative sono nel working tree e superano i controlli locali. Le correzioni del database sono nella migrazione `supabase/migrations/20261025165601_review_security_performance.sql`, **preparata e provata localmente, non applicata a Supabase**. Nessun commit, push o deploy è stato eseguito.

Il caricamento di foto degli utenti resta fuori dalla configurazione richiesta: non sono stati creati tabelle o bucket per le foto. Le API già presenti sono state comunque protette.

## Risultati prioritari

| Priorità | Problema verificato | Conseguenza | Correzione e stato |
| --- | --- | --- | --- |
| P1 | `user_profiles_select_authenticated_social` consente agli utenti autenticati la lettura dei profili altrui, senza separare le colonne personali | Email, telefono, data di nascita e risposte del questionario possono essere richiesti direttamente all'API, anche se l'interfaccia non li mostra | Migrazione pronta: lettura completa solo del proprio profilo, funzione social con sei campi pubblici. Frontend adattato |
| P1 | L'inserimento in `friendships` non impone `status = 'pending'`; i permessi di aggiornamento non limitano le colonne | Una richiesta costruita fuori dall'interfaccia può aggirare il consenso all'amicizia o cambiare i partecipanti | Migrazione pronta: stato iniziale obbligatorio, accettazione del destinatario, partecipanti non modificabili |
| P1 | Le letture di `user_animals` non paginavano | Progressi incompleti oltre il limite della risposta; nel database verificato nove utenti hanno più di 1.000 righe, fino a 1.080 | Corretto nel client: pagine ordinate e cancellazione alla scadenza, senza accettare una risposta parziale come completa |
| P1 | API di riconoscimento/richiesta animale senza verifica server dell'identità | Chiamate al servizio a pagamento senza autenticazione e identità dichiarata dal chiamante | Corretto: verifica del token con Supabase Auth, identità derivata dal server, scritture sottoposte a RLS, limiti dei payload e tempi massimi |
| P1 | Controlli dei blocchi eseguiti attraverso una tabella con lettura limitata al solo autore del blocco | Il blocco nella direzione opposta può risultare invisibile; un'amicizia già accettata continua a concedere accesso | Migrazione pronta: controllo delle due direzioni e applicazione a profili social e progressi condivisi |
| P2 | Il dettaglio importava tutto il catalogo completo | Download e parsing di circa 9,17 MB di JavaScript non compresso per accedere a una singola scheda | Corretto: JSON separati per animale, generati durante build/start/test e identificati dall'hash del contenuto |
| P2 | I campi vuoti della scheda ridotta sovrascrivevano i dettagli completi | Possibile perdita di geografia e bioregioni nell'oggetto mostrato | Corretto: prevalgono i dettagli completi, mantenendo i progressi dell'utente |
| P2 | Paesi e badge locali non sempre erano separati per account; richieste precedenti potevano completarsi dopo il cambio utente | Possibile contaminazione dei progressi tra account sullo stesso browser | Corretto: chiavi per utente, reset dello stato e invalidazione delle risposte precedenti |
| P2 | Le statistiche social scaricavano sia aggregati sia righe individuali | Trasferimenti e lavoro duplicati | Corretto: le righe individuali vengono richieste solo per i profili privi di aggregati, con paginazione |
| P2 | Asset pubblici senza versione avevano un anno di cache immutabile | Immagini o geografie sostituite potevano restare vecchie sul dispositivo | Corretto in `vercel.json`: rivalidazione degli asset senza hash; cache lunga per JavaScript e dettagli con hash |

P1 indica un problema da risolvere prima di ampliare l'utilizzo dell'app; P2 riguarda affidabilità, prestazioni o manutenzione. Le righe segnate “migrazione pronta” sono ancora aperte online.

## Prestazioni: misure e limiti

Confronto tra build locali dello stesso working tree, prima e dopo queste correzioni. Le modifiche dell'utente già presenti sono state conservate.

| Risorsa | Prima | Dopo |
| --- | ---: | ---: |
| Dati completi per aprire una scheda | Chunk di 9.170.320 byte; 1.151.718 byte gzip | Un JSON per animale: mediana 7.567 byte; 2.364 byte gzip |
| JSON completo più grande | — | 33.967 byte; 5.708 byte gzip |
| Dati ridotti per la griglia, gzip | 219.334 byte | 238.931 byte |
| Animali verificati contro il sorgente | 1.080 | 1.080, contenuto JSON identico |

L'indice della griglia cresce di circa 20 KB compressi perché contiene gli indirizzi delle schede. Il beneficio maggiore riguarda l'apertura del dettaglio: il catalogo completo non compare più fra i chunk della build. Non è una misura percentuale del tempo di avvio dell'intera app.

Il browser locale mobile ha verificato home, ingresso nel Dex, filtro degli animali misteriosi, rendering iniziale di 60 elementi, filtro catturati e dettaglio della Libellula Imperatore. Il dettaglio richiede un solo JSON da 18.592 byte. Le prove usano risposte Supabase simulate e non misurano latenza mobile reale, rete Vercel o carico concorrente.

Restano risorse importanti da ottimizzare in un intervento dedicato:

- La mappa principale delle bioregioni occupa circa 14 MB. Ora il loader prova per primo il file realmente presente e conclude con un errore gestito se il caricamento fallisce. La riduzione geometrica richiede verifiche sui confini; valutare livelli di dettaglio o tile vettoriali senza cambiare le associazioni territoriali.
- Gli asset animali occupano circa 939 MB sul disco, le miniature circa 29 MB e i premi circa 109 MB. Questi sono totali del progetto, non download iniziali. Conservare le miniature per la griglia e generare varianti dimensionate anche per premi e sfondi.
- La griglia ha già caricamento progressivo, ricerca differita e lavoro nel worker: mantenerli. Per quantità superiori alle attuali, misurare memoria e scroll prima di passare alla virtualizzazione completa.
- Verificare le intestazioni della preview dopo il deploy: i JSON con hash devono ricevere cache lunga; geografie e immagini senza versione devono essere rivalidate. Un browser che ha già memorizzato la vecchia risposta immutabile può conservarla fino alla vecchia scadenza.

## Database e sicurezza

Sono stati letti schema, policy, funzioni, indici, conteggi aggregati e segnalazioni del progetto Supabase **Apex Project**. Le 19 tabelle pubbliche hanno RLS abilitata: la sua presenza non basta quando una policy concede una lettura troppo ampia. Non sono stati estratti dati personali degli utenti.

La migrazione aggiunge nove indici sulle chiavi esterne segnalate dall'advisor: reazioni/utente, notifiche/autore-evento-amicizia, animali/animale, badge/badge, blocchi/destinatario e segnalazioni/evento-utente segnalato. Conserva gli indici esistenti utili alle letture per utente e alla ricerca dei profili. Gli indici segnalati come inutilizzati non sono stati rimossi: contatori recenti o poco traffico non dimostrano che siano superflui. Anche i tre gruppi di indici duplicati richiedono controllo delle dipendenze prima della rimozione.

Una lettura amministrativa di 500 progressi usa l'indice `user_animals_user_animal_uidx`: nel campione l'esecuzione è circa 5 ms. Non è una prova delle stesse prestazioni attraverso RLS, Auth e API. La nuova funzione delle statistiche usa aggregazioni per utente e rispetta RLS; i tempi vanno misurati con identità e volumi rappresentativi dopo il rilascio.

La migrazione revoca inoltre `TRUNCATE`, `REFERENCES` e `TRIGGER` ai ruoli client e impedisce loro di scrivere i contatori di utilizzo. RLS non protegge `TRUNCATE`. La funzione pubblica delle statistiche diventa `SECURITY INVOKER` ed è eseguibile solo da utenti autenticati. I piccoli helper con privilegi elevati restano nello schema privato, con `search_path` vuoto, riferimenti qualificati e controlli espliciti sul chiamante.

Restano da gestire:

- **Quote server per le API a pagamento.** L'autenticazione impedisce l'uso anonimo, ma non limita un utente autenticato che automatizza richieste. Prima di attivare il riconoscimento fotografico, servono consumo atomico della quota e idempotenza lato server. I contatori nel browser non sono un limite affidabile.
- **Password compromesse.** L'advisor segnala la protezione disabilitata. Valutarne l'abilitazione nelle impostazioni Auth e verificarne disponibilità e impatto sul progetto.
- **Baseline del database.** La nuova migrazione è incrementale sullo schema osservato, non ricrea da zero tutto il database. Versionare una baseline verificata e poi usare solo migrazioni tracciate; `tests/sql/security_fixture.sql` è esclusivamente un modello ridotto per test locali.
- **Semantica dei progressi.** I client autorizzati possono dichiarare i propri avvistamenti. Se badge o classifiche avranno premi economici o valore competitivo, spostare l'attribuzione sul server. Non è stata introdotta questa nuova regola di prodotto.
- **Foto.** Nel controllo non risultano `animal_photos`, `animal_add_requests` né il bucket `animal-photos`. Nessuno è stato creato. Le modifiche alle API non rendono completa o attiva questa funzionalità.

Riferimenti: [RLS Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), [verifica con getUser](https://supabase.com/docs/reference/javascript/auth-getuser), [interruzione delle richieste](https://supabase.com/docs/reference/javascript/using-modifiers-abortsignal).

## Architettura, tassonomia e geografia

`src/Animaldex_sora.jsx` resta un file di circa 15.800 righe che contiene componenti, accesso ai dati, regole dei premi, stato globale e logica geografica. Il rischio principale è la difficoltà di cambiare una funzione senza effetti su altre schermate. Questa revisione estrae i servizi per dettagli, paginazione, profili social e persistenza per utente; non riscrive tutta l'interfaccia in una volta.

Prossima separazione consigliata, conservando comportamento e test:

```text
src/features/dex/          griglia, filtri, dettaglio
src/features/geography/    mappe, territori, spedizioni
src/features/social/       amicizie, ricerca, notifiche
src/features/profile/      account, premi, preferenze
src/services/              Supabase, fetch, cancellazione
src/domain/                tassonomia, progressi, regole pure
```

Caricare le schermate pesanti con import dinamici dopo la separazione. Evitare che cache e stato dell'account dipendano da variabili di modulo; rendere esplicito l'utente proprietario di ogni scrittura asincrona. Introdurre TypeScript per servizi e modelli nuovi, con tipi Supabase generati, prima di convertire gradualmente i componenti. Non serve una conversione totale per ottenere benefici.

Il catalogo locale e le rappresentazioni nel database duplicano parte delle informazioni. Serve una fonte autorevole e una versione del catalogo condivisa, con controllo di ID duplicati, codici geografici e associazioni non valide durante la build.

Per l'albero tassonomico, le attuali stringhe ripetute di regno/classe/ordine/famiglia/genere sono pratiche per un catalogo statico, ma fragili per modifiche e sinonimi. Quando la tassonomia diventa modificabile nel backend, un modello adatto è `taxa(id, parent_id, rank, scientific_name)` con `animals.taxon_id`, vincoli e indice su `parent_id`. Servono controllo dei cicli e regole sui ranghi; una closure table o un percorso materializzato va aggiunto solo se le query dei discendenti lo richiedono.

Per la distribuzione geografica, preferire relazioni indicizzabili come `animal_countries(animal_id, iso, source, confidence)` con chiave `(animal_id, iso)` e indice inverso `(iso, animal_id)`, distinguendo presenza scientifica e territorio di gioco. Le geometrie pubbliche statiche possono restare file versionati. PostGIS e un indice GiST diventano utili per ricerche spaziali reali, per esempio avvistamenti entro un raggio; non sono necessari solo per mostrare una mappa.

## Errori, dipendenze e deploy

I nuovi servizi hanno richieste cancellabili e controlli delle risposte. Le API restituiscono errori generici al browser, impostano `no-store` e non usano una service-role key per scrivere come l'utente. Il limite applicativo del payload fotografico resta inferiore al [limite del corpo delle Vercel Functions](https://vercel.com/docs/functions/limitations). La durata configurata comprende verifica dell'identità e timeout del servizio a valle.

Nel resto del monolite rimangono molti `catch` che proseguono con dati locali. Questa scelta consente l'uso in condizioni di rete debole, ma può nascondere una sincronizzazione incompleta. Separare gradualmente gli stati “salvato sul dispositivo”, “sincronizzazione in corso” e “salvato online”; per timeout di lettura usare cancellazione reale invece del solo `Promise.race` dove ancora manca. Centralizzare i log senza token, email o coordinate precise.

L'audit delle dipendenze del 26 ottobre riporta **53 pacchetti vulnerabili: 3 critical, 31 high, 9 moderate, 10 low**. Anche `npm audit --omit=dev` include Create React App perché `react-scripts` è nelle dipendenze ordinarie. Le tre segnalazioni critical osservate (`proxy-addr`, `shell-quote`, `websocket-driver`) risalgono a strumenti di sviluppo sotto `react-scripts`/`webpack-dev-server`; non dimostrano tre vulnerabilità equivalenti nelle API pubblicate.

Non è stato eseguito `npm audit fix --force`: l'audit propone anche una sostituzione distruttiva di `react-scripts` con `0.0.0`. Prima separare gli aggiornamenti compatibili del lockfile; poi migrare il sistema di build con verifica di worker, variabili d'ambiente, test e rotte Vercel. [Create React App è deprecato](https://react.dev/blog/2025/02/14/sunsetting-create-react-app). Il controllo segnala inoltre dati Browserslist datati. Le dipendenze restano invariate in questa revisione.

Il progetto Vercel osservato usa Node 24; le prove locali sono state eseguite con Node 22. Allineare la versione locale/CI a quella di produzione. Non è stato modificato il deployment online.

## Verifiche eseguite

- Build di produzione completata con successo.
- 12 suite Jest, 35 test superati, inclusi paginazione oltre 1.000 righe, errore a metà caricamento, account diversi e proiezione sicura dei profili.
- 7 test API superati: identità verificata, chiamante anonimo o non valido, input malformato, dimensioni, coordinate, URL immagine e timeout.
- Tutti i 1.080 JSON generati confrontati con gli oggetti originali, con verifica dell'hash del nome.
- Migrazione eseguita su PostgreSQL locale 18.3, con dati fittizi: isolamento dei profili, tentativi di falsa amicizia, accettazione lecita, blocchi nelle due direzioni, statistiche, permessi anonimi e contatori. Tutte le asserzioni superate. Il progetto online usa PostgreSQL 17.6; questa prova non sostituisce il controllo sulla preview del database.
- Flusso mobile nel browser sulla build locale, backend simulato, nessun errore JavaScript non gestito nel percorso verificato.
- `git diff --check` superato. Nessuna chiamata reale al servizio AI a pagamento, nessuna scrittura sui dati degli utenti.

## Rilascio consigliato

1. Esaminare e committare solo i file della revisione; le altre modifiche locali sono state conservate. I comandi sono in `review-push-commands-2026-10-26.md`.
2. Fare personalmente il push e attendere la build Vercel. Il nuovo frontend ha un fallback limitato ai campi pubblici se la nuova funzione social non è ancora presente.
3. Dopo aver verificato il frontend aggiornato, applicare la migrazione SQL al progetto corretto, con backup verificato. Non applicare il fixture dei test. La transazione ha limiti di attesa; in caso di lock si annulla, evitando un'applicazione parziale.
4. Ricontrollare gli advisor e provare con due account reali: richiesta, accettazione, ricerca, blocco, progressi, cambio account. Verificare da API che un utente non possa leggere le colonne personali dell'altro.

La nuova interfaccia è compatibile con il database precedente; un rollback del frontend dopo la migrazione richiede attenzione perché il vecchio codice leggeva direttamente i profili altrui. Non ripristinare la policy permissiva per aggirare il problema.

Queste verifiche riducono rischi specifici e dimostrano il comportamento dei percorsi provati. Non certificano l'assenza di ogni rallentamento: mappe, reti mobili lente e carico multiutente richiedono ancora misure rappresentative.
