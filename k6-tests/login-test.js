import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const errorRate = new Rate('authentication_errors');
const validLoginRate = new Rate('valid_login_success');
const invalidLoginRate = new Rate('invalid_login_rejection');
const loginDuration = new Trend('login_response_time');
const logoutDuration = new Trend('logout_response_time');
const totalLogins = new Counter('total_login_attempts');
const validLogins = new Counter('valid_login_attempts');
const invalidLogins = new Counter('invalid_login_attempts');

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(90)<40', 'p(95)<50', 'p(99)<100'],
    http_req_failed: ['rate<0.01'],
    authentication_errors: ['rate<0.02'],
    login_response_time: ['p(90)<40', 'p(95)<50'],
    valid_login_success: ['rate>0.99'],
    invalid_login_rejection: ['rate>0.95'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

function getValidCredentials(iteration) {
  const userNumber = (iteration % 1000) + 1;
  return {
    email: `user${userNumber}@example.com`,
    password: 'password123',
  };
}

function getInvalidCredentials() {
  const strategies = [
    () => ({
      email: `user${Math.floor(Math.random() * 1000) + 1}@example.com`,
      password: 'wrongpassword123',
    }),
    () => ({
      email: `invalid${Date.now()}${Math.random().toString(36)}@example.com`,
      password: 'password123',
    }),
    () => ({
      email: `notanemail${Math.random()}`,
      password: 'password123',
    }),
  ];

  const strategy = strategies[Math.floor(Math.random() * strategies.length)];
  return strategy();
}

export default function () {
  const iteration = __ITER;
  const isValid = Math.random() < 0.8;

  group('Authentication Flow', function () {
    const credentials = isValid
      ? getValidCredentials(iteration)
      : getInvalidCredentials();

    totalLogins.add(1);
    if (isValid) {
      validLogins.add(1);
    } else {
      invalidLogins.add(1);
    }

    const payload = JSON.stringify(credentials);
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: { name: 'Login' },
    };

    const loginRes = http.post(`${BASE_URL}/api/auth/login`, payload, params);
    loginDuration.add(loginRes.timings.duration);

    const loginSuccess = check(loginRes, {
      'login response time < 50ms': (r) => r.timings.duration < 50,
      'valid login returns 200': (r) => (isValid ? r.status === 200 : true),
      'invalid login returns 401': (r) => (!isValid ? r.status === 401 : true),
      'valid login has token': (r) =>
        isValid ? r.json('token') !== undefined : true,
      'valid login has refresh token': (r) =>
        isValid ? r.json('refreshToken') !== undefined : true,
      'valid login has user data': (r) =>
        isValid
          ? r.json('user') !== undefined && r.json('user.email') !== undefined
          : true,
      'invalid login has error message': (r) =>
        !isValid ? r.json('message') !== undefined : true,
    });

    if (isValid) {
      validLoginRate.add(loginRes.status === 200);

      if (loginRes.status === 200) {
        const token = loginRes.json('token');
        sleep(0.5);

        const logoutParams = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          tags: { name: 'Logout' },
        };

        const logoutRes = http.post(
          `${BASE_URL}/api/auth/logout`,
          null,
          logoutParams
        );
        logoutDuration.add(logoutRes.timings.duration);

        check(logoutRes, {
          'logout returns 200': (r) => r.status === 200,
          'logout response time < 50ms': (r) => r.timings.duration < 50,
        });
      }
    } else {
      invalidLoginRate.add(loginRes.status === 401 || loginRes.status === 400);
    }

    errorRate.add(!loginSuccess);

    if (!loginSuccess) {
      console.error(
        `Login failed - Valid: ${isValid}, Email: ${credentials.email}, Status: ${loginRes.status}, Duration: ${loginRes.timings.duration.toFixed(2)}ms`
      );
    }
  });

  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  const validLoginAttempts =
    data.metrics.valid_login_attempts?.values.count || 0;
  const invalidLoginAttempts =
    data.metrics.invalid_login_attempts?.values.count || 0;
  const totalAttempts = data.metrics.total_login_attempts?.values.count || 0;

  console.log(
    '\n╔════════════════════════════════════════════════════════════╗'
  );
  console.log('║         AUTHENTICATION LOAD TEST - SUMMARY REPORT          ║');
  console.log(
    '╚════════════════════════════════════════════════════════════╝\n'
  );

  console.log('📊 Request Pattern:');
  console.log(`   Total Login Attempts: ${totalAttempts}`);
  console.log(
    `   Valid Attempts: ${validLoginAttempts} (${((validLoginAttempts / totalAttempts) * 100).toFixed(1)}%)`
  );
  console.log(
    `   Invalid Attempts: ${invalidLoginAttempts} (${((invalidLoginAttempts / totalAttempts) * 100).toFixed(1)}%)`
  );

  console.log('\n⚡ Load Profile:');
  console.log(
    `   Duration: ${(data.state.testRunDurationMs / 1000 / 60).toFixed(1)} minutes`
  );
  console.log(`   Peak VUs: 200 virtual users`);
  console.log(
    `   Total Requests: ${data.metrics.http_reqs?.values.count || 0}`
  );
  console.log(
    `   Request Rate: ${data.metrics.http_reqs?.values.rate.toFixed(2)} req/s`
  );

  console.log('\n⏱️  Response Times (Login):');
  if (data.metrics.login_response_time) {
    console.log(
      `   Average: ${data.metrics.login_response_time.values.avg.toFixed(2)}ms`
    );
    console.log(
      `   Median: ${data.metrics.login_response_time.values.med.toFixed(2)}ms`
    );
    console.log(
      `   p90: ${data.metrics.login_response_time.values['p(90)'].toFixed(2)}ms`
    );
    console.log(
      `   p95: ${data.metrics.login_response_time.values['p(95)'].toFixed(2)}ms`
    );
    console.log(
      `   p99: ${data.metrics.login_response_time.values['p(99)'].toFixed(2)}ms`
    );
    console.log(
      `   Max: ${data.metrics.login_response_time.values.max.toFixed(2)}ms`
    );
  }

  console.log('\n✅ Success Rates:');
  console.log(
    `   Valid Login Success: ${((data.metrics.valid_login_success?.values.rate || 0) * 100).toFixed(2)}%`
  );
  console.log(
    `   Invalid Login Rejection: ${((data.metrics.invalid_login_rejection?.values.rate || 0) * 100).toFixed(2)}%`
  );
  console.log(
    `   Error Rate: ${((data.metrics.authentication_errors?.values.rate || 0) * 100).toFixed(2)}%`
  );
  console.log(
    `   Failed Requests: ${((data.metrics.http_req_failed?.values.rate || 0) * 100).toFixed(2)}%`
  );

  console.log('\n🎯 Threshold Results:');
  const thresholds = data.root_group.checks;
  if (thresholds) {
    thresholds.forEach((check) => {
      const status = check.passes === check.fails + check.passes ? '✓' : '✗';
      console.log(
        `   ${status} ${check.name}: ${check.passes}/${check.fails + check.passes}`
      );
    });
  }

  console.log('\n' + '═'.repeat(60) + '\n');

  return {
    'k6-results/login-test-summary.html': htmlReport(data),
    'k6-results/login-test-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
