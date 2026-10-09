/**
 * Skill-Based Student Collaboration Engine
 * Discovers complementary study partners by matching complementary skill strengths & gaps.
 * Example: Student A (Strong in React, weak in DSA) is matched with Student B (Strong in DSA, weak in React).
 */

export const findStudyPartnerMatches = ({ currentStudent = {}, allStudents = [], existingRequests = [] }) => {
  const currentSkills = (currentStudent.skills || []).map(s => s.toLowerCase());
  const currentProjects = currentStudent.projects || [];
  const currentId = String(currentStudent._id);

  // Categorize current student skills
  const isCurrentDsaStrong = currentSkills.includes('dsa') || currentSkills.includes('c++') || (currentStudent.peerMetrics?.dsaScore || 65) >= 75;
  const isCurrentReactStrong = currentSkills.some(s => s.includes('react') || s.includes('frontend') || s.includes('javascript'));
  const isCurrentJavaStrong = currentSkills.some(s => s.includes('java') || s.includes('spring'));
  const isCurrentPythonStrong = currentSkills.some(s => s.includes('python') || s.includes('data'));

  const matches = [];

  for (const peer of allStudents) {
    const peerId = String(peer._id);
    if (peerId === currentId) continue;

    const peerSkills = (peer.skills || []).map(s => s.toLowerCase());
    const peerUser = peer.userId || {};

    // Determine complementary strengths
    // What does peer offer that current student might need?
    const peerGives = [];
    const currentGives = [];

    // Tech pairs: DSA vs Web/React
    if (!isCurrentDsaStrong && (peerSkills.includes('dsa') || (peer.peerMetrics?.dsaScore || 0) >= 75 || peerSkills.includes('java'))) {
      peerGives.push('DSA & Problem Solving');
    }
    if (isCurrentReactStrong && !peerSkills.some(s => s.includes('react'))) {
      currentGives.push('React & Modern Frontend');
    }

    // Tech pairs: Backend/Spring vs Frontend
    if (peerSkills.some(s => s.includes('spring') || s.includes('system design')) && !currentSkills.some(s => s.includes('spring'))) {
      peerGives.push('Spring Boot & APIs');
    }
    if (currentSkills.some(s => s.includes('python') || s.includes('data')) && !peerSkills.some(s => s.includes('python'))) {
      currentGives.push('Python & Data Analytics');
    }

    // Tech pairs: SQL & Database Optimization
    if (peerSkills.some(s => s.includes('sql') || s.includes('database')) && !currentSkills.some(s => s.includes('sql'))) {
      peerGives.push('SQL & Databases');
    }

    // Compute compatibility score
    let compatibilityScore = 60;
    if (peerGives.length > 0 && currentGives.length > 0) {
      compatibilityScore = 92;
    } else if (peerGives.length > 0 || currentGives.length > 0) {
      compatibilityScore = 80;
    } else {
      compatibilityScore = 70;
    }

    // Check if collaboration request already exists
    const request = existingRequests.find(r =>
      (String(r.sender) === currentId && String(r.receiver) === peerId) ||
      (String(r.sender) === peerId && String(r.receiver) === currentId)
    );

    const complementaryFocus = peerGives.length > 0 && currentGives.length > 0
      ? `${peerGives[0]} ⇄ ${currentGives[0]}`
      : `${peerGives[0] || 'System Architecture'} & ${currentGives[0] || 'Web Engineering'}`;

    matches.push({
      peerId: peer._id,
      name: peerUser.name || `Student ${peer.rollNumber?.slice(-3) || 'Peer'}`,
      rollNumber: peer.rollNumber,
      department: peer.department,
      batch: peer.batch,
      cgpa: peer.cgpa,
      targetRole: peer.targetRole || 'Software Engineer',
      skills: peer.skills || [],
      peerMetrics: peer.peerMetrics || {
        dsaScore: Math.floor(Math.random() * 20 + 75),
        projectScore: Math.floor(Math.random() * 20 + 70)
      },
      compatibilityScore,
      complementaryFocus,
      youLearn: peerGives.length > 0 ? peerGives : ['Backend Systems & DSA'],
      youTeach: currentGives.length > 0 ? currentGives : ['Fullstack Web & Project Architecture'],
      suggestedTopics: [
        'Weekly LeetCode pair problem-solving (Medium)',
        'Full-stack system architecture walkthrough',
        'Cross-mock technical interviews before placement drives'
      ],
      connectionStatus: request ? request.status : 'not_connected',
      requestId: request?._id || null,
      isSender: request ? String(request.sender) === currentId : false
    });
  }

  // Sort by highest compatibility
  matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return matches;
};
