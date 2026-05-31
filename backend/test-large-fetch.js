const largeString = 'a'.repeat(2 * 1024 * 1024); // 2MB
fetch('http://localhost:8000/api/export/pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: largeString
}).then(async r => {
  console.log('Status:', r.status);
}).catch(e => console.error('Fetch Error:', e.message));
