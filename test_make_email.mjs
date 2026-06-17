import fetch from 'node-fetch';

async function test() {
  const url = "https://hardhat-solutions.com/api/receipts-inbound";
  // We'll test our local endpoint first 
  
  const payload = {
    from: "jake@schlemmer-electric.com",
    subject: "FWD: Your order from CED",
    text: "Here is the invoice for the Johnson job.",
    to: "bbizjgfdgr7hc1s9p1y8q2qfn7le3h81@hook.us2.make.com",
    // We'll pass a dummy image URL to simulate Make uploading to Supabase
    imageUrl: "https://images.unsplash.com/photo-1621538350106-9043513b6329?q=80&w=1000&auto=format&fit=crop" // Dummy receipt-ish image just so vision doesn't crash
  };
  
  console.log("Sending...");
  const res = await fetch("http://localhost:3001/api/receipts-inbound", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  console.log(data);
}
test();
