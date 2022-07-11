import extendDefaults from "../common/extendDefaults";
import getElComputedStyle from "../common/getElComputedStyle";
import findParentNode from "../common/findParentNode";

export default class ScrollBox {
    private defaults = {
        anchor: false,
        listMax: 10,
        navBar: true,
        cssActive: 'bar',
        listCSS: 'foo',
    }
    private readonly options: any;
    private anchor: any;
    private listItems: any;
    private scroller: HTMLDivElement;
    private liHeight: number;
    private selectedItem: number;
    private navBar: HTMLDivElement;

    constructor(options:any) {
        this.options = extendDefaults(this.defaults, arguments[0]);
        if(!this.options.anchor){
            console.log("No base element defined");
            return;
        }
        this.anchor = document.querySelector(`#${this.options.anchor}`);
        this.anchor.innerHTML = ScrollBox.renderComponent();
        this.scroller = this.anchor.querySelector('.scrollDropDown');
        this.navBar = this.anchor.querySelector('.navBar');

        this.navBar.querySelectorAll('div').forEach((el:HTMLDivElement)=>{
            el.addEventListener('click',this.handleNavBar.bind(this), false)
        });
        console.log('ScrollBox ',this.options);
    }
    handleNavBar(e:Event){
        e.preventDefault();
        switch ((e.target as HTMLDivElement).dataset.scroll){
            case 'up':
                this.previous();
                break;
            case 'down':
                this.next();
                break;
            default:
                console.log('Some alien on board....');
        }
    }
    load(list:any){
        this.scroller.innerHTML = '';
        this.scroller.appendChild(list);
        list.classList.add(this.options.listCSS)
        this.listItems = this.scroller.querySelectorAll('li');
        this.liHeight = Math.round(parseFloat(getElComputedStyle(this.listItems[0], 'height')));
        this.scroller.style.maxHeight = (this.liHeight) * this.options.listMax  + 2 + 'px';


        console.log('OPTIONS.LIST_MAX ' , this.options.listMax)

        // const ul = this.scroller.querySelector('ul');
        this.listItems[0].classList.add(this.options.cssActive);
        this.selectedItem = 0;
        if(!this.options.navBar) {
            this.navBar.classList.add('disabled');
        }
        list.querySelectorAll('li').forEach((li:HTMLLIElement)=>{
            li.addEventListener('click',this.handleContentClick.bind(this))
        });
    }
    handleContentClick(e:Event){
        e.preventDefault();
        let li = findParentNode(( e.target as HTMLLIElement),'LI');
        this.setActive(parseInt(li.dataset.index))
    }
    clear(){
        this.scroller.innerHTML='';
    }
    next(){
        if(this.selectedItem+1 < this.listItems.length){
            this.selectedItem++;
        } else {
            this.selectedItem = 0;
        }
        this.setActive(this.selectedItem);
        if(!this.visibleInParentViewPort(this.listItems[this.selectedItem])){
            this.scroller.scrollTop = this.listItems[this.selectedItem].offsetTop - (this.liHeight * (this.options.listMax - 1));
        }
    }
    previous(){
        if(this.selectedItem-1 >=0){
            this.selectedItem--;
        } else {
            this.selectedItem = this.listItems.length-1;
        }
        this.setActive(this.selectedItem);
        if(!this.visibleInParentViewPort(this.listItems[this.selectedItem])){
            this.scroller.scrollTop = this.listItems[this.selectedItem].offsetTop;
        }
    }
    setActive(li:number){
        this.listItems.forEach((li:HTMLLIElement)=>{
            li.classList.remove(this.options.cssActive);
        });
        this.listItems[li].classList.add(this.options.cssActive);
        this.selectedItem = li;
    }
    visibleInParentViewPort(liElement:any) {
        this.liHeight = Math.round(parseFloat(getElComputedStyle(this.listItems[0], 'height')));
        let result = false;
        if (liElement.offsetTop - this.scroller.scrollTop >= 0) {
            result = (liElement.offsetTop) - this.scroller.scrollTop <= this.scroller.clientHeight - this.liHeight;
            return result;
        }
        return result;
    }
    static renderComponent(){
        return `<div class="scrollBox">
                <div class="navBar">
                <div class="up" data-scroll="up"></div>
                <div class="down"  data-scroll="down"></div>
                </div>
                <div class="scrollDropDown">
                </div>
            </div>`
    }
}