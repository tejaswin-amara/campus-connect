import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metric tracking for high-concurrency rush verification
export const successfulRegistrations = new Counter('successful_registrations');
export const soldOutResponses = new Counter('sold_out_responses');
export const unexpectedErrors = new Counter('unexpected_errors');
export const registrationLatency = new Trend('registration_latency');

export const options = {
  scenarios: {
    ticket_rush: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '3s', target: 50 },    // Initial surge
        { duration: '5s', target: 200 },   // High load peak
        { duration: '5s', target: 500 },   // Extreme concurrency spike
        { duration: '2s', target: 0 },     // Wind down
      ],
      gracefulStop: '5s',
    },
  },
  thresholds: {
    // 95% of requests should complete under 3000ms under 500 VUs peak on a single local host
    'http_req_duration': ['p(95)<3000'],
    // Zero unexpected errors (HTTP 500, network aborts, etc.)
    'unexpected_errors': ['count==0'],
    // Overselling guard: successful tickets must not exceed configured capacity (e.g. 50)
    'successful_registrations': ['count<=50'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:8080';
const EVENT_ID = __ENV.EVENT_ID || '1';
const MAX_CAPACITY = Number.parseInt(__ENV.MAX_CAPACITY || '50', 10);

export default function () {
  const vuId = __VU;
  const iterId = __ITER;
  const uniqueRollNumber = `23CC${String(vuId).padStart(4, '0')}_${iterId}`;

  const payload = JSON.stringify({
    rollNumber: uniqueRollNumber,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'RegisterTicketRush' },
  };

  const startTime = Date.now();
  const res = http.post(`${BASE_URL}/api/events/${EVENT_ID}/register`, payload, params);
  registrationLatency.add(Date.now() - startTime);

  if (res.status === 200) {
    successfulRegistrations.add(1);
    check(res, {
      'is status 200 (seat reserved)': (r) => r.status === 200,
      'has ticketCode': (r) => {
        try {
          const body = JSON.parse(r.body);
          return typeof body.ticketCode === 'string' && body.ticketCode.startsWith('TKT-');
        } catch {
          return false;
        }
      },
    });
  } else if (res.status === 409) {
    soldOutResponses.add(1);
    check(res, {
      'is status 409 (sold out / capacity exhausted)': (r) => r.status === 409,
    });
  } else {
    unexpectedErrors.add(1);
    check(res, {
      'unexpected status received': () => false,
    });
  }

  // Small jitter to simulate realistic student click streams
  sleep(0.05);
}
