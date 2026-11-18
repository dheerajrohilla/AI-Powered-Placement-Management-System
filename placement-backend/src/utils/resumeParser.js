import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';

/**
 * Validates buffer format against magic bytes
 * @param {Buffer} buffer
 * @returns {'pdf' | 'docx' | 'text' | 'unknown'}
 */
export const detectFileFormat = (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 4) {
    return 'unknown';
  }

  // PDF magic bytes: %PDF (0x25, 0x50, 0x44, 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'pdf';
  }

  // DOCX (ZIP archive) magic bytes: PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
  if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return 'docx';
  }

  return 'unknown';
};

/**
 * Extract text from a PDF buffer or file path
 * @param {Buffer|string} input - PDF buffer or path to PDF file
 * @returns {Promise<string>} Extracted normalized text
 */
export const extractTextFromPDF = async (input) => {
  try {
    let dataBuffer;
    if (typeof input === 'string') {
      if (!fs.existsSync(input)) {
        throw new Error(`File not found at path: ${input}`);
      }
      dataBuffer = fs.readFileSync(input);
    } else if (Buffer.isBuffer(input)) {
      dataBuffer = input;
    } else {
      throw new Error('Invalid input for PDF extraction');
    }

    if (dataBuffer.length === 0) {
      throw new Error('Resume file is empty (0 bytes)');
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

    return cleanResumeText(text);
  } catch (error) {
    console.error('Error extracting text from PDF:', error.message);
    throw new Error(`Failed to parse PDF resume: ${error.message}`);
  }
};

/**
 * Extract text from a DOCX buffer or file path
 * @param {Buffer|string} input - DOCX buffer or path to DOCX file
 * @returns {Promise<string>} Extracted normalized text
 */
export const extractTextFromDOCX = async (input) => {
  try {
    let dataBuffer;
    if (typeof input === 'string') {
      if (!fs.existsSync(input)) {
        throw new Error(`File not found at path: ${input}`);
      }
      dataBuffer = fs.readFileSync(input);
    } else if (Buffer.isBuffer(input)) {
      dataBuffer = input;
    } else {
      throw new Error('Invalid input for DOCX extraction');
    }

    if (dataBuffer.length === 0) {
      throw new Error('Resume file is empty (0 bytes)');
    }

    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    const text = result?.value || '';

    return cleanResumeText(text);
  } catch (error) {
    console.error('Error extracting text from DOCX:', error.message);
    throw new Error(`Failed to parse DOCX resume: ${error.message}`);
  }
};

/**
 * Universal resume text extraction supporting PDF, DOCX, and text
 * Validates magic bytes and rejects corrupted/spoofed files
 * @param {Buffer|string} input - Buffer or file path
 * @param {string} [originalName] - Optional original file name to aid detection
 * @returns {Promise<string>}
 */
export const extractTextFromResume = async (input, originalName = '') => {
  let dataBuffer;
  if (typeof input === 'string') {
    if (!fs.existsSync(input)) {
      throw new Error(`Resume file not found at: ${input}`);
    }
    dataBuffer = fs.readFileSync(input);
  } else if (Buffer.isBuffer(input)) {
    dataBuffer = input;
  } else {
    throw new Error('Invalid resume input: expected Buffer or file path');
  }

  if (!dataBuffer || dataBuffer.length === 0) {
    throw new Error('Uploaded resume is empty (0 bytes)');
  }

  const detectedFormat = detectFileFormat(dataBuffer);
  const ext = (originalName || (typeof input === 'string' ? input : '')).toLowerCase();

  if (detectedFormat === 'pdf' || ext.endsWith('.pdf')) {
    return extractTextFromPDF(dataBuffer);
  } else if (detectedFormat === 'docx' || ext.endsWith('.docx') || ext.endsWith('.doc')) {
    return extractTextFromDOCX(dataBuffer);
  } else {
    // Attempt fallback text extraction if ASCII/UTF-8
    const sample = dataBuffer.slice(0, 100).toString('utf8');
    const isPrintable = /^[\x20-\x7E\s]*$/.test(sample);
    if (isPrintable) {
      return cleanResumeText(dataBuffer.toString('utf8'));
    }
    throw new Error('Unsupported or corrupted resume format. Please upload a valid PDF or DOCX file.');
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

