import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const errorRate = new Rate('search_errors');
const searchSuccessRate = new Rate('search_success');
const searchDuration = new Trend('search_response_time');
const emptyResultsRate = new Rate('empty_search_results');
const complexQueryDuration = new Trend('complex_query_duration');
const simpleQueryDuration = new Trend('simple_query_duration');
const totalSearches = new Counter('total_searches');
const textSearches = new Counter('text_searches');
const filterSearches = new Counter('filter_searches');

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '2m', target: 150 },
    { duration: '1m', target: 300 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(90)<40', 'p(95)<50', 'p(99)<100'],
    http_req_failed: ['rate<0.01'],
    search_errors: ['rate<0.02'],
    search_response_time: ['p(90)<40', 'p(95)<50'],
    search_success: ['rate>0.99'],
    complex_query_duration: ['p(95)<100'],
    simple_query_duration: ['p(95)<50'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const searchTerms = [
  'laptop',
  'computer',
  'macbook',
  'dell',
  'hp',
  'phone',
  'smartphone',
  'iphone',
  'samsung',
  'android',
  'camera',
  'canon',
  'nikon',
  'dslr',
  'photography',
  'headphone',
  'earphone',
  'bluetooth',
  'wireless',
  'audio',
  'watch',
  'smartwatch',
  'fitness',
  'garmin',
  'apple watch',
  'keyboard',
  'mechanical',
  'gaming',
  'wireless keyboard',
  'mouse',
  'gaming mouse',
  'wireless mouse',
  'logitech',
  'monitor',
  'display',
  '4k',
  'ultrawide',
  'gaming monitor',
  'tablet',
  'ipad',
  'android tablet',
  'drawing tablet',
  'charger',
  'cable',
  'usb',
  'power bank',
  'adapter',
  '',
];

const searchPatterns = [
  {
    weight: 0.4,
    type: 'simple',
    generator: () => {
      const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      return { q: term };
    },
  },

  {
    weight: 0.25,
    type: 'text_category',
    generator: () => {
      const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      const categoryCount = Math.floor(Math.random() * 2) + 1;
      const categories = [];
      for (let i = 0; i < categoryCount; i++) {
        categories.push((Math.floor(Math.random() * 10) + 1).toString());
      }
      return { q: term, category: categories };
    },
  },

  {
    weight: 0.15,
    type: 'price_filter',
    generator: () => {
      const minPrice = Math.floor(Math.random() * 500);
      const maxPrice = minPrice + Math.floor(Math.random() * 2000) + 100;
      return { minPrice, maxPrice };
    },
  },

  {
    weight: 0.15,
    type: 'complex',
    generator: () => {
      const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      const minPrice = Math.floor(Math.random() * 300);
      const maxPrice = minPrice + Math.floor(Math.random() * 1500) + 200;
      const categories = [(Math.floor(Math.random() * 10) + 1).toString()];
      return {
        q: term,
        category: categories,
        minPrice,
        maxPrice,
        inStock: Math.random() < 0.5 ? 'true' : undefined,
      };
    },
  },

  {
    weight: 0.05,
    type: 'stock_filter',
    generator: () => {
      return { inStock: 'true' };
    },
  },
];

const sortOptions = [
  { sortBy: 'relevance', sortOrder: 'desc' },
  { sortBy: 'price', sortOrder: 'asc' },
  { sortBy: 'price', sortOrder: 'desc' },
  { sortBy: 'rating', sortOrder: 'desc' },
  { sortBy: 'createdAt', sortOrder: 'desc' },
  { sortBy: 'createdAt', sortOrder: 'asc' },
];

function selectSearchPattern() {
  const rand = Math.random();
  let cumulative = 0;

  for (const pattern of searchPatterns) {
    cumulative += pattern.weight;
    if (rand <= cumulative) {
      return pattern;
    }
  }

  return searchPatterns[0];
}

function buildSearchParams() {
  const pattern = selectSearchPattern();
  const searchParams = pattern.generator();

  const page = Math.floor(Math.random() * 10) + 1;
  const pageSize = [10, 20, 50, 100][Math.floor(Math.random() * 4)];

  const sort = sortOptions[Math.floor(Math.random() * sortOptions.length)];

  const params = new URLSearchParams();

  if (searchParams.q !== undefined && searchParams.q !== '') {
    params.append('q', searchParams.q);
    textSearches.add(1);
  }

  if (searchParams.category) {
    const categories = Array.isArray(searchParams.category)
      ? searchParams.category
      : [searchParams.category];
    categories.forEach((cat) => params.append('category', cat));
    filterSearches.add(1);
  }

  if (searchParams.minPrice !== undefined) {
    params.append('minPrice', searchParams.minPrice.toString());
    filterSearches.add(1);
  }

  if (searchParams.maxPrice !== undefined) {
    params.append('maxPrice', searchParams.maxPrice.toString());
  }

  if (searchParams.inStock !== undefined) {
    params.append('inStock', searchParams.inStock);
    filterSearches.add(1);
  }

  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());
  params.append('sortBy', sort.sortBy);
  params.append('sortOrder', sort.sortOrder);

  return {
    params: params.toString(),
    type: pattern.type,
    isComplex: pattern.type === 'complex' || pattern.type === 'text_category',
  };
}

export function setup() {
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
    return { token: res.json('token') };
  }

  throw new Error('Failed to authenticate for search tests');
}

export default function (data) {
  totalSearches.add(1);

  group('Product Search', function () {
    const {
      params: searchParams,
      type: searchType,
      isComplex,
    } = buildSearchParams();

    const requestParams = {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
      tags: {
        name: 'Search Products',
        search_type: searchType,
      },
    };

    const res = http.get(
      `${BASE_URL}/api/products?${searchParams}`,
      requestParams
    );

    searchDuration.add(res.timings.duration);

    if (isComplex) {
      complexQueryDuration.add(res.timings.duration);
    } else {
      simpleQueryDuration.add(res.timings.duration);
    }

    const responseBody = res.json();
    const hasResults =
      responseBody && responseBody.data && responseBody.data.length > 0;

    if (!hasResults) {
      emptyResultsRate.add(1);
    } else {
      emptyResultsRate.add(0);
    }

    const success = check(res, {
      'search returns 200': (r) => r.status === 200,
      'search response time < 50ms': (r) => r.timings.duration < 50,
      'response has data array': (r) => Array.isArray(r.json('data')),
      'response has pagination': (r) => {
        const json = r.json();
        return (
          json.pagination !== undefined &&
          json.pagination.page !== undefined &&
          json.pagination.pageSize !== undefined &&
          json.pagination.total !== undefined &&
          json.pagination.totalPages !== undefined
        );
      },
      'products have required fields': (r) => {
        const products = r.json('data');
        if (!products || products.length === 0) return true;

        const product = products[0];
        return (
          product.id !== undefined &&
          product.name !== undefined &&
          product.price !== undefined &&
          product.description !== undefined &&
          product.rating !== undefined &&
          product.inStock !== undefined &&
          Array.isArray(product.images) &&
          Array.isArray(product.categories)
        );
      },
      'pagination values are correct': (r) => {
        const json = r.json();
        if (!json.pagination) return false;

        const { page, pageSize, total, totalPages } = json.pagination;
        return (
          page > 0 &&
          pageSize > 0 &&
          total >= 0 &&
          totalPages >= 0 &&
          totalPages === Math.ceil(total / pageSize)
        );
      },
      'products match filters': (r) => {
        const products = r.json('data');
        if (!products || products.length === 0) return true;

        if (
          searchParams.includes('minPrice') ||
          searchParams.includes('maxPrice')
        ) {
          const urlParams = new URLSearchParams(searchParams);
          const minPrice = urlParams.get('minPrice');
          const maxPrice = urlParams.get('maxPrice');

          return products.every((p) => {
            if (minPrice && p.price < parseFloat(minPrice)) return false;
            if (maxPrice && p.price > parseFloat(maxPrice)) return false;
            return true;
          });
        }

        return true;
      },
    });

    searchSuccessRate.add(success);
    errorRate.add(!success);

    if (!success || res.timings.duration >= 50) {
      console.error(
        `Search issue - Type: ${searchType}, Status: ${res.status}, ` +
          `Duration: ${res.timings.duration.toFixed(2)}ms, Params: ${searchParams.substring(0, 100)}`
      );
    }

    sleep(Math.random() * 1.5 + 0.5);
  });
}

export function handleSummary(data) {
  const totalSearchCount = data.metrics.total_searches?.values.count || 0;
  const textSearchCount = data.metrics.text_searches?.values.count || 0;
  const filterSearchCount = data.metrics.filter_searches?.values.count || 0;

  console.log(
    '\n╔════════════════════════════════════════════════════════════╗'
  );
  console.log('║          PRODUCT SEARCH LOAD TEST - SUMMARY REPORT         ║');
  console.log(
    '╚════════════════════════════════════════════════════════════╝\n'
  );

  console.log('📊 Request Pattern:');
  console.log(`   Total Searches: ${totalSearchCount}`);
  console.log(`   Text Searches: ${textSearchCount}`);
  console.log(`   Filter Searches: ${filterSearchCount}`);
  console.log(
    `   Empty Results: ${((data.metrics.empty_search_results?.values.rate || 0) * 100).toFixed(1)}%`
  );

  console.log('\n⚡ Load Profile:');
  console.log(
    `   Duration: ${(data.state.testRunDurationMs / 1000 / 60).toFixed(1)} minutes`
  );
  console.log(`   Peak VUs: 300 virtual users`);
  console.log(
    `   Total Requests: ${data.metrics.http_reqs?.values.count || 0}`
  );
  console.log(
    `   Request Rate: ${data.metrics.http_reqs?.values.rate.toFixed(2)} req/s`
  );

  console.log('\n⏱️  Response Times (Search):');
  if (data.metrics.search_response_time) {
    console.log(
      `   Average: ${data.metrics.search_response_time.values.avg.toFixed(2)}ms`
    );
    console.log(
      `   Median: ${data.metrics.search_response_time.values.med.toFixed(2)}ms`
    );
    console.log(
      `   p90: ${data.metrics.search_response_time.values['p(90)'].toFixed(2)}ms`
    );
    console.log(
      `   p95: ${data.metrics.search_response_time.values['p(95)'].toFixed(2)}ms`
    );
    console.log(
      `   p99: ${data.metrics.search_response_time.values['p(99)'].toFixed(2)}ms`
    );
    console.log(
      `   Max: ${data.metrics.search_response_time.values.max.toFixed(2)}ms`
    );
  }

  console.log('\n⏱️  Query Type Performance:');
  if (data.metrics.simple_query_duration) {
    console.log(
      `   Simple Queries (p95): ${data.metrics.simple_query_duration.values['p(95)'].toFixed(2)}ms`
    );
  }
  if (data.metrics.complex_query_duration) {
    console.log(
      `   Complex Queries (p95): ${data.metrics.complex_query_duration.values['p(95)'].toFixed(2)}ms`
    );
  }

  console.log('\n✅ Success Rates:');
  console.log(
    `   Search Success: ${((data.metrics.search_success?.values.rate || 0) * 100).toFixed(2)}%`
  );
  console.log(
    `   Error Rate: ${((data.metrics.search_errors?.values.rate || 0) * 100).toFixed(2)}%`
  );
  console.log(
    `   Failed Requests: ${((data.metrics.http_req_failed?.values.rate || 0) * 100).toFixed(2)}%`
  );

  console.log('\n🔍 Bottleneck Analysis:');
  if (data.metrics.search_response_time) {
    const avgDuration = data.metrics.search_response_time.values.avg;
    const p95Duration = data.metrics.search_response_time.values['p(95)'];

    if (p95Duration > 50) {
      console.log(
        `   ⚠️  p95 latency (${p95Duration.toFixed(2)}ms) exceeds 50ms target`
      );
    } else {
      console.log(
        `   ✓ p95 latency within target (${p95Duration.toFixed(2)}ms < 50ms)`
      );
    }

    if (avgDuration > 30) {
      console.log(
        `   ⚠️  Average latency (${avgDuration.toFixed(2)}ms) is high`
      );
    } else {
      console.log(`   ✓ Average latency is good (${avgDuration.toFixed(2)}ms)`);
    }
  }

  console.log('\n💡 Room for Improvement:');
  if (
    data.metrics.complex_query_duration &&
    data.metrics.complex_query_duration.values['p(95)'] > 75
  ) {
    console.log('   - Complex queries could benefit from additional indexing');
  }
  if (data.metrics.empty_search_results?.values.rate > 0.3) {
    console.log(
      '   - High empty result rate suggests search relevance tuning needed'
    );
  }
  if (data.metrics.search_response_time?.values.max > 200) {
    console.log(
      '   - Some queries have very high latency, investigate slow queries'
    );
  }

  console.log('\n' + '═'.repeat(60) + '\n');

  return {
    'k6-results/search-test-summary.html': htmlReport(data),
    'k6-results/search-test-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
