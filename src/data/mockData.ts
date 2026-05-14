/**
 * Synthetic Mock Data for Compliance Metrics Dashboard
 * 80 Risks, 120 Controls, 60 Findings
 */

export type SeveritySubset = 'Critical' | 'High' | 'Medium' | 'Low';
export type ControlStatus = 'Pass' | 'Fail' | 'In-Progress';
export type FindingStatus = 'Open' | 'Overdue' | 'Closed';
export type Framework = 'NIST CSF 2.0' | 'SOC 2' | 'ISO 27001';

export interface Risk {
  id: string;
  title: string;
  severity: SeveritySubset;
  impact: number; // 1-5
  likelihood: number; // 1-5
  frameworks: Framework[];
}

export interface Control {
  id: string;
  title: string;
  status: ControlStatus;
  framework: Framework;
}

export interface Finding {
  id: string;
  title: string;
  status: FindingStatus;
  severity: SeveritySubset;
  date: string; // ISO date
  framework: Framework;
}

export interface Vendor {
  id: string;
  name: string;
  riskTier: SeveritySubset;
}

const SEVERITIES: SeveritySubset[] = ['Critical', 'High', 'Medium', 'Low'];
const FRAMEWORKS: Framework[] = ['NIST CSF 2.0', 'SOC 2', 'ISO 27001'];
const CONTROL_STATUSES: ControlStatus[] = ['Pass', 'Fail', 'In-Progress'];
const FINDING_STATUSES: FindingStatus[] = ['Open', 'Overdue', 'Closed'];

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * CSV Injection Sanitization
 * Replaces leading characters that could trigger Excel/CSV formula execution
 */
const sanitizeString = (str: string): string => {
  return str.replace(/^[=+\-@]/, '');
};

// Generate 80 Risks
export const risks: Risk[] = Array.from({ length: 80 }, (_, i) => ({
  id: sanitizeString(`RSK-${1000 + i}`),
  title: sanitizeString(`Risk related to ${getRandom(['Data Privacy', 'Network Security', 'Access Control', 'Endpoint Protection', 'Cloud Infrastructure', 'Third-party Supply Chain'])}`),
  severity: getRandom(SEVERITIES),
  impact: Math.floor(Math.random() * 5) + 1,
  likelihood: Math.floor(Math.random() * 5) + 1,
  frameworks: [getRandom(FRAMEWORKS)],
}));

// Generate 120 Controls
export const controls: Control[] = Array.from({ length: 120 }, (_, i) => ({
  id: sanitizeString(`CTRL-${2000 + i}`),
  title: sanitizeString(`Security Control ${2000 + i}: ${getRandom(['Encryption at Rest', 'MFA Enforcement', 'Log Monitoring', 'Vulnerability Scanning', 'Incident Response Plan', 'Employee Training'])}`),
  status: Math.random() > 0.7 ? getRandom(['Fail', 'In-Progress']) : 'Pass',
  framework: getRandom(FRAMEWORKS),
}));

// Generate 60 Findings
export const findings: Finding[] = Array.from({ length: 60 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - Math.floor(Math.random() * 12));
  return {
    id: sanitizeString(`FND-${3000 + i}`),
    title: sanitizeString(`Compliance Finding ${3000 + i}: ${getRandom(['Unpatched Server', 'Excessive Permissions', 'Missing Backup', 'Expired Certificate', 'Inactive User Account'])}`),
    status: getRandom(FINDING_STATUSES),
    severity: getRandom(SEVERITIES),
    date: date.toISOString(),
    framework: getRandom(FRAMEWORKS),
  };
});

// Generate 25 Vendors
export const vendors: Vendor[] = Array.from({ length: 25 }, (_, i) => ({
  id: sanitizeString(`VND-${4000 + i}`),
  name: sanitizeString(`Vendor ${String.fromCharCode(65 + (i % 26))}${i > 25 ? i : ''} Analytics`),
  riskTier: getRandom(SEVERITIES),
}));

// Trend data for Line Chart
export const findingsTrend = Array.from({ length: 12 }, (_, i) => {
  const month = new Date();
  month.setMonth(month.getMonth() - (11 - i));
  return {
    name: month.toLocaleString('default', { month: 'short' }),
    count: Math.floor(Math.random() * 15) + 5,
  };
});
