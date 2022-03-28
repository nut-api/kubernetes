from lib2to3.pgen2.token import VBAREQUAL
from pickle import FALSE
import numpy as np
import matplotlib
matplotlib.use('TKAgg')
import matplotlib.pyplot as plt
import csv
import math
import statistics
import argparse

def collect_data(data_file,step,step_duration) :
    time = []
    values = []
    vus = []
    avgs_duration = []
    s_d = []
    p90 = []
    p95 = []
    with open(data_file,'r') as csvfile:
        rows = csv.reader(csvfile, delimiter=',')
        next(rows)
        durations = []
        steady_state = False
        last_nVus = 0
        count = 0
        for row in rows:
            timeStr = row[0]
            reqDuration = float(row[1])
            nVus = int(row[2])

            time.append(timeStr)
            values.append(reqDuration/1000)
            vus.append(nVus)
            if nVus < last_nVus : # Skip down state
                avgs_duration.append(statistics.mean(durations))
                s_d.append(statistics.stdev(durations))
                p90.append(np.percentile(durations,90))
                p95.append(np.percentile(durations,95))
                break
            if steady_state :
                if nVus != step :
                    steady_state = False
                else:
                    durations.append(reqDuration/1000)
                    last_nVus = nVus
            else:
                if nVus == step :
                    steady_state = True
    return time,values,vus,avgs_duration,s_d,p90,p95

def plot(x1,y1,y1_2,avg,sd,step,p90,p95,duration) :
    state = "ramp"
    x_labels = []
    count = 0
    for i,v in enumerate(y1_2):
      if state == "ramp":
        if v%step == 0 :
            state = "steady"
            x_labels.append(i)
      if state == "steady":
        if v < step :
          state = "down"
        if count < (duration-1):
            count += 1
        else:
            x_labels.append(i)
            count = 0

    # First fig.
    fig,(ax1,ax2)= plt.subplots(2,1)
    plt.subplots_adjust(hspace=0.33)
    ax1_2=ax1.twinx()
    ax1.plot(x1,y1_2,linestyle='dashed', label="Virtual Users",linewidth=1,color="black")
    ax1_2.scatter(x1,y1,s=0.5,c="black",label="HTTP Request Duration")
    # Style
    ax1.set_xlabel("Time(min)",fontsize=10)
    ax1_2.set_ylabel("Duration time(s)",fontsize=10)
    ax1.set_ylabel("Virtual Users(VUs)",fontsize=10)   
    ax1.set_ylim([0,math.ceil(max(y1_2))+math.ceil(max(y1_2))*0.2])
    x1_labels = np.arange(0,int(len(x_labels)),1)
    x1_labels = [str((i*duration)//60)+'.'+str((i*duration)%60) for i in x1_labels]
    ax1.set_xticks(x_labels)
    ax1.set_xticklabels(x1_labels)
    ax1_2.set_yticks(range(0,math.ceil(max(y1))+1,2))
    ax1_2.set_ylim(0,30)

    ax1.set_yticks(range(0,math.ceil(max(y1_2))+1,step))
    fig.legend(loc="upper left", bbox_to_anchor=(0,1), bbox_transform=ax1_2.transAxes,fontsize='small')
    ax1.grid(color="black",linewidth=0.3,axis='y')

    # Second fig.
    nx2 = np.arange(len(avg))
    x2_labels = np.arange(0,int(len(nx2)),1)
    x2_labels = [str((i*duration)//60)+'.'+str((i*duration)%60)+'-'+str(((i+1)*duration)//60)+'.'+str(((i+1)*duration)%60) for i in x2_labels]
    ax2.bar (nx2-0.3,sd,fill=False, hatch='----',width=0.2,label="Standard Deviation")
    ax2.bar (nx2-0.1,avg,fill=False, hatch='////',width=0.2,label="Average Duration Time")
    ax2.bar (nx2+0.1,p90,fill=False, hatch='....',width=0.2,label="90th Percentiles")
    ax2.bar (nx2+0.3,p95,fill=False, hatch='\\\\\\',width=0.2,label="95th Percentiles")
    # Style
    ax2.set_ylabel("Duration time(s)",fontsize=10)
    ax2.set_xlabel("Time(min)",fontsize=10)
    ax2.set_yticks(range(0,math.ceil(max(p95))+2,2))
    ax2.set_ylim([0,math.ceil(max(p95))+math.ceil(max(p95))*0.2])
    ax2.set_xticks(nx2)
    ax2.set_xticklabels(x2_labels)
    for i, v in enumerate(sd):                      # Show data on bar.
      ax2.text(i-0.4,v+0.1, round(v,2),fontsize=8)
    for i, v in enumerate(avg):                   
      ax2.text(i-0.2,v+0.1, round(v,2),fontsize=8)
    for i, v in enumerate(p90):
      ax2.text(i,v+0.1, round(v,2),fontsize=8)
    for i, v in enumerate(p95):
      ax2.text(i+0.2,v+0.1, round(v,2),fontsize=8)
    ax2.legend(loc='center', bbox_to_anchor=(0.5,0.9),ncol=2, fancybox=True,fontsize='small')

    plt.title("Load Testing Result")

def plot_result(x1,y1,y1_2,avg,sd,step,p90,p95,duration) :
    state = "ramp"
    x_labels = []
    count = 0
    for i,v in enumerate(y1_2):
      if state == "ramp":
        if v%step == 0 :
            state = "steady"
            x_labels.append(i)
      if state == "steady":
        if v < step :
          state = "down"
        if count < (duration-1):
            count += 1
        else:
            x_labels.append(i)
            count = 0

    # First fig.
    fig,ax2= plt.subplots(figsize=(9, 5))

    # Second fig.
    nx2 = np.arange(len(avg))
    x2_labels = np.arange(0,int(len(nx2)),1)
    x2_labels = [str((i*duration)//60)+'.'+str((i*duration)%60)+'-'+str(((i+1)*duration)//60)+'.'+str(((i+1)*duration)%60) for i in x2_labels]
    ax2.bar (nx2-0.3,sd,fill=False, hatch='----',width=0.2,label="Standard Deviation")
    ax2.bar (nx2-0.1,avg,fill=False, hatch='////',width=0.2,label="Average Duration Time")
    ax2.bar (nx2+0.1,p90,fill=False, hatch='....',width=0.2,label="90th Percentiles")
    ax2.bar (nx2+0.3,p95,fill=False, hatch='\\\\\\',width=0.2,label="95th Percentiles")
    # Style
    ax2.set_ylabel("Duration time(s)",fontsize=10)
    ax2.set_xlabel("Time(min)",fontsize=10)
    ax2.set_yticks(range(0,math.ceil(max(p95))+2,2))
    ax2.set_ylim([0,math.ceil(max(p95))+math.ceil(max(p95))*0.2])
    ax2.set_xticks(nx2)
    ax2.set_xticklabels(x2_labels)
    for i, v in enumerate(sd):                      # Show data on bar.
      ax2.text(i-0.4,v+0.1, round(v,2),fontsize=8)
    for i, v in enumerate(avg):                   
      ax2.text(i-0.2,v+0.1, round(v,2),fontsize=8)
    for i, v in enumerate(p90):
      ax2.text(i-0.05,v+0.1, round(v,2),fontsize=8)
    for i, v in enumerate(p95):
      ax2.text(i+0.2,v+0.1, round(v,2),fontsize=8)
    ax2.legend(loc='center', bbox_to_anchor=(0.5,0.9),ncol=2, fancybox=True,fontsize='small')

    plt.title("Load Testing Result")


def main ():

    parser = argparse.ArgumentParser()
    parser.add_argument("--csvfile")
    parser.add_argument("--csvfile-full")
    parser.add_argument("--load-step")
    parser.add_argument("--step-duration")
    args = parser.parse_args()
    file = str(args.csvfile)
    file2 = str(args.csvfile_full)
    load_step = int(args.load_step)
    step_duration = int(args.step_duration)

    # times,values,vus,avgs_duration,sd,p90,p95=collect_data(file,load_step,step_duration)
    times,values,vus,avgs_duration,sd,p90,p95=collect_data(file2,load_step,step_duration)
    # plot(times,values,vus,avgs_duration,sd,load_step,p90,p95,step_duration)
    plot_result(times,values,vus,avgs_duration,sd,load_step,p90,p95,step_duration)
    # plt.plot(values)
    plt.show()

if __name__ == '__main__':
    print('Plotting graph')
    main()
    print('Exit Graph')