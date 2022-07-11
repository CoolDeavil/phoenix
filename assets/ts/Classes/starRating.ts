
export default class StarRating {
    private readonly anchor: HTMLElement;
    private stars: NodeListOf<Element>;
    private rated: number = 0;
    private readonly callback: Function;
    constructor(anchor:any, callback: Function, small:boolean = false) {
        if(typeof  anchor === 'string'){
            this.anchor =  document.querySelector(`#${anchor}`);
        }else {
            this.anchor =  anchor;
        }
        this.callback = callback;
        this.anchor.innerHTML = StarRating.renderComponent(small);
        this.anchor.className ='starRate';
        this.stars = this.anchor.querySelectorAll('.star');
        this.stars.forEach((star:HTMLElement)=>{
            star.addEventListener('click',this.handleClicks.bind(this), false)
        });
    }
    handleClicks(e:KeyboardEvent){
        e.preventDefault();
        if(e.ctrlKey){
            this.stars.forEach((star:HTMLElement)=>{
                star.classList.remove('checked')
            });
            this.rated = 0;
            this.execCallBack();
            return;
        }
        this.rated = parseInt((e.target as HTMLElement).dataset.star);
        this.stars.forEach((star:HTMLElement)=>{
            star.classList.remove('checked')
        });
        for(let i=0;i<this.rated;i++){
            this.stars[i].classList.add('checked');
        }
        this.execCallBack();
    }
    getRate(){
        return this.rated;
    }
    setRate(rate:number){
        if(rate>5){return}
        this.stars.forEach((star:HTMLElement)=>{
            star.classList.remove('checked')
        });
        for(let i=0;i<rate;i++){
            this.stars[i].classList.add('checked');
        }
        this.rated = rate;
        this.execCallBack();
    }
    execCallBack(){
        return this.callback(this.rated);
    }
    static renderComponent(size:any){
        return `<span class="star ${size?'sm':''}" data-star="1"></span>
<span class="star ${size?'sm':''}" data-star="2"></span>
<span class="star ${size?'sm':''}" data-star="3"></span>
<span class="star ${size?'sm':''}" data-star="4"></span>
<span class="star ${size?'sm':''}" data-star="5"></span>`
    }

}