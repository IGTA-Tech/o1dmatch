import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Props {
  params: { slug: string };
}

// Visa type badge colors
const visaTypeColors: Record<string, string> = {
  'O-1A': 'bg-blue-100 text-blue-800',
  'O-1B': 'bg-purple-100 text-purple-800',
  'EB-1A': 'bg-green-100 text-green-800',
  'EB-2 NIW': 'bg-orange-100 text-orange-800',
};

// Content type badge colors
const contentTypeColors: Record<string, string> = {
  'Educational': 'bg-indigo-100 text-indigo-800',
  'Talent-Focused': 'bg-cyan-100 text-cyan-800',
  'Employer-Focused': 'bg-emerald-100 text-emerald-800',
  'Competitive': 'bg-red-100 text-red-800',
  'News Commentary': 'bg-yellow-100 text-yellow-800',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: article } = await supabase
    .from('articles')
    .select('title, meta_description, featured_image_url')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  if (!article) {
    return { title: 'Article Not Found | O1DMatch' };
  }

  return {
    title: `${article.title} | O1DMatch`,
    description: article.meta_description || undefined,
    openGraph: {
      title: article.title,
      description: article.meta_description || undefined,
      images: article.featured_image_url ? [article.featured_image_url] : undefined,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.meta_description || undefined,
      images: article.featured_image_url ? [article.featured_image_url] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  if (error || !article) {
    notFound();
  }

  // Fetch related articles (same visa type, different article)
  const { data: relatedArticles } = await supabase
    .from('articles')
    .select('id, title, slug, visa_type, reading_time')
    .eq('status', 'published')
    .eq('visa_type', article.visa_type)
    .neq('id', article.id)
    .limit(3);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b mt-16">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{article.visa_type}</span>
          </nav>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-8">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${visaTypeColors[article.visa_type] || 'bg-gray-100 text-gray-800'}`}>
              {article.visa_type}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${contentTypeColors[article.content_type] || 'bg-gray-100 text-gray-800'}`}>
              {article.content_type}
            </span>
            <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
              For: {article.target_audience}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Meta Description */}
          {article.meta_description && (
            <p className="text-xl text-gray-600 mb-6">
              {article.meta_description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500 pb-6 border-b">
            <span>{article.reading_time}</span>
            <span>|</span>
            <span>Published {new Date(article.published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
        </header>

        {/* Featured Image */}
        {article.featured_image_url && (
          <figure className="mb-10">
            <img
              src={article.featured_image_url}
              alt={article.title}
              className="w-full rounded-xl shadow-lg"
            />
          </figure>
        )}

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:text-gray-900 prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900
            prose-ul:my-6 prose-li:my-2
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA Box */}
        <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Start Your {article.visa_type} Journey?
          </h3>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            O1DMatch connects exceptional talent with U.S. employers ready to sponsor visas. Join our platform to build your case.
          </p>
          <Link
            href="/waitlist"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Join the Waitlist
          </Link>
        </div>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="block p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${visaTypeColors[related.visa_type] || 'bg-gray-100 text-gray-800'}`}>
                    {related.visa_type}
                  </span>
                  <h4 className="mt-3 font-semibold text-gray-900 line-clamp-2">
                    {related.title}
                  </h4>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {related.reading_time}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Back to Blog */}
      <div className="border-t">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Articles
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O1</span>
              </div>
              <span className="font-semibold text-white">O1DMatch</span>
            </div>
            <p className="text-gray-400 text-sm text-center">
              Connecting exceptional talent with opportunities for O-1 visa sponsorship.
            </p>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} O1DMatch. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}