// src/app/(dashboard)/dashboard/admin/users/[id]/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  ArrowLeft,
  User,
  Building2,
  Scale,
  Shield,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { ChangeRoleButton } from './ChangeRoleButton';

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify admin
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminProfile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get user profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) {
    redirect('/dashboard/admin/users');
  }

  // Get additional profile data based on role
  let additionalData = null;
  
  if (profile.role === 'talent') {
    const { data } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    additionalData = data;
  } else if (profile.role === 'employer') {
    const { data } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    additionalData = data;
  } else if (profile.role === 'lawyer') {
    const { data } = await supabase
      .from('lawyer_profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    additionalData = data;
  }

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'talent':
        return <Badge variant="info">Talent</Badge>;
      case 'employer':
        return <Badge variant="success">Employer</Badge>;
      case 'lawyer':
        return <Badge variant="warning">Lawyer</Badge>;
      case 'admin':
        return <Badge variant="error">Admin</Badge>;
      case 'agency':
        return <Badge variant="default">Agency</Badge>;
      default:
        return <Badge variant="default">{userRole}</Badge>;
    }
  };

  const getRoleIcon = (userRole: string) => {
    switch (userRole) {
      case 'talent':
        return <User className="w-8 h-8 text-blue-500" />;
      case 'employer':
        return <Building2 className="w-8 h-8 text-green-500" />;
      case 'lawyer':
        return <Scale className="w-8 h-8 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-8 h-8 text-red-500" />;
      default:
        return <User className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/users"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-600">{profile.email}</p>
        </div>
        {getRoleBadge(profile.role)}
      </div>

      {/* Main Profile Card */}
      <Card>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || ''}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                getRoleIcon(profile.role)
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {profile.full_name || 'No name provided'}
              </h2>
              {profile.headline && (
                <p className="text-gray-600 mt-1">{profile.headline}</p>
              )}
              
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </span>
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(profile.created_at)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {profile.is_verified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    <XCircle className="w-4 h-4" />
                    Not verified
                  </span>
                )}
                {profile.onboarding_completed && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Onboarding complete
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle>Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role-specific data */}
      {profile.role === 'talent' && additionalData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Talent Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {additionalData.current_job_title && (
                <div>
                  <p className="text-sm text-gray-500">Current Job Title</p>
                  <p className="font-medium text-gray-900">{additionalData.current_job_title}</p>
                </div>
              )}
              {additionalData.current_employer && (
                <div>
                  <p className="text-sm text-gray-500">Current Employer</p>
                  <p className="font-medium text-gray-900">{additionalData.current_employer}</p>
                </div>
              )}
              {additionalData.years_experience && (
                <div>
                  <p className="text-sm text-gray-500">Years of Experience</p>
                  <p className="font-medium text-gray-900">{additionalData.years_experience} years</p>
                </div>
              )}
              {additionalData.o1_score !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">O-1 Score</p>
                  <p className="font-medium text-gray-900">{additionalData.o1_score}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {profile.role === 'employer' && additionalData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Employer Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {additionalData.company_name && (
                <div>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="font-medium text-gray-900">{additionalData.company_name}</p>
                </div>
              )}
              {additionalData.industry && (
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-medium text-gray-900">{additionalData.industry}</p>
                </div>
              )}
              {additionalData.company_size && (
                <div>
                  <p className="text-sm text-gray-500">Company Size</p>
                  <p className="font-medium text-gray-900">{additionalData.company_size}</p>
                </div>
              )}
              {additionalData.company_website && (
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <a 
                    href={additionalData.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {additionalData.company_website}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {profile.role === 'lawyer' && additionalData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Lawyer Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {additionalData.law_firm && (
                <div>
                  <p className="text-sm text-gray-500">Law Firm</p>
                  <p className="font-medium text-gray-900">{additionalData.law_firm}</p>
                </div>
              )}
              {additionalData.bar_number && (
                <div>
                  <p className="text-sm text-gray-500">Bar Number</p>
                  <p className="font-medium text-gray-900">{additionalData.bar_number}</p>
                </div>
              )}
              {additionalData.years_experience && (
                <div>
                  <p className="text-sm text-gray-500">Years of Experience</p>
                  <p className="font-medium text-gray-900">{additionalData.years_experience} years</p>
                </div>
              )}
              {additionalData.practice_areas && additionalData.practice_areas.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Practice Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {additionalData.practice_areas.map((area: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Change Role */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Change User Role</p>
            <ChangeRoleButton userId={profile.id} currentRole={profile.role} />
          </div>

          {/* Other Actions */}
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">Other Actions</p>
            <div className="flex flex-wrap gap-2">
              <button
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Send Password Reset
              </button>
              {!profile.is_verified && (
                <button
                  className="px-4 py-2 text-sm border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Verify User
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <div>
              <span className="font-medium">Created:</span> {formatDate(profile.created_at)}
            </div>
            <div>
              <span className="font-medium">Updated:</span> {formatDate(profile.updated_at)}
            </div>
            <div>
              <span className="font-medium">User ID:</span> 
              <code className="ml-1 px-2 py-0.5 bg-gray-100 rounded text-xs">{profile.id}</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}