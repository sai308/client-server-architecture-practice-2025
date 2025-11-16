const autocannon = require('autocannon');

// Configurations for each load test
/**
 * @type {Array<import('autocannon').Options>}
 */
const testConfigs = [
  {
    title: '📚 Pagination Test',
    url: 'https://localhost/api/resources?page=1&limit=100&latest=true',
    method: 'GET',
    connections: 200,
    duration: 60,
    servername: 'localhost',
    tlsOptions: { rejectUnauthorized: false }, // self-signed
    headers: { host: 'localhost' },
  },
  {
    title: '📚 Pagination Test [Cached]',
    url: 'https://localhost/api/resources?page=1&limit=100',
    method: 'GET',
    connections: 200,
    duration: 60,
    servername: 'localhost',
    tlsOptions: { rejectUnauthorized: false }, // self-signed
    headers: { host: 'localhost' },
  },
  {
    title: '💵 Currency rates Test',
    url: 'https://localhost/api/shop/currency-rates?latest=true',
    method: 'GET',
    amount: 10, // External API calls may be rate-limited; keep requests low
    servername: 'localhost',
    tlsOptions: { rejectUnauthorized: false }, // self-signed
    headers: { host: 'localhost' },
  },
  {
    title: '💵 Currency rates Test [Cached]',
    url: 'https://localhost/api/shop/currency-rates',
    method: 'GET',
    connections: 200,
    duration: 60,
    servername: 'localhost',
    tlsOptions: { rejectUnauthorized: false }, // self-signed
    headers: { host: 'localhost' },
  },
];

// Function to format and log results
function logSummary(name, result) {
  const totalBytes =
    result && result.throughput && typeof result.throughput.total === 'number'
      ? result.throughput.total
      : 0;

  const totalGB = totalBytes / 1024 ** 3;
  const totalGBDisplay = `${totalGB.toFixed(2)} GB`;

  const summary = `
  📊 Load Test Summary for ${name}:
  ======================================================
  📅 Duration: ${result.duration}s
  👥 Connections: ${result.connections}
  🔁 Total Requests Sent: ${result.requests.sent}
  ------------------------------------------------------
  💀 Errors: ${result.errors}
  ------------------------------------------------------
  🚦 Status Codes:
      - 1xx: ${result['1xx'] || 0}
      - 2xx: ${result['2xx'] || 0}
      - 3xx: ${result['3xx'] || 0}
      - 4xx: ${result['4xx'] || 0}
      - 5xx: ${result['5xx'] || 0}
  📈 Requests per Second: ${result.requests.average || 0}
  🕒 Average Latency (ms): ${result.latency.average || 0}
  🔄 Total Throughput (bytes): ${totalBytes} (${totalGBDisplay})
  `;

  console.log(summary);
}

// Function to run a load test based on the configuration
function runTest(config) {
  console.log(`Starting load test: ${config.title}`);

  const instance = autocannon(config, (err, result) => {
    if (err) {
      console.error(`Error running load test for ${config.title}:`, err);
    } else {
      logSummary(config.title, result);
    }
  });

  // optional: print first few responses to verify we hit Fastify
  let seen = 0;
  instance.on('response', (client, statusCode, resBytes, responseTime) => {
    if (seen++ < 3) console.log('↩', { statusCode, responseTime });
  });
}

// Function to iterate over all test configurations and run them
function runLoadTests() {
  console.log('🚀 Initiating all load tests...');
  for (const config of testConfigs) {
    runTest(config);
  }
}

runLoadTests();
