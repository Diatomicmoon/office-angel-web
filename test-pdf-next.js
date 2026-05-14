const pdf = require('pdf-parse');
async function run() {
  const data = await pdf(Buffer.from("dummy"));
  console.log(data);
}
run().catch(console.error);
