import extendDefaults from "../common/extendDefaults";
const RIGHT = '1';
const LEFT = '-1';

export default class Slide {
    private readonly options: any;
    private slideFilm: HTMLElement;
    private slideWrap: HTMLElement;

    private anchor: HTMLElement;
    private cardWidth: number;
    private cardHeight: number;
    private lastSlideMove: any;
    private isSlide: boolean;
    private readonly cardClass: string;

    constructor(options: any) {
        let defaults = {
            anchor: false,
            card: false,
            viewPort: 1,
            callOnEndTransition: (e: any)=>{console.log("Default Transition Ended CallBack " , e )},
        }
        this.options = extendDefaults(defaults, arguments[0]);
        this.anchor = this.options.anchor;
        this.anchor.innerHTML = this.renderComponent();
        if(this.options.card){
            if(this.options.card[0]){
                this.cardClass = this.options.card[0].className;
            }else{
                this.cardClass = this.options.card.className;
            }
        }else {
            console.log('No CARD Provided');
            return;
        }
        this.slideFilm = this.anchor.querySelector('.wrapFilm');
        this.slideWrap = this.anchor.querySelector('.slideWrapper');
        if(this.options.card[0]){
            [].forEach.call(this.options.card, (card: any)=>{
                this.slideFilm.append(card);
            });
        }else{
            this.slideFilm.append(this.options.card);
        }
        this. initComponent();
    }

    initComponent(){
        this.cardWidth = Math.round(parseFloat(window.getComputedStyle(this.slideFilm.querySelectorAll(`.${this.cardClass}`)[0]).getPropertyValue('width')));
        this.slideWrap.style.width = (this.cardWidth  * this.options.viewPort ) + 'px';
        this.slideWrap.style.height = (this.cardHeight +1 ) + 'px';
        this.slideFilm.style.width = ((this.options.viewPort +1 )*this.cardWidth )+ 'px';
        this.slideFilm.addEventListener('transitionend',this.handleSliderEvents.bind(this),null);
        this.options.callOnEndTransition(104);
        this.lastSlideMove = 9999;
        this.slideFilm.classList.add('slide') ;
    }
    handleSliderEvents(e:any){
        e.preventDefault();
        e.stopPropagation();

        let kill: HTMLElement;
        switch (this.lastSlideMove){
            case RIGHT:
                kill = (this.slideFilm.querySelectorAll(`.${this.cardClass}`)[0] as HTMLElement);
                kill.parentNode.removeChild(kill);
                this.slideFilm.classList.remove('slide');
                this.slideFilm.style.transform = `translateX(${0}px)`;
                setTimeout(()=>{
                    this.slideFilm.classList.add('slide');
                    this.isSlide = false;
                }, 100);
                break;
            case LEFT:

                kill = (this.slideFilm.querySelectorAll(`.${this.cardClass}`)[this.options.viewPort] as HTMLElement);
                kill.parentNode.removeChild(kill);
                this.slideFilm.classList.remove('slide');
                this.slideFilm.style.transform = `translateX(${0}px)`;
                setTimeout(()=>{
                    this.slideFilm.classList.add('slide');
                    this.isSlide = false;
                }, 100);
                break;
            default:
                break;

        }
        this.isSlide = false;
        this.options.callOnEndTransition(this.lastSlideMove);
        this.lastSlideMove = 9999;
        return true;

    }
    addCard(card: any , direction: any){
        if(this.isSlide){
            console.log('Working')
            return;
        }
        switch (direction){
            case RIGHT:
                this.slideCardRight(card);
                break;
            case LEFT:
                this.slideCardLeft(card);
                break;
            default:
        }
    }
    slideCardRight(card: any = null ){
        this.slideFilm.append(card);
        this.slideFilm.style.transform = `translateX(${-this.cardWidth}px)`;
        this.isSlide = true;
        this.lastSlideMove = RIGHT;
    }
    slideCardLeft(card: any = null ){
        this.slideFilm.prepend(card);
        this.slideFilm.classList.remove('slide');
        this.slideFilm.style.transform = `translateX(${-this.cardWidth}px)`;
        this.isSlide = true;

        setTimeout(()=>{
            this.lastSlideMove = LEFT;
            this.slideFilm.classList.add('slide');
            this.slideFilm.style.transform = `translateX(${0}px)`;
        },100);

    }
    renderComponent(){
        return `<div class="slideWrapper"><div class="wrapFilm">
</div></div>`
    }

}