const COLORS = {
  animalia: '#d9b86f',
  extra: '#b8d8e8',
  annelida: '#b98a72',
  arthropoda: '#e49a48',
  insecta: '#f0b94f',
  arachnida: '#a75246',
  crustacea: '#dc7d69',
  mollusca: '#c9a8d8',
  chordata: '#3fb7a6',
  amphibia: '#54d0b5',
  reptilia: '#6fa15f',
  pisces: '#4f8cd8',
  aves: '#67c7d8',
  mammalia: '#c89b5a',
  carnivora: '#b8664d',
  primates: '#d1a84f',
  cetacea: '#357ab8',
  chiroptera: '#7d69c8',
};

const slug = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const node = ({
  id,
  label,
  subtitle = '',
  rank = 'cluster',
  kind = 'cluster',
  color = COLORS.animalia,
  match,
  matchAny,
  icon,
  children = [],
}) => ({
  id: id || slug(label),
  label,
  subtitle,
  rank,
  kind,
  color,
  icon,
  ...(match ? { match } : {}),
  ...(matchAny ? { matchAny } : {}),
  children,
});

const taxon = (label, rank, match, children = [], options = {}) => node({
  label,
  subtitle: options.subtitle,
  rank,
  kind: 'taxon',
  color: options.color,
  match,
  matchAny: options.matchAny,
  id: options.id,
  icon: options.icon,
  children,
});

const cluster = (label, children = [], options = {}) => node({
  label,
  subtitle: options.subtitle,
  rank: options.rank || 'cluster',
  kind: options.kind || 'cluster',
  color: options.color,
  match: options.match,
  matchAny: options.matchAny,
  id: options.id,
  icon: options.icon,
  children,
});

const leaf = (label, subtitle = '', options = {}) => node({
  label,
  subtitle,
  rank: options.rank || 'editorial',
  kind: options.kind || 'editorial',
  color: options.color,
  match: options.match,
  matchAny: options.matchAny,
  id: options.id,
});

const family = (name, subtitle = '', children = [], color) => taxon(name, 'family', { fam: name }, children, { subtitle, color });
const order = (name, subtitle = '', children = [], color) => taxon(name, 'order', { ord: name }, children, { subtitle, color });
const cls = (name, subtitle = '', children = [], color) => taxon(name, 'class', { cls: name }, children, { subtitle, color });
const phylum = (name, subtitle = '', children = [], color) => taxon(name, 'phylum', { phy: name }, children, { subtitle, color });

export const TAXONOMY_TREE = node({
  id: 'animalia',
  label: 'Animalia',
  subtitle: 'Regno animale e mappa tassonomica divulgativa Animaldex.',
  rank: 'kingdom',
  kind: 'root',
  color: COLORS.animalia,
  icon: 'kingdom',
  match: { kin: 'Animalia' },
  children: [
    cluster('Extra Animalia', [
      cluster('Cluster Ancestrali', [
        phylum('Porifera', 'Spugne', [], COLORS.extra),
        phylum('Cnidaria', 'Meduse, coralli e anemoni', [], COLORS.extra),
        phylum('Ctenophora', 'Pettini di mare', [], COLORS.extra),
        phylum('Placozoa', 'Trichoplax e forme semplicissime', [], COLORS.extra),
      ], { color: COLORS.extra, subtitle: 'Rami antichi, semplici e marini.' }),
      cluster('Cluster Evoluti Marini', [
        phylum('Echinodermata', 'Stelle marine e ricci di mare', [], COLORS.extra),
        phylum('Hemichordata', 'Balanoglossus e parenti', [], COLORS.extra),
        phylum('Brachiopoda', 'Lingule e conchiglie antiche', [], COLORS.extra),
        phylum('Chaetognatha', 'Frecce di mare', [], COLORS.extra),
      ], { color: COLORS.extra }),
      cluster('Cluster Micro-Mondo', [
        phylum('Tardigrada', "Orsi d'acqua", [], COLORS.extra),
        phylum('Rotifera', 'Ruote animali', [], COLORS.extra),
        phylum('Nematoda', 'Vermi tondi', [], COLORS.extra),
        phylum('Gastrotricha', 'Gastrotrichi', [], COLORS.extra),
        phylum('Kinorhyncha', 'Draghi spinosi', [], COLORS.extra),
        phylum('Loricifera', 'Loriciferi', [], COLORS.extra),
      ], { color: COLORS.extra }),
      cluster('Cluster Vermiformi', [
        phylum('Platyhelminthes', 'Planarie e tenie', [], COLORS.extra),
        phylum('Nemertea', 'Vermi nastro', [], COLORS.extra),
        phylum('Sipuncula', 'Vermi arachidi', [], COLORS.extra),
        phylum('Acanthocephala', 'Vermi spinosi', [], COLORS.extra),
        phylum('Bryozoa', 'Muschio animale', [], COLORS.extra),
      ], { color: COLORS.extra }),
    ], { color: COLORS.extra, subtitle: 'Rami fuori dai grandi phyla giocabili principali.' }),

    phylum('Annelida', 'Anellidi, lombrichi, sanguisughe e vermi marini notevoli.', [
      cls('Oligochaeta', 'Lombrichi e forme terrestri', [
        leaf('Lombrichi comuni', '', { color: COLORS.annelida }),
        cluster('Lombrichi giganti', [
          leaf('Lombrico gigante australiano', '', { color: COLORS.annelida }),
          leaf('Megascolides australis', 'Fino a 3 metri', { color: COLORS.annelida, match: { gen: 'Megascolides' } }),
        ], { color: COLORS.annelida }),
        cluster('Lombrichi blu elettrici', [leaf('Terriswalkeris terraereginae', 'Australia', { color: COLORS.annelida, match: { gen: 'Terriswalkeris' } })], { color: COLORS.annelida }),
        cluster('Lombrichi "Saltatori"', [leaf('Amynthas spp.', 'Crazy worms', { color: COLORS.annelida, match: { gen: 'Amynthas' } }), leaf('Comportamento frenetico e serpentino', '', { color: COLORS.annelida })], { color: COLORS.annelida }),
        cluster('Lombrichi arboricoli', [leaf('Habitat: bromeliacee e muschio', '', { color: COLORS.annelida }), leaf('Foreste pluviali', '', { color: COLORS.annelida })], { color: COLORS.annelida }),
      ], COLORS.annelida),
      cls('Hirudinea', 'Sanguisughe medicinali e terrestri tropicali', [leaf('Sanguisughe medicinali', '', { color: COLORS.annelida }), leaf('Sanguisughe terrestri/tropicali', '', { color: COLORS.annelida })], COLORS.annelida),
      cls('Polychaeta', 'Vermi marini piumosi, colorati o urticanti', [family('Sabellidae', 'Vermi piumosi e fiori di mare', [leaf('Vermi piumosi'), leaf('Fiori di mare')], COLORS.annelida), cluster('Vermi di fuoco', [leaf('Colorati e urticanti'), leaf('Barriere coralline')], { color: COLORS.annelida })], COLORS.annelida),
      cls('Siboglinidae', 'Vermi dei vulcani sottomarini', [leaf('Vermi dei vulcani sottomarini', '', { color: COLORS.annelida })], COLORS.annelida),
    ], COLORS.annelida),

    phylum('Arthropoda', 'Insetti, aracnidi, crostacei e miriapodi.', [
      cls('Insecta', 'Insetti e grandi ordini terrestri', [
        order('Coleoptera', 'Coleotteri', [
          cluster('Lucanidae & Scarabaeidae', [], { color: COLORS.insecta, matchAny: [{ fam: 'Lucanidae' }, { fam: 'Scarabaeidae' }] }),
          family('Coccinellidae', '', [], COLORS.insecta),
          family('Carabidae', '', [], COLORS.insecta),
          family('Curculionidae', '', [], COLORS.insecta),
        ], COLORS.insecta),
        order('Lepidoptera', '', [], COLORS.insecta),
        order('Hymenoptera', '', [], COLORS.insecta),
        order('Diptera', '', [], COLORS.insecta),
        order('Odonata', '', [], COLORS.insecta),
        order('Mantodea', '', [], COLORS.insecta),
        order('Phasmatodea', '', [], COLORS.insecta),
        order('Orthoptera', '', [], COLORS.insecta),
        order('Blattodea', '', [], COLORS.insecta),
      ], COLORS.insecta),
      cls('Arachnida', 'Ragni, scorpioni, acari e opilioni', [
        order('Araneae', 'Ragni', [taxon('Araneomorphae', 'cluster', { ord: 'Araneae' }, [], { subtitle: 'Sottordine: ragni moderni', color: COLORS.arachnida }), taxon('Mygalomorphae', 'cluster', { ord: 'Araneae' }, [], { subtitle: 'Sottordine: tarantole e affini', color: COLORS.arachnida })], COLORS.arachnida),
        order('Scorpiones', 'Scorpioni', [leaf('Scorpioni scavatori', '', { color: COLORS.arachnida }), leaf('Scorpioni arboricoli', '', { color: COLORS.arachnida })], COLORS.arachnida),
        order('Acari', '', [], COLORS.arachnida),
        order('Opiliones', '', [], COLORS.arachnida),
      ], COLORS.arachnida),
      cls('Crustacea', 'Crostacei marini, terrestri e minori', [
        order('Decapoda', 'Granchi, aragoste e gamberi', [taxon('Brachyura', 'cluster', { ord: 'Decapoda' }, [], { subtitle: 'Granchi', color: COLORS.crustacea }), taxon('Astacidea', 'cluster', { ord: 'Decapoda' }, [], { subtitle: 'Astici e gamberi di fiume', color: COLORS.crustacea }), taxon('Achelata', 'cluster', { ord: 'Decapoda' }, [], { subtitle: 'Aragoste', color: COLORS.crustacea })], COLORS.crustacea),
        order('Isopoda', '', [], COLORS.crustacea),
        order('Cirripedia', '', [], COLORS.crustacea),
        order('Amphipoda', '', [], COLORS.crustacea),
        cluster('Crustacea Minori', [cls('Branchiopoda', '', [], COLORS.crustacea), cls('Ostracoda', '', [], COLORS.crustacea)], { color: COLORS.crustacea }),
      ], COLORS.crustacea),
      cls('Myriapoda', 'Centopiedi e millepiedi', [order('Chilopoda', 'Centopiedi', [], COLORS.arthropoda), order('Diplopoda', 'Millepiedi', [], COLORS.arthropoda)], COLORS.arthropoda),
      cluster('Arthropoda Extra', [
        cluster('Relitti Marini', [order('Xiphosura', 'Limuli', [], COLORS.arthropoda), cls('Pycnogonida', 'Ragni di mare', [], COLORS.arthropoda)], { color: COLORS.arthropoda }),
        cluster('Entognatha', [order('Collembola', '', [], COLORS.arthropoda), order('Diplura', '', [], COLORS.arthropoda), order('Protura', '', [], COLORS.arthropoda)], { color: COLORS.arthropoda }),
      ], { color: COLORS.arthropoda }),
    ], COLORS.arthropoda),

    phylum('Mollusca', 'Gasteropodi, cefalopodi, bivalvi e forme primitive.', [
      cls('Gastropoda', 'Chiocciole, lumache e conchiglie iconiche', [
        family('Helicidae', 'Chiocciole terrestri comuni', [leaf('Chiocciole terrestri comuni')], COLORS.mollusca),
        family('Limacidae', 'Lumache terrestri senza guscio', [leaf('Lumache terrestri senza guscio')], COLORS.mollusca),
        taxon('Nudibranchia', 'order', { ord: 'Nudibranchia' }, [leaf('Lumache di mare'), leaf('Colori incredibili'), leaf('Amate dai sub')], { color: COLORS.mollusca }),
        family('Cypraeidae', 'Porcellane: conchiglie lucide tra le più collezionate', [leaf('Porcellane'), leaf('Conchiglie lucide più collezionate al mondo')], COLORS.mollusca),
        family('Conidae', 'Coni marini famosi per veleno e conchiglie', [leaf('Coni marini'), leaf('Famosi per il veleno'), leaf('Bellezza delle conchiglie')], COLORS.mollusca),
        family('Muricidae', 'Murici', [leaf('Murici')], COLORS.mollusca),
        family('Haliotidae', 'Orecchie di mare, abalone', [leaf('Orecchie di mare (Abalone)')], COLORS.mollusca),
      ], COLORS.mollusca),
      cls('Cephalopoda', 'Polpi, seppie, calamari e forme abissali', [
        family('Octopodidae', 'Polpi', [leaf('Polpi')], COLORS.mollusca),
        family('Sepiidae', 'Seppie', [leaf('Seppie')], COLORS.mollusca),
        family('Loliginidae', 'Calamari, distinti da polpi e seppie', [leaf('Calamari'), leaf('Forma distintiva dai polpi e seppie')], COLORS.mollusca),
        family('Nautilidae', 'Nautilus, fossili viventi', [leaf('Nautilus'), leaf('"Fossile vivente"')], COLORS.mollusca),
        cluster('Cefalopodi Leggendari', [
          family('Architeuthidae', 'Calamari giganti', [leaf('Calamari giganti')], COLORS.mollusca),
          family('Vampyroteuthidae', 'Calamaro vampiro e abitanti degli abissi', [leaf('Calamaro vampiro'), leaf('Abitanti degli abissi')], COLORS.mollusca),
        ], { color: COLORS.mollusca, kind: 'editorial', subtitle: 'Calamari giganti, calamaro vampiro e forme abissali iconiche.', matchAny: [{ fam: 'Architeuthidae' }, { fam: 'Vampyroteuthidae' }, { gen: 'Architeuthis' }, { gen: 'Vampyroteuthis' }] }),
      ], COLORS.mollusca),
      cls('Bivalvia', 'Cozze, vongole, ostriche e bivalvi speciali', [
        family('Mytilidae', 'Cozze', [leaf('Cozze')], COLORS.mollusca),
        family('Veneridae', 'Vongole e lupini', [leaf('Vongole'), leaf('Lupini')], COLORS.mollusca),
        family('Ostreidae', 'Ostriche', [leaf('Ostriche')], COLORS.mollusca),
        family('Pectinidae', 'Capesante', [leaf('Capesante')], COLORS.mollusca),
        cluster('Bivalvi Speciali', [family('Tridacnidae', 'Mitili giganti e vongole giganti della barriera', [leaf('Mitili giganti'), leaf('Vongole giganti della barriera')], COLORS.mollusca), family('Solenidae', 'Cannolicchi', [leaf('Cannolicchi')], COLORS.mollusca), family('Unionidae', "Cozze d'acqua dolce", [leaf("Cozze d'acqua dolce")], COLORS.mollusca)], { color: COLORS.mollusca }),
      ], COLORS.mollusca),
      cluster('Mollusca Extra - Forme Primitive e Scavatori', [cls('Polyplacophora', 'Chitoni', [leaf('Chitoni')], COLORS.mollusca), cls('Scaphopoda', 'Dentali', [leaf('Dentali')], COLORS.mollusca), cls('Monoplacophora', 'Molluschi ancestrali', [leaf('Molluschi ancestrali')], COLORS.mollusca), cls('Aplacophora', 'Molluschi simili a vermi senza conchiglia', [leaf('Caudofoveata'), leaf('Solenogastres'), leaf('Molluschi simili a vermi'), leaf('Senza conchiglia')], COLORS.mollusca)], { color: COLORS.mollusca }),
    ], COLORS.mollusca),

    phylum('Chordata', 'Pesci, anfibi, rettili, uccelli e mammiferi.', [
      cls('Amphibia', 'Anfibi: rane, salamandre, tritoni e cecilie', [
        order('Anura', 'Rane e rospi', [family('Dendrobatidae', 'Rane freccia: rane coloratissime dei tropici, molto iconiche per i collezionisti.', [], COLORS.amphibia), family('Hylidae', 'Raganelle: comuni e diverse da rospi e rane classiche.', [], COLORS.amphibia)], COLORS.amphibia),
        order('Caudata', 'Salamandre e tritoni', [leaf('Salamandre', '', { color: COLORS.amphibia }), leaf('Tritoni', '', { color: COLORS.amphibia }), family('Ambystomatidae', 'Axolotl', [leaf('Axolotl')], COLORS.amphibia)], COLORS.amphibia),
        cluster('Amphibia Extra', [order('Gymnophiona', 'Cecilie, anfibi serpentiformi tropicali', [leaf('Cecilie'), leaf('Anfibi serpentiformi tropicali')], COLORS.amphibia)], { color: COLORS.amphibia }),
      ], COLORS.amphibia),

      cls('Reptilia', 'Rettili, serpenti, tartarughe, coccodrilli e relitti evolutivi.', [
        cluster('Squamata - Lacertilia', [leaf('Lucertole', '', { color: COLORS.reptilia }), leaf('Iguane', '', { color: COLORS.reptilia }), leaf('Gechi', '', { color: COLORS.reptilia }), family('Varanidae', 'Varani e Drago di Komodo', [], COLORS.reptilia), family('Chamaeleonidae', 'Camaleonti', [], COLORS.reptilia)], { color: COLORS.reptilia, matchAny: [{ ord: 'Squamata' }, { fam: 'Lacertidae' }, { fam: 'Iguanidae' }, { fam: 'Gekkonidae' }, { fam: 'Varanidae' }, { fam: 'Chamaeleonidae' }] }),
        cluster('Squamata - Serpentes', [
          family('Viperidae', 'Vipere e serpenti a sonagli', [], COLORS.reptilia),
          family('Boidae', '', [], COLORS.reptilia),
          family('Pythonidae', '', [], COLORS.reptilia),
          family('Colubridae', 'Serpenti comuni e innocui', [], COLORS.reptilia),
          family('Elapidae', 'Serpenti con veleno neurotossico', [], COLORS.reptilia),
          family('Natricidae', "Le comuni bisce d'acqua", [], COLORS.reptilia),
          cluster('Serpenti Extra', [
            cluster('Serpenti Primitivi & Scavatori', [family('Anomaloepididae', 'Piccoli serpenti ciechi primitivi', [leaf('Piccoli serpenti ciechi primitivi')], COLORS.reptilia), family('Gerrhopilidae', 'Serpenti ciechi indo-pacifici', [leaf('Serpenti ciechi indo-pacifici')], COLORS.reptilia), family('Xenotyphlopidae', 'Famiglia rarissima presente solo in Madagascar', [leaf('Famiglia rarissima presente solo in Madagascar')], COLORS.reptilia), family('Loxocemidae', 'Pitone messicano nano: una sola specie nel mondo', [leaf('Pitone messicano nano (una sola specie nel mondo)')], COLORS.reptilia)], { color: COLORS.reptilia, kind: 'editorial' }),
            cluster('Specialisti Evolutivi', [family('Bolyeriidae', "Serpenti dell'Isola Mauritius", [leaf("Serpenti dell'Isola Mauritius")], COLORS.reptilia), family('Tropidophiidae', 'Boa nani dei Caraibi', [leaf('Boa nani dei Caraibi')], COLORS.reptilia), family('Xenodermatidae', 'Serpenti dalla pelle strana o tubercolata', [leaf('Serpenti dalla pelle strana o tubercolata')], COLORS.reptilia)], { color: COLORS.reptilia, kind: 'editorial' }),
            cluster('I Grandi Esclusi', [family('Lamprophiidae', 'Molte specie comuni in Africa e Asia', [leaf('Molte specie comuni in Africa e Asia')], COLORS.reptilia), family('Psammophiidae', 'Serpenti delle sabbie', [leaf('Serpenti delle sabbie')], COLORS.reptilia)], { color: COLORS.reptilia, kind: 'editorial' }),
          ], { color: COLORS.reptilia, kind: 'editorial' }),
        ], { color: COLORS.reptilia, matchAny: [{ ord: 'Squamata', fam: 'Viperidae' }, { fam: 'Boidae' }, { fam: 'Pythonidae' }, { fam: 'Colubridae' }, { fam: 'Elapidae' }, { fam: 'Natricidae' }] }),
        order('Testudines', 'Tartarughe terrestri, marine e palustri', [family('Testudinidae', 'Tartarughe terrestri', [], COLORS.reptilia), family('Cheloniidae', 'Tartarughe marine', [], COLORS.reptilia), cluster('Testudines Extra', [family('Emydidae', 'Tartarughe palustri americane ed europee', [leaf('Tartarughe palustri americane'), leaf('Tartarughe palustri europee')], COLORS.reptilia), family('Geoemydidae', 'Gruppo vastissimo, tartarughe asiatiche comuni nel commercio e nei bioparchi', [leaf('Gruppo vastissimo'), leaf('Tartarughe asiatiche'), leaf('Comuni nel commercio'), leaf('Presenti nei bioparchi')], COLORS.reptilia), family('Trionychidae', 'Tartarughe dal guscio molle', [leaf('Tartarughe dal guscio molle')], COLORS.reptilia), family('Chelydridae', 'Tartarughe azzannatrici', [leaf('Tartarughe azzannatrici')], COLORS.reptilia), family('Chelidae', 'Tartarughe collo di serpente', [leaf('Tartarughe "collo di serpente"')], COLORS.reptilia), family('Pelomedusidae', 'Tartarughe collo di serpente', [leaf('Tartarughe "collo di serpente"')], COLORS.reptilia), family('Dermochelyidae', 'Tartaruga liuto, la più grande del mondo', [leaf('Tartaruga liuto'), leaf('La più grande del mondo')], COLORS.reptilia), family('Carettochelyidae', 'Tartaruga naso di maiale', [leaf('Tartaruga "naso di maiale"')], COLORS.reptilia), family('Kinosternidae', 'Tartarughe del fango e del muschio', [leaf('Tartarughe del fango'), leaf('Tartarughe del muschio')], COLORS.reptilia)], { color: COLORS.reptilia })], COLORS.reptilia),
        order('Crocodylia', 'Coccodrilli, gaviali, alligatori e caimani', [family('Crocodylidae', '', [], COLORS.reptilia), family('Gavialidae', '', [], COLORS.reptilia), family('Alligatoridae', 'Alligatori e caimani', [leaf('Alligatori'), leaf('Caimani')], COLORS.reptilia)], COLORS.reptilia),
        cluster('Reptilia Extra', [order('Rhynchocephalia', 'Tuatara', [leaf('Tuatara')], COLORS.reptilia), order('Amphisbaenia', 'Lucertole verme', [leaf('Lucertole verme')], COLORS.reptilia)], { color: COLORS.reptilia }),
      ], COLORS.reptilia),

      cls('Aves', 'Uccelli: passeriformi, rapaci, acquatici, tropicali e marini.', [
        order('Passeriformes', 'Il gruppo più vasto', [cluster('Passeridae & Fringillidae', [leaf('Passeri'), leaf('Fringuelli'), leaf('Canarini')], { color: COLORS.aves, matchAny: [{ fam: 'Passeridae' }, { fam: 'Fringillidae' }] }), family('Corvidae', 'Corvi, gazze e ghiandaie', [leaf('Corvi'), leaf('Gazze'), leaf('Ghiandaie')], COLORS.aves), family('Hirundinidae', 'Rondini e rondoni', [leaf('Rondini'), leaf('Rondoni')], COLORS.aves), family('Paridae', 'Cince e cinciallegre', [leaf('Cince'), leaf('Cinciallegre')], COLORS.aves), family('Turdidae', 'Merli e tordi', [leaf('Merli'), leaf('Tordi')], COLORS.aves), family('Sturnidae', 'Storni', [leaf('Storni')], COLORS.aves), family('Motacillidae', 'Ballerine', [leaf('Ballerine')], COLORS.aves)], COLORS.aves),
        order('Psittaciformes', 'Pappagalli', [family('Psittacidae', 'Pappagalli classici e are', [leaf('Pappagalli classici'), leaf('Are')], COLORS.aves), family('Cacatuidae', 'Cacatua', [leaf('Cacatua')], COLORS.aves), family('Psittaculidae', 'Inseparabili e parrocchetti', [leaf('Inseparabili'), leaf('Parrocchetti')], COLORS.aves)], COLORS.aves),
        order('Accipitriformes', 'Rapaci diurni', [family('Accipitridae', 'Aquile, poiane e nibbi', [leaf('Aquile'), leaf('Poiane'), leaf('Nibbi')], COLORS.aves), family('Cathartidae', 'Avvoltoi del nuovo mondo', [leaf('Avvoltoi del nuovo mondo')], COLORS.aves), family('Pandionidae', 'Falco pescatore', [leaf('Falco pescatore')], COLORS.aves), family('Sagittariidae', 'Segretario', [leaf('Segretario')], COLORS.aves)], COLORS.aves),
        order('Pelecaniformes', 'Uccelli acquatici', [family('Ardeidae', 'Aironi e garzette', [leaf('Aironi'), leaf('Garzette')], COLORS.aves), family('Pelecanidae', 'Pellicani', [leaf('Pellicani')], COLORS.aves), family('Threskiornithidae', 'Ibis e spatole', [leaf('Ibis'), leaf('Spatole')], COLORS.aves)], COLORS.aves),
        cluster('Giganti Non Volatori', [order('Struthioniformes', 'Struzzi', [leaf('Struzzi')], COLORS.aves), order('Casuariiformes', 'Emù e casuari', [leaf('Emù'), leaf('Casuari')], COLORS.aves)], { color: COLORS.aves, kind: 'editorial', matchAny: [{ ord: 'Struthioniformes' }, { ord: 'Casuariiformes' }] }),
        cluster('Specialisti Marini', [order('Sphenisciformes', 'Pinguini', [leaf('Pinguini')], COLORS.aves), order('Procellariiformes', 'Albatros', [leaf('Albatros')], COLORS.aves)], { color: COLORS.aves, kind: 'editorial', matchAny: [{ ord: 'Sphenisciformes' }, { ord: 'Procellariiformes' }] }),
        cluster('Colori Tropicali', [order('Phoenicopteriformes', 'Fenicotteri', [leaf('Fenicotteri')], COLORS.aves), family('Trochilidae', 'Colibrì', [leaf('Colibrì')], COLORS.aves), family('Ramphastidae', 'Tucani', [leaf('Tucani')], COLORS.aves), order('Bucerotiformes', 'Hornbills', [leaf('Hornbills')], COLORS.aves)], { color: COLORS.aves, kind: 'editorial', matchAny: [{ fam: 'Trochilidae' }, { fam: 'Ramphastidae' }, { ord: 'Phoenicopteriformes' }, { ord: 'Bucerotiformes' }] }),
        order('Strigiformes', 'Rapaci notturni', [family('Tytonidae', 'Barbagianni', [leaf('Barbagianni')], COLORS.aves), family('Strigidae', 'Gufi, civette e assioli', [leaf('Gufi'), leaf('Civette'), leaf('Assioli')], COLORS.aves)], COLORS.aves),
        order('Piciformes', 'Picchi', [leaf('Picchi')], COLORS.aves),
        order('Coraciiformes', 'Martin pescatori', [leaf('Martin Pescatori')], COLORS.aves),
      ], COLORS.aves),

      cls('Actinopterygii', 'Pesci ossei Animaldex, inclusa la sezione divulgativa Pisces.', [], COLORS.pisces),
      cluster('Pisces', [
        order('Perciformes', 'Perciformi marini e costieri', [family('Scombridae', 'Tonni e sgombri', [leaf('Tonni'), leaf('Sgombri')], COLORS.pisces), family('Serranidae', 'Cernie', [leaf('Cernie')], COLORS.pisces), family('Pomacentridae', 'Pesci pagliaccio e damigelle', [leaf('Pesci Pagliaccio'), leaf('Damigella')], COLORS.pisces), family('Sparidae', 'Orate, saraghi e dentici', [leaf('Orate'), leaf('Saraghi'), leaf('Dentici')], COLORS.pisces), family('Labridae', 'Tordi di mare e donzelle', [leaf('Tordi di mare'), leaf('Donzelle')], COLORS.pisces), family('Mullidae', 'Triglie', [leaf('Triglie')], COLORS.pisces), family('Scaridae', 'Pesci pappagallo', [leaf('Pesci Pappagallo')], COLORS.pisces)], COLORS.pisces),
        cluster('Ordini Marini Extra', [cluster('Forme Insolite', [family('Syngnathidae', 'Cavallucci e pesci ago', [leaf('Cavallucci'), leaf('Pesci ago')], COLORS.pisces), family('Tetraodontidae', 'Pesci palla e pesci istrice', [leaf('Pesci palla'), leaf('Pesci istrice')], COLORS.pisces), family('Diodontidae', '', [], COLORS.pisces)], { color: COLORS.pisces }), cluster('Predatori Serpentiformi', [family('Muraenidae', 'Murene', [leaf('Murene')], COLORS.pisces), family('Anguillidae', 'Anguille', [leaf('Anguille')], COLORS.pisces), family('Congridae', 'Gronghi', [leaf('Gronghi')], COLORS.pisces)], { color: COLORS.pisces }), cluster('Abissi & Fossili Viventi', [order('Coelacanthiformes', 'Celacanti', [leaf('Celacanti')], COLORS.pisces), order('Lophiiformes', 'Rane pescatrici e pesci lanterna', [leaf('Rane pescatrici'), leaf('Pesci lanterna')], COLORS.pisces)], { color: COLORS.pisces })], { color: COLORS.pisces }),
        family('Salmonidae', 'Salmoni e trote', [leaf('Salmoni'), leaf('Trote')], COLORS.pisces),
        order('Siluriformes', 'Pesci gatto', [leaf('Pesci gatto')], COLORS.pisces),
        order('Cypriniformes', 'Ciprinidi e affini', [family('Cyprinidae', 'Carpe, carassi e barbi', [leaf('Carpe'), leaf('Carassi'), leaf('Barbi')], COLORS.pisces), family('Cobitidae', '', [], COLORS.pisces), family('Balitoridae', '', [], COLORS.pisces)], COLORS.pisces),
        cluster('Selachii', [family('Lamnidae', 'Squalo bianco e mako', [leaf('Squalo bianco'), leaf('Mako')], COLORS.pisces), family('Carcharhinidae', 'Squalo tigre e squalo toro', [leaf('Squalo tigre'), leaf('Squalo toro')], COLORS.pisces), family('Sphyrnidae', 'Squali martello', [leaf('Squali martello')], COLORS.pisces), family('Rhincodontidae', 'Squalo balena', [leaf('Squalo balena')], COLORS.pisces), cluster('Batoidea', [family('Myliobatidae', 'Mante e aquile di mare', [leaf('Mante'), leaf('Aquile di mare')], COLORS.pisces), family('Dasyatidae', 'Trigoni', [leaf('Trigoni')], COLORS.pisces)], { color: COLORS.pisces })], { color: COLORS.pisces, matchAny: [{ cls: 'Elasmobranchii' }, { fam: 'Lamnidae' }, { fam: 'Carcharhinidae' }, { fam: 'Sphyrnidae' }, { fam: 'Rhincodontidae' }, { fam: 'Myliobatidae' }, { fam: 'Dasyatidae' }] }),
      ], { color: COLORS.pisces, matchAny: [{ cls: 'Actinopterygii' }, { cls: 'Elasmobranchii' }, { cls: 'Coelacanthi' }] }),

      cls('Mammalia', 'Mammiferi: predatori, primati, cetacei, roditori, ungulati e altri ordini.', [
        cluster('Extra Mammals', ['Monotremata','Pholidota','Sirenia','Proboscidea','Cingulata','Pilosa','Diprotodontia','Dasyuromorphia','Peramelemorphia','Didelphimorphia','Notoryctemorphia','Paucituberculata','Microbiotheria','Scandentia','Dermoptera','Hyracoidea','Tubulidentata','Macroscelidea','Afrosoricida'].map(name => order(name, '', [], COLORS.mammalia)), { color: COLORS.mammalia }),
        order('Proboscidea', 'Elefanti', [leaf('Elefanti')], COLORS.mammalia),
        order('Diprotodontia', 'Marsupiali', [family('Macropodidae', 'Canguri e wallaby', [leaf('Canguri'), leaf('Wallaby')], COLORS.mammalia), family('Phascolarctidae', 'Koala', [leaf('Koala')], COLORS.mammalia), family('Vombatidae', 'Vombati', [leaf('Vombati')], COLORS.mammalia), family('Petauridae', 'Sugali, petauri dello zucchero', [leaf('Sugali (Petauri dello zucchero)')], COLORS.mammalia), family('Pseudocheiridae', 'Opossum australiani', [leaf('Opossum australiani')], COLORS.mammalia), family('Phalangeridae', 'Cuscus', [leaf('Cuscus')], COLORS.mammalia)], COLORS.mammalia),
        order('Carnivora', 'Predatori', [family('Felidae', 'Gatti, leoni e grandi felini', [leaf('Gatti'), leaf('Leoni')], COLORS.carnivora), family('Canidae', 'Cani e volpi', [leaf('Cani'), leaf('Volpi')], COLORS.carnivora), family('Ursidae', 'Orsi', [leaf('Orsi')], COLORS.carnivora), family('Mustelidae', 'Tassi e lontre', [leaf('Tassi'), leaf('Lontre')], COLORS.carnivora), family('Phocidae', 'Foche', [leaf('Foche')], COLORS.carnivora), cluster('Carnivora Extra', [cluster('Predatori Terrestri Minori', [family('Hyaenidae', '', [], COLORS.carnivora), family('Viverridae', '', [], COLORS.carnivora), family('Herpestidae', '', [], COLORS.carnivora)], { color: COLORS.carnivora }), cluster('Carnivori Mascherati', [family('Procyonidae', '', [], COLORS.carnivora), family('Mephitidae', '', [], COLORS.carnivora), family('Ailuridae', '', [], COLORS.carnivora)], { color: COLORS.carnivora }), cluster('Pinnipedi Extra', [family('Otariidae', '', [], COLORS.carnivora), family('Odobenidae', '', [], COLORS.carnivora)], { color: COLORS.carnivora })], { color: COLORS.carnivora })], COLORS.carnivora),
        order('Rodentia', 'Roditori', [family('Muridae', 'Topi e ratti', [leaf('Topi'), leaf('Ratti')], COLORS.mammalia), family('Sciuridae', 'Scoiattoli e marmotte', [leaf('Scoiattoli'), leaf('Marmotte')], COLORS.mammalia), family('Caviidae', "Capibara e porcellini d'India", [leaf('Capibara'), leaf("Porcellini d'India")], COLORS.mammalia), cluster('Rodentia Extra', [cluster('Architetti & Fossori', [family('Castoridae', '', [], COLORS.mammalia), family('Geomyidae', '', [], COLORS.mammalia), family('Spalacidae', '', [], COLORS.mammalia)], { color: COLORS.mammalia }), cluster('Roditori Spinosi & Esotici', [family('Hystricidae', '', [], COLORS.mammalia), family('Erethizontidae', '', [], COLORS.mammalia), family('Chinchillidae', '', [], COLORS.mammalia)], { color: COLORS.mammalia }), cluster('Piccoli Dormienti', [family('Gliridae', '', [], COLORS.mammalia), family('Cricetidae', '', [], COLORS.mammalia), family('Dipodidae', '', [], COLORS.mammalia)], { color: COLORS.mammalia })], { color: COLORS.mammalia })], COLORS.mammalia),
        cluster('Ungulata', [family('Equidae', 'Cavalli e zebre', [leaf('Cavalli'), leaf('Zebre')], COLORS.mammalia), family('Bovidae', 'Mucche e antilopi', [leaf('Mucche'), leaf('Antilopi')], COLORS.mammalia), family('Cervidae', 'Cervi e alci', [leaf('Cervi'), leaf('Alci')], COLORS.mammalia), family('Suidae', 'Maiali e cinghiali', [leaf('Maiali'), leaf('Cinghiali')], COLORS.mammalia), family('Giraffidae', 'Giraffe', [leaf('Giraffe')], COLORS.mammalia), cluster('Ungulata Extra', [cluster('Giganti & Corazzati', [family('Rhinocerotidae', '', [], COLORS.mammalia), family('Hippopotamidae', '', [], COLORS.mammalia), family('Tapiridae', '', [], COLORS.mammalia)], { color: COLORS.mammalia }), cluster('Esotici del Deserto', [family('Camelidae', '', [], COLORS.mammalia), family('Antilocapridae', '', [], COLORS.mammalia)], { color: COLORS.mammalia }), cluster('Piccoli Ruminanti', [family('Tragulidae', '', [], COLORS.mammalia), family('Moschidae', '', [], COLORS.mammalia)], { color: COLORS.mammalia })], { color: COLORS.mammalia })], { color: COLORS.mammalia, matchAny: [{ fam: 'Equidae' }, { fam: 'Bovidae' }, { fam: 'Cervidae' }, { fam: 'Suidae' }, { fam: 'Giraffidae' }, { fam: 'Rhinocerotidae' }, { fam: 'Hippopotamidae' }, { fam: 'Tapiridae' }, { fam: 'Camelidae' }, { fam: 'Antilocapridae' }, { fam: 'Tragulidae' }, { fam: 'Moschidae' }] }),
        order('Primates', 'Primati', [family('Hominidae', 'Umani', [leaf('Umani')], COLORS.primates), family('Cercopithecidae', 'Babbuini e macachi', [leaf('Babbuini'), leaf('Macachi')], COLORS.primates), family('Lemuridae', 'Lemuri', [leaf('Lemuri')], COLORS.primates), cluster('Primates Extra', [cluster('Scimmie del Nuovo Mondo', [family('Cebidae', '', [], COLORS.primates), family('Atelidae', '', [], COLORS.primates), family('Callitrichidae', '', [], COLORS.primates)], { color: COLORS.primates }), cluster('Primati Notturni & Primitivi', [family('Lorisidae', '', [], COLORS.primates), family('Galagidae', '', [], COLORS.primates), family('Tarsiidae', '', [], COLORS.primates), family('Daubentoniidae', '', [], COLORS.primates)], { color: COLORS.primates }), cluster('Piccole Grandi Scimmie', [family('Hylobatidae', '', [], COLORS.primates)], { color: COLORS.primates })], { color: COLORS.primates })], COLORS.primates),
        order('Cetacea', 'Cetacei', [family('Delphinidae', 'Delfini, orche e grandi scimmie editoriali', [leaf('Delfini'), leaf('Orche'), leaf('Grandi Scimmie')], COLORS.cetacea), family('Balaenopteridae', 'Balenottere', [leaf('Balenottere')], COLORS.cetacea), family('Physeteridae', 'Capodogli', [leaf('Capodogli')], COLORS.cetacea), cluster('Cetacea Extra', [cluster('Cetacei Artici & Rari', [family('Monodontidae', '', [], COLORS.cetacea), family('Phocoenidae', '', [], COLORS.cetacea)], { color: COLORS.cetacea }), cluster('Balene Antiche', [family('Balaenidae', '', [], COLORS.cetacea), family('Neobalaenidae', '', [], COLORS.cetacea)], { color: COLORS.cetacea }), cluster('Zifiidi', [family('Ziphiidae', '', [], COLORS.cetacea)], { color: COLORS.cetacea })], { color: COLORS.cetacea })], COLORS.cetacea),
        order('Chiroptera', 'Pipistrelli', [family('Pteropodidae', 'Volpi volanti', [leaf('Volpi volanti')], COLORS.chiroptera), family('Vespertilionidae', 'Pipistrelli comuni', [leaf('Pipistrelli comuni')], COLORS.chiroptera), cluster('Chiroptera Extra', [cluster('Specialisti del Volto', [family('Rhinolophidae', '', [], COLORS.chiroptera), family('Hipposideridae', '', [], COLORS.chiroptera)], { color: COLORS.chiroptera }), cluster('Vampiri & Tropicali', [family('Phyllostomidae', '', [], COLORS.chiroptera), family('Molossidae', '', [], COLORS.chiroptera)], { color: COLORS.chiroptera })], { color: COLORS.chiroptera })], COLORS.chiroptera),
        order('Eulipotyphla', 'Insettivori', [family('Erinaceidae', 'Ricci', [leaf('Ricci')], COLORS.mammalia), family('Talpidae', 'Talpe', [leaf('Talpe')], COLORS.mammalia), cluster('Insettivori Extra', [cluster('Cacciatori Frenetici', [family('Soricidae', 'Toporagni', [leaf('Toporagni')], COLORS.mammalia)], { color: COLORS.mammalia }), cluster('Relitti Evolutivi', [family('Solenodontidae', 'Solenodonti dei Caraibi', [leaf('Solenodonti dei Caraibi')], COLORS.mammalia), family('Nesophontidae', 'Toporagni delle Antille', [leaf('Toporagni delle Antille')], COLORS.mammalia)], { color: COLORS.mammalia })], { color: COLORS.mammalia })], COLORS.mammalia),
        order('Lagomorpha', 'Lepri e pika', [family('Leporidae', 'Lepri e conigli', [leaf('Lepri'), leaf('Conigli')], COLORS.mammalia), family('Ochotonidae', 'Pika, fischiatori delle montagne', [leaf('Pika'), leaf('Fischiatori delle montagne')], COLORS.mammalia)], COLORS.mammalia),
      ], COLORS.mammalia),
    ], COLORS.chordata),
  ],
});

export function flattenTree(root = TAXONOMY_TREE) {
  const out = [];
  const visit = (n, parent = null, depth = 0) => {
    out.push({ ...n, parentId: parent?.id || null, depth });
    (n.children || []).forEach(child => visit(child, n, depth + 1));
  };
  visit(root);
  return out;
}

export function getNodeById(id, root = TAXONOMY_TREE) {
  if (!id) return null;
  if (root.id === id) return root;
  for (const child of root.children || []) {
    const found = getNodeById(id, child);
    if (found) return found;
  }
  return null;
}

export function getNodePath(id, root = TAXONOMY_TREE) {
  const walk = (n, path) => {
    const next = [...path, n];
    if (n.id === id) return next;
    for (const child of n.children || []) {
      const found = walk(child, next);
      if (found) return found;
    }
    return null;
  };
  return walk(root, []) || [root];
}

const getAnimalField = (animal, key) => {
  if (!animal || !key) return '';
  const aliases = { kin: ['kin', 'kingdom'], phy: ['phy', 'phylum'], cls: ['cls', 'class'], ord: ['ord', 'order'], fam: ['fam', 'family'], gen: ['gen', 'genus'] };
  const keys = aliases[key] || [key];
  return keys.map(k => animal[k]).find(v => v !== undefined && v !== null && String(v).trim() !== '') || '';
};

export function matchRuleMatchesAnimal(rule, animal) {
  if (!rule || !animal) return false;
  return Object.entries(rule).every(([key, expected]) => {
    const actual = getAnimalField(animal, key);
    return String(actual || '').trim().toLowerCase() === String(expected || '').trim().toLowerCase();
  });
}

export function nodeMatchesAnimal(node, animal) {
  if (!node || !animal) return false;
  if (node.match && matchRuleMatchesAnimal(node.match, animal)) return true;
  if (Array.isArray(node.matchAny) && node.matchAny.some(rule => matchRuleMatchesAnimal(rule, animal))) return true;
  return false;
}

export function getAnimalsForNode(node, animals = []) {
  if (!node) return [];
  const byId = new Map();
  const add = (animal) => {
    if (!animal) return;
    byId.set(String(animal.id || animal.sci || animal.com), animal);
  };
  if (node.match || node.matchAny) {
    animals.filter(animal => nodeMatchesAnimal(node, animal)).forEach(add);
  }
  (node.children || []).forEach(child => getAnimalsForNode(child, animals).forEach(add));
  return Array.from(byId.values());
}

const parseNumeric = (value) => {
  const text = String(value || '').replace(',', '.');
  const nums = (text.match(/\d+(?:\.\d+)?/g) || []).map(Number).filter(Number.isFinite);
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

const countBy = (items, key) => items.reduce((acc, item) => {
  const value = item?.[key] || 'Dato non disponibile';
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});

const topEntry = (obj) => Object.entries(obj || {}).sort((a, b) => b[1] - a[1])[0] || null;
const conservationRank = { EX: 8, EW: 7, CR: 6, EN: 5, VU: 4, NT: 3, DD: 2, LC: 1, NE: 0 };

export function getNodeStats(node, animals = []) {
  const linked = getAnimalsForNode(node, animals);
  const total = linked.length;
  const captured = linked.filter(a => String(a.status || '').toLowerCase() === 'catturato').length;
  const seen = linked.filter(a => String(a.status || '').toLowerCase() === 'avvistato').length;
  const searched = linked.filter(a => String(a.status || '').toLowerCase() === 'ricercato').length;
  const mystery = linked.filter(a => String(a.status || '').toLowerCase() === 'misterioso').length;
  const rarityDistribution = countBy(linked, 'rarity');
  const conservationDistribution = countBy(linked, 'cons');
  const withLength = linked.map(a => ({ animal: a, value: parseNumeric(a.ln || a.len || a.length) })).filter(x => x.value !== null).sort((a, b) => b.value - a.value);
  const withWeight = linked.map(a => ({ animal: a, value: parseNumeric(a.wt || a.weight) })).filter(x => x.value !== null).sort((a, b) => b.value - a.value);
  const threatened = [...linked].filter(a => a.cons).sort((a, b) => (conservationRank[b.cons] || 0) - (conservationRank[a.cons] || 0))[0] || null;
  const childCounts = (node.children || []).map(child => ({ child, count: getAnimalsForNode(child, animals).length })).sort((a, b) => b.count - a.count);
  return {
    total,
    captured,
    seen,
    searched,
    mystery,
    completion: total ? Math.round((captured / total) * 100) : 0,
    rarityDistribution,
    conservationDistribution,
    dominantRarity: topEntry(rarityDistribution)?.[0] || 'Dato non disponibile',
    criticalConservation: threatened?.cons || 'Dato non disponibile',
    largestAnimal: withLength[0]?.animal || null,
    heaviestAnimal: withWeight[0]?.animal || null,
    mostThreatenedAnimal: threatened,
    mostPopulatedChild: childCounts[0] || null,
  };
}

export function getSimpleTaxFilterForNode(node) {
  const match = node?.match;
  if (!match || Object.keys(match).length !== 1) return null;
  const [key, value] = Object.entries(match)[0];
  if (!['kin', 'phy', 'cls', 'ord', 'fam', 'gen'].includes(key)) return null;
  return { key, value, label: `${key}: ${value}` };
}

