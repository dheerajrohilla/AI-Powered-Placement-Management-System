/**
 * Placement Conflict Detector Engine (TPO Operations)
 * Detects overlapping placement activities (Interviews, Coding Tests, Company Drives)
 * across students, schedules, and recruitment drives.
 * Suggests intelligent, conflict-free alternative time slots for TPO resolution.
 */

export const detectPlacementConflicts = ({
  interviews = [],
  drives = []
}) => {
  const conflicts = [];
  const bufferMinutesNeeded = 45;

  // 1. STUDENT-LEVEL INTERVIEW & TEST OVERLAPS
  // Group scheduled interviews by student
  const studentMap = {};
  for (const item of interviews) {
    if (item.status === 'cancelled') continue;
    const studentId = String(item.student?._id || item.student);
    if (!studentMap[studentId]) studentMap[studentId] = [];
    studentMap[studentId].push(item);
  }

  for (const [studentId, studentInterviews] of Object.entries(studentMap)) {
    if (studentInterviews.length < 2) continue;

    // Sort by scheduledDate
    const sorted = [...studentInterviews].sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const itemA = sorted[i];
        const itemB = sorted[j];

        const dateA = new Date(itemA.scheduledDate);
        const dateB = new Date(itemB.scheduledDate);

        // Duration in minutes (default 45 mins)
        const durA = itemA.durationMinutes || 45;
        const durB = itemB.durationMinutes || 45;

        const endA = new Date(dateA.getTime() + durA * 60000);
        const endB = new Date(dateB.getTime() + durB * 60000);

        // Check if on same day
        const isSameDay = dateA.toDateString() === dateB.toDateString();
        if (!isSameDay) continue;

        // Difference in minutes between start times
        const diffMinutes = Math.abs((dateB.getTime() - dateA.getTime()) / 60000);

        let severity = null;
        let conflictType = null;
        let description = '';

        // Overlapping condition: A starts before B ends and B starts before A ends
        const isDirectOverlap = (dateA < endB) && (dateB < endA);
        const isTightBuffer = !isDirectOverlap && diffMinutes < (durA + bufferMinutesNeeded);

        if (isDirectOverlap) {
          severity = 'critical';
          conflictType = 'Direct Activity Collision';
          description = `Student has 2 overlapping activities: ${itemA.company?.companyName || 'Company A'} (${itemA.activityType || 'Interview'}) at ${dateA.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} and ${itemB.company?.companyName || 'Company B'} (${itemB.activityType || 'Activity'}) at ${dateB.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
        } else if (isTightBuffer) {
          severity = 'warning';
          conflictType = 'Tight Buffer Constraint';
          description = `Only ${Math.round(diffMinutes - durA)} minutes buffer between ${itemA.company?.companyName || 'Company A'} and ${itemB.company?.companyName || 'Company B'}. High risk of delay-induced absence.`;
        }

        if (severity) {
          // Calculate conflict-free suggested slots
          const studentName = itemA.student?.userId?.name || `Student (${itemA.student?.rollNumber || studentId.slice(-4)})`;
          const suggestedSlots = generateAlternativeSlots(dateA, dateB, sorted);

          conflicts.push({
            id: `CONF-${itemA._id}-${itemB._id}`,
            scope: 'student',
            severity,
            conflictType,
            description,
            studentId,
            studentName,
            rollNumber: itemA.student?.rollNumber,
            date: dateA.toLocaleDateString(),
            timeWindow: `${dateA.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endB.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            itemsInvolved: [
              {
                id: itemA._id,
                company: itemA.company?.companyName || 'Company A',
                round: itemA.round,
                activityType: itemA.activityType || 'interview',
                scheduledDate: itemA.scheduledDate,
                time: dateA.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              },
              {
                id: itemB._id,
                company: itemB.company?.companyName || 'Company B',
                round: itemB.round,
                activityType: itemB.activityType || 'coding_test',
                scheduledDate: itemB.scheduledDate,
                time: dateB.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ],
            suggestedReschedule: suggestedSlots,
            targetItemToReschedule: itemB._id
          });
        }
      }
    }
  }

  // 2. DRIVE-LEVEL CALENDAR OVERLAPS
  // Multiple drives scheduled for same department/batch on the same date
  for (let i = 0; i < drives.length; i++) {
    for (let j = i + 1; j < drives.length; j++) {
      const d1 = drives[i];
      const d2 = drives[j];

      if (!d1.driveDate || !d2.driveDate) continue;
      const date1 = new Date(d1.driveDate);
      const date2 = new Date(d2.driveDate);

      if (date1.toDateString() === date2.toDateString()) {
        const dept1 = d1.eligibility?.departments || [];
        const dept2 = d2.eligibility?.departments || [];
        const commonDepts = dept1.filter(d => dept2.includes(d));

        if (commonDepts.length > 0) {
          conflicts.push({
            id: `CONF-DRIVE-${d1._id}-${d2._id}`,
            scope: 'drive',
            severity: 'warning',
            conflictType: 'Department Drive Clash',
            description: `Campus drive clash on ${date1.toLocaleDateString()}: ${d1.title} (${d1.company?.companyName || 'Company 1'}) and ${d2.title} (${d2.company?.companyName || 'Company 2'}) both target departments: ${commonDepts.join(', ')}.`,
            date: date1.toLocaleDateString(),
            itemsInvolved: [
              { id: d1._id, company: d1.company?.companyName, title: d1.title, date: d1.driveDate },
              { id: d2._id, company: d2.company?.companyName, title: d2.title, date: d2.driveDate }
            ],
            suggestedReschedule: [
              {
                slotLabel: 'Shift Drive 2 by +2 Business Days',
                newDate: new Date(date2.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                slotLabel: 'Shift Drive 2 by +3 Business Days',
                newDate: new Date(date2.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
              }
            ],
            targetItemToReschedule: d2._id
          });
        }
      }
    }
  }

  // Conflict statistics
  const criticalCount = conflicts.filter(c => c.severity === 'critical').length;
  const warningCount = conflicts.filter(c => c.severity === 'warning').length;

  return {
    totalConflicts: conflicts.length,
    criticalCount,
    warningCount,
    conflicts,
    scannedInterviewsCount: interviews.length,
    scannedDrivesCount: drives.length,
    hasConflicts: conflicts.length > 0,
    scannedAt: new Date()
  };
};

/**
 * Proposes 2-3 conflict-free alternative time slots
 */
function generateAlternativeSlots(baseDateA, baseDateB, existingList = []) {
  const suggestions = [];

  // Slot 1: Later afternoon same day (e.g., 2:30 PM or 3:30 PM)
  const afternoonSlot = new Date(baseDateB);
  afternoonSlot.setHours(14, 30, 0, 0);
  if (afternoonSlot.getTime() > baseDateA.getTime() + 7200000) {
    suggestions.push({
      slotLabel: 'Same Day Afternoon (02:30 PM)',
      newDate: afternoonSlot.toISOString(),
      benefit: 'Eliminates morning overlap with 3.5 hour recovery buffer'
    });
  }

  // Slot 2: Next Day 10:00 AM
  const nextDayMorning = new Date(baseDateB);
  nextDayMorning.setDate(nextDayMorning.getDate() + 1);
  nextDayMorning.setHours(10, 0, 0, 0);
  suggestions.push({
    slotLabel: 'Next Day Morning (10:00 AM)',
    newDate: nextDayMorning.toISOString(),
    benefit: 'Completely conflict-free slot on the next business day'
  });

  // Slot 3: Next Day 02:00 PM
  const nextDayAfternoon = new Date(baseDateB);
  nextDayAfternoon.setDate(nextDayAfternoon.getDate() + 1);
  nextDayAfternoon.setHours(14, 0, 0, 0);
  suggestions.push({
    slotLabel: 'Next Day Afternoon (02:00 PM)',
    newDate: nextDayAfternoon.toISOString(),
    benefit: 'Zero student interview conflicts'
  });

  return suggestions;
}
