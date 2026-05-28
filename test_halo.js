fetch('http://localhost:3000/api/halo', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({messages: [{role: 'user', content: 'did the permit clear'}]})
}).then(r => r.json()).then(console.log).catch(console.error);
