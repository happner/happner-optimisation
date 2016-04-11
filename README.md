#optimisation project

happn random activity testing
-----------------------------
*we have a happn  instance on 104.236.47.15, the happn-random-activity-generator is running on the box as well, this is so we can test happns consumption profile over time, the code for this test lives under the folder random-longrunning-activity*

happn performance monitoring
-----------------------------
*we are going to run a series of tests that monitor what parts of happn use the most CPU cycles*

have test app installed on 178.62.103.124
in /root/projects/happner-optimisation

running the test code

dtrace -n 'profile-97/pid == 61005 && arg1/{@[jstack(150, 8000)] = count(); } tick-60s { exit(0); }' > stacks.out


