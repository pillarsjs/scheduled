/* jslint node: true */
"use strict";

global.modulesCache = global.modulesCache || {};
if(global.modulesCache['scheduled']){
  module.exports = global.modulesCache['scheduled'];
  return;
}

var crier = require('crier').addGroup('scheduled');
var ObjectArray = require('objectarray');
var i18n = require('textualization');
require('date.format');

i18n.load('scheduled',__dirname+'/languages/');

module.exports = global.modulesCache['scheduled'] = Scheduled;
Scheduled.jobs = new ObjectArray();
Scheduled.close = function(){
  for(var i=0,l=Scheduled.jobs.length;i<l;i++){
    Scheduled.jobs[i].stop();
  }
  crier.info('close');
};
function Scheduled(config){
  var scheduled = this;

  scheduled.id = (new Date()).format('{YYYY}{MM}{DD}{hh}{mm}{ss}{mss}',true)+Math.round(Math.random()*1000000000000000).toString(36);

  var pattern;
  Object.defineProperty(scheduled,"pattern",{
    enumerable : true,
    get : function(){return pattern;},
    set : function(set){
      try {
        scheduled.cursor = new CronCursor(set);
      } catch(error){
        crier.info('error',{job:this,error:error});
        return error;
      }
      pattern = set;
      if(scheduled.timer){
        return scheduled.start();
      } else {
        return true;
      }
    }
  });

  scheduled.configure(config);
  Scheduled.jobs.insert(this);
  crier.info('new',{job:this});
  if(scheduled.autoStart){
    scheduled.start();
  }
}
  Scheduled.prototype.configure = function configure(config){
    for(var i=0,k=Object.keys(config),l=k.length;i<l;i++){
      this[k[i]]=config[k[i]];
    }
    return this;
  };
  Scheduled.prototype.start = function(){
    if(!this.cursor){
      var error = new Error("Scheduled without pattern");
      crier.info('error',{job:this,error:error});
    } else {
      this.stop();
      try {
        var now = new Date();
        var lapse = this.cursor.lapse(now);
        this.next = new Date(now.getTime()+lapse);
        this.timer = setTimeout(this.launch.bind(this),lapse);
        crier.info('start',{job:this});
      } catch(error){
        crier.info('error',{job:this,error:error});
      }
    }
    return this;
  };
  Scheduled.prototype.stop = function(){
    this.next = undefined;
    if(this.timer){
      clearTimeout(this.timer);
      this.timer = undefined;
      crier.info('stop',{job:this});
    }
    return this;
  };
  Scheduled.prototype.launch = function(){
    var result;
    try {
      crier.info('launch',{job:this});
      result = this.task(this.callback);
    } catch(error) {
      crier.info('error',{job:this,error:error});
      result = error;
    }
    this.last = this.next;
    this.start();
    return result;
  };
  Scheduled.prototype.clear = function(){
    crier.info('clear',{job:this});
    Scheduled.jobs.remove(this.id);
  };




function CronCursor(pattern){
  var cursor = this;
  cursor.pattern = pattern || '';

  var segments = pattern.split(' ');
  if(segments.length <= 6){
    try {
      cursor.ctrl = {
        minute : cronSegmentCtrl(segments[0] || '*',0,59),
        hour : cronSegmentCtrl(segments[1] || '*',0,23),
        monthday : cronSegmentCtrl(segments[2] || '*',1,31),
        month : cronSegmentCtrl(segments[3] || '*',1,12),
        weekday : cronSegmentCtrl(segments[4] || '*',1,7),
        year : cronSegmentCtrl(segments[5] || '*',1000,3000)
      };
    } catch(error) {
      throw error;
    }
  } else {
    throw new Error('Invalid format "'+pattern+'"');
  }
}
  CronCursor.prototype.next = function(date){
    var week = [7,1,2,3,4,5,6];
    date = date || new Date();
    date = new Date(date.getTime());
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    this.nextMinute(date);
    var limiter = 0;
    while(true){
      if(limiter > 1000){
        throw new Error('Crontimer Error, limit overflow for "'+this.pattern+'"');
      }
      limiter++;
      if(!this.ctrl.year(date.getUTCFullYear())){
        this.nextYear(date);
        continue;
      }
      if(!this.ctrl.month(date.getUTCMonth()+1)){
        this.nextMonth(date);
        continue;
      }
      if(!this.ctrl.monthday(date.getUTCDate())){
        this.nextDate(date);
        continue;
      }
      if(!this.ctrl.weekday(week[date.getUTCDay()])){
        this.nextDate(date);
        continue;
      }
      if(!this.ctrl.hour(date.getUTCHours())){
        this.nextHour(date);
        continue;
      }
      if(!this.ctrl.minute(date.getUTCMinutes())){
        this.nextMinute(date);
        continue;
      }
      break;
    }
    return date;
  };
  CronCursor.prototype.lapse = function(date){
    date = date || new Date();
    var start = date.getTime();
    var end = this.next(date).getTime();
    return end-start;
  };
  CronCursor.prototype.monthDays = function(date){
    var nextMonth = new Date(date.getTime());
    nextMonth.setUTCMonth(nextMonth.getUTCMonth()+1);
    nextMonth.setUTCDate(0);
    return nextMonth.getUTCDate();
  };
  CronCursor.prototype.nextYear = function(date){
    var current = date.getUTCFullYear();
    var next = this.ctrl.year(current,true);
    if(next <= current){
      throw new Error('Out of range.');
    }
    date.setUTCMinutes(0);
    date.setUTCHours(0);
    date.setUTCDate(1);
    date.setUTCMonth(0);
    date.setUTCFullYear(next);
    return date;
  };
  CronCursor.prototype.nextMonth = function(date){
    var current = date.getUTCMonth()+1;
    var next = this.ctrl.month(current,true);
    if(next <= current){
      return this.nextYear(date);
    } else {
      date.setUTCMinutes(0);
      date.setUTCHours(0);
      date.setUTCDate(1);
      date.setUTCMonth(next-1);
      return date;
    }
  };
  CronCursor.prototype.nextDate = function(date){
    var current = date.getUTCDate();
    var next = this.ctrl.monthday(current,true);
    if(next <= current || next > this.monthDays(date)){
      return this.nextMonth(date);
    } else {
      date.setUTCMinutes(0);
      date.setUTCHours(0);
      date.setUTCDate(next);
      return date;
    }
  };
  CronCursor.prototype.nextHour = function(date){
    var current = date.getUTCHours();
    var next = this.ctrl.hour(current,true);
    if(next <= current){
      return this.nextDate(date);
    } else {
      date.setUTCMinutes(0);
      date.setUTCHours(next);
      return date;
    }
  };
  CronCursor.prototype.nextMinute = function(date){
    var current = date.getUTCMinutes();
    var next = this.ctrl.minute(current,true);
    if(next <= current){
      return this.nextHour(date);
    } else {
      date.setUTCMinutes(next);
      return date;
    }
  };

function cronSegmentCtrl(value,min,max){
  min = parseInt(min, 10);
  max = parseInt(max, 10);
  var each,range,first,last;
  if(/^\*$/.test(value)){ // *
    return function(value,next){
      if(value === false){return min;}
      if(next){
        value++;
        if(value > max || value < min){
          return min;
        }
        return value;
      } else {
        if(value > max || value < min){
          return false;
        }
        return true;
      }
    };

  } else if(/^([0-9]+|[0-9]+-[0-9]+)+(,([0-9]+|[0-9]+-[0-9]+))*$/.test(value)){ // num,num,num-num
    var values = value.split(',');
    last = min;
    var numbers = [];
    var ranges = [];
    var i,l;
    for(i=0,l=values.length;i<l;i++){
      var num = values[i];
      if(/^[0-9]+-[0-9]+$/.test(num)){ // num-num
        range = num.split('-');
        range[0] = parseInt(range[0], 10);
        range[1] = parseInt(range[1], 10);
        if(last > range[0] || (i > 0 && last === range[0]) || range[0] >= range[1] || range[1] > max){
          throw new Error('Incorrect range '+num+' in "'+value+'", check the sintax and use correct incremental values.');
        }
        ranges.push(range);
        last = range[1];
        if(first === undefined){first = range[0];}
      } else { // num
        num = parseInt(num, 10);
        if(last > num || (i > 0 && last === num) || num > max){
          throw new Error('Incorrect value '+num+' in "'+value+'", check the sintax and use correct incremental values.');
        }
        numbers.push(num);
        last = num;
        if(first === undefined){first = last;}
      }
    }
    return function(value,next){
      var range;
      if(value === false){
        return first;
      }
      if(next){
        value++;
        var nfound;
        for(i=0,l=numbers.length;i<l;i++){
          var number = numbers[i];
          if(number >= value){
            nfound = number;
            break;
          }
        }
        var rfound;
        for(i=0,l=ranges.length;i<l;i++){
          range = ranges[i];
          if(value <= range[1]){
            rfound = value>range[0]?value:range[0];
            break;
          }
        }
        if(nfound === undefined){
          return rfound || first;
        }
        if(rfound === undefined){
          return nfound || first;
        }
        return Math.min(nfound,rfound);
      } else {
        if(numbers.indexOf(parseInt(value, 10)) >= 0){
          return true;
        } else {
          for(i=0,l=ranges.length;i<l;i++){
            range = ranges[i];
            if(value >= range[0] && value <= range[1]){
              return true;
            }
          }
          return false;
        }
      }
    };
  } else if(/^\*\/[0-9]+$/.test(value)){ // */num
    each = parseInt(value.replace(/^\*\//,''), 10);
    return function(value,next){
      if(value === false){
        return min;
      }
      var base = value-min;
      if(next){
        if(value < min || value >= max){
          return min;
        }
        value++;
        base++;
        if(base%each !== 0){
          value = value-(base%each)+each;
        }
        if(value > max){
          return min;
        }
        return value;
      } else {
        if(value < min || value > max){
          return false;
        }
        return base%each === 0;
      }
    };
  } else if(/^[0-9]+-[0-9]+\/[0-9]+$/.test(value)){ // num/num
    each = parseInt(value.replace(/^[0-9]+-[0-9]+\//,''), 10);
    range =value.replace(/\/[0-9]+$/,'').split('-');
    first = parseInt(range[0], 10);
    last = parseInt(range[1], 10);
    if(first < min || last > max){
      throw new Error('Incorrect range "'+value+'" for min:"'+min+'", max:"'+max+'" limits.');
    }
    return function(value,next){
      if(value === false){
        return first;
      }
      var base = value-first;
      if(next){
        if(value < first || value >= last){
          return first;
        }
        value++;
        base++;
        if(base%each !== 0){
          value = value-(base%each)+each;
        }
        if(value > last){
          return first;
        }
        return value;
      } else {
        if(value < first || value > last){
          return false;
        }
        return base%each === 0;
      }
    };
  } else {
    throw new Error('Incorrect value "'+value+'", check the sintax.');
  }
}

/* ---------------------------- *

testing('1,10-20,25,30-31',0,60,[
    {value:0,check:false,next:1},
  {value:1,check:true,next:10},
  {value:5,check:false,next:10},
  {value:10,check:true,next:11},
  {value:19,check:true,next:20},
  {value:20,check:true,next:25},
  {value:21,check:false,next:25},
  {value:30,check:true,next:31},
  {value:31,check:true,next:1},
    {value:32,check:false,next:1}
]);

testing('5-10,20-25,35',0,60,[
    {value:0,check:false,next:5},
  {value:4,check:false,next:5},
  {value:5,check:true,next:6},
  {value:6,check:true,next:7},
  {value:10,check:true,next:20},
  {value:11,check:false,next:20},
  {value:20,check:true,next:21},
    {value:24,check:true,next:25},
    {value:25,check:true,next:35},
  {value:30,check:false,next:35},
  {value:35,check:true,next:5},
    {value:36,check:false,next:5}
]);

testing('*',1,60,[
    {value:0,check:false,next:1},
  {value:1,check:true,next:2},
  {value:5,check:true,next:6},
  {value:10,check:true,next:11},
  {value:19,check:true,next:20},
  {value:20,check:true,next:21},
  {value:21,check:true,next:22},
  {value:60,check:true,next:1},
  {value:61,check:false,next:1},
]);

testing('* /3',1,60,[
    {value:0,check:false,next:1},
  {value:1,check:true,next:4},
  {value:2,check:false,next:4},
  {value:3,check:false,next:4},
  {value:4,check:true,next:7},
  {value:6,check:false,next:7},
  {value:7,check:true,next:10},
  {value:8,check:false,next:10}
]);

testing('* /3',0,60,[
    {value:0,check:true,next:3},
  {value:1,check:false,next:3},
  {value:2,check:false,next:3},
  {value:3,check:true,next:6},
  {value:4,check:false,next:6},
  {value:6,check:true,next:9},
  {value:7,check:false,next:9},
  {value:8,check:false,next:9}
]);

testing('* /2',0,9,[
    {value:0,check:true,next:2},
  {value:1,check:false,next:2},
  {value:2,check:true,next:4},
  {value:3,check:false,next:4},
  {value:4,check:true,next:6},
  {value:6,check:true,next:8},
  {value:7,check:false,next:8},
  {value:8,check:true,next:0}
]);

testing('5-10/3',0,60,[
    {value:0,check:false,next:5},
  {value:1,check:false,next:5},
  {value:2,check:false,next:5},
  {value:3,check:false,next:5},
  {value:5,check:true,next:8},
  {value:6,check:false,next:8},
  {value:7,check:false,next:8},
    {value:8,check:true,next:5}
]);

testing('5-10/3',1,60,[
    {value:0,check:false,next:5},
  {value:1,check:false,next:5},
  {value:2,check:false,next:5},
  {value:3,check:false,next:5},
  {value:5,check:true,next:8},
  {value:6,check:false,next:8},
  {value:7,check:false,next:8},
    {value:8,check:true,next:5}
]);

testing('5-20/5',0,20,[
    {value:0,check:false,next:5},
  {value:1,check:false,next:5},
  {value:4,check:false,next:5},
  {value:5,check:true,next:10},
  {value:6,check:false,next:10},
  {value:9,check:false,next:10},
    {value:10,check:true,next:15},
    {value:16,check:false,next:20},
    {value:19,check:false,next:20},
    {value:20,check:true,next:5},
    {value:21,check:false,next:5},
]);

console.log('END');
function testing(format,min,max,tests){
    var func = cronSegmentCtrl(format,min,max);
  for(var i in tests){
    var test = tests[i];
    var check = func(test.value);
    var next = func(test.value,true);
    if(check!=test.check){
      console.log('Fail check "'+format+'"('+min+','+max+'):',test.value,' is ',check,' not ',test.check);
    }
    if(next!=test.next){
      console.log('Fail next "'+format+'"('+min+','+max+'):',test.value,' is ',next,' not ',test.next);
    }
  }
}

/* ---------------------------- *

var date = new Date(0);
date.setYear(2014);
date.setMonth(10); // 0-11
date.setDate(23); // 1-31
date.setHours(12); // 0-59
date.setMinutes(30); // 0-23
tester(date);

function tester(date){
  date = new Date();
  var cron = '* /10 18,21,22,23 21,22,23 * * *';
  
  var cursor = new CronCursor(cron);
  var next = cursor.next(date);
  var lapse = cursor.lapse(date);
  console.log('Date:             ',date);
  console.log('patrón:             ',cron);
  console.log('proxima ocurrencia  ',next.toString());
}

/* ---------------------------- */