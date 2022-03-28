import http from 'k6/http'
import { sleep,} from 'k6';
import { SharedArray } from 'k6/data';

const queries = JSON.parse(open('./load-tester-queries.json'))
const duration = String(parseInt(`${__ENV.DURATION}`)*5)+'s';
const ramp = `${__ENV.RAMP_DURATION}`+'s';
const load = parseInt(`${__ENV.LOAD}`)


const cursors = new SharedArray('collect cursor', function(){
  const f = open('./gather_cursor/cursors.csv').split("\n");
  return f;
})

export const options = {
  summaryTimeUnit: 's',
  stages: [
    // { duration: duration, target: 450 }, // below normal load
    // { duration: duration, target: 450 },
    { duration: ramp, target: load }, // below normal load
    { duration: duration, target: load },
    { duration: ramp, target: 0 }, // scale down. Recovery stage.
  ],

  thresholds: {
    http_req_failed: [{threshold:'rate<0.01', abortOnFail: true}] // abort test when error rate higher than 1%
  },
};

export default function() {
  for (const query of queries) {

    var num_query = 50;
    const cursor = cursors[Math.floor(Math.random()*10000)]
    const url = 'http://foundation.loadtest.local/query'
    const params = { headers: { 'Content-Type': 'application/json' } }
    const payload = JSON.stringify({
      query: query.query,
      variables: {"first": num_query, "after": cursor},
    })
    const resp = http.post(url, payload, params);
    // check(resp, {
    //   'is status 200': (r) => r.status === 200,
    // });
    if (resp.status!= 200) console.log(resp.error);
    // console.log(resp.body)

  };
  sleep(1);
}
