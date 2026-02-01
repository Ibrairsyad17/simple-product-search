import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const validLoginRate = new Rate('valid_logins');
const invalidLoginRate = new Rate('invalid_logins');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<50'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3000';

function getValidCredentials(iteration) {
  const userNumber = (iteration % 1000) + 1;
  return {
    email: `user${userNumber}@example.com`,
    password: 'password123',
  };
}

function getInvalidCredentials() {
  return {
    email: `invalid${Math.random()}@example.com`,
    password: 'wrongpassword',
  };
}

export default function () {
  const iteration = __ITER;

  const isValid = Math.random() < 0.8;
  const credentials = isValid
    ? getValidCredentials(iteration)
    : getInvalidCredentials();

  const payload = JSON.stringify(credentials);
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);

  const success = check(res, {
    'status is 200 for valid login': (r) => (isValid ? r.status === 200 : true),
    'status is 401 for invalid login': (r) =>
      !isValid ? r.status === 401 : true,
    'response time < 50ms': (r) => r.timings.duration < 50,
    'has token for valid login': (r) =>
      isValid ? r.json('token') !== undefined : true,
    'has user data for valid login': (r) =>
      isValid ? r.json('user') !== undefined : true,
  });

  errorRate.add(!success);
  if (isValid) {
    validLoginRate.add(res.status === 200);
  } else {
    invalidLoginRate.add(res.status === 401);
  }

  if (!success) {
    console.error(
      `Login failed: ${credentials.email}, Status: ${res.status}, Duration: ${res.timings.duration}ms`
    );
  }

  sleep(1);
}
