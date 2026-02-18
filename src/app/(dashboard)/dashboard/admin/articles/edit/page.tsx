// src/app/(dashboard)/dashboard/admin/articles/edit/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Code,
  EyeIcon,
  Archive,
} from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";

const VISA_TYPES = [
  { value: "o1a", label: "O-1A (Sciences, Business, Education, Athletics)" },
  { value: "o1b", label: "O-1B (Arts, Motion Picture, Television)" },
  { value: "eb1a", label: "EB-1A (Extraordinary Ability)" },
  { value: "eb1b", label: "EB-1B (Outstanding Researcher)" },
  { value: "eb2-niw", label: "EB-2 NIW (National Interest Waiver)" },
  { value: "general", label: "General (All Visa Types)" },
];

const CONTENT_TYPES = [
  { value: "blog-post", label: "Blog Post" },
  { value: "guide", label: "Guide" },
  { value: "case-study", label: "Case Study" },
  { value: "news", label: "News" },
  { value: "faq", label: "FAQ" },
  { value: "resource", label: "Resource" },
];

const AUDIENCES = [
  { value: "Both", label: "Both (Talent & Employers)" },
  { value: "Talent", label: "Talent" },
  { value: "Employer", label: "Employers" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function EditArticlePage() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [visaType, setVisaType] = useState("general");
  const [contentType, setContentType] = useState("blog-post");
  const [targetAudience, setTargetAudience] = useState("Both");
  const [topic, setTopic] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [readingTime, setReadingTime] = useState("5 min read");
  const [googleDocUrl, setGoogleDocUrl] = useState("");
  const [articleStatus, setArticleStatus] = useState("draft");
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const fetchArticle = useCallback(async () => {
    if (!articleId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles?id=${articleId}`);
      const data = await res.json();

      if (!res.ok || !data.article) {
        setError("Article not found");
        return;
      }

      const a = data.article;
      setTitle(a.title || "");
      setSlug(a.slug || "");
      setMetaDescription(a.meta_description || "");
      setContent(a.content || "");
      setExcerpt(a.excerpt || "");
      setVisaType(a.visa_type || "general");
      setContentType(a.content_type || "blog-post");
      setTargetAudience(a.target_audience || "Both");
      setTopic(a.topic || "");
      setTags(a.tags || []);
      setFeaturedImageUrl(a.featured_image_url || "");
      setReadingTime(a.reading_time || "5 min read");
      setGoogleDocUrl(a.google_doc_url || "");
      setArticleStatus(a.status || "draft");
      setPublishedAt(a.published_at || null);
      setCreatedAt(a.created_at || null);
    } catch {
      setError("Failed to load article");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const estimateReadingTime = () => {
    const text = content.replace(/<[^>]*>/g, " ");
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setReadingTime(`${minutes} min read`);
  };

  const wordCount = () => {
    const text = content.replace(/<[^>]*>/g, " ");
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleSave = async (newStatus?: string) => {
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required");
      return;
    }
    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        id: articleId,
        title: title.trim(),
        slug: slug.trim(),
        meta_description: metaDescription.trim() || null,
        content: content.trim(),
        excerpt: excerpt.trim() || null,
        visa_type: visaType,
        content_type: contentType,
        target_audience: targetAudience,
        topic: topic.trim() || null,
        tags,
        featured_image_url: featuredImageUrl.trim() || null,
        reading_time: readingTime,
        google_doc_url: googleDocUrl.trim() || null,
      };

      if (newStatus) {
        payload.status = newStatus;
      }

      const res = await fetch("/api/admin/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update article");
        return;
      }

      if (newStatus) {
        setArticleStatus(newStatus);
        if (newStatus === "published" && data.article?.published_at) {
          setPublishedAt(data.article.published_at);
        }
      }

      setSuccess("Article updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!articleId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">No article ID provided.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-500">Loading article...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin/articles"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                  articleStatus === "published"
                    ? "bg-green-100 text-green-700"
                    : articleStatus === "archived"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {articleStatus}
              </span>
              {createdAt && (
                <span className="text-xs text-gray-400">
                  Created {new Date(createdAt).toLocaleDateString()}
                </span>
              )}
              {publishedAt && (
                <span className="text-xs text-gray-400">
                  &middot; Published{" "}
                  {new Date(publishedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Guide to O-1A Visa Petition"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="text-sm text-gray-400 mr-1">/blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="complete-guide-o1a-visa-petition"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Brief description for search engines (150-160 chars recommended)"
                rows={2}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {metaDescription.length}/200
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary shown in article listings..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Content with HTML toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Content <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    (HTML supported)
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={estimateReadingTime}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Estimate reading time
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                      showPreview
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {showPreview ? (
                      <>
                        <Code className="w-3 h-3" />
                        Editor
                      </>
                    ) : (
                      <>
                        <EyeIcon className="w-3 h-3" />
                        Preview
                      </>
                    )}
                  </button>
                </div>
              </div>

              {showPreview ? (
                <div
                  className="w-full min-h-[400px] px-4 py-3 border border-gray-200 rounded-lg text-sm bg-white overflow-auto prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write or paste HTML content here..."
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono leading-relaxed"
                  spellCheck={false}
                />
              )}
              <p className="text-xs text-gray-400 mt-1">
                {wordCount()} words &middot; Paste HTML content directly into
                the editor
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classification */}
      <Card>
        <CardHeader>
          <CardTitle>Classification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visa Type <span className="text-red-500">*</span>
              </label>
              <select
                value={visaType}
                onChange={(e) => setVisaType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {VISA_TYPES.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Type <span className="text-red-500">*</span>
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {CONTENT_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {AUDIENCES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Petition Strategy, Immigration News"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Media & Links */}
      <Card>
        <CardHeader>
          <CardTitle>Media & Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {/* Featured Image Upload */}
            <ImageUpload
              value={featuredImageUrl}
              onChange={setFeaturedImageUrl}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reading Time
                </label>
                <input
                  type="text"
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  placeholder="5 min read"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Doc URL
                </label>
                <input
                  type="url"
                  value={googleDocUrl}
                  onChange={(e) => setGoogleDocUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pb-8">
        <Link
          href="/dashboard/admin/articles"
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </Link>

        <div className="flex items-center gap-3">
          {articleStatus === "published" && (
            <button
              onClick={() => handleSave("archived")}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
          )}

          {articleStatus === "published" && (
            <button
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Unpublish
            </button>
          )}

          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>

          {articleStatus !== "published" && (
            <button
              onClick={() => handleSave("published")}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}