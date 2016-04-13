#optimisation project

happn random activity testing
-----------------------------
*we have a happn  instance on 104.236.47.15, the happn-random-activity-generator is running on the box as well, this is so we can test happns consumption profile over time, the code for this test lives under the folder random-longrunning-activity*

happn performance monitoring
-----------------------------
*we are going to run a series of tests that monitor what parts of happn use the most CPU cycles*

have test app installed on 178.62.103.124
in /root/projects/happner-optimisation

the test is actually run as a service via:
start/stop happn-random-longrunning

http://www.brendangregg.com/blog/2014-09-17/node-flame-graphs-on-linux.html

running process 6155
//recording for 10 minutes of activity
perf record -F 99 -p 6155 sleep 600
//started Tues APR 12 15:08
//ended Tues APR 12 25:08
//returned the following:
[ perf record: Woken up 1 times to write data ]
[ perf record: Captured and wrote 0.025 MB perf.data (~1101 samples) ]


