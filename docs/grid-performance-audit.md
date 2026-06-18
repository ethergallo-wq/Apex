# Animaldex Grid performance audit

Data audit: 18 giugno 2026
File analizzato: `src/Animaldex_sora.jsx`
Area: `Grid`, `AnimalCard`, `AnimalImg`

## Sintesi

La `Grid` e' gia' parzialmente ottimizzata: la lista renderizzata e' dentro `useMemo`, `AnimalCard` e `AnimalImg` sono gia' `React.memo`, e le immagini in griglia usano `loading="lazy"` e `decoding="async"`.

Il collo di bottiglia piu' probabile non e' quindi "manca memo ovunque", ma questo insieme:

- la `Grid` ricrea una copia di ogni animale a ogni ricalcolo della lista;
- alcune opzioni filtro vengono rigenerate scansionando tutti gli animali a ogni render della `Grid`;
- l'handler passato a ogni `AnimalCard` non e' stabile;
- la griglia renderizza tutti i risultati insieme;
- la card contiene molte style object inline e legge `window.innerWidth` direttamente durante il render.

## Evidenze

### 1. Lista principale gia' in `useMemo`, ma copia tutti gli animali

Gravita': alta
Rischio intervento: medio

Evidenza:

`Grid` calcola `list` con:

```jsx
ANIMALS
  .map(a => ({ ...a, status: getResolvedAnimalStatus(a, statusMap, visitedCountries) }))
  .filter(...)
  .sort(...)
```

Questa struttura e' corretta come intenzione, ma costosa:

- ogni ricalcolo crea un nuovo oggetto per ogni animale;
- ogni card riceve un nuovo riferimento `a`;
- `React.memo(AnimalCard)` perde parte del vantaggio quando la prop principale cambia riferimento;
- anche filtri leggeri passano prima dalla copia completa.

Intervento consigliato:

- evitare la copia globale iniziale;
- calcolare `status` dentro il filtro e aggiungerlo solo agli animali che arrivano alla lista finale;
- oppure mantenere una mappa `resolvedStatusById` memoizzata e passare lo status separatamente alla card.

### 2. Opzioni filtro ricalcolate a ogni render

Gravita': media-alta
Rischio intervento: basso

Evidenza:

Dentro `Grid` vengono ricostruite a ogni render:

- `rarityOpts`
- `consOpts`
- `statusOpts`
- `trophicOpts`
- `geographyOpts`
- `categoryOpts`
- `mapProfileOpts`
- `bioRegionOpts`
- `gameRegionOpts`
- `habitatOpts`
- `sortOpts`
- `filterDefs`

Le piu' costose sono quelle che scansionano `ANIMALS`:

```jsx
const mapProfileOpts = uniqueOpt(ANIMALS.map(...));
const bioRegionOpts = uniqueOpt(ANIMALS.map(...));
const gameRegionOpts = uniqueOpt(ANIMALS.map(...));
const habitatOpts = uniqueOpt(ANIMALS.map(...));
```

Intervento consigliato:

- mettere queste opzioni in `useMemo`;
- per le opzioni statiche, spostarle fuori da `Grid` o memoizzarle con dipendenze vuote;
- per le opzioni derivate dagli animali, dipendere solo dalla sorgente dati animali, non da search/sheet/menu.

Questo e' probabilmente il primo fix piu' sicuro.

### 3. Handler card non stabile

Gravita': media
Rischio intervento: basso

Evidenza:

`handleCardClick` e' ricreato a ogni render:

```jsx
const handleCardClick = (animal) => {
  ...
};
```

Ogni `AnimalCard` riceve `onClick={handleCardClick}`. Anche con `React.memo`, il cambio riferimento dell'handler puo' causare render inutili.

Intervento consigliato:

- convertire `handleCardClick` in `useCallback`;
- includere solo dipendenze necessarie: `tutorialActive`, `tutorialAnimalId`, `onSelect`, `onTutorialAnimalSelect`.

### 4. Tutti i risultati vengono renderizzati insieme

Gravita': alta se la lista supera qualche centinaio di card
Rischio intervento: medio-alto

Evidenza:

La griglia renderizza direttamente:

```jsx
list.map(a => <AnimalCard ... />)
```

Con oltre 1000 animali totali e immagini pesanti, ogni filtro che produce molte card puo' generare un DOM grande. Il lazy loading delle immagini aiuta la rete, ma non elimina il costo React/DOM delle card non visibili.

Intervento consigliato:

- prima misurare quante card appaiono nei casi reali: ricercati, misteriosi, catturati, filtro regione;
- se spesso sono centinaia, introdurre virtualizzazione o rendering progressivo;
- non partire subito dalla virtualizzazione perche' il layout a 3 colonne e le altezze responsive vanno trattati con cura.

### 5. Search text ricalcolato durante il filtro

Gravita': media
Rischio intervento: basso-medio

Evidenza:

Quando `search` e' valorizzato, per ogni animale viene chiamato:

```jsx
getAnimalSearchText(a)
```

Questa funzione appiattisce campi potenzialmente annidati e ricostruisce stringhe.

Intervento consigliato:

- precomputare un campo `_searchText` quando si normalizzano gli animali;
- in alternativa creare una cache per id/versione dati;
- fare questo solo dopo il fix sulle opzioni filtro, per evitare di allargare troppo il primo intervento.

### 6. Direct `window.innerWidth` durante render

Gravita': bassa-media
Rischio intervento: medio

Evidenza:

`Grid` e `AnimalCard` leggono `window.innerWidth` direttamente durante il render per decidere dimensioni e layout.

Rischi:

- non e' il collo di bottiglia principale;
- puo' rendere meno prevedibili i render;
- la card ricalcola breakpoint per ogni istanza.

Intervento consigliato:

- non toccarlo nel primo fix;
- in seguito passare un flag responsive calcolato una volta dalla `Grid` o usare CSS/container queries dove possibile.

## Primo micro-intervento consigliato

Applicare un fix minimo e a basso rischio dentro `Grid`:

1. Stabilizzare `handleCardClick` con `useCallback`.
2. Memoizzare le opzioni filtro statiche o derivate da `ANIMALS`.
3. Lasciare invariata la UI.
4. Non toccare ancora virtualizzazione, immagini o struttura file.

Motivo:

Questo riduce lavoro ripetuto a ogni apertura menu/search/filtro e migliora l'efficacia di `React.memo`, senza cambiare grafica, dati, routing o comportamento.

## Step successivo dopo il primo fix

Dopo il fix minimo:

- rilanciare `npm run build`;
- usare React Profiler sulla griglia;
- misurare:
  - apertura grid;
  - cambio status filter;
  - ricerca testuale;
  - apertura/chiusura menu filtri;
  - scroll con lista lunga.

Se il costo resta alto, passare al secondo intervento: evitare la copia di tutti gli animali in `list` e/o introdurre rendering progressivo.
