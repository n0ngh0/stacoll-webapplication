const largeString = 'a'.repeat(60 * 1024 * 1024);
fetch('http://localhost:8001/test', {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: largeString
}).then(async r => {
  console.log('Status:', r.status);
  console.log('Response:', await r.text());
}).catch(e => console.error('Fetch Error:', e.message));
