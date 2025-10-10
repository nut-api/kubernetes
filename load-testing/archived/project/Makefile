# Script
K6=./k6.js
K6_STEADY_TEST=./k6_steady_test.js
JSON2CSV=./convert_output/json2csv.py
PLOT_RESPONSE=./convert_output/plot.py 
PLOT_RESPONES_RANGE=./convert_output/plot_range.py
QUERY_RESOURCE=./convert_output/query_csv.py
PLOT_RESOURCE=./convert_output/plot_resource.py

# Files
JSON_FILE=test_result.json
RESPONSE_CSV_FILE=./result/${SERVER}_${LOAD_STEP}_${STEP_DURATION}.csv
RESPONSE_FULL_CSV_FILE=./result/${SERVER}_${LOAD_STEP}_${STEP_DURATION}full.csv
STEADY_CSV_FILE=./result/steady_${SERVER}__${LOAD}_${STEADY_STEP_DURATION}.csv
STEADY_FULL_CSV_FILE=./result/steady_${SERVER}__${LOAD}_${RAMP_DURATION}_${STEADY_STEP_DURATION}full.csv
RESOURCE_CSV_FILE=./result/${SERVER}_${LOAD_STEP}_${STEP_DURATION}_resource.csv

# Arguments

SERVER= "1x2-1x2"
LOAD_STEP= 1000
STEP_DURATION=120#second

full_test: 
	make -j 2 full_response_test full_resourse_test

full_response_test: 
	+make response_test
	+make json2csv 
#	+make plot_response
full_resourse_test:
	+make resource_test
	+make plot_resource

response_test: 
	k6 run --out json=test_result.json ${K6} -e DURATION=${STEP_DURATION} -e LOAD_STEP=${LOAD_STEP}
resource_test:
	python3 ${QUERY_RESOURCE} --step-duration ${STEP_DURATION} --output-file ${RESOURCE_CSV_FILE}

json2csv: 
	python3 ${JSON2CSV} --input-file ${JSON_FILE} --output-file ${RESPONSE_CSV_FILE} --output-file-2 ${RESPONSE_FULL_CSV_FILE} 


# plot
plot_all:
	make -j 2 plot_response plot_resource
plot_response:
	python3 ${PLOT_RESPONSE} --csvfile ${RESPONSE_CSV_FILE} --csvfile-full ${RESPONSE_FULL_CSV_FILE} --load-step ${LOAD_STEP} --step-duration ${STEP_DURATION}
plot_resource:
	python3 ${PLOT_RESOURCE} --csvfile ${RESOURCE_CSV_FILE}

# Steady test ------------------------------------------------------

RAMP_DURATION=60
STEADY_STEP_DURATION=10#second
LOAD=8000

steady_test:
#	k6 run --out json=test_result.json ${K6_STEADY_TEST} -e DURATION=${STEADY_STEP_DURATION} -e LOAD=${LOAD} -e RAMP_DURATION=${RAMP_DURATION}
	python3 ${JSON2CSV} --input-file ${JSON_FILE} --output-file ${STEADY_CSV_FILE} --output-file-2 ${STEADY_FULL_CSV_FILE}
	python3 ${PLOT_RESPONES_RANGE} --csvfile ${STEADY_CSV_FILE} --csvfile-full ${STEADY_FULL_CSV_FILE} --load-step ${LOAD} --step-duration ${STEADY_STEP_DURATION}

plot_response_range:
	python3 ${PLOT_RESPONES_RANGE} --csvfile ${STEADY_CSV_FILE} --csvfile-full ${STEADY_FULL_CSV_FILE} --load-step ${LOAD} --step-duration ${STEADY_STEP_DURATION}

#------------------
sync:
	rsync -avz --rsh="ssh -p 22" nut@10.1.10.24:/home/nut/Nut/Workspace/k6-load-tester/result . 