# Animaldex performance audit

Data baseline: 18 giugno 2026
Ramo: `performance-review-apex`

## Baseline tecnica

La build di produzione passa correttamente con `npm run build`.

Output gzip riportato da Create React App:

| File | Dimensione gzip |
| --- | ---: |
| `build/static/js/930.5bad9704.chunk.js` | 1.1 MB |
| `build/static/js/main.ce8c5443.js` | 281.91 kB |
| `build/static/js/453.11d3d400.chunk.js` | 1.76 kB |
| `build/static/css/main.44b617f7.css` | 1.03 kB |

CRA segnala che il bundle e' significativamente piu' grande del consigliato.

Dimensioni su disco dei file principali generati:

| File | Dimensione |
| --- | ---: |
| `build/static/js/930.5bad9704.chunk.js` | 8.9 MB |
| `build/static/js/930.5bad9704.chunk.js.map` | 22 MB |
| `build/static/js/main.ce8c5443.js` | 1.0 MB |
| `build/static/js/main.ce8c5443.js.map` | 3.6 MB |

## Evidenze principali

### 1. Chunk dati animali molto pesante

Gravita': alta
Rischio regressione intervento: medio

Evidenza:

- `src/animals-data.js` pesa circa 16 MB.
- `src/Animaldex_sora.jsx` carica questi dati con `import('./animals-data')` in `loadLocalAnimalsData`.
- Il chunk separato generato, `930.5bad9704.chunk.js`, pesa 8.9 MB su disco e 1.1 MB gzip.

Interpretazione:

Il caricamento dinamico evita di mettere tutti i dati nel bundle principale, ma quando l'app richiede gli animali scarica comunque un blocco molto grande. Questo e' probabilmente uno dei costi piu' visibili al primo accesso alla griglia o alle sezioni che dipendono da `ANIMALS`.

Soluzione consigliata:

- Non refactorare subito la UI.
- Prima separare i dati in file JSON o moduli piu' piccoli per dominio d'uso: dati minimi da griglia, dati dettaglio, dati geografici, dati confronto.
- Caricare i dettagli completi solo quando l'utente apre una scheda o una sezione specialistica.

### 2. Asset immagini molto pesanti

Gravita': alta
Rischio regressione intervento: medio

Evidenza:

| Cartella | Dimensione |
| --- | ---: |
| `public/animals` | 911 MB |
| `public/awards` | 109 MB |
| `public/badges` | 32 MB |
| `public/regions` | 28 MB |
| `public/data` | 28 MB |
| `public/geo` | 17 MB |

File e gruppi notevoli:

- `public/animals`: 1106 file, 260 sopra 1 MB.
- `public/awards`: 70 file, 69 sopra 1 MB.
- `public/geo/bioregions-v4-terrestrial-marine-kepler.geojson.geojson`: 14 MB.

Interpretazione:

Anche se gli asset in `public` non entrano tutti nel bundle JS, possono rendere lente le schermate che mostrano molte card, premi, regioni o mappe. Il rischio maggiore e' caricare immagini grandi in griglie/listoni o usare immagini full-size dove basterebbero thumbnail.

Soluzione consigliata:

- Creare thumbnail WebP/AVIF per le card animali e usare le immagini grandi solo nei dettagli.
- Ottimizzare awards e region images, soprattutto quelle sopra 1 MB.
- Aggiungere `loading="lazy"` e dimensioni esplicite dove mancano.
- Verificare che le sezioni non precarichino immagini non visibili.

### 3. Componente principale troppo grande

Gravita': alta
Rischio regressione intervento: alto se fatto in modo massivo

Evidenza:

- `src/Animaldex_sora.jsx` pesa circa 904 KB e contiene 12.708 righe.
- Nello stesso file sono presenti componenti e funzionalita' molto diverse:
  - `AnimalCard`
  - `Grid`
  - `BioregionVectorMap`
  - `QuickSeenPage`
  - `ProfilePage`
  - `BadgesPage`
  - `RegionsPage`
  - routing interno e stato principale dell'app

Interpretazione:

Il problema non e' solo estetico. Un file cosi' grande rende piu' difficile isolare rendering, stato, memoizzazione e caricamento differito. Ogni intervento ampio qui ha rischio regressione alto.

Soluzione consigliata:

- Estrarre componenti solo a piccoli passi.
- Primo candidato sicuro: componenti gia' relativamente isolati come `AnimalCard` o helper puri.
- Evitare una riscrittura generale del file.

### 4. Griglia e card animali: area ad alto impatto

Gravita': alta
Rischio regressione intervento: medio

Evidenza:

- `AnimalCard` e' gia' wrappato in `React.memo`.
- `Grid` e' nel file principale e riceve `statusMap`, `visitedCountries`, `preset`, handler e stato tutorial.
- L'app gestisce oltre 1000 animali e molte immagini in `public/animals`.

Interpretazione:

`React.memo` sulle card e' un buon segnale, ma puo' non bastare se la griglia ricrea props, liste filtrate, handler o oggetti inline a ogni render. Con centinaia di card visibili, anche piccoli render inutili diventano costo percepibile.

Soluzione consigliata:

- Audit specifico dentro `Grid`: liste filtrate, sort, mapping, handler passati alle card.
- Memoizzare solo liste realmente costose.
- Stabilizzare callback e props della card dove serve.
- Valutare virtualizzazione solo dopo aver misurato quante card vengono renderizzate insieme.

### 5. Mappa geografica e GeoJSON

Gravita': media-alta
Rischio regressione intervento: medio

Evidenza:

- `public/geo/bioregions-v4-terrestrial-marine-kepler.geojson.geojson` pesa 14 MB.
- `BioregionVectorMap` e `RegionsPage` sono dentro `Animaldex_sora.jsx`.
- Le sezioni regioni usano molte strutture geografiche e immagini dedicate.

Interpretazione:

La mappa puo' essere un collo di bottiglia separato: download dati, parsing GeoJSON, calcolo geometrie, rendering SVG/canvas e aggiornamenti interattivi.

Soluzione consigliata:

- Caricare il GeoJSON solo quando serve davvero la mappa.
- Verificare se e' possibile semplificare geometrie o dividerle per livello: pianeta, regioni, subregioni.
- Misurare separatamente apertura sezione regioni e interazione mappa.

## Ordine consigliato dei microstep

1. Salvare questa baseline e non mischiarla con modifiche immagini gia' presenti nel working tree.
2. Isolare l'analisi del chunk `930`: capire quanta parte e' `animals-data` e quanta e' librerie/dati accessori.
3. Audit mirato di `Grid`: filtri, sort, `.map`, props delle card e numero di card renderizzate.
4. Piano asset: thumbnail animali, compressione awards, lazy loading immagini.
5. Piano mappa: lazy-load e possibile semplificazione del GeoJSON.
6. Solo dopo: primo refactor piccolo, preferibilmente estrazione di un componente o helper con rischio basso.

## Cosa non fare ora

- Non riscrivere `Animaldex_sora.jsx` in blocco.
- Non aggiungere memoizzazione casuale senza misurare.
- Non comprimere o sostituire tutte le immagini in un unico commit.
- Non mischiare modifiche performance con modifiche grafiche.
- Non toccare query Supabase prima di distinguere lentezza client, bundle, immagini e rendering.

## Primo intervento consigliato dopo l'audit

Prima modifica di codice consigliata:

Analizzare e poi ottimizzare `Grid` senza cambiare UI:

- individuare la lista finale renderizzata;
- assicurarsi che filtri e ordinamenti pesanti siano in `useMemo`;
- stabilizzare handler passati ad `AnimalCard`;
- verificare che `AnimalCard` non riceva oggetti ricreati inutilmente;
- aggiungere una misurazione leggera con React Profiler in locale, non in produzione.

Questo ha il miglior rapporto impatto/rischio: tocca il punto piu' visibile dell'app, ma puo' essere fatto in modo incrementale.
