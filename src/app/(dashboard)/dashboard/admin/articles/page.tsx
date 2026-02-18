// src/app/(dashboard)/dashboard/admin/articles/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  FileText,
  Plus,
  Trash2,
  Eye,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
  visa_type: string;
  content_type: string;
  target_audience: string | null;
  status: string;
  reading_time: string | null;
  published_at: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-yellow-100 text-yellow-700",
};

const VISA_LABELS: Record<string, string> = {
  "o1a": "O-1A",
  "o1b": "O-1B",
  "eb1a": "EB-1A",
  "eb1b": "EB-1B",
  "eb2-niw": "EB-2 NIW",
  "general": "General",
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/articles?${params}`);
      const data = await res.json();

      if (res.ok) {
        setArticles(data.articles);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/articles?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchArticles();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch {
      alert("Failed to delete article");
    } finally {
      setDeleting(null);
    }
  };

  // Client-side search filter
  const filtered = searchQuery
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-1">
            Manage blog posts and content ({total} total)
          </p>
        </div>
        <Link
          href="/dashboard/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="ml-2 text-gray-500">Loading articles...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No articles found</p>
              <Link
                href="/dashboard/admin/articles/new"
                className="inline-flex items-center gap-2 mt-4 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                Create your first article
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-3 font-medium text-gray-600">
                        Title
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">
                        Visa Type
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">
                        Type
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">
                        Audience
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600">
                        Date
                      </th>
                      <th className="text-right py-3 px-3 font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((article) => (
                      <tr
                        key={article.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-xs">
                              {article.title}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-xs">
                              /{article.slug}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          {VISA_LABELS[article.visa_type] || article.visa_type}
                        </td>
                        <td className="py-3 px-3 text-gray-600 capitalize">
                          {article.content_type?.replace(/-/g, " ")}
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          {article.target_audience || "Both"}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              STATUS_COLORS[article.status] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {article.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(article.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/dashboard/admin/articles/edit?id=${article.id}`}
                              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            {article.status === "published" && (
                              <Link
                                href={`/blog/${article.slug}`}
                                target="_blank"
                                className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                                title="View on site"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            )}
                            <button
                              onClick={() =>
                                handleDelete(article.id, article.title)
                              }
                              disabled={deleting === article.id}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deleting === article.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filtered.map((article) => (
                  <div key={article.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {article.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          /{article.slug}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              STATUS_COLORS[article.status] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {article.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {VISA_LABELS[article.visa_type] ||
                              article.visa_type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(article.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Link
                          href={`/dashboard/admin/articles/edit?id=${article.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(article.id, article.title)
                          }
                          disabled={deleting === article.id}
                          className="p-1.5 text-gray-400 hover:text-red-600"
                        >
                          {deleting === article.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}