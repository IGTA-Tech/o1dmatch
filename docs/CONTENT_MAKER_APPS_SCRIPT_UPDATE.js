// ============================================================
// O1DMatch Content Maker v2.0 - Website Webhook Integration
// Add this code to your existing Code_v2.0_FIXED.gs
// ============================================================

// ============================================================
// SECTION: WEBHOOK PUBLISHING TO WEBSITE
// ============================================================

/**
 * Publishes article to O1DMatch website via webhook
 * @param {Object} articleData - Article data from generation
 * @param {Object} generatedContent - Full generated content
 * @returns {Object} - Webhook response
 */
function publishToWebsite(articleData, generatedContent) {
  const webhookUrl = getConfig('WEBSITE_WEBHOOK_URL');
  const webhookSecret = getConfig('WEBSITE_WEBHOOK_SECRET');
  const autoPublish = getConfig('AUTO_PUBLISH_TO_WEBSITE') === 'TRUE';

  if (!webhookUrl || !webhookSecret) {
    logMessage('Website webhook not configured, skipping publish', 'WARN', 'publishToWebsite');
    return null;
  }

  const payload = {
    title: generatedContent.title,
    content: generatedContent.content, // HTML content
    metaDescription: generatedContent.metaDescription,
    excerpt: generatedContent.metaDescription,
    visaType: articleData.visaType,
    contentType: articleData.contentType,
    targetAudience: articleData.targetAudience || 'Both',
    topic: articleData.topic,
    tags: generatedContent.suggestedTags || [],
    imageUrl: articleData.imageUrl,
    readingTime: generatedContent.readingTime || '5 min read',
    docUrl: articleData.docUrl,
    newsIntegration: articleData.newsIntegration,
    ragIntegration: articleData.ragIntegration,
    backlinkReport: articleData.backlinkReport,
    autoPublish: autoPublish
  };

  try {
    const response = UrlFetchApp.fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${webhookSecret}`
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode === 200 || responseCode === 201) {
      const result = JSON.parse(responseText);
      logMessage(`Published to website: ${result.article.url}`, 'INFO', 'publishToWebsite');
      return result;
    } else {
      logMessage(`Website publish failed (${responseCode}): ${responseText}`, 'ERROR', 'publishToWebsite');
      return null;
    }

  } catch (e) {
    logMessage(`Website publish error: ${e.message}`, 'ERROR', 'publishToWebsite');
    return null;
  }
}

/**
 * Test the website webhook connection
 */
function testWebsiteWebhook() {
  const webhookUrl = getConfig('WEBSITE_WEBHOOK_URL');
  const webhookSecret = getConfig('WEBSITE_WEBHOOK_SECRET');

  console.log('=== Testing Website Webhook ===');
  console.log(`Webhook URL: ${webhookUrl || 'NOT SET'}`);
  console.log(`Webhook Secret: ${webhookSecret ? 'SET (hidden)' : 'NOT SET'}`);

  if (!webhookUrl || !webhookSecret) {
    console.log('ERROR: Webhook not configured. Add these to Config sheet:');
    console.log('  - WEBSITE_WEBHOOK_URL');
    console.log('  - WEBSITE_WEBHOOK_SECRET');
    console.log('  - AUTO_PUBLISH_TO_WEBSITE (TRUE or FALSE)');
    return;
  }

  // Test with GET request (health check)
  try {
    const response = UrlFetchApp.fetch(webhookUrl, {
      method: 'GET',
      muteHttpExceptions: true
    });

    console.log(`Health check response: ${response.getResponseCode()}`);
    console.log(response.getContentText());
  } catch (e) {
    console.log(`Health check failed: ${e.message}`);
  }
}


// ============================================================
// UPDATE: Modify generateDailyContent() to call webhook
// ============================================================

/*
In your generateDailyContent() function, add this after creating the doc:

    // ... existing code ...

    // 12. Archive
    const articleData = {
      title: generatedContent.title,
      // ... existing fields ...
    };

    archiveArticle(articleData);

    // ADD THIS: 13. Publish to website
    const websiteResult = publishToWebsite(articleData, generatedContent);
    if (websiteResult) {
      articleData.websiteUrl = websiteResult.article.url;
      logMessage(`Article published to website: ${articleData.websiteUrl}`, 'INFO', 'generateDailyContent');
    }

    // 14. Send notification (now includes website URL if published)
    sendEmailNotification(articleData);

    // ... rest of function ...
*/


// ============================================================
// CONFIG SHEET ADDITIONS
// ============================================================

/*
Add these rows to your Config sheet:

| Key                      | Value                                               |
|--------------------------|-----------------------------------------------------|
| WEBSITE_WEBHOOK_URL      | https://www.o1dmatch.com/api/articles/webhook       |
| WEBSITE_WEBHOOK_SECRET   | <your-secure-random-string>                         |
| AUTO_PUBLISH_TO_WEBSITE  | TRUE                                                |

Generate a secure random string for WEBSITE_WEBHOOK_SECRET:
- Use 32+ characters
- Mix of letters, numbers, symbols
- Example: openssl rand -base64 32
*/
