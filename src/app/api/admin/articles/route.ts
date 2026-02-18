// src/app/api/admin/articles/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin" ? user : null;
}

/* ------------------------------------------------------------------ */
/*  GET — list articles OR fetch single article by id                  */
/* ------------------------------------------------------------------ */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  if (!(await verifyAdmin(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get("id");

  // Single article fetch
  if (articleId) {
    const { data: article, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", articleId)
      .single();

    if (error || !article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ article });
  }

  // List articles
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("articles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: articles, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    articles: articles || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

/* ------------------------------------------------------------------ */
/*  POST — create a new article                                        */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!(await verifyAdmin(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();

    const { title, slug, content, visa_type, content_type } = body;

    if (!title || !slug || !content || !visa_type || !content_type) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, slug, content, visa_type, content_type",
        },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "An article with this slug already exists" },
        { status: 409 }
      );
    }

    const insertData: Record<string, unknown> = {
      title,
      slug,
      meta_description: body.meta_description || null,
      content,
      excerpt: body.excerpt || null,
      visa_type,
      content_type,
      target_audience: body.target_audience || "Both",
      topic: body.topic || null,
      tags: body.tags || [],
      featured_image_url: body.featured_image_url || null,
      reading_time: body.reading_time || "5 min read",
      google_doc_url: body.google_doc_url || null,
      status: body.status || "draft",
      published_at:
        body.status === "published" ? new Date().toISOString() : null,
    };

    const { data: article, error } = await supabase
      .from("articles")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, article });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to create article";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH — update an existing article                                 */
/* ------------------------------------------------------------------ */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  if (!(await verifyAdmin(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    // If publishing for the first time, set published_at
    if (updates.status === "published") {
      const { data: current } = await supabase
        .from("articles")
        .select("published_at")
        .eq("id", id)
        .single();

      if (!current?.published_at) {
        updates.published_at = new Date().toISOString();
      }
    }

    // If slug changed, check uniqueness
    if (updates.slug) {
      const { data: existing } = await supabase
        .from("articles")
        .select("id")
        .eq("slug", updates.slug)
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: "An article with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const { data: article, error } = await supabase
      .from("articles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, article });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to update article";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE — delete an article by id                                   */
/* ------------------------------------------------------------------ */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  if (!(await verifyAdmin(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Article ID is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}