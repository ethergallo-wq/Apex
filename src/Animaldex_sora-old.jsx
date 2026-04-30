import { useState, useEffect, useMemo, useRef } from "react";

// ── Config ────────────────────────────────────────────────────────────
const CLS = {
  Mammalia:       { mid:'#7D5E18', img:'#A07830', badge:'#3A2808', accent:'#F0C84E', detailTop:'#5A3A0A', detailBg:'#3A2206', label:'Mammifero',    icon:'🦁' },
  Aves:           { mid:'#1A5080', img:'#2A72A8', badge:'#0A1E3A', accent:'#5BBEF8', detailTop:'#0E3458', detailBg:'#081E38', label:'Uccello',       icon:'🦅' },
  Reptilia:       { mid:'#4A7A20', img:'#62A030', badge:'#243E0A', accent:'#90D84A', detailTop:'#2E5A10', detailBg:'#1A3808', label:'Rettile',       icon:'🦎' },
  Amphibia:       { mid:'#186860', img:'#228A7A', badge:'#083430', accent:'#4ED8BE', detailTop:'#0E4840', detailBg:'#082E28', label:'Anfibio',       icon:'🐸' },
  Actinopterygii: { mid:'#1C3A80', img:'#2A52A8', badge:'#0C1840', accent:'#6088F8', detailTop:'#102258', detailBg:'#081438', label:'Pesce',         icon:'🐟' },
  Insecta:        { mid:'#885820', img:'#A87030', badge:'#442C10', accent:'#F0A840', detailTop:'#603A10', detailBg:'#3A2008', label:'Insetto',       icon:'🦋' },
  Arachnida:      { mid:'#782020', img:'#982828', badge:'#3A0C0C', accent:'#F06060', detailTop:'#541414', detailBg:'#340A0A', label:'Aracnide',      icon:'🕷️' },
  Malacostraca:   { mid:'#883020', img:'#A84028', badge:'#441810', accent:'#F07850', detailTop:'#602010', detailBg:'#3A1408', label:'Crostaceo',     icon:'🦀' },
  Anthozoa:       { mid:'#782060', img:'#982878', badge:'#3A0C30', accent:'#F060B8', detailTop:'#541848', detailBg:'#340A2C', label:'Corallo',       icon:'🪸' },
  Asteroidea:     { mid:'#886020', img:'#A87A28', badge:'#443010', accent:'#F0B840', detailTop:'#604010', detailBg:'#3A2808', label:'Stella Marina', icon:'⭐' },
};
const CONS = {
  EX: { lbl:'EX', full:'Extinct',                 c:'#FFFFFF', bg:'#1A1A1A' },
  EW: { lbl:'EW', full:'Extinct in the Wild',     c:'#FFFFFF', bg:'#1A1A1A' },
  CR: { lbl:'CR', full:'Critically Endangered',   c:'#FFFFFF', bg:'#DC143C' },
  EN: { lbl:'EN', full:'Endangered',              c:'#000000', bg:'#FF8C00' },
  VU: { lbl:'VU', full:'Vulnerable',              c:'#000000', bg:'#FFD700' },
  NT: { lbl:'NT', full:'Near Threatened',         c:'#FFFFFF', bg:'#20B2AA' },
  LC: { lbl:'LC', full:'Least Concern',           c:'#FFFFFF', bg:'#008B8B' },
  DD: { lbl:'DD', full:'Data Deficient',          c:'#FFFFFF', bg:'#808080' },
};
const RARITY = {
  'Comune':      { c:'#F5DEB3', bg:'#5C3310', s:1, label:'Comune' },
  'Non comune':  { c:'#E8E8E8', bg:'#5A5A5A', s:2, label:'Non comune' },
  'Raro':        { c:'#FFE566', bg:'#7A5800', s:3, label:'Raro', glow:true },
  'Leggendario': { c:'#EAC8FF', bg:'#3D0070', s:4, label:'Leggendario', animate:true },
};
const TROPHIC = {
  1:{ label:'Produttore',      c:'#5CC85A', bg:'#1A3B19' },
  2:{ label:'Erbivoro',        c:'#A8D84A', bg:'#283B14' },
  3:{ label:'Predatore',       c:'#F5A828', bg:'#3B2205' },
  4:{ label:'Predatore Apice', c:'#F55454', bg:'#3B0B0B' },
  D:{ label:'Decomponente',    c:'#9E7CF5', bg:'#20153B' },
  F:{ label:'Filtratore',      c:'#5BB8F5', bg:'#0A1E3B' },
};

const ANIMALS = [
  { id:1,no:'001',sci:'Panthera leo',com:'Leone',cls:'Mammalia',ord:'Carnivora',fam:'Felidae',gen:'Panthera',phy:'Chordata',kin:'Animalia',cons:'VU',rarity:'Raro',wt:'120–250 kg',ln:'170–250 cm',status:'avvistato',trophic:4,
    desc:'Felide maestoso e il grande predatore africano più importante. Unico felide veramente sociale.',
    bio:'Maschio con criniera imponente, vive in branchi. Caccia coordinate e dorme fino a 20 ore al giorno.',
    ety:'"Panthera" dal greco "panther". "Leo" dal latino leone.',
    stats:{velocita:60,resistenza:65,forza:75,intelligenza:58,morso:650,agilita:68},
    hab:['savana','praterie','bosco'],
    distribution:{countries_present:['AO','BJ','BW','CM','CF','TD','CG','CD','EG','GA','GH','GN','KE','LR','MW','MZ','NA','NG','SD','SN','ZA','SS','TZ','ZM','ZW'],wild_observations:1247,captive_removed:145,total_observations:1392} },
  { id:2,no:'002',sci:'Ursus arctos',com:'Orso bruno',cls:'Mammalia',ord:'Carnivora',fam:'Ursidae',gen:'Ursus',phy:'Chordata',kin:'Animalia',cons:'LC',rarity:'Non comune',wt:'130–360 kg',ln:'180–280 cm',status:'fotografato',trophic:3,
    desc:'Grande onnivoro del nord emisfero con forza incredibile. Uno dei carnivori terrestri più importanti.',
    bio:'Letargo profondo d\'inverno. Solitario tranne in periodo riproduttivo. Onnivoro opportunista.',
    ety:'"Ursus" dal latino orso. "Arctos" dal greco orso.',
    stats:{velocita:56,resistenza:80,forza:88,intelligenza:61,morso:1200,agilita:52},
    hab:['foresta','montagna','tundra'],
    distribution:{countries_present:['AT','BA','BG','CA','HR','CZ','FI','FR','DE','HU','JP','LV','LT','PL','RO','RU','RS','SK','ES','SE','TR','US'],wild_observations:3892,captive_removed:267,total_observations:4159} },
  { id:3,no:'003',sci:'Canis lupus',com:'Lupo grigio',cls:'Mammalia',ord:'Carnivora',fam:'Canidae',gen:'Canis',phy:'Chordata',kin:'Animalia',cons:'LC',rarity:'Non comune',wt:'25–80 kg',ln:'100–160 cm',status:'avvistato',trophic:4,
    desc:'Canide selvaggio capostipite del cane domestico. Predatore apicale cruciale per ecosistemi.',
    bio:'Vive in branchi gerarchici. Comunicazione complessa con ululati. Migratore fino a 40 km al giorno.',
    ety:'"Canis" dal latino cane. "Lupus" dal latino lupo.',
    stats:{velocita:65,resistenza:85,forza:70,intelligenza:75,morso:400,agilita:78},
    hab:['foresta','tundra','praterie','montagna'],
    distribution:{countries_present:['AL','AT','BY','BG','CA','HR','CZ','EE','FI','FR','DE','GR','HU','IT','LV','LT','MN','PL','RO','RU','RS','SK','ES','SE','TR','UA','US'],wild_observations:4156,captive_removed:89,total_observations:4245} },
  { id:4,no:'004',sci:'Phasianus colchicus',com:'Fagiano di Colchide',cls:'Aves',ord:'Galliformes',fam:'Phasianidae',gen:'Phasianus',phy:'Chordata',kin:'Animalia',cons:'LC',rarity:'Comune',wt:'0.7–1.5 kg',ln:'50–90 cm',status:'fotografato',trophic:2,
    desc:'Fagiano bellissimo con coda lunga iridescente. Uno dei volatili più apprezzati per la caccia.',
    bio:'Maschio con piumaggio spettacolare, femmina criptica. Saltella nel sottobosco. Monogamo stagionale.',
    ety:'"Phasianus" dal latino fagiano. "Colchicus" da Colchide (Georgia).',
    stats:{velocita:25,resistenza:45,forza:8,intelligenza:30,morso:5,agilita:72},
    hab:['bosco','praterie','coltivi','arbusti'],
    distribution:{countries_present:['AU','AT','BE','BG','CA','HR','CZ','DK','FR','DE','GR','HU','IE','IT','NZ','NO','PL','RO','RU','SK','ES','SE','TR','UA','GB','US'],wild_observations:8934,captive_removed:456,total_observations:9390} },
  { id:5,no:'005',sci:'Tachyglossus aculeatus',com:'Echidna dalle spine corte',cls:'Mammalia',ord:'Monotremata',fam:'Tachyglossidae',gen:'Tachyglossus',phy:'Chordata',kin:'Animalia',cons:'LC',rarity:'Non comune',wt:'2–5 kg',ln:'30–45 cm',status:'non_visto',trophic:3,
    desc:'Monotrema anomalo che depone uova. Snout specializzato per mangiare formiche. Spine difensive.',
    bio:'Metabolismo basso. Letargo invernale. Lingua lunga fino a 25 cm per estrarre insetti.',
    ety:'"Tachyglossus" dal greco tachi (veloce) + glossus (lingua). "Aculeatus" = spinoso.',
    stats:{velocita:10,resistenza:50,forza:18,intelligenza:35,morso:15,agilita:28},
    hab:['foresta','bosco','scrubland','pianure'],
    distribution:{countries_present:['AU','ID','PG'],wild_observations:2345,captive_removed:78,total_observations:2423} },
  { id:6,no:'006',sci:'Octopus vulgaris',com:'Polpo comune',cls:'Cephalopoda',ord:'Octopoda',fam:'Octopodidae',gen:'Octopus',phy:'Mollusca',kin:'Animalia',cons:'LC',rarity:'Non comune',wt:'0.3–5 kg',ln:'25–90 cm',status:'fotografato',trophic:4,
    desc:'Cefalopode straordinariamente intelligente con 8 braccia e straordinaria intelligenza comportamentale.',
    bio:'Maestro del camuffamento cambia colore in millisecondi. Solista notturno. Memorizza percorsi e persone.',
    ety:'"Octopus" dal greco octo (otto) + pus (piede). "Vulgaris" = comune.',
    stats:{velocita:40,resistenza:60,forza:30,intelligenza:92,morso:50,agilita:88},
    hab:['marino','costiero','roccia'],
    distribution:{countries_present:['ES','FR','GR','HR','IT','PT','ZA'],wild_observations:2847,captive_removed:34,total_observations:2881} },
  { id:7,no:'007',sci:'Aurelia aurita',com:'Medusa luna',cls:'Scyphozoa',ord:'Semaeostomeae',fam:'Ulmaridae',gen:'Aurelia',phy:'Cnidaria',kin:'Animalia',cons:'LC',rarity:'Comune',wt:'0.1–2 kg',ln:'25–40 cm',status:'fotografato',trophic:'F',
    desc:'Medusa trasparente simbolo dei mari temprati. Uno degli organismi più antichi e diffusi del pianeta.',
    bio:'Vive in acque fredde e temperate. Si riproduce per gemmazione oltre che sessualmente.',
    ety:'"Aurelia" da "aureus" (aureo). "Aurita" dal latino che ha orecchie.',
    stats:{velocita:1,resistenza:40,forza:2,intelligenza:2,morso:0,agilita:10},
    hab:['marino','pelagico','estuari'],
    distribution:{countries_present:['CA','DE','DK','GB','IE','NL','NO','PL','SE','TR'],wild_observations:1534,captive_removed:12,total_observations:1546} },
  { id:8,no:'008',sci:'Anax imperator',com:'Odorato imperatore',cls:'Insecta',ord:'Odonata',fam:'Aeshnidae',gen:'Anax',phy:'Arthropoda',kin:'Animalia',cons:'LC',rarity:'Non comune',wt:'0.01 kg',ln:'7.6 cm',status:'avvistato',trophic:3,
    desc:'Libellula elegante e veloce tra le più grandi d\'Europa. Predatore aereo straordinario e agile.',
    bio:'Maschio territoriale. Sorprende piccoli insetti in volo. Metamorfosi dall\'acqua all\'aria dura mesi.',
    ety:'"Anax" dal greco anax sovrano. "Imperator" = imperatore.',
    stats:{velocita:54,resistenza:50,forza:8,intelligenza:25,morso:2,agilita:95},
    hab:['acqua_dolce','laghi','stagni'],
    distribution:{countries_present:['AT','CH','DE','ES','FR','GB','IT','NL','SE','ZA'],wild_observations:3421,captive_removed:5,total_observations:3426} },
  { id:9,no:'009',sci:'Archilochus colubris',com:'Colibrì dalla gola di rubino',cls:'Aves',ord:'Apodiformes',fam:'Trochilidae',gen:'Archilochus',phy:'Chordata',kin:'Animalia',cons:'LC',rarity:'Leggendario',wt:'0.003 kg',ln:'7.5 cm',status:'avvistato',trophic:2,
    desc:'Uno dei più piccoli uccelli nord-americani. Metabolismo più veloce del regno animale proporzionalmente.',
    bio:'Batte le ali 53 volte al secondo. Vola in tutte le direzioni inclusa all\'indietro. Aggressivo territoriale.',
    ety:'"Archilochus" dal greco archos capo + lochos battaglia. "Colubris" dal nahuatl.',
    stats:{velocita:80,resistenza:65,forza:4,intelligenza:45,morso:1,agilita:99},
    hab:['foresta','giardino','fiori'],
    distribution:{countries_present:['CA','MX','US'],wild_observations:5678,captive_removed:2,total_observations:5680} },
  { id:10,no:'010',sci:'Dasypus novemcinctus',com:'Armadillo a 9 fasce',cls:'Mammalia',ord:'Cingulata',fam:'Dasypodidae',gen:'Dasypus',phy:'Chordata',kin:'Animalia',cons:'LC',rarity:'Comune',wt:'3–6 kg',ln:'40–70 cm',status:'avvistato',trophic:3,
    desc:'Mammifero corazzato con placche ossee intrecciate. Fossile vivente e unico dei cingolati moderni.',
    bio:'Scava gallerie profonde. Può trattenere respiro fino 6 minuti. Ha vista scarsissima ma olfatto eccellente.',
    ety:'"Dasypus" dal nahuatl. "Novemcinctus" = 9 fasce.',
    stats:{velocita:15,resistenza:40,forza:48,intelligenza:32,morso:50,agilita:25},
    hab:['foresta','praterie','bosco'],
    distribution:{countries_present:['AR','BR','CO','CR','EC','MX','US'],wild_observations:2134,captive_removed:8,total_observations:2142} },
];

const STATS_DEF = [
  {k:'velocita',l:'Velocità', u:'km/h'},{k:'morso',l:'Morso', u:'PSI'},{k:'forza',l:'Forza', u:'%'},
  {k:'resistenza',l:'Resistenza', u:'%'},{k:'intelligenza',l:'Intelligenza', u:'%'},{k:'agilita',l:'Agilità', u:'%'},
];

const STAT_MAXES = {
  velocita: 80,
  morso: 1200,
  forza: 100,
  resistenza: 100,
  intelligenza: 100,
  agilita: 100
};
const SCALE = { Min:0.7, Base:1, Max:1.3 };

// ── Rarity CSS injection ──────────────────────────────────────────────
const RARITY_CSS = `
@keyframes bronzoShine {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes argentoShine {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes oroShine {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes acquaShine {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* ── COMUNE – riflesso bronzo continuo ── */
.rarity-comune {
  background: linear-gradient(
    105deg,
    #3D1E08 0%,
    #7A4018 18%,
    #C47A35 30%,
    #F0B060 38%,
    #FFDCA0 45%,
    #F0B060 52%,
    #C47A35 60%,
    #7A4018 72%,
    #3D1E08 100%
  ) !important;
  background-size: 300% 100% !important;
  animation: bronzoShine 3.2s linear infinite !important;
  color: #FFE0AA !important;
  border: none !important;
  text-shadow: 0 1px 3px rgba(0,0,0,0.7) !important;
}

/* ── NON COMUNE – riflesso argento continuo ── */
.rarity-non-comune {
  background: linear-gradient(
    105deg,
    #3A3A3A 0%,
    #6E6E6E 15%,
    #B0B0B0 28%,
    #ECECEC 38%,
    #FFFFFF 45%,
    #ECECEC 52%,
    #B0B0B0 62%,
    #6E6E6E 75%,
    #3A3A3A 100%
  ) !important;
  background-size: 300% 100% !important;
  animation: argentoShine 3.2s linear infinite !important;
  color: #FFFFFF !important;
  border: none !important;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8) !important;
}

/* ── RARO – riflesso oro continuo + glow ── */
.rarity-raro {
  background: linear-gradient(
    105deg,
    #4A3000 0%,
    #8B5E00 15%,
    #D4A000 28%,
    #FFD700 38%,
    #FFF0A0 45%,
    #FFD700 52%,
    #D4A000 62%,
    #8B5E00 75%,
    #4A3000 100%
  ) !important;
  background-size: 300% 100% !important;
  animation: oroShine 3.2s linear infinite !important;
  color: #FFF8C0 !important;
  border: none !important;
  box-shadow: 0 0 10px rgba(255,200,0,0.55), 0 0 22px rgba(255,170,0,0.28) !important;
  text-shadow: 0 0 8px rgba(255,220,0,0.6), 0 1px 3px rgba(0,0,0,0.7) !important;
}

/* ── LEGGENDARIO – viola epico, riflesso acqua + glow ── */
.rarity-leggendario {
  background: linear-gradient(
    130deg,
    #1A0030 0%,
    #4B0082 12%,
    #7B20C8 24%,
    #A060E8 32%,
    #C8A0FF 40%,
    #E0C8FF 46%,
    #C8A0FF 52%,
    #A060E8 60%,
    #7B20C8 72%,
    #4B0082 84%,
    #1A0030 100%
  ) !important;
  background-size: 300% 300% !important;
  animation: acquaShine 4.5s ease-in-out infinite !important;
  color: #F0DAFF !important;
  border: none !important;
  box-shadow: 0 0 12px rgba(160,80,255,0.6), 0 0 28px rgba(120,40,220,0.3), inset 0 0 12px rgba(200,160,255,0.15) !important;
  text-shadow: 0 0 10px rgba(220,180,255,0.7), 0 1px 3px rgba(0,0,0,0.8) !important;
}

/* pallino rarità nella griglia */
.rarity-dot-comune     { background: linear-gradient(135deg,#C47A35,#F0B060); box-shadow: 0 0 6px rgba(196,122,53,0.7); }
.rarity-dot-non-comune { background: linear-gradient(135deg,#888,#EEE); box-shadow: 0 0 6px rgba(180,180,180,0.7); }
.rarity-dot-raro       { background: linear-gradient(135deg,#D4A000,#FFD700); box-shadow: 0 0 8px rgba(255,200,0,0.8); }
.rarity-dot-leggendario{ background: linear-gradient(135deg,#7B20C8,#C8A0FF); box-shadow: 0 0 10px rgba(160,80,255,0.85); }
`;

// ── Flag Emoji Generator ──────────────────────────────────────────────
const getFlagEmoji = (code) => {
  try {
    return String.fromCodePoint(...[...code.toUpperCase()].map(char => 127397 + char.charCodeAt(0)));
  } catch {
    return '🌍';
  }
};

// ── ISO to English Country Names ──────────────────────────────────────
const ISO_TO_EN = {
  'IT':'Italy','ES':'Spain','FR':'France','DE':'Germany','GB':'United Kingdom',
  'PT':'Portugal','NL':'Netherlands','BE':'Belgium','CH':'Switzerland','AT':'Austria',
  'SE':'Sweden','NO':'Norway','DK':'Denmark','FI':'Finland','PL':'Poland',
  'CZ':'Czech Republic','SK':'Slovakia','HU':'Hungary','RO':'Romania','BG':'Bulgaria',
  'HR':'Croatia','SI':'Slovenia','GR':'Greece','TR':'Turkey','UA':'Ukraine',
  'RU':'Russia','US':'United States','CA':'Canada','MX':'Mexico','BR':'Brazil',
  'AR':'Argentina','CL':'Chile','CO':'Colombia','PE':'Peru','VE':'Venezuela',
  'EC':'Ecuador','BO':'Bolivia','PY':'Paraguay','UY':'Uruguay','CR':'Costa Rica',
  'PA':'Panama','JM':'Jamaica','CU':'Cuba','DO':'Dominican Republic','HT':'Haiti',
  'AU':'Australia','NZ':'New Zealand','JP':'Japan','CN':'China','IN':'India',
  'ZA':'South Africa','KE':'Kenya','NG':'Nigeria','EG':'Egypt','MA':'Morocco',
  'GH':'Ghana','TZ':'Tanzania','UG':'Uganda','ET':'Ethiopia','SN':'Senegal',
  'CI':'Côte d\'Ivoire','CM':'Cameroon','ZM':'Zambia','ZW':'Zimbabwe','BW':'Botswana',
  'NA':'Namibia','AO':'Angola','MZ':'Mozambique','MW':'Malawi','BI':'Burundi',
  'RW':'Rwanda','SG':'Singapore','MY':'Malaysia','TH':'Thailand','ID':'Indonesia',
  'PH':'Philippines','VN':'Vietnam','KH':'Cambodia','LA':'Laos','MM':'Myanmar',
  'PK':'Pakistan','BD':'Bangladesh','LK':'Sri Lanka','NP':'Nepal','BT':'Bhutan',
  'KR':'South Korea','KP':'North Korea','TW':'Taiwan','MN':'Mongolia','KZ':'Kazakhstan',
  'UZ':'Uzbekistan','TJ':'Tajikistan','TM':'Turkmenistan','KG':'Kyrgyzstan','AF':'Afghanistan',
  'IR':'Iran','IQ':'Iraq','SA':'Saudi Arabia','AE':'United Arab Emirates','QA':'Qatar',
  'KW':'Kuwait','BH':'Bahrain','OM':'Oman','YE':'Yemen','IL':'Israel',
  'JO':'Jordan','LB':'Lebanon','SY':'Syria','TN':'Tunisia','DZ':'Algeria',
  'LY':'Libya','SD':'Sudan','SS':'South Sudan','SO':'Somalia','DJ':'Djibouti',
  'ER':'Eritrea','MG':'Madagascar','MU':'Mauritius','SC':'Seychelles','KM':'Comoros',
  'MR':'Mauritania','ML':'Mali','BF':'Burkina Faso','NE':'Niger','CD':'Democratic Republic of the Congo',
  'CG':'Republic of the Congo','CF':'Central African Republic','TD':'Chad','GA':'Gabon','GQ':'Equatorial Guinea',
  'STP':'São Tomé and Príncipe','LR':'Liberia','SL':'Sierra Leone','GM':'Gambia','GW':'Guinea-Bissau',
  'GN':'Guinea','BJ':'Benin','TG':'Togo','LV':'Latvia','LT':'Lithuania',
  'EE':'Estonia','BY':'Belarus','MD':'Moldova','RS':'Serbia','BA':'Bosnia and Herzegovina',
  'PR':'Puerto Rico','PG':'Papua New Guinea'
};

const COUNTRIES = [
  {code:'IT',name:'Italia'},{code:'ES',name:'Spagna'},{code:'FR',name:'Francia'},{code:'DE',name:'Germania'},{code:'GB',name:'Regno Unito'},
  {code:'PT',name:'Portogallo'},{code:'NL',name:'Paesi Bassi'},{code:'BE',name:'Belgio'},{code:'CH',name:'Svizzera'},{code:'AT',name:'Austria'},
  {code:'SE',name:'Svezia'},{code:'NO',name:'Norvegia'},{code:'DK',name:'Danimarca'},{code:'FI',name:'Finlandia'},{code:'PL',name:'Polonia'},
  {code:'CZ',name:'Repubblica Ceca'},{code:'SK',name:'Slovacchia'},{code:'HU',name:'Ungheria'},{code:'RO',name:'Romania'},{code:'BG',name:'Bulgaria'},
  {code:'HR',name:'Croazia'},{code:'SI',name:'Slovenia'},{code:'GR',name:'Grecia'},{code:'TR',name:'Turchia'},{code:'UA',name:'Ucraina'},
  {code:'RU',name:'Russia'},{code:'US',name:'Stati Uniti'},{code:'CA',name:'Canada'},{code:'MX',name:'Messico'},{code:'BR',name:'Brasile'},
  {code:'AR',name:'Argentina'},{code:'CL',name:'Cile'},{code:'CO',name:'Colombia'},{code:'PE',name:'Perù'},{code:'VE',name:'Venezuela'},
  {code:'EC',name:'Ecuador'},{code:'BO',name:'Bolivia'},{code:'PY',name:'Paraguay'},{code:'UY',name:'Uruguay'},{code:'CR',name:'Costa Rica'},
  {code:'PA',name:'Panama'},{code:'JM',name:'Giamaica'},{code:'CU',name:'Cuba'},{code:'DO',name:'Repubblica Dominicana'},{code:'HT',name:'Haiti'},
  {code:'AU',name:'Australia'},{code:'NZ',name:'Nuova Zelanda'},{code:'JP',name:'Giappone'},{code:'CN',name:'Cina'},{code:'IN',name:'India'},
  {code:'ZA',name:'Sud Africa'},{code:'KE',name:'Kenya'},{code:'NG',name:'Nigeria'},{code:'EG',name:'Egitto'},{code:'MA',name:'Marocco'},
  {code:'GH',name:'Ghana'},{code:'TZ',name:'Tanzania'},{code:'UG',name:'Uganda'},{code:'ET',name:'Etiopia'},{code:'SN',name:'Senegal'},
  {code:'CI',name:'Costa d\'Avorio'},{code:'CM',name:'Camerun'},{code:'ZM',name:'Zambia'},{code:'ZW',name:'Zimbabwe'},{code:'BW',name:'Botswana'},
  {code:'NA',name:'Namibia'},{code:'AO',name:'Angola'},{code:'MZ',name:'Mozambico'},{code:'MW',name:'Malawi'},{code:'BI',name:'Burundi'},
  {code:'RW',name:'Ruanda'},{code:'SG',name:'Singapore'},{code:'MY',name:'Malesia'},{code:'TH',name:'Tailandia'},{code:'ID',name:'Indonesia'},
  {code:'PH',name:'Filippine'},{code:'VN',name:'Vietnam'},{code:'KH',name:'Cambogia'},{code:'LA',name:'Laos'},{code:'MM',name:'Myanmar'},
  {code:'PK',name:'Pakistan'},{code:'BD',name:'Bangladesh'},{code:'LK',name:'Sri Lanka'},{code:'NP',name:'Nepal'},{code:'BT',name:'Bhutan'},
  {code:'KR',name:'Corea del Sud'},{code:'KP',name:'Corea del Nord'},{code:'TW',name:'Taiwan'},{code:'MN',name:'Mongolia'},{code:'KZ',name:'Kazakistan'},
  {code:'UZ',name:'Uzbekistan'},{code:'TJ',name:'Tagikistan'},{code:'TM',name:'Turkmenistan'},{code:'KG',name:'Kirghizistan'},{code:'AF',name:'Afghanistan'},
  {code:'IR',name:'Iran'},{code:'IQ',name:'Iraq'},{code:'SA',name:'Arabia Saudita'},{code:'AE',name:'Emirati Arabi Uniti'},{code:'QA',name:'Qatar'},
  {code:'KW',name:'Kuwait'},{code:'BH',name:'Bahrein'},{code:'OM',name:'Oman'},{code:'YE',name:'Yemen'},{code:'IL',name:'Israele'},
  {code:'JO',name:'Giordania'},{code:'LB',name:'Libano'},{code:'SY',name:'Siria'},{code:'TN',name:'Tunisia'},{code:'DZ',name:'Algeria'},
  {code:'LY',name:'Libia'},{code:'SD',name:'Sudan'},{code:'SS',name:'Sud Sudan'},{code:'SO',name:'Somalia'},{code:'DJ',name:'Gibuti'},
  {code:'ER',name:'Eritrea'},{code:'MG',name:'Madagascar'},{code:'MU',name:'Mauritius'},{code:'SC',name:'Seychelles'},{code:'KM',name:'Comore'},
  {code:'MR',name:'Mauritania'},{code:'ML',name:'Mali'},{code:'BF',name:'Burkina Faso'},{code:'NE',name:'Niger'},{code:'TD',name:'Ciad'},
  {code:'CF',name:'Repubblica Centrafricana'},{code:'CG',name:'Congo'},{code:'CD',name:'Rep. Democratica del Congo'},{code:'GA',name:'Gabon'},{code:'GQ',name:'Guinea Equatoriale'},
  {code:'STP',name:'São Tomé e Príncipe'},{code:'LR',name:'Liberia'},{code:'SL',name:'Sierra Leone'},{code:'GM',name:'Gambia'},{code:'GW',name:'Guinea-Bissau'},
  {code:'GN',name:'Guinea'},{code:'BJ',name:'Benin'},{code:'TG',name:'Togo'},{code:'LV',name:'Lettonia'},{code:'LT',name:'Lituania'},
  {code:'EE',name:'Estonia'},{code:'BY',name:'Bielorussia'},{code:'MD',name:'Moldavia'},{code:'RS',name:'Serbia'},{code:'BA',name:'Bosnia ed Erzegovina'},
  {code:'ME',name:'Montenegro'},{code:'MK',name:'Macedonia del Nord'},{code:'AL',name:'Albania'},{code:'XK',name:'Kosovo'},{code:'IE',name:'Irlanda'},
  {code:'IS',name:'Islanda'},{code:'MT',name:'Malta'},{code:'CY',name:'Cipro'},{code:'PR',name:'Portorico'},{code:'VI',name:'Isole Vergini USA'},
  {code:'BS',name:'Bahamas'},{code:'BB',name:'Barbados'},{code:'TT',name:'Trinidad e Tobago'},{code:'BZ',name:'Belize'},{code:'SV',name:'El Salvador'},
  {code:'GT',name:'Guatemala'},{code:'HN',name:'Honduras'},{code:'NI',name:'Nicaragua'},{code:'SR',name:'Suriname'},{code:'GY',name:'Guyana'},
  {code:'FJ',name:'Fiji'},{code:'PG',name:'Papua Nuova Guinea'},{code:'SB',name:'Isole Salomone'},{code:'VU',name:'Vanuatu'},{code:'WS',name:'Samoa'},
  {code:'KI',name:'Kiribati'},{code:'TO',name:'Tonga'},{code:'PW',name:'Palau'},{code:'FM',name:'Micronesia'},{code:'MH',name:'Isole Marshall'},
  {code:'NR',name:'Nauru'},{code:'TL',name:'Timor Est'},{code:'BN',name:'Brunei'},
];

// ── Rarity class helper ───────────────────────────────────────────────
function rarityClass(rarity) {
  return 'rarity-' + (rarity || 'Comune').toLowerCase().replace(' ', '-');
}
function rarityDotClass(rarity) {
  return 'rarity-dot-' + (rarity || 'Comune').toLowerCase().replace(' ', '-');
}

// ── Build taxonomy tree ───────────────────────────────────────────────
function buildTree(animals) {
  const LEVELS = ['kin','phy','cls','ord','fam','gen'];
  const LABELS = { kin:'Regno', phy:'Phylum', cls:'Classe', ord:'Ordine', fam:'Famiglia', gen:'Genere' };
  function insert(node, animal, depth) {
    if (depth >= LEVELS.length) return;
    const key = animal[LEVELS[depth]];
    if (!node[key]) node[key] = { _label: LABELS[LEVELS[depth]], _key: LEVELS[depth], _children: {}, _count: 0 };
    node[key]._count++;
    insert(node[key]._children, animal, depth + 1);
  }
  const root = {};
  for (const a of animals) insert(root, a, 0);
  return root;
}

// ── Helpers ───────────────────────────────────────────────────────────
function StatRow({ label, base, scale, color, unit }) {
  const statKey = Object.keys(STAT_MAXES).find(k => STATS_DEF.some(s => s.k === k && s.l === label));
  const maxValue = statKey ? STAT_MAXES[statKey] : 100;
  const realValue = Math.round(base * scale);
  const barWidth = Math.min(100, Math.round((realValue / maxValue) * 100));
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:11 }}>
      <span style={{ color:'rgba(255,255,255,.6)', fontSize:12, fontWeight:600, width:90, flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, height:7, background:'rgba(0,0,0,.4)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${barWidth}%`, background:color, borderRadius:4, transition:'width .65s cubic-bezier(.4,0,.2,1)' }} />
      </div>
      <span style={{ color:'white', fontSize:12, fontWeight:700, minWidth:60, textAlign:'right' }}>{realValue} {unit}</span>
    </div>
  );
}

function TrophicTile({ level }) {
  const t = TROPHIC[level] || TROPHIC[3];
  return (
    <div style={{ background:'rgba(0,0,0,.38)', borderRadius:12, padding:'10px 8px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, marginBottom:2 }}>
        {[4,3,2,1].map(l => {
          const isActive = level===l||(level==='F'&&l===2)||(level==='D'&&l===1);
          const w=[40,52,64,76][4-l];
          return <div key={l} style={{ height:5, width:w, borderRadius:2, background:isActive?t.c:'rgba(255,255,255,.1)' }} />;
        })}
      </div>
      <span style={{ color:t.c, fontSize:10, fontWeight:700, letterSpacing:.3 }}>{t.label}</span>
    </div>
  );
}

function DistMap({ hab, accentColor, countriesPresent }) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  useEffect(() => {
    if (!mapContainer.current || !countriesPresent || countriesPresent.length === 0) return;
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else { initMap(); }
    function initMap() {
      const L = window.L;
      if (mapInstance.current) { mapInstance.current.remove(); }
      mapInstance.current = L.map(mapContainer.current, { zoomControl: false, attributionControl: false }).setView([20, 0], 2);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, minZoom: 1 }).addTo(mapInstance.current);
      fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/10m_cultural/10m_admin_0_countries.geojson')
        .then(r => r.json())
        .then(countries => {
          const countryNamesEn = countriesPresent.map(code => ISO_TO_EN[code] || code);
          let highlightedBounds = null;
          L.geoJSON(countries, {
            style: () => ({ color: 'rgba(255,255,255,.2)', weight: 0.5, fillOpacity: 0.3, fillColor: 'rgba(100,100,100,.1)' }),
            onEachFeature: (feature, layer) => {
              const countryName = feature.properties?.NAME || '';
              if (countryNamesEn.includes(countryName)) {
                layer.setStyle({ fillColor: accentColor, fillOpacity: 0.7, color: accentColor, weight: 1.5 });
                layer.bringToFront();
                try {
                  const bounds = layer.getBounds();
                  if (bounds && bounds.isValid()) { highlightedBounds = highlightedBounds ? highlightedBounds.extend(bounds) : bounds; }
                } catch (e) {}
              }
              layer.bindPopup(`<b>${countryName}</b>`);
            }
          }).addTo(mapInstance.current);
          if (highlightedBounds && highlightedBounds.isValid()) {
            setTimeout(() => { mapInstance.current.fitBounds(highlightedBounds, { padding: [50, 50], maxZoom: 6 }); }, 300);
          }
        }).catch(() => {});
    }
  }, [countriesPresent, accentColor]);
  return (
    <div style={{ borderRadius:12, overflow:'hidden', background:'#07131F' }}>
      {countriesPresent && countriesPresent.length > 0 && (
        <div ref={mapContainer} style={{ width: '100%', height: 280, borderBottom:'1px solid rgba(255,255,255,.1)', background:'#0a0e1a' }} />
      )}
      {(!countriesPresent || countriesPresent.length === 0) && (
        <div style={{ padding:12, borderBottom:'1px solid rgba(255,255,255,.1)' }}>
          <div style={{ color:'rgba(255,255,255,.5)', fontSize:11, fontWeight:700, marginBottom:8, letterSpacing:.3 }}>DISTRIBUZIONE GEOGRAFICA</div>
          <span style={{ color:'rgba(255,255,255,.3)', fontSize:11 }}>Nessun dato disponibile</span>
        </div>
      )}
      <div style={{ padding:12, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ color:'rgba(255,255,255,.5)', fontSize:11, fontWeight:700, marginBottom:8, letterSpacing:.3 }}>HABITAT</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {hab && hab.map(h=>{
              const capitalizedH = h.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              return <span key={h} style={{ background:'rgba(255,255,255,.15)', color:'white', fontSize:11, fontWeight:700, padding:'5px 10px', borderRadius:8, letterSpacing:.3 }}>{capitalizedH}</span>;
            })}
          </div>
        </div>
        <button onClick={()=>setShowLimitsModal(true)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.6)', fontSize:16, cursor:'pointer', padding:0, width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>ℹ️</button>
      </div>
      {showLimitsModal && (
        <div style={{ position:'fixed', inset:0, background:'#000000', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:16 }}>
          <div style={{ background:'#0A0A0C', borderRadius:16, padding:24, maxWidth:400, width:'100%', border:'2px solid rgba(255,215,0,.3)', boxShadow:'0 20px 80px rgba(0,0,0,.95)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <h3 style={{ margin:0, color:'#FFD700', fontSize:18, fontWeight:800 }}>⚠️ Limiti della Visualizzazione</h3>
              <button onClick={()=>setShowLimitsModal(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.6)', fontSize:20, cursor:'pointer', padding:0, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
            <div style={{ background:'#050505', padding:16, borderRadius:12, border:'1px solid rgba(255,215,0,.15)' }}>
              <p style={{ margin:'0 0 12px', color:'#FFD700', fontWeight:700, fontSize:13 }}>📍 I dati provengono da GBIF e possono includere:</p>
              <ul style={{ margin:'0 0 14px', paddingLeft:20, color:'#E0E0E0', fontSize:12 }}>
                <li style={{ marginBottom:6 }}>Osservazioni in cattività (zoo, acquari)</li>
                <li style={{ marginBottom:6 }}>Dati storici non aggiornati</li>
                <li style={{ marginBottom:6 }}>Errori di geo-localizzazione</li>
                <li>Aree amministrative non attuali</li>
              </ul>
              <p style={{ margin:'0', padding:'12px 14px', background:'#000000', borderLeft:'4px solid #FFD700', color:'#FFFFFF', fontSize:12, borderRadius:6, lineHeight:1.6 }}>💡 <strong>Esempio:</strong> la "Guyana francese" (parte della Francia) può riportare specie con distribuzione diversa da quella reale.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, accentColor, onClick }) {
  const cfg = status==='fotografato'
    ? { label:'FOTOGRAFATO', c:'#fff', bg:accentColor }
    : status==='avvistato'
    ? { label:'AVVISTATO', c:accentColor, bg:'rgba(0,0,0,.45)', border:`1.5px solid ${accentColor}` }
    : { label:'NON VISTO', c:'rgba(255,255,255,.3)', bg:'rgba(0,0,0,.3)', border:'1.5px solid rgba(255,255,255,.1)' };
  return (
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px 12px', borderRadius:12, background:cfg.bg, color:cfg.c, fontSize:12, fontWeight:700, border:cfg.border||'none', cursor:onClick?'pointer':'default', textTransform:'uppercase', letterSpacing:0.5, width:'100%' }}>
      {status && <span style={{ width:6, height:6, borderRadius:'50%', background:status==='fotografato'?'white':accentColor, display:'inline-block' }} />}
      {cfg.label}
    </div>
  );
}

function AnimalCard({ a, onClick }) {
  const c = CLS[a.cls] || CLS.Mammalia;
  const found = !!a.status;
  return (
    <div onClick={()=>onClick(a)} style={{ borderRadius:14, overflow:'hidden', cursor:'pointer', position:'relative', userSelect:'none', transition:'transform .1s ease' }}
      onMouseDown={e=>e.currentTarget.style.transform='scale(0.93)'}
      onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
      <div style={{ position:'absolute', top:6, left:6, zIndex:2, background:'rgba(0,0,0,.55)', color:'rgba(255,255,255,.7)', fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:8 }}>{a.no}</div>
      {/* Pallino rarità */}
      <div className={rarityDotClass(a.rarity)} style={{ position:'absolute', top:7, right:7, zIndex:2, width:10, height:10, borderRadius:'50%' }}/>
      <div style={{ height:102, background:found?c.img:'#202022', display:'flex', alignItems:'center', justifyContent:'center', fontSize:52, filter:found?'none':'brightness(0.14) saturate(0)' }}>{c.icon}</div>
      <div style={{ background:found?c.mid:'#1C1C1E', padding:'7px 6px 4px', color:found?'white':'#2E2E30', fontSize:12, fontWeight:700, textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.com}</div>
    </div>
  );
}

function Sheet({ title, onClose, children, tall }) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:60, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={onClose} style={{ flex:1, background:'rgba(0,0,0,.72)' }}/>
      <div style={{ background:'#2A2A2C', borderRadius:'20px 20px 0 0', display:'flex', flexDirection:'column', maxHeight: tall?'92%':'76%', overflow:'hidden' }}>
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 0', flexShrink:0 }}>
          <div style={{ width:40, height:4, borderRadius:2, background:'#555' }}/>
        </div>
        <p style={{ margin:'10px 0 14px', color:'white', fontSize:17, fontWeight:800, textAlign:'center', flexShrink:0 }}>{title}</p>
        <div style={{ flex:1, overflowY:'auto', minHeight:0 }}>{children}</div>
      </div>
    </div>
  );
}

function MultiSheet({ title, options, selected, onApply, onClose, withSearch }) {
  const [local, setLocal] = useState(new Set(selected));
  const [search, setSearch] = useState('');
  const toggle = v => setLocal(s => { const n=new Set(s); n.has(v)?n.delete(v):n.add(v); return n; });
  const allKeys = options.map(o=>o.value);
  const filteredOptions = search.trim() ? options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase())) : options;
  return (
    <Sheet title={title} onClose={onClose}>
      {withSearch && (
        <div style={{ padding:'0 14px 12px', flexShrink:0 }}>
          <input type="text" placeholder="Cerca nazione..." value={search} onChange={e => setSearch(e.target.value)} style={{ width:'100%', height:38, borderRadius:10, background:'#2A2A2C', color:'white', border:'1px solid rgba(255,255,255,.2)', padding:'0 12px', fontSize:14, outline:'none' }} />
        </div>
      )}
      <div style={{ display:'flex', gap:8, padding:'0 14px 12px', flexShrink:0 }}>
        <button onClick={()=>setLocal(new Set(allKeys))} style={{ flex:1, height:34, borderRadius:10, background:'#3A3A3C', color:'rgba(255,255,255,.7)', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>Seleziona tutto</button>
        <button onClick={()=>setLocal(new Set())} style={{ flex:1, height:34, borderRadius:10, background:'#3A3A3C', color:'rgba(255,255,255,.7)', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>Cancella</button>
      </div>
      <div style={{ padding:'0 14px 80px' }}>
        {filteredOptions.length > 0 ? filteredOptions.map(opt => {
          const on = local.has(opt.value);
          const flag = withSearch ? getFlagEmoji(opt.value) : '';
          const isRarity = ['Comune','Non comune','Raro','Leggendario'].includes(opt.value);
          return (
            <div
              key={opt.value}
              className={isRarity ? rarityClass(opt.value) : ''}
              onClick={()=>toggle(opt.value)}
              style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'13px 14px', marginBottom:6, borderRadius:12,
                background: isRarity ? undefined : (opt.bg||'#333'),
                border:`1.5px solid ${on ? (isRarity ? 'rgba(255,255,255,0.4)' : (opt.c||'#666')) : 'transparent'}`,
                cursor:'pointer'
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
                {flag && <span style={{ fontSize:16 }}>{flag}</span>}
                <span style={{ fontSize:14, fontWeight:700 }}>{opt.label}</span>
              </div>
              <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${on?(isRarity?'rgba(255,255,255,0.6)':opt.c||'#666'):'rgba(255,255,255,.25)'}`, background:on?(isRarity?'rgba(255,255,255,0.25)':opt.c||'#666'):'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {on&&<span style={{ fontSize:13, fontWeight:900, lineHeight:1 }}>✓</span>}
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign:'center', padding:'20px', color:'rgba(255,255,255,.4)', fontSize:13 }}>Nessuna nazione trovata</div>
        )}
      </div>
      <div style={{ position:'sticky', bottom:0, background:'#2A2A2C', padding:'10px 14px 24px', display:'flex', gap:8, flexShrink:0 }}>
        <button onClick={onClose} style={{ flex:1, height:44, borderRadius:12, background:'#3A3A3C', color:'rgba(255,255,255,.6)', fontSize:14, fontWeight:700, border:'none', cursor:'pointer' }}>Annulla</button>
        <button onClick={()=>{onApply([...local]);onClose();}} style={{ flex:2, height:44, borderRadius:12, background:'#E8C040', color:'#1A1000', fontSize:14, fontWeight:800, border:'none', cursor:'pointer' }}>Applica</button>
      </div>
    </Sheet>
  );
}

const TAX_LEVEL_LABELS = { kin:'Regno', phy:'Phylum', cls:'Classe', ord:'Ordine', fam:'Famiglia', gen:'Genere' };

function TaxSheet({ onApply, onClose, current }) {
  const tree = useMemo(()=>buildTree(ANIMALS),[]);
  const [path, setPath] = useState([]);
  const [selected, setSelected] = useState(current);
  const currentNode = path.length===0 ? tree : path[path.length-1].node._children;
  const entries = Object.entries(currentNode).sort((a,b)=>b[1]._count-a[1]._count);
  const breadcrumb = ['Tutti', ...path.map(p=>p.name)];
  const goTo = (name, node) => setPath(prev=>[...prev, { name, node }]);
  const goBack = (idx) => setPath(prev=>prev.slice(0,idx));
  const selectThis = (name, node) => { const key = node._key; setSelected({ key, value: name, label: `${TAX_LEVEL_LABELS[key]}: ${name}` }); };
  return (
    <Sheet title="Albero Tassonomico" onClose={onClose} tall>
      <div style={{ display:'flex', flexWrap:'wrap', gap:4, padding:'0 14px 10px', alignItems:'center', flexShrink:0 }}>
        {breadcrumb.map((b,i)=>(
          <span key={i} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span onClick={()=>goBack(i)} style={{ color: i===breadcrumb.length-1?'white':'#E8C040', fontSize:12, fontWeight:700, cursor: i<breadcrumb.length-1?'pointer':'default', padding:'3px 8px', borderRadius:8, background: i===breadcrumb.length-1?'rgba(255,255,255,.1)':'transparent' }}>{b}</span>
            {i<breadcrumb.length-1&&<span style={{ color:'rgba(255,255,255,.25)', fontSize:11 }}>›</span>}
          </span>
        ))}
      </div>
      {selected && (
        <div style={{ margin:'0 14px 10px', padding:'10px 14px', borderRadius:10, background:'rgba(232,192,64,.15)', border:'1px solid rgba(232,192,64,.4)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color:'#E8C040', fontSize:13, fontWeight:700 }}>{selected.label}</span>
          <span onClick={()=>setSelected(null)} style={{ color:'rgba(255,255,255,.4)', fontSize:18, cursor:'pointer', padding:'0 4px' }}>×</span>
        </div>
      )}
      <div style={{ padding:'0 14px 90px' }}>
        {entries.map(([name, node])=>{
          const isSel = selected?.value===name && selected?.key===node._key;
          return (
            <div key={name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <div onClick={()=>selectThis(name,node)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:12, background:isSel?'rgba(232,192,64,.2)':'#222224', border:`1.5px solid ${isSel?'#E8C040':'transparent'}`, cursor:'pointer' }}>
                <div>
                  <div style={{ color:isSel?'#E8C040':'white', fontSize:14, fontWeight:700 }}>{name}</div>
                  <div style={{ color:'rgba(255,255,255,.4)', fontSize:11, marginTop:2 }}>{node._label} · {node._count} specie</div>
                </div>
                {isSel&&<span style={{ color:'#E8C040', fontSize:16 }}>✓</span>}
              </div>
              {Object.keys(node._children).length>0 && (
                <div onClick={()=>goTo(name,node)} style={{ width:40, height:40, borderRadius:10, background:'#333', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                  <span style={{ color:'rgba(255,255,255,.5)', fontSize:16 }}>›</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position:'sticky', bottom:0, background:'#2A2A2C', padding:'10px 14px 28px', display:'flex', gap:8 }}>
        <button onClick={onClose} style={{ flex:1, height:44, borderRadius:12, background:'#3A3A3C', color:'rgba(255,255,255,.6)', fontSize:14, fontWeight:700, border:'none', cursor:'pointer' }}>Annulla</button>
        <button onClick={()=>{onApply(selected);onClose();}} style={{ flex:2, height:44, borderRadius:12, background:'#E8C040', color:'#1A1000', fontSize:14, fontWeight:800, border:'none', cursor:'pointer' }}>Applica filtro</button>
      </div>
    </Sheet>
  );
}

function ClassSheet({ sel, onSel, onClose }) {
  return (
    <Sheet title="Seleziona la Classe" onClose={onClose}>
      <div style={{ padding:'0 14px 40px' }}>
        <button onClick={()=>onSel(null)} style={{ width:'100%', marginBottom:10, padding:'12px 0', borderRadius:12, background:sel===null?'#5A5A5C':'#3A3A3C', color:'white', fontSize:14, fontWeight:700, border:sel===null?'2px solid white':'2px solid transparent', cursor:'pointer' }}>Qualsiasi</button>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {Object.entries(CLS).map(([k,v])=>(
            <button key={k} onClick={()=>onSel(k)} style={{ padding:'10px 4px', borderRadius:12, background:sel===k?v.mid:'#222224', color:sel===k?v.accent:'rgba(255,255,255,.6)', fontSize:11, fontWeight:700, border:sel===k?`2px solid ${v.accent}`:'2px solid #333', cursor:'pointer', lineHeight:1.4 }}>
              <div style={{ fontSize:22, marginBottom:3 }}>{v.icon}</div>{v.label}
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}

// ── Rarity Legend helper ──────────────────────────────────────────────
function RarityLegendRows() {
  return (
    <>
      {[
        {k:'Comune',     desc:'Specie comune e facile da avvistare'},
        {k:'Non comune', desc:'Specie poco frequente'},
        {k:'Raro',       desc:'Specie molto rara, difficile da trovare'},
        {k:'Leggendario',desc:'Specie estremamente rara e leggendaria'},
      ].map(({k,desc})=>(
        <div key={k} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
          <div className={rarityClass(k)} style={{ padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>{k}</div>
          <div style={{ flex:1 }}>
            <div style={{ color:'rgba(255,255,255,.75)', fontSize:11, marginTop:2 }}>{desc}</div>
          </div>
        </div>
      ))}
    </>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────
function Grid({ onSelect }) {
  const [search, setSearch]   = useState('');
  const [clsF, setClsF]       = useState(null);
  const [sheet, setSheet]     = useState(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showInfoModalGrid, setShowInfoModalGrid] = useState(false);
  const [fRarity, setFRarity]     = useState([]);
  const [fCons,   setFCons]       = useState([]);
  const [fStatus, setFStatus]     = useState([]);
  const [fTrophic,setFTrophic]    = useState([]);
  const [fGeography, setFGeography] = useState([]);
  const [fTax,    setFTax]        = useState(null);
  const TAX_KEY_MAP = { kin:'kin', phy:'phy', cls:'cls', ord:'ord', fam:'fam', gen:'gen' };

  const list = ANIMALS.filter(a => {
    const q = search.toLowerCase();
    const status = a.status || 'non visto';
    if (q && !a.com.toLowerCase().includes(q) && !a.sci.toLowerCase().includes(q)) return false;
    if (clsF && a.cls !== clsF) return false;
    if (fRarity.length   && !fRarity.includes(a.rarity))                   return false;
    if (fCons.length     && !fCons.includes(a.cons))                    return false;
    if (fStatus.length   && !fStatus.includes(status))                  return false;
    if (fTrophic.length  && !fTrophic.includes(String(a.trophic)))      return false;
    if (fGeography.length && !a.distribution?.countries_present?.some(c => fGeography.includes(c))) return false;
    if (fTax             && a[TAX_KEY_MAP[fTax.key]] !== fTax.value)    return false;
    return true;
  });

  const anyExtra = fRarity.length||fCons.length||fStatus.length||fTrophic.length||fTax;

  const rarityOpts = Object.entries(RARITY).map(([k,v])=>({ value:k, label:k, c:v.c, bg:v.bg }));
  const consOpts   = Object.entries(CONS).map(([k,v])=>({ value:k, label:`${k} · ${v.full}`, c:v.c, bg:v.bg }));
  const statusOpts = [
    { value:'non visto',   label:'Non visto',   c:'rgba(255,255,255,.4)', bg:'rgba(100,100,100,.2)' },
    { value:'avvistato',   label:'Avvistato',   c:'#FFD700', bg:'rgba(255,215,0,.15)' },
    { value:'fotografato', label:'Fotografato', c:'#00BFFF', bg:'rgba(0,191,255,.15)' },
  ];
  const trophicOpts = Object.entries(TROPHIC).map(([k,v])=>({ value:String(k), label:v.label, c:v.c, bg:v.bg }));
  const geographyOpts = COUNTRIES.map(c=>({ value:c.code, label:c.name, c:'#20B2AA', bg:'rgba(32,178,170,.15)' }));

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#1C1C1E', position:'relative', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px 11px', borderBottom:'1px solid #2A2A2C', flexShrink:0 }}>
        <span/>
        <span style={{ color:'white', fontSize:18, fontWeight:900 }}>Animaldex</span>
        <button onClick={()=>setShowInfoModalGrid(!showInfoModalGrid)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.8)', fontSize:20, cursor:'pointer', padding:'4px 8px', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8 }}>ⓘ</button>
      </div>

      {/* Active filter chips */}
      {(anyExtra||clsF) && (
        <div style={{ display:'flex', gap:6, padding:'8px 12px 4px', flexWrap:'wrap', flexShrink:0 }}>
          {clsF && <span onClick={()=>setClsF(null)} style={{ background:CLS[clsF].mid, color:CLS[clsF].accent, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{CLS[clsF].icon} {CLS[clsF].label} ×</span>}
          {fTax && <span onClick={()=>setFTax(null)} style={{ background:'rgba(232,192,64,.2)', color:'#E8C040', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{fTax.label} ×</span>}
          {fRarity.map(r=>(
            <span key={r} className={rarityClass(r)} onClick={()=>setFRarity(p=>p.filter(x=>x!==r))} style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{r} ×</span>
          ))}
          {fCons.map(c=><span key={c} onClick={()=>setFCons(p=>p.filter(x=>x!==c))} style={{ background:CONS[c].bg, color:CONS[c].c, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{c} ×</span>)}
          {fStatus.map(s=>{
            const so = { 'non visto':{ c:'rgba(255,255,255,.4)', bg:'rgba(100,100,100,.2)' }, 'avvistato':{ c:'#FFD700', bg:'rgba(255,215,0,.15)' }, 'fotografato':{ c:'#00BFFF', bg:'rgba(0,191,255,.15)' } }[s];
            return <span key={s} onClick={()=>setFStatus(p=>p.filter(x=>x!==s))} style={{ background:so?.bg||'#2A2A2C', color:so?.c||'rgba(255,255,255,.6)', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{s} ×</span>;
          })}
          {fTrophic.map(t=><span key={t} onClick={()=>setFTrophic(p=>p.filter(x=>x!==t))} style={{ background:TROPHIC[t]?.bg||'#222', color:TROPHIC[t]?.c||'#aaa', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{TROPHIC[t]?.label||t} ×</span>)}
        </div>
      )}

      {/* Grid */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 12px 0' }}>
        {list.length===0
          ? <p style={{ color:'#555', textAlign:'center', padding:40, fontSize:14 }}>Nessun animale trovato</p>
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {list.map(a=><AnimalCard key={a.id} a={a} onClick={onSelect}/>)}
            </div>
        }
        <div style={{ height:6 }}/>
      </div>

      {/* Bottom filter bar */}
      <div style={{ background:'#A84637', borderTop:'1px solid #7A3228', padding:'6px 12px 4px', flexShrink:0, position:'relative' }}>
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:8 }}>
          <button onClick={()=>setShowSearchBar(!showSearchBar)} style={{ width:46, height:46, borderRadius:10, background:'transparent', border:'none', color:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M13 13L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <button onClick={()=>{setSheet('tax');setShowMenu(false);}} style={{ flex:1, height:46, borderRadius:10, background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:14, fontWeight:700 }}>
            Albero Tassonomico {fTax && ' ✓'}
          </button>
          <button onClick={()=>setShowMenu(!showMenu)} style={{ width:46, height:46, borderRadius:10, background:'transparent', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 4H17L10 12.5V16L7 18V12.5L3 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          </button>
        </div>
        <div style={{ textAlign:'center', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.7)', padding:'4px 0' }}>{list.length} risultati</div>
      </div>

      {/* Menu drawer */}
      {showMenu && (
        <div style={{ position:'absolute', top:100, right:12, width:280, background:'#252527', border:'1px solid #333', borderRadius:14, boxShadow:'0 12px 32px rgba(0,0,0,.5)', zIndex:40, overflow:'hidden' }}>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {[
              { label:'Rarità', icon:'★', onClick:()=>{setSheet('rarity');setShowMenu(false);}, active:fRarity.length>0, color:'#C9A961' },
              { label:'Conservazione', icon:'🛡', onClick:()=>{setSheet('cons');setShowMenu(false);}, active:fCons.length>0, color:'#DC143C' },
              { label:'Gerarchia', icon:'⛓', onClick:()=>{setSheet('trophic');setShowMenu(false);}, active:fTrophic.length>0, color:'#F5A828' },
              { label:'Status', icon:'📷', onClick:()=>{setSheet('status');setShowMenu(false);}, active:fStatus.length>0, color:'#00BFFF' },
              { label:'Geografia', icon:'🌍', onClick:()=>{setSheet('geography');setShowMenu(false);}, active:fGeography.length>0, color:'#20B2AA' },
            ].map((item,i)=>(
              <button key={i} onClick={item.onClick} style={{ width:'100%', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,.05)', background:'transparent', border:'none', display:'flex', alignItems:'center', gap:12, cursor:'pointer', color:item.active?item.color:'white', fontWeight:item.active?700:600 }}>
                <span style={{ fontSize:18 }}>{item.icon}</span>
                <span style={{ fontSize:14 }}>{item.label}</span>
                {item.active && <span style={{ marginLeft:'auto', color:item.color, fontSize:12 }}>✓</span>}
              </button>
            ))}
            <button onClick={()=>{setSearch('');setClsF(null);setFRarity([]);setFCons([]);setFStatus([]);setFTrophic([]);setFTax(null);setShowMenu(false);}} style={{ width:'100%', padding:'14px 16px', background:'rgba(255,0,0,.1)', border:'none', color:'#FF6B6B', cursor:'pointer', fontWeight:700, fontSize:14 }}>
              Resetta filtri
            </button>
          </div>
        </div>
      )}

      {/* Floating search bar */}
      {showSearchBar && (
        <div style={{ position:'absolute', top:58, left:12, right:12, background:'#252527', borderRadius:12, border:'1px solid #333', padding:10, zIndex:50, display:'flex', gap:8, boxShadow:'0 8px 24px rgba(0,0,0,.4)' }}>
          <button onClick={()=>{setSearch('');setShowSearchBar(false);}} style={{ width:40, height:40, borderRadius:8, background:'#3A3A3C', border:'none', color:'rgba(255,255,255,.6)', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>×</button>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca..." style={{ flex:1, height:40, borderRadius:8, background:'#333', border:'1px solid #444', color:'white', fontSize:14, padding:'0 12px', outline:'none', fontFamily:'inherit' }} autoFocus/>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModalGrid && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
          <div style={{ background:'#1A1A1C', borderRadius:20, padding:28, maxHeight:'90vh', overflowY:'auto', maxWidth:520, width:'100%', border:'2px solid #A84637' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ margin:0, color:'#A84637', fontSize:22, fontWeight:900 }}>📚 Legenda Completa</h2>
              <button onClick={()=>setShowInfoModalGrid(false)} style={{ background:'none', border:'none', color:'#A84637', fontSize:24, cursor:'pointer', padding:0 }}>×</button>
            </div>
            <div style={{ marginBottom:24 }}>
              <h3 style={{ margin:'0 0 12px', color:'#A84637', fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>🛡 Stato Conservazione (IUCN)</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[{k:'LC',full:'Least Concern',desc:'Specie non in pericolo'},{k:'NT',full:'Near Threatened',desc:'Prossima a essere minacciata'},{k:'VU',full:'Vulnerable',desc:'A rischio di estinzione'},{k:'EN',full:'Endangered',desc:'Fortemente minacciata'},{k:'CR',full:'Critically Endangered',desc:'Gravissimamente minacciata'},{k:'EW',full:'Extinct in the Wild',desc:'Estinta in natura'},{k:'EX',full:'Extinct',desc:'Completamente estinta'},{k:'DD',full:'Data Deficient',desc:'Dati insufficienti'}].map(({k,full,desc})=>{const co=CONS[k]||CONS.DD;return <div key={k} style={{display:'flex',gap:10,alignItems:'flex-start'}}><div style={{background:co.bg,color:co.c,padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>{k}</div><div style={{flex:1}}><div style={{color:'white',fontSize:12,fontWeight:700}}>{full}</div><div style={{color:'rgba(255,255,255,.55)',fontSize:11,marginTop:2}}>{desc}</div></div></div>;})}
              </div>
            </div>
            <div style={{ marginBottom:24 }}>
              <h3 style={{ margin:'0 0 12px', color:'#A84637', fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>★ Rarità Animale</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}><RarityLegendRows /></div>
            </div>
            <div style={{ marginBottom:24 }}>
              <h3 style={{ margin:'0 0 12px', color:'#A84637', fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>📷 Status Avvistamento</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[{v:'non visto',desc:'Animale non ancora avvistato'},{v:'avvistato',desc:'Avvistato in natura'},{v:'fotografato',desc:'Fotografato, massimo riconoscimento!'}].map(({v,desc})=>{const so={'non visto':{c:'rgba(255,255,255,.4)',bg:'rgba(100,100,100,.2)'},'avvistato':{c:'#FFD700',bg:'rgba(255,215,0,.15)'},'fotografato':{c:'#00BFFF',bg:'rgba(0,191,255,.15)'}}[v];return <div key={v} style={{display:'flex',gap:10,alignItems:'flex-start'}}><div style={{background:so.bg,color:so.c,padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:700,whiteSpace:'nowrap',flexShrink:0,textTransform:'capitalize'}}>{v}</div><div style={{flex:1}}><div style={{color:'rgba(255,255,255,.75)',fontSize:11,marginTop:2}}>{desc}</div></div></div>;})}
              </div>
            </div>
            <div>
              <h3 style={{ margin:'0 0 12px', color:'#A84637', fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>⛓ Gerarchia Alimentare</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[{k:'D',l:'Decomponente',desc:'Detritofago'},{k:'F',l:'Filtratore',desc:'Filtra particelle dall\'acqua'},{k:1,l:'Produttore',desc:'Organismi autotrofi'},{k:2,l:'Erbivoro',desc:'Si nutre di piante'},{k:4,l:'Predatore Apice',desc:'Vertice della catena'},{k:3,l:'Predatore',desc:'Carnivoro medio'}].map(({k,l,desc})=>{const tr=TROPHIC[k]||TROPHIC[1];return <div key={k} style={{display:'flex',gap:10,alignItems:'flex-start'}}><div style={{background:tr.bg,color:tr.c,padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>{l}</div><div style={{flex:1}}><div style={{color:'rgba(255,255,255,.75)',fontSize:11,marginTop:2}}>{desc}</div></div></div>;})}
              </div>
            </div>
          </div>
        </div>
      )}

      {sheet==='cls'     && <ClassSheet sel={clsF} onSel={k=>{setClsF(k);setSheet(null);}} onClose={()=>setSheet(null)}/>}
      {sheet==='rarity'  && <MultiSheet title="Rarità" options={rarityOpts} selected={fRarity} onApply={setFRarity} onClose={()=>setSheet(null)}/>}
      {sheet==='cons'    && <MultiSheet title="Stato di Conservazione" options={consOpts} selected={fCons} onApply={setFCons} onClose={()=>setSheet(null)}/>}
      {sheet==='status'  && <MultiSheet title="Tipo di Avvistamento" options={statusOpts} selected={fStatus} onApply={setFStatus} onClose={()=>setSheet(null)}/>}
      {sheet==='trophic' && <MultiSheet title="Catena Alimentare" options={trophicOpts} selected={fTrophic} onApply={setFTrophic} onClose={()=>setSheet(null)}/>}
      {sheet==='geography' && <MultiSheet title="Geografia" options={geographyOpts} selected={fGeography} onApply={setFGeography} onClose={()=>setSheet(null)} withSearch/>}
      {sheet==='tax'     && <TaxSheet current={fTax} onApply={v=>{setFTax(v);}} onClose={()=>setSheet(null)}/>}
    </div>
  );
}

// ── Detail ────────────────────────────────────────────────────────────
function Detail({ a, onBack }) {
  const [statMode,setStatMode]=useState('statistiche');
  const [taxOpen,setTaxOpen]=useState(false);
  const [localStatus,setLocalStatus]=useState(a.status || 'non visto');
  const [showStatusMenu,setShowStatusMenu]=useState(false);
  const [showInfoModal,setShowInfoModal]=useState(false);
  const c=CLS[a.cls]||CLS.Mammalia;
  const co=CONS[a.cons]||CONS.DD;
  
  const scale=SCALE[statMode];
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:`linear-gradient(180deg,${c.detailTop} 0%,${c.detailBg} 45%,#1A1A1C 85%)` }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px 11px', flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:c.accent, fontSize:15, fontWeight:700, cursor:'pointer', padding:0 }}>‹ Animaldex</button>
        <span style={{ color:'white', fontSize:17, fontWeight:800 }}>{a.com}</span>
        <button onClick={()=>setShowInfoModal(!showInfoModal)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.8)', fontSize:20, cursor:'pointer', padding:'4px 8px', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8 }}>ⓘ</button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'0 14px 48px' }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:3, alignItems:'center', marginBottom:14 }}>
          {[a.kin,a.phy,a.cls,a.ord,a.fam].map((p,i,arr)=>(
            <span key={i} style={{ display:'flex', alignItems:'center', gap:3 }}>
              <span style={{ color:i===2?c.accent:'rgba(255,255,255,.32)', fontSize:11, fontWeight:400, fontStyle:i!==2?'italic':undefined }}>{p}</span>
              {i<arr.length-1&&<span style={{ color:'rgba(255,255,255,.18)', fontSize:11 }}>›</span>}
            </span>
          ))}
        </div>
        <div style={{ display:'flex', gap:12, marginBottom:16 }}>
          <div style={{ width:132, height:132, borderRadius:16, background:c.img, display:'flex', alignItems:'center', justifyContent:'center', fontSize:76, flexShrink:0 }}>{c.icon}</div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, justifyContent:'center' }}>
            {/* Rarità con classe animata */}
            <div className={rarityClass(a.rarity)} style={{ borderRadius:12, padding:'10px 12px', fontSize:14, fontWeight:700, textAlign:'center' }}>{a.rarity||'Comune'}</div>
            <div style={{ background:co.bg, borderRadius:12, padding:'9px 12px', color:co.c, fontSize:12, fontWeight:700, textAlign:'center' }}>{co.lbl} · {co.full}</div>
            <div style={{ display:'flex', justifyContent:'center', position:'relative', width:'100%' }}>
              <StatusBadge status={localStatus} accentColor={c.accent} onClick={()=>setShowStatusMenu(!showStatusMenu)}/>
              {showStatusMenu && (
                <div style={{ position:'absolute', top:40, left:0, right:0, background:c.detailBg, border:`1px solid ${c.accent}33`, borderRadius:12, padding:8, display:'flex', flexDirection:'column', gap:6, zIndex:10 }}>
                  {['non visto','avvistato','fotografato'].map(s=>(
                    <button key={s} onClick={()=>{setLocalStatus(s);setShowStatusMenu(false);}} style={{ background:'transparent', border:'none', color:c.accent, cursor:'pointer', padding:'6px 12px', borderRadius:8, fontSize:13, fontWeight:700, textAlign:'left', textTransform:'capitalize' }}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ textAlign:'center', marginBottom:18 }}>
          <h1 style={{ margin:0, color:'white', fontSize:26, fontWeight:900, letterSpacing:-.3 }}>{a.com}</h1>
          <p style={{ margin:'4px 0 0', color:c.accent, fontSize:15, fontStyle:'italic', fontWeight:400 }}>{a.sci}</p>
        </div>
        <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:14, marginBottom:16, display:'flex', gap:12, alignItems:'flex-start' }}>
          <div style={{ fontSize:34, flexShrink:0 }}>{c.icon}</div>
          <p style={{ margin:0, color:'rgba(255,255,255,.82)', fontSize:13, lineHeight:1.7 }}>{a.desc} {a.bio}</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:18 }}>
          <div style={{ background:'rgba(0,0,0,.38)', borderRadius:12, padding:'11px 8px', textAlign:'center' }}><div style={{ fontSize:17, marginBottom:4 }}>⚖️</div><div style={{ color:'white', fontSize:10, fontWeight:600 }}>{a.wt}</div></div>
          <div style={{ background:'rgba(0,0,0,.38)', borderRadius:12, padding:'11px 8px', textAlign:'center' }}><div style={{ fontSize:17, marginBottom:4 }}>📏</div><div style={{ color:'white', fontSize:10, fontWeight:600 }}>{a.ln}</div></div>
          <TrophicTile level={a.trophic}/>
        </div>
        {/* 3 pannelli: Abilità | Statistiche | Tassonomia */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', marginBottom:12, background:'rgba(0,0,0,.38)', borderRadius:12, padding:4, gap:4 }}>
            {['abilita','statistiche','tassonomia'].map(m=>(
              <button key={m} onClick={()=>setStatMode(m)} style={{ padding:'8px 0', borderRadius:8, background:statMode===m?c.mid:'transparent', color:statMode===m?'white':'rgba(255,255,255,.38)', fontSize:11, fontWeight:700, border:'none', cursor:'pointer', textTransform:'capitalize' }}>
                {m==='abilita'?'Abilità':m==='statistiche'?'Statistiche':'Tassonomia'}
              </button>
            ))}
          </div>

          {/* Abilità */}
          {statMode==='abilita'&&(
            <div>
              {a.categories?.length>0?(
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {a.categories.map(cat=>{
                    const meta=CATEGORY_META?.[cat]||{label:cat,icon:'🔹',color:c.accent};
                    const curiosity=a.cat_curiosities?.[cat];
                    return (
                      <div key={cat} style={{ background:'rgba(0,0,0,.35)', borderRadius:12, padding:'11px 14px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:20, flexShrink:0 }}>{meta.icon}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ color:'white', fontSize:13, fontWeight:700 }}>{meta.label}</div>
                            {curiosity&&<div style={{ color:'rgba(255,255,255,.6)', fontSize:11, lineHeight:1.6, marginTop:4 }}>{curiosity}</div>}
                          </div>
                          <div style={{ width:8, height:8, borderRadius:'50%', background:meta.color||c.accent, flexShrink:0 }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ):(
                <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:20, textAlign:'center' }}>
                  <p style={{ color:'rgba(255,255,255,.5)', fontSize:13, margin:0 }}>Nessuna abilità speciale registrata</p>
                </div>
              )}
            </div>
          )}

          {/* Statistiche */}
          {statMode==='statistiche'&&(
            localStatus !== 'non visto' ? (
              <div>
                <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:'14px 14px 6px', marginBottom:8 }}>
                  {STATS_DEF.map(({k,l,u})=><StatRow key={k} label={l} base={a.stats[k]} scale={scale} color={c.accent} unit={u}/>)}
                </div>
                {a.lifespan&&(
                  <div style={{ background:'rgba(0,0,0,.35)', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:16 }}>⏳</span>
                    <span style={{ color:'rgba(255,255,255,.7)', fontSize:12, fontWeight:600 }}>Aspettativa di vita: ~{a.lifespan} anni</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:20, textAlign:'center' }}>
                <p style={{ color:'rgba(255,255,255,.6)', fontSize:13, margin:0 }}>🔒 Sblocca selezionando lo status sopra</p>
              </div>
            )
          )}

          {/* Tassonomia */}
          {statMode==='tassonomia'&&(
            <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:'4px 16px 16px' }}>
              {[['Regno',a.kin],['Phylum',a.phy],['Classe',a.cls],['Ordine',a.ord],['Famiglia',a.fam],['Genere',a.gen],['Specie',a.sci]].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                  <span style={{ color:'rgba(255,255,255,.35)', fontSize:12 }}>{l}</span>
                  <span style={{ color:l==='Specie'||l==='Genere'?c.accent:'white', fontSize:12, fontWeight:600, fontStyle:l==='Specie'||l==='Genere'?'italic':undefined }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <p style={{ color:'white', fontSize:16, fontWeight:800, margin:'0 0 10px' }}>Etimologia</p>
        <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:14, marginBottom:20 }}><p style={{ margin:0, color:'rgba(255,255,255,.82)', fontSize:13, lineHeight:1.7 }}>{a.ety}</p></div>
        <p style={{ color:'white', fontSize:16, fontWeight:800, margin:'0 0 10px' }}>Distribuzione</p>
        <DistMap hab={a.hab} accentColor={c.accent} countriesPresent={a.distribution?.countries_present}/>
        {/* Endemico + Orario avvistamento (sotto mappa) */}
        <div style={{ display:'flex', gap:8, marginTop:10, marginBottom:4, flexWrap:'wrap' }}>
          {a.is_endemic&&<div style={{ background:'rgba(0,0,0,.35)', borderRadius:10, padding:'8px 12px', display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:14 }}>📍</span><span style={{ color:'#90D84A', fontSize:11, fontWeight:700 }}>Endemico{a.endemic_iso?.length>0?` (${a.endemic_iso.join(', ')})`:''}</span>
          </div>}
          {a.spotlightHours?.map(h=>(
            <span key={h} style={{ background:'rgba(255,255,255,.1)', color:'white', fontSize:11, fontWeight:700, padding:'6px 10px', borderRadius:8, display:'flex', alignItems:'center', gap:4 }}>
              ⏰ <span style={{ textTransform:'capitalize' }}>{h}</span>
            </span>
          ))}
        </div>

        <div style={{ marginTop:20 }}>
          <button onClick={()=>setTaxOpen(v=>!v)} style={{ width:'100%', background:'rgba(0,0,0,.35)', border:`1px solid ${taxOpen?c.accent+'55':'rgba(255,255,255,.1)'}`, borderRadius:taxOpen?'14px 14px 0 0':14, padding:'13px 16px', display:'flex', justifyContent:'space-between', color:'white', fontSize:14, fontWeight:700, cursor:'pointer' }}>
            Tassonomia completa
            <span style={{ color:'rgba(255,255,255,.28)', display:'inline-block', transition:'transform .25s', transform:taxOpen?'rotate(180deg)':undefined }}>▼</span>
          </button>
          {taxOpen&&(
            <div style={{ background:'rgba(0,0,0,.45)', borderRadius:'0 0 14px 14px', padding:'4px 16px 16px', border:`1px solid ${c.accent}33`, borderTop:'none' }}>
              {[['Regno',a.kin],['Phylum',a.phy],['Classe',a.cls],['Ordine',a.ord],['Famiglia',a.fam],['Genere',a.gen],['Specie',a.sci]].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                  <span style={{ color:'rgba(255,255,255,.35)', fontSize:12 }}>{l}</span>
                  <span style={{ color:l==='Specie'||l==='Genere'?c.accent:'white', fontSize:12, fontWeight:600, fontStyle:l==='Specie'||l==='Genere'?'italic':undefined }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
          <div style={{ background:c.detailBg, borderRadius:20, padding:28, maxHeight:'90vh', overflowY:'auto', maxWidth:520, width:'100%', border:`2px solid ${c.accent}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ margin:0, color:c.accent, fontSize:22, fontWeight:900 }}>📚 Legenda Completa</h2>
              <button onClick={()=>setShowInfoModal(false)} style={{ background:'none', border:'none', color:c.accent, fontSize:24, cursor:'pointer', padding:0 }}>×</button>
            </div>
            <div style={{ marginBottom:24 }}>
              <h3 style={{ margin:'0 0 12px', color:c.accent, fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>🛡 Stato Conservazione (IUCN)</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[{k:'LC',full:'Least Concern',desc:'Specie non in pericolo'},{k:'NT',full:'Near Threatened',desc:'Prossima a essere minacciata'},{k:'VU',full:'Vulnerable',desc:'A rischio di estinzione'},{k:'EN',full:'Endangered',desc:'Fortemente minacciata'},{k:'CR',full:'Critically Endangered',desc:'Gravissimamente minacciata'},{k:'EW',full:'Extinct in the Wild',desc:'Estinta in natura'},{k:'EX',full:'Extinct',desc:'Completamente estinta'},{k:'DD',full:'Data Deficient',desc:'Dati insufficienti'}].map(({k,full,desc})=>{const co2=CONS[k]||CONS.DD;return <div key={k} style={{display:'flex',gap:10,alignItems:'flex-start'}}><div style={{background:co2.bg,color:co2.c,padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>{k}</div><div style={{flex:1}}><div style={{color:'white',fontSize:12,fontWeight:700}}>{full}</div><div style={{color:'rgba(255,255,255,.55)',fontSize:11,marginTop:2}}>{desc}</div></div></div>;})}
              </div>
            </div>
            <div style={{ marginBottom:24 }}>
              <h3 style={{ margin:'0 0 12px', color:c.accent, fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>★ Rarità Animale</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}><RarityLegendRows /></div>
            </div>
            <div style={{ marginBottom:24 }}>
              <h3 style={{ margin:'0 0 12px', color:c.accent, fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>📷 Status Avvistamento</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[{v:'non visto',desc:'Non ancora avvistato'},{v:'avvistato',desc:'Avvistato in natura'},{v:'fotografato',desc:'Fotografato, massimo riconoscimento!'}].map(({v,desc})=>{const so={'non visto':{c:'rgba(255,255,255,.4)',bg:'rgba(100,100,100,.2)'},'avvistato':{c:'#FFD700',bg:'rgba(255,215,0,.15)'},'fotografato':{c:'#00BFFF',bg:'rgba(0,191,255,.15)'}}[v];return <div key={v} style={{display:'flex',gap:10,alignItems:'flex-start'}}><div style={{background:so.bg,color:so.c,padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:700,whiteSpace:'nowrap',flexShrink:0,textTransform:'capitalize'}}>{v}</div><div style={{flex:1}}><div style={{color:'rgba(255,255,255,.75)',fontSize:11,marginTop:2}}>{desc}</div></div></div>;})}
              </div>
            </div>
            <div>
              <h3 style={{ margin:'0 0 12px', color:c.accent, fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>⛓ Gerarchia Alimentare</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[{k:'D',l:'Decomponente',desc:'Detritofago'},{k:'F',l:'Filtratore',desc:'Filtra particelle dall\'acqua'},{k:1,l:'Produttore',desc:'Organismi autotrofi'},{k:2,l:'Erbivoro',desc:'Si nutre di piante'},{k:4,l:'Predatore Apice',desc:'Vertice della catena'},{k:3,l:'Predatore',desc:'Carnivoro medio'}].map(({k,l,desc})=>{const tr=TROPHIC[k]||TROPHIC[1];return <div key={k} style={{display:'flex',gap:10,alignItems:'flex-start'}}><div style={{background:tr.bg,color:tr.c,padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>{l}</div><div style={{flex:1}}><div style={{color:'rgba(255,255,255,.75)',fontSize:11,marginTop:2}}>{desc}</div></div></div>;})}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────
export default function App() {
  const [sel,setSel]=useState(null);
  useEffect(()=>{
    const l=document.createElement('link');
    l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap';
    document.head.appendChild(l);
    document.body.style.cssText='margin:0;background:#1C1C1E;overflow:hidden';

    const style=document.createElement('style');
    style.textContent = RARITY_CSS;
    document.head.appendChild(style);
  },[]);
  return (
    <div style={{ fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif", height:'100vh', maxWidth:480, margin:'0 auto', display:'flex', flexDirection:'column', overflow:'hidden', background:'#1C1C1E' }}>
      {sel?<Detail a={sel} onBack={()=>setSel(null)}/>:<Grid onSelect={setSel}/>}
    </div>
  );
}
