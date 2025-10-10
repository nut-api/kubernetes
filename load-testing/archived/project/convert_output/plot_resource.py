import numpy as np
import matplotlib.pyplot as plt
import csv
import argparse
import math

def collect_data(data_file) :
    foundation_cpu_usage = []
    foundation_mem_usage = []
    db_cpu_usage = []
    db_mem_usage = []
    with open(data_file, 'r') as csvfile:
        rows = csv.reader(csvfile, delimiter=',')
        next(rows)
        for row in rows :
            foundation_cpu_value = float(row[0])
            foundation_mem_value = int(row[2])*10**-6
            db_cpu_value = float(row[1])
            db_mem_value = int(row[3])*10**-6

            foundation_cpu_usage.append(foundation_cpu_value)
            foundation_mem_usage.append(foundation_mem_value)
            db_cpu_usage.append(db_cpu_value)
            db_mem_usage.append(db_mem_value)
    return foundation_cpu_usage,foundation_mem_usage,db_cpu_usage,db_mem_usage

def plot(y1,y2,y3,y4) :
    fig,(ax1,ax2)= plt.subplots(2,1)
    plt.subplots_adjust(hspace=0.6)

    ax1.plot(y1,linewidth=0.8,color="black",label='APIs control')
    ax1.plot(y2,linewidth=0.8,linestyle='dashed',color="black",label='Database')
    ax1.set_ylim([0,math.ceil(max(y1+y2))])
    # ax1.set_yticks(range(0,math.ceil(max(y1))+1))
    ax1.set_title('CPU usage')
    ax1.set_ylabel('CPU usage (core)')
    ax1.get_xaxis().set_visible(False)
    ax1.grid(color="black",linewidth=0.2,axis='y')
    ax1.legend(loc=2,framealpha=0.5)

    ax2.plot(y3,linewidth=0.8,color="black",label='APIs control')
    ax2.plot(y4,linewidth=0.8,linestyle='dashed',color="black",label='Database')
    ax2.set_ylim([0,math.ceil(max(y3+y4))+100])
    # ax2.set_yticks(range(0,math.ceil(max(y2))+1))
    ax2.set_title('Memory usage')
    ax2.set_ylabel('Memory usage(MiB)')
    ax2.get_xaxis().set_visible(False)
    ax2.grid(color="black",linewidth=0.2,axis='y')
    ax2.legend(loc=2,framealpha=0.5)


def main () :
    parser = argparse.ArgumentParser()
    parser.add_argument("--csvfile")
    args = parser.parse_args()
    file = str(args.csvfile)

    foundation_cpu_usage,foundation_mem_usage,db_cpu_usage,db_mem_usage = collect_data(file)
    plot(foundation_cpu_usage,db_cpu_usage,foundation_mem_usage,db_mem_usage)
    plt.show()

if __name__ == '__main__':
    print('Plotting Graph')
    main()
    print('Exit Graph')