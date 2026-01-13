// using native fetch

const API_URL = 'https://american-beneficiary-z5juf.ondigitalocean.app/api/applications';

const testPayload = {
  firstName: "API_TEST",
  lastName: "USER",
  phone: "5550009999",
  age: 45,
  state: "FL",
  id: `TEST-${Date.now()}`,
  leadType: "prospect"
};

console.log('Testing API POST to:', API_URL);
console.log('Payload:', testPayload);

async function runTest() {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testPayload)
    });

    console.log('Status Code:', response.status);
    
    const text = await response.text();
    console.log('Raw Response:', text);

    if (response.ok) {
      console.log('✅ API Test PASSED!');
    } else {
      console.error('❌ API Test FAILED');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

runTest();
