
import type { MedicalRecordEntry, Patient } from '../types';

export const formatNoteForShare = (entry: MedicalRecordEntry, patient: Patient, titleOverride?: string): string => {
  const { timestamp, authorName, content, type } = entry;

  const formattedDate = new Date(timestamp).toLocaleString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const title = titleOverride || type;

  return `
Clinical Note for: ${patient.name}
Date: ${formattedDate}
Type: ${title}
Author: ${authorName}
---
${content.trim()}
---
  `.trim();
};
