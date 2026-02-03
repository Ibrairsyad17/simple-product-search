import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const searchDuration = new Trend('search_duration');
const productDetailDuration = new Trend('product_detail_duration');
const categoryDuration = new Trend('category_duration');

const totalRequests = new Counter('total_requests');
const successfulLogins = new Counter('successful_logins');
const failedLogins = new Counter('failed_logins');
const productsViewed = new Counter('products_viewed');
const searchesPerformed = new Counter('searches_performed');

export const options = {
  scenarios: {
    casual_browsers: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 40 },
        { duration: '3m', target: 120 },
        { duration: '2m', target: 200 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'casualBrowser',
    },

    active_shoppers: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 35 },
        { duration: '3m', target: 105 },
        { duration: '2m', target: 175 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'activeShopper',
    },

    quick_searches: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 60 },
        { duration: '2m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'quickSearch',
    },

    category_browsers: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 5 },
        { duration: '3m', target: 15 },
        { duration: '2m', target: 25 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'categoryBrowser',
    },
  },
  thresholds: {
    http_req_duration: ['p(90)<40', 'p(95)<50', 'p(99)<100'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
    login_duration: ['p(90)<40', 'p(95)<50'],
    search_duration: ['p(90)<40', 'p(95)<50'],
    product_detail_duration: ['p(95)<50'],
    category_duration: ['p(95)<50'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const searchQueries = [
  'laptop',
  'macbook',
  'dell laptop',
  'gaming laptop',
  'ultrabook',
  'phone',
  'smartphone',
  'iphone',
  'samsung galaxy',
  'android',
  'camera',
  'canon',
  'nikon',
  'dslr',
  'mirrorless camera',
  'headphone',
  'wireless headphone',
  'bluetooth',
  'noise cancelling',
  'watch',
  'smartwatch',
  'fitness tracker',
  'apple watch',
  'keyboard',
  'mechanical keyboard',
  'gaming keyboard',
  'wireless',
  'mouse',
  'gaming mouse',
  'wireless mouse',
  'ergonomic',
  'monitor',
  '4k monitor',
  'gaming monitor',
  'ultrawide',
  'tablet',
  'ipad',
  'android tablet',
  'drawing tablet',
  '',
];

function login(userIndex) {
  const payload = JSON.stringify({
    email: `user${userIndex}@example.com`,
    password: 'password123',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'Login' },
  };

  totalRequests.add(1);
  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);
  loginDuration.add(res.timings.duration);

  const success = check(res, {
    'login status is 200': (r) => r.status === 200,
    'login has token': (r) => r.json('token') !== undefined,
    'login response < 50ms': (r) => r.timings.duration < 50,
  });

  if (success) {
    successfulLogins.add(1);
    return res.json('token');
  } else {
    failedLogins.add(1);
    errorRate.add(1);
    return null;
  }
}

function searchProducts(token, options = {}) {
  const query =
    options.query ||
    searchQueries[Math.floor(Math.random() * searchQueries.length)];
  const params = new URLSearchParams();

  if (query) params.append('q', query);

  if (options.category) {
    params.append('category', options.category);
  } else if (Math.random() < 0.3) {
    params.append('category', (Math.floor(Math.random() * 10) + 1).toString());
  }

  if (options.minPrice || Math.random() < 0.2) {
    const min = options.minPrice || Math.floor(Math.random() * 500);
    const max =
      options.maxPrice || min + Math.floor(Math.random() * 1500) + 100;
    params.append('minPrice', min.toString());
    params.append('maxPrice', max.toString());
  }

  if (Math.random() < 0.15) {
    params.append('inStock', 'true');
  }

  const page = options.page || Math.floor(Math.random() * 5) + 1;
  const pageSize =
    options.pageSize || [10, 20, 50][Math.floor(Math.random() * 3)];
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());

  const sortOptions = ['price', 'rating', 'createdAt'];
  const sortBy = sortOptions[Math.floor(Math.random() * sortOptions.length)];
  const sortOrder = Math.random() < 0.5 ? 'asc' : 'desc';
  params.append('sortBy', sortBy);
  params.append('sortOrder', sortOrder);

  const requestParams = {
    headers: { Authorization: `Bearer ${token}` },
    tags: { name: 'Search Products' },
  };

  totalRequests.add(1);
  searchesPerformed.add(1);
  const res = http.get(
    `${BASE_URL}/api/products?${params.toString()}`,
    requestParams
  );
  searchDuration.add(res.timings.duration);

  const success = check(res, {
    'search status is 200': (r) => r.status === 200,
    'search has data': (r) => Array.isArray(r.json('data')),
    'search response < 50ms': (r) => r.timings.duration < 50,
  });

  if (!success) {
    errorRate.add(1);
    return [];
  }

  return res.json('data') || [];
}

function getProductDetail(token, productId) {
  const params = {
    headers: { Authorization: `Bearer ${token}` },
    tags: { name: 'Product Detail' },
  };

  totalRequests.add(1);
  productsViewed.add(1);
  const res = http.get(`${BASE_URL}/api/products/${productId}`, params);
  productDetailDuration.add(res.timings.duration);

  const success = check(res, {
    'product detail status is 200': (r) => r.status === 200,
    'product has all fields': (r) => {
      const product = r.json('data');
      return (
        product &&
        product.id !== undefined &&
        product.name !== undefined &&
        product.description !== undefined &&
        product.price !== undefined &&
        Array.isArray(product.images) &&
        Array.isArray(product.categories)
      );
    },
    'product response < 50ms': (r) => r.timings.duration < 50,
  });

  if (!success) {
    errorRate.add(1);
  }

  return success;
}

function getCategories(token) {
  const params = {
    headers: { Authorization: `Bearer ${token}` },
    tags: { name: 'Categories' },
  };

  totalRequests.add(1);
  const res = http.get(`${BASE_URL}/api/categories`, params);
  categoryDuration.add(res.timings.duration);

  const success = check(res, {
    'categories status is 200': (r) => r.status === 200,
    'has categories array': (r) => Array.isArray(r.json('data')),
    'categories response < 50ms': (r) => r.timings.duration < 50,
  });

  if (!success) {
    errorRate.add(1);
    return [];
  }

  return res.json('data') || [];
}

export function casualBrowser() {
  const userIndex = ((__VU * 1000 + __ITER) % 1000) + 1;

  group('Casual Browser Session', function () {
    const token = login(userIndex);
    if (!token) return;

    sleep(1);

    getCategories(token);
    sleep(0.5);

    const searchCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < searchCount; i++) {
      const products = searchProducts(token);
      sleep(2);

      if (products.length > 0 && Math.random() < 0.3) {
        const product = products[Math.floor(Math.random() * products.length)];
        if (product && product.id) {
          getProductDetail(token, product.id);
          sleep(3);
        }
      }
    }
  });

  sleep(Math.random() * 3 + 2);
}

export function activeShopper() {
  const userIndex = ((__VU * 1000 + __ITER) % 1000) + 1;

  group('Active Shopper Session', function () {
    const token = login(userIndex);
    if (!token) return;

    sleep(0.5);

    const categories = getCategories(token);
    sleep(1);

    const searchCount = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < searchCount; i++) {
      const searchOptions = {};

      if (i > 0 && categories.length > 0) {
        const category =
          categories[Math.floor(Math.random() * categories.length)];
        searchOptions.category = category.id;
      }

      if (i > 1) {
        searchOptions.minPrice = Math.floor(Math.random() * 300);
        searchOptions.maxPrice =
          searchOptions.minPrice + Math.floor(Math.random() * 1000) + 200;
      }

      const products = searchProducts(token, searchOptions);
      sleep(1.5);

      if (products.length > 0 && Math.random() < 0.6) {
        const product =
          products[Math.floor(Math.random() * Math.min(3, products.length))];
        if (product && product.id) {
          getProductDetail(token, product.id);
          sleep(2);
        }
      }
    }
  });

  sleep(Math.random() * 2 + 1);
}

export function quickSearch() {
  const userIndex = ((__VU * 1000 + __ITER) % 1000) + 1;

  group('Quick Search Session', function () {
    const token = login(userIndex);
    if (!token) return;

    sleep(0.3);

    const searchCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < searchCount; i++) {
      searchProducts(token, {
        query: searchQueries[Math.floor(Math.random() * searchQueries.length)],
      });
      sleep(0.5);
    }
  });

  sleep(Math.random() * 1.5 + 0.5);
}

export function categoryBrowser() {
  const userIndex = ((__VU * 1000 + __ITER) % 1000) + 1;

  group('Category Browser Session', function () {
    const token = login(userIndex);
    if (!token) return;

    sleep(0.5);

    const categories = getCategories(token);
    sleep(1);

    if (categories.length === 0) return;

    const browseCount = Math.min(
      Math.floor(Math.random() * 2) + 2,
      categories.length
    );
    for (let i = 0; i < browseCount; i++) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];

      const products = searchProducts(token, {
        category: category.id,
        pageSize: 20,
      });
      sleep(2);

      const viewCount = Math.min(
        Math.floor(Math.random() * 2) + 1,
        products.length
      );
      for (let j = 0; j < viewCount; j++) {
        if (products[j] && products[j].id) {
          getProductDetail(token, products[j].id);
          sleep(2.5);
        }
      }
    }
  });

  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  console.log(
    '\n╔════════════════════════════════════════════════════════════╗'
  );
  console.log('║       CONCURRENT LOAD TEST - COMPREHENSIVE SUMMARY         ║');
  console.log(
    '╚════════════════════════════════════════════════════════════╝\n'
  );

  console.log('📊 Request Pattern:');
  console.log(
    `   Total Requests: ${data.metrics.total_requests?.values.count || 0}`
  );
  console.log(
    `   Successful Logins: ${data.metrics.successful_logins?.values.count || 0}`
  );
  console.log(
    `   Failed Logins: ${data.metrics.failed_logins?.values.count || 0}`
  );
  console.log(
    `   Searches Performed: ${data.metrics.searches_performed?.values.count || 0}`
  );
  console.log(
    `   Products Viewed: ${data.metrics.products_viewed?.values.count || 0}`
  );

  console.log('\n⚡ Load Profile:');
  console.log(
    `   Test Duration: ${(data.state.testRunDurationMs / 1000 / 60).toFixed(1)} minutes`
  );
  console.log(`   Peak Concurrent VUs: 500 virtual users`);
  console.log(
    `   Total HTTP Requests: ${data.metrics.http_reqs?.values.count || 0}`
  );
  console.log(
    `   Request Rate: ${data.metrics.http_reqs?.values.rate.toFixed(2)} req/s`
  );

  console.log('\n⏱️  Response Times by Endpoint:');

  if (data.metrics.login_duration) {
    console.log('\n   Login:');
    console.log(
      `     Average: ${data.metrics.login_duration.values.avg.toFixed(2)}ms`
    );
    console.log(
      `     p90: ${data.metrics.login_duration.values['p(90)'].toFixed(2)}ms`
    );
    console.log(
      `     p95: ${data.metrics.login_duration.values['p(95)'].toFixed(2)}ms`
    );
    console.log(
      `     p99: ${data.metrics.login_duration.values['p(99)'].toFixed(2)}ms`
    );
  }

  if (data.metrics.search_duration) {
    console.log('\n   Product Search:');
    console.log(
      `     Average: ${data.metrics.search_duration.values.avg.toFixed(2)}ms`
    );
    console.log(
      `     p90: ${data.metrics.search_duration.values['p(90)'].toFixed(2)}ms`
    );
    console.log(
      `     p95: ${data.metrics.search_duration.values['p(95)'].toFixed(2)}ms`
    );
    console.log(
      `     p99: ${data.metrics.search_duration.values['p(99)'].toFixed(2)}ms`
    );
  }

  if (data.metrics.product_detail_duration) {
    console.log('\n   Product Detail:');
    console.log(
      `     Average: ${data.metrics.product_detail_duration.values.avg.toFixed(2)}ms`
    );
    console.log(
      `     p90: ${data.metrics.product_detail_duration.values['p(90)'].toFixed(2)}ms`
    );
    console.log(
      `     p95: ${data.metrics.product_detail_duration.values['p(95)'].toFixed(2)}ms`
    );
    console.log(
      `     p99: ${data.metrics.product_detail_duration.values['p(99)'].toFixed(2)}ms`
    );
  }

  if (data.metrics.category_duration) {
    console.log('\n   Categories:');
    console.log(
      `     Average: ${data.metrics.category_duration.values.avg.toFixed(2)}ms`
    );
    console.log(
      `     p90: ${data.metrics.category_duration.values['p(90)'].toFixed(2)}ms`
    );
    console.log(
      `     p95: ${data.metrics.category_duration.values['p(95)'].toFixed(2)}ms`
    );
  }

  console.log('\n✅ Success Metrics:');
  const errorRatePercent = (data.metrics.errors?.values.rate || 0) * 100;
  const failedReqPercent =
    (data.metrics.http_req_failed?.values.rate || 0) * 100;
  console.log(`   Error Rate: ${errorRatePercent.toFixed(2)}%`);
  console.log(`   Failed Requests: ${failedReqPercent.toFixed(2)}%`);
  console.log(`   Success Rate: ${(100 - errorRatePercent).toFixed(2)}%`);

  console.log('\n🔍 Bottleneck Analysis:');
  let bottlenecks = [];

  if (data.metrics.http_req_duration) {
    const p95 = data.metrics.http_req_duration.values['p(95)'];
    const p99 = data.metrics.http_req_duration.values['p(99)'];

    if (p95 > 50) {
      bottlenecks.push(
        `⚠️  p95 latency (${p95.toFixed(2)}ms) exceeds 50ms target`
      );
    }
    if (p99 > 100) {
      bottlenecks.push(
        `⚠️  p99 latency (${p99.toFixed(2)}ms) exceeds 100ms target`
      );
    }
  }

  if (errorRatePercent > 1) {
    bottlenecks.push(
      `⚠️  Error rate (${errorRatePercent.toFixed(2)}%) exceeds 1% threshold`
    );
  }

  if (data.metrics.search_duration?.values['p(95)'] > 50) {
    bottlenecks.push(
      `⚠️  Search p95 (${data.metrics.search_duration.values['p(95)'].toFixed(2)}ms) is slow`
    );
  }

  if (bottlenecks.length > 0) {
    bottlenecks.forEach((b) => console.log(`   ${b}`));
  } else {
    console.log('   ✓ All metrics within acceptable thresholds');
  }

  console.log('\n💡 Room for Improvement:');
  let improvements = [];

  if (data.metrics.login_duration?.values.max > 200) {
    improvements.push(
      '- Some login requests are very slow, investigate database queries'
    );
  }
  if (data.metrics.search_duration?.values['p(99)'] > 100) {
    improvements.push(
      '- Search p99 latency is high, consider query optimization and caching'
    );
  }
  if (data.metrics.http_req_duration?.values.max > 500) {
    improvements.push(
      '- Some requests timeout, check for slow queries or connection issues'
    );
  }
  if (failedReqPercent > 0.5) {
    improvements.push(
      '- Failed request rate could be improved with better error handling'
    );
  }

  if (improvements.length > 0) {
    improvements.forEach((i) => console.log(`   ${i}`));
  } else {
    console.log('   ✓ System performing optimally under load');
  }

  console.log('\n📈 Test Scenarios:');
  console.log('   - Casual Browsers: 40% of load (light usage)');
  console.log('   - Active Shoppers: 35% of load (intensive usage)');
  console.log('   - Quick Searches: 20% of load (rapid searches)');
  console.log('   - Category Browsers: 5% of load (category exploration)');

  console.log('\n' + '═'.repeat(60) + '\n');

  return {
    'k6-results/concurrent-test-summary.html': htmlReport(data),
    'k6-results/concurrent-test-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
