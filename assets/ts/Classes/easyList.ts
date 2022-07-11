import extendDefaults from "../common/extendDefaults";
import Content from "./content";
import requestHTTP from "./requestHTTP";
import Highlight from "./highlight";
import DataBank from "./DataBank";

export default class EasyList {

    private defaults = {
        anchor: false,
        endpoint: 'http://192.168.18.15/countries',
        needle: '',
        cssActive: 'active',
        listCSS: 'eList',
        listLI: 'eItem',
        listMax: 10,
        minChars: 3,
        watchers: [
            // 'input',
            // 'blur',
            'keyup',
            'focus',
        ],
        render: this.renderTemplate,
        highlight: false
    }
    private readonly options: any;
    private content: Content;
    private highlight: Highlight;

    private anchor: HTMLDivElement;
    private readonly canvas: HTMLDivElement;
    private dropPanel: HTMLDivElement;
    private input: HTMLInputElement;
    private status: HTMLDivElement;
    private server: any;
    private readonly renderer: any;
    private lastValidNeedle: string;

    constructor(options:any) {
        this.options = extendDefaults(this.defaults, arguments[0]);
        if(!this.options.anchor){
            console.log("No base element defined");
            return;
        }
        this.anchor = document.querySelector(`#${this.options.anchor}`);
        this.anchor.innerHTML = EasyList.renderComponent();
        this.dropPanel = this.anchor.querySelector('.dropDownPanel');
        this.input = this.anchor.querySelector('.needle');
        this.status = this.anchor.querySelector('.status');
        this.renderer = this.options.render;
        this.canvas = this.anchor.querySelector('.dropDown');
        console.log('EasyList ', this.defaults );
        this.content = new Content({
            anchor: this.canvas,
            listMax: this.defaults.listMax,
            cssActive: this.options.cssActive,
        });

        this.server = new requestHTTP();
        const cp = this.checkEndPointType();
        switch (cp) {
            case 'json':
                this.getEndPointData(true);
                break;
            case 'url':
                break;
            case 'array':
                this.server = new DataBank();
                this.server.loadData(this.options.endpoint);
                break;
        }
        this.defaults.watchers.forEach((event:string)=>{
            this.input.addEventListener(event,this.keyboardHandler.bind(this), false);
        });

        this.highlight = new Highlight('high');

    }
    checkEndPointType(){
        switch(typeof this.options.endpoint){
            case 'object':
                if( this.options.endpoint.targetURL ){
                    return 'url';
                }else if(this.options.endpoint.targetJSON){
                    return 'json';
                } else {
                    return 'array';
                }
        }
        return false;
    }
    keyboardHandler(e:KeyboardEvent){
        e.preventDefault();
        switch (e.key){
            case 'ArrowDown':
                this.content.next();
                break;
            case 'ArrowUp':
                this.content.previous();
                break;
            default:
                if(e.key === 'Backspace' ){
                    if(this.input.value === this.lastValidNeedle){
                        this.status.classList.remove('error')
                    }
                }
                if(e.type === 'keyup' ){
                    if(this.input.value.length >=this.options.minChars){
                        this.getEndPointData();
                    } else {
                        this.status.classList.remove('error');
                        this.content.clear();
                    }
                }
                break;
        }
    }
    getEndPointData(dataBank:boolean = false){
        if(this.status.classList.contains('error')){
            return;
        }
        let target: string;
        let needle: any;
        target = this.options.endpoint.targetURL;
        needle = this.options.endpoint.needle +'='+ this.input.value
        if(dataBank){
            target = this.options.endpoint.targetJSON
        }
        this.server.request({
            method: 'get',
            targetURL: target,
            payload: needle
        }).then((data:any)=>{
            const result = JSON.parse(data);
            if(result.length  === 0) {
                this.status.classList.add('error');
                return;
            }else {
                this.lastValidNeedle = this.input.value;
                this.status.classList.remove('error')
               if(dataBank){
                   this.setDataBank(result);
                   return;
               }

               this.buildList(result);
            }
        })
    }
    setDataBank(data:any){
        this.server = new DataBank();
        this.server.setNeedle(this.options.endpoint.needle);
        this.server.loadData(data);
    }
    buildList(elements:any){
        let html = '';
        elements = this.makeLabelUI(elements);
        elements.forEach((item:any,i:number)=>{
            if(this.options.highlight){
                item.uiLabel = this.highlight.transform(item.uiLabel,this.lastValidNeedle)
            }
            html += this.renderer(item,i);
        });
        const list = document.createElement('ul');
        list.className = this.options.listCSS;
        list.innerHTML = html;
        list.querySelectorAll('li').forEach((li:HTMLLIElement)=>{
            li.addEventListener('click',this.handleContentClick.bind(this))
        });
        this.dropPanel.classList.add('loading');
        this.content.clear();
        this.content.load(list);
        setTimeout(()=>{
            this.dropPanel.classList.remove('loading');
            this.dropPanel.classList.add('open');
        },100);
    }
    makeLabelUI(data:any){
        if(!data[0]){
            console.log('WTF! - No data...');
            return;
        }
        if(typeof data[0] === 'string'){
            let built:any = [];
            data.forEach((label:any)=>{
                let item = {
                    uiLabel: label
                }
                built.push(item)
            });
            return built;
        }else {
            data.forEach((label:any)=>{
                label.uiLabel = label[this.options.endpoint.needle]
            });
            return data;
        }
    }
    handleContentClick(e:Event){
        e.preventDefault();
        let li = EasyList.findParentNode(( e.target as HTMLLIElement),'LI');
        this.content.setActive(parseInt(li.dataset.index))
    }
    renderTemplate(item:any, i:any) {
        return `<li class="${this.options.listLI}" data-index="${i}"><div class="ellipsis_" >${item.uiLabel}</div></li>`
    }
    static renderComponent(){
        return `<div id="easySelect" class="selectWrapper">
                <div class="status"></div>
                <div class="dropToggle"></div>
                <input class="needle" type="text" aria-label="input" autocomplete="off" placeholder="Type Something....">
                <div class="dropDownPanel show">
                    <div class="dropDown">
                    </div>
                </div></div>`;
    }
    static findParentNode(el:any, node:any) {
        while (el.parentNode) {
            el = el.parentNode;
            if (el.nodeName === node){
                return el;
            }
        }
        return null;
    }

    enable(){}
}