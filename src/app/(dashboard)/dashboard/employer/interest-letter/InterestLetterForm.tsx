'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
    ArrowLeft,
    Send,
    Loader2,
    Paperclip,
    X,
    User,
    Building2,
    FileText,
    Save,
    Calendar,
    AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { getSupabaseToken } from '@/lib/supabase/getToken';
import { jsPDF } from 'jspdf';

const LETTER_LIMITS: Record<string, number> = {
    free:       5,
    starter:    15,
    growth:     40,
    business:   100,
    enterprise: Infinity,
};

// Full employer profile interface for PDF generation
interface EmployerProfileFull {
    id: string;
    user_id: string;
    company_name: string;
    legal_name: string | null;
    company_logo_url: string | null;
    street_address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    country: string;
    signatory_name: string;
    signatory_title: string | null;
    signatory_email: string;
    signatory_phone: string | null;
}

interface InterestLetterFormProps {
    employerProfile: {
        id: string;
        company_name: string;
    };
    talent: {
        id: string;
        name: string;
        email: string;
        headline?: string;
        designation?: string;
        employer?: string;
        skills?: string[];
    };
    jobs: { id: string; title: string }[];
    preselectedJobId?: string;
    letterUsage: {
        canSend: boolean;
        used: number;
        limit: number;
        tier: string;
    };
}

type CommitmentLevel = 'exploratory_interest' | 'intent_to_engage' | 'conditional_offer' | 'firm_commitment' | 'offer_extended';

// Helper function to get date string for N days from now
const getDateFromNow = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

export function InterestLetterForm({
    employerProfile,
    talent,
    jobs,
    preselectedJobId,
    letterUsage,
}: InterestLetterFormProps) {
    const router = useRouter();
    const supabase = createClient();
    if(supabase){console.log(supabase);}
    const [sending, setSending] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Full employer profile for PDF generation
    const [fullEmployerProfile, setFullEmployerProfile] = useState<EmployerProfileFull | null>(null);

    // Form state
    const [selectedJob, setSelectedJob] = useState(preselectedJobId || '');
    const [jobTitle, setJobTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [commitmentLevel, setCommitmentLevel] = useState<CommitmentLevel>('intent_to_engage');
    const [salaryMin, setSalaryMin] = useState<number | ''>('');
    const [salaryMax, setSalaryMax] = useState<number | ''>('');
    const [salaryNegotiable, setSalaryNegotiable] = useState(false);
    const [engagementType, setEngagementType] = useState('full_time');
    const [workArrangement, setWorkArrangement] = useState('hybrid');
    const [locations, setLocations] = useState('');
    const [startTiming, setStartTiming] = useState('');
    const [dutiesDescription, setDutiesDescription] = useState('');
    const [whyO1Required, setWhyO1Required] = useState('');
    const [letterContent, setLetterContent] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    
    // New fields for PDF generation
    const [requiredSkills, setRequiredSkills] = useState('');
    const [useTextStartDate, setUseTextStartDate] = useState(true);
    const [startDate, setStartDate] = useState<string>(getDateFromNow(2));
    const [endDate, setEndDate] = useState<string>(getDateFromNow(2 + 365 * 3)); // 3 years from start
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // Load full employer profile on mount for PDF generation
    useEffect(() => {
        async function loadFullEmployerProfile() {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
            const accessToken = getSupabaseToken();

            if (!accessToken) return;

            try {
                const response = await fetch(
                    `${supabaseUrl}/rest/v1/employer_profiles?id=eq.${employerProfile.id}&select=*`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'apikey': anonKey,
                        },
                    }
                );

                if (response.ok) {
                    const profiles = await response.json();
                    if (profiles && profiles.length > 0) {
                        setFullEmployerProfile(profiles[0]);
                    }
                }
            } catch (error) {
                console.error('Error loading employer profile:', error);
            }
        }

        loadFullEmployerProfile();
    }, [employerProfile.id]);

    // Auto-calculate end date (3 years from start) when using date picker
    useEffect(() => {
        if (startDate && !useTextStartDate) {
            const start = new Date(startDate);
            const end = new Date(start);
            end.setFullYear(end.getFullYear() + 3);
            setEndDate(end.toISOString().split('T')[0]);
        }
    }, [startDate, useTextStartDate]);

    // Redirect to letters list after success screen
    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => {
            router.push('/dashboard/employer/letters');
        }, 2000);
        return () => clearTimeout(timer);
    }, [success, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setAttachment(file);
            setError(null);
        }
    };

    const removeAttachment = () => {
        setAttachment(null);
    };

    const validateForm = () => {
        if (!jobTitle.trim()) {
            setError('Job title is required');
            return false;
        }
        if (!dutiesDescription.trim()) {
            setError('Job duties description is required');
            return false;
        }
        if (!requiredSkills.trim()) {
            setError('Required skills is required');
            return false;
        }
        if (!salaryMin && !salaryMax) {
            setError('At least one salary field (min or max) is required');
            return false;
        }
        if (!whyO1Required.trim()) {
            setError('Please explain why O-1 talent is required');
            return false;
        }
        if (!useTextStartDate && !startDate) {
            setError('Start date is required');
            return false;
        }
        if (useTextStartDate && !startTiming.trim()) {
            setError('Start timing is required');
            return false;
        }
        return true;
    };

    // Format date for PDF display
    const formatDateForPdf = (dateStr: string | null): string => {
        if (!dateStr) return 'Upon visa approval';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Generate salary range string for PDF
    const formatSalaryRange = (): string => {
        if (salaryMin && salaryMax) {
            return `$${Number(salaryMin).toLocaleString()} - $${Number(salaryMax).toLocaleString()} per year`;
        } else if (salaryMin) {
            return `$${Number(salaryMin).toLocaleString()}+ per year`;
        } else if (salaryMax) {
            return `Up to $${Number(salaryMax).toLocaleString()} per year`;
        }
        return 'Competitive compensation';
    };

    // Generate PDF document
    const generatePDF = async (): Promise<Blob> => {
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageW  = doc.internal.pageSize.getWidth();
        const pageH  = doc.internal.pageSize.getHeight();
        const ML     = 18;   // left margin
        const MR     = 18;   // right margin
        const CW     = pageW - ML - MR; // content width
        let   y      = 0;

        // ── Colour palette ────────────────────────────────────────────────────
        const NAVY   = [11,  29,  53]  as [number,number,number];
        const GOLD   = [212, 168, 75]  as [number,number,number];
        const WHITE  = [255, 255, 255] as [number,number,number];
        const LIGHT  = [248, 246, 242] as [number,number,number];
        const BORDER = [226, 217, 204] as [number,number,number];
        const TEXT   = [30,  30,  30]  as [number,number,number];
        const MUTED  = [100, 116, 139] as [number,number,number];

        // ── Helpers ───────────────────────────────────────────────────────────
        const setColor = (rgb: [number,number,number]) =>
            doc.setTextColor(rgb[0], rgb[1], rgb[2]);

        const setFill = (rgb: [number,number,number]) =>
            doc.setFillColor(rgb[0], rgb[1], rgb[2]);

        const setDraw = (rgb: [number,number,number]) =>
            doc.setDrawColor(rgb[0], rgb[1], rgb[2]);

        const txt = (
            text: string,
            x: number,
            yy: number,
            opts?: { size?: number; bold?: boolean; color?: [number,number,number]; align?: 'left'|'center'|'right' }
        ) => {
            doc.setFontSize(opts?.size ?? 10);
            doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
            if (opts?.color) setColor(opts.color);
            doc.text(text, x, yy, { align: opts?.align ?? 'left' });
        };

        const wrappedTxt = (
            text: string,
            x: number,
            yy: number,
            maxW: number,
            opts?: { size?: number; bold?: boolean; color?: [number,number,number]; lineH?: number }
        ): number => {
            doc.setFontSize(opts?.size ?? 10);
            doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
            if (opts?.color) setColor(opts.color);
            const lines = doc.splitTextToSize(text, maxW) as string[];
            const lh = opts?.lineH ?? ((opts?.size ?? 10) * 0.45);
            doc.text(lines, x, yy);
            return lh * lines.length;
        };

        const checkBreak = (needed: number = 35) => {
            if (y > pageH - needed) {
                doc.addPage();
                // Repeat narrow top-bar on new pages
                setFill(NAVY);
                doc.rect(0, 0, pageW, 8, 'F');
                txt(`${(fullEmployerProfile?.company_name || employerProfile.company_name).toUpperCase()}  ·  Employer Agreement`, ML, 5.5,
                    { size: 7, bold: false, color: [212, 168, 75] });
                const pn = String((doc.internal as unknown as { getCurrentPageInfo: () => { pageNumber: number } }).getCurrentPageInfo().pageNumber);
                txt(`Page ${pn}`, pageW - MR, 5.5,
                    { size: 7, color: [212, 168, 75], align: 'right' });
                y = 18;
            }
        };

        // Section header: navy pill with white number + gold title text
        const sectionHeader = (num: string, title: string) => {
            checkBreak(20);
            // Number badge
            setFill(NAVY);
            doc.roundedRect(ML, y - 4.5, 7, 6, 1.5, 1.5, 'F');
            txt(num, ML + 3.5, y, { size: 8, bold: true, color: WHITE, align: 'center' });
            // Title
            txt(title, ML + 10, y, { size: 11, bold: true, color: NAVY });
            y += 2;
            // Gold underline
            setDraw(GOLD);
            doc.setLineWidth(0.6);
            doc.line(ML + 10, y, pageW - MR, y);
            y += 5;
        };

        // Two-column field row (label | value) with light-grey row background
        let rowAlt = false;
        const fieldRow = (label: string, value: string, fullWidth = false) => {
            const rowH = 7;
            checkBreak(rowH + 4);
            if (rowAlt) {
                setFill(LIGHT);
                doc.rect(ML, y - 5, CW, rowH, 'F');
            }
            rowAlt = !rowAlt;
            const colW = fullWidth ? CW : CW * 0.36;
            txt(label, ML + 2, y, { size: 9, bold: true, color: MUTED });
            const valX = fullWidth ? ML + 2 : ML + colW + 2;
            const valW = fullWidth ? CW - 4 : CW - colW - 2;
            wrappedTxt(value || '—', valX, y, valW, { size: 9, color: TEXT });
            y += rowH;
        };

        // Bullet item
        const bullet = (text: string) => {
            checkBreak(12);
            setFill(GOLD);
            doc.circle(ML + 2, y - 1.5, 1, 'F');
            const h = wrappedTxt(text, ML + 6, y, CW - 6, { size: 9.5, color: TEXT, lineH: 4.8 });
            y += Math.max(h, 5) + 1.5;
        };

        // ═══════════════════════════════════════════════════════════════════
        // TOP BAND
        // ═══════════════════════════════════════════════════════════════════
        setFill(NAVY);
        doc.rect(0, 0, pageW, 22, 'F');

        // Gold accent strip
        setFill(GOLD);
        doc.rect(0, 22, pageW, 2, 'F');

        // Try to embed logo
        let logoLoaded = false;
        if (fullEmployerProfile?.company_logo_url) {
            try {
                const lr  = await fetch(fullEmployerProfile.company_logo_url);
                const lb  = await lr.blob();
                const b64 = await new Promise<string>((res) => {
                    const r = new FileReader();
                    r.onloadend = () => res(r.result as string);
                    r.readAsDataURL(lb);
                });
                doc.addImage(b64, 'PNG', ML, 3, 16, 16);
                logoLoaded = true;
            } catch { /* silent */ }
        }

        const nameX = logoLoaded ? ML + 20 : ML;
        txt(
            (fullEmployerProfile?.company_name || employerProfile.company_name).toUpperCase(),
            nameX, 11,
            { size: 14, bold: true, color: WHITE }
        );
        txt('O-1 VISA EMPLOYER AGREEMENT', nameX, 17,
            { size: 8, bold: false, color: GOLD });

        // Date top-right
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        txt(today, pageW - MR, 11, { size: 8, color: [200, 200, 200], align: 'right' });
        const refNum = `REF-${Date.now().toString(36).toUpperCase()}`;
        txt(`Ref: ${refNum}`, pageW - MR, 16, { size: 7, color: [180, 180, 180], align: 'right' });

        y = 32;

        // ── Document title block ──────────────────────────────────────────────
        txt(
            'MULTIPLE EMPLOYER AGREEMENT FOR P-1/O-1 VISA BENEFICIARY',
            pageW / 2, y,
            { size: 13, bold: true, color: NAVY, align: 'center' }
        );
        y += 6;

        setColor(MUTED);
        doc.setFontSize(9);
        const introLines = doc.splitTextToSize(
            'This Agreement is made between the Employer identified below and the Petitioner, who will act on behalf of the visa beneficiary named herein. This document may be submitted as supporting evidence in the O-1 visa petition.',
            CW
        ) as string[];
        doc.text(introLines, pageW / 2, y, { align: 'center' });
        y += introLines.length * 4.2 + 6;

        // thin full-width border line
        setDraw(BORDER);
        doc.setLineWidth(0.3);
        doc.line(ML, y, pageW - MR, y);
        y += 7;

        // ═══════════════════════════════════════════════════════════════════
        // SECTION 1 — EMPLOYER INFORMATION
        // ═══════════════════════════════════════════════════════════════════
        sectionHeader('1', 'EMPLOYER INFORMATION');
        rowAlt = false;

        const address = [
            fullEmployerProfile?.street_address,
            fullEmployerProfile?.city,
            fullEmployerProfile?.state,
            fullEmployerProfile?.zip_code,
            fullEmployerProfile?.country,
        ].filter(Boolean).join(', ');

        fieldRow('Organization Name',  fullEmployerProfile?.company_name || employerProfile.company_name);
        fieldRow('Authorized Signatory', fullEmployerProfile?.signatory_name || '');
        fieldRow('Title',              fullEmployerProfile?.signatory_title || '');
        fieldRow('Address',            address);
        fieldRow('Phone',              fullEmployerProfile?.signatory_phone || '');
        fieldRow('Email',              fullEmployerProfile?.signatory_email || '');
        y += 4;

        // ═══════════════════════════════════════════════════════════════════
        // SECTION 2 — BENEFICIARY INFORMATION
        // ═══════════════════════════════════════════════════════════════════
        checkBreak();
        sectionHeader('2', 'BENEFICIARY INFORMATION');
        rowAlt = false;
        fieldRow('Full Legal Name',    talent.name);
        fieldRow('Email',              talent.email || '');
        if (talent.headline) fieldRow('Professional Headline', talent.headline);
        if (talent.designation) fieldRow('Current Designation', talent.designation);
        if (talent.employer)    fieldRow('Current Employer',    talent.employer);
        y += 4;

        // ═══════════════════════════════════════════════════════════════════
        // SECTION 3 — DURATION OF ACTIVITIES
        // ═══════════════════════════════════════════════════════════════════
        checkBreak();
        sectionHeader('3', 'DURATION OF ACTIVITIES');
        rowAlt = false;
        const startDateStr = useTextStartDate ? (startTiming || 'Upon visa approval') : formatDateForPdf(startDate);
        const endDateStr   = useTextStartDate ? 'Up to three years from visa approval' : formatDateForPdf(endDate);
        fieldRow('Start Date', startDateStr);
        fieldRow('End Date',   endDateStr);
        y += 2;
        wrappedTxt(
            'If no specific date is listed, it is understood that the activities will commence on the date of visa approval and extend up to three years from that date.',
            ML, y, CW, { size: 8.5, color: MUTED }
        );
        y += 10;

        // ═══════════════════════════════════════════════════════════════════
        // SECTION 4 — DESCRIPTION OF AUTHORIZED ACTIVITIES
        // ═══════════════════════════════════════════════════════════════════
        checkBreak();
        sectionHeader('4', 'DESCRIPTION OF AUTHORIZED ACTIVITIES');
        rowAlt = false;
        fieldRow('Position / Job Title',  jobTitle);
        if (department) fieldRow('Department', department);
        fieldRow('Engagement Type',
            engagementType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
        fieldRow('Work Arrangement',
            workArrangement.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
        if (locations) fieldRow('Work Location(s)', locations);
        fieldRow('Compensation',          formatSalaryRange());
        if (salaryNegotiable) fieldRow('Negotiable', 'Yes — compensation is negotiable');
        y += 3;

        // Duties sub-block
        checkBreak(30);
        txt('Job Duties & Responsibilities', ML, y, { size: 10, bold: true, color: NAVY });
        y += 5;
        const dh = wrappedTxt(dutiesDescription, ML + 4, y, CW - 4, { size: 9.5, color: TEXT, lineH: 4.8 });
        y += dh + 5;

        // Skills sub-block
        checkBreak(20);
        txt('Required Skills & Qualifications', ML, y, { size: 10, bold: true, color: NAVY });
        y += 5;
        const sh = wrappedTxt(requiredSkills, ML + 4, y, CW - 4, { size: 9.5, color: TEXT, lineH: 4.8 });
        y += sh + 7;

        // ═══════════════════════════════════════════════════════════════════
        // SECTION 5 — WHY O-1 TALENT IS REQUIRED
        // ═══════════════════════════════════════════════════════════════════
        checkBreak(30);
        sectionHeader('5', 'EXTRAORDINARY ABILITY REQUIREMENT');
        const wh = wrappedTxt(whyO1Required, ML + 4, y, CW - 4, { size: 9.5, color: TEXT, lineH: 4.8 });
        y += wh + 8;

        // ═══════════════════════════════════════════════════════════════════
        // SECTION 6 — AUTHORIZATION FOR SERVICE OF PROCESS
        // ═══════════════════════════════════════════════════════════════════
        checkBreak(25);
        sectionHeader('6', 'AUTHORIZATION FOR SERVICE OF PROCESS');
        bullet('The Employer grants permission for the Petitioner to act as the agent for the beneficiary and to receive service of process on behalf of the beneficiary and all involved Employers related to this petition.');
        y += 2;

        // ═══════════════════════════════════════════════════════════════════
        // SECTION 7 — AGENT-BASED PETITION FILING
        // ═══════════════════════════════════════════════════════════════════
        checkBreak(25);
        sectionHeader('7', 'AGENT-BASED PETITION FILING');
        bullet('The Employer authorizes the Petitioner to file the visa petition on behalf of the beneficiary, including the representation of all involved Employers for purposes of this agent-based petition.');
        y += 2;

        // ═══════════════════════════════════════════════════════════════════
        // SECTION 8 — ADDITIONAL PROVISIONS
        // ═══════════════════════════════════════════════════════════════════
        checkBreak(40);
        sectionHeader('8', 'ADDITIONAL PROVISIONS');
        bullet('Responsibility for Compliance: The Employer agrees to comply with all applicable U.S. immigration laws and regulations concerning the employment of the beneficiary.');
        bullet('Notification of Changes: The Employer agrees to promptly inform the Petitioner of any changes to the beneficiary\'s employment status or any changes that may impact the beneficiary\'s visa status.');
        bullet('Liability and Indemnification: The Employer agrees to indemnify and hold harmless the Petitioner for any legal claims or liabilities arising from the beneficiary\'s activities under this visa.');
        y += 4;

        // ═══════════════════════════════════════════════════════════════════
        // SIGNATURE BLOCK
        // ═══════════════════════════════════════════════════════════════════
        checkBreak(90);

        // Navy header bar for signature
        setFill(NAVY);
        doc.rect(ML, y - 1, CW, 8, 'F');
        txt('AUTHORIZED SIGNATURE', ML + 4, y + 4.5,
            { size: 10, bold: true, color: WHITE });
        y += 14;

        // Two-column layout: left = signature area, right = supporting fields
        const colL  = ML;
        const colR  = ML + CW * 0.55;
        const colLW = CW * 0.48;
        const colRW = CW * 0.40;

        // ── Left column ───────────────────────────────────────────────────
        // "Authorized Signature" label
        txt('Authorized Signature', colL, y, { size: 8, bold: true, color: MUTED });
        y += 4;

        // Light-tinted signing box (tall, easy to sign inside)
        const sigBoxH = 28;
        setFill([245, 243, 238]);
        setDraw(BORDER);
        doc.setLineWidth(0.4);
        doc.roundedRect(colL, y, colLW, sigBoxH, 2, 2, 'FD');

        // Subtle "Sign here" watermark text inside the box
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(210, 200, 185);
        doc.text('Sign here', colL + colLW / 2, y + sigBoxH / 2 + 2, { align: 'center' });

        // Solid navy baseline inside the box (near the bottom)
        setDraw(NAVY);
        doc.setLineWidth(0.6);
        doc.line(colL + 4, y + sigBoxH - 6, colL + colLW - 4, y + sigBoxH - 6);
        y += sigBoxH + 5;

        // Printed name (pre-filled) below the signing box
        setDraw(BORDER);
        doc.setLineWidth(0.3);
        doc.line(colL, y, colL + colLW, y);
        y += 4;
        txt(fullEmployerProfile?.signatory_name || '', colL, y - 5,
            { size: 9, bold: true, color: TEXT });
        txt('Printed Name', colL, y, { size: 8, color: MUTED });
        y += 9;

        // Title
        doc.line(colL, y, colL + colLW, y);
        y += 4;
        txt(fullEmployerProfile?.signatory_title || '', colL, y - 5,
            { size: 9, color: TEXT });
        txt('Title / Position', colL, y, { size: 8, color: MUTED });

        // ── Right column (reset y to top of block) ────────────────────────
        y -= (4 + 9 + 4 + sigBoxH + 5 + 4); // back to start of left column

        // Date
        setDraw(NAVY);
        doc.setLineWidth(0.5);
        doc.line(colR, y, colR + colRW, y);
        y += 4;
        txt(today, colR, y - 5, { size: 9, color: TEXT });
        txt('Date', colR, y, { size: 8, color: MUTED });
        y += 12;

        // Organization
        setDraw(BORDER);
        doc.setLineWidth(0.3);
        doc.line(colR, y, colR + colRW, y);
        y += 4;
        txt(fullEmployerProfile?.company_name || employerProfile.company_name,
            colR, y - 5, { size: 9, color: TEXT });
        txt('Organization', colR, y, { size: 8, color: MUTED });
        y += 28;

        // ── Footer band on last page ──────────────────────────────────────────
        setFill(NAVY);
        doc.rect(0, pageH - 12, pageW, 12, 'F');
        setFill(GOLD);
        doc.rect(0, pageH - 12, pageW, 1.5, 'F');
        txt(
            'Generated by O1DMatch · This document is confidential and intended solely for O-1 visa petition purposes.',
            pageW / 2, pageH - 5,
            { size: 7, color: [180, 180, 180], align: 'center' }
        );
        txt(`Ref: ${refNum}`, pageW - MR, pageH - 5,
            { size: 7, color: GOLD, align: 'right' });

        return doc.output('blob');
    };

    // Upload generated PDF to Supabase
    const uploadGeneratedPDF = async (pdfBlob: Blob): Promise<string | null> => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const accessToken = getSupabaseToken();

        if (!accessToken) {
            console.error('No access token for PDF upload');
            return null;
        }

        try {
            const fileName = `${employerProfile.id}/${talent.id}/agreement-${Date.now()}.pdf`;

            const response = await fetch(
                `${supabaseUrl}/storage/v1/object/interest-letters/${fileName}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'apikey': anonKey,
                        'Content-Type': 'application/pdf',
                        'x-upsert': 'true',
                    },
                    body: pdfBlob,
                }
            );

            if (response.ok) {
                const generatedPdfUrl = `${supabaseUrl}/storage/v1/object/public/interest-letters/${fileName}`;
                console.log('Generated PDF uploaded successfully:', generatedPdfUrl);
                return generatedPdfUrl;
            } else {
                const errorText = await response.text();
                console.error('Generated PDF upload failed:', response.status, errorText);
                return null;
            }
        } catch (error) {
            console.error('Generated PDF upload error:', error);
            return null;
        }
    };

    const handleSubmit = async (isDraft: boolean = false) => {
        if (!isDraft && !validateForm()) return;
        console.log("No a draft");
        if (isDraft) {
            setSavingDraft(true);
        } else {
            setSending(true);
        }
        console.log("passed Lavel - 2");
        setError(null);

        try {
            let pdfUrl = null;
            let generatedPdfUrl = null;

            // Upload attachment if exists (existing functionality)
            if (attachment) {
                console.log("====> Start uploading attachment <====");
                setUploading(true);

                try {
                    const fileExt = attachment.name.split('.').pop();
                    const fileName = `${employerProfile.id}/${talent.id}/${Date.now()}.${fileExt}`;
                    console.log("fileName => ", fileName);

                    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                    const accessToken = getSupabaseToken();

                    const response = await fetch(
                        `${supabaseUrl}/storage/v1/object/interest-letters/${fileName}`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'apikey': anonKey!,
                                'Content-Type': attachment.type,
                                'x-upsert': 'true',
                            },
                            body: attachment,
                        }
                    );

                    console.log("Response status:", response.status);
                    const responseText = await response.text();
                    console.log("Response body:", responseText);

                    if (response.ok) {
                        pdfUrl = `${supabaseUrl}/storage/v1/object/public/interest-letters/${fileName}`;
                        console.log("Attachment upload success, URL:", pdfUrl);
                    } else {
                        console.error('Attachment upload failed:', response.status, responseText);
                    }
                } catch (err) {
                    console.error('Attachment upload error:', err);
                }

                setUploading(false);
            }

            // Generate and upload PDF (only for non-draft submissions)
            if (!isDraft) {
                console.log('====> Generating PDF <====');
                setGeneratingPdf(true);

                try {
                    const pdfBlob = await generatePDF();
                    generatedPdfUrl = await uploadGeneratedPDF(pdfBlob);
                    
                    if (generatedPdfUrl) {
                        console.log('Generated PDF URL:', generatedPdfUrl);
                    } else {
                        console.warn('PDF generation/upload failed, continuing without PDF');
                    }
                } catch (err) {
                    console.error('PDF generation error:', err);
                }

                setGeneratingPdf(false);
            }

            const insertData = {
                talent_id: talent.id,
                employer_id: employerProfile.id,
                source_type: 'employer',
                job_id: selectedJob || null,
                commitment_level: commitmentLevel,
                job_title: jobTitle.trim(),
                department: department.trim() || null,
                salary_min: salaryMin || null,
                salary_max: salaryMax || null,
                salary_negotiable: salaryNegotiable,
                engagement_type: engagementType,
                work_arrangement: workArrangement,
                locations: locations ? locations.split(',').map(l => l.trim()).filter(Boolean) : [],
                start_timing: useTextStartDate ? startTiming : null,
                start_date: !useTextStartDate && startDate ? startDate : null,
                end_date: !useTextStartDate && endDate ? endDate : null,
                duties_description: dutiesDescription.trim(),
                why_o1_required: whyO1Required.trim(),
                required_skills: requiredSkills.trim(),
                letter_content: letterContent.trim() || null,
                pdf_url: pdfUrl || null, // Attachment URL (existing field)
                generated_pdf_url: generatedPdfUrl || null, // NEW: Auto-generated PDF URL
                status: isDraft ? 'draft' : 'sent',
                // Auto-approve on send — no admin interaction required
                admin_status: isDraft ? 'pending_review' : 'approved',
                admin_reviewed_at: isDraft ? null : new Date().toISOString(),
                admin_notes: isDraft ? null : 'Auto-approved on send',
            };

            const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const accessToken = getSupabaseToken();

            // ── Re-verify letter limit at send time ──────────────────────
            // Count directly from interest_letters for this month — the
            // letters_sent_this_month column on employer_subscriptions is
            // never auto-incremented and cannot be trusted.
            if (!isDraft) {
                const monthStart = new Date();
                monthStart.setDate(1);
                monthStart.setHours(0, 0, 0, 0);
                const monthStartIso = monthStart.toISOString();

                const [subRes, sentRes] = await Promise.all([
                    fetch(
                        `${supabaseUrl}/rest/v1/employer_subscriptions?employer_id=eq.${employerProfile.id}&select=tier`,
                        {
                            cache: 'no-store',
                            headers: { Authorization: `Bearer ${accessToken}`, apikey: anonKey! },
                        }
                    ),
                    fetch(
                        `${supabaseUrl}/rest/v1/interest_letters?employer_id=eq.${employerProfile.id}&status=eq.sent&created_at=gte.${monthStartIso}&select=id`,
                        {
                            cache: 'no-store',
                            headers: { Authorization: `Bearer ${accessToken}`, apikey: anonKey! },
                        }
                    ),
                ]);

                const subs = await subRes.json();
                const currentTier = subs?.[0]?.tier ?? 'free';
                const currentLimit = LETTER_LIMITS[currentTier] ?? 5;
                const sentLetters = await sentRes.json();
                const currentUsed = Array.isArray(sentLetters) ? sentLetters.length : 0;

                console.log(`Letter plan check: ${currentTier}, sent this month: ${currentUsed}/${currentLimit}`);

                if (currentUsed >= currentLimit) {
                    setSending(false);
                    setError(
                        `You've reached your ${currentTier} plan limit of ` +
                        `${currentLimit === Infinity ? 'unlimited' : currentLimit} interest letters this month ` +
                        `(${currentUsed} sent). Please upgrade your plan to send more.`
                    );
                    return;
                }
            }

            const insertResponse = await fetch(
                `${supabaseUrl}/rest/v1/interest_letters`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'apikey': anonKey!,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify(insertData),
                }
            );

            const insertResult = await insertResponse.text();

            if (insertResponse.ok) {
                if (isDraft) {
                    // Draft saved — stay on page, show inline message
                    setError(null);
                    setSavingDraft(false);
                    // Parse inserted id to show confirmation
                    try {
                        const inserted = JSON.parse(insertResult);
                        const savedId = Array.isArray(inserted) ? inserted[0]?.id : inserted?.id;
                        if (savedId) console.info('Draft saved:', savedId);
                    } catch { /* non-critical */ }
                    // Use a non-blocking inline success indicator instead of alert()
                    setError(null);
                    alert('Draft saved successfully!');
                    return;
                }

                // ── Non-draft: auto-notify talent via the review API ──────
                // The letter is already marked admin_status='approved' in the DB.
                // We call the review API solely to trigger the talent notification email.
                try {
                    const inserted = JSON.parse(insertResult);
                    const newLetterId = Array.isArray(inserted) ? inserted[0]?.id : inserted?.id;

                    if (newLetterId) {
                        await fetch('/api/admin/letters/review', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                letterId: newLetterId,
                                action: 'approve',
                                adminNotes: 'Auto-approved on send',
                            }),
                        });
                    }
                } catch (notifyErr) {
                    // Non-critical — letter is already saved and approved in DB
                    console.warn('Auto-notify talent failed (non-critical):', notifyErr);
                }

                // ── Send employer confirmation email ──────────────────────
                if (fullEmployerProfile?.signatory_email) {
                    try {
                        await fetch('/api/send-interest-letter-confirmation', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                toEmail: fullEmployerProfile.signatory_email,
                                companyName: fullEmployerProfile.company_name,
                                signatoryName: fullEmployerProfile.signatory_name,
                                jobTitle: jobTitle.trim(),
                                commitmentLevel,
                                engagementType,
                                workArrangement,
                                salaryMin: salaryMin || null,
                                salaryMax: salaryMax || null,
                                salaryNegotiable,
                                locations: locations || '',
                                startTiming: useTextStartDate ? startTiming : startDate,
                            }),
                        });
                    } catch (emailErr) {
                        // Non-critical — letter already saved
                        console.warn('Employer confirmation email failed (non-critical):', emailErr);
                    }
                }

                // Show success screen — single redirect from there
                setSuccess(true);
            } else {
                setError(`Failed to save: ${insertResult}`);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save letter');
        } finally {
            setSending(false);
            setSavingDraft(false);
            setUploading(false);
            setGeneratingPdf(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-3xl mx-auto">
                <Card>
                    <CardContent className="text-center py-12">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Interest Letter Sent!
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Your interest letter has been sent to Talent.
                        </p>
                        <p className="text-sm text-gray-500">
                            Redirecting to your letters...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ── Letter limit gate ──────────────────────────────────────────────────
    if (!letterUsage.canSend) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/employer/browse"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Send Interest Letter</h1>
                        <p className="text-gray-600">Express your interest in this O-1 candidate</p>
                    </div>
                </div>

                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center text-center gap-4 max-w-md mx-auto">
                            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                                <AlertCircle className="w-7 h-7 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                                    Monthly letter limit reached
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    Your{' '}
                                    <span className="font-medium capitalize">{letterUsage.tier}</span>{' '}
                                    plan allows{' '}
                                    <span className="font-medium">
                                        {letterUsage.limit === Infinity ? 'unlimited' : letterUsage.limit}
                                    </span>{' '}
                                    interest letter{letterUsage.limit !== 1 ? 's' : ''} per month. You&apos;ve sent{' '}
                                    <span className="font-medium">{letterUsage.used}</span> this month.
                                </p>
                                <p className="text-gray-500 text-sm mt-2">
                                    Your limit resets at the start of next month, or upgrade now to send more.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <Link
                                    href="/dashboard/employer/letters"
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                                >
                                    View Sent Letters
                                </Link>
                                <Link
                                    href="/dashboard/employer/billing"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                >
                                    Upgrade Plan
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/dashboard/employer/browse/${talent.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Send Interest Letter</h1>
                        <p className="text-gray-600">Express your interest in this O-1 candidate</p>
                    </div>
                </div>
                {/* Monthly usage badge */}
                <div className="shrink-0 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                        letterUsage.used >= letterUsage.limit * 0.8
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                    }`}>
                        {letterUsage.used}&nbsp;/&nbsp;{letterUsage.limit === Infinity ? '∞' : letterUsage.limit} letters this month
                    </span>
                    <p className="text-xs text-gray-400 mt-1 capitalize">{letterUsage.tier} plan</p>
                </div>
            </div>

            {/* Recipient Info */}
            <Card>
                <CardContent className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        {talent.headline && (
                            <h3 className="font-semibold text-gray-900">{talent.headline}</h3>
                        )}
                        {talent.skills && talent.skills.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {talent.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Building2 className="w-4 h-4" />
                        {employerProfile.company_name}
                    </div>
                </CardContent>
            </Card>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }}>
                {/* Position Details */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Position Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {jobs.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Link to Existing Job (Optional)
                                </label>
                                <select
                                    value={selectedJob}
                                    onChange={(e) => setSelectedJob(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                >
                                    <option value="">Select a job posting...</option>
                                    {jobs.map((job) => (
                                        <option key={job.id} value={job.id}>
                                            {job.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Job Title *
                                </label>
                                <input
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                    placeholder="e.g., Senior AI Engineer"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                    placeholder="e.g., Engineering, Research"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Commitment Level *
                            </label>
                            <select
                                value={commitmentLevel}
                                onChange={(e) => setCommitmentLevel(e.target.value as CommitmentLevel)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                            >
                                <option value="exploratory_interest">Exploratory Interest</option>
                                <option value="intent_to_engage">Intent to Engage</option>
                                <option value="conditional_offer">Conditional Offer</option>
                                <option value="firm_commitment">Firm Commitment</option>
                                <option value="offer_extended">Offer Extended</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Engagement Type
                                </label>
                                <select
                                    value={engagementType}
                                    onChange={(e) => setEngagementType(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                >
                                    <option value="full_time">Full-time</option>
                                    <option value="part_time">Part-time</option>
                                    <option value="contract_w2">Contract (W2)</option>
                                    <option value="consulting_1099">Consulting (1099)</option>
                                    <option value="project_based">Project Based</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Work Arrangement
                                </label>
                                <select
                                    value={workArrangement}
                                    onChange={(e) => setWorkArrangement(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                >
                                    <option value="on_site">On-site</option>
                                    <option value="hybrid">Hybrid</option>
                                    <option value="remote">Remote</option>
                                    <option value="flexible">Flexible</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Locations
                            </label>
                            <input
                                type="text"
                                value={locations}
                                onChange={(e) => setLocations(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                placeholder="e.g., San Francisco, New York (comma separated)"
                            />
                        </div>

                        {/* Start Date Section with Toggle */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Start Date *
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setUseTextStartDate(false)}
                                        className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg transition-colors ${
                                            !useTextStartDate
                                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <Calendar className="w-3 h-3" />
                                        Date Picker
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUseTextStartDate(true)}
                                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                            useTextStartDate
                                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        Text Input
                                    </button>
                                </div>
                            </div>

                            {useTextStartDate ? (
                                <input
                                    type="text"
                                    value={startTiming}
                                    onChange={(e) => setStartTiming(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                    placeholder="e.g., Immediately, Q2 2026, Upon visa approval"
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">End Date (auto +3 years)</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Compensation */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Compensation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Salary Min ($) *
                                </label>
                                <input
                                    type="number"
                                    value={salaryMin}
                                    onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                    placeholder="e.g., 150000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Salary Max ($) *
                                </label>
                                <input
                                    type="number"
                                    value={salaryMax}
                                    onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                    placeholder="e.g., 250000"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600">
                            Salary range is required for O-1 visa sponsorship letters.
                        </p>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="salaryNegotiable"
                                checked={salaryNegotiable}
                                onChange={(e) => setSalaryNegotiable(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="salaryNegotiable" className="text-sm text-gray-700">
                                Salary is negotiable
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* O-1 Justification */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>O-1 Visa Justification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Job Duties & Responsibilities *
                            </label>
                            <textarea
                                value={dutiesDescription}
                                onChange={(e) => setDutiesDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                placeholder="Describe the key duties and responsibilities for this position..."
                                required
                            />
                            <p className="mt-1 text-xs text-gray-600">
                                This will be used in the O-1 petition to demonstrate the role requires extraordinary ability.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Required Skills *
                            </label>
                            <textarea
                                value={requiredSkills}
                                onChange={(e) => setRequiredSkills(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                placeholder="List specific skills, technologies, qualifications required for this role..."
                                required
                            />
                            <p className="mt-1 text-xs text-gray-600">
                                List the technical skills, certifications, or qualifications needed.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Why O-1 Talent is Required *
                            </label>
                            <textarea
                                value={whyO1Required}
                                onChange={(e) => setWhyO1Required(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                placeholder="Explain why this position requires someone with extraordinary ability..."
                                required
                            />
                            <p className="mt-1 text-xs text-gray-600">
                                Explain the specialized nature of the work and why ordinary talent cannot fulfill this role.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Message */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Personal Message (Optional)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Additional Message to Candidate
                            </label>
                            <textarea
                                value={letterContent}
                                onChange={(e) => setLetterContent(e.target.value)}
                                rows={5}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                placeholder={`Dear ${talent.name},\n\nI came across your profile and was impressed by your background...\n\nBest regards,\n${employerProfile.company_name}`}
                            />
                        </div>

                        {/* Attachment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Attachment (Optional)
                            </label>

                            {attachment ? (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {attachment.name}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {(attachment.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeAttachment}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        <X className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                    <Paperclip className="w-5 h-5 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                        Attach job description or company info (PDF, max 10MB)
                                    </span>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => handleSubmit(true)}
                        disabled={savingDraft || sending}
                        className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        {savingDraft ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Draft
                    </button>

                    <div className="flex gap-3">
                        <Link
                            href={`/dashboard/employer/browse/${talent.id}`}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={sending || savingDraft || uploading || generatingPdf}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {sending || uploading || generatingPdf ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {generatingPdf ? 'Generating PDF...' : uploading ? 'Uploading...' : 'Sending...'}
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Letter
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Tips */}
            <Card>
                <CardContent>
                    <h4 className="font-medium text-gray-900 mb-2">Tips for O-1 Interest Letters:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Clearly describe why the position requires extraordinary ability</li>
                        <li>• Highlight specific duties that match the candidate&apos;s expertise</li>
                        <li>• Be specific about compensation and work arrangements</li>
                        <li>• Explain how the role supports the company&apos;s mission</li>
                        <li>• This letter may be used as supporting evidence in the O-1 petition</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}