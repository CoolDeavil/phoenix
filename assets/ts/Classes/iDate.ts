import extendDefaults from "../common/extendDefaults";
import RequestHTTP from "./requestHTTP";
import CBuilder from "./CBuilder";
import Slide from "./Slide";
const SELECTED_YEAR_CLASS = 'activeYear'
const TODAY_CLASS = 'today';
const OFF_DAY_CLASS = 'offDay';
const SELECTED_CLASS = 'selected';
const FORM_COMPONENT = 'datePicker';
const STAND_ALONE = 'iCalendar';
const RIGHT ='1';
const LEFT ='-1';

export default class IDate {
    private today = new Date();
    private defaults = {
        anchor: false,
        formInput: false,
        callOnEndTransition: (e:Event)=>{console.log("Default Calendar CallBack" , e )},
        callBack: false,
        validation: false,
        errorLabel: 'Invalid Date',
        endPoint: false,
        alignLeft: false,
        yearRange: 10,
        dateFormat: 'YYYY-MM-DD'
    }
    public months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];
    private readonly options: any;
    private readonly wrapper: HTMLElement;
    private clonedInput: HTMLInputElement;
    private yearIndex: number;
    private monthIndex: number;
    private userYearIndex: number;
    private userMonthIndex: number;
    private readonly yearList: HTMLElement;
    private maxScroll: number;
    private calendarLabel: HTMLElement;
    private yearListPanel: HTMLElement;
    private closeYearList: any;
    private readonly yearListLH: number;
    private monthSelector: HTMLElement;
    private http: RequestHTTP;
    private builder: CBuilder;
    private slider: Slide;
    private readonly calendarViewPort: HTMLElement;
    private calendarDropPanel: HTMLElement;
    private toggleCalendar: HTMLElement;
    private inputField: HTMLInputElement;
    private validationError: HTMLElement;
    private readonly serialID: number;
    private cancelYearSelection: HTMLElement;
    private btnToday: HTMLElement;
    private selectedDay: string;
    private readonly parentClass: string;
    private readonly instance: any;
    private readonly dateFormat: any;

    constructor(options:any) {
        this.options = extendDefaults(this.defaults, arguments[0]);
        this.serialID = Math.floor(Math.random() * 500);

        if(!this.options.anchor){
            console.log("No base element defined");
            return;
        }

        this.yearIndex = this.today.getFullYear();
        this.monthIndex = this.today.getMonth();
        this.userYearIndex = this.yearIndex;
        this.userMonthIndex = this.monthIndex;

        if(this.options.formInput) {
            this.clonedInput = document.querySelector(`input[name="${this.options.anchor}"]`);
            this.wrapper = IDate.formInputBody(this.options.alignLeft);
            this.clonedInput.classList.add('noShow');
            this.calendarDropPanel = this.wrapper.querySelector('.drop-content');
            this.toggleCalendar = this.wrapper.querySelector('.dropToggle');
            this.inputField = this.wrapper.querySelector('input[name="needle"]');
            this.validationError = this.wrapper.querySelector('.validationError');
            this.validationError.innerHTML= this.options.errorLabel;
            this.calendarDropPanel.innerHTML = this.buildCalendarBody()
            this.clonedInput.insertAdjacentElement('beforebegin', this.wrapper);
            this.parentClass = FORM_COMPONENT;

        }else {
            this.wrapper = document.querySelector(`#${this.options.anchor}`);
            this.wrapper.innerHTML = this.buildCalendarBody();
            this.parentClass = STAND_ALONE;
        }
        this.instance = this.wrapper;

        this.http = new RequestHTTP();
        this.builder = new CBuilder();
        this.yearListPanel = this.wrapper.querySelector('.yearSelectorLayer');
        this.yearList = this.wrapper.querySelector('.years');
        this.calendarLabel = this.wrapper.querySelector('.cLabel');
        this.monthSelector = this.wrapper.querySelector('.months');
        this.closeYearList = this.wrapper.querySelector('.times2');
        this.calendarViewPort = this.wrapper.querySelector('.viewPort');
        this.closeYearList = this.wrapper.querySelector('.times');
        this.cancelYearSelection = this.wrapper.querySelector('.times2');
        this.btnToday = this.wrapper.querySelector('.times3');
        this.selectedDay='';

        this.yearListLH = Math.round(parseFloat(window.getComputedStyle(this.yearList.querySelector('div')).getPropertyValue('height')))
        this.monthSelector.querySelectorAll('div')[this.monthIndex].classList.add('selected');
        this.maxScroll = this.getListMaxScroll();
        this.dateFormat = this.parseDateRules(this.options.dateFormat)
        this.setEventHandlers();
        if(this.options.endPoint){
            this.http.request({
                method:'get',
                targetURL: `${this.options.endPoint}${this.monthIndex+1}/${this.yearIndex}`,
                payload: ''
            }).then((d:any)=>{
                this.initializeSlider(JSON.parse(d));
            });
        }else{
            this.initializeSlider();
        }
        if(this.options.formInput){
                this.calendarDropPanel.classList.add('hidden_');
        }
        setTimeout(()=>{
            this.setCalendarDayEvents()
        },50);
        this.calendarLabel.innerHTML = this.months[this.monthIndex]+ ' / ' + this.yearIndex
        console.log('IDate v0.0.0 ',this.serialID, this.options);
    }
    initializeSlider(busyDays: any = null){
        this.slider = new Slide({
            anchor: this.calendarViewPort,
            card: this.renderMonthCard(this.builder.calendar(this.monthIndex,this.yearIndex),busyDays),
            callOnEndTransition: (e:any)=>{
                this.slideWrapEnded(e);
            },
        });
    }
    setDayToday(){
        this.yearIndex = this.today.getFullYear();
        this.monthIndex = this.today.getMonth();
        this.userYearIndex = this.yearIndex;
        this.userMonthIndex = this.monthIndex;
        let today = this.formatDate(this.monthIndex+1,parseInt(this.today.toString().split(' ')[2]),this.yearIndex);
        if(this.options.formInput){
            this.inputField.value = today;
            this.clonedInput.value = today;
            this.emitChangeEvent();
        }else{
            console.log("IRun STAND ALONE " , this.serialID  );
            if(this.options.callBack){
                this.options.callBack(today);
            }
        }
    }
    slideWrapEnded(e:any){
        if(e === 104 || e === 9999 ) {
            console.log('Initializing  ', e);
            return true;
        }
        this.enableNavEvents();
    }
    renderMonthCard(monthData: any, extraData: any = null){
        let template = `<table class="montCard"><thead></thead><tbody>`;
        for(let i=0;i<monthData.length;i++){
            template = template + '<tr>';
            for(let d=0;d<monthData[i].length;d++){
                let dayEntry = `<td class="__STYLE__"><div class="cd__ACTIVE__" data-calendar="__DATE__">__VALUE__</div></td>`;
                let style_ = '';
                if(monthData[i][d].match(/#/ig)){
                    dayEntry = dayEntry.replace(/__VALUE__/i, monthData[i][d].replace(/#/gi, ''));
                    dayEntry = dayEntry.replace(/__STYLE__/i, style_.replace(/^ /, ''));
                    dayEntry = dayEntry.replace(/__ACTIVE__/i, ' ' + OFF_DAY_CLASS);
                    dayEntry = dayEntry.replace(/__DATE__/i, '');
                } else {
                    // TODO Check for appointments for the day
                    let dateToLook = this.formatDate(monthData[i][d],this.monthIndex+1,this.yearIndex);
                    dayEntry = dayEntry.replace(/__VALUE__/i, monthData[i][d]);
                    dayEntry = dayEntry.replace(/__ACTIVE__/i, '');
                    dayEntry = dayEntry.replace(/__DATE__/i, this.formatDate(monthData[i][d],this.monthIndex+1,this.yearIndex));
                    if(this.isToday(dateToLook)){
                        style_ += TODAY_CLASS;
                    }
                    if(this.isSelected(dateToLook)){
                        if(style_.length>0){
                            style_ += ' ' + SELECTED_CLASS;
                        }else{
                            style_ += SELECTED_CLASS;
                        }
                    }
                    if(extraData){
                        if(style_.length>0){
                            style_ += ' ' + this.isTodayBusy(parseInt(monthData[i][d]),extraData);
                        }else{
                            style_ += this.isTodayBusy(parseInt(monthData[i][d]), extraData);
                        }
                    }
                    dayEntry = dayEntry.replace(/__STYLE__/i, style_.replace(/^ /, ''));
                }
                template+=dayEntry;
            }
            template = template + '</tr>';
        }
        template = template + '</tbody></table>';
        let month = document.createElement('div');
        month.innerHTML = template;
        month.className = 'mCard';
        return month;
    }
    isSelected(day:string){
        return this.selectedDay.split('-')[2] === day.split('-')[2];
    }
    isToday( date: string ){
        const today = new Date();
        const toCheck = new Date(date);
        return toCheck.getFullYear() == today.getFullYear()
            && toCheck.getMonth() == today.getMonth()
            && parseInt(toCheck.toString().split(' ')[2]) == parseInt(today.toString().split(' ')[2]) ;
    }
    isTodayBusy(day:any,haystack:any){
        let target = haystack.API.find((o:any) => o.day === day)
        if(target){
            return target.class;
        }else{
            return '';
        }
    }
    setErrorMessage(msg:string){
        console.log('Change Label Error');
        this.options.errorLabel = msg;
    };
    parseDateRules(format:string) : any {
        let formatted:any=[];
        let dfa = format.split('-');
        [].forEach.call(dfa , (d:any,i:number)=>{
            formatted.push({
                [dfa[i][0]]:dfa[i].length
            });
        });
        return formatted;
    }
    formatDate( day: number, month: number, year: number ){
        return `${year}-${('0'+ parseInt((month).toString())).slice(-2)}-${('0'+ parseInt((day).toString())).slice(-2)}`;
    }
    setEventHandlers(){
        document.addEventListener('click', this.windowDropPanelEvent.bind(this))
        this.yearList.addEventListener('scroll',()=>{
            this.handleYearScroll();
        });
        [].forEach.call(this.yearList.querySelectorAll('div'),(el:any)=>{
            this.addYearSelectorEvents(el);
        });
        [].forEach.call(this.monthSelector.querySelectorAll('div'),(el:any)=>{
            el.addEventListener('click',(e:any)=>{
                this.userMonthIndex = parseInt(e.target.dataset.month);
                this.setUserSelectedMonth();
            },false);

        });
        this.calendarLabel.addEventListener('click',()=>{
            this.setYearViewPort();
            this.yearListPanel.classList.add('showYear');
        });
        this.closeYearList.addEventListener('click',()=>{
            this.yearListPanel.classList.remove('showYear');
        });
        if(this.options.formInput){
            this.toggleCalendar.addEventListener('click',()=>{
                this.calendarDropPanel.classList.toggle('hidden_');
            });

        }
        let ctrl = this.wrapper.querySelectorAll('.sAction');
        [].forEach.call(ctrl, (el:any)=>{
            el.addEventListener('click',(e:any)=>{
                this.handleMonthNavigation(e.target.dataset.action)
            }, false);
        });
        this.closeYearList.addEventListener('click',()=>{
            this.closeYearSelectionHandler();
        }, false);
        this.cancelYearSelection.addEventListener('click',()=>{
            this.handleCancelYearSelect();
        }, false);
        this.btnToday .addEventListener('click',()=>{
            this.setDayToday();
            this.disableNavEvents();
            this.handleMonthSlider(RIGHT);
            this.yearListPanel.classList.remove('showYear');
        }, false);


    }
    handleCancelYearSelect(){
        if(this.monthIndex != this.userMonthIndex || this.yearIndex != this.userYearIndex){
            this.userMonthIndex = this.monthIndex;
            this.userYearIndex = this.yearIndex;
            this.setUserSelectedMonth();
            this.setUserSelectedYear();
            this.yearListPanel.classList.remove('showYear');
        } else {
            this.yearListPanel.classList.remove('showYear');
        }

    }
    closeYearSelectionHandler(){
        if(this.monthIndex != this.userMonthIndex || this.yearIndex != this.userYearIndex){
            this.yearIndex =this.userYearIndex;
            this.monthIndex =this.userMonthIndex;
            this.disableNavEvents();
            this.handleMonthSlider(RIGHT);
        }
    }
    setUserSelectedMonth(){
        let month = this.monthSelector.querySelectorAll('div');
        [].forEach.call(month, (m:any)=>{
            if(parseInt(m.dataset.month) === this.userMonthIndex){
                m.classList.add('selected');
            }else{
                m.classList.remove('selected');
            }
        })
    }
    handleMonthNavigation(action: any){
        switch (action){
            case RIGHT:
                if(this.monthIndex+1>11){
                    this.monthIndex=0;
                    this.yearIndex++;
                }else{
                    this.monthIndex++
                }
                this.disableNavEvents();
                this.handleMonthSlider(action);
                break;
            case LEFT:
                if(this.monthIndex-1<0){
                    this.monthIndex=11;
                    this.yearIndex--;
                }else{
                    this.monthIndex--
                }
                this.disableNavEvents();
                this.handleMonthSlider(action);
                break;
            default:
                console.log('WTF!!! Strange Alien on Board!');
        }
        this.calendarLabel.innerHTML = this.months[this.monthIndex] + ' / ' + this.yearIndex.toString();

    }
    handleMonthSlider(direction: any){
        if(this.options.endPoint){
            this.http.request({
                method: 'get',
                targetURL: `${this.options.endPoint}${this.monthIndex+1}/${this.yearIndex}`,
                payload:'',
            }).then((data:string)=>{
                this.slider.addCard(this.renderMonthCard(this.builder.calendar(this.monthIndex,this.yearIndex),JSON.parse(data)),direction)
            });
        }else{
            this.slider.addCard(this.renderMonthCard(this.builder.calendar(this.monthIndex,this.yearIndex)),direction);
        }
        this.calendarLabel.innerHTML = this.months[this.monthIndex]+ ' / ' + this.yearIndex
    }
    enableNavEvents(){
        let ctrl = this.wrapper.querySelectorAll('.sAction');
        [].forEach.call(ctrl, (el:any)=>{
            el.classList.remove('noEvents')
        });
        this.setCalendarDayEvents();
    }
    disableNavEvents(){
        let ctrl = this.wrapper.querySelectorAll('.sAction');
        [].forEach.call(ctrl, (el:any)=>{
            el.classList.add('noEvents')
        });
    }
    setYearViewPort(){
        let selected : HTMLElement= this.yearList.querySelector('.activeYear');
        this.yearList.scrollTop = selected.offsetTop - ((this.yearList.clientHeight/2)-this.yearListLH);
    }
    handleYearScroll(){
        if(parseInt(this.yearList.scrollTop.toFixed()) === 0) {
            console.log("Min Scroll... ");

            this.yearList.querySelector('div').classList.add('firstOnLine');
            this.addPastYears(this.yearList,parseInt(this.yearList.querySelector('div').dataset.year));
            this.maxScroll = this.getListMaxScroll();
            let selectedYear : HTMLElement= this.yearList.querySelector('.firstOnLine');
            this.yearList.querySelector('.firstOnLine').classList.remove('firstOnLine');
            this.yearList.scrollTop = selectedYear.offsetTop;
        }
        if(parseInt(this.yearList.scrollTop.toFixed()) >= this.maxScroll){
            console.log("Max Scroll... ");

            let years = this.yearList.querySelectorAll('div');
            console.log("Last Year on List: " , years[years.length-1].dataset.year );
            this.addFutureYears(this.yearList,parseInt(years[years.length-1].dataset.year));
            this.maxScroll = this.getListMaxScroll();
        }

    }
    addPastYears(el: HTMLElement, startCountYear: number){
        for(let i=0 ;i<=this.options.yearRange;i++){
            let newYear = document.createElement('div');
            newYear.dataset.year = ((startCountYear-1) - i).toString();
            newYear.innerHTML=((startCountYear-1) - i).toString();
            this.addYearSelectorEvents(newYear);
            el.prepend(newYear)
        }
    }
    addFutureYears(el: HTMLElement, startCountYear: number){
        for(let i=0;i<this.options.yearRange;i++){
            let newYear = document.createElement('div');
            newYear.innerHTML=((startCountYear+1) + i).toString();
            newYear.dataset.year = ((startCountYear+1) + i).toString();
            this.addYearSelectorEvents(newYear);
            el.append(newYear)
        }
    }
    addYearSelectorEvents(el: HTMLElement, ){
        el.addEventListener('click',(e:any)=>{
            this.userYearIndex = parseInt(e.target.dataset.year);
            console.log("SELECTED YEAR " , this.userYearIndex )
            this.setUserSelectedYear();
        }, true) ;
    }
    setUserSelectedYear(){
        let years = this.yearList.querySelectorAll('div');
        [].forEach.call(years, (y:any)=>{
            if(parseInt(y.dataset.year) === this.userYearIndex){
                y.classList.add('activeYear');
            }else{
                y.classList.remove('activeYear');
            }
        })

    }
    setCalendarDayEvents(){
        let calendarDays = this.calendarViewPort.querySelectorAll(`.cd:not(.${OFF_DAY_CLASS})`);
        [].forEach.call(calendarDays, (cd:any)=>{
            cd.addEventListener('click',(e:any)=>{
                if(this.options.formInput){
                    if(this.options.validation) {
                        if(this.options.validation(e.target.dataset.calendar)){
                            this.validateDateInput(e);
                        }else {
                            this.setDateInputError();
                        }
                    }else{
                        this.validateDateInput(e)
                    }
                } else {
                    this.validateDateInput(e)
                }

                if(this.options.callBack){
                    this.options.callBack(e.target.dataset.calendar);
                }
            });
        });
    }
    setDateInputError(){
        this.validationError.innerHTML = this.options.errorLabel;
        this.validationError.classList.add('error');
        this. clearSelectedDay();
        this.selectedDay='';
        this.inputField.value = '';
        this.calendarDropPanel.classList.add('hidden_');

    }
    validateDateInput(e:any){
        if(this.options.formInput){
            this.inputField.value = e.target.dataset.calendar;
            this.clonedInput.value = e.target.dataset.calendar;
            this.emitChangeEvent();
            this.validationError.classList.remove('error');
            this.calendarDropPanel.classList.add('hidden_');
        }
        this.clearSelectedDay();
        this.selectedDay = e.target.dataset.calendar;
        (e.target.parentNode as HTMLElement).classList.add('selected');
    }
    clearSelectedDay(){
        [].forEach.call(this.wrapper.querySelector('.mCard').querySelectorAll('td'),(td:any)=>{
            td.classList.remove('selected');
        })
    }
    getListMaxScroll(){
        let realHeight = Math.round(parseFloat(window.getComputedStyle(this.yearList).getPropertyValue('height')));
        return this.yearList.scrollHeight - realHeight;
    }
    buildCalendarBody(){
        let tpl = `<div class="${STAND_ALONE}"><div class="calendarLayer"><div class="ctrlHeader"><table><tbody><tr><td><i class="fas fa-chevron-left sAction" data-action="-1"></i></td><td colspan="5" class="cLabel">Month/year</td><td><i class="fas fa-chevron-right sAction" data-action="1"></i></td></tr><tr class="week"><td>Dom</td><td>Seg</td><td>Ter</td><td>Qua</td><td>Qui</td><td>Sex</td><td>Sab</td></tr></tbody></table></div><div class="viewPort"></div></div><div class="yearSelectorLayer"><i class="fas fa-check times"></i> <i class="fas fa-times times2"></i> <i class="times3">Today</i><div class="years">`
        for(let y = this.yearIndex-this.options.yearRange; y<this.yearIndex+this.options.yearRange;y++){
            if(y===this.yearIndex){
               tpl += `<div class="${SELECTED_YEAR_CLASS}" data-year="${y}">${y}</div>`;
            }else {
                tpl += `<div data-year="${y}">${y}</div>`;
            }
        }
        tpl += `</div><div class="months"><div data-month="0" >Jan</div><div data-month="1">Feb</div><div data-month="2">Mar</div><div data-month="3">Apr</div><div data-month="4">May</div><div data-month="5">Jun</div><div data-month="6">Jul</div><div data-month="7">Aug</div><div data-month="8">Sep</div><div data-month="9">Oct</div><div data-month="10">Nov</div><div data-month="11">Dez</div></div></div></div>`;
        return tpl;
    }
    emitChangeEvent(){
        let event = document.createEvent('HTMLEvents');
        event.initEvent('change', true, false);
        this.clonedInput.dispatchEvent(event);
    }
    windowDropPanelEvent(e:any){
        let parent = IDate.findParentElement(e.target,this.parentClass);
        if(parent){
            if(this.instance != parent && this.options.formInput){
                this.calendarDropPanel.classList.add('hidden_');
            }
        }else{
            if(this.options.formInput){
                this.calendarDropPanel.classList.add('hidden_');
            }
        }
    }
    static formInputBody(style:any){
        let wrap = document.createElement('div');
        wrap.innerHTML = `<div class="dropToggle"></div><input class="form-control" name="needle" aria-label="" disabled placeholder="Pick a Date"><div class="drop-content"  ${style?'style="right:0"':''}></div><small class="validationError"></small>`
        wrap.className = FORM_COMPONENT;
        return wrap;
    }
    static findParentElement(el:any, eClass:string) {
        while (el.parentNode) {
            el = el.parentNode;
            if (el.className === eClass){
                return el;
            }
        }
        return null;
    }
    // formatDate_(day: number, month: number, year: number ){
    //     let formatted:any = [];
    //     [].forEach.call(this.dateFormat, (f:any)=>{
    //         switch (Object.keys(f)[0]) {
    //             case 'Y':
    //                 if(f.Y != ( year.toString().length)){
    //                     if(f.Y<year.toString().length){
    //                         formatted.push(year.toString().slice(-f.Y));
    //                     }else{
    //                         formatted.push(year.toString());
    //                     }
    //                 }
    //                 break;
    //             case 'M':
    //                 if(f.M != ( month.toString().length)){
    //                     if(f.M>month.toString().length){
    //                         if(month<9){
    //                             formatted.push('0'+month);
    //                         }
    //                     }
    //                 }
    //                 formatted.push(month.toString());
    //                 break;
    //             case 'D':
    //                 if(f.D != ( day.toString().length)){
    //                     if(f.D>day.toString().length){
    //                         if(day<9){
    //                             formatted.push('0'+day);
    //                         }
    //                     }
    //                 }
    //                 formatted.push(day.toString());
    //                 break;
    //             default:
    //                 break;
    //         }
    //
    //     });
    //
    //
    //     console.log(formatted)
    //
    // }
    // daysInMonth (month:any, year:any) {
    //     return new Date(year, month, 0).getDate();
    // }
    // static parseResponse(data:any,month:any,year:any){
    //     let busyDays = data.filter((day:any)=>{
    //         let time = new Date(day.date);
    //         let y = time.getFullYear();
    //         let m = time.getMonth();
    //         if(y===year && m === month){
    //             return day.date;
    //         }
    //     });
    //     [].forEach.call(busyDays,(b:any)=>{
    //         b.date = b.date.split(' ')[0];
    //         b.day = b.date.split('-')[2];
    //     });
    //     return busyDays;
    // }
}