import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { COMMITMENT_LEVELS, CommitmentLevel } from '@/types/enums';

// Register fonts (using default fonts for now)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 5,
  },
  companyAddress: {
    fontSize: 10,
    color: '#666666',
  },
  date: {
    marginTop: 20,
    marginBottom: 30,
  },
  recipient: {
    marginBottom: 20,
  },
  salutation: {
    marginBottom: 15,
  },
  paragraph: {
    marginBottom: 12,
    textAlign: 'justify',
  },
  sectionTitle: {
    fontWeight: 700,
    marginTop: 15,
    marginBottom: 8,
  },
  listItem: {
    marginLeft: 15,
    marginBottom: 5,
  },
  closing: {
    marginTop: 30,
    marginBottom: 40,
  },
  signature: {
    marginTop: 10,
  },
  signatoryName: {
    fontWeight: 700,
  },
  signatoryTitle: {
    color: '#666666',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    color: '#999999',
    fontSize: 8,
    borderTop: '1 solid #EEEEEE',
    paddingTop: 10,
  },
  bold: {
    fontWeight: 700,
  },
});

interface InterestLetterData {
  // Company Info
  companyName: string;
  legalName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  companyDescription?: string;

  // Signatory Info
  signatoryName: string;
  signatoryTitle?: string;
  signatoryEmail?: string;
  signatoryPhone?: string;

  // Letter Details
  talentName: string;
  candidateId: string;
  commitmentLevel: CommitmentLevel;
  jobTitle: string;
  department?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: string;
  engagementType?: string;
  startTiming?: string;
  durationYears?: number;
  workArrangement?: string;
  locations?: string[];
  dutiesDescription: string;
  whyO1Required: string;

  // Generated
  letterDate: string;
  letterId: string;
}

function formatSalaryRange(min?: number, max?: number): string {
  if (!min && !max) return 'competitive compensation';
  if (min && max) {
    return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
  }
  if (min) return `$${(min / 1000).toFixed(0)}k or more`;
  return `up to $${((max || 0) / 1000).toFixed(0)}k`;
}

function formatEngagementType(type?: string): string {
  const types: Record<string, string> = {
    full_time: 'full-time',
    part_time: 'part-time',
    contract_w2: 'W-2 contract',
    consulting_1099: '1099 consulting',
    project_based: 'project-based',
  };
  return types[type || ''] || 'full-time';
}

function formatWorkArrangement(arrangement?: string): string {
  const arrangements: Record<string, string> = {
    on_site: 'on-site',
    hybrid: 'hybrid',
    remote: 'remote',
    flexible: 'flexible',
  };
  return arrangements[arrangement || ''] || 'on-site';
}

function getCommitmentLanguage(level: CommitmentLevel, data: InterestLetterData): string {
  const template = COMMITMENT_LEVELS[level].language;
  const salaryRange = formatSalaryRange(data.salaryMin, data.salaryMax);
  const hisHer = 'their'; // Gender neutral

  return template
    .replace(/{name}/g, data.talentName)
    .replace(/{title}/g, data.jobTitle)
    .replace(/{salary_range}/g, salaryRange)
    .replace(/{his_her}/g, hisHer);
}

export function InterestLetterPDF({ data }: { data: InterestLetterData }) {
  const currentDate = new Date(data.letterDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const companyAddress = [
    data.streetAddress,
    [data.city, data.state, data.zipCode].filter(Boolean).join(', '),
    data.country,
  ]
    .filter(Boolean)
    .join('\n');

  const commitmentLanguage = getCommitmentLanguage(data.commitmentLevel, data);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{data.companyName}</Text>
          {data.legalName && data.legalName !== data.companyName && (
            <Text style={styles.companyAddress}>{data.legalName}</Text>
          )}
          {companyAddress && (
            <Text style={styles.companyAddress}>{companyAddress}</Text>
          )}
        </View>

        {/* Date */}
        <View style={styles.date}>
          <Text>{currentDate}</Text>
        </View>

        {/* Recipient */}
        <View style={styles.recipient}>
          <Text>United States Citizenship and Immigration Services</Text>
          <Text>O-1 Visa Petition</Text>
        </View>

        {/* Salutation */}
        <View style={styles.salutation}>
          <Text>To Whom It May Concern:</Text>
        </View>

        {/* Introduction */}
        <View style={styles.paragraph}>
          <Text>
            I am writing on behalf of {data.companyName} to express our interest in
            {data.talentName} (Candidate ID: {data.candidateId}) for the position of {data.jobTitle}
            {data.department ? ` in our ${data.department} department` : ''}.
            {data.companyDescription ? ` ${data.companyDescription}` : ''}
          </Text>
        </View>

        {/* Commitment Statement */}
        <View style={styles.paragraph}>
          <Text>{commitmentLanguage}</Text>
        </View>

        {/* Position Details */}
        <View style={styles.sectionTitle}>
          <Text>Position Details</Text>
        </View>

        <View style={styles.paragraph}>
          <Text>
            The position is a {formatEngagementType(data.engagementType)}, {formatWorkArrangement(data.workArrangement)} role
            {data.locations && data.locations.length > 0
              ? ` located in ${data.locations.join(', ')}`
              : ''}.
            {data.durationYears
              ? ` We anticipate an initial engagement period of ${data.durationYears} year${data.durationYears > 1 ? 's' : ''}.`
              : ''}
          </Text>
        </View>

        {/* Duties */}
        <View style={styles.sectionTitle}>
          <Text>Duties and Responsibilities</Text>
        </View>

        <View style={styles.paragraph}>
          <Text>{data.dutiesDescription}</Text>
        </View>

        {/* O-1 Justification */}
        <View style={styles.sectionTitle}>
          <Text>Why O-1 Extraordinary Ability is Required</Text>
        </View>

        <View style={styles.paragraph}>
          <Text>{data.whyO1Required}</Text>
        </View>

        {/* Closing */}
        <View style={styles.closing}>
          <Text>
            We respectfully request that this petition be approved so that {data.talentName} may
            join our organization and contribute their extraordinary abilities to our work.
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.paragraph}>
          <Text>Sincerely,</Text>
        </View>

        <View style={styles.signature}>
          <Text style={styles.signatoryName}>{data.signatoryName}</Text>
          {data.signatoryTitle && (
            <Text style={styles.signatoryTitle}>{data.signatoryTitle}</Text>
          )}
          <Text>{data.companyName}</Text>
          {data.signatoryEmail && <Text>{data.signatoryEmail}</Text>}
          {data.signatoryPhone && <Text>{data.signatoryPhone}</Text>}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Letter ID: {data.letterId} | Generated by O1DMatch | This letter is for O-1 visa petition purposes only
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export type { InterestLetterData };
