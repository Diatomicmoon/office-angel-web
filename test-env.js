const { execSync } = require('child_process');
try {
  execSync('npx vercel env add OPENAI_API_KEY production', {
    input: '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\n',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  console.log("Key added to production");
} catch (e) {
  console.error("Failed to add key to production:", e.stderr ? e.stderr.toString() : e.message);
}
