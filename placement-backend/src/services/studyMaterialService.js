import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard 6 placement preparation subjects with metadata
export const CORE_SUBJECTS = {
  oops: {
    id: 'oops',
    code: 'OOPS',
    name: 'Object-Oriented Programming (OOPS)',
    shortName: 'OOPS',
    icon: 'Layers',
    accentColor: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    bgGlow: 'rgba(59, 130, 246, 0.15)',
    description: 'Master object-oriented programming concepts, classes, inheritance, polymorphism, encapsulation, abstraction, and design patterns.',
    topics: ['Classes & Objects', 'Inheritance & Polymorphism', 'Encapsulation & Abstraction', 'SOLID Principles & Design Patterns'],
    keywords: ['oops', 'oop', 'object oriented', 'object-oriented', 'java', 'cpp', 'c++']
  },
  dsa: {
    id: 'dsa',
    code: 'DSA',
    name: 'Data Structures & Algorithms (DSA)',
    shortName: 'DSA',
    icon: 'GitBranch',
    accentColor: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
    bgGlow: 'rgba(16, 185, 129, 0.15)',
    description: 'Learn fundamental data structures and problem-solving techniques, arrays, linked lists, trees, graphs, dynamic programming, and recursion.',
    topics: ['Arrays, Stacks & Queues', 'Trees & Binary Search Trees', 'Graph Algorithms & Traversals', 'Dynamic Programming & Recursion'],
    keywords: ['dsa', 'data structures and algorithms', 'data structures & algorithms', 'data structure', 'data structures']
  },
  daa: {
    id: 'daa',
    code: 'DAA',
    name: 'Design & Analysis of Algorithms (DAA)',
    shortName: 'DAA',
    icon: 'Cpu',
    accentColor: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    bgGlow: 'rgba(139, 92, 246, 0.15)',
    description: 'Understand algorithm design techniques, divide and conquer, greedy methods, dynamic programming, and asymptotic complexity analysis.',
    topics: ['Asymptotic Complexity & Master Theorem', 'Divide & Conquer Paradigm', 'Greedy Algorithms & Matroids', 'Backtracking, Branch & Bound'],
    keywords: ['daa', 'design and analysis algorithms', 'design and analysis of algorithms', 'analysis algorithms', 'algorithm design', 'design & analysis']
  },
  coa: {
    id: 'coa',
    code: 'COA',
    name: 'Computer Organization & Architecture (COA)',
    shortName: 'COA',
    icon: 'HardDrive',
    accentColor: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
    bgGlow: 'rgba(245, 158, 11, 0.15)',
    description: 'Explore computer architecture, instruction sets, CPU pipelining, cache memory hierarchies, and hardware organization.',
    topics: ['CPU Architecture & Pipelining', 'Instruction Set Architecture (ISA)', 'Memory Hierarchy & Cache Mapping', 'I/O Organization & Bus Structures'],
    keywords: ['coa', 'computer organization and architecture', 'computer organization', 'computer architecture', 'architecture and organization']
  },
  os: {
    id: 'os',
    code: 'OS',
    name: 'Operating Systems (OS)',
    shortName: 'OS',
    icon: 'Terminal',
    accentColor: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    bgGlow: 'rgba(236, 72, 153, 0.15)',
    description: 'Learn process scheduling, concurrency, deadlocks, memory management, virtual memory, and file systems.',
    topics: ['Process Scheduling & Multi-threading', 'Process Synchronization & Deadlocks', 'Virtual Memory, Paging & Segmentation', 'File System Architecture & Disk Scheduling'],
    keywords: ['operating systems', 'operating system', 'os', 'kernel', 'process scheduling', 'virtual memory']
  },
  dbms: {
    id: 'dbms',
    code: 'DBMS',
    name: 'Database Management Systems (DBMS)',
    shortName: 'DBMS',
    icon: 'Database',
    accentColor: '#06B6D4',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)',
    bgGlow: 'rgba(6, 182, 212, 0.15)',
    description: 'Master database concepts, relational algebra, SQL queries, normalization, ACID properties, and transactions.',
    topics: ['Relational Model & ER Diagrams', 'Advanced SQL Queries & Subqueries', 'Normalization (1NF through BCNF)', 'ACID Transactions & Concurrency Control'],
    keywords: ['dbms', 'database management systems', 'database management', 'database', 'sql', 'rdbms']
  },
  cn: {
    id: 'cn',
    code: 'CN',
    name: 'Computer Networks (CN)',
    shortName: 'CN',
    icon: 'Network',
    accentColor: '#0D9488',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #042F2E 100%)',
    bgGlow: 'rgba(13, 148, 136, 0.15)',
    description: 'Master data communication, OSI and TCP/IP protocol models, routing algorithms, transport protocols (TCP/UDP), IP addressing, subnetting, and network security.',
    topics: ['OSI & TCP/IP Protocol Stacks', 'IP Addressing, Subnetting & CIDR', 'Routing & Flow/Congestion Control', 'Application Layer Protocols (DNS, HTTP, HTTPS)'],
    keywords: ['computer networks', 'computer network', 'networking', 'networks', 'cn', 'tcp/ip', 'osi']
  }
};

/**
 * Locate the actual study material directory on the filesystem dynamically.
 */
export const findStudyMaterialDirectory = () => {
  if (process.env.STUDY_MATERIAL_DIR && fs.existsSync(process.env.STUDY_MATERIAL_DIR)) {
    return path.resolve(process.env.STUDY_MATERIAL_DIR);
  }

  const searchCandidates = [
    path.resolve(__dirname, '../../../StudyMaterial'),
    path.resolve(__dirname, '../../../study material'),
    path.resolve(__dirname, '../../../study-material'),
    path.resolve(process.cwd(), 'StudyMaterial'),
    path.resolve(process.cwd(), 'study material'),
    path.resolve(process.cwd(), 'study-material'),
    path.resolve(process.cwd(), '../StudyMaterial'),
    path.resolve(process.cwd(), '../study material'),
    path.resolve(process.cwd(), '../study-material')
  ];

  for (const candidate of searchCandidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
  }

  // Dynamic fallback: scan parent and current dir for any directory matching /study.*material/i
  const scanDirs = [path.resolve(__dirname, '../../..'), process.cwd(), path.resolve(process.cwd(), '..')];
  for (const base of scanDirs) {
    try {
      if (fs.existsSync(base)) {
        const entries = fs.readdirSync(base, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && /study[\s_-]*material/i.test(entry.name)) {
            const foundPath = path.resolve(base, entry.name);
            return foundPath;
          }
        }
      }
    } catch {
      // Ignore scan errors
    }
  }

  // Default to path in root
  return path.resolve(__dirname, '../../../StudyMaterial');
};

/**
 * Format bytes into human readable format.
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Clean up filename into a readable document title.
 */
export const formatTitleFromFilename = (filename) => {
  const withoutExt = filename.replace(/\.pdf$/i, '').trim();
  // Capitalize words nicely if all uppercase or all lowercase
  const words = withoutExt.split(/[\s_.-]+/);
  return words.map(w => {
    if (w.toUpperCase() === 'OOPS' || w.toUpperCase() === 'DSA' || w.toUpperCase() === 'DAA' ||
        w.toUpperCase() === 'COA' || w.toUpperCase() === 'OS' || w.toUpperCase() === 'DBMS' ||
        w.toUpperCase() === 'CN' || w.toUpperCase() === 'SQL' || w.toUpperCase() === 'CPU' || w.toUpperCase() === 'RAM') {
      return w.toUpperCase();
    }
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');
};

/**
 * Generate a descriptive summary based on the subject and file.
 */
export const generateFileDescription = (title, subjectId) => {
  const subject = CORE_SUBJECTS[subjectId];
  if (subject) {
    return `Comprehensive placement preparation guide and verified lecture notes covering core ${subject.shortName} topics, high-frequency interview questions, and foundational concepts.`;
  }
  return `Comprehensive academic and interview study material for ${title}.`;
};

/**
 * Match a file or subfolder to a canonical subject.
 */
export const matchSubject = (filenameOrFolder, subfolderName = '') => {
  const normalizedFolder = (subfolderName || '').toLowerCase().trim();
  const normalizedFile = filenameOrFolder.toLowerCase().trim();

  // 1. Direct folder match
  for (const [key, subject] of Object.entries(CORE_SUBJECTS)) {
    if (normalizedFolder === key || normalizedFolder === subject.code.toLowerCase()) {
      return key;
    }
    for (const kw of subject.keywords) {
      if (normalizedFolder.includes(kw)) {
        return key;
      }
    }
  }

  // 2. Specific precedence in filename to avoid conflicts (e.g. DAA vs DSA vs Algorithm)
  // Check COA first
  if (normalizedFile.includes('computer organization') || normalizedFile.includes('coa') || (normalizedFile.includes('organization') && normalizedFile.includes('architecture'))) {
    return 'coa';
  }
  // Check CN (Computer Networks)
  if (normalizedFile.includes('computer network') || normalizedFile.includes('computer networks') || normalizedFile.includes('networking') || /(^|[\s_-])cn([\s_.-]|$)/i.test(normalizedFile)) {
    return 'cn';
  }
  // Check DAA before DSA because "algorithms" might appear in both
  if (normalizedFile.includes('design and analysis') || normalizedFile.includes('daa') || normalizedFile.includes('analysis algorithms') || normalizedFile.includes('analysis of algorithm')) {
    return 'daa';
  }
  // Check DSA
  if (normalizedFile.includes('dsa') || normalizedFile.includes('data structure') || normalizedFile.includes('data structures')) {
    return 'dsa';
  }
  // Check DBMS
  if (normalizedFile.includes('dbms') || normalizedFile.includes('database')) {
    return 'dbms';
  }
  // Check OOPS
  if (normalizedFile.includes('object oriented') || normalizedFile.includes('oops') || normalizedFile.includes('oop')) {
    return 'oops';
  }
  // Check OS
  if (normalizedFile.includes('operating system') || normalizedFile.includes('operating systems') || /(^|[\s_-])os([\s_.-]|$)/i.test(normalizedFile)) {
    return 'os';
  }

  // Fallback match by keywords
  for (const [key, subject] of Object.entries(CORE_SUBJECTS)) {
    for (const kw of subject.keywords) {
      if (normalizedFile.includes(kw)) {
        return key;
      }
    }
  }

  return 'other';
};

/**
 * Create a stable, URL-safe identifier for a relative file path.
 */
export const createFileId = (relativePath) => {
  return Buffer.from(relativePath, 'utf8')
    .toString('base64url')
    .replace(/=+$/, '');
};

/**
 * Decode file ID back to relative path.
 */
export const decodeFileId = (fileId) => {
  try {
    return Buffer.from(fileId, 'base64url').toString('utf8');
  } catch {
    return null;
  }
};

/**
 * Scan the study material directory and organize all PDFs dynamically by subject.
 */
export const scanStudyMaterials = () => {
  const rootDir = findStudyMaterialDirectory();

  if (!fs.existsSync(rootDir)) {
    console.warn(`[StudyMaterialService] Directory not found at: ${rootDir}`);
    return {
      rootDir,
      exists: false,
      subjects: Object.values(CORE_SUBJECTS).map(s => ({ ...s, pdfCount: 0, files: [] })),
      allPdfs: []
    };
  }

  const allPdfs = [];
  const subjectBuckets = {};

  // Initialize buckets for all 6 core subjects
  for (const [key, meta] of Object.entries(CORE_SUBJECTS)) {
    subjectBuckets[key] = {
      ...meta,
      pdfCount: 0,
      files: []
    };
  }

  // Recursive scan helper
  const scanDirectory = (currentDir, relPath = '') => {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const currentRelPath = relPath ? `${relPath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          scanDirectory(fullPath, currentRelPath);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
          try {
            const stat = fs.statSync(fullPath);
            const parentDirName = relPath ? path.basename(relPath) : '';
            const subjectId = matchSubject(entry.name, parentDirName);
            const fileId = createFileId(currentRelPath);
            const title = formatTitleFromFilename(entry.name);
            const description = generateFileDescription(title, subjectId);

            const pdfInfo = {
              id: fileId,
              filename: entry.name,
              relativePath: currentRelPath,
              title,
              subjectId,
              subjectName: CORE_SUBJECTS[subjectId]?.name || 'Placement Preparation Notes',
              sizeBytes: stat.size,
              formattedSize: formatBytes(stat.size),
              lastModified: stat.mtime,
              description,
              streamUrl: `/api/study-materials/pdf/${fileId}/stream`,
              downloadUrl: `/api/study-materials/pdf/${fileId}/download`,
              metadataUrl: `/api/study-materials/pdf/${fileId}/metadata`
            };

            allPdfs.push(pdfInfo);

            if (subjectBuckets[subjectId]) {
              subjectBuckets[subjectId].files.push(pdfInfo);
              subjectBuckets[subjectId].pdfCount += 1;
            } else {
              // Custom dynamic subject for other categories
              const customId = subjectId;
              if (!subjectBuckets[customId]) {
                subjectBuckets[customId] = {
                  id: customId,
                  code: customId.toUpperCase(),
                  name: customId.toUpperCase(),
                  shortName: customId.toUpperCase(),
                  icon: 'BookOpen',
                  accentColor: '#6366F1',
                  gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
                  bgGlow: 'rgba(99, 102, 241, 0.15)',
                  description: `Placement study material for ${customId.toUpperCase()}.`,
                  topics: ['Core Concepts', 'Placement Notes', 'Interview Q&A'],
                  pdfCount: 0,
                  files: []
                };
              }
              subjectBuckets[customId].files.push(pdfInfo);
              subjectBuckets[customId].pdfCount += 1;
            }
          } catch (fileErr) {
            console.error(`[StudyMaterialService] Error reading file ${fullPath}:`, fileErr.message);
          }
        }
      }
    } catch (dirErr) {
      console.error(`[StudyMaterialService] Error scanning directory ${currentDir}:`, dirErr.message);
    }
  };

  scanDirectory(rootDir);

  const subjectsList = Object.values(subjectBuckets);

  return {
    rootDir,
    exists: true,
    totalPdfs: allPdfs.length,
    subjects: subjectsList,
    allPdfs
  };
};

/**
 * Resolve and validate a PDF file path securely.
 * Throws an error if outside the root directory or invalid.
 */
export const resolvePdfPath = (fileId) => {
  const rootDir = findStudyMaterialDirectory();
  const relPath = decodeFileId(fileId);

  if (!relPath) {
    throw new Error('Invalid file ID specified.');
  }

  // Prevent directory traversal attacks
  const safeRelPath = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, '');
  const absolutePath = path.resolve(rootDir, safeRelPath);

  // Must strictly reside inside the root directory
  if (!absolutePath.startsWith(path.resolve(rootDir))) {
    throw new Error('Access denied: Unauthorized directory access attempt.');
  }

  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    throw new Error('Requested PDF document was not found on the server.');
  }

  if (!absolutePath.toLowerCase().endsWith('.pdf')) {
    throw new Error('Only PDF documents can be accessed.');
  }

  const stat = fs.statSync(absolutePath);
  const filename = path.basename(absolutePath);
  const parentDir = path.dirname(safeRelPath) !== '.' ? path.basename(path.dirname(safeRelPath)) : '';
  const subjectId = matchSubject(filename, parentDir);
  const title = formatTitleFromFilename(filename);

  return {
    absolutePath,
    filename,
    relativePath: safeRelPath,
    fileId,
    title,
    subjectId,
    subjectName: CORE_SUBJECTS[subjectId]?.name || 'Placement Preparation Notes',
    sizeBytes: stat.size,
    formattedSize: formatBytes(stat.size),
    lastModified: stat.mtime
  };
};
