/**
 * Email Validation and University Domain Utilities
 */

// List of recognized Australian university email domains
const UNIVERSITY_DOMAINS = [
  // Major Australian Universities
  'unsw.edu.au',
  'student.unsw.edu.au',
  'ad.unsw.edu.au',
  'sydney.edu.au',
  'student.sydney.edu.au',
  'unimelb.edu.au',
  'student.unimelb.edu.au',
  'uq.edu.au',
  'student.uq.edu.au',
  'uwa.edu.au',
  'student.uwa.edu.au',
  'adelaide.edu.au',
  'student.adelaide.edu.au',
  'monash.edu',
  'student.monash.edu',
  'anu.edu.au',
  'uts.edu.au',
  'student.uts.edu.au',
  'qut.edu.au',
  'student.qut.edu.au',
  'rmit.edu.au',
  'student.rmit.edu.au',
  'deakin.edu.au',
  'griffith.edu.au',
  'student.griffith.edu.au',
  'curtin.edu.au',
  'student.curtin.edu.au',
  'uc.edu.au',
  'canberra.edu.au',
  'westernsydney.edu.au',
  'newcastle.edu.au',
  'uon.edu.au',
  'uow.edu.au',
  'mq.edu.au',
  'students.mq.edu.au',
  'latrobe.edu.au',
  'swinburne.edu.au',
  'jcu.edu.au',
  'flinders.edu.au',
  'unisa.edu.au',
  'usq.edu.au',
  'csu.edu.au',
  'une.edu.au',
  'murdoch.edu.au',
  'ecu.edu.au',
  'usc.edu.au',
  'acu.edu.au',
  'bond.edu.au',
  'nd.edu.au',
  'federation.edu.au',
  'cqu.edu.au',
  'vuwex.vic.edu.au',
];

/**
 * Validate if email is from a recognized university domain
 */
export function isUniversityEmail(email: string): boolean {
  const emailLower = email.toLowerCase();

  // Check if email matches any recognized university domain
  return UNIVERSITY_DOMAINS.some((domain) => emailLower.endsWith(`@${domain}`));
}

/**
 * Extract university name from email domain
 */
export function getUniversityFromEmail(email: string): string | null {
  const emailLower = email.toLowerCase();
  const domain = emailLower.split('@')[1];

  if (!domain) return null;

  // Map domains to university names
  const universityMap: Record<string, string> = {
    'unsw.edu.au': 'University of New South Wales (UNSW)',
    'student.unsw.edu.au': 'University of New South Wales (UNSW)',
    'ad.unsw.edu.au': 'University of New South Wales (UNSW)',
    'sydney.edu.au': 'University of Sydney',
    'student.sydney.edu.au': 'University of Sydney',
    'unimelb.edu.au': 'University of Melbourne',
    'student.unimelb.edu.au': 'University of Melbourne',
    'uq.edu.au': 'University of Queensland',
    'student.uq.edu.au': 'University of Queensland',
    'uwa.edu.au': 'University of Western Australia',
    'student.uwa.edu.au': 'University of Western Australia',
    'adelaide.edu.au': 'University of Adelaide',
    'student.adelaide.edu.au': 'University of Adelaide',
    'monash.edu': 'Monash University',
    'student.monash.edu': 'Monash University',
    'anu.edu.au': 'Australian National University',
    'uts.edu.au': 'University of Technology Sydney',
    'student.uts.edu.au': 'University of Technology Sydney',
    'qut.edu.au': 'Queensland University of Technology',
    'student.qut.edu.au': 'Queensland University of Technology',
    'rmit.edu.au': 'RMIT University',
    'student.rmit.edu.au': 'RMIT University',
    'deakin.edu.au': 'Deakin University',
    'griffith.edu.au': 'Griffith University',
    'student.griffith.edu.au': 'Griffith University',
    'curtin.edu.au': 'Curtin University',
    'student.curtin.edu.au': 'Curtin University',
    'mq.edu.au': 'Macquarie University',
    'students.mq.edu.au': 'Macquarie University',
  };

  return universityMap[domain] || null;
}

/**
 * Validate email format
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Comprehensive email validation
 */
export function validateEmail(email: string): {
  valid: boolean;
  isUniversity: boolean;
  university: string | null;
  errors: string[];
} {
  const errors: string[] = [];

  if (!isValidEmailFormat(email)) {
    errors.push('Invalid email format');
  }

  const isUniversity = isUniversityEmail(email);
  const university = getUniversityFromEmail(email);

  if (!isUniversity) {
    errors.push('Email must be from a recognized university domain (.edu.au)');
  }

  return {
    valid: errors.length === 0,
    isUniversity,
    university,
    errors,
  };
}
