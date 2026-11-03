// Local Preview Load Test Runner (Simulates 100 concurrent requests against local health handler)
import healthHandler from '../api/health.js';

async function runPreviewLoadTest() {
  const TOTAL_REQUESTS = 100;
  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  const promises = [];

  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    const p = new Promise((resolve) => {
      const req = { method: 'GET', headers: {} };
      const res = {
        statusCode: 200,
        headers: {},
        setHeader(k, v) { this.headers[k] = v; },
        end(data) {
          if (this.statusCode === 200) {
            successCount++;
          } else {
            failCount++;
          }
          resolve(true);
        }
      };

      try {
        healthHandler(req, res);
      } catch {
        failCount++;
        resolve(false);
      }
    });

    promises.push(p);
  }

  await Promise.all(promises);
  const elapsedMs = Date.now() - startTime;
  const rps = Math.round((TOTAL_REQUESTS / (elapsedMs / 1000)));

  console.log('====================================================');
  console.log('  ⚡ PREVIEW ENVIRONMENT LOAD TEST RESULTS');
  console.log('====================================================');
  console.log(`Total Concurrent Requests: ${TOTAL_REQUESTS}`);
  console.log(`Success Count (HTTP 200):  ${successCount}`);
  console.log(`Failed Count:               ${failCount}`);
  console.log(`Total Time Elapsed:        ${elapsedMs} ms`);
  console.log(`Requests Per Second (RPS): ${rps} RPS`);
  console.log('====================================================');
}

runPreviewLoadTest();
