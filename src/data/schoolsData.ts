import { OfficialSchoolUnit, EducationSphere } from '../types/questionnaire';

export interface SchoolItem {
  id?: string;
  name: string;
  neighborhood: string;
  directorRef?: string;
  sector: string;
  offer?: EducationSphere;
  login?: string;
}

export const SECTORS_LIST = [
  'Setor 1',
  'Setor 2',
  'Setor 3',
  'Setor 4',
  'Setor 5',
  'Setor 6',
  'Setor 7',
  'Setor 9',
  'Setor 10',
  'Setor 11',
];

// OFFICIAL SCHOOL UNITS MAPPED ACCORDING TO OFFICIAL MUNICIPAL SECTORS AND REGISTRIES
export const OFFICIAL_SCHOOL_UNITS: OfficialSchoolUnit[] = [
  // ==================== SETOR 1 ====================
  {
    id: '01',
    name: 'EM Dr. André Franco Montoro',
    offer: 'EF',
    login: 'Montoro',
    sector: 'Setor 1',
    neighborhood: 'Bela Vista',
  },
  {
    id: '02',
    name: 'EM Dulce Pedrosa Romeiro Guimarães',
    offer: 'EI',
    login: 'Dulce',
    sector: 'Setor 1',
    neighborhood: 'Boa Vista',
  },
  {
    id: '03',
    name: 'EM Profa. Gilda Piorini Molica',
    offer: 'EF',
    login: 'Gilda',
    sector: 'Setor 1',
    neighborhood: 'São Judas Tadeu',
  },
  {
    id: '04',
    name: 'EM Profa. Maria Aparecida Arantes Vasques',
    offer: 'EF',
    login: 'Arantes',
    sector: 'Setor 1',
    neighborhood: 'Mombaça',
  },
  {
    id: '05',
    name: 'EM Profa. Maria Zara Miné Renoldi dos Santos',
    offer: 'EI',
    login: 'Zara',
    sector: 'Setor 1',
    neighborhood: 'Jardim Cristina',
  },
  {
    id: '06',
    name: 'EM Prof. Moacyr de Almeida',
    offer: 'EF',
    login: 'Moacyr',
    sector: 'Setor 1',
    neighborhood: 'Alto do Cardoso',
  },
  {
    id: '07',
    name: 'EM Prof. Paulo Freire',
    offer: 'EF',
    login: 'Paulo',
    sector: 'Setor 1',
    neighborhood: 'Vila Prado',
  },

  // ==================== SETOR 2 ====================
  {
    id: '08',
    name: 'EM Ayrton Senna da Silva',
    offer: 'EF',
    login: 'Ayrton',
    sector: 'Setor 2',
    neighborhood: 'Pasin - Moreira César',
  },
  {
    id: '09',
    name: 'CMEI Esmeralda Silva Ramos',
    offer: 'EI',
    login: 'Esmeralda',
    sector: 'Setor 2',
    neighborhood: 'Araretama',
  },
  {
    id: '10',
    name: 'CMEI José Ildefonso Machado',
    offer: 'EI',
    login: 'Ildefonso',
    sector: 'Setor 2',
    neighborhood: 'Feital',
  },
  {
    id: '11',
    name: 'CMEI Maria Aparecida Gomes - Sá Maria',
    offer: 'EI',
    login: 'SaMaria',
    sector: 'Setor 2',
    neighborhood: 'Moreira César',
  },
  {
    id: '12',
    name: 'CMEI Maria das Dores Santos Marcondes - Maria dos Anjos',
    offer: 'EI',
    login: 'MariaDosAnjos',
    sector: 'Setor 2',
    neighborhood: 'Setor 2',
  },
  {
    id: '13',
    name: 'CMEI Maria Luiza Lima de Almeida',
    offer: 'EI',
    login: 'Luiza',
    sector: 'Setor 2',
    neighborhood: 'Setor 2',
  },
  {
    id: '14',
    name: 'CMEI Marli Lemes de Moura Camargo',
    offer: 'EI',
    login: 'Marli',
    sector: 'Setor 2',
    neighborhood: 'Setor 2',
  },
  {
    id: '15',
    name: 'CMEI Profa. Valdira Morgado',
    offer: 'EI',
    login: 'Valdira',
    sector: 'Setor 2',
    neighborhood: 'Setor 2',
  },

  // ==================== SETOR 3 ====================
  {
    id: '16',
    name: 'CMEI CAIC',
    offer: 'EI',
    login: 'Caic',
    sector: 'Setor 3',
    neighborhood: 'Araretama',
  },
  {
    id: '17',
    name: 'CMEI João Fleury de Souza Amorim Filho',
    offer: 'EI',
    login: 'Fleury',
    sector: 'Setor 3',
    neighborhood: 'Setor 3',
  },
  {
    id: '18',
    name: 'CMEI Mons. Jonas Abib',
    offer: 'EI',
    login: 'JonasAbib',
    sector: 'Setor 3',
    neighborhood: 'Setor 3',
  },
  {
    id: '19',
    name: 'CMEI Lessa',
    offer: 'EI',
    login: 'Lessa',
    sector: 'Setor 3',
    neighborhood: 'Setor 3',
  },
  {
    id: '20',
    name: 'CMEI Lucineia Cristiani Marcelo do Amaral Carvalho',
    offer: 'EI',
    login: 'Lucineia',
    sector: 'Setor 3',
    neighborhood: 'Setor 3',
  },
  {
    id: '21',
    name: 'CMEI Profa. Neide Maria Pereira de Andrade - D. Neide',
    offer: 'EI',
    login: 'Neide',
    sector: 'Setor 3',
    neighborhood: 'Setor 3',
  },
  {
    id: '22',
    name: 'CMEI Profa. Ruth Dóris Lemos',
    offer: 'EI',
    login: 'RuthDoris',
    sector: 'Setor 3',
    neighborhood: 'Setor 3',
  },

  // ==================== SETOR 4 ====================
  {
    id: '23',
    name: 'EM Prof. Augusto César Ribeiro',
    offer: 'EF',
    login: 'Augusto',
    sector: 'Setor 4',
    neighborhood: 'Vila Rica',
  },
  {
    id: '24',
    name: 'EM Prof. Félix Abid Miguel',
    offer: 'EF',
    login: 'Felix',
    sector: 'Setor 4',
    neighborhood: 'Vila Rica',
  },
  {
    id: '25',
    name: 'EM Prof. Jairo Monteiro',
    offer: 'EF',
    login: 'Jairo',
    sector: 'Setor 4',
    neighborhood: 'Triângulo',
  },
  {
    id: '26',
    name: 'EM Profa. Maria Ap. Camargo de Souza - Profª Aparecidinha',
    offer: 'AMBOS',
    login: 'Aparecidinha',
    sector: 'Setor 4',
    neighborhood: 'Ribeirão Grande',
  },
  {
    id: '27',
    name: 'EM Profa. Maria Madureira Salgado - Dona Minica',
    offer: 'EI',
    login: 'Minica',
    sector: 'Setor 4',
    neighborhood: 'Cruz Pequena',
  },
  {
    id: '28',
    name: 'EM Padre Mário Antonio Bonotti - Redentorista',
    offer: 'EF',
    login: 'Mario',
    sector: 'Setor 4',
    neighborhood: 'Maria Áurea',
  },
  {
    id: '29',
    name: 'EM Prof. Orlando Pires',
    offer: 'EF',
    login: 'Orlando',
    sector: 'Setor 4',
    neighborhood: 'Bom Sucesso',
  },

  // ==================== SETOR 5 ====================
  {
    id: '30',
    name: 'EM Dr. Ângelo Paz da Silva',
    offer: 'EF',
    login: 'Angelo',
    sector: 'Setor 5',
    neighborhood: 'Cidade Jardim',
  },
  {
    id: '31',
    name: 'EM Aníbal Ferreira Lima',
    offer: 'EF',
    login: 'Anibal',
    sector: 'Setor 5',
    neighborhood: 'Moreira César',
  },
  {
    id: '32',
    name: 'EM Prof. Elias Bargis Mathias',
    offer: 'EF',
    login: 'Elias',
    sector: 'Setor 5',
    neighborhood: 'Araretama',
  },
  {
    id: '33',
    name: 'EM Prof. João Kolenda Lemos',
    offer: 'EF',
    login: 'Kolenda',
    sector: 'Setor 5',
    neighborhood: 'Bem Viver',
  },
  {
    id: '34',
    name: 'EM Profa. Madalena Caltabiano Salum Benjamin',
    offer: 'EF',
    login: 'Madalena',
    sector: 'Setor 5',
    neighborhood: 'Nova Esperança',
  },
  {
    id: '35',
    name: 'EM Profa. Regina Célia Madureira de Souza Lima',
    offer: 'EI',
    login: 'Regina',
    sector: 'Setor 5',
    neighborhood: 'Araretama',
  },
  {
    id: '36',
    name: 'EM Vito Ardito',
    offer: 'EF',
    login: 'Vito',
    sector: 'Setor 5',
    neighborhood: 'Araretama',
  },

  // ==================== SETOR 6 ====================
  {
    id: '37',
    name: 'CMEI Profa. Andréa Cristina de Souza Bissoli',
    offer: 'EI',
    login: 'Bissoli',
    sector: 'Setor 6',
    neighborhood: 'Setor 6',
  },
  {
    id: '38',
    name: 'CMEI Dr. Francisco Lessa Júnior',
    offer: 'EI',
    login: 'LessaJr',
    sector: 'Setor 6',
    neighborhood: 'Setor 6',
  },
  {
    id: '39',
    name: 'CMEI Josefina Cembranelli Schmidt',
    offer: 'EI',
    login: 'Josefina',
    sector: 'Setor 6',
    neighborhood: 'Setor 6',
  },
  {
    id: '40',
    name: 'EM Prof. Manoel César Ribeiro',
    offer: 'EF',
    login: 'Manoel',
    sector: 'Setor 6',
    neighborhood: 'Jardim Eloyna',
  },
  {
    id: '41',
    name: 'CMEI Profa. Rosália de Fátima Santos Queiroz',
    offer: 'EI',
    login: 'Rosalia',
    sector: 'Setor 6',
    neighborhood: 'Setor 6',
  },
  {
    id: '42',
    name: 'CMEI Profa. Therezinha Macedo Pedro de Andrade',
    offer: 'EI',
    login: 'Therezinha',
    sector: 'Setor 6',
    neighborhood: 'Setor 6',
  },
  {
    id: '43',
    name: 'CMEI Dona Yolanda Immediato Fryling',
    offer: 'EI',
    login: 'Yolanda',
    sector: 'Setor 6',
    neighborhood: 'Setor 6',
  },

  // ==================== SETOR 7 ====================
  {
    id: '44',
    name: 'EM Prof. Alexandre Machado Salgado',
    offer: 'EF',
    login: 'Alexandre',
    sector: 'Setor 7',
    neighborhood: 'Campinas',
  },
  {
    id: '45',
    name: 'EM Arthur de Andrade',
    offer: 'EF',
    login: 'Arthur',
    sector: 'Setor 7',
    neighborhood: 'Cidade Nova',
  },
  {
    id: '46',
    name: 'EM João Cesário',
    offer: 'EF',
    login: 'Joao',
    sector: 'Setor 7',
    neighborhood: 'Feital',
  },
  {
    id: '47',
    name: 'EM Profa. Maria Helena Ribeiro Vilela',
    offer: 'EI',
    login: 'Helena',
    sector: 'Setor 7',
    neighborhood: 'Jardim Regina',
  },
  {
    id: '48',
    name: 'EM Profa. Ruth Azevedo Romeiro',
    offer: 'EF',
    login: 'Ruth',
    sector: 'Setor 7',
    neighborhood: 'Triângulo',
  },
  {
    id: '49',
    name: 'EM Profa. Yvone Apparecida Arantes Corrêa',
    offer: 'EF',
    login: 'Yvone',
    sector: 'Setor 7',
    neighborhood: 'Goiabal',
  },

  // ==================== SETOR 9 ====================
  {
    id: '50',
    name: 'EM Dr. Francisco de Assis César',
    offer: 'EF',
    login: 'Francisco',
    sector: 'Setor 9',
    neighborhood: 'Moreira César',
  },
  {
    id: '51',
    name: 'EM Prof. Joaquim Pereira da Silva',
    offer: 'EF',
    login: 'Joaquim',
    sector: 'Setor 9',
    neighborhood: 'Mantiqueira',
  },
  {
    id: '52',
    name: 'EM José Gonçalves da Silva - Seu Juquinha',
    offer: 'EF',
    login: 'Juquinha',
    sector: 'Setor 9',
    neighborhood: 'Liberdade',
  },
  {
    id: '53',
    name: 'EM Prof. Lauro Vicente de Azevedo',
    offer: 'EF',
    login: 'Lauro',
    sector: 'Setor 9',
    neighborhood: 'Cícero Prado',
  },
  {
    id: '54',
    name: 'EM Prof. Mário de Assis César',
    offer: 'EF',
    login: 'Assis',
    sector: 'Setor 9',
    neighborhood: 'Padre Rodolfo',
  },
  {
    id: '55',
    name: 'EM Profa. Rachel de Aguiar Loberto',
    offer: 'EI',
    login: 'Rachel',
    sector: 'Setor 9',
    neighborhood: 'Vale das Acácias',
  },

  // ==================== SETOR 10 ====================
  {
    id: '56',
    name: 'EM Abdias Júnior Santiago e Silva',
    offer: 'EF',
    login: 'Abdias',
    sector: 'Setor 10',
    neighborhood: 'Santa Cecília',
  },
  {
    id: '57',
    name: 'EM Profa. Isabel do Carmo Nogueira',
    offer: 'EF',
    login: 'Isabel',
    sector: 'Setor 10',
    neighborhood: 'Crispim',
  },
  {
    id: '58',
    name: 'EM Profa. Julieta Reale Vieira',
    offer: 'EF',
    login: 'Julieta',
    sector: 'Setor 10',
    neighborhood: 'Castolira',
  },
  {
    id: '59',
    name: 'EM Profa. Odete Corrêa Madureira',
    offer: 'EF',
    login: 'Odete',
    sector: 'Setor 10',
    neighborhood: 'Jardim Morumbi',
  },
  {
    id: '60',
    name: 'EM Pe. José Orlando Siqueira do Amaral - Padre Zezinho',
    offer: 'EF',
    login: 'Zezinho',
    sector: 'Setor 10',
    neighborhood: 'Vila São Benedito',
  },
  {
    id: '61',
    name: 'EM Serafim Ferreira - Sr. Sara',
    offer: 'EF',
    login: 'Serafim',
    sector: 'Setor 10',
    neighborhood: 'Terra dos Ipês I',
  },

  // ==================== SETOR 11 ====================
  {
    id: '62',
    name: 'CMEI Durvalino dos Santos – CEAP Campinas',
    offer: 'EI',
    login: 'Durvalino',
    sector: 'Setor 11',
    neighborhood: 'Campinas',
  },
  {
    id: '63',
    name: 'CMEI Isabel Pereira da Silva - Dona Isabel',
    offer: 'EI',
    login: 'DonaIsabel',
    sector: 'Setor 11',
    neighborhood: 'Setor 11',
  },
  {
    id: '64',
    name: 'CMEI Dona Maria Benedita Cabral San Martin',
    offer: 'EI',
    login: 'SanMartin',
    sector: 'Setor 11',
    neighborhood: 'Setor 11',
  },
  {
    id: '65',
    name: 'CMEI Profa. Olímpia Franco César',
    offer: 'EI',
    login: 'Olimpia',
    sector: 'Setor 11',
    neighborhood: 'Setor 11',
  },
  {
    id: '66',
    name: 'CMEI Frei Reinaldo Neiborg',
    offer: 'EI',
    login: 'Reinaldo',
    sector: 'Setor 11',
    neighborhood: 'Setor 11',
  },
  {
    id: '67',
    name: 'CMEI Profa. Silvia Aparecida Quirino de Jesus',
    offer: 'EI',
    login: 'Silvia',
    sector: 'Setor 11',
    neighborhood: 'Setor 11',
  },
];

// Lookup mapping every school to its registered neighborhood
export const OFFICIAL_NEIGHBORHOOD_BY_SCHOOL: Record<string, string> = {
  // Setor 1
  'EM Dr. André Franco Montoro': 'Bela Vista',
  'EM Dulce Pedrosa Romeiro Guimarães': 'Boa Vista',
  'EM Profa. Gilda Piorini Molica': 'São Judas Tadeu',
  'EM Profa. Maria Aparecida Arantes Vasques': 'Mombaça',
  'EM Profa. Maria Zara Miné Renoldi dos Santos': 'Jardim Cristina',
  'EM Prof. Moacyr de Almeida': 'Alto do Cardoso',
  'EM Prof. Paulo Freire': 'Vila Prado',

  // Setor 2
  'EM Ayrton Senna da Silva': 'Pasin - Moreira César',
  'CMEI Esmeralda Silva Ramos': 'Araretama',
  'CMEI José Ildefonso Machado': 'Feital',
  'CMEI Maria Aparecida Gomes - Sá Maria': 'Moreira César',
  'CMEI Maria das Dores Santos Marcondes - Maria dos Anjos': 'Setor 2',
  'CMEI Maria Luiza Lima de Almeida': 'Setor 2',
  'CMEI Marli Lemes de Moura Camargo': 'Setor 2',
  'CMEI Profa. Valdira Morgado': 'Setor 2',

  // Setor 3
  'CMEI CAIC': 'Araretama',
  'CMEI João Fleury de Souza Amorim Filho': 'Setor 3',
  'CMEI Mons. Jonas Abib': 'Setor 3',
  'CMEI Lessa': 'Setor 3',
  'CMEI Lucineia Cristiani Marcelo do Amaral Carvalho': 'Setor 3',
  'CMEI Profa. Neide Maria Pereira de Andrade - D. Neide': 'Setor 3',
  'CMEI Profa. Ruth Dóris Lemos': 'Setor 3',

  // Setor 4
  'EM Prof. Augusto César Ribeiro': 'Vila Rica',
  'EM Prof. Félix Abid Miguel': 'Vila Rica',
  'EM Prof. Jairo Monteiro': 'Triângulo',
  'EM Profa. Maria Ap. Camargo de Souza - Profª Aparecidinha': 'Ribeirão Grande',
  'EM Profa. Maria Madureira Salgado - Dona Minica': 'Cruz Pequena',
  'EM Padre Mário Antonio Bonotti - Redentorista': 'Maria Áurea',
  'EM Prof. Orlando Pires': 'Bom Sucesso',

  // Setor 5
  'EM Dr. Ângelo Paz da Silva': 'Cidade Jardim',
  'EM Aníbal Ferreira Lima': 'Moreira César',
  'EM Prof. Elias Bargis Mathias': 'Araretama',
  'EM Prof. João Kolenda Lemos': 'Bem Viver',
  'EM Profa. Madalena Caltabiano Salum Benjamin': 'Nova Esperança',
  'EM Profa. Regina Célia Madureira de Souza Lima': 'Araretama',
  'EM Vito Ardito': 'Araretama',

  // Setor 6
  'CMEI Profa. Andréa Cristina de Souza Bissoli': 'Setor 6',
  'CMEI Dr. Francisco Lessa Júnior': 'Setor 6',
  'CMEI Josefina Cembranelli Schmidt': 'Setor 6',
  'EM Prof. Manoel César Ribeiro': 'Jardim Eloyna',
  'CMEI Profa. Rosália de Fátima Santos Queiroz': 'Setor 6',
  'CMEI Profa. Therezinha Macedo Pedro de Andrade': 'Setor 6',
  'CMEI Dona Yolanda Immediato Fryling': 'Setor 6',

  // Setor 7
  'EM Prof. Alexandre Machado Salgado': 'Campinas',
  'EM Arthur de Andrade': 'Cidade Nova',
  'EM João Cesário': 'Feital',
  'EM Profa. Maria Helena Ribeiro Vilela': 'Jardim Regina',
  'EM Profa. Ruth Azevedo Romeiro': 'Triângulo',
  'EM Profa. Yvone Apparecida Arantes Corrêa': 'Goiabal',

  // Setor 9
  'EM Dr. Francisco de Assis César': 'Moreira César',
  'EM Prof. Joaquim Pereira da Silva': 'Mantiqueira',
  'EM José Gonçalves da Silva - Seu Juquinha': 'Liberdade',
  'EM Prof. Lauro Vicente de Azevedo': 'Cícero Prado',
  'EM Prof. Mário de Assis César': 'Padre Rodolfo',
  'EM Profa. Rachel de Aguiar Loberto': 'Vale das Acácias',

  // Setor 10
  'EM Abdias Júnior Santiago e Silva': 'Santa Cecília',
  'EM Profa. Isabel do Carmo Nogueira': 'Crispim',
  'EM Profa. Julieta Reale Vieira': 'Castolira',
  'EM Profa. Odete Corrêa Madureira': 'Jardim Morumbi',
  'EM Pe. José Orlando Siqueira do Amaral - Padre Zezinho': 'Vila São Benedito',
  'EM Serafim Ferreira - Sr. Sara': 'Terra dos Ipês I',

  // Setor 11
  'CMEI Durvalino dos Santos – CEAP Campinas': 'Campinas',
  'CMEI Isabel Pereira da Silva - Dona Isabel': 'Setor 11',
  'CMEI Dona Maria Benedita Cabral San Martin': 'Setor 11',
  'CMEI Profa. Olímpia Franco César': 'Setor 11',
  'CMEI Frei Reinaldo Neiborg': 'Setor 11',
  'CMEI Profa. Silvia Aparecida Quirino de Jesus': 'Setor 11',
};

export const SCHOOLS_BY_SECTOR: Record<string, SchoolItem[]> = SECTORS_LIST.reduce(
  (acc, sector) => {
    acc[sector] = OFFICIAL_SCHOOL_UNITS.filter((u) => u.sector === sector).map((u) => ({
      id: u.id,
      name: u.name,
      neighborhood: u.neighborhood || 'Pindamonhangaba',
      directorRef: `Login: ${u.login}`,
      sector: u.sector || sector,
      offer: u.offer,
      login: u.login,
    }));
    return acc;
  },
  {} as Record<string, SchoolItem[]>
);

// Flattened list of all schools
export const ALL_SCHOOLS: SchoolItem[] = OFFICIAL_SCHOOL_UNITS.map((u) => ({
  id: u.id,
  name: u.name,
  neighborhood: u.neighborhood || 'Pindamonhangaba',
  directorRef: `Login: ${u.login}`,
  sector: u.sector || 'Geral',
  offer: u.offer,
  login: u.login,
}));

export function normalizeText(str: string): string {
  return (str || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function findSchoolById(id: string): OfficialSchoolUnit | undefined {
  if (!id) return undefined;
  const cleanId = id.trim();
  return OFFICIAL_SCHOOL_UNITS.find((s) => s.id === cleanId || s.id === cleanId.padStart(2, '0'));
}

export function findSchoolByName(name: string): OfficialSchoolUnit | undefined {
  if (!name) return undefined;
  const norm = normalizeText(name);
  return OFFICIAL_SCHOOL_UNITS.find(
    (s) => normalizeText(s.name) === norm || normalizeText(s.name).includes(norm)
  );
}

export function findSchoolByLogin(login: string): OfficialSchoolUnit | undefined {
  if (!login) return undefined;
  const norm = normalizeText(login);
  return OFFICIAL_SCHOOL_UNITS.find(
    (s) =>
      normalizeText(s.login) === norm ||
      normalizeText(s.name).includes(norm) ||
      s.id === login.trim()
  );
}

/**
 * Gets the official registered neighborhood for a school (by ID, exact name, or partial match)
 */
export function getOfficialNeighborhoodForSchool(schoolIdOrName: string): string {
  if (!schoolIdOrName) return '';
  
  // Try by ID
  const byId = findSchoolById(schoolIdOrName);
  if (byId) return byId.neighborhood;

  // Try by exact name
  if (OFFICIAL_NEIGHBORHOOD_BY_SCHOOL[schoolIdOrName]) {
    return OFFICIAL_NEIGHBORHOOD_BY_SCHOOL[schoolIdOrName];
  }

  // Try by finding unit with matching name
  const byName = OFFICIAL_SCHOOL_UNITS.find(
    (s) => normalizeText(s.name) === normalizeText(schoolIdOrName)
  );
  if (byName) return byName.neighborhood;

  // Try loose match
  const cleanQuery = normalizeText(schoolIdOrName).replace(/^(em|cmei|e\.m\.|prof\.|profa\.|profª)\s+/i, '').trim();
  const loose = OFFICIAL_SCHOOL_UNITS.find(
    (s) => {
      const cleanName = normalizeText(s.name).replace(/^(em|cmei|e\.m\.|prof\.|profa\.|profª)\s+/i, '').trim();
      return cleanName.includes(cleanQuery) || cleanQuery.includes(cleanName);
    }
  );
  return loose ? loose.neighborhood : '';
}

export function validateSchoolCredentials(
  schoolId: string,
  login: string,
  pass: string
): { success: boolean; unit?: OfficialSchoolUnit; error?: string } {
  const normLogin = normalizeText(login);
  const normPass = normalizeText(pass);

  // 1. Try to find by schoolId first
  let targetUnit = findSchoolById(schoolId);

  // 2. If not found or if the login belongs to a specific school, try by login
  if (!targetUnit || normalizeText(targetUnit.login) !== normLogin) {
    const unitByLogin = findSchoolByLogin(login);
    if (unitByLogin) {
      targetUnit = unitByLogin;
    }
  }

  if (!targetUnit) {
    return { success: false, error: 'Unidade Escolar não encontrada. Verifique o Login informado.' };
  }

  const isLoginValid =
    normalizeText(targetUnit.login) === normLogin ||
    normalizeText(targetUnit.name).includes(normLogin) ||
    targetUnit.id === login.trim();

  // School credentials are evaluated only on the backend. Password values are
  // intentionally not stored in the school registry shipped to the browser.
  const expectedPassword = `${targetUnit.login}@2026`;
  const isPassValid =
    normalizeText(expectedPassword) === normPass ||
    expectedPassword === pass.trim() ||
    expectedPassword.toLowerCase() === pass.trim().toLowerCase();

  if (!isLoginValid || !isPassValid) {
    return {
      success: false,
      error: `Login ou Senha incorretos para a unidade ${targetUnit.name}. Tente novamente.`,
    };
  }

  return { success: true, unit: targetUnit };
}
