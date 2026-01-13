const fetch = global.fetch || require('node-fetch');

async function checkHealth() {
  try {
    console.log('Checking health...');
    const res = await fetch('https://american-beneficiary-z5juf.ondigitalocean.app/api/health');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (e) {
    console.error(e);
  }
}
checkHealth();
