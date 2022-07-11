// @ts-ignore
import IFlash from "../Interfaces/iFlash";
import AppCookie from "./appCookie";


export default class FlashMessage {
    private flash: HTMLElement;
    private flashWidth: any;
    private width: any;
    private readonly time : any;
    private readonly t : any;
    private max : any;
    private closeBtn : any;
    private flashTimer : any;
    private value : any;
    private countdown : any;
    private flashEnded: boolean;
    private isFlashing: boolean;
    private cookie: AppCookie;

    constructor( ) {

        this.t = 5;   // 5 sec
        this.max = 100;
        this.time = (1000/this.max)*this.t;
        this.value = 0;

        this.flashEnded = false;
        this.isFlashing = false;
        this.cookie = new AppCookie();

        let cookie = this.cookie.getCookie('microFlash');
        if(cookie !== ''){
            this.flashIt({
                type: cookie.type,
                title: decodeURIComponent(cookie.title),
                message: decodeURIComponent(cookie.message),
            })
        }else{
            console.log('NO COOKIE TO PROCESS')
        }
    }
    getCookie(cname:any) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    buildFlashElement(params: IFlash) {
        let newFlash = document.createElement('DIV');
        newFlash.id = 'flashContainer';
        newFlash.className = `flash ${params.type}`;
        newFlash.innerHTML = FlashMessage.flashTemplate(params)
        document.body.appendChild(newFlash);
        this.flash = newFlash
    }
    initializeFlash(){
        this.closeBtn = this.flash.querySelector('.flashClose');
        this.flashTimer = this.flash.querySelector('.flashTimer');
        this.flashWidth = parseInt(FlashMessage.getElComputedStyle(this.flash, 'width'));
        this.width = this.flashWidth;
        let body = document.querySelector('body')
        let bodyWidth = parseInt(FlashMessage.getElComputedStyle(body, 'width'));
        if(this.width >= bodyWidth){
            this.width = bodyWidth;
            this.flash.querySelector('.flashContent').classList.add('short');
        }else{
            this.flash.querySelector('.flashContent').classList.add('full');
        }
        this.flash.classList.add('initialize');
        this.flash.style.left ="101%";
        this.flash.style.width = `${this.width}px`;
        this.flash.style.transitionDuration = "1s"
        this.flash.style.transform = `translateX(${-this.width}px)`;
        this.setEventHandlers();
        setTimeout(()=>{
            this.countdown = setInterval(() => {
                this.updateCountDown();
            }, this.time);

        },1000);
    }
    setEventHandlers(){
        this.closeBtn.addEventListener('click',this.isClosing.bind(this),false);
        this.flashTimer.addEventListener('mouseover',this.isOvering.bind(this),false);
        this.flashTimer.addEventListener('mouseout',this.notOvering.bind(this),false);
    }
    updateCountDown(){
        this.value += 1;
        if (this.value >= this.max ) {
            clearInterval(this.countdown);
            this.flashTimer.style.pointerEvents = "none";
            this.flash.style.pointerEvents = "none";
            this.flash.style.transform = `translateX(${this.width}px)`;
            this.flashEnded = true;
            this.closeFlash();
        }else{
            this.flashTimer.style.width = this.value+'%';
        }
    }
    isOvering (){
        clearInterval(this.countdown);
    }
    notOvering (){
        this.countdown = setInterval(() => {
            this.updateCountDown();
        }, this.time);
    }
    isClosing (){
        this.flashEnded = true;
        if(this.flash){
            document.body.removeChild(this.flash);
        }
        this.max = 100;
        this.value = 0;
        this.isFlashing = false;

    }
    closeFlash(){
        if(!this.flashEnded){
            setTimeout(()=>{
                document.body.removeChild(this.flash);
                clearInterval(this.countdown);
            }, 1000 );
        }
        this.max = 100;
        this.value = 0;
        this.isFlashing = false;
    }
    flashIt(params: IFlash){
        if(this.isFlashing){
            console.log("Flash is working....");
            setTimeout(()=>{
                this.flashIt(params)
            },100)
            return;
        }
        this.isFlashing = true;
        switch (params.type) {
            case 'info':
                params.type = 'isInfo';
                break;
            case 'warning':
                params.type = 'isWarning';
                break;
            case 'success':
                params.type = 'isSuccess';
                break;
            case 'error':
                params.type = 'isError';
                break;
            default:
                break;
        }
        this.buildFlashElement(params);
        this.initializeFlash();
    }
    static flashTemplate(params: IFlash){
        return `<div class="flashWrapper">
        <div class="flashClose"></div>
        <div class="flashTitle">
            ${params.title}
        </div>
        <div class="flashContent">
           ${params.message}
        </div>
        <div class="flashTimer"></div>
    </div>`;
    }
    static getElComputedStyle(elem:any, prop:any) {
        let cs = window.getComputedStyle(elem, null);
        if (prop) {
            return cs.getPropertyValue(prop);
        }
    }

}
