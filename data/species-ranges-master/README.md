# Species Ranges Master

Archivio locale dei range specie-specifici gia alleggeriti, pensato per sviluppi futuri.

- `marinefish.sqlite`: master semplificato ricavato da `/Users/andreagalliazzo/Downloads/MARINEFISH`.
- `range_aliases.json`: alias tassonomici curati per collegare nomi Animaldex a range sorgente con nome diverso.
- Il deploy dell'app usa solo `public/data/species-ranges/index.json` e i relativi `.geojson.gz`.
- Le specie non presenti in Animaldex restano qui, fuori da `public`, cosi non vengono servite come asset statici.

Parametri usati per `marinefish.sqlite`:

- input: shapefile `MARINEFISH_PART1..9`
- CRS: WGS84
- tolleranza semplificazione: `0.05` gradi
- precisione coordinate: `5` decimali
- output per specie: GeoJSON compresso in SQLite come `geojson_gz`

Comandi principali:

```bash
python3 scripts/import_marinefish_ranges.py inspect-db
python3 scripts/import_marinefish_ranges.py export-dex --dry-run
python3 scripts/import_marinefish_ranges.py export-dex
python3 scripts/apply_species_range_aliases.py --dry-run
python3 scripts/apply_species_range_aliases.py
```

Nota: gli alias non sono inferiti automaticamente da "stesso genere" o "nome simile". Ogni voce in `range_aliases.json` deve dichiarare sorgente, base tassonomica e confidenza. I candidati esclusi restano documentati nel file per evitare associazioni biologicamente scorrette.
