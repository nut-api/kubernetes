import time
import requests
import pandas as pd
import matplotlib.pylab as plt
import argparse

query_cpu_param = 'sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{cluster="", namespace="load-testing"}) by (pod)'
query_mem_param = 'sum(container_memory_working_set_bytes{cluster="", namespace="load-testing",container!="", image!=""}) by (pod)'

def query(query) :
    response = requests.get('http://20.212.33.104:31067/api/v1/query',
            params={'query': query})
    results = response.json()['data']['result']
    return results

def query_cpu(foundation,postgresd) :
    results = query(query_cpu_param)
    for result in results : 
        if result['metric']['pod'].split("-")[0] == 'foundation' :
            foundation.append(float(result['value'][1]))
        elif result['metric']['pod'].split("-")[0] == 'postgresd' :
            postgresd.append(float(result['value'][1]))
        else :
            continue

def query_mem(foundation,postgresd) :
    results = query(query_mem_param)
    for result in results : 
        if result['metric']['pod'].split("-")[0] == 'foundation' :
            foundation.append(int(result['value'][1]))
        elif result['metric']['pod'].split("-")[0] == 'postgresd' :
            postgresd.append(int(result['value'][1]))
        else :
            continue

def to_csv(foundation_cpu_data,database_cpu_data,foundation_mem_data,database_mem_data,output_file) :
    df = pd.DataFrame({'foundation_cpu_usage':foundation_cpu_data,
                        'database_cpu_usage':database_cpu_data,
                        'foundation_mem_usage':foundation_mem_data,
                        'database_mem_usage':database_mem_data})
    df.to_csv(output_file, index=False)

def main() :
    foundation_cpu_usage = []
    foundation_mem_usage = []
    database_cpu_usage = []
    database_mem_usage = []
    parser = argparse.ArgumentParser()
    parser.add_argument("--step-duration")
    parser.add_argument("--output-file")
    args = parser.parse_args()
    test_duration = int(args.step_duration)*9+60
    for i in range(int(test_duration/20)) :
        query_cpu(foundation_cpu_usage,database_cpu_usage)
        query_mem(foundation_mem_usage,database_mem_usage)
        time.sleep(20)
    to_csv(foundation_cpu_usage,database_cpu_usage,foundation_mem_usage,database_mem_usage,args.output_file)


if __name__ == '__main__':
    print('Start query resource usage...')
    main()
    print('DONE!!!')