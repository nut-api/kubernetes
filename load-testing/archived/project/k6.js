import http from 'k6/http'
import { sleep,} from 'k6';
import { SharedArray } from 'k6/data';

const queries = JSON.parse(open('./load-tester-queries.json'))
const duration = `${__ENV.DURATION}`+'s';
const init = parseInt(`${__ENV.LOAD_STEP}`)
const step = parseInt(`${__ENV.LOAD_STEP}`)

// const cursors = new SharedArray('collect cursor', function(){
//   const f = open('./gather_cursor/cursors.csv').split("\n");
//   return f;
// })

export const options = {
  summaryTimeUnit: 's',
  stages: [
    // { duration: duration, target: 450 }, // below normal load
    // { duration: duration, target: 450 },
    { duration: duration , target: init }, // below normal load
    { duration: duration , target: init },
    { duration: duration, target: init+step }, // normal load
    { duration: duration, target: init+step },
    { duration: duration, target: init+(2*step) }, // around the breaking point
    { duration: duration, target: init+(2*step) },
    { duration: duration, target: init+(3*step) }, // beyond the breaking point
    { duration: duration, target: init+(3*step) },
    { duration: duration, target: init+(4*step) }, // beyond the breaking point
    { duration: duration, target: init+(4*step) },
    { duration: duration, target: 0 }, // scale down. Recovery stage.
  ],

  thresholds: {
    http_req_failed: [{threshold:'rate<0.01', abortOnFail: true}] // abort test when error rate higher than 1%
  },
};

export default function() {
  for (const query of queries) {

    var num_query = 20;
    // const cursor = cursors[Math.floor(Math.random()*10000)]
    const cursor = "NDI2NjczMzUtYmNmMS00NDdiLThhYTYtNDgzZDAyNjAxY2Ey"
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
