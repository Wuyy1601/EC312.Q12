// Test script for Authentication API
// Run with: node test-api.js

import http from 'http';

// Helper function to make HTTP requests
const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
};

const testRegister = async () => {
  const postData = JSON.stringify({
    name: 'Nguyen Van A',
    email: `test${Date.now()}@example.com`,
    password: '123456',
    phone: '0901234567'
  });

  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const data = await makeRequest(options, postData);
  console.log('✅ Register Response:', JSON.stringify(data, null, 2));
  return { token: data.data?.token, email: JSON.parse(postData).email };
};

const testLogin = async (email) => {
  const postData = JSON.stringify({
    email: email,
    password: '123456'
  });

  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const data = await makeRequest(options, postData);
  console.log('✅ Login Response:', JSON.stringify(data, null, 2));
  return data.data?.token;
};

const testGetProfile = async (token) => {
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/profile',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const data = await makeRequest(options);
  console.log('✅ Get Profile Response:', JSON.stringify(data, null, 2));
};

const testUpdateProfile = async (token) => {
  const postData = JSON.stringify({
    name: 'Nguyen Van A Updated',
    phone: '0987654321',
    address: {
      street: '123 Nguyen Hue',
      city: 'Ho Chi Minh',
      district: 'District 1'
    }
  });

  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/profile',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': `Bearer ${token}`
    }
  };

  const data = await makeRequest(options, postData);
  console.log('✅ Update Profile Response:', JSON.stringify(data, null, 2));
};

// Run all tests
const runTests = async () => {
  console.log('🚀 Starting API Tests...\n');

  try {
    // Test 1: Register
    console.log('📝 Test 1: Register New User');
    const { token, email } = await testRegister();
    console.log('Token received:', token?.substring(0, 20) + '...\n');

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 2: Login with the same user
    console.log('📝 Test 2: Login with Created User');
    const loginToken = await testLogin(email);
    console.log('Login token received:', loginToken?.substring(0, 20) + '...\n');

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 3: Get Profile
    console.log('📝 Test 3: Get User Profile');
    await testGetProfile(token);
    console.log('');

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 4: Update Profile
    console.log('📝 Test 4: Update User Profile');
    await testUpdateProfile(token);
    console.log('');

    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
};

runTests();
