# Riscrittura `bio` e `cat_curiosities` — Fonti ufficiali e tono di voce Apex

Documento di riferimento (definito *ex ante*) per la riscrittura scientificamente accurata dei campi
`bio` e `cat_curiosities` di tutti i 1080 animali di `src/animals-data.js`.

## Obiettivo

Sostituire i testi boilerplate (30 `bio` unici e 376 template di curiosità riusati) con contenuti
**specifici della singola specie**, **verificabili** e **rielaborati** (mai copiati alla lettera) nel
tono dell'app.

## Fonti ufficiali ammesse (in ordine di priorità)

1. **IUCN Red List** — https://www.iucnredlist.org (+ cache locale in `iucn_all_animals_flat/cache/assessment/`).
   Usata per: habitat, distribuzione, tendenza di popolazione, minacce, ecologia, note tassonomiche.
   È la fonte con maggiore autorevolezza per conservazione ed ecologia.
2. **Animal Diversity Web (ADW)** — https://animaldiversity.org (University of Michigan Museum of Zoology).
   Usata per: biologia, comportamento, riproduzione, dieta, ciclo vitale, morfologia.
3. **GBIF** — https://www.gbif.org — tassonomia e distribuzione.
4. **AnAge / HAGRID** — https://genomics.senescence.info/species/ — longevità e storia di vita.
5. **Fonti scientifiche primarie** citate da queste (paper peer-reviewed) quando un dato "record" lo richiede.
6. **Wikipedia** (solo come supporto e per reperire il riferimento primario, mai come fonte unica di un dato).

Regola d'oro: **niente citazioni testuali**. Si estraggono i *fatti* dalle fonti e si riscrivono
adattandoli a spazio, fruibilità e tono di Apex. Nessun dato numerico "record" senza riscontro in fonte.

## Tono di voce Apex

- Italiano, **tempo presente**, terza persona.
- Vivido ma **fattuale**: nessuna esagerazione, nessun punto esclamativo (l'app li rimuove via `stripExcitementPunctuation`).
- Concreto e specie-specifico: ogni frase deve dire qualcosa che vale **solo per quella specie** (o quel tratto).
- Coerente con lo stile dei `desc` esistenti (descrittivo, evocativo, accurato).

## Vincoli di formato

| Campo | Cosa deve contenere | Lunghezza target |
|-------|---------------------|------------------|
| `bio` | Biologia della specie: dieta, comportamento, riproduzione, ciclo vitale, adattamenti chiave | **150–210 caratteri** (max osservato nel dataset: 221) |
| `cat_curiosities[CAT]` | **Perché** la specie possiede quel tratto/categoria, con un fatto reale e specifico | **150–210 caratteri** (max osservato: 214) |

- Le **chiavi** di `cat_curiosities` devono restare identiche alle `categories` dell'animale (non aggiungere/rimuovere chiavi).
- Niente virgolette doppie non necessarie nel testo (per non complicare l'escaping JSON).

## Mappa categorie → cosa spiegare nella curiosità

Le curiosità di categoria devono agganciare un fatto reale della specie al significato della categoria:

- `OFF_*` (Offesa): arma/strategia predatoria concreta (morso, veleno, colpo, zanne).
- `DEF_*` (Difesa): meccanismo difensivo reale (corazza, spine, mimetismo, pelle).
- `SENS_*` (Sensi): senso dominante e sua prestazione misurabile.
- `COG_*` (Cognizione): comportamento cognitivo/sociale documentato.
- `PHYS_*` (Prestazioni): dato fisico (peso, velocità, record) verificato.
- `BEH_*` (Comportamento): migrazione, legame di coppia, cure parentali reali.
- `ECO_*` (Ecologia): ruolo ecologico / dispersione / ingegneria ambientale.
- `EVO_*` (Evoluzione): endemismo, dimorfismo, domesticazione, fossile vivente, nanismo/gigantismo insulare.
- `SURV_EXTREME_RESILIENCE`, `LIFESPAN_LONGEVITY`, `HAB_DEEP_ABYSS`: adattamento estremo/longevità/habitat con dato reale.

## Processo operativo (a blocchi)

1. Per ogni specie si raccolgono i fatti dalle fonti sopra (con priorità IUCN + ADW).
2. Si redigono `bio` + una curiosità per **ciascuna** categoria dell'animale, nel tono/lunghezza sopra.
3. Il contenuto entra in un file di patch JSON (`reports/content_patches/batch_XXX.json`, formato `{ "<id>": { "bio": "...", "cat_curiosities": { "CAT": "..." } } }`).
4. `scripts/apply_content_patch.js` applica la patch in modo **chirurgico** (tocca solo `bio` e `cat_curiosities`,
   lascia il resto del file byte-per-byte invariato) e **verifica** che nessun altro campo sia cambiato.
5. Si aggiornano entrambe le copie in uso se necessario.

## Nota sui campi correlati

- `desc` ed `ety` restano invariati in questo lavoro (sono già specie-specifici; verifica di contenuto separata).
- `docu_curiosities` (curiosità "documentario") è un campo distinto mostrato accanto a `bio`: non toccato qui.
