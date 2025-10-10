#!/usr/bin/python3

import requests
import time
import subprocess

url = "https://suaysuay.shop/"  # Replace with your actual target URL
output_file = "output.txt"  # Name of the output file

while True:
    try:
        start_time = time.time()
        process = subprocess.run(["curl", "-Iv", url], capture_output=True, text=True, check=True)

        request_time = time.time() - start_time

        with open(output_file, "a") as f:  # Append to the output file
            f.write(process.stdout)
            f.write(process.stderr)
            f.write("\n\n============\n============\n\n")

        if request_time > 15:
            break

        print(f"Request time: {request_time:.2f} seconds")
        time.sleep(1)  # Delay between retries

    except subprocess.CalledProcessError as e:
        print(f"Request failed: {e}")
        with open(output_file, "a") as f:
            f.write(f"Request failed: {e}\n")  # Log error to output file
        time.sleep(1)  # Delay before retrying

print("Request took longer than 15 seconds!")

