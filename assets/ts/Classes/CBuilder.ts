const weekRegex = [/Sun/gi,/Mon/gi,/Tue/gi,/Wed/gi, /Thu/gi,/Fri/gi,/Sat/gi];
const monthsRegex = [/Jan/gi,/Feb/gi,/Mar/gi,/Apr/gi,/May/gi,/Jun/gi,/Jul/gi,/Aug/gi,/Sep/gi,/Oct/gi,/Nov/gi,/Dec/gi,];

export default class CBuilder {
    year: number;
    month: number;
    daysOfTheMonth: any[];

    constructor(month: number = 0, year: number=0 ) {
        this.month = month;
        this.year = year;
        return this;
    }
    calendar(month: number, year: number ){
        this.month = month;
        this.year = year;
        return this.buildCalendarData();
    }
    buildCalendarData() : any[] {
        const gridTotal: number = (6*7); // Six weeks Seven Days
        let weeks = [];
        let week = 0;
        let curDay=0;
        let weekDays = 6;

        this.daysOfTheMonth = [];
        this.daysOfTheMonth = this.getAllDays(this.month, this.year,);
        this.daysOfTheMonth = this.getDaysBefore(this.daysOfTheMonth, this.getWeekStartDay());
        this.daysOfTheMonth = this.getDaysAfter(this.daysOfTheMonth,gridTotal - this.daysOfTheMonth.length);

        weeks[week] = [];
        for(let i=0;i<this.daysOfTheMonth.length;i++){
            let day = this.daysOfTheMonth[i].split(' ')[2];
            if(parseInt(day) < 10 ){
                day=day.replace(/0/gi, '');
            }
            if(this.daysOfTheMonth[i].match(monthsRegex[this.month])){
                weeks[week][curDay] = day;
            } else {
                weeks[week][curDay] = '#'+day;
            }
            curDay++
            if(curDay>weekDays){
                week++;
                curDay=0
                weeks[week] = [];
            }
        }
        weeks.pop()
        return weeks;
    }
    getAllDays(month: number, year: number) {
        let date = new Date(year, month, 1);
        let days = [];
        while (date.getMonth() === month) {
            let dayToPush = new Date(date);
            days.push(dayToPush.toString());
            date.setDate(date.getDate() + 1);
        }
        return days;
    }
    getDaysBefore(allDays: any[], days: number){
        let pm = 0; let yy=this.year;
        if(this.month-1 >= 0){
            pm = this.month-1;
        } else{
            pm = 11;
            yy--;
        }
        let daysBefore = this.getAllDays(pm, yy);
        daysBefore =  daysBefore.slice(Math.max(daysBefore.length - days, 0))
        for(let i=daysBefore.length-1;i>=0;i--){
            allDays.unshift(daysBefore[i].toString());
        }
        return allDays;
    }
    getDaysAfter(allDays: any[], days: number){
        let nm = 0;let yy=this.year;
        if(this.month+1>11){
            nm = 0;
            yy++;
        }else {
            nm = this.month+1
        }
        let daysAfter = this.getAllDays(nm, yy).slice(0, days);
        for(let i = 0; i<daysAfter.length; i++){
            allDays.push(daysAfter[i].toString())
        }
        return allDays;
    }
    getWeekStartDay(){
        let stopNow = false, counter = 0;
        for(let i = 0; i<weekRegex.length; i++){
            if(this.daysOfTheMonth[0].match(weekRegex[i])){
                stopNow = true;
            } else {
                if (!stopNow) {
                    counter += 1;
                }
            }
        }
        return counter;
    }
}
