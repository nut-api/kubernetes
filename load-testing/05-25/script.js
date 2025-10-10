
import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';


export const options = {
  discardResponseBodies: true,
  stages: 
  [
    { duration: '1m', target: 1000 },
    { duration: '10m', target: 1000 },
    { duration: '1m', target: 0 },
  ],
  // thresholds: {
  //   http_req_failed: ['rate<0.01'], // http errors should be less than 1%
  //   http_req_duration: [{ threshold: 'p(95) < 10000', abortOnFail: true }], // 95% of requests should be below 200ms
  // },
};

const data = new SharedArray('sites', function () {
  // here you can open files, and then do additional processing or generate the array with data dynamically
  const f = open('./sites.txt').split('\n').filter(line => line.trim() !== '');
  
  // const f = JSON.parse(open('./sites.txt'));
  return f; // f must be an array[]
});
// const data = [
//   'simple-robin-scc.dicast.site',
//   'ace-locust-nyg.dicast.site',
//   'robust-octopus-3py.dicast.site',
//   'wondrous-ferret-qhs.dicast.site',
//   'infinite-gelding-meb.dicast.site',
//   'enjoyed-catfish-xqn.dicast.site',
//   'bugcantstop.dicast.site'
// ];

// The default exported function is gonna be picked up by k6 as the entry point for the test script. It will be executed repeatedly in "iterations" for the whole duration of the test.
export default function () {
  const site = data[Math.floor(Math.random() * data.length)];

  let params = {
    timeout: '360s'
  };

  // Make a GET request to the target URL
  const res = http.get('https://'+site, params);
  // const res = http.get('https://' + site);

  check(res, {
    'is status 200': (r) => r.status === 200,
  });

  // Log the error if the request failed
  // if (res.status !== 200) {
  //   console.error(`Request to ${site} failed with status ${res.status}`);
  // }

  // Sleep for 1 second to simulate real-world usage
  sleep(1);
}