
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: 
  [
    { duration: '2m', target: 300 },
    { duration: '4m', target: 300 },
    { duration: '2m', target: 0 },
  ],
};

// The default exported function is gonna be picked up by k6 as the entry point for the test script. It will be executed repeatedly in "iterations" for the whole duration of the test.
export default function () {
  // Make a GET request to the target URL
  http.get('https://robust-octopus-3py.dicast.site/');

  // Sleep for 1 second to simulate real-world usage
  sleep(1);
}