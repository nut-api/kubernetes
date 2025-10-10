import http from 'k6/http'
import { sleep,} from 'k6';


const queries = JSON.parse(open('./easygraphql-load-tester-queries.json'))


export const options = {    
    summaryTimeUnit: 'ms',
    vus: 1,
    duration:'30s',
};

export default function() {
  for (const query of queries) {
    var num_query = Math.floor(Math.random()*50);
    const url = 'http://13.76.141.64:30581/query'
    const payload = JSON.stringify({
      query: query.query,
      variables: {"first": num_query+1} ,
    })
    const params = { headers: { 'Content-Type': 'application/json' } }
    const resp = http.post(url, payload, params);
    console.log(resp.body);
  };
  // sleep(2);
}

 