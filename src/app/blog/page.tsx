import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Immigration Insights | O1DMatch',
  description: 'Expert guides, news, and insights on O-1, EB-1A, and EB-2 NIW visas for exceptional talent.',
};

export const revalidate = 60; // Revalidate every 60 seconds

// Visa type badge colors
const visaTypeColors: Record<string, string> = {
  'O-1A': 'bg-blue-100 text-blue-800',
  'O-1B': 'bg-purple-100 text-purple-800',
  'EB-1A': 'bg-green-100 text-green-800',
  'EB-2 NIW': 'bg-orange-100 text-orange-800',
};

// Audience badge colors
const audienceColors: Record<string, string> = {
  'Talent': 'bg-cyan-100 text-cyan-800',
  'Employer': 'bg-emerald-100 text-emerald-800',
  'Both': 'bg-gray-100 text-gray-800',
};

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  visa_type: string;
  content_type: string;
  target_audience: string;
  featured_image_url: string | null;
  reading_time: string;
  published_at: string;
}

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, visa_type, content_type, target_audience, featured_image_url, reading_time, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Immigration Insights</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Expert guides, industry news, and practical advice for O-1, EB-1A, and EB-2 NIW visa candidates and employers.
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {!articles || articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No articles published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article: Article) => (
              <article
                key={article.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Featured Image */}
                {article.featured_image_url ? (
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold opacity-30">
                      {article.visa_type}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${visaTypeColors[article.visa_type] || 'bg-gray-100 text-gray-800'}`}>
                      {article.visa_type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${audienceColors[article.target_audience] || 'bg-gray-100 text-gray-800'}`}>
                      {article.target_audience === 'Both' ? 'All Readers' : `For ${article.target_audience}s`}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                    <Link
                      href={`/blog/${article.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{article.reading_time}</span>
                    <span>{new Date(article.published_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Visa Journey?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            O1DMatch connects exceptional talent with U.S. employers. Build your profile, get matched, and let us help streamline your immigration process.
          </p>
          <Link
            href="/waitlist"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Join the Waitlist
          </Link>
        </div>
      </div>
    </div>
  );
}
