// ===================================================================
// EPass — Google Apps Script for Auto-Verifying UPI Payments
// ===================================================================
// 
// HOW TO SET UP:
// 1. Go to https://script.google.com and create a new project
// 2. Paste this entire script
// 3. Update the CONFIG section below with your app's URL and webhook secret
// 4. Click "Deploy" → "New deployment" → Type: "Web app" → Execute as: "Me" → Deploy
// 5. Create a time-driven trigger:
//    - Click the clock icon (Triggers) in the left sidebar
//    - Click "Add Trigger"
//    - Function: checkForPayments
//    - Event source: Time-driven
//    - Type: Minutes timer
//    - Interval: Every 1 minute (or 5 minutes)
//    - Click Save
//
// HOW IT WORKS:
// - Every 1-5 minutes, this script checks your Gmail for UPI payment notifications
// - It extracts the UTR number and amount from the email
// - It sends the data to your EPass webhook, which auto-approves matching passes
// - Processed emails are labeled "EPass/Processed" so they won't be checked again
//
// SUPPORTED BANKS:
// - Google Pay notifications
// - PhonePe notifications
// - Bank credit SMS-to-email alerts
// - Most Indian bank email alerts
// ===================================================================

// ========== CONFIG — UPDATE THESE ==========
const CONFIG = {
  // Your deployed EPass app URL (use your actual domain when deployed)
  WEBHOOK_URL: "http://localhost:3000/api/verify-payment",  // Change to your production URL
  
  // Must match WEBHOOK_SECRET in your .env.local
  WEBHOOK_SECRET: "epass-webhook-secret-change-me",
  
  // Gmail label for processed emails
  PROCESSED_LABEL: "EPass/Processed",
  
  // How many minutes back to search (should be >= your trigger interval)
  SEARCH_MINUTES: 10,
};
// ============================================

function checkForPayments() {
  const label = getOrCreateLabel(CONFIG.PROCESSED_LABEL);
  const searchMinutes = CONFIG.SEARCH_MINUTES;
  
  // Search for recent payment-related emails not yet processed
  const query = `newer_than:${searchMinutes}m (subject:"credited" OR subject:"received" OR subject:"payment" OR subject:"UPI" OR from:alerts@phonepe.com OR from:noreply@googlepaytez.com) -label:${CONFIG.PROCESSED_LABEL.replace("/", "-")}`;
  
  const threads = GmailApp.search(query, 0, 20);
  
  for (const thread of threads) {
    const messages = thread.getMessages();
    
    for (const message of messages) {
      const body = message.getPlainBody() || message.getBody();
      const subject = message.getSubject();
      const fullText = subject + " " + body;
      
      // Try to extract UTR number (12-digit number typically)
      const utrMatch = fullText.match(/(?:UTR|UPI Ref|Ref\.?\s*No\.?|Transaction ID|UPI Txn ID|Reference)\s*[:\s]?\s*(\d{12,})/i);
      if (!utrMatch) {
        // Try standalone 12-digit number pattern common in bank alerts
        const altMatch = fullText.match(/\b(\d{12})\b/);
        if (!altMatch) continue;
        var utr = altMatch[1];
      } else {
        var utr = utrMatch[1];
      }
      
      // Try to extract amount
      const amountMatch = fullText.match(/(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{2})?)/i);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : null;
      
      // Try to extract sender info
      const senderMatch = fullText.match(/(?:from|by|sender|VPA)\s*[:\s]?\s*([a-zA-Z0-9._@-]+)/i);
      const senderInfo = senderMatch ? senderMatch[1] : null;
      
      // Send to webhook
      try {
        const response = UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, {
          method: "POST",
          contentType: "application/json",
          payload: JSON.stringify({
            utr_number: utr,
            amount: amount,
            sender_info: senderInfo,
            secret: CONFIG.WEBHOOK_SECRET,
          }),
          muteHttpExceptions: true,
        });
        
        Logger.log(`UTR: ${utr}, Amount: ${amount}, Response: ${response.getContentText()}`);
      } catch (e) {
        Logger.log(`Error sending webhook for UTR ${utr}: ${e.message}`);
      }
    }
    
    // Mark thread as processed
    thread.addLabel(label);
  }
}

function getOrCreateLabel(name) {
  let label = GmailApp.getUserLabelByName(name);
  if (!label) {
    label = GmailApp.createLabel(name);
  }
  return label;
}

// Manual test function — run this to verify your setup works
function testWebhook() {
  const response = UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify({
      utr_number: "TEST123456789",
      amount: 100,
      sender_info: "test@upi",
      secret: CONFIG.WEBHOOK_SECRET,
    }),
    muteHttpExceptions: true,
  });
  
  Logger.log("Test response: " + response.getContentText());
}
