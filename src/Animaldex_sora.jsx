import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { supabase, loadUserAnimals, upsertAnimalStatus, checkAndAwardBadges } from './supabaseClient';
export const ANIMALS = [
  {"id": 1, "no": "001", "sci": "Anax imperator", "com": "Anax imperator", "cls": "Insecta", "ord": "Odonata", "fam": "Aeshnidae", "gen": "Anax", "phy": "Arthropoda", "kin": "Animalia", "cons": "DD", "rarity": "Non comune", "wt": "0.5-1.2 g", "ln": "7-8 cm", "lifespan": 1, "status": "non visto", "trophic": 3, "desc": "Libellula gigante dai colori vivaci: il maschio sfoggia un addome azzurro intenso con dorso verde smeraldo. Vola su laghi, stagni e acque lente dell'Europa e dell'Africa settentrionale.", "bio": "Caccia in volo con un tasso di successo del 95%, uno dei più alti nel regno animale, afferrando le prede direttamente con le zampe anteriori in picchiata fulminea.", "ety": "Dal greco 'anax' (re, signore) e latino 'imperator' (comandante): il re imperatore dei cieli acquatici.", "stats": {"velocita": 54, "resistenza": 65, "forza": 10, "intelligenza": 45, "morso": 0, "agilita": 92, "rarita": 50}, "hab": ["Laghi e stagni", "Zone umide", "Canali d'acqua dolce", "Praterie costiere"], "gbif_id": 5051775, "inat_id": 94043, "categories": ["OFF_PERFECT_STRIKE", "SENS_EXTREME_SENSORY", "PHYS_EXTREME_SPEED"], "cat_curiosities": {"OFF_PERFECT_STRIKE": "Anax imperator è un cecchino alato con tasso di successo nella caccia superiore al 95%! Calcola traiettorie intercettando la preda in volo con precisione millimetrica.", "SENS_EXTREME_SENSORY": "I suoi occhi composti coprono quasi 360° e percepiscono la luce polarizzata e UV. Può individuare una preda in movimento a oltre 10 metri di distanza con risoluzione straordinaria.", "PHYS_EXTREME_SPEED": "L'imperatore del cielo raggiunge i 54 km/h e può volare in tutte le direzioni, incluso all'indietro, con manovrabilità aerea senza pari nel mondo degli insetti."}, "is_endemic": false, "endemic_iso": [], "big5_info": [], "spotlightHours": ["mattino", "pomeriggio"], "image_url": "./animals/anax-imperator.png", "distribution": {"countries_present": ["AT", "CH", "DE", "ES", "FR", "GB", "IT", "NL", "SE", "ZA"], "wild_observations": 10171, "captive_removed": 29, "total_observations": 10200}},
  {"id": 2, "no": "002", "sci": "Archilochus colubris", "com": "Archilochus colubris", "cls": "Aves", "ord": "Apodiformes", "fam": "Trochilidae", "gen": "Archilochus", "phy": "Chordata", "kin": "Animalia", "cons": "DD", "rarity": "Non comune", "wt": "2.4-3.6 g", "ln": "7-9 cm", "lifespan": 5, "status": "non visto", "trophic": 3, "desc": "Il colibrì golarubina è un gioiello volante: il maschio sfoggia una gola iridescente rosso rubino. Frequenta giardini fioriti, boschi decidui e margini forestali del Nord America.", "bio": "Per migrare dal Canada al Messico attraversa il Golfo del Messico in volo continuo di 800 km senza sosta, battendo le ali fino a 53 volte al secondo!", "ety": "Archilochus dal greco 'primo tra i soldati'; colubris dal latino per 'colibrì', termine usato dai colonizzatori spagnoli.", "stats": {"velocita": 50, "resistenza": 80, "forza": 2, "intelligenza": 65, "morso": 0, "agilita": 98, "rarita": 40}, "hab": ["Boschi decidui", "Giardini fioriti", "Margini forestali", "Praterie con fiori"], "gbif_id": 5228514, "inat_id": 6432, "categories": ["PHYS_FEATHERWEIGHTS", "BEH_LONG_MIGRATION", "SENS_EXTREME_SENSORY", "EVO_EXTREME_DIMORPHISM"], "cat_curiosities": {"PHYS_FEATHERWEIGHTS": "Pesa appena 3 grammi ma batte le ali fino a 53 volte al secondo! È uno degli uccelli più leggeri al mondo, capace di volare persino a ritroso.", "BEH_LONG_MIGRATION": "Ogni anno percorre fino a 5.000 km dal Canada al Messico e ritorno. Un volo epico per un animale delle dimensioni di un pollice!", "SENS_EXTREME_SENSORY": "Vede nella gamma ultravioletta e percepisce colori invisibili all'uomo. Le piume iridescenti del maschio riflettono UV usati nei rituali di corteggiamento.", "EVO_EXTREME_DIMORPHISM": "Il maschio sfoggia una gorgia rosso-rubino metallizzata accecante, mentre la femmina è quasi anonima, verde e bianca. Un dimorfismo cromatico radicale!"}, "is_endemic": false, "endemic_iso": [], "big5_info": [], "spotlightHours": ["mattino", "pomeriggio"], "image_url": "./animals/archilochus-colubris.png", "distribution": {"countries_present": ["CA", "MX", "US"], "wild_observations": 10173, "captive_removed": 18, "total_observations": 10200}},
  {"id": 3, "no": "003", "sci": "Canis lupus", "com": "Canis lupus", "cls": "Mammalia", "ord": "Carnivora", "fam": "Canidae", "gen": "Canis", "phy": "Chordata", "kin": "Animalia", "cons": "DD", "rarity": "Raro", "wt": "20-80 kg", "ln": "1.0-1.6 m", "lifespan": 8, "status": "non visto", "trophic": 4, "desc": "Il lupo grigio è un canide robusto con pelliccia folta grigio-brunastra, zampe lunghe e mascelle possenti. Abita foreste, tundre, steppe e montagne dell'emisfero boreale.", "bio": "I lupi possono percorrere fino a 70 km in una sola notte durante la caccia, coordinandosi col branco con ululati udibili a 10 km di distanza.", "ety": "Dal latino 'canis' (cane) e 'lupus' (lupo), radice indoeuropea *wĺ̥kʷos, comune a molte lingue antiche.", "stats": {"velocita": 65, "resistenza": 88, "forza": 70, "intelligenza": 85, "morso": 400, "agilita": 72, "rarita": 50}, "hab": ["Foreste boreali", "Tundra artica", "Steppe e praterie", "Montagne"], "gbif_id": 5219173, "inat_id": 47144, "categories": ["OFF_TUSKS_PIERCERS", "SENS_EXTREME_SENSORY", "BEH_PAIR_BONDING", "COG_NETWORK_MINDS"], "cat_curiosities": {"OFF_TUSKS_PIERCERS": "I canini del lupo esercitano una pressione di oltre 150 kg/cm²: abbastanza da spezzare ossa di grandi ungulati in pochi morsi. Un'arma biologica affinatissima!", "SENS_EXTREME_SENSORY": "Il lupo possiede fino a 300 milioni di recettori olfattivi — 40 volte più dell'uomo — e può fiutare una preda a oltre 3 km di distanza anche sotto la neve.", "BEH_PAIR_BONDING": "Il lupo è uno dei rari mammiferi monogami: il maschio alfa e la femmina alfa formano un legame che dura spesso tutta la vita, cacciando e crescendo i cuccioli insieme.", "COG_NETWORK_MINDS": "Il branco comunica con ululati altamente strutturati, con variazioni tonali individuali riconoscibili: ogni lupo ha una 'voce' unica, usata per coordinare caccia e territorio."}, "is_endemic": false, "endemic_iso": [], "big5_info": [{"list_name": "Foreste Europee", "big5_iso": ["IT", "ES", "PL", "RO", "SE", "DE", "FR"]}], "spotlightHours": ["alba", "tramonto"], "image_url": "./animals/canis-lupus.png", "distribution": {"countries_present": ["AU", "BE", "BO", "BR", "CO", "DE", "ES", "IL", "IN", "IR", "IT", "KW", "MX", "NL", "NO", "PL", "RU", "TH", "TR", "TW", "UA", "US"], "wild_observations": 9768, "captive_removed": 109, "total_observations": 10200}},
  {"id": 4, "no": "004", "sci": "Phycodurus eques", "com": "Phycodurus eques", "cls": "Actinopterygii", "ord": "Syngnathiformes", "fam": "Syngnathidae", "gen": "Phycodurus", "phy": "Chordata", "kin": "Animalia", "cons": "DD", "rarity": "Raro", "wt": "10-50 g", "ln": "20-35 cm", "lifespan": 7, "status": "non visto", "trophic": 3, "desc": "Il drago foglia fogliato è un maestro del mimetismo: il suo corpo è ricoperto di appendici simili a foglie di alga che lo rendono indistinguibile dalle alghe marine. Vive tra le foreste di alghe kelp e le praterie di posidonia dell'Australia meridionale.", "bio": "È il maschio a portare le uova attaccate a una zona specializzata sotto la coda, nutrendole fino alla schiusa: una delle gravidanze maschili più spettacolari del regno animale!", "ety": "Dal greco 'phykos' (alga) e 'dura' (collo), più 'eques' (cavaliere in latino): cavaliere delle alghe.", "stats": {"velocita": 0.5, "resistenza": 30, "forza": 2, "intelligenza": 40, "morso": 0, "agilita": 20, "rarita": 85}, "hab": ["Foreste di kelp", "Praterie di posidonia", "Acque costiere temperate", "Fondali rocciosi"], "gbif_id": 2332986, "inat_id": 49105, "categories": ["DEF_ACTIVE_CAMOUFLAGE", "BEH_PARENTAL_CARE", "EVO_ENDEMIC_SPECIES"], "cat_curiosities": {"DEF_ACTIVE_CAMOUFLAGE": "Il drago fogliare è un maestro dell'inganno: le sue appendici dermiche simulano perfettamente foglie di alga, rendendolo invisibile tra le alghe di kelp australiane!", "BEH_PARENTAL_CARE": "Come tutti i Syngnathidae, è il MASCHIO a portare le uova in una tasca addominale specializzata fino alla schiusa: paternità totale e rovesciamento dei ruoli biologici!", "EVO_ENDEMIC_SPECIES": "Phycodurus eques vive esclusivamente nelle acque costiere temperate del sud e ovest dell'Australia, da Perth fino a Port Phillip Bay: un gioiello biologico irripetibile."}, "is_endemic": true, "endemic_iso": ["AU"], "big5_info": [], "spotlightHours": ["notte", "alba"], "image_url": "./animals/phycodurus-eques.png", "distribution": {"countries_present": ["AU"], "wild_observations": 1325, "captive_removed": 145, "total_observations": 2286}},
  {"id": 5, "no": "005", "sci": "Ptilocercus lowii", "com": "Ptilocercus lowii", "cls": "Mammalia", "ord": "Scandentia", "fam": "Ptilocercidae", "gen": "Ptilocercus", "phy": "Chordata", "kin": "Animalia", "cons": "DD", "rarity": "Leggendario", "wt": "19-50 g", "ln": "10-14 cm", "lifespan": 5, "status": "non visto", "trophic": 3, "desc": "Piccolo mammifero arboriceo del Borneo con coda piumata simile a una piuma di uccello. Vive nelle foreste pluviali tropicali del Sud-Est asiatico, trascorrendo la vita tra i rami bassi della giungla.", "bio": "È uno dei pochi mammiferi noti a consumare regolarmente nettare fermentato equivalente a diversi drink alcolici al giorno, senza mostrare segni di ebbrezza!", "ety": "Dal greco 'ptilon' (piuma) e 'kerkos' (coda); 'lowii' onora il naturalista Hugh Low.", "stats": {"velocita": 8, "resistenza": 30, "forza": 5, "intelligenza": 55, "morso": 10, "agilita": 70, "rarita": 65}, "hab": ["Foresta pluviale tropicale", "Sottobosco umido", "Borneo e Malesia", "Foresta primaria"], "gbif_id": 2436257, "inat_id": 46298, "categories": ["SENS_NOCTURNAL_SPECIALISTS", "PHYS_FEATHERWEIGHTS", "EVO_ENDEMIC_SPECIES"], "cat_curiosities": {"SENS_NOCTURNAL_SPECIALISTS": "Questo toporagno-pennacchio è un cacciatore notturno con grandi occhi adattati alla visione crepuscolare e sensi affinati per localizzare insetti nel buio della foresta.", "PHYS_FEATHERWEIGHTS": "Ptilocercus lowii pesa appena 45-50 grammi, rendendolo uno dei mammiferi placentati più leggeri dell'ordine Scandentia, con agilità sorprendente tra i rami."}, "is_endemic": true, "endemic_iso": [], "big5_info": [], "spotlightHours": ["mattino", "pomeriggio"], "image_url": "./animals/ptilocercus-lowii.png", "distribution": {"countries_present": [], "wild_observations": 14, "captive_removed": 59, "total_observations": 82}},
  {"id": 6, "no": "006", "sci": "Sula sula", "com": "Sula sula", "cls": "Aves", "ord": "Suliformes", "fam": "Sulidae", "gen": "Sula", "phy": "Chordata", "kin": "Animalia", "cons": "DD", "rarity": "Non comune", "wt": "0.9-1.1 kg", "ln": "66-77 cm", "lifespan": 20, "status": "non visto", "trophic": 3, "desc": "Il Sula dalle zampe rosse è un uccello marino dal piumaggio bianco o bruno con zampe scarlatte inconfondibili. Nidifica su isole tropicali e si avventura in mare aperto per cacciare pesce in picchiate fulminee.", "bio": "Può percorrere centinaia di chilometri in un solo giorno di caccia e tuffarsi in acqua a oltre 100 km/h con gli occhi aperti grazie a membrane trasparenti protettive!", "ety": "Sula deriva dallo svedese antico 'sula', nome dei sule. Il genere e la specie coincidono, raddoppiando il riferimento nordico.", "stats": {"velocita": 100, "resistenza": 80, "forza": 20, "intelligenza": 45, "morso": 0, "agilita": 85, "rarita": 50}, "hab": ["Oceano tropicale", "Isole coralline", "Acque costiere", "Foreste di atolli"], "gbif_id": 2480972, "inat_id": 3802, "categories": ["OFF_TUSKS_PIERCERS", "PHYS_EXTREME_SPEED", "BEH_PAIR_BONDING"], "cat_curiosities": {"OFF_TUSKS_PIERCERS": "Il becco aguzzo e robusto del booby dai piedi rossi è un'arma da pesca letale: si tuffa in picchiata e trafigge i pesci con precisione chirurgica a oltre 90 km/h!", "PHYS_EXTREME_SPEED": "Sula sula è un tuffatore spettacolare: si lancia dall'alto come un dardo, raggiungendo velocità impressionanti nell'impatto con l'acqua grazie a sacchi aerei ammortizzatori nel cranio.", "BEH_PAIR_BONDING": "I booby dai piedi rossi formano coppie fedeli e stabili stagione dopo stagione, rinforzando il legame con elaborate danze di corteggiamento e cure condivise del nidiaceo."}, "is_endemic": false, "endemic_iso": [], "big5_info": [], "spotlightHours": ["mattino", "pomeriggio"], "image_url": "./animals/sula-sula.png", "distribution": {"countries_present": ["AU", "BR", "CR", "EC", "ID", "MX", "PA", "PG", "SC", "US"], "wild_observations": 10165, "captive_removed": 3, "total_observations": 10200}},
  {"id": 7, "no": "007", "sci": "Lanius meridionalis", "com": "Lanius meridionalis", "cls": "Aves", "ord": "Passeriformes", "fam": "Laniidae", "gen": "Lanius", "phy": "Chordata", "kin": "Animalia", "cons": "DD", "rarity": "Non comune", "wt": "48-76 g", "ln": "24-26 cm", "lifespan": 7, "status": "non visto", "trophic": 3, "desc": "L'averla meridionale è un passeriforme robusto con dorso grigio, ali nere e ventre rosato. Abita zone aride e steppose del Mediterraneo, prediligendo cespugli spinosi e terreni aperti.", "bio": "Come un piccolo macellaio, infilza prede su spine o filo spinato creando vere dispense di cibo per i giorni di scarsità alimentare.", "ety": "Dal latino 'lanius' (macellaio) e 'meridionalis' (meridionale), per le abitudini carnivore e la distribuzione nel sud.", "stats": {"velocita": 45, "resistenza": 55, "forza": 20, "intelligenza": 70, "morso": 15, "agilita": 65, "rarita": 60}, "hab": ["Steppe mediterranee", "Garighe e macchie", "Zone aride aperte", "Oliveti e coltivi"], "gbif_id": 7341500, "inat_id": 906982, "categories": ["OFF_BIO_BLADES", "BEH_PAIR_BONDING", "EVO_ENDEMIC_SPECIES"], "cat_curiosities": {"OFF_BIO_BLADES": "L'averla meridionale usa il becco uncinato come una lama: infilza prede su spine o filo spinato creando vere 'dispense' macabre per consumarle con calma!", "BEH_PAIR_BONDING": "Le coppie di averla meridionale mantengono legami fedeli tra stagioni riproduttive, difendendo insieme il territorio con rituali di corteggiamento elaborati e duetti vocali."}, "is_endemic": true, "endemic_iso": ["ES", "PT"], "big5_info": [], "spotlightHours": ["mattino", "pomeriggio"], "image_url": "./animals/lanius-meridionalis.png", "distribution": {"countries_present": ["ES", "PT"], "wild_observations": 10200, "captive_removed": 0, "total_observations": 10200}},
  {"id": 8, "no": "008", "sci": "Oecophylla smaragdina", "com": "Oecophylla smaragdina", "cls": "Insecta", "ord": "Hymenoptera", "fam": "Formicidae", "gen": "Oecophylla", "phy": "Arthropoda", "kin": "Animalia", "cons": "DD", "rarity": "Non comune", "wt": "0.5-5 mg", "ln": "0.5-2.5 cm", "lifespan": 8, "status": "non visto", "trophic": 3, "desc": "Formica tessitrice arboricola dal caratteristico addome arancione e dimensioni variabili (5-10 mm). Costruisce nidi tra le foglie degli alberi tropicali di Asia e Australia, cucendole con la seta prodotta dalle proprie larve.", "bio": "Una colonia può raggiungere mezzo milione di individui distribuiti in 151 nidi su 12 alberi diversi, coordinati senza un centro di controllo centralizzato!", "ety": "Dal greco 'oikos' (casa) e 'phyllon' (foglia): casa di foglie. 'Smaragdina' dal latino: color smeraldo, per la regina verdastra.", "stats": {"velocita": 3, "resistenza": 85, "forza": 90, "intelligenza": 80, "morso": 15, "agilita": 88, "rarita": 50}, "hab": ["Foresta tropicale", "Canopea arborea", "Piantagioni tropicali", "Foresta monsonica"], "gbif_id": 1317388, "inat_id": 117293, "categories": ["ECO_ENGINEERS", "ECO_INVISIBLE_HOSTS", "COG_NETWORK_MINDS"], "cat_curiosities": {"ECO_ENGINEERS": "Costruiscono nidi cucendo foglie vive con la seta delle proprie larve, trasformando interi alberi tropicali in architetture coloniali da mezzo milione di individui!", "ECO_INVISIBLE_HOSTS": "Intrattengono relazioni simbiotiche con afidi, cocciniglie e perfino larve di farfalle blu, proteggendoli in cambio di melata: veri 'allevatori' del sottobosco arboreo.", "COG_NETWORK_MINDS": "Coordinano attacchi, costruzione notturna e sorveglianza del territorio attraverso segnali chimici e tattili sofisticati, sincronizzando mezzo milione di individui come un unico organismo."}, "is_endemic": false, "endemic_iso": [], "big5_info": [], "spotlightHours": ["mattino", "pomeriggio"], "image_url": "./animals/oecophylla-smaragdina.png", "distribution": {"countries_present": ["AU", "CN", "ID", "IN", "KH", "LK", "MY", "PH", "SG", "TH", "VN"], "wild_observations": 10172, "captive_removed": 12, "total_observations": 10200}},
  {"id": 9, "no": "009", "sci": "Turdus migratorius", "com": "Turdus migratorius", "cls": "Aves", "ord": "Passeriformes", "fam": "Turdidae", "gen": "Turdus", "phy": "Chordata", "kin": "Animalia", "cons": "DD", "rarity": "Non comune", "wt": "77-85 g", "ln": "23-28 cm", "lifespan": 6, "status": "non visto", "trophic": 3, "desc": "Il tordo migratore americano ha il ventre arancione brillante e il dorso grigio-nerastro. Comune in giardini, parchi e boschi aperti del Nord America, è uno dei simboli della primavera.", "bio": "Capace di ascoltare i lombrichi sottoterra grazie a un udito straordinario, inclina la testa di lato per localizzarli con precisione millimetrica prima di estrarli.", "ety": "Turdus dal latino 'tordo', migratorius dal latino 'migratorius', cioè 'migratore', per le sue lunghe migrazioni stagionali.", "stats": {"velocita": 40, "resistenza": 65, "forza": 10, "intelligenza": 60, "morso": 0, "agilita": 55, "rarita": 50}, "hab": ["Boschi temperati", "Giardini urbani", "Parchi cittadini", "Praterie alberate"], "gbif_id": 9510564, "inat_id": 12727, "categories": ["BEH_LONG_MIGRATION", "BEH_PARENTAL_CARE"], "cat_curiosities": {"BEH_LONG_MIGRATION": "Il pettirosso americano migra ogni anno dal Canada al Messico e ritorno, percorrendo migliaia di km guidato da una bussola magnetica interna davvero sorprendente!", "BEH_PARENTAL_CARE": "La femmina costruisce da sola un solido nido con fango e fibre, cova le uova per 14 giorni e poi entrambi i genitori nutrono i piccoli instancabilmente per settimane."}, "is_endemic": false, "endemic_iso": [], "big5_info": [], "spotlightHours": ["mattino", "pomeriggio"], "image_url": "./animals/turdus-migratorius.png", "distribution": {"countries_present": ["CA", "MX", "US"], "wild_observations": 10182, "captive_removed": 5, "total_observations": 10200}},
  {"id": 10, "no": "010", "sci": "Sciurus carolinensis", "com": "Sciurus carolinensis", "cls": "Mammalia", "ord": "Rodentia", "fam": "Sciuridae", "gen": "Sciurus", "phy": "Chordata", "kin": "Animalia", "cons": "DD", "rarity": "Non comune", "wt": "400-600 g", "ln": "23-30 cm", "lifespan": 6, "status": "non visto", "trophic": 2, "desc": "Lo scoiattolo grigio americano ha pelliccia grigio-argentata con ventre bianco e una folta coda piumosa. Vive in boschi di latifoglie, parchi urbani e giardini, dove è diventato invasivo in Europa.", "bio": "Nasconde migliaia di ghiande ogni autunno in punti diversi e le ritrova mesi dopo grazie a una memoria spaziale straordinaria, ma dimentica il 25% dei nascondigli, contribuendo involontariamente alla diffusione degli alberi.", "ety": "Dal latino 'Sciurus' (scoiattolo) e 'carolinensis' (della Carolina), regione nordamericana da cui fu descritto per la prima volta.", "stats": {"velocita": 25, "resistenza": 45, "forza": 12, "intelligenza": 72, "morso": 0, "agilita": 85, "rarita": 50}, "hab": ["Boschi di latifoglie", "Parchi urbani", "Giardini suburbani", "Foreste miste"], "gbif_id": 5219681, "inat_id": 46017, "categories": ["COG_HIGH_INTELLIGENCE", "ECO_GLOBAL_DISPERSERS"], "cat_curiosities": {"COG_HIGH_INTELLIGENCE": "Lo scoiattolo grigio ricorda migliaia di nascondigli di cibo e usa tattiche ingannevoli fingendo di seppellire ghiande per disorientare i rivali!", "ECO_GLOBAL_DISPERSERS": "Originario del Nord America, ha colonizzato con successo Gran Bretagna, Irlanda e Italia, adattandosi a parchi urbani e foreste con sorprendente facilità."}, "is_endemic": false, "endemic_iso": [], "big5_info": [], "spotlightHours": ["mattino", "pomeriggio"], "image_url": "./animals/sciurus-carolinensis.png", "distribution": {"countries_present": ["CA", "GB", "US"], "wild_observations": 10181, "captive_removed": 11, "total_observations": 10200}},
  {"id": 11, "no": "011", "sci": "Procyon lotor", "com": "Procyon lotor", "cls": "Mammalia", "ord": "Carnivora", "fam": "Procyonidae", "gen": "Procyon", "phy": "Chordata", "kin": "Animalia", "cons": "DD", "rarity": "Non comune", "wt": "3.5-9 kg", "ln": "41-71 cm", "lifespan": 5, "status": "non visto", "trophic": 3, "desc": "Il procione è un mammifero dal caratteristico mantello grigio-brunastro e dalla celebre mascherina nera attorno agli occhi. Vive in foreste, zone umide e ambienti urbani del Nord America.", "bio": "Immerge ripetutamente il cibo nell'acqua prima di mangiarlo: un comportamento ancora misterioso che alcuni scienziati collegano all'affinamento della sensibilità tattile delle zampe anteriori.", "ety": "Dal greco 'pro' (prima) e 'kyon' (cane): 'prima del cane', riferito alla sua somiglianza con i canidi.", "stats": {"velocita": 24, "resistenza": 55, "forza": 30, "intelligenza": 82, "morso": 100, "agilita": 65, "rarita": 10}, "hab": ["Foreste temperate", "Zone umide", "Aree urbane", "Praterie fluviali"], "gbif_id": 5218786, "inat_id": 41663, "categories": ["COG_HIGH_INTELLIGENCE", "ECO_GLOBAL_DISPERSERS", "SENS_NOCTURNAL_SPECIALISTS"], "cat_curiosities": {"COG_HIGH_INTELLIGENCE": "Il procione risolve lucchetti e meccanismi complessi in pochi tentativi: studi mostrano che ricorda le soluzioni anche 3 anni dopo averle apprese!", "ECO_GLOBAL_DISPERSERS": "Originario del Nord America, il procione ha colonizzato Europa, Giappone e Asia centrale grazie a una adattabilità alimentare e comportamentale straordinaria.", "SENS_NOCTURNAL_SPECIALISTS": "Le zampe anteriori del procione hanno una densità di recettori tattili elevatissima: al buio 'vedono' con le mani, identificando oggetti sott'acqua con precisione chirurgica."}, "is_endemic": false, "endemic_iso": [], "big5_info": [], "spotlightHours": ["mattino", "pomeriggio"], "image_url": "./animals/procyon-lotor.png", "distribution": {"countries_present": ["BE", "CA", "CR", "DE", "MX", "US"], "wild_observations": 10155, "captive_removed": 6, "total_observations": 10200}},
  {"id": 12, "no": "012", "sci": "Cyanocitta cristata", "com": "Cyanocitta cristata", "cls": "Aves", "ord": "Passeriformes", "fam": "Corvidae", "gen": "Cyanocitta", "phy": "Chordata", "kin": "Animalia", "cons": "DD", "rarity": "Non comune", "wt": "70-100 g", "ln": "22-30 cm", "lifespan": 7, "status": "non visto", "trophic": 3, "desc": "La ghiandaia blu sfoggia un piumaggio azzurro brillante con cresta distintiva e collare nero. Vive nei boschi di querce e foreste miste del Nord America, frequentando anche parchi e giardini urbani.", "bio": "È capace di imitare il verso dei rapaci per spaventare altri uccelli e accaparrarsi il cibo. Nasconde migliaia di ghiande ogni autunno, ricordando con precisione la posizione di centinaia di nascondigli.", "ety": "Dal greco 'kyanos' (azzurro) e 'kitta' (ghiandaia); 'cristata' dal latino per 'con cresta'.", "stats": {"velocita": 40, "resistenza": 55, "forza": 12, "intelligenza": 82, "morso": 0, "agilita": 70, "rarita": 50}, "hab": ["Foreste di querce", "Boschi misti", "Parchi urbani", "Margini boschivi"], "gbif_id": 2482593, "inat_id": 8229, "categories": ["COG_HIGH_INTELLIGENCE", "COG_NETWORK_MINDS", "EVO_ENDEMIC_SPECIES"], "cat_curiosities": {"COG_HIGH_INTELLIGENCE": "La ghiandaia azzurra usa strumenti, risolve puzzle e — cosa rara — pianifica il futuro nascondendo cibo in centinaia di cache diverse ricordandole tutte!", "COG_NETWORK_MINDS": "Capace di imitare i richiami di rapaci come il Falco per ingannare altri uccelli e rubare cibo: un uso sofisticato del 'linguaggio' per manipolare chi la circonda."}, "is_endemic": true, "endemic_iso": ["CA", "US"], "big5_info": [], "spotlightHours": ["mattino", "pomeriggio"], "image_url": "./animals/cyanocitta-cristata.png", "distribution": {"countries_present": ["CA", "US"], "wild_observations": 10161, "captive_removed": 9, "total_observations": 10200}},
  {"id": 13, "no": "013", "sci": "Canis latrans", "com": "Canis latrans", "cls": "Mammalia", "ord": "Carnivora", "fam": "Canidae", "gen": "Canis", "phy": "Chordata", "kin": "Animalia", "cons": "DD", "rarity": "Non comune", "wt": "7-21 kg", "ln": "75-100 cm", "lifespan": 10, "status": "non visto", "trophic": 3, "desc": "Il coyote è un canide nordamericano dall'aspetto simile a un lupo ma più snello, con muso appuntito e orecchie erette. Abita praterie, deserti, foreste e persino aree urbane, adattandosi con straordinaria versatilità.", "bio": "Il coyote è capace di modificare la dimensione del suo branco in risposta alla pressione venatoria: più viene cacciato, più si riproduce abbondantemente, compensando le perdite con nascite numerose.", "ety": "Dal nahuatl 'coyotl'; 'latrans' dal latino significa 'che abbaia', per il suo caratteristico ululato notturno.", "stats": {"velocita": 64, "resistenza": 78, "forza": 38, "intelligenza": 82, "morso": 88, "agilita": 75, "rarita": 50}, "hab": ["Praterie aperte", "Deserti e semideserti", "Foreste temperate", "Aree urbane e suburbane"], "gbif_id": 5219153, "inat_id": 42051, "categories": ["ECO_GLOBAL_DISPERSERS", "COG_HIGH_INTELLIGENCE", "SENS_EXTREME_SENSORY", "SURV_EXTREME_RESILIENCE"], "cat_curiosities": {"ECO_GLOBAL_DISPERSERS": "Il coyote ha colonizzato ogni angolo del Nord America, dalle tundre dell'Alaska alle metropoli come Los Angeles e New York! È il canide più adattabile del continente.", "COG_HIGH_INTELLIGENCE": "Il coyote risolve problemi complessi, impara rapidamente dagli errori e ha persino sviluppato tattiche di caccia cooperativa con i tassi americani: un'alleanza spontanea tra specie diverse!", "SENS_EXTREME_SENSORY": "Il suo olfatto può rilevare prede sotto la neve o a distanze di oltre 1 km. Le orecchie mobili captano ultrasuoni dei roditori nascosti, rendendolo un cacciatore sensorialmente straordinario.", "SURV_EXTREME_RESILIENCE": "Perseguitato, cacciato e avvelenato per secoli, il coyote ha risposto... espandendo il suo areale! Più viene perseguitato, più prolifera: nessuna altra specie selvatica ha resistito così bene alla pressione umana."}, "is_endemic": false, "endemic_iso": [], "big5_info": [], "spotlightHours": ["alba", "tramonto"], "image_url": "./animals/canis-latrans.png", "distribution": {"countries_present": ["CA", "MX", "US"], "wild_observations": 10148, "captive_removed": 14, "total_observations": 10200}},
  {"id": 14, "no": "014", "sci": "Cathartes aura", "com": "Cathartes aura", "cls": "Aves", "ord": "Accipitriformes", "fam": "Cathartidae", "gen": "Cathartes", "phy": "Chordata", "kin": "Animalia", "cons": "DD", "rarity": "Non comune", "wt": "0.85-2.26 kg", "ln": "64-81 cm", "lifespan": 16, "status": "non visto", "trophic": "D", "desc": "L'avvoltoio dalla testa rossa ha testa rossa priva di piume, piumaggio nero-brunastro e apertura alare fino a 180 cm. Abita foreste aperte, praterie e zone rurali dalle Americhe.", "bio": "Trova le carcasse annusando i gas di decomposizione: unico tra i grandi uccelli, usa l'olfatto come senso primario di caccia, rilevando odori a km di distanza.", "ety": "Dal greco 'kathartes' (purificatore) e latino 'aura' (brezza), il purificatore che vola leggero nel vento.", "stats": {"velocita": 60, "resistenza": 75, "forza": 20, "intelligenza": 55, "morso": 0, "agilita": 65, "rarita": 50}, "hab": ["Foreste aperte", "Praterie tropicali", "Zone rurali", "Savane arbustive"], "gbif_id": 2481930, "inat_id": 4756, "categories": ["SENS_EXTREME_SENSORY", "ECO_GLOBAL_DISPERSERS", "SURV_EXTREME_RESILIENCE"], "cat_curiosities": {"SENS_EXTREME_SENSORY": "L'unico uccello rapace a cacciare principalmente con l'olfatto! Individua carcasse nascoste sotto la vegetazione grazie a un bulbo olfattivo enormemente sviluppato, rarissimo tra gli uccelli.", "ECO_GLOBAL_DISPERSERS": "Dal Canada alla Terra del Fuoco, il Capovaccaio americano colonizza ogni tipo di habitat del continente americano, adattandosi con straordinaria facilità a foreste, deserti e pianure urbane.", "SURV_EXTREME_RESILIENCE": "Il suo stomaco è una camera acida estrema: distrugge botulino, antrace e colera senza conseguenze. Il vomito ustionante serve anche come difesa. Un sistema biologico quasi indistruttibile."}, "is_endemic": false, "endemic_iso": [], "big5_info": [], "spotlightHours": ["mattino", "pomeriggio"], "image_url": "./animals/cathartes-aura.png", "distribution": {"countries_present": ["AR", "BR", "CA", "CL", "CR", "MX", "PA", "US"], "wild_observations": 10180, "captive_removed": 11, "total_observations": 10200}}
]; // Questo verrà sovrascritto dallo script


// ── Config ────────────────────────────────────────────────────
const CLS = {
  Mammalia:       { mid:'#7D5E18', img:'#A07830', badge:'#3A2808', accent:'#F0C84E', detailTop:'#5A3A0A', detailBg:'#3A2206', label:'Mammifero',         icon:'🦁' },
  Aves:           { mid:'#1A5080', img:'#2A72A8', badge:'#0A1E3A', accent:'#5BBEF8', detailTop:'#0E3458', detailBg:'#081E38', label:'Uccello',            icon:'🦅' },
  Reptilia:       { mid:'#4A7A20', img:'#62A030', badge:'#243E0A', accent:'#90D84A', detailTop:'#2E5A10', detailBg:'#1A3808', label:'Rettile',            icon:'🦎' },
  Amphibia:       { mid:'#186860', img:'#228A7A', badge:'#083430', accent:'#4ED8BE', detailTop:'#0E4840', detailBg:'#082E28', label:'Anfibio',            icon:'🐸' },
  Actinopterygii: { mid:'#1C3A80', img:'#2A52A8', badge:'#0C1840', accent:'#6088F8', detailTop:'#102258', detailBg:'#081438', label:'Pesce',              icon:'🐟' },
  Insecta:        { mid:'#885820', img:'#A87030', badge:'#442C10', accent:'#F0A840', detailTop:'#603A10', detailBg:'#3A2008', label:'Insetto',            icon:'🦋' },
  Arachnida:      { mid:'#782020', img:'#982828', badge:'#3A0C0C', accent:'#F06060', detailTop:'#541414', detailBg:'#340A0A', label:'Aracnide',           icon:'🕷️' },
  Malacostraca:   { mid:'#883020', img:'#A84028', badge:'#441810', accent:'#F07850', detailTop:'#602010', detailBg:'#3A1408', label:'Crostaceo',          icon:'🦀' },
  Anthozoa:       { mid:'#782060', img:'#982878', badge:'#3A0C30', accent:'#F060B8', detailTop:'#541848', detailBg:'#340A2C', label:'Corallo',            icon:'🪸' },
  Asteroidea:     { mid:'#886020', img:'#A87A28', badge:'#443010', accent:'#F0B840', detailTop:'#604010', detailBg:'#3A2808', label:'Stella Marina',      icon:'⭐' },
  Chondrichthyes: { mid:'#1A2E60', img:'#243E80', badge:'#0A1430', accent:'#4A78D8', detailTop:'#0E2050', detailBg:'#081430', label:'Pesce cartilagineo', icon:'🦈' },
  Cephalopoda:    { mid:'#5A2080', img:'#7428A8', badge:'#2A0C40', accent:'#B860F8', detailTop:'#3E1458', detailBg:'#280A38', label:'Cefalopode',         icon:'🐙' },
  Scyphozoa:      { mid:'#6A3070', img:'#884090', badge:'#341838', accent:'#E888F0', detailTop:'#4A2050', detailBg:'#2E1230', label:'Medusa',             icon:'🪼' },
  Hydrozoa:       { mid:'#1A5A6A', img:'#228890', badge:'#0A2E38', accent:'#5CD8E8', detailTop:'#0E4050', detailBg:'#082830', label:'Idrozoo',            icon:'🫧' },
};
const CONS = {
  EX:{ lbl:'EX', full:'Extinct',               c:'#FFFFFF', bg:'#1A1A1A' },
  EW:{ lbl:'EW', full:'Extinct in the Wild',   c:'#FFFFFF', bg:'#1A1A1A' },
  CR:{ lbl:'CR', full:'Critically Endangered', c:'#FFFFFF', bg:'#DC143C' },
  EN:{ lbl:'EN', full:'Endangered',            c:'#000000', bg:'#FF8C00' },
  VU:{ lbl:'VU', full:'Vulnerable',            c:'#000000', bg:'#FFD700' },
  NT:{ lbl:'NT', full:'Near Threatened',       c:'#FFFFFF', bg:'#20B2AA' },
  LC:{ lbl:'LC', full:'Least Concern',         c:'#FFFFFF', bg:'#008B8B' },
  DD:{ lbl:'DD', full:'Data Deficient',        c:'#FFFFFF', bg:'#808080' },
};
const RARITY = {
  'Comune':     { c:'#F5DEB3', bg:'#5C3310', s:1 },
  'Non comune': { c:'#E8E8E8', bg:'#5A5A5A', s:2 },
  'Raro':       { c:'#FFE566', bg:'#7A5800', s:3 },
  'Leggendario':{ c:'#EAC8FF', bg:'#3D0070', s:4 },
};
const TROPHIC = {
  1:{ label:'Produttore',      c:'#5CC85A', bg:'#1A3B19' },
  2:{ label:'Erbivoro',        c:'#A8D84A', bg:'#283B14' },
  3:{ label:'Predatore',       c:'#F5A828', bg:'#3B2205' },
  4:{ label:'Predatore Apice', c:'#F55454', bg:'#3B0B0B' },
  D:{ label:'Decomponente',    c:'#9E7CF5', bg:'#20153B' },
  F:{ label:'Filtratore',      c:'#5BB8F5', bg:'#0A1E3B' },
};
const SPOTLIGHT_ICONS = { alba:'🌅', mattino:'🌤️', pomeriggio:'☀️', tramonto:'🌇', notte:'🌙' };
const CATEGORY_META = {
  OFF_PERFECT_STRIKE:     { label:'Cacciatore Perfetto',  icon:'🎯', color:'#F55454' },
  OFF_TUSKS_PIERCERS:     { label:'Armi Naturali',        icon:'🦷', color:'#F55454' },
  OFF_BIO_BLADES:         { label:'Lame Bio',             icon:'⚔️', color:'#F55454' },
  OFF_VENOM_TOXINS:       { label:'Veleno & Tossine',     icon:'☠️', color:'#9E7CF5' },
  DEF_SHELL_ARMOR:        { label:'Armatura',             icon:'🛡️', color:'#5BB8F5' },
  DEF_SPURS_SPINES:       { label:'Spine Difensive',      icon:'🌵', color:'#5BB8F5' },
  DEF_TOUGH_SKIN:         { label:'Pelle Coriacea',       icon:'🪨', color:'#5BB8F5' },
  DEF_ACTIVE_CAMOUFLAGE:  { label:'Mimetismo',            icon:'👁️', color:'#90D84A' },
  PHYS_HEAVYWEIGHTS:      { label:'Colosso',              icon:'🏋️', color:'#F0C84E' },
  PHYS_FEATHERWEIGHTS:    { label:'Ultraleggero',         icon:'🪶', color:'#F0C84E' },
  PHYS_EXTREME_SPEED:     { label:'Velocità Estrema',     icon:'⚡', color:'#F0C84E' },
  PHYS_RECORD_BREAKERS:   { label:'Record Mondiale',      icon:'🏆', color:'#F0C84E' },
  EVO_LIVING_FOSSILS:     { label:'Fossile Vivente',      icon:'🦕', color:'#A8D84A' },
  EVO_DOMESTICATION:      { label:'Addomesticato',        icon:'🏠', color:'#A8D84A' },
  EVO_INSULAR_GIGANTISM:  { label:'Gigantismo Insulare',  icon:'🏝️', color:'#A8D84A' },
  EVO_INSULAR_DWARFISM:   { label:'Nanismo Insulare',     icon:'🔬', color:'#A8D84A' },
  EVO_ENDEMIC_SPECIES:    { label:'Endemico',             icon:'📍', color:'#A8D84A' },
  EVO_EXTREME_DIMORPHISM: { label:'Dimorfismo Estremo',   icon:'♀♂', color:'#A8D84A' },
  COG_HIGH_INTELLIGENCE:  { label:'Alta Intelligenza',    icon:'🧠', color:'#B860F8' },
  COG_NETWORK_MINDS:      { label:'Mente Collettiva',     icon:'🕸️', color:'#B860F8' },
  BEH_LONG_MIGRATION:     { label:'Grande Migrazione',    icon:'🗺️', color:'#5BBEF8' },
  BEH_PARENTAL_CARE:      { label:'Cura Parentale',       icon:'👶', color:'#5BBEF8' },
  BEH_PAIR_BONDING:       { label:'Coppia Fedele',        icon:'💑', color:'#F060B8' },
  SENS_NOCTURNAL_SPECIALISTS:{ label:'Notturno',          icon:'🦉', color:'#9E7CF5' },
  SENS_EXTREME_SENSORY:   { label:'Sensi Estremi',        icon:'👃', color:'#9E7CF5' },
  ECO_ENGINEERS:          { label:'Ingegnere Eco',        icon:'🌿', color:'#5CC85A' },
  ECO_GLOBAL_DISPERSERS:  { label:'Dispersore Globale',   icon:'🌍', color:'#5CC85A' },
  ECO_INVISIBLE_HOSTS:    { label:'Host Invisibile',      icon:'🦠', color:'#5CC85A' },
  HAB_DEEP_ABYSS:         { label:'Abissi Profondi',      icon:'🌊', color:'#4A78D8' },
  LIFESPAN_LONGEVITY:     { label:'Longevo',              icon:'⏳', color:'#F0B840' },
  SURV_EXTREME_RESILIENCE:{ label:'Resilienza Estrema',   icon:'💪', color:'#F07850' },
};
const STAT_MAXES = { velocita:200, morso:1500, forza:100, resistenza:100, intelligenza:100, agilita:100 };
const STATS_DEF = [
  {k:'velocita',l:'Velocità',u:'km/h'},{k:'morso',l:'Morso',u:'PSI'},{k:'forza',l:'Forza',u:'%'},
  {k:'resistenza',l:'Resistenza',u:'%'},{k:'intelligenza',l:'Intelligenza',u:'%'},{k:'agilita',l:'Agilità',u:'%'},
];
const SCALE = { Min:0.7, Base:1, Max:1.3 };

const ISO_TO_EN = {
  IT:'Italy',ES:'Spain',FR:'France',DE:'Germany',GB:'United Kingdom',PT:'Portugal',NL:'Netherlands',
  BE:'Belgium',CH:'Switzerland',AT:'Austria',SE:'Sweden',NO:'Norway',DK:'Denmark',FI:'Finland',
  PL:'Poland',CZ:'Czech Republic',SK:'Slovakia',HU:'Hungary',RO:'Romania',BG:'Bulgaria',HR:'Croatia',
  SI:'Slovenia',GR:'Greece',TR:'Turkey',UA:'Ukraine',RU:'Russia',US:'United States',CA:'Canada',
  MX:'Mexico',BR:'Brazil',AR:'Argentina',CL:'Chile',CO:'Colombia',PE:'Peru',EC:'Ecuador',BO:'Bolivia',
  CR:'Costa Rica',PA:'Panama',AU:'Australia',NZ:'New Zealand',JP:'Japan',CN:'China',IN:'India',
  ZA:'South Africa',KE:'Kenya',NG:'Nigeria',EG:'Egypt',MA:'Morocco',GH:'Ghana',TZ:'Tanzania',
  UG:'Uganda',ET:'Ethiopia',SN:'Senegal',CM:'Cameroon',ZM:'Zambia',ZW:'Zimbabwe',BW:'Botswana',
  NA:'Namibia',AO:'Angola',MZ:'Mozambique',MW:'Malawi',SG:'Singapore',MY:'Malaysia',TH:'Thailand',
  ID:'Indonesia',PH:'Philippines',VN:'Vietnam',KH:'Cambodia',LK:'Sri Lanka',KR:'South Korea',
  TW:'Taiwan',MN:'Mongolia',IR:'Iran',IQ:'Iraq',SA:'Saudi Arabia',AE:'United Arab Emirates',
  IL:'Israel',TN:'Tunisia',DZ:'Algeria',LY:'Libya',SD:'Sudan',MG:'Madagascar',SC:'Seychelles',
  LV:'Latvia',LT:'Lithuania',EE:'Estonia',BY:'Belarus',RS:'Serbia',BA:'Bosnia and Herzegovina',
  AL:'Albania',PG:'Papua New Guinea',TD:'Chad',CF:'Central African Republic',GA:'Gabon',
  CG:'Republic of the Congo',CD:'Democratic Republic of the Congo',KW:'Kuwait',LB:'Lebanon',
  PR:'Puerto Rico',SS:'South Sudan',SO:'Somalia',BI:'Burundi',RW:'Rwanda',
};

const COUNTRIES = [
  {code:'IT',name:'Italia'},{code:'ES',name:'Spagna'},{code:'FR',name:'Francia'},
  {code:'DE',name:'Germania'},{code:'GB',name:'Regno Unito'},{code:'PT',name:'Portogallo'},
  {code:'NL',name:'Paesi Bassi'},{code:'AT',name:'Austria'},{code:'SE',name:'Svezia'},
  {code:'NO',name:'Norvegia'},{code:'PL',name:'Polonia'},{code:'RO',name:'Romania'},
  {code:'GR',name:'Grecia'},{code:'TR',name:'Turchia'},{code:'UA',name:'Ucraina'},
  {code:'RU',name:'Russia'},{code:'US',name:'Stati Uniti'},{code:'CA',name:'Canada'},
  {code:'MX',name:'Messico'},{code:'BR',name:'Brasile'},{code:'AR',name:'Argentina'},
  {code:'AU',name:'Australia'},{code:'JP',name:'Giappone'},{code:'CN',name:'Cina'},
  {code:'IN',name:'India'},{code:'ZA',name:'Sud Africa'},{code:'KE',name:'Kenya'},
  {code:'NG',name:'Nigeria'},{code:'EG',name:'Egitto'},{code:'TZ',name:'Tanzania'},
  {code:'SG',name:'Singapore'},{code:'MY',name:'Malesia'},{code:'TH',name:'Tailandia'},
  {code:'ID',name:'Indonesia'},{code:'KR',name:'Corea del Sud'},
];

// ── CSS ───────────────────────────────────────────────────────
const RARITY_CSS = `
@keyframes bronzoShine{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes argentoShine{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes oroShine{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes acquaShine{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes slideUp{0%{transform:translateY(60px);opacity:0}100%{transform:translateY(0);opacity:1}}
.rarity-comune{background:linear-gradient(105deg,#3D1E08 0%,#7A4018 18%,#C47A35 30%,#F0B060 38%,#FFDCA0 45%,#F0B060 52%,#C47A35 60%,#7A4018 72%,#3D1E08 100%)!important;background-size:300% 100%!important;animation:bronzoShine 3.2s linear infinite!important;color:#FFE0AA!important;border:none!important;text-shadow:0 1px 3px rgba(0,0,0,0.7)!important}
.rarity-non-comune{background:linear-gradient(105deg,#3A3A3A 0%,#6E6E6E 15%,#B0B0B0 28%,#ECECEC 38%,#FFF 45%,#ECECEC 52%,#B0B0B0 62%,#6E6E6E 75%,#3A3A3A 100%)!important;background-size:300% 100%!important;animation:argentoShine 3.2s linear infinite!important;color:#FFF!important;border:none!important;text-shadow:0 1px 3px rgba(0,0,0,0.8)!important}
.rarity-raro{background:linear-gradient(105deg,#4A3000 0%,#8B5E00 15%,#D4A000 28%,#FFD700 38%,#FFF0A0 45%,#FFD700 52%,#D4A000 62%,#8B5E00 75%,#4A3000 100%)!important;background-size:300% 100%!important;animation:oroShine 3.2s linear infinite!important;color:#FFF8C0!important;border:none!important;box-shadow:0 0 10px rgba(255,200,0,.55),0 0 22px rgba(255,170,0,.28)!important;text-shadow:0 0 8px rgba(255,220,0,.6),0 1px 3px rgba(0,0,0,.7)!important}
.rarity-leggendario{background:linear-gradient(130deg,#1A0030 0%,#4B0082 12%,#7B20C8 24%,#A060E8 32%,#C8A0FF 40%,#E0C8FF 46%,#C8A0FF 52%,#A060E8 60%,#7B20C8 72%,#4B0082 84%,#1A0030 100%)!important;background-size:300% 300%!important;animation:acquaShine 4.5s ease-in-out infinite!important;color:#F0DAFF!important;border:none!important;box-shadow:0 0 12px rgba(160,80,255,.6),0 0 28px rgba(120,40,220,.3),inset 0 0 12px rgba(200,160,255,.15)!important;text-shadow:0 0 10px rgba(220,180,255,.7),0 1px 3px rgba(0,0,0,.8)!important}
.rarity-dot-comune{background:linear-gradient(135deg,#C47A35,#F0B060);box-shadow:0 0 6px rgba(196,122,53,.7)}
.rarity-dot-non-comune{background:linear-gradient(135deg,#888,#EEE);box-shadow:0 0 6px rgba(180,180,180,.7)}
.rarity-dot-raro{background:linear-gradient(135deg,#D4A000,#FFD700);box-shadow:0 0 8px rgba(255,200,0,.8)}
.rarity-dot-leggendario{background:linear-gradient(135deg,#7B20C8,#C8A0FF);box-shadow:0 0 10px rgba(160,80,255,.85)}
`;

// ── Helpers ───────────────────────────────────────────────────
const rarityClass    = r => 'rarity-'     + (r||'Comune').toLowerCase().replace(' ','-');
const rarityDotClass = r => 'rarity-dot-' + (r||'Comune').toLowerCase().replace(' ','-');
const getFlagEmoji   = code => { try { return String.fromCodePoint(...[...code.toUpperCase()].map(c=>127397+c.charCodeAt(0))); } catch { return '🌍'; } };

function buildTree(animals) {
  const LEVELS=['kin','phy','cls','ord','fam','gen'];
  const LABELS={kin:'Regno',phy:'Phylum',cls:'Classe',ord:'Ordine',fam:'Famiglia',gen:'Genere'};
  function insert(node,a,d){
    if(d>=LEVELS.length)return;
    const k=a[LEVELS[d]];
    if(!node[k])node[k]={_label:LABELS[LEVELS[d]],_key:LEVELS[d],_children:{},_count:0};
    node[k]._count++;insert(node[k]._children,a,d+1);
  }
  const root={};for(const a of animals)insert(root,a,0);return root;
}

// ── Auth Screen ───────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode,setMode]=useState('login');
  const [email,setEmail]=useState('');
  const [pwd,setPwd]=useState('');
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState('');

  async function submit() {
    setLoading(true); setErr('');
    try {
      if (mode==='login') {
        const {data,error}=await supabase.auth.signInWithPassword({email,password:pwd});
        if(error)throw error;
        onAuth(data.user);
      } else {
        const {data,error}=await supabase.auth.signUp({email,password:pwd});
        if(error)throw error;
        onAuth(data.user);
      }
    } catch(e){ setErr(e.message||'Errore'); }
    setLoading(false);
  }

  return (
    <div style={{height:'100vh',background:'#1C1C1E',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{fontSize:56,marginBottom:16}}>🦁</div>
      <h1 style={{color:'white',fontSize:28,fontWeight:900,margin:'0 0 4px'}}>Animaldex</h1>
      <p style={{color:'rgba(255,255,255,.4)',fontSize:14,margin:'0 0 32px'}}>Il tuo diario della fauna selvatica</p>
      <div style={{width:'100%',maxWidth:360,background:'#2A2A2C',borderRadius:20,padding:24}}>
        <div style={{display:'flex',marginBottom:20,background:'#1C1C1E',borderRadius:12,padding:3}}>
          {['login','signup'].map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'10px 0',borderRadius:9,background:mode===m?'#A84637':'transparent',color:'white',border:'none',fontWeight:700,fontSize:13,cursor:'pointer'}}>{m==='login'?'Accedi':'Registrati'}</button>
          ))}
        </div>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
          style={{width:'100%',height:46,borderRadius:12,background:'#1C1C1E',border:'1px solid #3A3A3C',color:'white',padding:'0 14px',fontSize:14,outline:'none',marginBottom:10,boxSizing:'border-box'}}/>
        <input type="password" placeholder="Password" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}
          style={{width:'100%',height:46,borderRadius:12,background:'#1C1C1E',border:'1px solid #3A3A3C',color:'white',padding:'0 14px',fontSize:14,outline:'none',marginBottom:16,boxSizing:'border-box'}}/>
        {err&&<p style={{color:'#FF6B6B',fontSize:12,margin:'0 0 12px',textAlign:'center'}}>{err}</p>}
        <button onClick={submit} disabled={loading} style={{width:'100%',height:48,borderRadius:12,background:'#A84637',color:'white',border:'none',fontWeight:800,fontSize:15,cursor:loading?'default':'pointer',opacity:loading?0.6:1}}>
          {loading?'...':mode==='login'?'Accedi':'Crea account'}
        </button>
      </div>
    </div>
  );
}

// ── Badge Toast ───────────────────────────────────────────────
function BadgeToast({ badges, onDismiss }) {
  useEffect(()=>{ if(!badges.length)return; const t=setTimeout(onDismiss,4000); return()=>clearTimeout(t); },[badges, onDismiss]);
  if(!badges.length)return null;
  return (
    <div style={{position:'fixed',bottom:100,left:'50%',transform:'translateX(-50%)',zIndex:200,display:'flex',flexDirection:'column',gap:8,pointerEvents:'none'}}>
      {badges.map(b=>(
        <div key={b.id} style={{background:'#E8C040',borderRadius:14,padding:'12px 20px',display:'flex',alignItems:'center',gap:10,animation:'slideUp .4s ease',boxShadow:'0 8px 24px rgba(0,0,0,.5)'}}>
          <span style={{fontSize:24}}>🏆</span>
          <div><div style={{color:'#1A1000',fontWeight:800,fontSize:13}}>Badge sbloccato!</div><div style={{color:'#3A2000',fontSize:12}}>{b.name}</div></div>
        </div>
      ))}
    </div>
  );
}

// ── StatRow ───────────────────────────────────────────────────
function StatRow({ label, base, scale, color, unit }) {
  const k=STATS_DEF.find(s=>s.l===label)?.k;
  const maxV=STAT_MAXES[k]||100;
  const val=Math.round(base*scale);
  const w=Math.min(100,Math.round((val/maxV)*100));
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:11}}>
      <span style={{color:'rgba(255,255,255,.6)',fontSize:12,fontWeight:600,width:90,flexShrink:0}}>{label}</span>
      <div style={{flex:1,height:7,background:'rgba(0,0,0,.4)',borderRadius:4,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${w}%`,background:color,borderRadius:4,transition:'width .65s cubic-bezier(.4,0,.2,1)'}}/>
      </div>
      <span style={{color:'white',fontSize:12,fontWeight:700,minWidth:60,textAlign:'right'}}>{val} {unit}</span>
    </div>
  );
}

function TrophicTile({ level }) {
  const t=TROPHIC[level]||TROPHIC[3];
  return (
    <div style={{background:'rgba(0,0,0,.38)',borderRadius:12,padding:'10px 8px',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,marginBottom:2}}>
        {[4,3,2,1].map(l=>{const a=level===l||(level==='F'&&l===2)||(level==='D'&&l===1);return <div key={l} style={{height:5,width:[40,52,64,76][4-l],borderRadius:2,background:a?t.c:'rgba(255,255,255,.1)'}}/>;})}
      </div>
      <span style={{color:t.c,fontSize:10,fontWeight:700,letterSpacing:.3}}>{t.label}</span>
    </div>
  );
}

// ── Categories Section ────────────────────────────────────────
function CategoriesSection({ categories, catCuriosities, accentColor }) {
  const [expanded,setExpanded]=useState(null);
  if(!categories?.length)return null;
  return (
    <div style={{marginBottom:20}}>
      <p style={{color:'white',fontSize:16,fontWeight:800,margin:'0 0 10px'}}>Categorie</p>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {categories.map(cat=>{
          const meta=CATEGORY_META[cat]||{label:cat,icon:'🔹',color:accentColor};
          const isOpen=expanded===cat;
          const curiosity=catCuriosities?.[cat];
          return (
            <div key={cat} onClick={()=>curiosity&&setExpanded(isOpen?null:cat)}
              style={{background:'rgba(0,0,0,.35)',borderRadius:12,overflow:'hidden',cursor:curiosity?'pointer':'default'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px'}}>
                <span style={{fontSize:20,flexShrink:0}}>{meta.icon}</span>
                <span style={{flex:1,color:'white',fontSize:13,fontWeight:700}}>{meta.label}</span>
                <div style={{width:8,height:8,borderRadius:'50%',background:meta.color,flexShrink:0}}/>
                {curiosity&&<span style={{color:'rgba(255,255,255,.3)',fontSize:12}}>{isOpen?'▲':'▼'}</span>}
              </div>
              {isOpen&&curiosity&&(
                <div style={{padding:'0 14px 12px',borderTop:'1px solid rgba(255,255,255,.06)'}}>
                  <p style={{margin:'10px 0 0',color:'rgba(255,255,255,.75)',fontSize:12,lineHeight:1.7}}>{curiosity}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Map Component ─────────────────────────────────────────────
function DistMap({ hab, accentColor, countriesPresent }) {
  const mapRef=useRef(null);
  const mapInst=useRef(null);
  useEffect(()=>{
    if(!mapRef.current||!countriesPresent?.length)return;
    if(!window.L){
      const lk=document.createElement('link');lk.rel='stylesheet';lk.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';document.head.appendChild(lk);
      const sc=document.createElement('script');sc.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';sc.async=true;sc.onload=init;document.head.appendChild(sc);
    } else init();
    function init(){
      const L=window.L;
      if(mapInst.current)mapInst.current.remove();
      mapInst.current=L.map(mapRef.current,{zoomControl:false,attributionControl:false}).setView([20,0],2);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19,minZoom:1}).addTo(mapInst.current);
      fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/10m_cultural/10m_admin_0_countries.geojson')
        .then(r=>r.json()).then(data=>{
          const names=countriesPresent.map(c=>ISO_TO_EN[c]||c);let bounds=null;
          L.geoJSON(data,{
            style:()=>({color:'rgba(255,255,255,.2)',weight:0.5,fillOpacity:0.3,fillColor:'rgba(100,100,100,.1)'}),
            onEachFeature:(f,l)=>{
              const n=f.properties?.NAME||'';
              if(names.includes(n)){l.setStyle({fillColor:accentColor,fillOpacity:0.7,color:accentColor,weight:1.5});l.bringToFront();try{const b=l.getBounds();if(b?.isValid())bounds=bounds?bounds.extend(b):b;}catch(e){}}
              l.bindPopup(`<b>${n}</b>`);
            }
          }).addTo(mapInst.current);
          if(bounds?.isValid())setTimeout(()=>mapInst.current.fitBounds(bounds,{padding:[50,50],maxZoom:6}),300);
        }).catch(()=>{});
    }
  },[countriesPresent,accentColor]);
  return (
    <div style={{borderRadius:12,overflow:'hidden',background:'#07131F'}}>
      {countriesPresent?.length>0&&<div ref={mapRef} style={{width:'100%',height:280,borderBottom:'1px solid rgba(255,255,255,.1)',background:'#0a0e1a'}}/>}
      {!countriesPresent?.length&&<div style={{padding:12}}><span style={{color:'rgba(255,255,255,.3)',fontSize:11}}>Nessun dato geografico</span></div>}
      <div style={{padding:12}}>
        <div style={{color:'rgba(255,255,255,.5)',fontSize:11,fontWeight:700,marginBottom:8,letterSpacing:.3}}>HABITAT</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
          {hab?.map(h=><span key={h} style={{background:'rgba(255,255,255,.15)',color:'white',fontSize:11,fontWeight:700,padding:'5px 10px',borderRadius:8}}>{h.split('_').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')}</span>)}
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status, accentColor, onClick }) {
  const cfg=status==='fotografato'?{label:'FOTOGRAFATO',c:'#fff',bg:accentColor}
    :status==='avvistato'?{label:'AVVISTATO',c:accentColor,bg:'rgba(0,0,0,.45)',border:`1.5px solid ${accentColor}`}
    :{label:'NON VISTO',c:'rgba(255,255,255,.3)',bg:'rgba(0,0,0,.3)',border:'1.5px solid rgba(255,255,255,.1)'};
  return (
    <div onClick={onClick} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'10px 12px',borderRadius:12,background:cfg.bg,color:cfg.c,fontSize:12,fontWeight:700,border:cfg.border||'none',cursor:onClick?'pointer':'default',textTransform:'uppercase',letterSpacing:0.5,width:'100%'}}>
      {status!=='non visto'&&<span style={{width:6,height:6,borderRadius:'50%',background:status==='fotografato'?'white':accentColor,display:'inline-block'}}/>}
      {cfg.label}
    </div>
  );
}

// ── Animal Card ───────────────────────────────────────────────
function AnimalCard({ a, userStatus, onClick }) {
  const c=CLS[a.cls]||CLS.Mammalia;
  const status=userStatus||'non visto';
  const found=status!=='non visto';
  return (
    <div onClick={()=>onClick(a)} style={{borderRadius:14,overflow:'hidden',cursor:'pointer',position:'relative',userSelect:'none',transition:'transform .1s ease'}}
      onMouseDown={e=>e.currentTarget.style.transform='scale(0.93)'}
      onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
      <div style={{position:'absolute',top:6,left:6,zIndex:2,background:'rgba(0,0,0,.55)',color:'rgba(255,255,255,.7)',fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:8}}>{a.no}</div>
      <div className={rarityDotClass(a.rarity)} style={{position:'absolute',top:7,right:7,zIndex:2,width:10,height:10,borderRadius:'50%'}}/>
      <div style={{height:102,background:found?c.img:'#202022',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
        {a.image_url&&found
          ?<img src={a.image_url} alt={a.sci} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>e.target.style.display='none'}/>
          :<span style={{fontSize:52,filter:found?'none':'brightness(0.14) saturate(0)'}}>{c.icon}</span>
        }
      </div>
      <div style={{background:found?c.mid:'#1C1C1E',padding:'7px 6px 4px',color:found?'white':'#2E2E30',fontSize:12,fontWeight:700,textAlign:'center',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.com}</div>
    </div>
  );
}

// ── Sheet ─────────────────────────────────────────────────────
function Sheet({ title, onClose, children, tall }) {
  return (
    <div style={{position:'absolute',inset:0,zIndex:60,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
      <div onClick={onClose} style={{flex:1,background:'rgba(0,0,0,.72)'}}/>
      <div style={{background:'#2A2A2C',borderRadius:'20px 20px 0 0',display:'flex',flexDirection:'column',maxHeight:tall?'92%':'76%',overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0',flexShrink:0}}><div style={{width:40,height:4,borderRadius:2,background:'#555'}}/></div>
        <p style={{margin:'10px 0 14px',color:'white',fontSize:17,fontWeight:800,textAlign:'center',flexShrink:0}}>{title}</p>
        <div style={{flex:1,overflowY:'auto',minHeight:0}}>{children}</div>
      </div>
    </div>
  );
}

function MultiSheet({ title, options, selected, onApply, onClose, withSearch }) {
  const [local,setLocal]=useState(new Set(selected));
  const [search,setSearch]=useState('');
  const toggle=v=>setLocal(s=>{const n=new Set(s);n.has(v)?n.delete(v):n.add(v);return n;});
  const filtered=search.trim()?options.filter(o=>o.label.toLowerCase().includes(search.toLowerCase())):options;
  return (
    <Sheet title={title} onClose={onClose}>
      {withSearch&&<div style={{padding:'0 14px 12px'}}><input type="text" placeholder="Cerca..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',height:38,borderRadius:10,background:'#2A2A2C',color:'white',border:'1px solid rgba(255,255,255,.2)',padding:'0 12px',fontSize:14,outline:'none'}}/></div>}
      <div style={{display:'flex',gap:8,padding:'0 14px 12px'}}>
        <button onClick={()=>setLocal(new Set(options.map(o=>o.value)))} style={{flex:1,height:34,borderRadius:10,background:'#3A3A3C',color:'rgba(255,255,255,.7)',fontSize:12,fontWeight:700,border:'none',cursor:'pointer'}}>Tutto</button>
        <button onClick={()=>setLocal(new Set())} style={{flex:1,height:34,borderRadius:10,background:'#3A3A3C',color:'rgba(255,255,255,.7)',fontSize:12,fontWeight:700,border:'none',cursor:'pointer'}}>Niente</button>
      </div>
      <div style={{padding:'0 14px 80px'}}>
        {filtered.map(opt=>{
          const on=local.has(opt.value);
          const isR=['Comune','Non comune','Raro','Leggendario'].includes(opt.value);
          return (
            <div key={opt.value} className={isR?rarityClass(opt.value):''} onClick={()=>toggle(opt.value)}
              style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 14px',marginBottom:6,borderRadius:12,background:isR?undefined:(opt.bg||'#333'),border:`1.5px solid ${on?(isR?'rgba(255,255,255,.4)':opt.c||'#666'):'transparent'}`,cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,flex:1}}>
                {withSearch&&<span style={{fontSize:16}}>{getFlagEmoji(opt.value)}</span>}
                <span style={{fontSize:14,fontWeight:700}}>{opt.label}</span>
              </div>
              <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${on?(isR?'rgba(255,255,255,.6)':opt.c||'#666'):'rgba(255,255,255,.25)'}`,background:on?(isR?'rgba(255,255,255,.25)':opt.c||'#666'):'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {on&&<span style={{fontSize:13,fontWeight:900}}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position:'sticky',bottom:0,background:'#2A2A2C',padding:'10px 14px 24px',display:'flex',gap:8}}>
        <button onClick={onClose} style={{flex:1,height:44,borderRadius:12,background:'#3A3A3C',color:'rgba(255,255,255,.6)',fontSize:14,fontWeight:700,border:'none',cursor:'pointer'}}>Annulla</button>
        <button onClick={()=>{onApply([...local]);onClose();}} style={{flex:2,height:44,borderRadius:12,background:'#E8C040',color:'#1A1000',fontSize:14,fontWeight:800,border:'none',cursor:'pointer'}}>Applica</button>
      </div>
    </Sheet>
  );
}

function TaxSheet({ onApply, onClose, current }) {
  const tree=useMemo(()=>buildTree(ANIMALS),[]);
  const [path,setPath]=useState([]);
  const [sel,setSel]=useState(current);
  const node=path.length===0?tree:path[path.length-1].node._children;
  const entries=Object.entries(node).sort((a,b)=>b[1]._count-a[1]._count);
  const LABELS={kin:'Regno',phy:'Phylum',cls:'Classe',ord:'Ordine',fam:'Famiglia',gen:'Genere'};
  return (
    <Sheet title="Albero Tassonomico" onClose={onClose} tall>
      <div style={{display:'flex',flexWrap:'wrap',gap:4,padding:'0 14px 10px',alignItems:'center'}}>
        {['Tutti',...path.map(p=>p.name)].map((b,i,arr)=>(
          <span key={i} style={{display:'flex',alignItems:'center',gap:4}}>
            <span onClick={()=>setPath(p=>p.slice(0,i))} style={{color:i===arr.length-1?'white':'#E8C040',fontSize:12,fontWeight:700,cursor:i<arr.length-1?'pointer':'default',padding:'3px 8px',borderRadius:8,background:i===arr.length-1?'rgba(255,255,255,.1)':'transparent'}}>{b}</span>
            {i<arr.length-1&&<span style={{color:'rgba(255,255,255,.25)',fontSize:11}}>›</span>}
          </span>
        ))}
      </div>
      {sel&&<div style={{margin:'0 14px 10px',padding:'10px 14px',borderRadius:10,background:'rgba(232,192,64,.15)',border:'1px solid rgba(232,192,64,.4)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{color:'#E8C040',fontSize:13,fontWeight:700}}>{sel.label}</span>
        <span onClick={()=>setSel(null)} style={{color:'rgba(255,255,255,.4)',fontSize:18,cursor:'pointer',padding:'0 4px'}}>×</span>
      </div>}
      <div style={{padding:'0 14px 90px'}}>
        {entries.map(([name,n])=>{
          const isSel=sel?.value===name&&sel?.key===n._key;
          return (
            <div key={name} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <div onClick={()=>setSel({key:n._key,value:name,label:`${LABELS[n._key]}: ${name}`})}
                style={{flex:1,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',borderRadius:12,background:isSel?'rgba(232,192,64,.2)':'#222224',border:`1.5px solid ${isSel?'#E8C040':'transparent'}`,cursor:'pointer'}}>
                <div>
                  <div style={{color:isSel?'#E8C040':'white',fontSize:14,fontWeight:700}}>{name}</div>
                  <div style={{color:'rgba(255,255,255,.4)',fontSize:11,marginTop:2}}>{n._label} · {n._count} specie</div>
                </div>
                {isSel&&<span style={{color:'#E8C040',fontSize:16}}>✓</span>}
              </div>
              {Object.keys(n._children).length>0&&<div onClick={()=>setPath(p=>[...p,{name,node:n}])} style={{width:40,height:40,borderRadius:10,background:'#333',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><span style={{color:'rgba(255,255,255,.5)',fontSize:16}}>›</span></div>}
            </div>
          );
        })}
      </div>
      <div style={{position:'sticky',bottom:0,background:'#2A2A2C',padding:'10px 14px 28px',display:'flex',gap:8}}>
        <button onClick={onClose} style={{flex:1,height:44,borderRadius:12,background:'#3A3A3C',color:'rgba(255,255,255,.6)',fontSize:14,fontWeight:700,border:'none',cursor:'pointer'}}>Annulla</button>
        <button onClick={()=>{onApply(sel);onClose();}} style={{flex:2,height:44,borderRadius:12,background:'#E8C040',color:'#1A1000',fontSize:14,fontWeight:800,border:'none',cursor:'pointer'}}>Applica</button>
      </div>
    </Sheet>
  );
}

function ClassSheet({ sel, onSel, onClose }) {
  return (
    <Sheet title="Seleziona Classe" onClose={onClose}>
      <div style={{padding:'0 14px 40px'}}>
        <button onClick={()=>onSel(null)} style={{width:'100%',marginBottom:10,padding:'12px 0',borderRadius:12,background:sel===null?'#5A5A5C':'#3A3A3C',color:'white',fontSize:14,fontWeight:700,border:sel===null?'2px solid white':'2px solid transparent',cursor:'pointer'}}>Qualsiasi</button>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {Object.entries(CLS).map(([k,v])=>(
            <button key={k} onClick={()=>onSel(k)} style={{padding:'10px 4px',borderRadius:12,background:sel===k?v.mid:'#222224',color:sel===k?v.accent:'rgba(255,255,255,.6)',fontSize:11,fontWeight:700,border:sel===k?`2px solid ${v.accent}`:'2px solid #333',cursor:'pointer',lineHeight:1.4}}>
              <div style={{fontSize:22,marginBottom:3}}>{v.icon}</div>{v.label}
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}

// ── Grid ──────────────────────────────────────────────────────
function Grid({ onSelect, userAnimals, user, onSignOut }) {
  const [search,setSearch]=useState('');
  const [clsF,setClsF]=useState(null);
  const [sheet,setSheet]=useState(null);
  const [showSearch,setShowSearch]=useState(false);
  const [showMenu,setShowMenu]=useState(false);
  const [showUserMenu,setShowUserMenu]=useState(false);
  const [fRarity,setFRarity]=useState([]);
  const [fCons,setFCons]=useState([]);
  const [fStatus,setFStatus]=useState([]);
  const [fTrophic,setFTrophic]=useState([]);
  const [fGeo,setFGeo]=useState([]);
  const [fTax,setFTax]=useState(null);

  const list=ANIMALS.filter(a=>{
    const q=search.toLowerCase();
    const status=userAnimals[a.sci]?.status||'non visto';
    if(q&&!a.com.toLowerCase().includes(q)&&!a.sci.toLowerCase().includes(q))return false;
    if(clsF&&a.cls!==clsF)return false;
    if(fRarity.length&&!fRarity.includes(a.rarity))return false;
    if(fCons.length&&!fCons.includes(a.cons))return false;
    if(fStatus.length&&!fStatus.includes(status))return false;
    if(fTrophic.length&&!fTrophic.includes(String(a.trophic)))return false;
    if(fGeo.length&&!a.distribution?.countries_present?.some(c=>fGeo.includes(c)))return false;
    if(fTax&&a[fTax.key]!==fTax.value)return false;
    return true;
  });

  const stats=useMemo(()=>({
    avvistati:Object.values(userAnimals).filter(a=>a.status==='avvistato'||a.status==='fotografato').length,
    fotografati:Object.values(userAnimals).filter(a=>a.status==='fotografato').length,
  }),[userAnimals]);

  const anyExtra=fRarity.length||fCons.length||fStatus.length||fTrophic.length||fTax;

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',background:'#1C1C1E',position:'relative',overflow:'hidden'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px 11px',borderBottom:'1px solid #2A2A2C',flexShrink:0}}>
        <button onClick={()=>setShowUserMenu(!showUserMenu)} style={{background:'rgba(255,255,255,.1)',border:'none',color:'white',fontSize:11,fontWeight:700,cursor:'pointer',padding:'6px 10px',borderRadius:8}}>
          👤 {user?.email?.split('@')[0]||'Profilo'}
        </button>
        <span style={{color:'white',fontSize:18,fontWeight:900}}>Animaldex</span>
        <span style={{color:'rgba(255,255,255,.5)',fontSize:11}}>{stats.fotografati}📷 {stats.avvistati}👁</span>
      </div>

      {/* User menu */}
      {showUserMenu&&(
        <div style={{position:'absolute',top:56,left:12,background:'#252527',border:'1px solid #333',borderRadius:14,padding:8,zIndex:50,minWidth:200}}>
          <div style={{padding:'8px 12px',color:'rgba(255,255,255,.5)',fontSize:11}}>{user?.email}</div>
          <div style={{height:1,background:'#333',margin:'4px 0'}}/>
          <div style={{padding:'8px 12px',color:'rgba(255,255,255,.4)',fontSize:11}}>📊 {stats.avvistati}/{ANIMALS.length} avvistati</div>
          <button onClick={onSignOut} style={{width:'100%',padding:'10px 12px',background:'rgba(255,0,0,.1)',border:'none',color:'#FF6B6B',cursor:'pointer',fontWeight:700,fontSize:13,borderRadius:8,textAlign:'left'}}>Esci</button>
        </div>
      )}

      {/* Filter chips */}
      {(anyExtra||clsF)&&(
        <div style={{display:'flex',gap:6,padding:'8px 12px 4px',flexWrap:'wrap',flexShrink:0}}>
          {clsF&&<span onClick={()=>setClsF(null)} style={{background:CLS[clsF].mid,color:CLS[clsF].accent,fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:20,cursor:'pointer'}}>{CLS[clsF].icon} {CLS[clsF].label} ×</span>}
          {fTax&&<span onClick={()=>setFTax(null)} style={{background:'rgba(232,192,64,.2)',color:'#E8C040',fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:20,cursor:'pointer'}}>{fTax.label} ×</span>}
          {fRarity.map(r=><span key={r} className={rarityClass(r)} onClick={()=>setFRarity(p=>p.filter(x=>x!==r))} style={{fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:20,cursor:'pointer'}}>{r} ×</span>)}
          {fCons.map(c=><span key={c} onClick={()=>setFCons(p=>p.filter(x=>x!==c))} style={{background:CONS[c].bg,color:CONS[c].c,fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:20,cursor:'pointer'}}>{c} ×</span>)}
          {fStatus.map(s=><span key={s} onClick={()=>setFStatus(p=>p.filter(x=>x!==s))} style={{background:'#2A2A2C',color:'rgba(255,255,255,.6)',fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:20,cursor:'pointer'}}>{s} ×</span>)}
          {fTrophic.map(t=><span key={t} onClick={()=>setFTrophic(p=>p.filter(x=>x!==t))} style={{background:TROPHIC[t]?.bg||'#222',color:TROPHIC[t]?.c||'#aaa',fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:20,cursor:'pointer'}}>{TROPHIC[t]?.label||t} ×</span>)}
        </div>
      )}

      {/* Grid */}
      <div style={{flex:1,overflowY:'auto',padding:'12px 12px 0'}}>
        {list.length===0
          ?<p style={{color:'#555',textAlign:'center',padding:40,fontSize:14}}>Nessun animale trovato</p>
          :<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {list.map(a=><AnimalCard key={a.sci} a={a} userStatus={userAnimals[a.sci]?.status} onClick={onSelect}/>)}
          </div>
        }
        <div style={{height:6}}/>
      </div>

      {/* Bottom bar */}
      <div style={{background:'#A84637',borderTop:'1px solid #7A3228',padding:'12px 12px 8px',flexShrink:0,position:'relative'}}>
        <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:8}}>
          <button onClick={()=>setShowSearch(!showSearch)} style={{width:46,height:46,borderRadius:10,background:'transparent',border:'none',color:'#FFF',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M13 13L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <button onClick={()=>{setSheet('tax');setShowMenu(false);}} style={{flex:1,height:46,borderRadius:10,background:'transparent',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:14,fontWeight:700}}>
            Albero Tassonomico {fTax&&'✓'}
          </button>
          <button onClick={()=>setShowMenu(!showMenu)} style={{width:46,height:46,borderRadius:10,background:'transparent',border:'none',color:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 4H17L10 12.5V16L7 18V12.5L3 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          </button>
        </div>
        <div style={{textAlign:'center',fontSize:11,fontWeight:600,color:'rgba(255,255,255,.7)',padding:'4px 0'}}>{list.length} risultati</div>
      </div>

      {/* Filter menu */}
      {showMenu&&(
        <div style={{position:'absolute',bottom:90,right:12,width:280,background:'#252527',border:'1px solid #333',borderRadius:14,boxShadow:'0 12px 32px rgba(0,0,0,.5)',zIndex:40,overflow:'hidden'}}>
          {[
            {label:'Rarità',icon:'★',key:'rarity',active:fRarity.length>0,color:'#C9A961'},
            {label:'Conservazione',icon:'🛡',key:'cons',active:fCons.length>0,color:'#DC143C'},
            {label:'Gerarchia',icon:'⛓',key:'trophic',active:fTrophic.length>0,color:'#F5A828'},
            {label:'Status',icon:'📷',key:'status',active:fStatus.length>0,color:'#00BFFF'},
            {label:'Geografia',icon:'🌍',key:'geography',active:fGeo.length>0,color:'#20B2AA'},
          ].map(item=>(
            <button key={item.key} onClick={()=>{setSheet(item.key);setShowMenu(false);}} style={{width:'100%',padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,.05)',background:'transparent',border:'none',display:'flex',alignItems:'center',gap:12,cursor:'pointer',color:item.active?item.color:'white',fontWeight:item.active?700:600}}>
              <span style={{fontSize:18}}>{item.icon}</span><span style={{fontSize:14}}>{item.label}</span>
              {item.active&&<span style={{marginLeft:'auto',color:item.color,fontSize:12}}>✓</span>}
            </button>
          ))}
          <button onClick={()=>{setSearch('');setClsF(null);setFRarity([]);setFCons([]);setFStatus([]);setFTrophic([]);setFTax(null);setShowMenu(false);}} style={{width:'100%',padding:'14px 16px',background:'rgba(255,0,0,.1)',border:'none',color:'#FF6B6B',cursor:'pointer',fontWeight:700,fontSize:14}}>
            Resetta filtri
          </button>
        </div>
      )}

      {/* Search bar */}
      {showSearch&&(
        <div style={{position:'absolute',top:58,left:12,right:12,background:'#252527',borderRadius:12,border:'1px solid #333',padding:10,zIndex:50,display:'flex',gap:8,boxShadow:'0 8px 24px rgba(0,0,0,.4)'}}>
          <button onClick={()=>{setSearch('');setShowSearch(false);}} style={{width:40,height:40,borderRadius:8,background:'#3A3A3C',border:'none',color:'rgba(255,255,255,.6)',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca animale..." style={{flex:1,height:40,borderRadius:8,background:'#333',border:'1px solid #444',color:'white',fontSize:14,padding:'0 12px',outline:'none',fontFamily:'inherit'}} autoFocus/>
        </div>
      )}

      {/* Sheets */}
      {sheet==='cls'      &&<ClassSheet sel={clsF} onSel={k=>{setClsF(k);setSheet(null);}} onClose={()=>setSheet(null)}/>}
      {sheet==='rarity'   &&<MultiSheet title="Rarità" options={Object.entries(RARITY).map(([k,v])=>({value:k,label:k,c:v.c,bg:v.bg}))} selected={fRarity} onApply={setFRarity} onClose={()=>setSheet(null)}/>}
      {sheet==='cons'     &&<MultiSheet title="Conservazione" options={Object.entries(CONS).map(([k,v])=>({value:k,label:`${k} · ${v.full}`,c:v.c,bg:v.bg}))} selected={fCons} onApply={setFCons} onClose={()=>setSheet(null)}/>}
      {sheet==='status'   &&<MultiSheet title="Status" options={[{value:'non visto',label:'Non visto',c:'rgba(255,255,255,.4)',bg:'rgba(100,100,100,.2)'},{value:'avvistato',label:'Avvistato',c:'#FFD700',bg:'rgba(255,215,0,.15)'},{value:'fotografato',label:'Fotografato',c:'#00BFFF',bg:'rgba(0,191,255,.15)'}]} selected={fStatus} onApply={setFStatus} onClose={()=>setSheet(null)}/>}
      {sheet==='trophic'  &&<MultiSheet title="Catena Alimentare" options={Object.entries(TROPHIC).map(([k,v])=>({value:String(k),label:v.label,c:v.c,bg:v.bg}))} selected={fTrophic} onApply={setFTrophic} onClose={()=>setSheet(null)}/>}
      {sheet==='geography'&&<MultiSheet title="Geografia" options={COUNTRIES.map(c=>({value:c.code,label:c.name,c:'#20B2AA',bg:'rgba(32,178,170,.15)'}))} selected={fGeo} onApply={setFGeo} onClose={()=>setSheet(null)} withSearch/>}
      {sheet==='tax'      &&<TaxSheet current={fTax} onApply={v=>setFTax(v)} onClose={()=>setSheet(null)}/>}
    </div>
  );
}

// ── Detail ────────────────────────────────────────────────────
function Detail({ a, userAnimals, userId, onBack, onStatusChange }) {
  const [statMode,setStatMode]=useState('Base');
  const [taxOpen,setTaxOpen]=useState(false);
  const [showStatusMenu,setShowStatusMenu]=useState(false);
  const [saving,setSaving]=useState(false);
  const userA=userAnimals[a.sci]||{};
  const localStatus=userA.status||'non visto';
  const c=CLS[a.cls]||CLS.Mammalia;
  const co=CONS[a.cons]||CONS.DD;
  const scale=SCALE[statMode];

  async function handleStatus(s){
    setSaving(true);setShowStatusMenu(false);
    await onStatusChange(a.sci,s,a.rarity);
    setSaving(false);
  }

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:`linear-gradient(180deg,${c.detailTop} 0%,${c.detailBg} 45%,#1A1A1C 85%)`}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px 11px',flexShrink:0}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:c.accent,fontSize:15,fontWeight:700,cursor:'pointer',padding:0}}>‹ Animaldex</button>
        <span style={{color:'white',fontSize:17,fontWeight:800}}>{a.com}</span>
        <div style={{width:32}}/>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'0 14px 48px'}}>
        {/* Breadcrumb */}
        <div style={{display:'flex',flexWrap:'wrap',gap:3,alignItems:'center',marginBottom:14}}>
          {[a.kin,a.phy,a.cls,a.ord,a.fam].map((p,i,arr)=>(
            <span key={i} style={{display:'flex',alignItems:'center',gap:3}}>
              <span style={{color:i===2?c.accent:'rgba(255,255,255,.32)',fontSize:11,fontWeight:i===2?700:400,fontStyle:i!==2?'italic':undefined}}>{p}</span>
              {i<arr.length-1&&<span style={{color:'rgba(255,255,255,.18)',fontSize:11}}>›</span>}
            </span>
          ))}
        </div>

        {/* Hero */}
        <div style={{display:'flex',gap:12,marginBottom:16}}>
          <div style={{width:132,height:132,borderRadius:16,overflow:'hidden',flexShrink:0,background:c.img,display:'flex',alignItems:'center',justifyContent:'center'}}>
            {a.image_url
              ?<img src={a.image_url} alt={a.sci} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>e.target.style.display='none'}/>
              :<span style={{fontSize:76}}>{c.icon}</span>
            }
          </div>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:8,justifyContent:'center'}}>
            <div className={rarityClass(a.rarity)} style={{borderRadius:12,padding:'10px 12px',fontSize:14,fontWeight:700,textAlign:'center'}}>{a.rarity||'Comune'}</div>
            <div style={{background:co.bg,borderRadius:12,padding:'9px 12px',color:co.c,fontSize:12,fontWeight:700,textAlign:'center'}}>{co.lbl} · {co.full}</div>
            <div style={{display:'flex',justifyContent:'center',position:'relative',width:'100%'}}>
              <StatusBadge status={localStatus} accentColor={c.accent} onClick={()=>!saving&&setShowStatusMenu(!showStatusMenu)}/>
              {saving&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.4)',borderRadius:12}}><span style={{color:'white',fontSize:11}}>...</span></div>}
              {showStatusMenu&&(
                <div style={{position:'absolute',top:44,left:0,right:0,background:c.detailBg,border:`1px solid ${c.accent}33`,borderRadius:12,padding:8,display:'flex',flexDirection:'column',gap:6,zIndex:10}}>
                  {['non visto','avvistato','fotografato'].map(s=>(
                    <button key={s} onClick={()=>handleStatus(s)} style={{background:'transparent',border:'none',color:c.accent,cursor:'pointer',padding:'6px 12px',borderRadius:8,fontSize:13,fontWeight:700,textAlign:'left',textTransform:'capitalize'}}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nome */}
        <div style={{textAlign:'center',marginBottom:18}}>
          <h1 style={{margin:0,color:'white',fontSize:26,fontWeight:900,letterSpacing:-.3}}>{a.com}</h1>
          <p style={{margin:'4px 0 0',color:c.accent,fontSize:15,fontStyle:'italic',fontWeight:400}}>{a.sci}</p>
        </div>

        {/* Info rapide */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:16}}>
          <div style={{background:'rgba(0,0,0,.38)',borderRadius:12,padding:'11px 8px',textAlign:'center'}}>
            <div style={{fontSize:17,marginBottom:4}}>⚖️</div><div style={{color:'white',fontSize:10,fontWeight:600}}>{a.wt}</div>
          </div>
          <div style={{background:'rgba(0,0,0,.38)',borderRadius:12,padding:'11px 8px',textAlign:'center'}}>
            <div style={{fontSize:17,marginBottom:4}}>📏</div><div style={{color:'white',fontSize:10,fontWeight:600}}>{a.ln}</div>
          </div>
          <TrophicTile level={a.trophic}/>
        </div>

        {/* Lifespan + Endemic + Spotlight */}
        <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
          {a.lifespan&&<div style={{background:'rgba(0,0,0,.35)',borderRadius:10,padding:'8px 12px',display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:14}}>⏳</span><span style={{color:'rgba(255,255,255,.7)',fontSize:11,fontWeight:600}}>Vita: ~{a.lifespan} anni</span>
          </div>}
          {a.is_endemic&&<div style={{background:'rgba(0,0,0,.35)',borderRadius:10,padding:'8px 12px',display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:14}}>📍</span><span style={{color:'#90D84A',fontSize:11,fontWeight:700}}>Endemico{a.endemic_iso?.length>0?` (${a.endemic_iso.join(', ')})`:''}</span>
          </div>}
        </div>

        {/* Spotlight hours */}
        {a.spotlightHours?.length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{color:'rgba(255,255,255,.5)',fontSize:11,fontWeight:700,marginBottom:8,letterSpacing:.3,textTransform:'uppercase'}}>Orario avvistamento</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {a.spotlightHours.map(h=>(
                <span key={h} style={{background:'rgba(255,255,255,.1)',color:'white',fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:8,display:'flex',alignItems:'center',gap:4}}>
                  {SPOTLIGHT_ICONS[h]||'⏰'} <span style={{textTransform:'capitalize'}}>{h}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Descrizione */}
        <div style={{background:'rgba(0,0,0,.35)',borderRadius:14,padding:14,marginBottom:16,display:'flex',gap:12,alignItems:'flex-start'}}>
          <div style={{fontSize:34,flexShrink:0}}>{c.icon}</div>
          <p style={{margin:0,color:'rgba(255,255,255,.82)',fontSize:13,lineHeight:1.7}}>{a.desc}</p>
        </div>

        {/* Categorie */}
        <CategoriesSection categories={a.categories} catCuriosities={a.cat_curiosities} accentColor={c.accent}/>

        {/* Stats */}
        <p style={{color:'white',fontSize:16,fontWeight:800,textAlign:'center',margin:'0 0 10px'}}>Statistiche</p>
        {localStatus!=='non visto'?(
          <>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',marginBottom:12,background:'rgba(0,0,0,.38)',borderRadius:12,padding:4,gap:4}}>
              {['Min','Base','Max'].map(m=><button key={m} onClick={()=>setStatMode(m)} style={{padding:'8px 0',borderRadius:8,background:statMode===m?c.mid:'transparent',color:statMode===m?'white':'rgba(255,255,255,.38)',fontSize:13,fontWeight:700,border:'none',cursor:'pointer'}}>{m}</button>)}
            </div>
            <div style={{background:'rgba(0,0,0,.35)',borderRadius:14,padding:'14px 14px 6px',marginBottom:20}}>
              {STATS_DEF.map(({k,l,u})=><StatRow key={k} label={l} base={a.stats?.[k]||0} scale={scale} color={c.accent} unit={u}/>)}
            </div>
          </>
        ):(
          <div style={{background:'rgba(0,0,0,.35)',borderRadius:14,padding:20,marginBottom:20,textAlign:'center'}}>
            <p style={{color:'rgba(255,255,255,.6)',fontSize:13,margin:0}}>🔒 Segna come avvistato per sbloccare le statistiche</p>
          </div>
        )}

        {/* Bio + Ety */}
        <p style={{color:'white',fontSize:16,fontWeight:800,margin:'0 0 10px'}}>Biologia</p>
        <div style={{background:'rgba(0,0,0,.35)',borderRadius:14,padding:14,marginBottom:16}}><p style={{margin:0,color:'rgba(255,255,255,.82)',fontSize:13,lineHeight:1.7}}>{a.bio}</p></div>
        <p style={{color:'white',fontSize:16,fontWeight:800,margin:'0 0 10px'}}>Etimologia</p>
        <div style={{background:'rgba(0,0,0,.35)',borderRadius:14,padding:14,marginBottom:20}}><p style={{margin:0,color:'rgba(255,255,255,.82)',fontSize:13,lineHeight:1.7}}>{a.ety}</p></div>

        {/* Big5 */}
        {a.big5_info?.length>0&&(
          <div style={{marginBottom:20}}>
            <p style={{color:'white',fontSize:16,fontWeight:800,margin:'0 0 10px'}}>Collezioni</p>
            {a.big5_info.map((b,i)=>(
              <div key={i} style={{background:'rgba(0,0,0,.35)',borderRadius:12,padding:'10px 14px',marginBottom:8,display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:20}}>🏆</span>
                <div><div style={{color:'white',fontSize:13,fontWeight:700}}>{b.list_name}</div><div style={{color:'rgba(255,255,255,.5)',fontSize:11}}>{b.big5_iso?.map(getFlagEmoji).join(' ')}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* Distribuzione */}
        <p style={{color:'white',fontSize:16,fontWeight:800,margin:'0 0 10px'}}>Distribuzione</p>
        <DistMap hab={a.hab} accentColor={c.accent} countriesPresent={a.distribution?.countries_present}/>
        {a.distribution&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8,marginBottom:20}}>
            <div style={{background:'rgba(0,0,0,.35)',borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
              <div style={{color:c.accent,fontSize:18,fontWeight:800}}>{a.distribution.wild_observations?.toLocaleString()}</div>
              <div style={{color:'rgba(255,255,255,.5)',fontSize:10,marginTop:2}}>Osservazioni wild</div>
            </div>
            <div style={{background:'rgba(0,0,0,.35)',borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
              <div style={{color:c.accent,fontSize:18,fontWeight:800}}>{a.distribution.countries_present?.length||0}</div>
              <div style={{color:'rgba(255,255,255,.5)',fontSize:10,marginTop:2}}>Paesi</div>
            </div>
          </div>
        )}

        {/* Tassonomia */}
        <button onClick={()=>setTaxOpen(v=>!v)} style={{width:'100%',background:'rgba(0,0,0,.35)',border:`1px solid ${taxOpen?c.accent+'55':'rgba(255,255,255,.1)'}`,borderRadius:taxOpen?'14px 14px 0 0':14,padding:'13px 16px',display:'flex',justifyContent:'space-between',color:'white',fontSize:14,fontWeight:700,cursor:'pointer'}}>
          Tassonomia completa<span style={{color:'rgba(255,255,255,.28)',transform:taxOpen?'rotate(180deg)':undefined,display:'inline-block',transition:'transform .25s'}}>▼</span>
        </button>
        {taxOpen&&(
          <div style={{background:'rgba(0,0,0,.45)',borderRadius:'0 0 14px 14px',padding:'4px 16px 16px',border:`1px solid ${c.accent}33`,borderTop:'none',marginBottom:20}}>
            {[['Regno',a.kin],['Phylum',a.phy],['Classe',a.cls],['Ordine',a.ord],['Famiglia',a.fam],['Genere',a.gen],['Specie',a.sci]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
                <span style={{color:'rgba(255,255,255,.35)',fontSize:12}}>{l}</span>
                <span style={{color:l==='Specie'||l==='Genere'?c.accent:'white',fontSize:12,fontWeight:600,fontStyle:l==='Specie'||l==='Genere'?'italic':undefined}}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  const [sel,setSel]=useState(null);
  const [userAnimals,setUserAnimals]=useState({});
  const [newBadges,setNewBadges]=useState([]);

  useEffect(()=>{
    const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap';document.head.appendChild(l);
    document.body.style.cssText='margin:0;background:#1C1C1E;overflow:hidden';
    const style=document.createElement('style');style.textContent=RARITY_CSS;document.head.appendChild(style);
  },[]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{ setUser(session?.user||null); setLoading(false); });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>setUser(session?.user||null));
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!user){setUserAnimals({});return;}
    loadUserAnimals(user.id).then(setUserAnimals).catch(console.error);
  },[user]);

  const handleStatusChange=useCallback(async(sci,status,rarity)=>{
    if(!user)return;
    try{
      const updated=await upsertAnimalStatus(user.id,sci,status);
      const newMap={...userAnimals,[sci]:updated};
      setUserAnimals(newMap);
      const earned=await checkAndAwardBadges(user.id,newMap,status,rarity);
      if(earned.length>0)setNewBadges(earned);
    }catch(e){console.error(e);}
  },[user,userAnimals]);

  const handleSignOut=useCallback(async()=>{
    await supabase.auth.signOut();setUser(null);setUserAnimals({});setSel(null);
  },[]);

  if(loading)return <div style={{height:'100vh',background:'#1C1C1E',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:52}}>🦁</span></div>;
  if(!user)return <AuthScreen onAuth={setUser}/>;

  return (
    <div style={{fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif",height:'100vh',maxWidth:480,margin:'0 auto',display:'flex',flexDirection:'column',overflow:'hidden',background:'#1C1C1E'}}>
      {sel
        ?<Detail a={sel} userAnimals={userAnimals} userId={user.id} onBack={()=>setSel(null)} onStatusChange={handleStatusChange}/>
        :<Grid onSelect={setSel} userAnimals={userAnimals} user={user} onSignOut={handleSignOut}/>
      }
      <BadgeToast badges={newBadges} onDismiss={()=>setNewBadges([])}/>
    </div>
  );
}
