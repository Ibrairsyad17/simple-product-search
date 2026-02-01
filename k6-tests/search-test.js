import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const searchSuccessRate = new Rate('search_success');

export const options = {
  stages: [
    { duration: '30s', target: 30 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<50'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3000';

const searchTerms = [
  'product',
  'laptop',
  'phone',
  'camera',
  'headphone',
  'watch',
  'keyboard',
  'mouse',
  'monitor',
  'tablet',
  '',
];

const categories = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const sortOptions = ['createdAt', 'price', 'rating', 'name'];
const sortOrders = ['asc', 'desc'];

function getSearchParams() {
  const params = new URLSearchParams();

  if (Math.random() < 0.7) {
    const searchTerm =
      searchTerms[Math.floor(Math.random() * searchTerms.length)];
    if (searchTerm) params.append('q', searchTerm);
  }

  if (Math.random() < 0.4) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    params.append('category', category);
  }

  if (Math.random() < 0.3) {
    const minPrice = Math.floor(Math.random() * 500);
    const maxPrice = minPrice + Math.floor(Math.random() * 1000) + 100;
    params.append('minPrice', minPrice.toString());
    params.append('maxPrice', maxPrice.toString());
  }

  if (Math.random() < 0.2) {
    params.append('inStock', 'true');
  }

  const page = Math.floor(Math.random() * 10) + 1;
  const limit = [10, 20, 50][Math.floor(Math.random() * 3)];
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const sortBy = sortOptions[Math.floor(Math.random() * sortOptions.length)];
  const sortOrder = sortOrders[Math.floor(Math.random() * sortOrders.length)];
  params.append('sortBy', sortBy);
  params.append('sortOrder', sortOrder);

  return params.toString();
}

function getAuthToken() {
  const credentials = JSON.stringify({
    email: 'user1@example.com',
    password: 'password123',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/api/auth/login`, credentials, params);

  if (res.status === 200) {
    return res.json('token');
  }

  return null;
}

export function setup() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Failed to get auth token');
  }
  return { token };
}

export default function (data) {
  const searchParams = getSearchParams();

  const params = {
    headers: {
      Authorization: `Bearer ${data.token}`,
    },
  };

  const res = http.get(`${BASE_URL}/api/products?${searchParams}`, params);

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 50ms': (r) => r.timings.duration < 50,
    'has products array': (r) => Array.isArray(r.json('products')),
    'has pagination info': (r) => {
      const json = r.json();
      return (
        json.page !== undefined &&
        json.limit !== undefined &&
        json.total !== undefined &&
        json.totalPages !== undefined
      );
    },
    'products have required fields': (r) => {
      const products = r.json('products');
      if (!products || products.length === 0) return true;

      const product = products[0];
      return (
        product.id !== undefined &&
        product.name !== undefined &&
        product.price !== undefined &&
        product.images !== undefined &&
        product.categories !== undefined
      );
    },
  });

  errorRate.add(!success);
  searchSuccessRate.add(success);

  if (!success || res.timings.duration >= 50) {
    console.error(
      `Search failed or slow: ${searchParams}, Status: ${res.status}, Duration: ${res.timings.duration}ms`
    );
  }

  sleep(0.5);
}
