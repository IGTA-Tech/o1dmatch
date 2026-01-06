'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';

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

    const [sending, setSending] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Change default from 'hybrid' to valid value and 'full_time'
        // const [workArrangement, setWorkArrangement] = useState('hybrid'); // This is correct
        // const [engagementType, setEngagementType] = useState('full_time'); // This is correct
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
        if (!whyO1Required.trim()) {
            setError('Please explain why O-1 talent is required');
            return false;
        }
        return true;
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

            // Upload attachment if exists
            // Upload attachment if exists
            if (attachment) {
                console.log("====> Start uploading <====");
                setUploading(true);

                try {
                    const fileExt = attachment.name.split('.').pop();
                    const fileName = `${employerProfile.id}/${talent.id}/${Date.now()}.${fileExt}`;
                    console.log("fileName => ", fileName);

                    // Use anon key for public bucket upload
                    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                    console.log("anonKey ====> ", anonKey);
                    console.log("Uploading via fetch with anon key...");

                    const response = await fetch(
                        `${supabaseUrl}/storage/v1/object/interest-letters/${fileName}`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${anonKey}`,
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
                        console.log("Upload success, URL:", pdfUrl);
                    } else {
                        console.error('Upload failed:', response.status, responseText);
                    }
                } catch (err) {
                    console.error('Upload error:', err);
                }

                setUploading(false);
            }

            const insertData = {
                talent_id: talent.id,
                employer_id: employerProfile.id,
                source_type: 'employer',
                job_id: selectedJob || null,
                commitment_level: commitmentLevel, // Must be: exploratory_interest, intent_to_engage, conditional_offer, firm_commitment, offer_extended
                job_title: jobTitle.trim(),
                department: department.trim() || null,
                salary_min: salaryMin || null,
                salary_max: salaryMax || null,
                salary_negotiable: salaryNegotiable,
                engagement_type: engagementType, // Must be: full_time, part_time, contract_w2, consulting_1099, project_based
                work_arrangement: workArrangement, // Must be: on_site, hybrid, remote, flexible
                locations: locations ? locations.split(',').map(l => l.trim()).filter(Boolean) : [],
                start_timing: startTiming || null,
                duties_description: dutiesDescription.trim(),
                why_o1_required: whyO1Required.trim(),
                letter_content: letterContent.trim() || null,
                pdf_url: pdfUrl || null,
                status: isDraft ? 'draft' : 'sent', // Must be: draft, sent, viewed, accepted, declined, expired, signature_requested, signature_pending, signed
            };

            console.log("Insert data:", JSON.stringify(insertData, null, 2));
            console.log("Insert data:", JSON.stringify(insertData, null, 2));
            const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

            const insertResponse = await fetch(
                `${supabaseUrl}/rest/v1/interest_letters`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${anonKey}`,
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


            /*if (attachment) {
              console.log("Start file Uploading");
              setUploading(true);
              const fileExt = attachment.name.split('.').pop();
              const fileName = `${employerProfile.id}/${talent.id}/${Date.now()}.${fileExt}`;
              console.log("Start file Uploading - 2");
              const { error: uploadError } = await supabase.storage
                .from('interest-letters')
                .upload(fileName, attachment);
              console.log("Supa file Uploading Done");
              if (uploadError) {
                console.error('Upload error:', uploadError);
                // Continue without attachment if upload fails
              } else {
                const { data: urlData } = supabase.storage
                  .from('interest-letters')
                  .getPublicUrl(fileName);
                pdfUrl = urlData.publicUrl;
              }
              setUploading(false);
            }*/

            // Insert interest letter
            /*const { error: insertError } = await supabase
                .from('interest_letters')
                .insert({
                    employer_id: employerProfile.id,
                    talent_id: talent.id,
                    source_type: 'employer',
                    job_id: selectedJob || null,
                    job_title: jobTitle.trim(),
                    department: department.trim() || null,
                    commitment_level: commitmentLevel,
                    salary_min: salaryMin || null,
                    salary_max: salaryMax || null,
                    salary_negotiable: salaryNegotiable,
                    engagement_type: engagementType,
                    work_arrangement: workArrangement,
                    locations: locations ? locations.split(',').map(l => l.trim()).filter(Boolean) : [],
                    start_timing: startTiming || null,
                    duties_description: dutiesDescription.trim(),
                    why_o1_required: whyO1Required.trim(),
                    letter_content: letterContent.trim() || null,
                    pdf_url: pdfUrl,
                    status: isDraft ? 'draft' : 'sent',
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                });

            if (insertError) {
                throw new Error(insertError.message);
            }*/

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
                            Your interest letter has been sent to {talent.name}.
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
                        <h3 className="font-semibold text-gray-900">{talent.name}</h3>
                        {talent.headline && (
                            <p className="text-sm text-gray-600">{talent.headline}</p>
                        )}
                        <p className="text-sm text-gray-500">{talent.email}</p>
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
                                onChange={(e) => setCommitmentLevel(e.target.value)}
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Expected Start
                            </label>
                            <input
                                type="text"
                                value={startTiming}
                                onChange={(e) => setStartTiming(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Immediately, Q2 2026, Flexible"
                            />
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
                                    Salary Min ($)
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
                                    Salary Max ($)
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
                            disabled={sending || savingDraft || uploading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {sending || uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {uploading ? 'Uploading...' : 'Sending...'}
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