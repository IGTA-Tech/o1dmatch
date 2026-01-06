import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  Mail,
  MailOpen,
  Building2,
  Calendar,
  Paperclip,
  ArrowRight,
  Briefcase,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';

export default async function TalentInboxPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: talentProfile } = await supabase
    .from('talent_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!talentProfile) {
    redirect('/dashboard/talent');
  }

  // Get interest letters
  const { data: letters } = await supabase
    .from('interest_letters')
    .select(`
      *,
      employer:employer_profiles(
        company_name,
        city,
        state
      )
    `)
    .eq('talent_id', talentProfile.id)
    .neq('status', 'draft')
    .order('created_at', { ascending: false });

  const unreadCount = letters?.filter(l => l.status === 'sent').length || 0;

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null;
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${((max || 0) / 1000).toFixed(0)}k`;
  };

  const getCommitmentBadge = (level: string) => {
    switch (level) {
      case 'offer_extended':
        return { label: 'Offer Extended', variant: 'success' as const };
      case 'firm_commitment':
        return { label: 'Firm Commitment', variant: 'success' as const };
      case 'conditional_offer':
        return { label: 'Conditional Offer', variant: 'info' as const };
      case 'intent_to_engage':
        return { label: 'Intent to Engage', variant: 'info' as const };
      case 'exploratory_interest':
      default:
        return { label: 'Exploratory', variant: 'default' as const };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-600">Interest letters from employers</p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="info">{unreadCount} unread</Badge>
        )}
      </div>

      {!letters || letters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600">
              When employers send you interest letters, they&apos;ll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {letters.map((letter) => {
            const isUnread = letter.status === 'sent';
            const commitment = getCommitmentBadge(letter.commitment_level);
            const salary = formatSalary(letter.salary_min, letter.salary_max);

            return (
              <Link key={letter.id} href={`/dashboard/talent/inbox/${letter.id}`}>
                <Card hover className={isUnread ? 'border-blue-200 bg-blue-50/50' : ''}>
                  <CardContent className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isUnread ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {isUnread ? (
                        <Mail className="w-5 h-5 text-blue-600" />
                      ) : (
                        <MailOpen className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium truncate ${
                          isUnread ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {letter.job_title}
                        </h3>
                        <Badge variant={commitment.variant}>
                          {commitment.label}
                        </Badge>
                        {letter.pdf_url && (
                          <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {letter.employer?.company_name}
                        </span>
                        {salary && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {salary}
                          </span>
                        )}
                        {letter.work_arrangement && (
                          <span className="capitalize">
                            {letter.work_arrangement.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(letter.created_at).toLocaleDateString()}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}