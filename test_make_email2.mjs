import fetch from 'node-fetch';

async function test() {
  const payload = {
    from: "jake@schlemmer-electric.com",
    subject: "FWD: Your order from CED",
    text: "Here is the invoice for the Johnson job.",
    to: "bbizjgfdgr7hc1s9p1y8q2qfn7le3h81@hook.us2.make.com",
    // We'll pass a dummy image URL to simulate Make uploading to Supabase
    imageUrl: "https://images.unsplash.com/photo-1621538350106-9043513b6329?q=80&w=1000&auto=format&fit=crop" 
  };
  
  console.log("Sending to localhost:3000 (Office Angel Dev Server)...");
  const res = await fetch("http://localhost:3000/api/receipts-inbound", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  console.log(data);
}
test();
