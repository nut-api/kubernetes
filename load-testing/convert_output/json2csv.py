import json
import pandas as pd
import argparse
import statistics

def extract_data(json_lines):
    data = []

    for line in json_lines:
        obj = json.loads(line)
        if obj["type"] != "Point":
            continue

        obj_data = obj['data']
        timestamp = obj_data['time'][11:19]
        metric = obj['metric']
        value = obj_data['value']

        data.append([metric, timestamp, value])

    return data

def gen_csv_http_req_result(dataset):
    result1 = []
    result2 = []
    vus = "1"
    time= ""
    durations = []
    duration = float
    # sending = []
    # waiting = []
    # receiving = []
    # count = 1
    for row in dataset:
        metric = row[0]
        timestamp = row[1]
        value = row[2]
        if metric == 'vus':
            vus = value
            continue
        # if count == 1:
        if metric == 'http_req_duration':
            durations.append(float(value))
            duration = value
        # elif metric == 'http_req_sending':
        #     sending.append(float(value))
        # elif metric == 'http_req_waiting':
        #     waiting.append(float(value))
        elif metric == 'http_req_receiving':
            # receiving.append(float(value))
            if timestamp != time :
                result1.append([timestamp,statistics.mean(durations), vus])
                time = timestamp
                durations = []
                # sending = []
                # waiting = []
                # receiving = []
            result2.append([timestamp, duration, vus])
            # count = 0
            continue
        # else: 
        #     if metric == 'http_req_receiving' :
        #         count += 1
            

    df1 = pd.DataFrame(result1, columns=['timestamp','http_req_duration','vus'])
    df2 = pd.DataFrame(result2, columns=['timestamp','http_req_duration','vus'])
    return df1.to_csv(index=False) , df2.to_csv(index=False)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-file")
    parser.add_argument("--output-file")
    parser.add_argument("--output-file-2")
    args = parser.parse_args()


    file = open(args.input_file, "r")
    lines = file.readlines()
    csvfile = open(args.output_file, "w")
    csvfile_full = open(args.output_file_2, "w")
 
    extracted_data = extract_data(json_lines=lines)

    http_req_duration_csv,http_req_duration_csv_full= gen_csv_http_req_result(extracted_data)
    csvfile.write(http_req_duration_csv)
    csvfile_full.write(http_req_duration_csv_full)

    file.close()
    csvfile.close()
    csvfile_full.close()
 
if __name__ == '__main__':
    print('start converting...')
    main()
    print('DONE!!! -> test_result.csv')