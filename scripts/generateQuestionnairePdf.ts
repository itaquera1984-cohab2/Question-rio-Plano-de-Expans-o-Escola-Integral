import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { ALL_STEPS } from '../src/data/steps.ts';
import { QuestionStep } from '../src/types/questionnaire.ts';

function createQuestionnairePdf(outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 50, left: 45, right: 45 },
      bufferPages: true,
      info: {
        Title: 'Questionário Diagnóstico Municipal - Educação Integral',
        Author: 'Secretaria Municipal de Educação de Pindamonhangaba',
        Subject: 'Instrumento Completo de Coleta de Dados - EI, EF e Gerais',
        Keywords: 'Educação Integral, Pindamonhangaba, Questionário, EI, EF',
      },
    });

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    const primaryColor = '#0f172a'; // Slate 900
    const geraisColor = '#1e3a8a';  // Blue 900
    const eiColor = '#065f46';      // Emerald 800
    const efColor = '#3730a3';      // Indigo 800
    const textColor = '#334155';    // Slate 700
    const subtextColor = '#64748b'; // Slate 500

    // Filter questions into 3 main groups
    const geraisSteps = ALL_STEPS.filter(
      (s) => s.module === 'TRIAGEM' || s.module === 'CONCLUSAO' || s.appliesTo.includes('ALL')
    );
    const eiSteps = ALL_STEPS.filter(
      (s) => s.module === 'EI' || (s.appliesTo.includes('EI') && s.module !== 'TRIAGEM' && s.module !== 'CONCLUSAO')
    );
    const efSteps = ALL_STEPS.filter(
      (s) => s.module === 'EF' || (s.appliesTo.includes('EF') && s.module !== 'TRIAGEM' && s.module !== 'CONCLUSAO')
    );

    // --- COVER / HEADER BANNER ---
    doc
      .rect(0, 0, 595.28, 110)
      .fill('#0f172a');

    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('SECRETARIA MUNICIPAL DE EDUCAÇÃO DE PINDAMONHANGABA', 45, 25, { width: 505, align: 'center' });

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor('#60a5fa')
      .text('PLANO MUNICIPAL DE EXPANSÃO DA EDUCAÇÃO INTEGRAL', 45, 48, { width: 505, align: 'center' });

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#cbd5e1')
      .text('Caderno Oficial de Questões do Questionário Diagnóstico de Unidades Escolares', 45, 68, { width: 505, align: 'center' });

    doc
      .fontSize(8.5)
      .font('Helvetica-Oblique')
      .fillColor('#94a3b8')
      .text('Estruturado em Questões Gerais, Educação Infantil (EI) e Ensino Fundamental I (EF)', 45, 84, { width: 505, align: 'center' });

    doc.y = 125;

    // Helper to draw section title banner
    const drawSectionHeader = (title: string, subtitle: string, color: string) => {
      // Check space
      if (doc.y > 700) {
        doc.addPage();
      } else {
        doc.moveDown(0.8);
      }

      const startY = doc.y;
      doc
        .rect(45, startY, 505, 36)
        .fill(color);

      doc
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(title, 55, startY + 6, { width: 485 });

      doc
        .fillColor('#e2e8f0')
        .font('Helvetica')
        .fontSize(8.5)
        .text(subtitle, 55, startY + 21, { width: 485 });

      doc.y = startY + 44;
    };

    // Helper to draw step card
    const drawStepCard = (step: QuestionStep, sectionColor: string) => {
      const estimatedHeight = 65 + Math.ceil(step.directorPrompt.length / 85) * 12 + Math.ceil(step.description.length / 95) * 10;

      if (doc.y + estimatedHeight > 760) {
        doc.addPage();
      }

      const boxY = doc.y;

      // Card left border accent
      doc
        .rect(45, boxY, 4, 18)
        .fill(sectionColor);

      // Code Badge
      doc
        .rect(53, boxY, 68, 16)
        .fill('#f1f5f9');

      doc
        .fillColor(sectionColor)
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(step.stepCode, 55, boxY + 3, { width: 64, align: 'center' });

      // Title
      doc
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .fontSize(10.5)
        .text(step.title, 128, boxY + 2, { width: 422 });

      // Block Label Tag
      doc
        .fillColor('#64748b')
        .font('Helvetica')
        .fontSize(8)
        .text(`[${step.blockLabel}]`, 128, boxY + 16, { width: 422 });

      doc.y = boxY + 30;

      // Director Prompt / Question Text
      doc
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .text(`Pergunta: "${step.directorPrompt}"`, 55, doc.y, { width: 490, lineGap: 2 });

      doc.moveDown(0.3);

      // Description / Details
      if (step.description) {
        doc
          .fillColor('#475569')
          .font('Helvetica')
          .fontSize(8.5)
          .text(`Orientação / Detalhes: ${step.description}`, 55, doc.y, { width: 490, lineGap: 2 });
      }

      // Small separator line
      doc.moveDown(0.5);
      const lineY = doc.y;
      doc
        .strokeColor('#e2e8f0')
        .lineWidth(0.5)
        .moveTo(55, lineY)
        .lineTo(545, lineY)
        .stroke();

      doc.y = lineY + 6;
    };

    // --- SECTION 1: QUESTÕES GERAIS ---
    drawSectionHeader(
      'PARTE 1: QUESTÕES GERAIS (TRIAGEM, IDENTIFICAÇÃO E DIRETRIZES)',
      'Aplica-se a TODAS as unidades escolares da Rede Municipal (EI, EF e AMBOS)',
      geraisColor
    );

    geraisSteps.forEach((step) => {
      drawStepCard(step, geraisColor);
    });

    // --- SECTION 2: EDUCAÇÃO INFANTIL (EI) ---
    drawSectionHeader(
      'PARTE 2: QUESTÕES DE EDUCAÇÃO INFANTIL (EI)',
      'Aplica-se às unidades com atendimento de Educação Infantil (Creche e Pré-Escola)',
      eiColor
    );

    eiSteps.forEach((step) => {
      drawStepCard(step, eiColor);
    });

    // --- SECTION 3: ENSINO FUNDAMENTAL (EF) ---
    drawSectionHeader(
      'PARTE 3: QUESTÕES DE ENSINO FUNDAMENTAL I (EF)',
      'Aplica-se às unidades com atendimento de Ensino Fundamental I (1º ao 5º ano)',
      efColor
    );

    efSteps.forEach((step) => {
      drawStepCard(step, efColor);
    });

    // --- PAGE NUMBERS & FOOTER ---
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);

      // Don't draw footer on header banner area of page 1 if overlapping
      const footerY = 800;

      doc
        .strokeColor('#cbd5e1')
        .lineWidth(0.5)
        .moveTo(45, footerY - 8)
        .lineTo(545, footerY - 8)
        .stroke();

      doc
        .fillColor('#64748b')
        .font('Helvetica')
        .fontSize(8)
        .text('Secretaria Municipal de Educação de Pindamonhangaba • Plano de Expansão da Educação Integral', 45, footerY, { width: 350 });

      doc
        .fillColor('#64748b')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(`Página ${i + 1} de ${pageCount}`, 400, footerY, { width: 145, align: 'right' });
    }

    doc.end();

    writeStream.on('finish', () => {
      resolve(outputPath);
    });

    writeStream.on('error', (err) => {
      reject(err);
    });
  });
}

const outputPath = path.join(process.cwd(), 'Questionario_Educacao_Integral_Questoes.pdf');

createQuestionnairePdf(outputPath)
  .then((file) => {
    console.log(`[PDF OK] Documento gerado com sucesso em: ${file}`);
  })
  .catch((err) => {
    console.error('[PDF ERRO] Falha ao gerar PDF:', err);
    process.exit(1);
  });
