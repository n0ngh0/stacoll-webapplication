fetch('http://localhost:8000/api/export/pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ html: '<h1>test</h1>' })
}).then(async r => {
  console.log('Status:', r.status);
  console.log('Headers:', r.headers);
  if(!r.ok) console.log('Error:', await r.text());
  else console.log('OK, bytes:', (await r.arrayBuffer()).byteLength);
}).catch(e => console.error('Fetch Error:', e.message));
