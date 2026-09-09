// server.ts
import express from "express";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import PDFDocument2 from "pdfkit";
import dotenv from "dotenv";

// src/data/schoolsData.ts
var SECTORS_LIST = [
  "Setor 1",
  "Setor 2",
  "Setor 3",
  "Setor 4",
  "Setor 5",
  "Setor 6",
  "Setor 7",
  "Setor 9",
  "Setor 10",
  "Setor 11"
];
var OFFICIAL_SCHOOL_UNITS = [
  // ==================== SETOR 1 ====================
  {
    id: "01",
    name: "EM Dr. Andr\xE9 Franco Montoro",
    offer: "EF",
    login: "Montoro",
    sector: "Setor 1",
    neighborhood: "Bela Vista"
  },
  {
    id: "02",
    name: "EM Dulce Pedrosa Romeiro Guimar\xE3es",
    offer: "EI",
    login: "Dulce",
    sector: "Setor 1",
    neighborhood: "Boa Vista"
  },
  {
    id: "03",
    name: "EM Profa. Gilda Piorini Molica",
    offer: "EF",
    login: "Gilda",
    sector: "Setor 1",
    neighborhood: "S\xE3o Judas Tadeu"
  },
  {
    id: "04",
    name: "EM Profa. Maria Aparecida Arantes Vasques",
    offer: "EF",
    login: "Arantes",
    sector: "Setor 1",
    neighborhood: "Momba\xE7a"
  },
  {
    id: "05",
    name: "EM Profa. Maria Zara Min\xE9 Renoldi dos Santos",
    offer: "EI",
    login: "Zara",
    sector: "Setor 1",
    neighborhood: "Jardim Cristina"
  },
  {
    id: "06",
    name: "EM Prof. Moacyr de Almeida",
    offer: "EF",
    login: "Moacyr",
    sector: "Setor 1",
    neighborhood: "Alto do Cardoso"
  },
  {
    id: "07",
    name: "EM Prof. Paulo Freire",
    offer: "EF",
    login: "Paulo",
    sector: "Setor 1",
    neighborhood: "Vila Prado"
  },
  // ==================== SETOR 2 ====================
  {
    id: "08",
    name: "EM Ayrton Senna da Silva",
    offer: "EF",
    login: "Ayrton",
    sector: "Setor 2",
    neighborhood: "Pasin - Moreira C\xE9sar"
  },
  {
    id: "09",
    name: "CMEI Esmeralda Silva Ramos",
    offer: "EI",
    login: "Esmeralda",
    sector: "Setor 2",
    neighborhood: "Araretama"
  },
  {
    id: "10",
    name: "CMEI Jos\xE9 Ildefonso Machado",
    offer: "EI",
    login: "Ildefonso",
    sector: "Setor 2",
    neighborhood: "Feital"
  },
  {
    id: "11",
    name: "CMEI Maria Aparecida Gomes - S\xE1 Maria",
    offer: "EI",
    login: "SaMaria",
    sector: "Setor 2",
    neighborhood: "Moreira C\xE9sar"
  },
  {
    id: "12",
    name: "CMEI Maria das Dores Santos Marcondes - Maria dos Anjos",
    offer: "EI",
    login: "MariaDosAnjos",
    sector: "Setor 2",
    neighborhood: "Setor 2"
  },
  {
    id: "13",
    name: "CMEI Maria Luiza Lima de Almeida",
    offer: "EI",
    login: "Luiza",
    sector: "Setor 2",
    neighborhood: "Setor 2"
  },
  {
    id: "14",
    name: "CMEI Marli Lemes de Moura Camargo",
    offer: "EI",
    login: "Marli",
    sector: "Setor 2",
    neighborhood: "Setor 2"
  },
  {
    id: "15",
    name: "CMEI Profa. Valdira Morgado",
    offer: "EI",
    login: "Valdira",
    sector: "Setor 2",
    neighborhood: "Setor 2"
  },
  // ==================== SETOR 3 ====================
  {
    id: "16",
    name: "CMEI CAIC",
    offer: "EI",
    login: "Caic",
    sector: "Setor 3",
    neighborhood: "Araretama"
  },
  {
    id: "17",
    name: "CMEI Jo\xE3o Fleury de Souza Amorim Filho",
    offer: "EI",
    login: "Fleury",
    sector: "Setor 3",
    neighborhood: "Setor 3"
  },
  {
    id: "18",
    name: "CMEI Mons. Jonas Abib",
    offer: "EI",
    login: "JonasAbib",
    sector: "Setor 3",
    neighborhood: "Setor 3"
  },
  {
    id: "19",
    name: "CMEI Lessa",
    offer: "EI",
    login: "Lessa",
    sector: "Setor 3",
    neighborhood: "Setor 3"
  },
  {
    id: "20",
    name: "CMEI Lucineia Cristiani Marcelo do Amaral Carvalho",
    offer: "EI",
    login: "Lucineia",
    sector: "Setor 3",
    neighborhood: "Setor 3"
  },
  {
    id: "21",
    name: "CMEI Profa. Neide Maria Pereira de Andrade - D. Neide",
    offer: "EI",
    login: "Neide",
    sector: "Setor 3",
    neighborhood: "Setor 3"
  },
  {
    id: "22",
    name: "CMEI Profa. Ruth D\xF3ris Lemos",
    offer: "EI",
    login: "RuthDoris",
    sector: "Setor 3",
    neighborhood: "Setor 3"
  },
  // ==================== SETOR 4 ====================
  {
    id: "23",
    name: "EM Prof. Augusto C\xE9sar Ribeiro",
    offer: "EF",
    login: "Augusto",
    sector: "Setor 4",
    neighborhood: "Vila Rica"
  },
  {
    id: "24",
    name: "EM Prof. F\xE9lix Abid Miguel",
    offer: "EF",
    login: "Felix",
    sector: "Setor 4",
    neighborhood: "Vila Rica"
  },
  {
    id: "25",
    name: "EM Prof. Jairo Monteiro",
    offer: "EF",
    login: "Jairo",
    sector: "Setor 4",
    neighborhood: "Tri\xE2ngulo"
  },
  {
    id: "26",
    name: "EM Profa. Maria Ap. Camargo de Souza - Prof\xAA Aparecidinha",
    offer: "AMBOS",
    login: "Aparecidinha",
    sector: "Setor 4",
    neighborhood: "Ribeir\xE3o Grande"
  },
  {
    id: "27",
    name: "EM Profa. Maria Madureira Salgado - Dona Minica",
    offer: "EI",
    login: "Minica",
    sector: "Setor 4",
    neighborhood: "Cruz Pequena"
  },
  {
    id: "28",
    name: "EM Padre M\xE1rio Antonio Bonotti - Redentorista",
    offer: "EF",
    login: "Mario",
    sector: "Setor 4",
    neighborhood: "Maria \xC1urea"
  },
  {
    id: "29",
    name: "EM Prof. Orlando Pires",
    offer: "EF",
    login: "Orlando",
    sector: "Setor 4",
    neighborhood: "Bom Sucesso"
  },
  // ==================== SETOR 5 ====================
  {
    id: "30",
    name: "EM Dr. \xC2ngelo Paz da Silva",
    offer: "EF",
    login: "Angelo",
    sector: "Setor 5",
    neighborhood: "Cidade Jardim"
  },
  {
    id: "31",
    name: "EM An\xEDbal Ferreira Lima",
    offer: "EF",
    login: "Anibal",
    sector: "Setor 5",
    neighborhood: "Moreira C\xE9sar"
  },
  {
    id: "32",
    name: "EM Prof. Elias Bargis Mathias",
    offer: "EF",
    login: "Elias",
    sector: "Setor 5",
    neighborhood: "Araretama"
  },
  {
    id: "33",
    name: "EM Prof. Jo\xE3o Kolenda Lemos",
    offer: "EF",
    login: "Kolenda",
    sector: "Setor 5",
    neighborhood: "Bem Viver"
  },
  {
    id: "34",
    name: "EM Profa. Madalena Caltabiano Salum Benjamin",
    offer: "EF",
    login: "Madalena",
    sector: "Setor 5",
    neighborhood: "Nova Esperan\xE7a"
  },
  {
    id: "35",
    name: "EM Profa. Regina C\xE9lia Madureira de Souza Lima",
    offer: "EI",
    login: "Regina",
    sector: "Setor 5",
    neighborhood: "Araretama"
  },
  {
    id: "36",
    name: "EM Vito Ardito",
    offer: "EF",
    login: "Vito",
    sector: "Setor 5",
    neighborhood: "Araretama"
  },
  // ==================== SETOR 6 ====================
  {
    id: "37",
    name: "CMEI Profa. Andr\xE9a Cristina de Souza Bissoli",
    offer: "EI",
    login: "Bissoli",
    sector: "Setor 6",
    neighborhood: "Setor 6"
  },
  {
    id: "38",
    name: "CMEI Dr. Francisco Lessa J\xFAnior",
    offer: "EI",
    login: "LessaJr",
    sector: "Setor 6",
    neighborhood: "Setor 6"
  },
  {
    id: "39",
    name: "CMEI Josefina Cembranelli Schmidt",
    offer: "EI",
    login: "Josefina",
    sector: "Setor 6",
    neighborhood: "Setor 6"
  },
  {
    id: "40",
    name: "EM Prof. Manoel C\xE9sar Ribeiro",
    offer: "EF",
    login: "Manoel",
    sector: "Setor 6",
    neighborhood: "Jardim Eloyna"
  },
  {
    id: "41",
    name: "CMEI Profa. Ros\xE1lia de F\xE1tima Santos Queiroz",
    offer: "EI",
    login: "Rosalia",
    sector: "Setor 6",
    neighborhood: "Setor 6"
  },
  {
    id: "42",
    name: "CMEI Profa. Therezinha Macedo Pedro de Andrade",
    offer: "EI",
    login: "Therezinha",
    sector: "Setor 6",
    neighborhood: "Setor 6"
  },
  {
    id: "43",
    name: "CMEI Dona Yolanda Immediato Fryling",
    offer: "EI",
    login: "Yolanda",
    sector: "Setor 6",
    neighborhood: "Setor 6"
  },
  // ==================== SETOR 7 ====================
  {
    id: "44",
    name: "EM Prof. Alexandre Machado Salgado",
    offer: "EF",
    login: "Alexandre",
    sector: "Setor 7",
    neighborhood: "Campinas"
  },
  {
    id: "45",
    name: "EM Arthur de Andrade",
    offer: "EF",
    login: "Arthur",
    sector: "Setor 7",
    neighborhood: "Cidade Nova"
  },
  {
    id: "46",
    name: "EM Jo\xE3o Ces\xE1rio",
    offer: "EF",
    login: "Joao",
    sector: "Setor 7",
    neighborhood: "Feital"
  },
  {
    id: "47",
    name: "EM Profa. Maria Helena Ribeiro Vilela",
    offer: "EI",
    login: "Helena",
    sector: "Setor 7",
    neighborhood: "Jardim Regina"
  },
  {
    id: "48",
    name: "EM Profa. Ruth Azevedo Romeiro",
    offer: "EF",
    login: "Ruth",
    sector: "Setor 7",
    neighborhood: "Tri\xE2ngulo"
  },
  {
    id: "49",
    name: "EM Profa. Yvone Apparecida Arantes Corr\xEAa",
    offer: "EF",
    login: "Yvone",
    sector: "Setor 7",
    neighborhood: "Goiabal"
  },
  // ==================== SETOR 9 ====================
  {
    id: "50",
    name: "EM Dr. Francisco de Assis C\xE9sar",
    offer: "EF",
    login: "Francisco",
    sector: "Setor 9",
    neighborhood: "Moreira C\xE9sar"
  },
  {
    id: "51",
    name: "EM Prof. Joaquim Pereira da Silva",
    offer: "EF",
    login: "Joaquim",
    sector: "Setor 9",
    neighborhood: "Mantiqueira"
  },
  {
    id: "52",
    name: "EM Jos\xE9 Gon\xE7alves da Silva - Seu Juquinha",
    offer: "EF",
    login: "Juquinha",
    sector: "Setor 9",
    neighborhood: "Liberdade"
  },
  {
    id: "53",
    name: "EM Prof. Lauro Vicente de Azevedo",
    offer: "EF",
    login: "Lauro",
    sector: "Setor 9",
    neighborhood: "C\xEDcero Prado"
  },
  {
    id: "54",
    name: "EM Prof. M\xE1rio de Assis C\xE9sar",
    offer: "EF",
    login: "Assis",
    sector: "Setor 9",
    neighborhood: "Padre Rodolfo"
  },
  {
    id: "55",
    name: "EM Profa. Rachel de Aguiar Loberto",
    offer: "EI",
    login: "Rachel",
    sector: "Setor 9",
    neighborhood: "Vale das Ac\xE1cias"
  },
  // ==================== SETOR 10 ====================
  {
    id: "56",
    name: "EM Abdias J\xFAnior Santiago e Silva",
    offer: "EF",
    login: "Abdias",
    sector: "Setor 10",
    neighborhood: "Santa Cec\xEDlia"
  },
  {
    id: "57",
    name: "EM Profa. Isabel do Carmo Nogueira",
    offer: "EF",
    login: "Isabel",
    sector: "Setor 10",
    neighborhood: "Crispim"
  },
  {
    id: "58",
    name: "EM Profa. Julieta Reale Vieira",
    offer: "EF",
    login: "Julieta",
    sector: "Setor 10",
    neighborhood: "Castolira"
  },
  {
    id: "59",
    name: "EM Profa. Odete Corr\xEAa Madureira",
    offer: "EF",
    login: "Odete",
    sector: "Setor 10",
    neighborhood: "Jardim Morumbi"
  },
  {
    id: "60",
    name: "EM Pe. Jos\xE9 Orlando Siqueira do Amaral - Padre Zezinho",
    offer: "EF",
    login: "Zezinho",
    sector: "Setor 10",
    neighborhood: "Vila S\xE3o Benedito"
  },
  {
    id: "61",
    name: "EM Serafim Ferreira - Sr. Sara",
    offer: "EF",
    login: "Serafim",
    sector: "Setor 10",
    neighborhood: "Terra dos Ip\xEAs I"
  },
  // ==================== SETOR 11 ====================
  {
    id: "62",
    name: "CMEI Durvalino dos Santos \u2013 CEAP Campinas",
    offer: "EI",
    login: "Durvalino",
    sector: "Setor 11",
    neighborhood: "Campinas"
  },
  {
    id: "63",
    name: "CMEI Isabel Pereira da Silva - Dona Isabel",
    offer: "EI",
    login: "DonaIsabel",
    sector: "Setor 11",
    neighborhood: "Setor 11"
  },
  {
    id: "64",
    name: "CMEI Dona Maria Benedita Cabral San Martin",
    offer: "EI",
    login: "SanMartin",
    sector: "Setor 11",
    neighborhood: "Setor 11"
  },
  {
    id: "65",
    name: "CMEI Profa. Ol\xEDmpia Franco C\xE9sar",
    offer: "EI",
    login: "Olimpia",
    sector: "Setor 11",
    neighborhood: "Setor 11"
  },
  {
    id: "66",
    name: "CMEI Frei Reinaldo Neiborg",
    offer: "EI",
    login: "Reinaldo",
    sector: "Setor 11",
    neighborhood: "Setor 11"
  },
  {
    id: "67",
    name: "CMEI Profa. Silvia Aparecida Quirino de Jesus",
    offer: "EI",
    login: "Silvia",
    sector: "Setor 11",
    neighborhood: "Setor 11"
  }
];
var SCHOOLS_BY_SECTOR = SECTORS_LIST.reduce(
  (acc, sector) => {
    acc[sector] = OFFICIAL_SCHOOL_UNITS.filter((u) => u.sector === sector).map((u) => ({
      id: u.id,
      name: u.name,
      neighborhood: u.neighborhood || "Pindamonhangaba",
      directorRef: `Login: ${u.login}`,
      sector: u.sector || sector,
      offer: u.offer,
      login: u.login
    }));
    return acc;
  },
  {}
);
var ALL_SCHOOLS = OFFICIAL_SCHOOL_UNITS.map((u) => ({
  id: u.id,
  name: u.name,
  neighborhood: u.neighborhood || "Pindamonhangaba",
  directorRef: `Login: ${u.login}`,
  sector: u.sector || "Geral",
  offer: u.offer,
  login: u.login
}));
function normalizeText(str) {
  return (str || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function findSchoolById(id) {
  if (!id) return void 0;
  const cleanId = id.trim();
  return OFFICIAL_SCHOOL_UNITS.find((s) => s.id === cleanId || s.id === cleanId.padStart(2, "0"));
}
function findSchoolByLogin(login) {
  if (!login) return void 0;
  const norm = normalizeText(login);
  return OFFICIAL_SCHOOL_UNITS.find(
    (s) => normalizeText(s.login) === norm || normalizeText(s.name).includes(norm) || s.id === login.trim()
  );
}
function validateSchoolCredentials(schoolId, login, pass) {
  const normLogin = normalizeText(login);
  const normPass = normalizeText(pass);
  let targetUnit = findSchoolById(schoolId);
  if (!targetUnit || normalizeText(targetUnit.login) !== normLogin) {
    const unitByLogin = findSchoolByLogin(login);
    if (unitByLogin) {
      targetUnit = unitByLogin;
    }
  }
  if (!targetUnit) {
    return { success: false, error: "Unidade Escolar n\xE3o encontrada. Verifique o Login informado." };
  }
  const isLoginValid = normalizeText(targetUnit.login) === normLogin || normalizeText(targetUnit.name).includes(normLogin) || targetUnit.id === login.trim();
  const expectedPassword = `${targetUnit.login}@2026`;
  const isPassValid = normalizeText(expectedPassword) === normPass || expectedPassword === pass.trim() || expectedPassword.toLowerCase() === pass.trim().toLowerCase();
  if (!isLoginValid || !isPassValid) {
    return {
      success: false,
      error: `Login ou Senha incorretos para a unidade ${targetUnit.name}. Tente novamente.`
    };
  }
  return { success: true, unit: targetUnit };
}

// src/utils/helpers.ts
var LABELS = {
  sphere: {
    EI: "Apenas Educa\xE7\xE3o Infantil (EI)",
    EF: "Apenas Ensino Fundamental I (EF I)",
    AMBOS: "Ambas as Etapas (EI + EF I)"
  },
  role: {
    DIRETOR: "Diretor(a)",
    PROFESSOR_CO_RESPONSAVEL: "Professor(a) Co-Respons\xE1vel"
  }
};
function generateTextSummary(data) {
  const sphereLabel = LABELS.sphere[data.sphere] || data.sphere;
  const roleLabel = data.respondentRole === "PROFESSOR_CO_RESPONSAVEL" ? "Professor(a) Co-Respons\xE1vel" : "Diretor(a)";
  const dateStr = data.updatedAt ? new Date(data.updatedAt).toLocaleString("pt-BR") : (/* @__PURE__ */ new Date()).toLocaleString("pt-BR");
  const staffData = data["EI-18"] || data.ei_18_staffData;
  const staffDetailed = staffData ? [
    `  * Professores: ${staffData.professores?.atual ?? 0} atuais (+${staffData.professores?.necessidade ?? 0} necess\xE1rios)`,
    `  * Prof. Especialistas (Arte/Ed.F\xEDsica): ${staffData.professores_especialistas?.atual ?? 0} atuais (+${staffData.professores_especialistas?.necessidade ?? 0} necess\xE1rios)`,
    `  * ASG's (Aux. Servi\xE7os Gerais): ${staffData.asgs?.atual ?? 0} atuais (+${staffData.asgs?.necessidade ?? 0} necess\xE1rios)`,
    `  * ADI's (Aux. Desenv. Infantil): ${staffData.adis?.atual ?? 0} atuais (+${staffData.adis?.necessidade ?? 0} necess\xE1rios)`,
    `  * AOE (Agentes de Org. Escolar): ${staffData.aoe?.atual ?? 0} atuais (+${staffData.aoe?.necessidade ?? 0} necess\xE1rios)`,
    `  * Estagi\xE1rios(as): ${staffData.estagiarios?.atual ?? 0} atuais (+${staffData.estagiarios?.necessidade ?? 0} necess\xE1rios)`,
    `  * Milclean (Terceirizados): ${staffData.milclean?.atual ?? 0} atuais (+${staffData.milclean?.necessidade ?? 0} necess\xE1rios)`
  ].join("\n") : `  * ${data.ei_18_staffBreakdown || "N/D"}`;
  const efStaff = data["EF-18"] || data.ef_18_staffData || (data.sphere === "AMBOS" ? data["EI-18"] || data.ei_18_staffData : void 0);
  const efStaffDetailed = efStaff ? [
    `  * Professores: ${efStaff.professores?.atual ?? 0} atuais (+${efStaff.professores?.necessidade ?? 0} necess\xE1rios)`,
    `  * Prof. Especialistas (Arte/Ed.F\xEDsica): ${efStaff.professores_especialistas?.atual ?? 0} atuais (+${efStaff.professores_especialistas?.necessidade ?? 0} necess\xE1rios)`,
    `  * ASG's (Aux. Servi\xE7os Gerais): ${efStaff.asgs?.atual ?? 0} atuais (+${efStaff.asgs?.necessidade ?? 0} necess\xE1rios)`,
    `  * ADI's (Aux. Desenv. Infantil): ${efStaff.adis?.atual ?? 0} atuais (+${efStaff.adis?.necessidade ?? 0} necess\xE1rios)`,
    `  * AOE (Agentes de Org. Escolar): ${efStaff.aoe?.atual ?? 0} atuais (+${efStaff.aoe?.necessidade ?? 0} necess\xE1rios)`,
    `  * Estagi\xE1rios(as): ${efStaff.estagiarios?.atual ?? 0} atuais (+${efStaff.estagiarios?.necessidade ?? 0} necess\xE1rios)`,
    `  * Milclean (Terceirizados): ${efStaff.milclean?.atual ?? 0} atuais (+${efStaff.milclean?.necessidade ?? 0} necess\xE1rios)`
  ].join("\n") : `  * ${data.ef_18_staffBreakdown || data.ei_18_staffBreakdown || "N/D"}`;
  const visits = data.supervisionVisitsData || {
    grebs: { dias: 0, meses: 0, anual: 0 },
    gt: { dias: 0, meses: 0, anual: 0 },
    supervisoras_estado: { dias: 0, meses: 0, anual: 0 }
  };
  const supervItem = visits.supervisoras_estado || visits.supervisoras || { dias: 0, meses: 0, anual: 0 };
  return `================================================================================
PREFEITURA MUNICIPAL DE PINDAMONHANGABA
SECRETARIA MUNICIPAL DE EDUCA\xC7\xC3O
RELAT\xD3RIO T\xC9CNICO HOMOLOGADO - QUESTION\xC1RIO DIAGN\xD3STICO MUNICIPAL
================================================================================

1. DADOS DE PROTOCOLO E HOMOLOGA\xC7\xC3O
--------------------------------------------------------------------------------
N\xFAmero de Protocolo     : ${data.protocolNumber || "N/A"}
Data e Hora de Envio    : ${dateStr}
Tempo de Preenchimento  : ${data.elapsedTimeFormatted || "N/A"} (${data.startTime || "In\xEDcio"} \xE0s ${data.endTime || "T\xE9rmino"})
Status no Sistema       : CONCLU\xCDDO / HOMOLOGADO

2. IDENTIFICA\xC7\xC3O DA UNIDADE ESCOLAR
--------------------------------------------------------------------------------
Unidade Escolar         : ${data.schoolName || "Escola Municipal"} (C\xF3digo: ${data.schoolId || "N/A"})
Setor Municipal         : ${data.schoolSector || "N\xE3o informado"}
Bairros de Abrang\xEAncia  : ${data.neighborhoodCoverage || "Pindamonhangaba"}
Etapas Ofertadas        : ${sphereLabel}

3. RESPONS\xC1VEL PELO PREENCHIMENTO & SUPERVIS\xC3O
--------------------------------------------------------------------------------
Nome do Respons\xE1vel     : ${data.directorName || "N\xE3o informado"}
Cargo / Fun\xE7\xE3o          : ${roleLabel}
E-mail Institucional    : ${data.directorEmail || "N\xE3o informado"}
Telefone de Contato     : ${data.directorPhone || "N\xE3o informado"}
Frequ\xEAncia de Visitas Recebidas:
  * GREB's                     : ${visits.grebs?.dias ?? 0} dias / ${visits.grebs?.meses ?? 0} meses / ${visits.grebs?.anual ?? 0} anual
  * Grupo de Trabalho (GT)     : ${visits.gt?.dias ?? 0} dias / ${visits.gt?.meses ?? 0} meses / ${visits.gt?.anual ?? 0} anual
  * Supervisoras de Ensino (SP): ${supervItem?.dias ?? 0} dias / ${supervItem?.meses ?? 0} meses / ${supervItem?.anual ?? 0} anual

4. PLANEJAMENTO E VIABILIDADE DE OFERTA INTEGRAL (UNI-01)
--------------------------------------------------------------------------------
${(() => {
    const uni = data["UNI-01"] || data.uni_01_data;
    const diretriz = uni?.diretriz_escolhida || data.uni_01_diretriz || "N\xE3o informado";
    const det = uni?.detalhes || {};
    let detStr = "";
    if (diretriz === "CONTINUIDADE") {
      detStr = `A\xE7\xE3o: ${det.acao_continuidade || "N/D"} | Ajuste de Salas: ${det.qtd_salas_ajuste ?? 0}`;
    } else if (diretriz === "IMPLEMENTACAO") {
      detStr = `Regime Planejado: ${det.regime_planejado || "N/D"} | Salas Planejadas: ${det.qtd_salas_implementacao ?? 0}`;
    } else if (diretriz === "AMPLIACAO") {
      detStr = `Salas Adicionais para Amplia\xE7\xE3o: ${det.qtd_salas_ampliacao ?? 0}`;
    }
    return `Diretriz Pretendida: ${diretriz}
${detStr}
Observa\xE7\xF5es da Comunidade / Infraestrutura: ${det.observacao_comunidade || "Nenhuma observa\xE7\xE3o registrada."}`;
  })()}

5. S\xCDNTESE DAS RESPOSTAS - EDUCA\xC7\xC3O INFANTIL (EI)
--------------------------------------------------------------------------------
${data.sphere === "EI" || data.sphere === "AMBOS" ? `
- Total Geral de Crian\xE7as Matriculadas (EI-01): ${data.ei_01_totalEnrolled ?? data.ei_15_totalEnrolled ?? "N/D"}
- Matr\xEDculas e Capacidades por Regime (EI-17):
  * Tempo Integral: ${data.ei_17_integralCount ?? 0} matriculados / Capacidade m\xE1x: ${data.ei_17_integralCapacity ?? 0} vagas
  * Tempo Parcial : ${data.ei_17_partialCount ?? 0} matriculados / Capacidade m\xE1x: ${data.ei_17_partialCapacity ?? 0} vagas
  * Total Geral   : ${(data.ei_17_integralCount || 0) + (data.ei_17_partialCount || 0)} matriculados / Capacidade total: ${(data.ei_17_integralCapacity || 0) + (data.ei_17_partialCapacity || 0)} vagas
- Matr\xEDculas Ocupadas por Turno (Manh\xE3 / Tarde / Integral): ${data.ei_02_occupiedMorning ?? 0} / ${data.ei_02_occupiedAfternoon ?? 0} / ${data.ei_02_occupiedIntegral ?? 0}
- Fila de Espera por Vagas: ${data.ei_03_waitingListCount ?? 0} crian\xE7as (Tempo m\xE9dio: ${data.ei_04_avgWaitTime ?? "N/D"})
- Motivos de Falta de Vaga: ${data.ei_05_reasonsNoSlot?.join(", ") || "N/D"}
- Turno com Maior Demanda: ${data.ei_06_highestDemandShift ?? "N/D"}
- Solicita\xE7\xF5es de Troca de Per\xEDodo: ${data.ei_07_shiftChangeRequests ?? "N/D"} (Qtd: ${data.ei_08_shiftChangeWaitingCount ?? 0})
- Possibilidade de Amplia\xE7\xE3o de Vagas: ${data.ei_10_expansionCapacity ?? "N/D"} (Estimativa: ${data.ei_11_additionalSlotsEstimated ?? 0} vagas)
- Recursos Priorit\xE1rios Necess\xE1rios: ${data.ei_12_resourcesNeeded?.join(", ") || "N/D"}
- Dimensionamento do Quadro de Profissionais (EI-18):
${staffDetailed}
- Territ\xF3rio Predominante: ${data.ei_19_territoryType ?? "N/D"}
- Condi\xE7\xE3o Socioecon\xF4mica Predominante: ${data.ei_20_socioeconomicProfile ?? "N/D"}
- Adequa\xE7\xE3o da Infraestrutura: ${data.ei_22_infraAdequacy ?? "N/D"}
- Espa\xE7os Dispon\xEDveis na Unidade: ${data.ei_23_availableSpaces?.join(", ") || "N/D"}
- Articula\xE7\xE3o com Rede de Prote\xE7\xE3o: ${data.ei_24_territoryArticulation ?? "N/D"}
- Rela\xE7\xE3o Escola-Fam\xEDlia: ${data.ei_25_familyRelationship ?? "N/D"}
- Autoavalia\xE7\xE3o da Qualidade Geral: ${data.ei_28_overallQuality ?? "N/D"}
` : "N\xE3o aplic\xE1vel para esta unidade (Unidade exclusiva de Ensino Fundamental)."}

5. S\xCDNTESE DAS RESPOSTAS - ENSINO FUNDAMENTAL I (EF I)
--------------------------------------------------------------------------------
${data.sphere === "EF" || data.sphere === "AMBOS" ? `
- Total de Matr\xEDculas Atendidas: ${data.ef_01_totalEnrolled ?? "N/D"}
- Turmas por Ano Escolar: ${data.ef_02_classesBreakdown || "N/D"}
- Matr\xEDculas por Turno (Manh\xE3 / Tarde / Integral): ${data.ef_03_enrolledMorning ?? 0} / ${data.ef_03_enrolledAfternoon ?? 0} / ${data.ef_03_enrolledIntegral ?? 0}
- Territ\xF3rio Predominante: ${data.sphere === "AMBOS" ? `${data.ef_04_territoryType || data.ei_19_territoryType} (Integrado EI-19)` : data.ef_04_territoryType ?? "N/D"}
- Condi\xE7\xE3o Socioecon\xF4mica Predominante: ${data.sphere === "AMBOS" ? `${data.ef_05_socioeconomicProfile || data.ei_20_socioeconomicProfile} (Integrado EI-20)` : data.ef_05_socioeconomicProfile ?? "N/D"}
- Propor\xE7\xE3o Estimada de Alunos PPIs: ${data.ef_06_ppiProportion ?? "N/D"}
- Fatores de Dificuldade de Perman\xEAncia: ${data.ef_07_retentionDifficulties?.join(", ") || "Nenhum"}
- Solicita\xE7\xF5es de Troca de Turno: ${data.ef_08_shiftChangeRequests ?? "N/D"} (${data.ef_09_shiftChangeWaitingCountAndReasons || "Sem observa\xE7\xF5es"})
- Transfer\xEAncias Anuais (Recebidas / Expedidas): ${data.ef_10_transfersReceived ?? 0} recebidas / ${data.ef_10_transfersIssued ?? 0} expedidas
- Casos de Abandono/Evas\xE3o Registrados: ${data.ef_11_dropoutCount ?? 0}
- Motivos Principais de Abandono/Evas\xE3o: ${data.ef_13_dropoutReasons?.join(", ") || "Nenhum"}
- Estrat\xE9gias de Busca Ativa Escolar: ${data.ef_14_activeSearchStrategy || "N/D"}
- Acompanhamento Individualizado de Risco: ${data.ef_15_individualizedTracking ?? "N/D"}
- Adequa\xE7\xE3o da Infraestrutura: ${data.ef_16_infraAdequacy ?? "N/D"}
- Espa\xE7os Dispon\xEDveis na Unidade: ${data.ef_17_availableSpaces?.join(", ") || "N/D"}
- Dimensionamento do Quadro de Profissionais (EF-18):
${efStaffDetailed}
- Articula\xE7\xE3o com Rede de Apoio: ${data.ef_20_territoryArticulation ?? "N/D"}
- Participa\xE7\xE3o em Avalia\xE7\xF5es Externas (SAEB/SARESP): ${data.ef_21_participatesSaeb ?? "N/D"}
- Resultados geraram \xCDndice do IDEB?: ${data.ef_21_participatesSaeb === "Sim" ? data.ef_21_idebIndexGenerated ?? "N/D" : "N\xE3o se aplica"}
- Evolu\xE7\xE3o do Desempenho dos Estudantes: ${data.ef_22_performanceEvolution ?? "N/D"}
- A\xE7\xF5es de Refor\xE7o / Recomposi\xE7\xE3o das Aprendizagens: ${data.ef_23_learningSupport ?? "N/D"}
- Rela\xE7\xE3o Escola-Fam\xEDlia: ${data.ef_25_familyRelationship ?? "N/D"}
- Autoavalia\xE7\xE3o da Qualidade Geral da Oferta: ${data.ef_28_overallQuality ?? "N/D"}
` : "N\xE3o aplic\xE1vel para esta unidade (Unidade exclusiva de Educa\xE7\xE3o Infantil)."}

================================================================================
Documento gerado automaticamente pelo Sistema de Coleta Diagn\xF3stica Municipal.
Assinatura Digital autenticada pelo Protocolo Oficial: ${data.protocolNumber}
================================================================================`;
}
function generateCSVString(data) {
  const staff = data["EI-18"] || data.ei_18_staffData;
  const efStaff = data["EF-18"] || data.ef_18_staffData || (data.sphere === "AMBOS" ? staff : void 0);
  const visits = data.supervisionVisitsData || {
    grebs: { dias: 0, meses: 0, anual: 0 },
    gt: { dias: 0, meses: 0, anual: 0 },
    supervisoras_estado: { dias: 0, meses: 0, anual: 0 }
  };
  const supervItemCsv = visits.supervisoras_estado || visits.supervisoras || { dias: 0, meses: 0, anual: 0 };
  const flatData = {
    Protocolo: data.protocolNumber,
    Data_Hora: data.updatedAt || data.createdAt,
    Municipio: data.municipality,
    Status: data.status,
    // Identificação
    Respondente_Nome: data.directorName,
    Respondente_Cargo: data.respondentRole === "DIRETOR" ? "Diretor" : "Professor Co-Respons\xE1vel",
    Respondente_Email: data.directorEmail,
    Respondente_Telefone: data.directorPhone,
    // Unidade & Triagem
    Escola_Setor: data.schoolSector || "",
    Escola_Nome: data.schoolName,
    Territorio_Bairros_Abrangencia: data.neighborhoodCoverage,
    Etapas_Ofertadas: data.sphere,
    // Visitas Frequência (Global)
    Visitas_GREBS_Dias: visits.grebs?.dias ?? "",
    Visitas_GREBS_Meses: visits.grebs?.meses ?? "",
    Visitas_GREBS_Anual: visits.grebs?.anual ?? "",
    Visitas_GT_Dias: visits.gt?.dias ?? "",
    Visitas_GT_Meses: visits.gt?.meses ?? "",
    Visitas_GT_Anual: visits.gt?.anual ?? "",
    Visitas_Supervisoras_Dias: supervItemCsv?.dias ?? "",
    Visitas_Supervisoras_Meses: supervItemCsv?.meses ?? "",
    Visitas_Supervisoras_Anual: supervItemCsv?.anual ?? "",
    // UNI-01 / ed-integral: Viabilidade e Diretriz Integral (Universal)
    Chave_ed_integral: (data["ed-integral"] || data["UNI-01"] || data.uni_01_data)?.diretriz_escolhida || data.uni_01_diretriz || "",
    UNI_01_Diretriz_Escolhida: (data["ed-integral"] || data["UNI-01"] || data.uni_01_data)?.diretriz_escolhida || data.uni_01_diretriz || "",
    UNI_01_Acao_Continuidade: (data["ed-integral"] || data["UNI-01"] || data.uni_01_data)?.detalhes?.acao_continuidade || "",
    UNI_01_Qtd_Salas_Ajuste: (data["ed-integral"] || data["UNI-01"] || data.uni_01_data)?.detalhes?.qtd_salas_ajuste ?? "",
    UNI_01_Regime_Planejado: (data["ed-integral"] || data["UNI-01"] || data.uni_01_data)?.detalhes?.regime_planejado || "",
    UNI_01_Qtd_Salas_Implementacao: (data["ed-integral"] || data["UNI-01"] || data.uni_01_data)?.detalhes?.qtd_salas_implementacao ?? "",
    UNI_01_Qtd_Salas_Ampliacao: (data["ed-integral"] || data["UNI-01"] || data.uni_01_data)?.detalhes?.qtd_salas_ampliacao ?? "",
    UNI_01_Observacao_Comunidade: (data["ed-integral"] || data["UNI-01"] || data.uni_01_data)?.detalhes?.observacao_comunidade || "",
    // EI (se aplicável)
    EI_01_Total_Matriculados: data.ei_01_totalEnrolled ?? data.ei_15_totalEnrolled ?? "",
    EI_17_Matriculas_Integral: data.ei_17_integralCount ?? "",
    EI_17_Capacidade_Integral: data.ei_17_integralCapacity ?? "",
    EI_17_Matriculas_Parcial: data.ei_17_partialCount ?? "",
    EI_17_Capacidade_Parcial: data.ei_17_partialCapacity ?? "",
    EI_17_Total_Matriculados: (data.ei_17_integralCount || 0) + (data.ei_17_partialCount || 0),
    EI_17_Capacidade_Total: (data.ei_17_integralCapacity || 0) + (data.ei_17_partialCapacity || 0),
    EI_02_Ocupadas_Manha: data.ei_02_occupiedMorning ?? "",
    EI_02_Ocupadas_Tarde: data.ei_02_occupiedAfternoon ?? "",
    EI_02_Ocupadas_Integral: data.ei_02_occupiedIntegral ?? "",
    EI_03_Fila_Espera: data.ei_03_waitingListCount ?? "",
    EI_04_Tempo_Medio_Espera: data.ei_04_avgWaitTime ?? "",
    EI_05_Motivos_Sem_Vaga: data.ei_05_reasonsNoSlot?.join("; ") ?? "",
    EI_06_Turno_Mais_Procurado: data.ei_06_highestDemandShift ?? "",
    EI_07_Solicitacoes_Troca: data.ei_07_shiftChangeRequests ?? "",
    EI_08_Qtd_Aguardando_Troca: data.ei_08_shiftChangeWaitingCount ?? "",
    EI_09_Motivo_Epoca_Troca: data.ei_09_shiftChangeReasonAndPeak ?? "",
    EI_10_Capacidade_Ampliacao: data.ei_10_expansionCapacity ?? "",
    EI_11_Vagas_Adicionais_Possiveis: data.ei_11_additionalSlotsEstimated ?? "",
    EI_12_Recursos_Necessarios: data.ei_12_resourcesNeeded?.join("; ") ?? "",
    EI_18_Professores_Atual: staff?.professores?.atual ?? "",
    EI_18_Professores_Necessidade: staff?.professores?.necessidade ?? "",
    EI_18_Especialistas_Atual: staff?.professores_especialistas?.atual ?? "",
    EI_18_Especialistas_Necessidade: staff?.professores_especialistas?.necessidade ?? "",
    EI_18_ASGs_Atual: staff?.asgs?.atual ?? "",
    EI_18_ASGs_Necessidade: staff?.asgs?.necessidade ?? "",
    EI_18_ADIs_Atual: staff?.adis?.atual ?? "",
    EI_18_ADIs_Necessidade: staff?.adis?.necessidade ?? "",
    EI_18_AOE_Atual: staff?.aoe?.atual ?? "",
    EI_18_AOE_Necessidade: staff?.aoe?.necessidade ?? "",
    EI_18_Estagiarios_Atual: staff?.estagiarios?.atual ?? "",
    EI_18_Estagiarios_Necessidade: staff?.estagiarios?.necessidade ?? "",
    EI_18_Milclean_Atual: staff?.milclean?.atual ?? "",
    EI_18_Milclean_Necessidade: staff?.milclean?.necessidade ?? "",
    EI_18_Quadro_Resumo: data.ei_18_staffBreakdown ?? "",
    EI_19_Territorio_Predominante: data.ei_19_territoryType ?? "",
    EI_20_Socioeconomico_Familias: data.ei_20_socioeconomicProfile ?? "",
    EI_21_Dificuldades_Permanencia: data.ei_21_retentionDifficulties?.join("; ") ?? "",
    EI_22_Adequacao_Infraestrutura: data.ei_22_infraAdequacy ?? "",
    EI_23_Espacos_Disponiveis: data.ei_23_availableSpaces?.join("; ") ?? "",
    EI_24_Articulacao_Rede: data.ei_24_territoryArticulation ?? "",
    EI_25_Relacao_Familias: data.ei_25_familyRelationship ?? "",
    EI_26_Planejamento_Territorio: data.ei_26_considersTerritoryPlanning ?? "",
    EI_27_Aspectos_Prioritarios: data.ei_27_focusAspects?.join("; ") ?? "",
    EI_28_Qualidade_Geral: data.ei_28_overallQuality ?? "",
    // EF (se aplicável)
    EF_01_Total_Matriculas: data.ef_01_totalEnrolled ?? "",
    EF_02_Turmas_Por_Ano: data.ef_02_classesBreakdown ?? "",
    EF_03_Matriculas_Manha: data.ef_03_enrolledMorning ?? "",
    EF_03_Matriculas_Tarde: data.ef_03_enrolledAfternoon ?? "",
    EF_03_Matriculas_Integral: data.ef_03_enrolledIntegral ?? "",
    EF_04_Territorio_Predominante: data.sphere === "AMBOS" ? data.ef_04_territoryType || data.ei_19_territoryType || "" : data.ef_04_territoryType ?? "",
    EF_05_Socioeconomico_Familias: data.sphere === "AMBOS" ? data.ef_05_socioeconomicProfile || data.ei_20_socioeconomicProfile || "" : data.ef_05_socioeconomicProfile ?? "",
    EF_06_Proporcao_PPIs: data.ef_06_ppiProportion ?? "",
    EF_07_Dificuldades_Permanencia: data.ef_07_retentionDifficulties?.join("; ") ?? "",
    EF_08_Solicitacoes_Troca: data.ef_08_shiftChangeRequests ?? "",
    EF_09_Qtd_Motivos_Troca: data.ef_09_shiftChangeWaitingCountAndReasons ?? "",
    EF_10_Transferencias_Recebidas: data.ef_10_transfersReceived ?? "",
    EF_10_Transferencias_Expedidas: data.ef_10_transfersIssued ?? "",
    EF_11_Abandono_Escolar: data.ef_11_dropoutCount ?? "",
    EF_13_Motivos_Abandono_Evasao: data.ef_13_dropoutReasons?.join("; ") ?? "",
    EF_14_Busca_Ativa_Escolar: data.ef_14_activeSearchStrategy ?? "",
    EF_15_Acompanhamento_Risco_Evasao: data.ef_15_individualizedTracking ?? "",
    EF_16_Adequacao_Infraestrutura: data.ef_16_infraAdequacy ?? "",
    EF_17_Espacos_Disponiveis: data.ef_17_availableSpaces?.join("; ") ?? "",
    EF_18_Professores_Atual: efStaff?.professores?.atual ?? "",
    EF_18_Professores_Necessidade: efStaff?.professores?.necessidade ?? "",
    EF_18_Especialistas_Atual: efStaff?.professores_especialistas?.atual ?? "",
    EF_18_Especialistas_Necessidade: efStaff?.professores_especialistas?.necessidade ?? "",
    EF_18_ASGs_Atual: efStaff?.asgs?.atual ?? "",
    EF_18_ASGs_Necessidade: efStaff?.asgs?.necessidade ?? "",
    EF_18_ADIs_Atual: efStaff?.adis?.atual ?? "",
    EF_18_ADIs_Necessidade: efStaff?.adis?.necessidade ?? "",
    EF_18_AOE_Atual: efStaff?.aoe?.atual ?? "",
    EF_18_AOE_Necessidade: efStaff?.aoe?.necessidade ?? "",
    EF_18_Estagiarios_Atual: efStaff?.estagiarios?.atual ?? "",
    EF_18_Estagiarios_Necessidade: efStaff?.estagiarios?.necessidade ?? "",
    EF_18_Milclean_Atual: efStaff?.milclean?.atual ?? "",
    EF_18_Milclean_Necessidade: efStaff?.milclean?.necessidade ?? "",
    EF_18_Quadro_Resumo: data.ef_18_staffBreakdown ?? (data.sphere === "AMBOS" ? data.ei_18_staffBreakdown ?? "" : ""),
    EF_20_Articulacao_Rede: data.ef_20_territoryArticulation ?? "",
    EF_21_Participa_Saeb: data.ef_21_participatesSaeb ?? "",
    EF_21_IDEB: data.ef_21_participatesSaeb === "Sim" ? data.ef_21_idebIndexGenerated ?? "" : "N\xE3o se aplica",
    EF_22_Evolucao_Desempenho: data.ef_22_performanceEvolution ?? "",
    EF_23_Reforco_Escolar: data.ef_23_learningSupport ?? "",
    EF_25_Relacao_Familias: data.ef_25_familyRelationship ?? "",
    EF_26_Planejamento_Comunidade: data.ef_26_considersTerritoryPlanning ?? "",
    EF_27_Aspectos_Prioritarios: data.ef_27_focusAspects?.join("; ") ?? "",
    EF_28_Qualidade_Geral: data.ef_28_overallQuality ?? ""
  };
  const headers = Object.keys(flatData);
  const values = Object.values(flatData).map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`);
  return "\uFEFF" + headers.join(";") + "\n" + values.join(";");
}

// src/utils/pdfQuestionnaireGenerator.ts
import PDFDocument from "pdfkit";

// src/data/steps.ts
var ALL_STEPS = [
  // ================= TELA DE IDENTIFICAÇÃO E TRIAGEM =================
  {
    id: "ETAPA_0_IDENTIFICACAO",
    stepCode: "GERAL-01",
    blockId: "TRIAGEM",
    blockLabel: "Identifica\xE7\xE3o \u2022 Etapa Inicial",
    title: "Identifica\xE7\xE3o do Respondente",
    shortLabel: "Identifica\xE7\xE3o",
    directorPrompt: "Ol\xE1! Bem-vindo(a) ao Question\xE1rio Diagn\xF3stico Municipal da Secretaria Municipal de Educa\xE7\xE3o de Pindamonhangaba. Por favor, identifique-se e informe seu cargo na unidade escolar.",
    description: "Preenchimento dos dados do respons\xE1vel pelas informa\xE7\xF5es prestadas.",
    module: "TRIAGEM",
    appliesTo: ["ALL"]
  },
  {
    id: "ETAPA_1_TRIAGEM",
    stepCode: "GERAL-02",
    blockId: "TRIAGEM",
    blockLabel: "Triagem \u2022 Unidade e Oferta",
    title: "Dados da Unidade e Triagem de Oferta",
    shortLabel: "Unidade & Oferta",
    directorPrompt: "Informe o nome da escola, o territ\xF3rio/bairro(s) de abrang\xEAncia e selecione a(s) etapa(s) de ensino ofertada(s) nesta unidade.",
    description: "A sele\xE7\xE3o da etapa filtra automaticamente o question\xE1rio para a sua realidade escolar.",
    module: "TRIAGEM",
    appliesTo: ["ALL"]
  },
  {
    id: "ETAPA_2_VISITAS_SUPERVISAO",
    stepCode: "GERAL-03",
    blockId: "TRIAGEM",
    blockLabel: "Acompanhamento Institucional \u2022 Frequ\xEAncia de Visitas",
    title: "Frequ\xEAncia de Visitas T\xE9cnicas e Supervis\xE3o Escolar",
    shortLabel: "Visitas GREB/GT/Supervis\xE3o",
    directorPrompt: "Com qual frequ\xEAncia, recebe visita das GREB's, Grupo de Trabalho GT e Supervisoras de Ensino do Estado?",
    description: "Quadro para inser\xE7\xE3o num\xE9rica de frequ\xEAncia, dividido em dias, meses ou anual para cada equipe t\xE9cnica/supervisora.",
    module: "TRIAGEM",
    appliesTo: ["ALL"]
  },
  {
    id: "UNI_01",
    stepCode: "UNI-01",
    key: "ed-integral",
    blockId: "OFERTA_INTEGRAL",
    blockLabel: "Planejamento e Viabilidade \u2022 Oferta Integral",
    title: "Viabilidade e Diretriz da Oferta de Ensino Integral",
    shortLabel: "Diretriz Ensino Integral (ed-integral)",
    directorPrompt: "Considerando a estrutura f\xEDsica atual, o interesse da comunidade escolar e a viabilidade operacional, selecione a diretriz pretendida para o Ensino Integral nesta unidade.",
    description: "An\xE1lise de viabilidade t\xE9cnica, f\xEDsica e anu\xEAncia da comunidade escolar quanto ao regime de atendimento.",
    module: "TRIAGEM",
    appliesTo: ["ALL"]
  },
  // ================= [MÓDULO EI] EDUCAÇÃO INFANTIL =================
  // Bloco 1: Demanda e Matrículas
  {
    id: "EI_01",
    stepCode: "EI-01",
    blockId: "EI_BLOCO_1",
    blockLabel: "EI Bloco 1 \u2022 Demanda e Matr\xEDculas",
    title: "N\xFAmero Total de Crian\xE7as Matriculadas",
    shortLabel: "Total de Alunos (EI)",
    directorPrompt: "Qual \xE9 o n\xFAmero total de crian\xE7as atualmente matriculadas na Educa\xE7\xE3o Infantil?",
    description: "Contagem geral de alunos ativos na unidade escolar.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_02",
    stepCode: "EI-02",
    blockId: "EI_BLOCO_1",
    blockLabel: "EI Bloco 1 \u2022 Demanda e Matr\xEDculas",
    title: "Vagas Ocupadas por Turno",
    shortLabel: "Vagas Ocupadas (EI)",
    directorPrompt: "Informe o n\xFAmero de vagas atualmente ocupadas nos turnos: Manh\xE3, Tarde e Integral.",
    description: "Distribui\xE7\xE3o dos alunos matriculados nos diferentes per\xEDodos da Educa\xE7\xE3o Infantil.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_03",
    stepCode: "EI-03",
    blockId: "EI_BLOCO_1",
    blockLabel: "EI Bloco 1 \u2022 Demanda e Matr\xEDculas",
    title: "Lista de Espera por Vaga",
    shortLabel: "Fila de Espera (EI)",
    directorPrompt: "Quantas crian\xE7as encontram-se atualmente em lista de espera na Educa\xE7\xE3o Infantil?",
    description: "Demanda reprimida de crian\xE7as cadastradas aguardando vaga.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_04",
    stepCode: "EI-04",
    blockId: "EI_BLOCO_1",
    blockLabel: "EI Bloco 1 \u2022 Demanda e Matr\xEDculas",
    title: "Tempo M\xE9dio de Espera na Lista",
    shortLabel: "Tempo de Espera (EI)",
    directorPrompt: "Qual o tempo m\xE9dio de espera das crian\xE7as na lista de espera?",
    description: "Tempo decorrido entre o cadastro da crian\xE7a e a convoca\xE7\xE3o para matr\xEDcula.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_05",
    stepCode: "EI-05",
    blockId: "EI_BLOCO_1",
    blockLabel: "EI Bloco 1 \u2022 Demanda e Matr\xEDculas",
    title: "Motivos para a N\xE3o Obten\xE7\xE3o de Vaga",
    shortLabel: "Motivos s/ Vaga (EI)",
    directorPrompt: "Quais os principais motivos relatados pelas fam\xEDlias para a n\xE3o obten\xE7\xE3o de vaga?",
    description: "Fatores que impedem o atendimento imediato da fam\xEDlia na escola.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_06",
    stepCode: "EI-06",
    blockId: "EI_BLOCO_1",
    blockLabel: "EI Bloco 1 \u2022 Demanda e Matr\xEDculas",
    title: "Turno de Maior Procura na Fila",
    shortLabel: "Turno Mais Procurado (EI)",
    directorPrompt: "Qual o turno de maior procura entre as fam\xEDlias em lista de espera?",
    description: "Prefer\xEAncia de jornada indicada pelas fam\xEDlias cadastradas.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_07",
    stepCode: "EI-07",
    blockId: "EI_BLOCO_1",
    blockLabel: "EI Bloco 1 \u2022 Demanda e Matr\xEDculas",
    title: "Solicita\xE7\xF5es de Troca de Per\xEDodo/Turno",
    shortLabel: "Freq. Trocas (EI)",
    directorPrompt: "H\xE1 solicita\xE7\xF5es de fam\xEDlias para troca de per\xEDodo (turno) das crian\xE7as j\xE1 matriculadas?",
    description: "Frequ\xEAncia de pedidos para transi\xE7\xE3o entre turnos parciais ou migra\xE7\xE3o para o integral.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_08",
    stepCode: "EI-08",
    blockId: "EI_BLOCO_1",
    blockLabel: "EI Bloco 1 \u2022 Demanda e Matr\xEDculas",
    title: "Quantidade Aguardando Troca de Per\xEDodo",
    shortLabel: "Qtd. Trocas (EI)",
    directorPrompt: "Caso haja solicita\xE7\xF5es de troca, qual o n\xFAmero estimado de crian\xE7as aguardando?",
    description: "Volume de estudantes que pleiteiam altera\xE7\xE3o de hor\xE1rio.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_09",
    stepCode: "EI-09",
    blockId: "EI_BLOCO_1",
    blockLabel: "EI Bloco 1 \u2022 Demanda e Matr\xEDculas",
    title: "Motivo da Troca e \xC9poca de Maior Procura",
    shortLabel: "Motivo/\xC9poca Trocas (EI)",
    directorPrompt: "Qual o principal motivo relatado para a troca de per\xEDodo e em qual \xE9poca do ano h\xE1 maior procura?",
    description: "Justificativas familiares e sazonalidade das solicita\xE7\xF5es de troca.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_10",
    stepCode: "EI-10",
    blockId: "EI_BLOCO_1",
    blockLabel: "EI Bloco 1 \u2022 Demanda e Matr\xEDculas",
    title: "Capacidade F\xEDsica para Amplia\xE7\xE3o de Vagas",
    shortLabel: "Capacidade F\xEDsica (EI)",
    directorPrompt: "A unidade possui capacidade f\xEDsica e estrutural para ampliar o n\xFAmero de vagas ofertadas?",
    description: "Potencial de expans\xE3o do pr\xE9dio escolar existente.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_11",
    stepCode: "EI-11",
    blockId: "EI_BLOCO_1",
    blockLabel: "EI Bloco 1 \u2022 Demanda e Matr\xEDculas",
    title: "Vagas Adicionais Poss\xEDveis",
    shortLabel: "Vagas Adicionais (EI)",
    directorPrompt: "Caso haja capacidade estrutural, qual o n\xFAmero estimado de vagas adicionais poss\xEDveis?",
    description: "Proje\xE7\xE3o num\xE9rica de expans\xE3o na unidade.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_12",
    stepCode: "EI-12",
    blockId: "EI_BLOCO_1",
    blockLabel: "EI Bloco 1 \u2022 Demanda e Matr\xEDculas",
    title: "Recursos Necess\xE1rios para Viabilizar a Amplia\xE7\xE3o",
    shortLabel: "Recursos Necess\xE1rios (EI)",
    directorPrompt: "Quais recursos seriam necess\xE1rios para viabilizar a amplia\xE7\xE3o do atendimento?",
    description: "Necessidades de infraestrutura, quadro de pessoal, mobili\xE1rio e servi\xE7os.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  // Bloco 2: Perfil e Funcionamento da Unidade em Operação (EI)
  {
    id: "EI_17",
    stepCode: "EI-17",
    blockId: "EI_BLOCO_2",
    blockLabel: "EI Bloco 2 \u2022 Perfil e Funcionamento",
    title: "Crian\xE7as em Tempo Integral vs. Parcial",
    shortLabel: "Integral vs Parcial (EI)",
    directorPrompt: "Informe a quantidade de crian\xE7as matriculadas e a capacidade m\xE1xima total para Tempo Integral e Tempo Parcial.",
    description: "Divis\xE3o de matr\xEDculas e capacidade m\xE1xima de atendimento por regime de perman\xEAncia na escola.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_18",
    stepCode: "EI-18",
    blockId: "EI_BLOCO_2",
    blockLabel: "EI Bloco 2 \u2022 Perfil e Funcionamento",
    title: "Dimensionamento do Quadro de Profissionais",
    shortLabel: "Quadro de Profissionais (EI)",
    directorPrompt: "Informe a quantidade atual de profissionais em exerc\xEDcio e a necessidade adicional de contrata\xE7\xE3o/aloca\xE7\xE3o.",
    description: "Informe a quantidade atual de profissionais em exerc\xEDcio e a necessidade adicional de contrata\xE7\xE3o/aloca\xE7\xE3o.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_19",
    stepCode: "EI-19",
    blockId: "EI_BLOCO_2",
    blockLabel: "EI Bloco 2 \u2022 Perfil e Funcionamento",
    title: "Tipo de Territ\xF3rio Predominante",
    shortLabel: "Territ\xF3rio (EI)",
    directorPrompt: "Qual \xE9 o tipo de territ\xF3rio predominante entre as crian\xE7as atendidas na Educa\xE7\xE3o Infantil?",
    description: "Classifica\xE7\xE3o territorial da \xE1rea de resid\xEAncia das fam\xEDlias.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_20",
    stepCode: "EI-20",
    blockId: "EI_BLOCO_2",
    blockLabel: "EI Bloco 2 \u2022 Perfil e Funcionamento",
    title: "Condi\xE7\xF5es Socioecon\xF4micas das Fam\xEDlias",
    shortLabel: "Perfil Socioecon\xF4mico (EI)",
    directorPrompt: "Como voc\xEA avalia as condi\xE7\xF5es socioecon\xF4micas predominantes das fam\xEDlias atendidas?",
    description: "Diagn\xF3stico de vulnerabilidade e estabilidade econ\xF4mica da comunidade escolar.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_21",
    stepCode: "EI-21",
    blockId: "EI_BLOCO_2",
    blockLabel: "EI Bloco 2 \u2022 Perfil e Funcionamento",
    title: "Dificuldades das Fam\xEDlias para Perman\xEAncia",
    shortLabel: "Perman\xEAncia Familiar (EI)",
    directorPrompt: "Quais as principais dificuldades enfrentadas pelas fam\xEDlias para garantir a perman\xEAncia da crian\xE7a? (at\xE9 3)",
    description: "Fatores que afetam assiduidade e continuidade na Educa\xE7\xE3o Infantil.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_22",
    stepCode: "EI-22",
    blockId: "EI_BLOCO_2",
    blockLabel: "EI Bloco 2 \u2022 Perfil e Funcionamento",
    title: "Adequa\xE7\xE3o da Infraestrutura F\xEDsica",
    shortLabel: "Infraestrutura Atual (EI)",
    directorPrompt: "A infraestrutura f\xEDsica atual atende adequadamente \xE0 demanda da Educa\xE7\xE3o Infantil?",
    description: "Avalia\xE7\xE3o das condi\xE7\xF5es das salas, banheiros, ventila\xE7\xE3o e seguran\xE7a.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_23",
    stepCode: "EI-23",
    blockId: "EI_BLOCO_2",
    blockLabel: "EI Bloco 2 \u2022 Perfil e Funcionamento",
    title: "Espa\xE7os e Recursos Dispon\xEDveis",
    shortLabel: "Espa\xE7os Dispon\xEDveis (EI)",
    directorPrompt: "Selecione os espa\xE7os e recursos pedag\xF3gicos dispon\xEDveis na unidade.",
    description: "Parque, Sala de Leitura, Cantinho da Leitura, refeit\xF3rio, ber\xE7\xE1rio, sala de AEE, acessibilidade.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_24",
    stepCode: "EI-24",
    blockId: "EI_BLOCO_2",
    blockLabel: "EI Bloco 2 \u2022 Perfil e Funcionamento",
    title: "Articula\xE7\xE3o com a Rede do Territ\xF3rio",
    shortLabel: "Articula\xE7\xE3o de Rede (EI)",
    directorPrompt: "A unidade desenvolve a\xE7\xF5es de articula\xE7\xE3o com os equipamentos do territ\xF3rio (Sa\xFAde, CRAS, OSCs)?",
    description: "Parcerias intersetoriais para apoio integral \xE0 primeira inf\xE2ncia.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_25",
    stepCode: "EI-25",
    blockId: "EI_BLOCO_2",
    blockLabel: "EI Bloco 2 \u2022 Perfil e Funcionamento",
    title: "Rela\xE7\xE3o da Escola com as Fam\xEDlias",
    shortLabel: "Rela\xE7\xE3o c/ Fam\xEDlias (EI)",
    directorPrompt: "Como voc\xEA avalia a rela\xE7\xE3o entre a unidade escolar e as fam\xEDlias das crian\xE7as?",
    description: "Grau de acolhimento, engajamento e comunica\xE7\xE3o com os respons\xE1veis.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_26",
    stepCode: "EI-26",
    blockId: "EI_BLOCO_2",
    blockLabel: "EI Bloco 2 \u2022 Perfil e Funcionamento",
    title: "Planejamento Pedag\xF3gico e Territ\xF3rio",
    shortLabel: "Curr\xEDculo & Territ\xF3rio (EI)",
    directorPrompt: "A unidade considera as caracter\xEDsticas e demandas do territ\xF3rio no planejamento pedag\xF3gico?",
    description: "Contextualiza\xE7\xE3o curricular e valoriza\xE7\xE3o dos saberes comunit\xE1rios.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_27",
    stepCode: "EI-27",
    blockId: "EI_BLOCO_2",
    blockLabel: "EI Bloco 2 \u2022 Perfil e Funcionamento",
    title: "Aspectos Priorit\xE1rios para Expans\xE3o/Aprimoramento",
    shortLabel: "Aprimoramentos (EI)",
    directorPrompt: "Quais aspectos deveriam receber maior aten\xE7\xE3o na expans\xE3o ou aprimoramento da Educa\xE7\xE3o Infantil? (at\xE9 3)",
    description: "Prioridades estrat\xE9gicas para investimentos futuros.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  {
    id: "EI_28",
    stepCode: "EI-28",
    blockId: "EI_BLOCO_2",
    blockLabel: "EI Bloco 2 \u2022 Perfil e Funcionamento",
    title: "Avalia\xE7\xE3o Geral da Qualidade da EI",
    shortLabel: "Qualidade Geral (EI)",
    directorPrompt: "Qual \xE9 a sua avalia\xE7\xE3o geral sobre a qualidade da Educa\xE7\xE3o Infantil ofertada pela unidade?",
    description: "Autoavalia\xE7\xE3o global do trabalho pedag\xF3gico e de cuidado na unidade.",
    module: "EI",
    appliesTo: ["EI", "AMBOS"]
  },
  // ================= [MÓDULO EF] ENSINO FUNDAMENTAL I =================
  // Bloco 1: Perfil dos Estudantes Matriculados
  {
    id: "EF_01",
    stepCode: "EF-01",
    blockId: "EF_BLOCO_1",
    blockLabel: "EF Bloco 1 \u2022 Perfil dos Estudantes",
    title: "Total de Matr\xEDculas Ativas nos Anos iniciais do EF",
    shortLabel: "Total de Alunos (Anos iniciais do EF)",
    directorPrompt: "Qual \xE9 o n\xFAmero total de matr\xEDculas ativas no Ensino Fundamental I (1\xBA ao 5\xBA ano)?",
    description: "Contagem geral de estudantes matriculados nos Anos Iniciais.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_02",
    stepCode: "EF-02",
    blockId: "EF_BLOCO_1",
    blockLabel: "EF Bloco 1 \u2022 Perfil dos Estudantes",
    title: "Turmas por Ano/S\xE9rie e Turno",
    shortLabel: "Turmas por Ano (Anos iniciais do EF)",
    directorPrompt: "Informe a distribui\xE7\xE3o de turmas por ano/s\xE9rie (1\xBA ao 5\xBA ano) e turno.",
    description: "Organiza\xE7\xE3o das classes nos per\xEDodos matutino, vespertino e integral.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_03",
    stepCode: "EF-03",
    blockId: "EF_BLOCO_1",
    blockLabel: "EF Bloco 1 \u2022 Perfil dos Estudantes",
    title: "Matr\xEDculas por Turno (Manh\xE3, Tarde, Integral)",
    shortLabel: "Turnos de Atendimento (Anos iniciais do EF)",
    directorPrompt: "Informe o n\xFAmero de estudantes matriculados em cada turno: Manh\xE3, Tarde e Integral.",
    description: "Distribui\xE7\xE3o dos estudantes por turno de atendimento nos Anos iniciais do EF.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_04",
    stepCode: "EF-04",
    blockId: "EF_BLOCO_1",
    blockLabel: "EF Bloco 1 \u2022 Perfil dos Estudantes",
    title: "Tipo de Territ\xF3rio Predominante",
    shortLabel: "Territ\xF3rio (Anos iniciais do EF)",
    directorPrompt: "Qual \xE9 o tipo de territ\xF3rio predominante entre os estudantes do Fundamental I?",
    description: "Classifica\xE7\xE3o geogr\xE1fica e territorial (Urbano, Rural, Periurbano, Misto).",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_05",
    stepCode: "EF-05",
    blockId: "EF_BLOCO_1",
    blockLabel: "EF Bloco 1 \u2022 Perfil dos Estudantes",
    title: "Condi\xE7\xF5es Socioecon\xF4micas das Fam\xEDlias",
    shortLabel: "Perfil Socioecon\xF4mico (Anos iniciais do EF)",
    directorPrompt: "Como voc\xEA avalia as condi\xE7\xF5es socioecon\xF4micas predominantes das fam\xEDlias atendidas?",
    description: "N\xEDvel socioecon\xF4mico e depend\xEAncia de suporte social das fam\xEDlias nos Anos iniciais do EF.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_06",
    stepCode: "EF-06",
    blockId: "EF_BLOCO_1",
    blockLabel: "EF Bloco 1 \u2022 Perfil dos Estudantes",
    title: "Propor\xE7\xE3o Estimada de Estudantes PPIs",
    shortLabel: "Perfil PPIs (Anos iniciais do EF)",
    directorPrompt: "Qual \xE9 a propor\xE7\xE3o estimada de estudantes autodeclarados pretos, pardos e ind\xEDgenas (PPIs)?",
    description: "Indicador sociodemogr\xE1fico para pol\xEDticas de equidade e promo\xE7\xE3o da igualdade racial.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_07",
    stepCode: "EF-07",
    blockId: "EF_BLOCO_1",
    blockLabel: "EF Bloco 1 \u2022 Perfil dos Estudantes",
    title: "Dificuldades das Fam\xEDlias no Acompanhamento Escolar",
    shortLabel: "Acompanhamento Familiar (Anos iniciais do EF)",
    directorPrompt: "Quais as principais dificuldades enfrentadas pelas fam\xEDlias para garantir a perman\xEAncia e acompanhamento escolar? (at\xE9 3)",
    description: "Barreiras que afetam a rotina de estudos e assiduidade dos estudantes.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_08",
    stepCode: "EF-08",
    blockId: "EF_BLOCO_1",
    blockLabel: "EF Bloco 1 \u2022 Perfil dos Estudantes",
    title: "Solicita\xE7\xF5es de Troca de Per\xEDodo/Turno",
    shortLabel: "Freq. Trocas (Anos iniciais do EF)",
    directorPrompt: "H\xE1 solicita\xE7\xF5es de fam\xEDlias para troca de per\xEDodo (turno) dos estudantes j\xE1 matriculados?",
    description: "Frequ\xEAncia de pedidos de transfer\xEAncia de turno no Fundamental I.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_09",
    stepCode: "EF-09",
    blockId: "EF_BLOCO_1",
    blockLabel: "EF Bloco 1 \u2022 Perfil dos Estudantes",
    title: "Quantidade Aguardando Troca e Principais Motivos",
    shortLabel: "Qtd/Motivos Troca (Anos iniciais do EF)",
    directorPrompt: "Qual a quantidade estimada de estudantes aguardando troca de per\xEDodo e os principais motivos relatados?",
    description: "Volume e justificativas familiares para mudan\xE7a de turno nos Anos iniciais do EF.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  // Bloco 2: Frequência, Transferências e Evasão
  {
    id: "EF_10",
    stepCode: "EF-10",
    blockId: "EF_BLOCO_2",
    blockLabel: "EF Bloco 2 \u2022 Frequ\xEAncia e Movimento",
    title: "Transfer\xEAncias Recebidas e Expedidas",
    shortLabel: "Transfer\xEAncias (Anos iniciais do EF)",
    directorPrompt: "Informe o n\xFAmero de transfer\xEAncias RECEBIDAS e EXPEDIDAS no ano corrente nos Anos iniciais do EF.",
    description: "Fluxo de movimenta\xE7\xE3o e mobilidade discente na unidade escolar.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_11",
    stepCode: "EF-11",
    blockId: "EF_BLOCO_2",
    blockLabel: "EF Bloco 2 \u2022 Frequ\xEAncia e Movimento",
    title: "Estudantes em Abandono Escolar",
    shortLabel: "Abandono Escolar (Anos iniciais do EF)",
    directorPrompt: "Quantos estudantes abandonaram a escola no \xFAltimo ano letivo conclu\xEDdo?",
    description: "Registro de casos de abandono escolar formalmente identificados.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_13",
    stepCode: "EF-13",
    blockId: "EF_BLOCO_2",
    blockLabel: "EF Bloco 2 \u2022 Frequ\xEAncia e Movimento",
    title: "Principais Motivos de Abandono/Evas\xE3o",
    shortLabel: "Motivos de Evas\xE3o (Anos iniciais do EF)",
    directorPrompt: "Quais os principais motivos identificados para os casos de abandono/evas\xE3o? (at\xE9 3)",
    description: "Fatores determinantes para a infrequ\xEAncia grave e abandono no territ\xF3rio.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_14",
    stepCode: "EF-14",
    blockId: "EF_BLOCO_2",
    blockLabel: "EF Bloco 2 \u2022 Frequ\xEAncia e Movimento",
    title: "Estrat\xE9gias de Busca Ativa Escolar",
    shortLabel: "Busca Ativa (Anos iniciais do EF)",
    directorPrompt: "A unidade desenvolve estrat\xE9gias formais de Busca Ativa Escolar para alunos com frequ\xEAncia irregular?",
    description: "Protocolos de contato familiar, visitas domiciliares e acionamento da rede de prote\xE7\xE3o.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_15",
    stepCode: "EF-15",
    blockId: "EF_BLOCO_2",
    blockLabel: "EF Bloco 2 \u2022 Frequ\xEAncia e Movimento",
    title: "Acompanhamento de Alunos em Risco de Evas\xE3o",
    shortLabel: "Acompanhamento Individual (Anos iniciais do EF)",
    directorPrompt: "Existe mecanismo formal de acompanhamento individualizado de alunos em risco de evas\xE3o?",
    description: "Monitoramento preventivo de estudantes com alertas de infrequ\xEAncia ou defasagem.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  // Bloco 3: Infraestrutura e Funcionamento Institucional
  {
    id: "EF_16",
    stepCode: "EF-16",
    blockId: "EF_BLOCO_3",
    blockLabel: "EF Bloco 3 \u2022 Infraestrutura e Gest\xE3o",
    title: "Adequa\xE7\xE3o da Infraestrutura F\xEDsica",
    shortLabel: "Infraestrutura Atual (Anos iniciais do EF)",
    directorPrompt: "A infraestrutura f\xEDsica atual atende adequadamente ao n\xFAmero de matr\xEDculas do Fundamental I?",
    description: "Condi\xE7\xF5es gerais das salas de aula, conforto t\xE9rmico, sanit\xE1rios e seguran\xE7a.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_17",
    stepCode: "EF-17",
    blockId: "EF_BLOCO_3",
    blockLabel: "EF Bloco 3 \u2022 Infraestrutura e Gest\xE3o",
    title: "Espa\xE7os e Recursos Dispon\xEDveis",
    shortLabel: "Espa\xE7os Dispon\xEDveis (Anos iniciais do EF)",
    directorPrompt: "Selecione os espa\xE7os e recursos pedag\xF3gicos dispon\xEDveis na unidade.",
    description: "Sala de Leitura, Cantinho da Leitura, Inform\xE1tica, Playground, P\xE1tio, Quadra sem cobertura, Quadra Coberta, Refeit\xF3rio, AEE, Acessibilidade.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_18",
    stepCode: "EF-18",
    blockId: "EF_BLOCO_3",
    blockLabel: "EF Bloco 3 \u2022 Infraestrutura e Gest\xE3o",
    title: "Dimensionamento do Quadro de Profissionais",
    shortLabel: "Quadro de Profissionais (Anos iniciais do EF)",
    directorPrompt: "Informe a quantidade atual de profissionais em exerc\xEDcio e a necessidade adicional de contrata\xE7\xE3o/aloca\xE7\xE3o.",
    description: "Informe a quantidade atual de profissionais em exerc\xEDcio e a necessidade adicional de contrata\xE7\xE3o/aloca\xE7\xE3o.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_20",
    stepCode: "EF-20",
    blockId: "EF_BLOCO_3",
    blockLabel: "EF Bloco 3 \u2022 Infraestrutura e Gest\xE3o",
    title: "Articula\xE7\xE3o com a Rede do Territ\xF3rio",
    shortLabel: "Articula\xE7\xE3o Intersetorial (Anos iniciais do EF)",
    directorPrompt: "A escola desenvolve a\xE7\xF5es de articula\xE7\xE3o com equipamentos do territ\xF3rio (Sa\xFAde, CRAS, OSCs)?",
    description: "Trabalho em rede para prote\xE7\xE3o integral dos estudantes.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  // Bloco 4: Aprendizagem e Indicadores Pedagógicos
  {
    id: "EF_21",
    stepCode: "EF-21",
    blockId: "EF_BLOCO_4",
    blockLabel: "EF Bloco 4 \u2022 Aprendizagem e Avalia\xE7\xE3o",
    title: "Participa\xE7\xE3o no Saeb",
    shortLabel: "Participa\xE7\xE3o Saeb (Anos iniciais do EF)",
    directorPrompt: "A unidade escolar participa regularmente do Saeb (Avalia\xE7\xE3o da Educa\xE7\xE3o B\xE1sica)?",
    description: "Ades\xE3o \xE0s avalia\xE7\xF5es diagn\xF3sticas externas de larga escala.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_21_IDEB",
    stepCode: "EF-21A",
    blockId: "EF_BLOCO_4",
    blockLabel: "EF Bloco 4 \u2022 Aprendizagem e Avalia\xE7\xE3o",
    title: "\xCDndice do IDEB",
    shortLabel: "Resultado do IDEB",
    directorPrompt: "Os resultados geraram \xCDndice do IDEB?",
    description: "Indica\xE7\xE3o da exist\xEAncia de resultado oficial do IDEB para a unidade.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_22",
    stepCode: "EF-22",
    blockId: "EF_BLOCO_4",
    blockLabel: "EF Bloco 4 \u2022 Aprendizagem e Avalia\xE7\xE3o",
    title: "Evolu\xE7\xE3o do Desempenho em Portugu\xEAs e Matem\xE1tica",
    shortLabel: "Evolu\xE7\xE3o do Desempenho (Anos iniciais do EF)",
    directorPrompt: "Como se caracteriza a evolu\xE7\xE3o do desempenho dos estudantes em L\xEDngua Portuguesa e Matem\xE1tica nos \xFAltimos anos?",
    description: "Tend\xEAncia dos resultados de aprendizagem e profici\xEAncia nos anos iniciais.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_23",
    stepCode: "EF-23",
    blockId: "EF_BLOCO_4",
    blockLabel: "EF Bloco 4 \u2022 Aprendizagem e Avalia\xE7\xE3o",
    title: "Refor\xE7o Escolar ou Atendimento Complementar",
    shortLabel: "Refor\xE7o Escolar (Anos iniciais do EF)",
    directorPrompt: "A unidade oferece refor\xE7o escolar ou atendimento pedag\xF3gico complementar para estudantes com defasagem?",
    description: "A\xE7\xF5es de recomposi\xE7\xE3o de aprendizagens e apoio pedag\xF3gico cont\xEDnuo.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  // Bloco 5: Relação com as Famílias e Avaliação Institucional
  {
    id: "EF_25",
    stepCode: "EF-25",
    blockId: "EF_BLOCO_5",
    blockLabel: "EF Bloco 5 \u2022 Fam\xEDlias e Qualidade",
    title: "Rela\xE7\xE3o da Escola com as Fam\xEDlias",
    shortLabel: "Rela\xE7\xE3o c/ Fam\xEDlias (Anos iniciais do EF)",
    directorPrompt: "Como voc\xEA avalia a rela\xE7\xE3o entre a unidade escolar e as fam\xEDlias dos estudantes?",
    description: "Participa\xE7\xE3o nas reuni\xF5es, canal de di\xE1logo e engajamento comunit\xE1rio.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_26",
    stepCode: "EF-26",
    blockId: "EF_BLOCO_5",
    blockLabel: "EF Bloco 5 \u2022 Fam\xEDlias e Qualidade",
    title: "Planejamento Pedag\xF3gico e Caracter\xEDsticas Locais",
    shortLabel: "Curr\xEDculo & Comunidade (Anos iniciais do EF)",
    directorPrompt: "A unidade considera as caracter\xEDsticas do territ\xF3rio e da comunidade no planejamento escolar?",
    description: "Projetos integrados ao contexto sociocultural local.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_27",
    stepCode: "EF-27",
    blockId: "EF_BLOCO_5",
    blockLabel: "EF Bloco 5 \u2022 Fam\xEDlias e Qualidade",
    title: "Aspectos Priorit\xE1rios para Melhoria do Ensino",
    shortLabel: "Aspectos Priorit\xE1rios (Anos iniciais do EF)",
    directorPrompt: "Quais aspectos deveriam receber maior aten\xE7\xE3o na melhoria do atendimento nos Anos iniciais do EF? (at\xE9 3)",
    description: "Prioridades estrat\xE9gicas para gest\xE3o, infraestrutura e recursos pedag\xF3gicos.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  {
    id: "EF_28",
    stepCode: "EF-28",
    blockId: "EF_BLOCO_5",
    blockLabel: "EF Bloco 5 \u2022 Fam\xEDlias e Qualidade",
    title: "Avalia\xE7\xE3o Geral da Qualidade dos Anos iniciais do EF",
    shortLabel: "Qualidade Geral (Anos iniciais do EF)",
    directorPrompt: "Qual \xE9 a sua avalia\xE7\xE3o geral sobre a qualidade do Ensino Fundamental I atualmente ofertado na escola?",
    description: "Autoavalia\xE7\xE3o global dos processos formativos e resultados educacionais.",
    module: "EF",
    appliesTo: ["EF", "AMBOS"]
  },
  // ================= TELA FINAL: CONFIRMAÇÃO E HOMOLOGAÇÃO =================
  {
    id: "CONCLUSAO_RESUMO",
    stepCode: "S\xCDNTESE",
    blockId: "CONCLUSAO",
    blockLabel: "Relat\xF3rio Final \u2022 Homologa\xE7\xE3o",
    title: "Relat\xF3rio Resumo Completo e Homologa\xE7\xE3o",
    shortLabel: "Relat\xF3rio Final",
    directorPrompt: "Parab\xE9ns! Todas as etapas foram conclu\xEDdas. Revise o resumo de respostas, verifique a declara\xE7\xE3o e confirme o envio oficial para a Secretaria de Educa\xE7\xE3o de Pindamonhangaba.",
    description: "Emiss\xE3o do comprovante de protocolo e homologa\xE7\xE3o dos dados diagn\xF3sticos.",
    module: "CONCLUSAO",
    appliesTo: ["ALL"]
  }
];

// src/utils/pdfQuestionnaireGenerator.ts
function generateQuestionnairePdfBuffer() {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 50, left: 45, right: 45 },
      bufferPages: true,
      info: {
        Title: "Question\xE1rio Diagn\xF3stico Municipal - Educa\xE7\xE3o Integral",
        Author: "Secretaria Municipal de Educa\xE7\xE3o de Pindamonhangaba",
        Subject: "Instrumento Completo de Coleta de Dados - EI, EF e Gerais",
        Keywords: "Educa\xE7\xE3o Integral, Pindamonhangaba, Question\xE1rio, EI, EF"
      }
    });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));
    const geraisColor = "#1e3a8a";
    const eiColor = "#065f46";
    const efColor = "#3730a3";
    const geraisSteps = ALL_STEPS.filter(
      (s) => s.module === "TRIAGEM" || s.module === "CONCLUSAO" || s.appliesTo.includes("ALL")
    );
    const eiSteps = ALL_STEPS.filter(
      (s) => s.module === "EI" || s.appliesTo.includes("EI") && s.module !== "TRIAGEM" && s.module !== "CONCLUSAO"
    );
    const efSteps = ALL_STEPS.filter(
      (s) => s.module === "EF" || s.appliesTo.includes("EF") && s.module !== "TRIAGEM" && s.module !== "CONCLUSAO"
    );
    doc.rect(0, 0, 595.28, 110).fill("#0f172a");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(15).text("SECRETARIA MUNICIPAL DE EDUCA\xC7\xC3O DE PINDAMONHANGABA", 45, 22, { width: 505, align: "center" });
    doc.fontSize(12.5).font("Helvetica-Bold").fillColor("#60a5fa").text("PLANO MUNICIPAL DE EXPANS\xC3O DA EDUCA\xC7\xC3O INTEGRAL", 45, 45, { width: 505, align: "center" });
    doc.fontSize(10).font("Helvetica").fillColor("#cbd5e1").text("Caderno Oficial de Quest\xF5es do Question\xE1rio Diagn\xF3stico Escolar", 45, 65, { width: 505, align: "center" });
    doc.fontSize(8.5).font("Helvetica-Oblique").fillColor("#94a3b8").text("Divis\xE3o Sistem\xE1tica: Quest\xF5es Gerais, Educa\xE7\xE3o Infantil (EI) e Ensino Fundamental I (EF)", 45, 82, { width: 505, align: "center" });
    doc.y = 125;
    const drawSectionHeader = (title, subtitle, color) => {
      if (doc.y > 700) {
        doc.addPage();
      } else {
        doc.moveDown(0.8);
      }
      const startY = doc.y;
      doc.rect(45, startY, 505, 36).fill(color);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11.5).text(title, 55, startY + 6, { width: 485 });
      doc.fillColor("#e2e8f0").font("Helvetica").fontSize(8.5).text(subtitle, 55, startY + 21, { width: 485 });
      doc.y = startY + 44;
    };
    const drawStepCard = (step, sectionColor) => {
      const estimatedHeight = 65 + Math.ceil(step.directorPrompt.length / 85) * 12 + Math.ceil(step.description.length / 95) * 10;
      if (doc.y + estimatedHeight > 760) {
        doc.addPage();
      }
      const boxY = doc.y;
      doc.rect(45, boxY, 4, 18).fill(sectionColor);
      doc.rect(53, boxY, 70, 16).fill("#f1f5f9");
      doc.fillColor(sectionColor).font("Helvetica-Bold").fontSize(9).text(step.stepCode, 55, boxY + 3, { width: 66, align: "center" });
      doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(10.5).text(step.title, 130, boxY + 2, { width: 420 });
      doc.fillColor("#64748b").font("Helvetica").fontSize(8).text(`[${step.blockLabel}]`, 130, boxY + 16, { width: 420 });
      doc.y = boxY + 30;
      doc.fillColor("#1e293b").font("Helvetica-Bold").fontSize(9.5).text(`Pergunta: "${step.directorPrompt}"`, 55, doc.y, { width: 490, lineGap: 2 });
      doc.moveDown(0.3);
      if (step.description) {
        doc.fillColor("#475569").font("Helvetica").fontSize(8.5).text(`Orienta\xE7\xE3o / Detalhes: ${step.description}`, 55, doc.y, { width: 490, lineGap: 2 });
      }
      doc.moveDown(0.5);
      const lineY = doc.y;
      doc.strokeColor("#e2e8f0").lineWidth(0.5).moveTo(55, lineY).lineTo(545, lineY).stroke();
      doc.y = lineY + 6;
    };
    drawSectionHeader(
      "PARTE 1: QUEST\xD5ES GERAIS (TRIAGEM, IDENTIFICA\xC7\xC3O E DIRETRIZES)",
      "Aplica-se a TODAS as unidades escolares da Rede Municipal (EI, EF e AMBOS)",
      geraisColor
    );
    geraisSteps.forEach((step) => {
      drawStepCard(step, geraisColor);
    });
    drawSectionHeader(
      "PARTE 2: QUEST\xD5ES DE EDUCA\xC7\xC3O INFANTIL (EI)",
      "Aplica-se \xE0s unidades com atendimento de Educa\xE7\xE3o Infantil (Creche e Pr\xE9-Escola)",
      eiColor
    );
    eiSteps.forEach((step) => {
      drawStepCard(step, eiColor);
    });
    drawSectionHeader(
      "PARTE 3: QUEST\xD5ES DE ENSINO FUNDAMENTAL I (EF)",
      "Aplica-se \xE0s unidades com atendimento de Ensino Fundamental I (1\xBA ao 5\xBA ano)",
      efColor
    );
    efSteps.forEach((step) => {
      drawStepCard(step, efColor);
    });
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      const footerY = 800;
      doc.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(45, footerY - 8).lineTo(545, footerY - 8).stroke();
      doc.fillColor("#64748b").font("Helvetica").fontSize(8).text("Secretaria Municipal de Educa\xE7\xE3o de Pindamonhangaba \u2022 Plano de Expans\xE3o da Educa\xE7\xE3o Integral", 45, footerY, { width: 350 });
      doc.fillColor("#64748b").font("Helvetica-Bold").fontSize(8).text(`P\xE1gina ${i + 1} de ${pageCount}`, 400, footerY, { width: 145, align: "right" });
    }
    doc.end();
  });
}

// server.ts
dotenv.config();
var supabase = null;
var authSupabase = null;
function getSupabase() {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      supabase = createClient(url, key);
      return supabase;
    } catch (e) {
      console.warn("Could not initialize Supabase on server:", e);
    }
  }
  return null;
}
function getAuthSupabase() {
  if (authSupabase) return authSupabase;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  try {
    authSupabase = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    return authSupabase;
  } catch (error) {
    console.warn("Could not initialize protected Supabase authentication client:", error);
    return null;
  }
}
var PRIMARY_BUCKET = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "GT-SME RICO";
var REPORTS_FOLDER = (process.env.SUPABASE_STORAGE_FOLDER?.trim() || "protocolos").replace(/^\/+|\/+$/g, "");
var FALLBACK_BUCKETS = [PRIMARY_BUCKET, "GT-SME RICO", "relatorios_diagnostico", "relatorios", "diagnosticos", "respostas_questionario", "protocolos", "public", "storage"];
function constantTimeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
function validateAdminCredentials(login, password) {
  const expectedLogin = process.env.ADMIN_LOGIN?.trim() || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  if (!expectedLogin || !expectedPassword) return false;
  return constantTimeEqual(normalizeText(login), normalizeText(expectedLogin)) && constantTimeEqual(password, expectedPassword);
}
function hashSchoolPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}
function verifySchoolPassword(password, storedHash) {
  try {
    const [algorithm, salt, expectedHex] = storedHash.split("$");
    if (algorithm !== "scrypt" || !salt || !expectedHex) return false;
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
function getNewPasswordError(password) {
  if (password.length < 10) return "A nova senha deve ter pelo menos 10 caracteres.";
  if (!/[a-z]/.test(password)) return "A nova senha deve conter uma letra min\xFAscula.";
  if (!/[A-Z]/.test(password)) return "A nova senha deve conter uma letra mai\xFAscula.";
  if (!/\d/.test(password)) return "A nova senha deve conter um n\xFAmero.";
  if (!/[^A-Za-z0-9]/.test(password)) return "A nova senha deve conter um caractere especial.";
  return null;
}
async function sendEmailThroughResend(params) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.REPORT_EMAIL_TO?.trim();
  const from = process.env.REPORT_EMAIL_FROM?.trim();
  if (!apiKey || !to || !from) {
    return { success: false, error: "Envio por e-mail n\xE3o configurado no servidor." };
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": params.idempotencyKey.slice(0, 256)
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: params.subject,
        html: params.html,
        attachments: params.attachments
      })
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.id) {
      return { success: false, error: result?.message || `Falha no provedor de e-mail (HTTP ${response.status}).` };
    }
    return { success: true, id: result.id };
  } catch (error) {
    return { success: false, error: error?.message || "N\xE3o foi poss\xEDvel acessar o provedor de e-mail." };
  }
}
async function emailSchoolReport(formData) {
  const csvContent = generateCSVString(formData);
  const txtContent = generateTextSummary(formData);
  const pdfContent = await generatePdfBuffer(txtContent);
  const fileBaseName = getReportFileBaseName(formData);
  const schoolName = String(formData.schoolName || "Unidade Escolar");
  const protocol = String(formData.protocolNumber || "sem-protocolo");
  return sendEmailThroughResend({
    subject: `Diagn\xF3stico de Educa\xE7\xE3o Integral \u2014 ${schoolName} \u2014 ${protocol}`,
    idempotencyKey: `relatorio-${formData.id || protocol}`,
    html: `<h2>Relat\xF3rio final do Diagn\xF3stico da Pol\xEDtica de Educa\xE7\xE3o Integral</h2><p><strong>Unidade:</strong> ${schoolName.replace(/[<>&]/g, "")}</p><p><strong>Protocolo:</strong> ${protocol.replace(/[<>&]/g, "")}</p><p>Os relat\xF3rios oficiais seguem anexos nos formatos PDF, CSV e TXT.</p>`,
    attachments: [
      { filename: `${fileBaseName}.pdf`, content: pdfContent.toString("base64") },
      { filename: `${fileBaseName}.csv`, content: Buffer.from(csvContent, "utf8").toString("base64") },
      { filename: `${fileBaseName}.txt`, content: Buffer.from(txtContent, "utf8").toString("base64") }
    ]
  });
}
function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}
function createSchoolSessionToken(schoolId, isMasterAccess) {
  const secret = getSessionSecret();
  if (!secret) throw new Error("SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY is required");
  const payload = Buffer.from(JSON.stringify({ schoolId, isMasterAccess, exp: Date.now() + 8 * 60 * 60 * 1e3 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}
function readSchoolSession(req) {
  try {
    const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const [payload, suppliedSignature] = token.split(".");
    const secret = getSessionSecret();
    if (!payload || !suppliedSignature || !secret) return null;
    const expectedSignature = createHmac("sha256", secret).update(payload).digest("base64url");
    if (!constantTimeEqual(suppliedSignature, expectedSignature)) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed.schoolId || !parsed.exp || parsed.exp < Date.now()) return null;
    return { schoolId: String(parsed.schoolId), isMasterAccess: Boolean(parsed.isMasterAccess) };
  } catch {
    return null;
  }
}
async function getOrEnsureStorageBucket(db) {
  try {
    const { data: buckets, error: listErr } = await db.storage.listBuckets();
    if (!listErr && Array.isArray(buckets)) {
      const foundPrimary = buckets.find((b) => b.name === PRIMARY_BUCKET || b.id === PRIMARY_BUCKET);
      if (foundPrimary) {
        return foundPrimary.name;
      }
      for (const fallback of FALLBACK_BUCKETS) {
        const foundFallback = buckets.find((b) => b.name === fallback || b.id === fallback);
        if (foundFallback) {
          return foundFallback.name;
        }
      }
    }
    const { data: newBucket, error: createErr } = await db.storage.createBucket(PRIMARY_BUCKET, {
      public: true,
      fileSizeLimit: 10485760
      // 10MB
    });
    if (!createErr && newBucket) {
      console.log(`Supabase Storage bucket '${PRIMARY_BUCKET}' created successfully.`);
      return PRIMARY_BUCKET;
    }
  } catch (err) {
    console.warn("Could not list or create storage bucket automatically:", err);
  }
  return PRIMARY_BUCKET;
}
function sanitizeStoragePath(filePath) {
  if (!filePath) return `arquivo_${Date.now()}.json`;
  let clean = filePath.trim().replace(/^\/+/, "");
  if (clean.startsWith(`${PRIMARY_BUCKET}/`)) {
    clean = clean.substring(PRIMARY_BUCKET.length + 1).replace(/^\/+/, "");
  }
  clean = clean.replace(/\/+/g, "/");
  return clean.replace(/^\/+/, "");
}
function simplifyFileNamePart(value, maxWords) {
  const withoutAccents = value.replace(/^Ã‚/, "A").replace(/^Â/, "A").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\s.-]/g, " ").replace(/\s+/g, " ").trim().replace(/\bngelo\b/gi, "Angelo");
  const ignored = /* @__PURE__ */ new Set(["da", "das", "de", "do", "dos", "e", "dr", "dra", "prof", "profa", "professor", "professora", "em", "emei", "emef"]);
  const words = withoutAccents.split(" ").filter((word) => !ignored.has(word.toLowerCase().replace(/\.$/, "")));
  return (maxWords ? words.slice(0, maxWords) : words).join(" ");
}
function getReportFileBaseName(formData) {
  const school = simplifyFileNamePart(String(formData.schoolName || "Unidade Escolar"), 2) || "Unidade Escolar";
  const respondentWords = simplifyFileNamePart(String(formData.directorName || "Respondente")).split(" ").filter(Boolean);
  const respondent = respondentWords.length > 1 ? `${respondentWords[0]} ${respondentWords.slice(1).map((word) => word.charAt(0)).join(".")}` : respondentWords[0] || "Respondente";
  return `${school} - ${respondent}`;
}
function generatePdfBuffer(text) {
  return new Promise((resolve, reject) => {
    const document2 = new PDFDocument2({
      size: "A4",
      margins: { top: 48, bottom: 48, left: 48, right: 48 },
      bufferPages: true,
      info: { Title: "Relat\xF3rio T\xE9cnico Homologado", Author: "Secretaria Municipal de Educa\xE7\xE3o" }
    });
    const chunks = [];
    document2.on("data", (chunk) => chunks.push(chunk));
    document2.on("end", () => resolve(Buffer.concat(chunks)));
    document2.on("error", reject);
    document2.font("Helvetica").fontSize(9).fillColor("#1f2937");
    for (const line of text.split("\n")) {
      document2.text(line.replace(/\r$/, ""), { width: 496, lineGap: 2 });
    }
    document2.end();
  });
}
async function uploadAllReportArtifacts(db, formData, meta) {
  const bucket = await getOrEnsureStorageBucket(db);
  const fileBaseName = getReportFileBaseName(formData);
  const csvContent = generateCSVString(formData);
  const txtContent = generateTextSummary(formData);
  const pdfContent = await generatePdfBuffer(txtContent);
  const uploadedFiles = [];
  const uploadErrors = [];
  const filesToUpload = [
    {
      fileName: `${fileBaseName}.csv`,
      uploadPath: sanitizeStoragePath(`${REPORTS_FOLDER}/${fileBaseName}.csv`),
      content: Buffer.from(csvContent, "utf-8"),
      contentType: "text/csv;charset=utf-8;",
      type: "CSV Spreadsheet"
    },
    {
      fileName: `${fileBaseName}.txt`,
      uploadPath: sanitizeStoragePath(`${REPORTS_FOLDER}/${fileBaseName}.txt`),
      content: Buffer.from(txtContent, "utf-8"),
      contentType: "text/plain;charset=utf-8;",
      type: "Official Text Summary"
    },
    {
      fileName: `${fileBaseName}.pdf`,
      uploadPath: sanitizeStoragePath(`${REPORTS_FOLDER}/${fileBaseName}.pdf`),
      content: pdfContent,
      contentType: "application/pdf",
      type: "Official PDF Report"
    }
  ];
  for (const item of filesToUpload) {
    try {
      const { data: uploadData, error: uploadErr } = await db.storage.from(bucket).upload(item.uploadPath, item.content, {
        contentType: item.contentType,
        upsert: true
      });
      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = db.storage.from(bucket).getPublicUrl(uploadData.path || item.uploadPath);
        uploadedFiles.push({
          name: item.fileName,
          path: uploadData.path || item.uploadPath,
          publicUrl: publicUrlData?.publicUrl,
          type: item.type
        });
      } else if (uploadErr) {
        uploadErrors.push(`${item.uploadPath}: ${uploadErr.message}`);
        console.warn(`[Supabase Storage] Upload error for ${item.uploadPath} in bucket '${bucket}':`, uploadErr.message);
      }
    } catch (e) {
      uploadErrors.push(`${item.uploadPath}: ${e?.message || String(e)}`);
      console.warn(`[Supabase Storage] Exception uploading ${item.uploadPath} to '${bucket}':`, e?.message || e);
    }
  }
  return {
    success: uploadedFiles.length === filesToUpload.length,
    bucket,
    files: uploadedFiles,
    error: uploadedFiles.length === filesToUpload.length ? void 0 : uploadErrors.join("; ") || "Nem todos os artefatos foram gravados no Supabase Storage."
  };
}
function createApp() {
  const app2 = express();
  app2.use(express.json({ limit: "15mb" }));
  app2.post("/api/admin/validate", (req, res) => {
    const login = String(req.body?.login || "");
    const password = String(req.body?.password || "");
    if (!validateAdminCredentials(login, password)) {
      return res.status(401).json({ success: false, error: "Credenciais administrativas inv\xE1lidas." });
    }
    return res.json({ success: true });
  });
  app2.post("/api/admin/test-email", async (req, res) => {
    const login = String(req.body?.login || "");
    const password = String(req.body?.password || "");
    if (!validateAdminCredentials(login, password)) {
      return res.status(401).json({ success: false, error: "Credenciais administrativas inv\xE1lidas." });
    }
    const result = await sendEmailThroughResend({
      subject: "Teste de integra\xE7\xE3o \u2014 Diagn\xF3stico da Educa\xE7\xE3o Integral",
      idempotencyKey: `teste-email-${Date.now()}`,
      html: "<h2>Teste de envio conclu\xEDdo</h2><p>Esta mensagem confirma a integra\xE7\xE3o de e-mail do sistema de Diagn\xF3stico da Pol\xEDtica de Educa\xE7\xE3o Integral da Rede Municipal de Pindamonhangaba.</p>"
    });
    return res.status(result.success ? 200 : 503).json(result);
  });
  app2.post("/api/supabase/validate-school", async (req, res) => {
    try {
      const { schoolId, login, senha, sector } = req.body;
      const cleanLogin = (login || "").trim();
      const cleanSenha = String(senha || "");
      const selectedUnit = findSchoolById(String(schoolId || ""));
      const isMasterAccess = validateAdminCredentials(cleanLogin, cleanSenha);
      const targetUnit = isMasterAccess ? selectedUnit : selectedUnit || findSchoolByLogin(cleanLogin);
      if (!targetUnit || !isMasterAccess && normalizeText(targetUnit.login) !== normalizeText(cleanLogin)) {
        return res.status(401).json({ success: false, error: "Login ou senha incorretos para a unidade selecionada." });
      }
      const db = getAuthSupabase();
      if (!db && !isMasterAccess) {
        return res.status(503).json({ success: false, error: "O servi\xE7o de autentica\xE7\xE3o est\xE1 temporariamente indispon\xEDvel." });
      }
      let unitRecord = null;
      if (db) {
        const { data, error } = await db.from("unidades_escolares").select("id, nome_escola, oferta, status, setor, senha_hash").eq("id", targetUnit.id).maybeSingle();
        if (error) {
          console.error("School authentication query failed:", error.message);
          return res.status(503).json({ success: false, error: "N\xE3o foi poss\xEDvel consultar as credenciais da unidade. Verifique a configura\xE7\xE3o do Supabase." });
        }
        unitRecord = data;
        const validSchoolPassword = data?.senha_hash ? verifySchoolPassword(cleanSenha, data.senha_hash) : validateSchoolCredentials(targetUnit.id, cleanLogin, cleanSenha).success;
        if (!isMasterAccess && !validSchoolPassword) {
          return res.status(401).json({ success: false, error: "Login ou senha incorretos para a unidade selecionada." });
        }
        if (!isMasterAccess && data) {
          if (data.status === "CONCLUIDO" || data.status === "CONCLU\xCDDO") {
            return res.json({
              success: false,
              isCompleted: true,
              unit: {
                id: targetUnit.id,
                name: targetUnit.name,
                offer: targetUnit.offer,
                sector: targetUnit.sector || sector,
                login: targetUnit.login
              },
              error: `Aten\xE7\xE3o: A unidade ${targetUnit.name} j\xE1 enviou as respostas deste question\xE1rio. Para altera\xE7\xF5es de dados enviados, entre em contato com o Gabinete GT SME para solicitar a libera\xE7\xE3o de refazimento.`
            });
          }
        }
      }
      return res.json({
        success: true,
        isMasterAccess,
        authToken: createSchoolSessionToken(targetUnit.id, isMasterAccess),
        unit: {
          id: targetUnit.id,
          name: targetUnit.name,
          offer: targetUnit.offer,
          sector: targetUnit.sector || sector,
          login: targetUnit.login
        }
      });
    } catch (e) {
      console.error("Supabase validation error:", e);
      return res.status(500).json({ success: false, error: "Erro de valida\xE7\xE3o. Tente novamente." });
    }
  });
  app2.post("/api/supabase/change-password", async (req, res) => {
    try {
      const schoolId = String(req.body?.schoolId || "");
      const login = String(req.body?.login || "").trim();
      const currentPassword = String(req.body?.currentPassword || "");
      const newPassword = String(req.body?.newPassword || "");
      const targetUnit = findSchoolById(schoolId);
      const session = readSchoolSession(req);
      if (!session || session.isMasterAccess || session.schoolId !== schoolId || !targetUnit || normalizeText(targetUnit.login) !== normalizeText(login)) {
        return res.status(401).json({ success: false, error: "Unidade ou login inv\xE1lido." });
      }
      const passwordError = getNewPasswordError(newPassword);
      if (passwordError) return res.status(400).json({ success: false, error: passwordError });
      if (constantTimeEqual(currentPassword, newPassword)) {
        return res.status(400).json({ success: false, error: "A nova senha deve ser diferente da senha atual." });
      }
      const db = getAuthSupabase();
      if (!db) return res.status(503).json({ success: false, error: "O servi\xE7o de autentica\xE7\xE3o est\xE1 indispon\xEDvel." });
      const { data, error } = await db.from("unidades_escolares").select("id, senha_hash").eq("id", targetUnit.id).maybeSingle();
      if (error || !data) {
        console.error("Password lookup failed:", error?.message);
        return res.status(503).json({ success: false, error: "N\xE3o foi poss\xEDvel consultar a credencial da unidade." });
      }
      const currentIsValid = data.senha_hash ? verifySchoolPassword(currentPassword, data.senha_hash) : validateSchoolCredentials(targetUnit.id, login, currentPassword).success;
      if (!currentIsValid) return res.status(401).json({ success: false, error: "A senha atual est\xE1 incorreta." });
      const { error: updateError } = await db.from("unidades_escolares").update({ senha_hash: hashSchoolPassword(newPassword), senha_alterada_em: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", targetUnit.id);
      if (updateError) {
        console.error("Password update failed:", updateError.message);
        return res.status(503).json({ success: false, error: "N\xE3o foi poss\xEDvel salvar a nova senha." });
      }
      return res.json({ success: true });
    } catch (e) {
      console.error("Password change error:", e);
      return res.status(500).json({ success: false, error: "Erro ao alterar a senha. Tente novamente." });
    }
  });
  app2.post("/api/supabase/submit-survey", async (req, res) => {
    try {
      const { formData, startTime, endTime, elapsedSeconds, elapsedTimeFormatted } = req.body;
      const session = readSchoolSession(req);
      if (!session || !formData?.schoolId || session.schoolId !== String(formData.schoolId)) {
        return res.status(401).json({ success: false, error: "Sess\xE3o inv\xE1lida ou incompat\xEDvel com a unidade informada." });
      }
      const db = getAuthSupabase();
      if (db && formData) {
        if (formData.sphere === "AMBOS") {
          formData.ef_04_territoryType = formData.ef_04_territoryType || formData.ei_19_territoryType || "Urbano";
          formData.ef_05_socioeconomicProfile = formData.ef_05_socioeconomicProfile || formData.ei_20_socioeconomicProfile || "Mistas";
          formData.ef_18_staffBreakdown = formData.ef_18_staffBreakdown || formData.ei_18_staffBreakdown || "";
        }
        const { error: insertErr } = await db.from("respostas_questionario").upsert([
          {
            id: formData.id || "srv_" + Date.now(),
            unidade_id: formData.schoolId,
            nome_escola: formData.schoolName,
            setor: formData.schoolSector,
            oferta: formData.sphere,
            responsavel_nome: formData.directorName,
            responsavel_cargo: formData.respondentRole === "PROFESSOR_CO_RESPONSAVEL" ? "Professor Co-Respons\xE1vel" : "Diretor",
            responsavel_email: formData.directorEmail,
            responsavel_telefone: formData.directorPhone,
            horario_inicio: startTime,
            horario_termino: endTime,
            tempo_decorrido_segundos: elapsedSeconds,
            tempo_decorrido_formatado: elapsedTimeFormatted,
            protocolo: formData.protocolNumber,
            respostas_json: formData,
            data_envio: (/* @__PURE__ */ new Date()).toISOString()
          }
        ], { onConflict: "id" });
        if (insertErr) {
          console.error("Supabase insert failed in respostas_questionario:", insertErr);
          return res.status(503).json({ success: false, error: "N\xE3o foi poss\xEDvel registrar as respostas no banco de dados." });
        }
        let storageResult = null;
        try {
          storageResult = await uploadAllReportArtifacts(db, formData, {
            startTime,
            endTime,
            elapsedSeconds,
            elapsedTimeFormatted
          });
        } catch (storageErr) {
          console.warn("Storage upload notice:", storageErr);
        }
        if (!storageResult?.success) {
          return res.status(503).json({
            success: false,
            error: storageResult?.error || "Falha ao gravar todos os relat\xF3rios no Supabase Storage.",
            storage: storageResult,
            filesUploaded: storageResult?.files || []
          });
        }
        const emailResult = await emailSchoolReport(formData);
        if (!emailResult.success) {
          console.error("Report e-mail delivery failed:", emailResult.error);
          return res.status(503).json({
            success: false,
            error: `Os arquivos foram salvos no Supabase Storage, mas o envio por e-mail falhou: ${emailResult.error}`,
            storage: storageResult,
            filesUploaded: storageResult.files || [],
            email: emailResult
          });
        }
        const { error: updateErr } = await db.from("unidades_escolares").update({
          status: "CONCLUIDO",
          responsavel_nome: formData.directorName,
          responsavel_cargo: formData.respondentRole === "PROFESSOR_CO_RESPONSAVEL" ? "Professor Co-Respons\xE1vel" : "Diretor",
          protocolo: formData.protocolNumber,
          tempo_decorrido: elapsedTimeFormatted,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", formData.schoolId);
        if (updateErr) {
          console.error("School completion status update failed:", updateErr);
          return res.status(503).json({ success: false, error: "Os relat\xF3rios foram enviados, mas n\xE3o foi poss\xEDvel concluir o protocolo da unidade." });
        }
        return res.json({
          success: true,
          storage: storageResult,
          storageBucket: storageResult?.bucket,
          filesUploaded: storageResult?.files || [],
          email: emailResult
        });
      }
      return res.json({
        success: false,
        error: "Supabase n\xE3o conectado ou credenciais n\xE3o configuradas no servidor."
      });
    } catch (e) {
      console.error("Submit survey server error:", e);
      return res.status(500).json({ success: false, error: e.message || "Falha ao enviar o question\xE1rio." });
    }
  });
  app2.get("/api/supabase/storage-status", async (_req, res) => {
    try {
      const db = getSupabase();
      if (!db) {
        return res.json({
          configured: false,
          message: "Credenciais do Supabase n\xE3o configuradas no ambiente do servidor.",
          buckets: [],
          files: []
        });
      }
      let bucketsList = [];
      try {
        const { data: buckets, error: bErr } = await db.storage.listBuckets();
        if (!bErr && Array.isArray(buckets)) {
          bucketsList = buckets;
        }
      } catch (err) {
        console.warn("Error listing storage buckets:", err);
      }
      const activeBucket = await getOrEnsureStorageBucket(db);
      let filesList = [];
      let protocolosFiles = [];
      try {
        const { data: rootFiles, error: rErr } = await db.storage.from(activeBucket).list("", { limit: 100 });
        if (!rErr && Array.isArray(rootFiles)) {
          filesList = rootFiles;
        }
        const { data: protoFiles, error: pErr } = await db.storage.from(activeBucket).list("protocolos", { limit: 100 });
        if (!pErr && Array.isArray(protoFiles)) {
          protocolosFiles = protoFiles;
        }
      } catch (err) {
        console.warn("Error listing bucket files:", err);
      }
      let unidadesCount = 0;
      let respostasCount = 0;
      try {
        const { count: uCount } = await db.from("unidades_escolares").select("*", { count: "exact", head: true });
        unidadesCount = uCount || 0;
        const { count: rCount } = await db.from("respostas_questionario").select("*", { count: "exact", head: true });
        respostasCount = rCount || 0;
      } catch (err) {
        console.warn("Error checking tables:", err);
      }
      return res.json({
        configured: true,
        activeBucket,
        buckets: bucketsList,
        rootFiles: filesList,
        protocolosFiles,
        totalFilesFound: filesList.length + protocolosFiles.length,
        database: {
          unidadesEscolaresCount: unidadesCount,
          respostasQuestionarioCount: respostasCount
        }
      });
    } catch (e) {
      console.error("Storage status check error:", e);
      return res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/supabase/sync-all-to-storage", async (req, res) => {
    try {
      const db = getSupabase();
      if (!db) {
        return res.json({ success: false, error: "Supabase n\xE3o conectado" });
      }
      const clientSubmissions = req.body?.submissions || [];
      const syncResults = [];
      if (Array.isArray(clientSubmissions) && clientSubmissions.length > 0) {
        for (const sub of clientSubmissions) {
          const form = sub.formData || sub;
          if (form && form.schoolName) {
            const meta = {
              startTime: sub.startTime || form.startTime,
              endTime: sub.endTime || form.endTime,
              elapsedSeconds: sub.elapsedSeconds || form.elapsedSeconds,
              elapsedTimeFormatted: sub.elapsedTimeFormatted || form.elapsedTimeFormatted
            };
            const uploadRes = await uploadAllReportArtifacts(db, form, meta);
            syncResults.push({
              schoolId: form.schoolId,
              schoolName: form.schoolName,
              protocol: form.protocolNumber,
              upload: uploadRes
            });
          }
        }
      } else {
        const { data: dbRows, error: rErr } = await db.from("respostas_questionario").select("*");
        if (!rErr && Array.isArray(dbRows)) {
          for (const row of dbRows) {
            const form = row.respostas_json;
            if (form) {
              const meta = {
                startTime: row.horario_inicio,
                endTime: row.horario_termino,
                elapsedSeconds: row.tempo_decorrido_segundos,
                elapsedTimeFormatted: row.tempo_decorrido_formatado
              };
              const uploadRes = await uploadAllReportArtifacts(db, form, meta);
              syncResults.push({
                schoolId: row.unidade_id,
                schoolName: row.nome_escola,
                protocol: row.protocolo,
                upload: uploadRes
              });
            }
          }
        }
      }
      const successfulSyncs = syncResults.filter((result) => result.upload?.success).length;
      return res.json({
        success: successfulSyncs > 0 || syncResults.length === 0,
        count: successfulSyncs,
        results: syncResults,
        error: successfulSyncs === 0 && syncResults.length > 0 ? "Nenhum relat\xF3rio foi gravado no Supabase Storage." : void 0
      });
    } catch (e) {
      console.error("Sync all to storage error:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.post("/api/supabase/upload-single-report", async (req, res) => {
    try {
      const { formData, startTime, endTime, elapsedSeconds, elapsedTimeFormatted } = req.body;
      const db = getSupabase();
      if (!db || !formData) {
        return res.json({ success: false, error: "Supabase n\xE3o conectado ou formul\xE1rio ausente" });
      }
      const uploadRes = await uploadAllReportArtifacts(db, formData, {
        startTime,
        endTime,
        elapsedSeconds,
        elapsedTimeFormatted
      });
      return res.json({
        success: uploadRes.success,
        error: uploadRes.success ? void 0 : uploadRes.error || "Falha ao gravar o relat\xF3rio no Supabase Storage.",
        result: uploadRes
      });
    } catch (e) {
      console.error("Upload single report error:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.post("/api/supabase/admin/reset-unit", async (req, res) => {
    try {
      const { schoolId } = req.body;
      const db = getSupabase();
      if (db && schoolId) {
        const { error: delErr } = await db.from("respostas_questionario").delete().eq("unidade_id", schoolId);
        if (delErr) {
          console.warn("Supabase delete notice in respostas_questionario:", delErr);
        }
        const { error: updErr } = await db.from("unidades_escolares").update({
          status: "PENDENTE",
          responsavel_nome: null,
          responsavel_cargo: null,
          protocolo: null,
          tempo_decorrido: null,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", schoolId);
        if (updErr) {
          console.warn("Supabase update notice in unidades_escolares:", updErr);
        }
      }
      return res.json({ success: true });
    } catch (e) {
      console.error("Admin reset unit error:", e);
      return res.json({ success: true, localOnly: true });
    }
  });
  app2.post("/api/ai/analyze", async (req, res) => {
    try {
      const { surveyData } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          success: true,
          isFallback: true,
          summary: generateHeuristicAnalysis(surveyData)
        });
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
Voc\xEA \xE9 um especialista em Planejamento Educacional e Pol\xEDticas P\xFAblicas de Educa\xE7\xE3o Integral no Brasil.
Analise os seguintes dados diagn\xF3sticos coletados pelo Diretor Escolar para o Plano de Expans\xE3o da Educa\xE7\xE3o Integral:

DADOS DA ESCOLA:
${JSON.stringify(surveyData, null, 2)}

Por favor, elabore um Parecer T\xE9cnico-Executivo estruturado e objetivo em portugu\xEAs com:
1. S\xEDntese do Perfil e Grau de Vulnerabilidade do Territ\xF3rio
2. Avalia\xE7\xE3o de Viabilidade da Expans\xE3o e Principais Gargalos Estruturais
3. An\xE1lise da Demanda Reprimida e Transi\xE7\xE3o de Turnos
4. Recomenda\xE7\xF5es Priorit\xE1rias para a Secretaria de Educa\xE7\xE3o (Obras, Pessoal, Transporte, Merenda)
5. \xCDndice de Prontid\xE3o estimado para Educa\xE7\xE3o Integral (Alto, M\xE9dio ou Baixo com justificativa).
`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      return res.json({
        success: true,
        isFallback: false,
        analysisText: response.text
      });
    } catch (error) {
      console.error("Gemini API error:", error);
      return res.json({
        success: true,
        isFallback: true,
        summary: generateHeuristicAnalysis(req.body?.surveyData)
      });
    }
  });
  app2.post("/api/ai/validate-clarity", async (req, res) => {
    try {
      const { questionId, questionTitle, answer } = req.body;
      if (!answer || answer.trim().length < 3) {
        return res.json({ isValid: false, reason: "A resposta est\xE1 muito curta ou vazia." });
      }
      if (!process.env.GEMINI_API_KEY) {
        if (answer.trim().length < 5 && isNaN(Number(answer))) {
          return res.json({
            isValid: false,
            feedback: "A resposta parece muito sucinta. Por favor, detalhe um pouco mais para subsidiar o planejamento municipal."
          });
        }
        return res.json({ isValid: true });
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
Avalie se a seguinte resposta fornecida por um Diretor Escolar \xE0 pergunta "${questionTitle}" \xE9 suficientemente clara e informativa para um diagn\xF3stico de expans\xE3o da Educa\xE7\xE3o Integral.
Resposta do diretor: "${answer}"

Responda em formato JSON rigoroso:
{
  "isSufficient": boolean,
  "politeFeedback": string (se n\xE3o for suficiente, d\xEA uma sugest\xE3o gentil e respeitosa de como enriquecer a resposta)
}
`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        isValid: parsed.isSufficient ?? true,
        feedback: parsed.politeFeedback || null
      });
    } catch (error) {
      return res.json({ isValid: true });
    }
  });
  const servePdfHandler = async (_req, res) => {
    try {
      const pdfBuffer = await generateQuestionnairePdfBuffer();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="Questionario_Educacao_Integral_Questoes.pdf"');
      return res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation endpoint error:", error);
      return res.status(500).json({ error: "Falha ao gerar PDF do question\xE1rio." });
    }
  };
  app2.get("/api/pdf/questionnaire", servePdfHandler);
  app2.get("/Questionario_Educacao_Integral_Questoes.pdf", servePdfHandler);
  app2.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  return app2;
}
function generateHeuristicAnalysis(data) {
  if (!data) return "Dados diagn\xF3sticos insuficientes para gera\xE7\xE3o de s\xEDntese autom\xE1tica.";
  const escola = data.schoolName || "Unidade Escolar";
  const inep = data.inepCode ? `(INEP: ${data.inepCode})` : "";
  const territorio = data.territoryType || "N\xE3o informado";
  const vulnerabilidade = data.vulnerabilityLevel || "N\xE3o informada";
  const carencias = Array.isArray(data.missingPublicEquipments) ? data.missingPublicEquipments.join(", ") : "N\xE3o informadas";
  const condicaoPredio = data.buildingCondition || "Em an\xE1lise";
  const demandas = Array.isArray(data.priorityDemands) ? data.priorityDemands.join(", ") : "N/D";
  let eiText = "";
  if (data.sphere === "EI" || data.sphere === "BOTH") {
    eiText = `
- **Educa\xE7\xE3o Infantil (EI)**:
  * Matr\xEDculas: ${data.ei_partialEnrollment || 0} (Parcial) | ${data.ei_integralEnrollment || 0} (Integral)
  * Demanda Reprimida: ${data.ei_waitingListCount || 0} crian\xE7as na fila (Tempo m\xE9dio: ${data.ei_avgWaitMonths || 0} meses)
  * Trocas de per\xEDodo aguardando: ${data.ei_shiftChangeWaitingCount || 0} (Frequ\xEAncia: ${data.ei_shiftChangeFrequency || "N/D"})
  * Principais motivos de troca: ${Array.isArray(data.ei_shiftChangeReasons) ? data.ei_shiftChangeReasons.join(", ") : "N/D"}`;
  }
  let efText = "";
  if (data.sphere === "EF1" || data.sphere === "BOTH") {
    efText = `
- **Ensino Fundamental I (EF I)**:
  * Matr\xEDculas: ${data.ef_partialEnrollment || 0} (Parcial) | ${data.ef_integralEnrollment || 0} (Integral)
  * Estudantes PPIs estimados: ${data.ef_ppiProportion || "N\xE3o informado"}
  * Trocas de per\xEDodo aguardando: ${data.ef_shiftChangeWaitingCount || 0} (Frequ\xEAncia: ${data.ef_shiftChangeFrequency || "N/D"})
  * Coordena\xE7\xE3o Pedag\xF3gica Pr\xF3pria: ${data.ef_hasPedagogicalCoordination ? "Sim" : "N\xE3o"}
  * Equipe escolar: ${data.ef_staffSummary || "Quadro registrado no sistema"}`;
  }
  return `
### PARECER T\xC9CNICO-EXECUTIVO PRELIMINAR

**1. S\xEDntese do Perfil e Vulnerabilidade:**
A unidade **${escola}** ${inep} situa-se em territ\xF3rio **${territorio}**, atendendo a uma comunidade com n\xEDvel de vulnerabilidade socioecon\xF4mica **${vulnerabilidade}**. H\xE1 car\xEAncia relevante de equipamentos p\xFAblicos no entorno (${carencias}), o que ressalta a fun\xE7\xE3o protetiva e transformadora da expans\xE3o da jornada integral.

**2. Condi\xE7\xF5es Estruturais e Prontid\xE3o:**
O pr\xE9dio escolar foi avaliado como **${condicaoPredio}**. As prioridades estruturais e de gest\xE3o indicadas para a viabilidade do plano incluem: **${demandas}**.

**3. Indicadores de Atendimento e Demanda:**
${eiText}
${efText}

**4. Recomenda\xE7\xF5es Estrat\xE9gicas para a Secretaria de Educa\xE7\xE3o:**
1. **Infraestrutura**: Priorizar adequa\xE7\xF5es de refeit\xF3rio, p\xE1tio coberto e sanit\xE1rios para suportar a perman\xEAncia de at\xE9 7 a 9 horas di\xE1rias.
2. **Equipe e Gest\xE3o**: Fortalecer a contrata\xE7\xE3o de monitores/educadores e assegurar a carga hor\xE1ria de coordena\xE7\xE3o pedag\xF3gica dedicada \xE0 Educa\xE7\xE3o Integral.
3. **Equidade Social**: Articular com a rede de Assist\xEAncia Social e Transporte Escolar para priorizar crian\xE7as em fila de espera do territ\xF3rio.
`;
}

// serverless/index.ts
var app = createApp();
async function handler(req, res) {
  try {
    return app(req, res);
  } catch (error) {
    console.error("Vercel API request error:", error);
    return res.status(500).json({
      success: false,
      error: "Falha ao processar a solicita\xE7\xE3o da API."
    });
  }
}
export {
  handler as default
};
