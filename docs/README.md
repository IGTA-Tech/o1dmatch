# O1DMatch Documentation

## Content Maker Integration

The O1DMatch Content Maker v2.0 is a Google Apps Script system that automatically generates SEO-optimized immigration content using:
- Claude AI for content generation
- RAG (Retrieval-Augmented Generation) from competitor analysis
- DALL-E for featured images
- News API for current events integration

### Files in this folder:

1. **CONTENT_MAKER_INTEGRATION.md** - Complete integration plan for connecting the Content Maker to the website
2. **CONTENT_MAKER_APPS_SCRIPT_UPDATE.js** - Code to add to Google Apps Script for webhook publishing

### Quick Start

1. Run the Supabase migration: `supabase/migrations/20260124_add_articles_table.sql`
2. Add environment variable: `CONTENT_MAKER_WEBHOOK_SECRET`
3. Deploy the blog pages at `/blog` and `/blog/[slug]`
4. Update Google Apps Script with webhook function
5. Add webhook config to Google Sheets Config tab

### Google Sheets Link

Content Maker Spreadsheet: https://docs.google.com/spreadsheets/d/1ll0CitpqZEqg8OOlKUQSNisYxLcVR6xRtB35FKAy0bo/edit

### Architecture

```
Google Apps Script (Content Generation)
    ↓
POST /api/articles/webhook (with auth)
    ↓
Supabase articles table
    ↓
Next.js blog pages (SSR with revalidation)
```
