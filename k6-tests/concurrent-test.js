import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const searchDuration = new Trend('search_duration');
const productDetailDuration = new Trend('product_detail_duration');

export const options = {
  scenarios: {
    mixed_traffic: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 200 },
        { duration: '1m', target: 500 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<50', 'p(99)<100'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
    login_duration: ['p(95)<50'],
    search_duration: ['p(95)<50'],
    product_detail_duration: ['p(95)<50'],
  },
};

const BASE_URL = 'http://localhost:3000';

const searchQueries = ['laptop', 'phone', 'camera', 'watch', 'keyboard', ''];
const categories = ['1', '2', '3', '4', '5'];

function login(userIndex) {
  const payload = JSON.stringify({
    email: `user${userIndex}@example.com`,
    password: 'password123',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);

  loginDuration.add(res.timings.duration);

  const success = check(res, {
    'login status is 200': (r) => r.status === 200,
    'login has token': (r) => r.json('token') !== undefined,
  });

  if (!success) {
    errorRate.add(1);
    return null;
  }

  return res.json('token');
}

function searchProducts(token) {
  const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const page = Math.floor(Math.random() * 5) + 1;

  const params = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const res = http.get(
    `${BASE_URL}/api/products?q=${query}&category=${category}&page=${page}&limit=20&sortBy=createdAt&sortOrder=desc`,
    params
  );

  searchDuration.add(res.timings.duration);

  const success = check(res, {
    'search status is 200': (r) => r.status === 200,
    'search has products': (r) => Array.isArray(r.json('products')),
  });

  if (!success) {
    errorRate.add(1);
    return [];
  }

  return res.json('products') || [];
}

function getProductDetail(token, productId) {
  const params = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const res = http.get(`${BASE_URL}/api/products/${productId}`, params);

  productDetailDuration.add(res.timings.duration);

  const success = check(res, {
    'product detail status is 200': (r) => r.status === 200,
    'product has all fields': (r) => {
      const product = r.json();
      return (
        product.id !== undefined &&
        product.name !== undefined &&
        product.description !== undefined &&
        product.price !== undefined
      );
    },
  });

  if (!success) {
    errorRate.add(1);
  }

  return success;
}

function getCategories(token) {
  const params = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const res = http.get(`${BASE_URL}/api/categories`, params);

  check(res, {
    'categories status is 200': (r) => r.status === 200,
    'has categories array': (r) => Array.isArray(r.json()),
  });
}

export default function () {
  const userIndex = ((__VU * 1000 + __ITER) % 1000) + 1;

  group('User Session', function () {
    const token = login(userIndex);
    if (!token) {
      return;
    }

    sleep(0.5);

    const categoriesRequest = http.get(`${BASE_URL}/api/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const searchCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < searchCount; i++) {
      const products = searchProducts(token);

      sleep(1);

      if (products.length > 0 && Math.random() < 0.3) {
        const randomProduct =
          products[Math.floor(Math.random() * products.length)];
        if (randomProduct && randomProduct.id) {
          getProductDetail(token, randomProduct.id);
          sleep(2);
        }
      }
    }
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let output = '\n';
  output += `${indent}Concurrent Load Test Summary\n`;
  output += `${indent}============================\n\n`;

  if (data.metrics.http_req_duration) {
    output += `${indent}Response Times:\n`;
    output += `${indent}  avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    output += `${indent}  min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
    output += `${indent}  max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
    output += `${indent}  p(95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
    output += `${indent}  p(99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;
  }

  if (data.metrics.http_reqs) {
    output += `${indent}Total Requests: ${data.metrics.http_reqs.values.count}\n`;
    output += `${indent}Requests/sec: ${data.metrics.http_reqs.values.rate.toFixed(2)}\n\n`;
  }

  if (data.metrics.http_req_failed) {
    const errorPercent = (
      data.metrics.http_req_failed.values.rate * 100
    ).toFixed(2);
    output += `${indent}Failed Requests: ${errorPercent}%\n\n`;
  }

  if (data.metrics.login_duration) {
    output += `${indent}Login Duration (p95): ${data.metrics.login_duration.values['p(95)'].toFixed(2)}ms\n`;
  }
  if (data.metrics.search_duration) {
    output += `${indent}Search Duration (p95): ${data.metrics.search_duration.values['p(95)'].toFixed(2)}ms\n`;
  }
  if (data.metrics.product_detail_duration) {
    output += `${indent}Product Detail Duration (p95): ${data.metrics.product_detail_duration.values['p(95)'].toFixed(2)}ms\n`;
  }

  return output;
}
