
//slow activity, no sets - fast reporting intervals
module.exports = {
	"random":{
		"interval":1000,
		"percentageGets":[60,100],
		"percentageSets":[0,0],
		"percentageRemoves":[30,60],
		"percentageOns":[0,30],
		"initialDataRemoveCount":200,
		"initialDataOnCount":200,
		"initialDataGetCount":200,
		"randomDataSize":3,
		"onTimeout":100
	},
	"usage":{
		"DUMP_INTERVAL":1000 * 60 * 30,//30 minutes
		"STATS_INTERVAL":10000,//10 seconds
		"GC_INTERVAL":1000 * 60 * 1//1 minute
	}
}