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
} from 'lucide-react';
import Link from 'next/link';
import { getSupabaseToken } from '@/lib/supabase/getToken';
import { jsPDF } from 'jspdf';

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
}

type CommitmentLevel = 'exploratory_interest' | 'intent_to_engage' | 'conditional_offer' | 'firm_commitment' | 'offer_extended';

export function InterestLetterForm({
    employerProfile,
    talent,
    jobs,
    preselectedJobId,
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
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
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
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let yPos = 20;

        // Helper: draw horizontal line
        const addLine = (thickness: number = 0.5) => {
            doc.setLineWidth(thickness);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 5;
        };

        // Helper: add text with word wrap
        const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            const lines = doc.splitTextToSize(text, contentWidth);
            doc.text(lines, margin, yPos);
            yPos += (lines.length * fontSize * 0.4) + 2;
        };

        // Helper: add bullet point
        const addBulletPoint = (text: string, fontSize: number = 10) => {
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', 'normal');
            const bulletMargin = margin + 5;
            const bulletWidth = contentWidth - 5;
            doc.text('○', margin, yPos);
            const lines = doc.splitTextToSize(text, bulletWidth);
            doc.text(lines, bulletMargin, yPos);
            yPos += (lines.length * fontSize * 0.4) + 3;
        };

        // Helper: check page break
        const checkPageBreak = (neededSpace: number = 30) => {
            if (yPos > doc.internal.pageSize.getHeight() - neededSpace) {
                doc.addPage();
                yPos = 20;
            }
        };

        // Try to add company logo
        if (fullEmployerProfile?.company_logo_url) {
            try {
                const logoResponse = await fetch(fullEmployerProfile.company_logo_url);
                const logoBlob = await logoResponse.blob();
                const logoBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(logoBlob);
                });
                doc.addImage(logoBase64, 'PNG', margin, yPos, 40, 40);
                yPos += 45;
            } catch (e) {
                console.log('Could not load logo for PDF:', e);
            }
        }

        // Header line
        addLine(1);

        // Title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('MULTIPLE EMPLOYER AGREEMENT FOR P-1/O-1 VISA BENEFICIARY', margin, yPos);
        yPos += 10;

        // Intro text
        addText('This Agreement ("Agreement") is made between the Employer(s) identified below and the Petitioner, who will act on behalf of the visa beneficiary named below.');
        yPos += 5;

        addLine(1);

        // Section 1: Employer Information
        checkPageBreak();
        addText('1. EMPLOYER INFORMATION', 12, true);
        yPos += 2;
        addBulletPoint(`Name of Employer: ${fullEmployerProfile?.signatory_name || 'N/A'}`);
        addBulletPoint(`Organization Name: ${fullEmployerProfile?.company_name || employerProfile.company_name}`);
        
        const address = [
            fullEmployerProfile?.street_address,
            fullEmployerProfile?.city,
            fullEmployerProfile?.state,
            fullEmployerProfile?.zip_code,
            fullEmployerProfile?.country
        ].filter(Boolean).join(', ');
        addBulletPoint(`Contact Information: ${address || 'N/A'}`);
        addBulletPoint(`Phone: ${fullEmployerProfile?.signatory_phone || 'N/A'}`);
        addBulletPoint(`Email: ${fullEmployerProfile?.signatory_email || 'N/A'}`);
        yPos += 5;

        // Section 2: Beneficiary Information
        checkPageBreak();
        addText('2. BENEFICIARY INFORMATION', 12, true);
        yPos += 2;
        addBulletPoint(`Full Name of Beneficiary: ${talent.name}`);
        yPos += 5;

        // Section 3: Duration of Activities
        checkPageBreak();
        addText('3. DURATION OF ACTIVITIES', 12, true);
        yPos += 2;
        const startDateStr = useTextStartDate ? (startTiming || 'Upon visa approval') : formatDateForPdf(startDate);
        const endDateStr = useTextStartDate ? 'Up to three years from visa approval' : formatDateForPdf(endDate);
        addBulletPoint(`Dates of Activities: From ${startDateStr} to ${endDateStr}`);
        yPos += 2;
        addText('   If no specific date is listed, it is understood that the beneficiary\'s activities will commence on the date of visa approval and extend up to three years from that date.', 9);
        yPos += 5;

        // Section 4: Description of Authorized Activities
        checkPageBreak();
        addText('4. DESCRIPTION OF AUTHORIZED ACTIVITIES', 12, true);
        yPos += 2;
        addText(`Position: ${jobTitle}`, 10, true);
        yPos += 3;
        addText('Job Duties:', 10, true);
        addText(dutiesDescription);
        yPos += 3;
        addText('Required Skills:', 10, true);
        addText(requiredSkills);
        yPos += 3;
        addText(`Compensation: ${formatSalaryRange()}`, 10, true);
        yPos += 5;

        // Section 5: Authorization for Service of Process
        checkPageBreak();
        addText('5. AUTHORIZATION FOR SERVICE OF PROCESS', 12, true);
        yPos += 2;
        addBulletPoint('The Employer grants permission for the Petitioner to act as the agent for the beneficiary and to receive service of process on behalf of the beneficiary and all involved Employers related to this petition.');
        yPos += 5;

        // Section 6: Agent-Based Petition Filing
        checkPageBreak();
        addText('6. AGENT-BASED PETITION FILING', 12, true);
        yPos += 2;
        addBulletPoint('The Employer authorizes the Petitioner to file the visa petition on behalf of the beneficiary, including the representation of all involved Employers for purposes of this agent-based petition.');
        yPos += 5;

        // Section 7: Additional Provisions
        checkPageBreak();
        addText('7. ADDITIONAL PROVISIONS', 12, true);
        yPos += 2;
        addBulletPoint('Responsibility for Compliance: The Employer agrees to comply with all applicable U.S. immigration laws and regulations concerning the employment of the beneficiary.');
        addBulletPoint('Notification of Changes: The Employer agrees to promptly inform the Petitioner of any changes to the beneficiary\'s employment status or any changes that may impact the beneficiary\'s visa status.');
        addBulletPoint('Liability and Indemnification: The Employer agrees to indemnify and hold harmless the Petitioner for any legal claims or liabilities arising from the beneficiary\'s activities under this visa.');
        yPos += 5;

        // Signature Section
        checkPageBreak(60);
        addLine(1);
        addText('AUTHORIZED SIGNATURE', 12, true);
        yPos += 5;
        
        addText('● Employer Signature: _________________________________');
        yPos += 5;
        addText(`● Printed Name: ${fullEmployerProfile?.signatory_name || 'N/A'}`);
        yPos += 5;
        addText(`● Title: ${fullEmployerProfile?.signatory_title || 'N/A'}`);
        yPos += 5;
        addText(`● Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
        yPos += 5;

        addLine(1);

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
            };

            console.log("Insert data:", JSON.stringify(insertData, null, 2));
            const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const accessToken = getSupabaseToken();

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

            console.log("Insert response status:", insertResponse.status);
            const insertResult = await insertResponse.text();
            console.log("Insert response body:", insertResult);

            if (insertResponse.ok) {
                console.log("Success! Redirecting...");
                router.push('/dashboard/employer/letters');
                router.refresh();
            } else {
                console.error('Insert failed:', insertResult);
                setError(`Failed to save: ${insertResult}`);
            }

            if (isDraft) {
                setError(null);
                alert('Draft saved successfully!');
                setSavingDraft(false);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push(`/dashboard/employer/browse/${talent.id}`);
                }, 2000);
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
                            Redirecting back to profile...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
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
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Skills</p>
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
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Immediately, Q2 2026, Upon visa approval"
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">End Date (auto +3 years)</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 250000"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
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
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe the key duties and responsibilities for this position..."
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
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
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="List specific skills, technologies, qualifications required for this role..."
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
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
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Explain why this position requires someone with extraordinary ability..."
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
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
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                        <p className="text-xs text-gray-500">
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
                                    <Paperclip className="w-5 h-5 text-gray-400" />
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