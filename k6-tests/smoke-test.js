import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<100'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const userIndex = __VU * 100 + (__ITER % 100) + 1;

  group('Smoke Test', function () {
    // 1. Login
    const loginRes = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({
        email: `user${userIndex}@example.com`,
        password: 'password123',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    const loginSuccess = check(loginRes, {
      'login successful': (r) => r.status === 200,
      'login has token': (r) => r.json('token') !== undefined,
    });

    if (!loginSuccess) {
      errorRate.add(1);
      return;
    }

    const token = loginRes.json('token');
    const headers = { Authorization: `Bearer ${token}` };

    sleep(0.5);

    // 2. Get Categories
    const categoriesRes = http.get(`${BASE_URL}/api/categories`, { headers });
    check(categoriesRes, {
      'categories retrieved': (r) => r.status === 200,
    });

    sleep(0.5);

    // 3. Search Products
    const searchRes = http.get(
      `${BASE_URL}/api/products?q=laptop&page=1&pageSize=10`,
      { headers }
    );

    const searchSuccess = check(searchRes, {
      'search successful': (r) => r.status === 200,
      'search has data': (r) => Array.isArray(r.json('data')),
    });

    if (!searchSuccess) {
      errorRate.add(1);
      return;
    }

    sleep(0.5);

    // 4. Get Product Detail
    const products = searchRes.json('data');
    if (products && products.length > 0) {
      const productId = products[0].id;
      const detailRes = http.get(`${BASE_URL}/api/products/${productId}`, {
        headers,
      });

      check(detailRes, {
        'product detail retrieved': (r) => r.status === 200,
        'product has all fields': (r) => {
          const p = r.json('data');
          return p && p.id && p.name && p.price !== undefined;
        },
      });
    }

    sleep(0.5);

    // 5. Logout
    const logoutRes = http.post(`${BASE_URL}/api/auth/logout`, null, {
      headers,
    });
    check(logoutRes, {
      'logout successful': (r) => r.status === 200,
    });
  });

  sleep(1);
}

export function handleSummary(data) {
  console.log(
    '\n╔════════════════════════════════════════════════════════════╗'
  );
  console.log('║              SMOKE TEST - QUICK VALIDATION                 ║');
  console.log(
    '╚════════════════════════════════════════════════════════════╝\n'
  );

  const errorRateValue = (data.metrics.errors?.values.rate || 0) * 100;
  const avgDuration = data.metrics.http_req_duration?.values.avg || 0;
  const p95Duration = data.metrics.http_req_duration?.values['p(95)'] || 0;

  console.log(`✓ Total Requests: ${data.metrics.http_reqs?.values.count || 0}`);
  console.log(`✓ Average Response Time: ${avgDuration.toFixed(2)}ms`);
  console.log(`✓ p95 Response Time: ${p95Duration.toFixed(2)}ms`);
  console.log(`✓ Error Rate: ${errorRateValue.toFixed(2)}%`);

  if (errorRateValue < 1 && p95Duration < 100) {
    console.log('\n✅ All systems operational - Ready for full load testing\n');
  } else {
    console.log('\n⚠️  Issues detected - Review before full load testing\n');
  }

  return {
    stdout: '',
  };
}
