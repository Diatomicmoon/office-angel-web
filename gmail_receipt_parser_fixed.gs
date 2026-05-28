// Office Angel - Gmail Ingestion Script (FIXED)
// Paste this into script.google.com

const SUPABASE_URL = "https://ztknhbilfergfwoxjzvb.supabase.co";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY"; 
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"; 

function processOfficeAngelEmails() {
  const threads = GmailApp.search('is:unread (from:homedepot.com OR from:vikingelectric.com OR subject:"receipt" OR subject:"invoice")');
  
  if (threads.length === 0) {
    Logger.log("No new receipts found.");
    return;
  }

  for (let i = 0; i < threads.length; i++) {
    const messages = threads[i].getMessages();
    
    for (let j = 0; j < messages.length; j++) {
      const msg = messages[j];
      
      if (msg.isUnread()) {
        const subject = msg.getSubject();
        const sender = msg.getFrom();
        const body = msg.getPlainBody();
        
        Logger.log("Processing: " + subject + " from " + sender);
        
        // Step 2: Send to OpenAI
        const extractedData = extractDataWithAI(sender, subject, body);
        
        if (extractedData) {
          // Step 3: Push to Supabase
          saveToSupabase(extractedData, sender);
        } else {
          Logger.log("⚠️ AI failed to extract data. Marking as read anyway to prevent infinite loops.");
        }
        
        // 🚨 CRITICAL FIX: Always mark as read, even if extraction fails!
        msg.markRead();
      }
    }
  }
}

function extractDataWithAI(sender, subject, body) {
  // Truncate body to prevent massive token usage on long threads
  const truncatedBody = body.substring(0, 10000); 

  const prompt = `
  You are an AI assistant for an electrical contractor. Extract the following from this email receipt:
  1. total_amount (number)
  2. supplier_name (guess based on sender/text)
  3. line_items (array of objects with 'item', 'qty', 'cost')
  
  Return ONLY valid JSON.
  
  Sender: ${sender}
  Subject: ${subject}
  Body: ${truncatedBody}
  `;

  const payload = {
    "model": "gpt-4o-mini", 
    "messages": [{"role": "user", "content": prompt}],
    "response_format": { "type": "json_object" }
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "headers": {
      "Authorization": "Bearer " + OPENAI_API_KEY
    },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    const response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", options);
    const json = JSON.parse(response.getContentText());
    
    if (json.choices && json.choices.length > 0) {
      const parsedContent = JSON.parse(json.choices[0].message.content);
      Logger.log("AI Extraction Success: " + JSON.stringify(parsedContent));
      return parsedContent;
    }
  } catch (e) {
    Logger.log("OpenAI Error: " + e.toString());
  }
  return null;
}

function saveToSupabase(data, sender) {
  const payload = {
    "supplier_name": data.supplier_name || sender,
    "total_amount": data.total_amount || 0,
    "line_items": data.line_items || [],
    "status": "Action Required"
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "headers": {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Prefer": "return=minimal"
    },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    const response = UrlFetchApp.fetch(SUPABASE_URL + "/rest/v1/receipts", options);
    Logger.log("Supabase Insert Status: " + response.getResponseCode());
  } catch (e) {
    Logger.log("Supabase Error: " + e.toString());
  }
}
