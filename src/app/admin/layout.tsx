import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">O1DMatch</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                Admin
              </span>
            </div>
            <nav className="flex gap-6">
              <a href="/admin" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </a>
              <a href="/admin/documents" className="text-gray-600 hover:text-gray-900">
                Documents
              </a>
              <a href="/admin/users" className="text-gray-600 hover:text-gray-900">
                Users
              </a>
              <a href="/admin/jobs" className="text-gray-600 hover:text-gray-900">
                Jobs
              </a>
              <a href="/admin/lawyers" className="text-gray-600 hover:text-gray-900">
                Lawyers
              </a>
            </nav>
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
