import dotenv from 'dotenv';
dotenv.config({ path: '/home/jakob/.openclaw/workspace/office-angel-web/.env.production.local' });
console.log("VAPI_ASSISTANT_ID from ENV:");
console.log("NEXT_PUBLIC_VAPI_ASSISTANT_ID:", process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID);
console.log("VAPI_ASSISTANT_ID:", process.env.VAPI_ASSISTANT_ID);
