import fs from 'fs';
import {
  scanStudyMaterials,
  resolvePdfPath,
  CORE_SUBJECTS
} from '../services/studyMaterialService.js';

/**
 * Controller: Get all available study material subjects and summary counts.
 * GET /api/study-materials/subjects
 */
export const getSubjects = async (req, res) => {
  try {
    const scanResult = scanStudyMaterials();

    // Calculate aggregated statistics
    const stats = {
      totalSubjects: scanResult.subjects.length,
      totalPdfs: scanResult.totalPdfs,
      subjectsWithMaterials: scanResult.subjects.filter(s => s.pdfCount > 0).length
    };

    res.json({
      success: true,
      stats,
      subjects: scanResult.subjects,
      allPdfs: scanResult.allPdfs
    });
  } catch (error) {
    console.error('[StudyMaterialController] getSubjects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load study material subjects.',
      details: error.message
    });
  }
};

/**
 * Controller: Get materials and PDFs belonging to a specific subject.
 * GET /api/study-materials/subjects/:subjectId
 */
export const getSubjectMaterials = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const scanResult = scanStudyMaterials();

    const subject = scanResult.subjects.find(
      s => s.id.toLowerCase() === subjectId.toLowerCase() ||
           s.code.toLowerCase() === subjectId.toLowerCase()
    );

    if (!subject) {
      // If it is one of the standard subjects but had 0 files
      const canonical = CORE_SUBJECTS[subjectId.toLowerCase()];
      if (canonical) {
        return res.json({
          success: true,
          subject: {
            ...canonical,
            pdfCount: 0,
            files: []
          }
        });
      }
      return res.status(404).json({
        success: false,
        error: `Subject '${subjectId}' not found.`
      });
    }

    res.json({
      success: true,
      subject
    });
  } catch (error) {
    console.error('[StudyMaterialController] getSubjectMaterials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve subject study materials.',
      details: error.message
    });
  }
};

/**
 * Controller: Get single PDF metadata.
 * GET /api/study-materials/pdf/:fileId/metadata
 */
export const getPdfMetadata = async (req, res) => {
  try {
    const { fileId } = req.params;
    const pdfInfo = resolvePdfPath(fileId);

    res.json({
      success: true,
      pdf: {
        id: pdfInfo.fileId,
        title: pdfInfo.title,
        filename: pdfInfo.filename,
        subjectId: pdfInfo.subjectId,
        subjectName: pdfInfo.subjectName,
        sizeBytes: pdfInfo.sizeBytes,
        formattedSize: pdfInfo.formattedSize,
        lastModified: pdfInfo.lastModified,
        streamUrl: `/api/study-materials/pdf/${fileId}/stream`,
        downloadUrl: `/api/study-materials/pdf/${fileId}/download`
      }
    });
  } catch (error) {
    console.error('[StudyMaterialController] getPdfMetadata error:', error);
    res.status(error.message.includes('Access denied') ? 403 : 404).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Controller: Stream PDF file securely with HTTP Range support.
 * GET /api/study-materials/pdf/:fileId/stream
 */
export const streamPdf = async (req, res) => {
  try {
    const { fileId } = req.params;
    const pdfInfo = resolvePdfPath(fileId);
    const filePath = pdfInfo.absolutePath;
    const fileSize = pdfInfo.sizeBytes;

    // Security & Cache headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(pdfInfo.filename)}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const range = req.headers.range;

    if (range) {
      // Parse Range header, e.g. "bytes=0-1048575" or "bytes=524288-"
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize || start > end) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
        return res.end();
      }

      const chunkSize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'application/pdf'
      });

      fileStream.on('error', (streamErr) => {
        console.error('[StudyMaterialController] Stream error:', streamErr);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });

      fileStream.pipe(res);
    } else {
      // Full document delivery
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'application/pdf',
        'Accept-Ranges': 'bytes'
      });

      const fileStream = fs.createReadStream(filePath);
      fileStream.on('error', (streamErr) => {
        console.error('[StudyMaterialController] Stream error:', streamErr);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });

      fileStream.pipe(res);
    }
  } catch (error) {
    console.error('[StudyMaterialController] streamPdf error:', error);
    const status = error.message.includes('Access denied') ? 403 : 404;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Controller: Download PDF document.
 * GET /api/study-materials/pdf/:fileId/download
 */
export const downloadPdf = async (req, res) => {
  try {
    const { fileId } = req.params;
    const pdfInfo = resolvePdfPath(fileId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(pdfInfo.filename)}"`);
    res.setHeader('Content-Length', pdfInfo.sizeBytes);

    const fileStream = fs.createReadStream(pdfInfo.absolutePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('[StudyMaterialController] downloadPdf error:', error);
    const status = error.message.includes('Access denied') ? 403 : 404;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
};
