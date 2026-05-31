const largeString = 'a'.repeat(60 * 1024 * 1024); // 60MB
fetch('http://localhost:8000/api/export/pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain', 'Origin': 'http://localhost:3000' },
  body: largeString
}).then(async r => {
  console.log('Status:', r.status);
  console.log('CORS Header:', r.headers.get('Access-Control-Allow-Origin'));
}).catch(e => console.error('Fetch Error:', e.message));
