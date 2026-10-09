import { PDFParse } from 'pdf-parse';
import fs from 'fs';

/**
 * Extract text from a PDF buffer or file path
 * @param {Buffer|string} input - PDF buffer or path to PDF file
 * @returns {Promise<string>} Extracted normalized text
 */
export const extractTextFromPDF = async (input) => {
  try {
    let dataBuffer;
    if (typeof input === 'string') {
      dataBuffer = fs.readFileSync(input);
    } else if (Buffer.isBuffer(input)) {
      dataBuffer = input;
    } else {
      throw new Error('Invalid input for PDF extraction');
    }

    const parser = new PDFParse({ data: dataBuffer });
    await parser.load();
    const parsed = await parser.getText();

    let text = '';
    if (parsed && typeof parsed === 'object' && typeof parsed.text === 'string') {
      text = parsed.text;
    } else if (typeof parsed === 'string') {
      text = parsed;
    }

    // Clean and normalize text
    return cleanResumeText(text);
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to parse PDF resume: ${error.message}`);
  }
};

/**
 * Normalizes text extracted from resumes
 */
export const cleanResumeText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '';

  return rawText
    // Normalize unicode bullets and dashes
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\uF0B7]/g, '\n• ')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    // Normalize newlines
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    // Normalize horizontal whitespace
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
};
