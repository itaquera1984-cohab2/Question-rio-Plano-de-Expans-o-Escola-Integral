import { QuestionStep, SurveyFormData, EducationSphere } from '../types/questionnaire';

export const ALL_STEPS: QuestionStep[] = [
  // ================= TELA DE IDENTIFICAÇÃO E TRIAGEM =================
  {
    id: 'ETAPA_0_IDENTIFICACAO',
    stepCode: 'GERAL-01',
    blockId: 'TRIAGEM',
    blockLabel: 'Identificação • Etapa Inicial',
    title: 'Identificação do Respondente',
    shortLabel: 'Identificação',
    directorPrompt:
      'Olá! Bem-vindo(a) ao Questionário Diagnóstico Municipal da Secretaria Municipal de Educação de Pindamonhangaba. Por favor, identifique-se e informe seu cargo na unidade escolar.',
    description: 'Preenchimento dos dados do responsável pelas informações prestadas.',
    module: 'TRIAGEM',
    appliesTo: ['ALL'],
  },
  {
    id: 'ETAPA_1_TRIAGEM',
    stepCode: 'GERAL-02',
    blockId: 'TRIAGEM',
    blockLabel: 'Triagem • Unidade e Oferta',
    title: 'Dados da Unidade e Triagem de Oferta',
    shortLabel: 'Unidade & Oferta',
    directorPrompt:
      'Informe o nome da escola, o território/bairro(s) de abrangência e selecione a(s) etapa(s) de ensino ofertada(s) nesta unidade.',
    description: 'A seleção da etapa filtra automaticamente o questionário para a sua realidade escolar.',
    module: 'TRIAGEM',
    appliesTo: ['ALL'],
  },
  {
    id: 'ETAPA_2_VISITAS_SUPERVISAO',
    stepCode: 'GERAL-03',
    blockId: 'TRIAGEM',
    blockLabel: 'Acompanhamento Institucional • Frequência de Visitas',
    title: 'Frequência de Visitas Técnicas e Supervisão Escolar',
    shortLabel: 'Visitas GREB/GT/Supervisão',
    directorPrompt:
      'Com qual frequência, recebe visita das GREB\'s, Grupo de Trabalho GT e Supervisoras de Ensino do Estado?',
    description:
      'Quadro para inserção numérica de frequência, dividido em dias, meses ou anual para cada equipe técnica/supervisora.',
    module: 'TRIAGEM',
    appliesTo: ['ALL'],
  },
  {
    id: 'UNI_01',
    stepCode: 'UNI-01',
    key: 'ed-integral',
    blockId: 'OFERTA_INTEGRAL',
    blockLabel: 'Planejamento e Viabilidade • Oferta Integral',
    title: 'Viabilidade e Diretriz da Oferta de Ensino Integral',
    shortLabel: 'Diretriz Ensino Integral (ed-integral)',
    directorPrompt:
      'Considerando a estrutura física atual, o interesse da comunidade escolar e a viabilidade operacional, selecione a diretriz pretendida para o Ensino Integral nesta unidade.',
    description:
      'Análise de viabilidade técnica, física e anuência da comunidade escolar quanto ao regime de atendimento.',
    module: 'TRIAGEM',
    appliesTo: ['ALL'],
  },

  // ================= [MÓDULO EI] EDUCAÇÃO INFANTIL =================
  // Bloco 1: Demanda e Matrículas
  {
    id: 'EI_01',
    stepCode: 'EI-01',
    blockId: 'EI_BLOCO_1',
    blockLabel: 'EI Bloco 1 • Demanda e Matrículas',
    title: 'Número Total de Crianças Matriculadas',
    shortLabel: 'Total de Alunos (EI)',
    directorPrompt: 'Qual é o número total de crianças atualmente matriculadas na Educação Infantil?',
    description: 'Contagem geral de alunos ativos na unidade escolar.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_02',
    stepCode: 'EI-02',
    blockId: 'EI_BLOCO_1',
    blockLabel: 'EI Bloco 1 • Demanda e Matrículas',
    title: 'Vagas Ocupadas por Turno',
    shortLabel: 'Vagas Ocupadas (EI)',
    directorPrompt: 'Informe o número de vagas atualmente ocupadas nos turnos: Manhã, Tarde e Integral.',
    description: 'Distribuição dos alunos matriculados nos diferentes períodos da Educação Infantil.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_03',
    stepCode: 'EI-03',
    blockId: 'EI_BLOCO_1',
    blockLabel: 'EI Bloco 1 • Demanda e Matrículas',
    title: 'Lista de Espera por Vaga',
    shortLabel: 'Fila de Espera (EI)',
    directorPrompt: 'Quantas crianças encontram-se atualmente em lista de espera na Educação Infantil?',
    description: 'Demanda reprimida de crianças cadastradas aguardando vaga.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_04',
    stepCode: 'EI-04',
    blockId: 'EI_BLOCO_1',
    blockLabel: 'EI Bloco 1 • Demanda e Matrículas',
    title: 'Tempo Médio de Espera na Lista',
    shortLabel: 'Tempo de Espera (EI)',
    directorPrompt: 'Qual o tempo médio de espera das crianças na lista de espera?',
    description: 'Tempo decorrido entre o cadastro da criança e a convocação para matrícula.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_05',
    stepCode: 'EI-05',
    blockId: 'EI_BLOCO_1',
    blockLabel: 'EI Bloco 1 • Demanda e Matrículas',
    title: 'Motivos para a Não Obtenção de Vaga',
    shortLabel: 'Motivos s/ Vaga (EI)',
    directorPrompt: 'Quais os principais motivos relatados pelas famílias para a não obtenção de vaga?',
    description: 'Fatores que impedem o atendimento imediato da família na escola.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_06',
    stepCode: 'EI-06',
    blockId: 'EI_BLOCO_1',
    blockLabel: 'EI Bloco 1 • Demanda e Matrículas',
    title: 'Turno de Maior Procura na Fila',
    shortLabel: 'Turno Mais Procurado (EI)',
    directorPrompt: 'Qual o turno de maior procura entre as famílias em lista de espera?',
    description: 'Preferência de jornada indicada pelas famílias cadastradas.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_07',
    stepCode: 'EI-07',
    blockId: 'EI_BLOCO_1',
    blockLabel: 'EI Bloco 1 • Demanda e Matrículas',
    title: 'Solicitações de Troca de Período/Turno',
    shortLabel: 'Freq. Trocas (EI)',
    directorPrompt: 'Há solicitações de famílias para troca de período (turno) das crianças já matriculadas?',
    description: 'Frequência de pedidos para transição entre turnos parciais ou migração para o integral.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_08',
    stepCode: 'EI-08',
    blockId: 'EI_BLOCO_1',
    blockLabel: 'EI Bloco 1 • Demanda e Matrículas',
    title: 'Quantidade Aguardando Troca de Período',
    shortLabel: 'Qtd. Trocas (EI)',
    directorPrompt: 'Caso haja solicitações de troca, qual o número estimado de crianças aguardando?',
    description: 'Volume de estudantes que pleiteiam alteração de horário.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_09',
    stepCode: 'EI-09',
    blockId: 'EI_BLOCO_1',
    blockLabel: 'EI Bloco 1 • Demanda e Matrículas',
    title: 'Motivo da Troca e Época de Maior Procura',
    shortLabel: 'Motivo/Época Trocas (EI)',
    directorPrompt: 'Qual o principal motivo relatado para a troca de período e em qual época do ano há maior procura?',
    description: 'Justificativas familiares e sazonalidade das solicitações de troca.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_10',
    stepCode: 'EI-10',
    blockId: 'EI_BLOCO_1',
    blockLabel: 'EI Bloco 1 • Demanda e Matrículas',
    title: 'Capacidade Física para Ampliação de Vagas',
    shortLabel: 'Capacidade Física (EI)',
    directorPrompt: 'A unidade possui capacidade física e estrutural para ampliar o número de vagas ofertadas?',
    description: 'Potencial de expansão do prédio escolar existente.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_11',
    stepCode: 'EI-11',
    blockId: 'EI_BLOCO_1',
    blockLabel: 'EI Bloco 1 • Demanda e Matrículas',
    title: 'Vagas Adicionais Possíveis',
    shortLabel: 'Vagas Adicionais (EI)',
    directorPrompt: 'Caso haja capacidade estrutural, qual o número estimado de vagas adicionais possíveis?',
    description: 'Projeção numérica de expansão na unidade.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_12',
    stepCode: 'EI-12',
    blockId: 'EI_BLOCO_1',
    blockLabel: 'EI Bloco 1 • Demanda e Matrículas',
    title: 'Recursos Necessários para Viabilizar a Ampliação',
    shortLabel: 'Recursos Necessários (EI)',
    directorPrompt: 'Quais recursos seriam necessários para viabilizar a ampliação do atendimento?',
    description: 'Necessidades de infraestrutura, quadro de pessoal, mobiliário e serviços.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },

  // Bloco 2: Perfil e Funcionamento da Unidade em Operação (EI)
  {
    id: 'EI_17',
    stepCode: 'EI-17',
    blockId: 'EI_BLOCO_2',
    blockLabel: 'EI Bloco 2 • Perfil e Funcionamento',
    title: 'Crianças em Tempo Integral vs. Parcial',
    shortLabel: 'Integral vs Parcial (EI)',
    directorPrompt:
      'Informe a quantidade de crianças matriculadas e a capacidade máxima total para Tempo Integral e Tempo Parcial.',
    description:
      'Divisão de matrículas e capacidade máxima de atendimento por regime de permanência na escola.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_18',
    stepCode: 'EI-18',
    blockId: 'EI_BLOCO_2',
    blockLabel: 'EI Bloco 2 • Perfil e Funcionamento',
    title: 'Dimensionamento do Quadro de Profissionais',
    shortLabel: 'Quadro de Profissionais (EI)',
    directorPrompt:
      'Informe a quantidade atual de profissionais em exercício e a necessidade adicional de contratação/alocação.',
    description:
      'Informe a quantidade atual de profissionais em exercício e a necessidade adicional de contratação/alocação.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_19',
    stepCode: 'EI-19',
    blockId: 'EI_BLOCO_2',
    blockLabel: 'EI Bloco 2 • Perfil e Funcionamento',
    title: 'Tipo de Território Predominante',
    shortLabel: 'Território (EI)',
    directorPrompt: 'Qual é o tipo de território predominante entre as crianças atendidas na Educação Infantil?',
    description: 'Classificação territorial da área de residência das famílias.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_20',
    stepCode: 'EI-20',
    blockId: 'EI_BLOCO_2',
    blockLabel: 'EI Bloco 2 • Perfil e Funcionamento',
    title: 'Condições Socioeconômicas das Famílias',
    shortLabel: 'Perfil Socioeconômico (EI)',
    directorPrompt: 'Como você avalia as condições socioeconômicas predominantes das famílias atendidas?',
    description: 'Diagnóstico de vulnerabilidade e estabilidade econômica da comunidade escolar.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_21',
    stepCode: 'EI-21',
    blockId: 'EI_BLOCO_2',
    blockLabel: 'EI Bloco 2 • Perfil e Funcionamento',
    title: 'Dificuldades das Famílias para Permanência',
    shortLabel: 'Permanência Familiar (EI)',
    directorPrompt: 'Quais as principais dificuldades enfrentadas pelas famílias para garantir a permanência da criança? (até 3)',
    description: 'Fatores que afetam assiduidade e continuidade na Educação Infantil.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_22',
    stepCode: 'EI-22',
    blockId: 'EI_BLOCO_2',
    blockLabel: 'EI Bloco 2 • Perfil e Funcionamento',
    title: 'Adequação da Infraestrutura Física',
    shortLabel: 'Infraestrutura Atual (EI)',
    directorPrompt: 'A infraestrutura física atual atende adequadamente à demanda da Educação Infantil?',
    description: 'Avaliação das condições das salas, banheiros, ventilação e segurança.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_23',
    stepCode: 'EI-23',
    blockId: 'EI_BLOCO_2',
    blockLabel: 'EI Bloco 2 • Perfil e Funcionamento',
    title: 'Espaços e Recursos Disponíveis',
    shortLabel: 'Espaços Disponíveis (EI)',
    directorPrompt: 'Selecione os espaços e recursos pedagógicos disponíveis na unidade.',
    description: 'Parque, Sala de Leitura, Cantinho da Leitura, refeitório, berçário, sala de AEE, acessibilidade.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_24',
    stepCode: 'EI-24',
    blockId: 'EI_BLOCO_2',
    blockLabel: 'EI Bloco 2 • Perfil e Funcionamento',
    title: 'Articulação com a Rede do Território',
    shortLabel: 'Articulação de Rede (EI)',
    directorPrompt: 'A unidade desenvolve ações de articulação com os equipamentos do território (Saúde, CRAS, OSCs)?',
    description: 'Parcerias intersetoriais para apoio integral à primeira infância.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_25',
    stepCode: 'EI-25',
    blockId: 'EI_BLOCO_2',
    blockLabel: 'EI Bloco 2 • Perfil e Funcionamento',
    title: 'Relação da Escola com as Famílias',
    shortLabel: 'Relação c/ Famílias (EI)',
    directorPrompt: 'Como você avalia a relação entre a unidade escolar e as famílias das crianças?',
    description: 'Grau de acolhimento, engajamento e comunicação com os responsáveis.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_26',
    stepCode: 'EI-26',
    blockId: 'EI_BLOCO_2',
    blockLabel: 'EI Bloco 2 • Perfil e Funcionamento',
    title: 'Planejamento Pedagógico e Território',
    shortLabel: 'Currículo & Território (EI)',
    directorPrompt: 'A unidade considera as características e demandas do território no planejamento pedagógico?',
    description: 'Contextualização curricular e valorização dos saberes comunitários.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_27',
    stepCode: 'EI-27',
    blockId: 'EI_BLOCO_2',
    blockLabel: 'EI Bloco 2 • Perfil e Funcionamento',
    title: 'Aspectos Prioritários para Expansão/Aprimoramento',
    shortLabel: 'Aprimoramentos (EI)',
    directorPrompt: 'Quais aspectos deveriam receber maior atenção na expansão ou aprimoramento da Educação Infantil? (até 3)',
    description: 'Prioridades estratégicas para investimentos futuros.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },
  {
    id: 'EI_28',
    stepCode: 'EI-28',
    blockId: 'EI_BLOCO_2',
    blockLabel: 'EI Bloco 2 • Perfil e Funcionamento',
    title: 'Avaliação Geral da Qualidade da EI',
    shortLabel: 'Qualidade Geral (EI)',
    directorPrompt: 'Qual é a sua avaliação geral sobre a qualidade da Educação Infantil ofertada pela unidade?',
    description: 'Autoavaliação global do trabalho pedagógico e de cuidado na unidade.',
    module: 'EI',
    appliesTo: ['EI', 'AMBOS'],
  },

  // ================= [MÓDULO EF] ENSINO FUNDAMENTAL I =================
  // Bloco 1: Perfil dos Estudantes Matriculados
  {
    id: 'EF_01',
    stepCode: 'EF-01',
    blockId: 'EF_BLOCO_1',
    blockLabel: 'EF Bloco 1 • Perfil dos Estudantes',
    title: 'Total de Matrículas Ativas nos Anos iniciais do EF',
    shortLabel: 'Total de Alunos (Anos iniciais do EF)',
    directorPrompt: 'Qual é o número total de matrículas ativas no Ensino Fundamental I (1º ao 5º ano)?',
    description: 'Contagem geral de estudantes matriculados nos Anos Iniciais.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_02',
    stepCode: 'EF-02',
    blockId: 'EF_BLOCO_1',
    blockLabel: 'EF Bloco 1 • Perfil dos Estudantes',
    title: 'Turmas por Ano/Série e Turno',
    shortLabel: 'Turmas por Ano (Anos iniciais do EF)',
    directorPrompt: 'Informe a distribuição de turmas por ano/série (1º ao 5º ano) e turno.',
    description: 'Organização das classes nos períodos matutino, vespertino e integral.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_03',
    stepCode: 'EF-03',
    blockId: 'EF_BLOCO_1',
    blockLabel: 'EF Bloco 1 • Perfil dos Estudantes',
    title: 'Matrículas por Turno (Manhã, Tarde, Integral)',
    shortLabel: 'Turnos de Atendimento (Anos iniciais do EF)',
    directorPrompt: 'Informe o número de estudantes matriculados em cada turno: Manhã, Tarde e Integral.',
    description: 'Distribuição dos estudantes por turno de atendimento nos Anos iniciais do EF.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_04',
    stepCode: 'EF-04',
    blockId: 'EF_BLOCO_1',
    blockLabel: 'EF Bloco 1 • Perfil dos Estudantes',
    title: 'Tipo de Território Predominante',
    shortLabel: 'Território (Anos iniciais do EF)',
    directorPrompt: 'Qual é o tipo de território predominante entre os estudantes do Fundamental I?',
    description: 'Classificação geográfica e territorial (Urbano, Rural, Periurbano, Misto).',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_05',
    stepCode: 'EF-05',
    blockId: 'EF_BLOCO_1',
    blockLabel: 'EF Bloco 1 • Perfil dos Estudantes',
    title: 'Condições Socioeconômicas das Famílias',
    shortLabel: 'Perfil Socioeconômico (Anos iniciais do EF)',
    directorPrompt: 'Como você avalia as condições socioeconômicas predominantes das famílias atendidas?',
    description: 'Nível socioeconômico e dependência de suporte social das famílias nos Anos iniciais do EF.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_06',
    stepCode: 'EF-06',
    blockId: 'EF_BLOCO_1',
    blockLabel: 'EF Bloco 1 • Perfil dos Estudantes',
    title: 'Proporção Estimada de Estudantes PPIs',
    shortLabel: 'Perfil PPIs (Anos iniciais do EF)',
    directorPrompt: 'Qual é a proporção estimada de estudantes autodeclarados pretos, pardos e indígenas (PPIs)?',
    description: 'Indicador sociodemográfico para políticas de equidade e promoção da igualdade racial.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_07',
    stepCode: 'EF-07',
    blockId: 'EF_BLOCO_1',
    blockLabel: 'EF Bloco 1 • Perfil dos Estudantes',
    title: 'Dificuldades das Famílias no Acompanhamento Escolar',
    shortLabel: 'Acompanhamento Familiar (Anos iniciais do EF)',
    directorPrompt: 'Quais as principais dificuldades enfrentadas pelas famílias para garantir a permanência e acompanhamento escolar? (até 3)',
    description: 'Barreiras que afetam a rotina de estudos e assiduidade dos estudantes.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_08',
    stepCode: 'EF-08',
    blockId: 'EF_BLOCO_1',
    blockLabel: 'EF Bloco 1 • Perfil dos Estudantes',
    title: 'Solicitações de Troca de Período/Turno',
    shortLabel: 'Freq. Trocas (Anos iniciais do EF)',
    directorPrompt: 'Há solicitações de famílias para troca de período (turno) dos estudantes já matriculados?',
    description: 'Frequência de pedidos de transferência de turno no Fundamental I.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_09',
    stepCode: 'EF-09',
    blockId: 'EF_BLOCO_1',
    blockLabel: 'EF Bloco 1 • Perfil dos Estudantes',
    title: 'Quantidade Aguardando Troca e Principais Motivos',
    shortLabel: 'Qtd/Motivos Troca (Anos iniciais do EF)',
    directorPrompt: 'Qual a quantidade estimada de estudantes aguardando troca de período e os principais motivos relatados?',
    description: 'Volume e justificativas familiares para mudança de turno nos Anos iniciais do EF.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },

  // Bloco 2: Frequência, Transferências e Evasão
  {
    id: 'EF_10',
    stepCode: 'EF-10',
    blockId: 'EF_BLOCO_2',
    blockLabel: 'EF Bloco 2 • Frequência e Movimento',
    title: 'Transferências Recebidas e Expedidas',
    shortLabel: 'Transferências (Anos iniciais do EF)',
    directorPrompt: 'Informe o número de transferências RECEBIDAS e EXPEDIDAS no ano corrente nos Anos iniciais do EF.',
    description: 'Fluxo de movimentação e mobilidade discente na unidade escolar.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_11',
    stepCode: 'EF-11',
    blockId: 'EF_BLOCO_2',
    blockLabel: 'EF Bloco 2 • Frequência e Movimento',
    title: 'Estudantes em Abandono Escolar',
    shortLabel: 'Abandono Escolar (Anos iniciais do EF)',
    directorPrompt: 'Quantos estudantes abandonaram a escola no último ano letivo concluído?',
    description: 'Registro de casos de abandono escolar formalmente identificados.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_13',
    stepCode: 'EF-13',
    blockId: 'EF_BLOCO_2',
    blockLabel: 'EF Bloco 2 • Frequência e Movimento',
    title: 'Principais Motivos de Abandono/Evasão',
    shortLabel: 'Motivos de Evasão (Anos iniciais do EF)',
    directorPrompt: 'Quais os principais motivos identificados para os casos de abandono/evasão? (até 3)',
    description: 'Fatores determinantes para a infrequência grave e abandono no território.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_14',
    stepCode: 'EF-14',
    blockId: 'EF_BLOCO_2',
    blockLabel: 'EF Bloco 2 • Frequência e Movimento',
    title: 'Estratégias de Busca Ativa Escolar',
    shortLabel: 'Busca Ativa (Anos iniciais do EF)',
    directorPrompt: 'A unidade desenvolve estratégias formais de Busca Ativa Escolar para alunos com frequência irregular?',
    description: 'Protocolos de contato familiar, visitas domiciliares e acionamento da rede de proteção.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_15',
    stepCode: 'EF-15',
    blockId: 'EF_BLOCO_2',
    blockLabel: 'EF Bloco 2 • Frequência e Movimento',
    title: 'Acompanhamento de Alunos em Risco de Evasão',
    shortLabel: 'Acompanhamento Individual (Anos iniciais do EF)',
    directorPrompt: 'Existe mecanismo formal de acompanhamento individualizado de alunos em risco de evasão?',
    description: 'Monitoramento preventivo de estudantes com alertas de infrequência ou defasagem.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },

  // Bloco 3: Infraestrutura e Funcionamento Institucional
  {
    id: 'EF_16',
    stepCode: 'EF-16',
    blockId: 'EF_BLOCO_3',
    blockLabel: 'EF Bloco 3 • Infraestrutura e Gestão',
    title: 'Adequação da Infraestrutura Física',
    shortLabel: 'Infraestrutura Atual (Anos iniciais do EF)',
    directorPrompt: 'A infraestrutura física atual atende adequadamente ao número de matrículas do Fundamental I?',
    description: 'Condições gerais das salas de aula, conforto térmico, sanitários e segurança.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_17',
    stepCode: 'EF-17',
    blockId: 'EF_BLOCO_3',
    blockLabel: 'EF Bloco 3 • Infraestrutura e Gestão',
    title: 'Espaços e Recursos Disponíveis',
    shortLabel: 'Espaços Disponíveis (Anos iniciais do EF)',
    directorPrompt: 'Selecione os espaços e recursos pedagógicos disponíveis na unidade.',
    description: 'Sala de Leitura, Cantinho da Leitura, Informática, Playground, Pátio, Quadra sem cobertura, Quadra Coberta, Refeitório, AEE, Acessibilidade.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_18',
    stepCode: 'EF-18',
    blockId: 'EF_BLOCO_3',
    blockLabel: 'EF Bloco 3 • Infraestrutura e Gestão',
    title: 'Dimensionamento do Quadro de Profissionais',
    shortLabel: 'Quadro de Profissionais (Anos iniciais do EF)',
    directorPrompt:
      'Informe a quantidade atual de profissionais em exercício e a necessidade adicional de contratação/alocação.',
    description:
      'Informe a quantidade atual de profissionais em exercício e a necessidade adicional de contratação/alocação.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_20',
    stepCode: 'EF-20',
    blockId: 'EF_BLOCO_3',
    blockLabel: 'EF Bloco 3 • Infraestrutura e Gestão',
    title: 'Articulação com a Rede do Território',
    shortLabel: 'Articulação Intersetorial (Anos iniciais do EF)',
    directorPrompt: 'A escola desenvolve ações de articulação com equipamentos do território (Saúde, CRAS, OSCs)?',
    description: 'Trabalho em rede para proteção integral dos estudantes.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },

  // Bloco 4: Aprendizagem e Indicadores Pedagógicos
  {
    id: 'EF_21',
    stepCode: 'EF-21',
    blockId: 'EF_BLOCO_4',
    blockLabel: 'EF Bloco 4 • Aprendizagem e Avaliação',
    title: 'Participação no Saeb',
    shortLabel: 'Participação Saeb (Anos iniciais do EF)',
    directorPrompt: 'A unidade escolar participa regularmente do Saeb (Avaliação da Educação Básica)?',
    description: 'Adesão às avaliações diagnósticas externas de larga escala.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_21_IDEB',
    stepCode: 'EF-21A',
    blockId: 'EF_BLOCO_4',
    blockLabel: 'EF Bloco 4 • Aprendizagem e Avaliação',
    title: 'Índice do IDEB',
    shortLabel: 'Resultado do IDEB',
    directorPrompt: 'Os resultados geraram Índice do IDEB?',
    description: 'Indicação da existência de resultado oficial do IDEB para a unidade.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_22',
    stepCode: 'EF-22',
    blockId: 'EF_BLOCO_4',
    blockLabel: 'EF Bloco 4 • Aprendizagem e Avaliação',
    title: 'Evolução do Desempenho em Português e Matemática',
    shortLabel: 'Evolução do Desempenho (Anos iniciais do EF)',
    directorPrompt: 'Como se caracteriza a evolução do desempenho dos estudantes em Língua Portuguesa e Matemática nos últimos anos?',
    description: 'Tendência dos resultados de aprendizagem e proficiência nos anos iniciais.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },

  {
    id: 'EF_23',
    stepCode: 'EF-23',
    blockId: 'EF_BLOCO_4',
    blockLabel: 'EF Bloco 4 • Aprendizagem e Avaliação',
    title: 'Reforço Escolar ou Atendimento Complementar',
    shortLabel: 'Reforço Escolar (Anos iniciais do EF)',
    directorPrompt: 'A unidade oferece reforço escolar ou atendimento pedagógico complementar para estudantes com defasagem?',
    description: 'Ações de recomposição de aprendizagens e apoio pedagógico contínuo.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },

  // Bloco 5: Relação com as Famílias e Avaliação Institucional
  {
    id: 'EF_25',
    stepCode: 'EF-25',
    blockId: 'EF_BLOCO_5',
    blockLabel: 'EF Bloco 5 • Famílias e Qualidade',
    title: 'Relação da Escola com as Famílias',
    shortLabel: 'Relação c/ Famílias (Anos iniciais do EF)',
    directorPrompt: 'Como você avalia a relação entre a unidade escolar e as famílias dos estudantes?',
    description: 'Participação nas reuniões, canal de diálogo e engajamento comunitário.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_26',
    stepCode: 'EF-26',
    blockId: 'EF_BLOCO_5',
    blockLabel: 'EF Bloco 5 • Famílias e Qualidade',
    title: 'Planejamento Pedagógico e Características Locais',
    shortLabel: 'Currículo & Comunidade (Anos iniciais do EF)',
    directorPrompt: 'A unidade considera as características do território e da comunidade no planejamento escolar?',
    description: 'Projetos integrados ao contexto sociocultural local.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_27',
    stepCode: 'EF-27',
    blockId: 'EF_BLOCO_5',
    blockLabel: 'EF Bloco 5 • Famílias e Qualidade',
    title: 'Aspectos Prioritários para Melhoria do Ensino',
    shortLabel: 'Aspectos Prioritários (Anos iniciais do EF)',
    directorPrompt: 'Quais aspectos deveriam receber maior atenção na melhoria do atendimento nos Anos iniciais do EF? (até 3)',
    description: 'Prioridades estratégicas para gestão, infraestrutura e recursos pedagógicos.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },
  {
    id: 'EF_28',
    stepCode: 'EF-28',
    blockId: 'EF_BLOCO_5',
    blockLabel: 'EF Bloco 5 • Famílias e Qualidade',
    title: 'Avaliação Geral da Qualidade dos Anos iniciais do EF',
    shortLabel: 'Qualidade Geral (Anos iniciais do EF)',
    directorPrompt: 'Qual é a sua avaliação geral sobre a qualidade do Ensino Fundamental I atualmente ofertado na escola?',
    description: 'Autoavaliação global dos processos formativos e resultados educacionais.',
    module: 'EF',
    appliesTo: ['EF', 'AMBOS'],
  },

  // ================= TELA FINAL: CONFIRMAÇÃO E HOMOLOGAÇÃO =================
  {
    id: 'CONCLUSAO_RESUMO',
    stepCode: 'SÍNTESE',
    blockId: 'CONCLUSAO',
    blockLabel: 'Relatório Final • Homologação',
    title: 'Relatório Resumo Completo e Homologação',
    shortLabel: 'Relatório Final',
    directorPrompt:
      'Parabéns! Todas as etapas foram concluídas. Revise o resumo de respostas, verifique a declaração e confirme o envio oficial para a Secretaria de Educação de Pindamonhangaba.',
    description: 'Emissão do comprovante de protocolo e homologação dos dados diagnósticos.',
    module: 'CONCLUSAO',
    appliesTo: ['ALL'],
  },
];

/**
 * Filter steps dynamically based on selected sphere:
 * - 'EI': Etapa 0, Etapa 1, EI-01..EI-28, Conclusão (31 etapas)
 * - 'EF': Etapa 0, Etapa 1, EF-01..EF-28, Conclusão (31 etapas)
 * - 'AMBOS': Etapa 0, Etapa 1, EI-01..EI-28, EF-01..EF-28, Conclusão (59 etapas)
 */
export function getApplicableSteps(sphere: EducationSphere): QuestionStep[] {
  return ALL_STEPS.filter((step) => {
    if (step.appliesTo.includes('ALL')) return true;
    if (step.appliesTo.includes(sphere)) return true;
    return false;
  });
}

/**
 * Function to check whether a specific question step is suppressed/dispensed based on conditional rules.
 */
export function isStepSuppressed(
  stepId: string,
  formData: SurveyFormData
): { suppressed: boolean; reason?: string; autoValueLabel?: string } {
  if (stepId === 'EI_04' && formData.ei_03_waitingListCount === 0) {
    return {
      suppressed: true,
      reason:
        'No item EI-03 foi registrado que não há crianças na lista de espera (0 alunos). Portanto, esta pergunta foi automaticamente dispensada.',
      autoValueLabel: 'Não há tempo de espera (Sem lista de espera)',
    };
  }

  if (stepId === 'EI_05' && formData.ei_03_waitingListCount === 0) {
    return {
      suppressed: true,
      reason:
        'No item EI-03 foi registrado que não há crianças na lista de espera (0 alunos). Portanto, não há motivo de ausência de vaga a informar.',
      autoValueLabel: 'Não se aplica (Sem lista de espera)',
    };
  }

  if (stepId === 'EI_06' && formData.ei_03_waitingListCount === 0) {
    return {
      suppressed: true,
      reason:
        'No item EI-03 foi registrado que não há crianças na lista de espera (0 alunos). Portanto, não há turno de maior procura a informar.',
      autoValueLabel: 'Não se aplica (Sem lista de espera)',
    };
  }

  if (stepId === 'EI_11' && formData.ei_10_expansionCapacity === 'Não') {
    return {
      suppressed: true,
      reason:
        'No item EI-10 foi informado que a unidade não possui capacidade física/estrutural para ampliação de vagas ("Não"). Portanto, o cálculo de vagas adicionais foi dispensado.',
      autoValueLabel: '0 vagas adicionais (Sem capacidade de ampliação)',
    };
  }

  if (stepId === 'EI_12' && formData.ei_10_expansionCapacity === 'Não') {
    return {
      suppressed: true,
      reason:
        'No item EI-10 foi informado que a unidade não possui capacidade física/estrutural para ampliação de vagas ("Não"). Portanto, a indicação de recursos necessários foi dispensada.',
      autoValueLabel: 'Não se aplica (Sem ampliação prevista)',
    };
  }

  // --- UNIFICAÇÃO PARA UNIDADES QUE ATENDEM EI E EF ("AMBOS") ---
  if (stepId === 'EF_04' && formData.sphere === 'AMBOS') {
    const val = formData.ei_19_territoryType || formData.ef_04_territoryType || 'Urbano';
    return {
      suppressed: true,
      reason:
        'Como a unidade escolar atende Educação Infantil e Ensino Fundamental I no mesmo território físico, a classificação geográfica informada no item EI-19 foi integrada e replicada automaticamente para o Fundamental I.',
      autoValueLabel: `${val} (Replicado de EI-19)`,
    };
  }

  if (stepId === 'EF_05' && formData.sphere === 'AMBOS') {
    const val = formData.ei_20_socioeconomicProfile || formData.ef_05_socioeconomicProfile || 'Mistas';
    return {
      suppressed: true,
      reason:
        'Como os estudantes da Educação Infantil e do Ensino Fundamental I pertencem à mesma comunidade territorial, o perfil socioeconômico informado em EI-20 foi integrado e replicado automaticamente para o Fundamental I.',
      autoValueLabel: `${val} (Replicado de EI-20)`,
    };
  }

  if (stepId === 'EF_18' && formData.sphere === 'AMBOS') {
    const s = formData['EI-18'] || formData.ei_18_staffData;
    let label = 'Quadro Geral Integrado';
    if (s) {
      const totAtual = Object.values(s).reduce((acc, item) => acc + (item?.atual || 0), 0);
      const totNec = Object.values(s).reduce((acc, item) => acc + (item?.necessidade || 0), 0);
      label = `${totAtual} atuais (+${totNec} necessários) [Integrado de EI-18]`;
    } else if (formData.ei_18_staffBreakdown || formData.ef_18_staffBreakdown) {
      const val = formData.ei_18_staffBreakdown || formData.ef_18_staffBreakdown || '';
      label = val.length > 60 ? `${val.substring(0, 60)}... (Integrado de EI-18)` : `${val} (Integrado de EI-18)`;
    }
    return {
      suppressed: true,
      reason:
        'Como a unidade escolar é a mesma, o quantitativo geral de profissionais e dimensionamento do quadro informado no item EI-18 foi integrado e replicado automaticamente para o Ensino Fundamental I.',
      autoValueLabel: label,
    };
  }

  if (stepId === 'EF_21_IDEB' && formData.ef_21_participatesSaeb !== 'Sim') {
    return {
      suppressed: true,
      reason: 'A pergunta sobre o IDEB só se aplica quando a unidade informa participação no Saeb.',
      autoValueLabel: 'Não se aplica',
    };
  }

  return { suppressed: false };
}

/**
 * Function to check whether a specific question has been filled / answered in formData.
 */
export function isStepAnswered(stepId: string, formData: SurveyFormData): boolean {
  // Check if step is conditionally suppressed
  const suppression = isStepSuppressed(stepId, formData);
  if (suppression.suppressed) {
    return true;
  }

  switch (stepId) {
    case 'ETAPA_0_IDENTIFICACAO':
      return Boolean(
        formData.directorName?.trim() &&
          formData.respondentRole &&
          formData.directorEmail?.trim()
      );
    case 'ETAPA_1_TRIAGEM':
      return Boolean(
        formData.schoolName?.trim() &&
          formData.neighborhoodCoverage?.trim() &&
          formData.sphere
      );

    case 'ETAPA_2_VISITAS_SUPERVISAO': {
      const v = formData['VISITAS_SUPERVISAO'] || formData.supervisionVisitsData;
      if (!v) return false;
      const grebsFilled =
        typeof v.grebs?.dias === 'number' ||
        typeof v.grebs?.meses === 'number' ||
        typeof v.grebs?.anual === 'number';
      const gtFilled =
        typeof v.gt?.dias === 'number' ||
        typeof v.gt?.meses === 'number' ||
        typeof v.gt?.anual === 'number';
      const supFilled =
        typeof v.supervisoras_estado?.dias === 'number' ||
        typeof v.supervisoras_estado?.meses === 'number' ||
        typeof v.supervisoras_estado?.anual === 'number';
      return Boolean(grebsFilled || gtFilled || supFilled);
    }

    case 'UNI_01':
    case 'ed-integral':
    case 'ed_integral': {
      const uni = formData['ed-integral'] || formData['UNI-01'] || formData.uni_01_data || formData.ed_integral;
      const diretriz = uni?.diretriz_escolhida || formData.uni_01_diretriz;
      if (!diretriz) return false;
      const det = uni?.detalhes;
      if (diretriz === 'CONTINUIDADE') {
        if (!det?.acao_continuidade) return false;
        if ((det.acao_continuidade === 'AUMENTAR' || det.acao_continuidade === 'DIMINUIR') && typeof det.qtd_salas_ajuste !== 'number') {
          return false;
        }
        return true;
      }
      if (diretriz === 'IMPLEMENTACAO') {
        if (!det?.regime_planejado) return false;
        return typeof det?.qtd_salas_implementacao === 'number';
      }
      if (diretriz === 'AMPLIACAO') {
        return typeof det?.qtd_salas_ampliacao === 'number';
      }
      return true;
    }

    // EI
    case 'EI_01':
      return (
        (typeof formData.ei_01_totalEnrolled === 'number' && formData.ei_01_totalEnrolled > 0) ||
        (typeof formData.ei_15_totalEnrolled === 'number' && formData.ei_15_totalEnrolled > 0)
      );
    case 'EI_02':
      return (
        typeof formData.ei_02_occupiedMorning === 'number' &&
        typeof formData.ei_02_occupiedAfternoon === 'number' &&
        typeof formData.ei_02_occupiedIntegral === 'number' &&
        (formData.ei_02_occupiedMorning > 0 ||
          formData.ei_02_occupiedAfternoon > 0 ||
          formData.ei_02_occupiedIntegral > 0)
      );
    case 'EI_03':
      return typeof formData.ei_03_waitingListCount === 'number';
    case 'EI_04':
      if (formData.ei_03_waitingListCount === 0) return true;
      return Boolean(formData.ei_04_avgWaitTime && formData.ei_04_avgWaitTime.trim());
    case 'EI_05':
      return Boolean(formData.ei_05_reasonsNoSlot && formData.ei_05_reasonsNoSlot.length > 0);
    case 'EI_06':
      return Boolean(formData.ei_06_highestDemandShift && formData.ei_06_highestDemandShift.trim());
    case 'EI_07':
      return Boolean(formData.ei_07_shiftChangeRequests && formData.ei_07_shiftChangeRequests.trim());
    case 'EI_08':
      return typeof formData.ei_08_shiftChangeWaitingCount === 'number';
    case 'EI_09':
      return Boolean(formData.ei_09_shiftChangeReasonAndPeak && formData.ei_09_shiftChangeReasonAndPeak.trim());
    case 'EI_10':
      return Boolean(formData.ei_10_expansionCapacity && formData.ei_10_expansionCapacity.trim());
    case 'EI_11':
      if (formData.ei_10_expansionCapacity === 'Não') return true;
      return typeof formData.ei_11_additionalSlotsEstimated === 'number';
    case 'EI_12':
      if (formData.ei_10_expansionCapacity === 'Não') return true;
      return Boolean(formData.ei_12_resourcesNeeded && formData.ei_12_resourcesNeeded.length > 0);
    case 'EI_17': {
      const ei17 = formData['EI-17'];
      if (ei17) {
        return (
          typeof ei17.integral?.matriculados === 'number' &&
          typeof ei17.integral?.capacidade === 'number' &&
          typeof ei17.parcial?.matriculados === 'number' &&
          typeof ei17.parcial?.capacidade === 'number'
        );
      }
      return (
        typeof formData.ei_17_integralCount === 'number' &&
        typeof formData.ei_17_integralCapacity === 'number' &&
        typeof formData.ei_17_partialCount === 'number' &&
        typeof formData.ei_17_partialCapacity === 'number'
      );
    }
    case 'EI_18': {
      const staff = formData['EI-18'] || formData.ei_18_staffData;
      if (staff) {
        return (
          typeof staff.professores?.atual === 'number' ||
          typeof staff.professores?.necessidade === 'number' ||
          Boolean(formData.ei_18_staffBreakdown && formData.ei_18_staffBreakdown.trim())
        );
      }
      return Boolean(formData.ei_18_staffBreakdown && formData.ei_18_staffBreakdown.trim());
    }
    case 'EI_19':
      return Boolean(formData.ei_19_territoryType && formData.ei_19_territoryType.trim());
    case 'EI_20':
      return Boolean(formData.ei_20_socioeconomicProfile && formData.ei_20_socioeconomicProfile.trim());
    case 'EI_21':
      return Boolean(formData.ei_21_retentionDifficulties && formData.ei_21_retentionDifficulties.length > 0);
    case 'EI_22':
      return Boolean(formData.ei_22_infraAdequacy && formData.ei_22_infraAdequacy.trim());
    case 'EI_23':
      return Boolean(formData.ei_23_availableSpaces && formData.ei_23_availableSpaces.length > 0);
    case 'EI_24':
      return Boolean(formData.ei_24_territoryArticulation && formData.ei_24_territoryArticulation.trim());
    case 'EI_25':
      return Boolean(formData.ei_25_familyRelationship && formData.ei_25_familyRelationship.trim());
    case 'EI_26':
      return Boolean(formData.ei_26_considersTerritoryPlanning && formData.ei_26_considersTerritoryPlanning.trim());
    case 'EI_27':
      return Boolean(formData.ei_27_focusAspects && formData.ei_27_focusAspects.length > 0);
    case 'EI_28':
      return Boolean(formData.ei_28_overallQuality && formData.ei_28_overallQuality.trim());

    // EF
    case 'EF_01':
      return typeof formData.ef_01_totalEnrolled === 'number' && formData.ef_01_totalEnrolled > 0;
    case 'EF_02':
      return Boolean(
        formData.ef_02_classesByYear &&
          (['1', '2', '3', '4', '5', 'EJA'] as const).every((year) =>
            ['manha', 'tarde', 'integral'].every(
              (shift) => typeof formData.ef_02_classesByYear?.[year]?.[shift as 'manha' | 'tarde' | 'integral'] === 'number'
            )
          )
      );
    case 'EF_03':
      return (
        typeof formData.ef_03_enrolledMorning === 'number' &&
        typeof formData.ef_03_enrolledAfternoon === 'number' &&
        typeof formData.ef_03_enrolledIntegral === 'number' &&
        (formData.ef_03_enrolledMorning > 0 ||
          formData.ef_03_enrolledAfternoon > 0 ||
          formData.ef_03_enrolledIntegral > 0)
      );
    case 'EF_04':
      return Boolean(formData.ef_04_territoryType && formData.ef_04_territoryType.trim());
    case 'EF_05':
      return Boolean(formData.ef_05_socioeconomicProfile && formData.ef_05_socioeconomicProfile.trim());
    case 'EF_06':
      return Boolean(formData.ef_06_ppiProportion && formData.ef_06_ppiProportion.trim());
    case 'EF_07':
      return Boolean(formData.ef_07_retentionDifficulties && formData.ef_07_retentionDifficulties.length > 0);
    case 'EF_08':
      return Boolean(formData.ef_08_shiftChangeRequests && formData.ef_08_shiftChangeRequests.trim());
    case 'EF_09':
      return Boolean(formData.ef_09_shiftChangeWaitingCountAndReasons && formData.ef_09_shiftChangeWaitingCountAndReasons.trim());
    case 'EF_10':
      return (
        typeof formData.ef_10_transfersReceived === 'number' &&
        typeof formData.ef_10_transfersIssued === 'number'
      );
    case 'EF_11':
      return typeof formData.ef_11_dropoutCount === 'number';
    case 'EF_13':
      return Boolean(formData.ef_13_dropoutReasons && formData.ef_13_dropoutReasons.length > 0);
    case 'EF_14':
      return Boolean(formData.ef_14_activeSearchStrategy && formData.ef_14_activeSearchStrategy.trim());
    case 'EF_15':
      return Boolean(formData.ef_15_individualizedTracking && formData.ef_15_individualizedTracking.trim());
    case 'EF_16':
      return Boolean(formData.ef_16_infraAdequacy && formData.ef_16_infraAdequacy.trim());
    case 'EF_17':
      return Boolean(formData.ef_17_availableSpaces && formData.ef_17_availableSpaces.length > 0);
    case 'EF_18': {
      const staff = formData['EF-18'] || formData.ef_18_staffData || formData['EI-18'] || formData.ei_18_staffData;
      if (staff) {
        return (
          typeof staff.professores?.atual === 'number' ||
          typeof staff.professores?.necessidade === 'number' ||
          Boolean(formData.ef_18_staffBreakdown && formData.ef_18_staffBreakdown.trim())
        );
      }
      return Boolean(formData.ef_18_staffBreakdown && formData.ef_18_staffBreakdown.trim());
    }
    case 'EF_20':
      return Boolean(formData.ef_20_territoryArticulation && formData.ef_20_territoryArticulation.trim());
    case 'EF_21':
      return Boolean(formData.ef_21_participatesSaeb && formData.ef_21_participatesSaeb.trim());
    case 'EF_21_IDEB':
      return formData.ef_21_participatesSaeb !== 'Sim' || Boolean(formData.ef_21_idebIndexGenerated);
    case 'EF_22':
      return Boolean(formData.ef_22_performanceEvolution && formData.ef_22_performanceEvolution.trim());
    case 'EF_23':
      return Boolean(formData.ef_23_learningSupport && formData.ef_23_learningSupport.trim());
    case 'EF_25':
      return Boolean(formData.ef_25_familyRelationship && formData.ef_25_familyRelationship.trim());
    case 'EF_26':
      return Boolean(formData.ef_26_considersTerritoryPlanning && formData.ef_26_considersTerritoryPlanning.trim());
    case 'EF_27':
      return Boolean(formData.ef_27_focusAspects && formData.ef_27_focusAspects.length > 0);
    case 'EF_28':
      return Boolean(formData.ef_28_overallQuality && formData.ef_28_overallQuality.trim());

    case 'CONCLUSAO_RESUMO':
      return formData.status === 'CONFIRMED';

    default:
      return false;
  }
}

export function generateProtocol(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `PINDAMONHANGABA-DIAG-${year}-${randomPart}${timestamp}`;
}

export const INITIAL_FORM_DATA: SurveyFormData = {
  id: '',
  protocolNumber: '',
  createdAt: '',
  updatedAt: '',
  municipality: 'Pindamonhangaba - SP',
  status: 'DRAFT',

  // Etapa 0
  directorName: '',
  respondentRole: 'DIRETOR',
  directorEmail: '',
  directorPhone: '',

  // Etapa 1
  schoolSector: '',
  schoolName: '',
  neighborhoodCoverage: '',
  sphere: 'AMBOS',

  // Etapa 2 (Fundamental / Todos os cenários): Frequência de Visitas
  supervisionVisitsData: {
    grebs: { dias: undefined, meses: undefined, anual: undefined },
    gt: { dias: undefined, meses: undefined, anual: undefined },
    supervisoras_estado: { dias: undefined, meses: undefined, anual: undefined },
  },
  'VISITAS_SUPERVISAO': {
    grebs: { dias: undefined, meses: undefined, anual: undefined },
    gt: { dias: undefined, meses: undefined, anual: undefined },
    supervisoras_estado: { dias: undefined, meses: undefined, anual: undefined },
  },

  // Etapa 3 / Questão Universal: Viabilidade e Diretriz da Oferta Integral (UNI-01 / ed-integral)
  uni_01_diretriz: undefined,
  uni_01_data: {
    diretriz_escolhida: undefined,
    detalhes: {
      acao_continuidade: undefined,
      qtd_salas_ajuste: undefined,
      regime_planejado: undefined,
      qtd_salas_implementacao: undefined,
      qtd_salas_ampliacao: undefined,
      observacao_comunidade: '',
    },
  },
  'UNI-01': {
    diretriz_escolhida: undefined,
    detalhes: {
      acao_continuidade: undefined,
      qtd_salas_ajuste: undefined,
      regime_planejado: undefined,
      qtd_salas_implementacao: undefined,
      qtd_salas_ampliacao: undefined,
      observacao_comunidade: '',
    },
  },
  'ed-integral': {
    diretriz_escolhida: undefined,
    detalhes: {
      acao_continuidade: undefined,
      qtd_salas_ajuste: undefined,
      regime_planejado: undefined,
      qtd_salas_implementacao: undefined,
      qtd_salas_ampliacao: undefined,
      observacao_comunidade: '',
    },
  },
  ed_integral: {
    diretriz_escolhida: undefined,
    detalhes: {
      acao_continuidade: undefined,
      qtd_salas_ajuste: undefined,
      regime_planejado: undefined,
      qtd_salas_implementacao: undefined,
      qtd_salas_ampliacao: undefined,
      observacao_comunidade: '',
    },
  },

  // EI Defaults - Todos os campos de respostas iniciam vazios/não preenchidos
  ei_01_totalEnrolled: undefined,
  ei_15_totalEnrolled: undefined,
  ei_01_totalCapacity: undefined,
  ei_02_occupiedMorning: undefined,
  ei_02_occupiedAfternoon: undefined,
  ei_02_occupiedIntegral: undefined,
  ei_03_waitingListCount: undefined,
  ei_04_avgWaitTime: '',
  ei_05_reasonsNoSlot: [],
  ei_05_otherReason: '',
  ei_06_highestDemandShift: '',
  ei_07_shiftChangeRequests: '',
  ei_08_shiftChangeWaitingCount: undefined,
  ei_09_shiftChangeReasonAndPeak: '',
  ei_10_expansionCapacity: '',
  ei_11_additionalSlotsEstimated: undefined,
  ei_12_resourcesNeeded: [],
  ei_13_publicEquipmentsGaps: '',
  ei_13_details: '',
  ei_14_prioritizationCriteria: [],
  ei_16_totalClasses: undefined,
  ei_16_classesMorning: undefined,
  ei_16_classesAfternoon: undefined,
  ei_16_classesIntegral: undefined,
  ei_16_avgStudentsPerClass: undefined,
  ei_16_groupsAndAvgClassSize: '',
  ei_17_integralCount: undefined,
  ei_17_integralCapacity: undefined,
  ei_17_partialCount: undefined,
  ei_17_partialCapacity: undefined,
  'EI-17': {
    integral: { matriculados: 0, capacidade: 0 },
    parcial: { matriculados: 0, capacidade: 0 },
  },
  ei_18_staffBreakdown: '',
  ei_18_staffData: {
    professores: { atual: 0, necessidade: 0 },
    professores_especialistas: { atual: 0, necessidade: 0 },
    asgs: { atual: 0, necessidade: 0 },
    adis: { atual: 0, necessidade: 0 },
    aoe: { atual: 0, necessidade: 0 },
    estagiarios: { atual: 0, necessidade: 0 },
    milclean: { atual: 0, necessidade: 0 },
  },
  'EI-18': {
    professores: { atual: 0, necessidade: 0 },
    professores_especialistas: { atual: 0, necessidade: 0 },
    asgs: { atual: 0, necessidade: 0 },
    adis: { atual: 0, necessidade: 0 },
    aoe: { atual: 0, necessidade: 0 },
    estagiarios: { atual: 0, necessidade: 0 },
    milclean: { atual: 0, necessidade: 0 },
  },
  ei_19_territoryType: '',
  ei_20_socioeconomicProfile: '',
  ei_21_retentionDifficulties: [],
  ei_22_infraAdequacy: '',
  ei_23_availableSpaces: [],
  ei_24_territoryArticulation: '',
  ei_25_familyRelationship: '',
  ei_26_considersTerritoryPlanning: '',
  ei_27_focusAspects: [],
  ei_28_overallQuality: '',

  // EF Defaults - Todos os campos de respostas iniciam vazios/não preenchidos
  ef_01_totalEnrolled: undefined,
  ef_02_classesBreakdown: '',
  ef_02_classesByYear: {
    '1': { manha: 0, tarde: 0, integral: 0 },
    '2': { manha: 0, tarde: 0, integral: 0 },
    '3': { manha: 0, tarde: 0, integral: 0 },
    '4': { manha: 0, tarde: 0, integral: 0 },
    '5': { manha: 0, tarde: 0, integral: 0 },
    EJA: { manha: 0, tarde: 0, integral: 0 },
  },
  ef_03_enrolledMorning: undefined,
  ef_03_enrolledAfternoon: undefined,
  ef_03_enrolledIntegral: undefined,
  ef_04_territoryType: '',
  ef_05_socioeconomicProfile: '',
  ef_06_ppiProportion: '',
  ef_07_retentionDifficulties: [],
  ef_08_shiftChangeRequests: '',
  ef_09_shiftChangeWaitingCountAndReasons: '',
  ef_10_transfersReceived: undefined,
  ef_10_transfersIssued: undefined,
  ef_11_dropoutCount: undefined,
  ef_13_dropoutReasons: [],
  ef_14_activeSearchStrategy: '',
  ef_15_individualizedTracking: '',
  ef_16_infraAdequacy: '',
  ef_17_availableSpaces: [],
  ef_18_staffBreakdown: '',
  ef_18_staffData: {
    professores: { atual: 0, necessidade: 0 },
    professores_especialistas: { atual: 0, necessidade: 0 },
    asgs: { atual: 0, necessidade: 0 },
    adis: { atual: 0, necessidade: 0 },
    aoe: { atual: 0, necessidade: 0 },
    estagiarios: { atual: 0, necessidade: 0 },
    milclean: { atual: 0, necessidade: 0 },
  },
  'EF-18': {
    professores: { atual: 0, necessidade: 0 },
    professores_especialistas: { atual: 0, necessidade: 0 },
    asgs: { atual: 0, necessidade: 0 },
    adis: { atual: 0, necessidade: 0 },
    aoe: { atual: 0, necessidade: 0 },
    estagiarios: { atual: 0, necessidade: 0 },
    milclean: { atual: 0, necessidade: 0 },
  },
  ef_19_pedagogicalCoordination: '',
  ef_20_territoryArticulation: '',
  ef_21_participatesSaeb: '',
  ef_21_idebIndexGenerated: '',
  ef_22_performanceEvolution: '',
  ef_23_learningSupport: '',
  ef_25_familyRelationship: '',
  ef_26_considersTerritoryPlanning: '',
  ef_27_focusAspects: [],
  ef_28_overallQuality: '',
};
