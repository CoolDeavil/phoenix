import extendDefaults from "../common/extendDefaults";
export default class ISelect {
    private readonly options: any;
    private readonly anchor: HTMLSelectElement;
    private readonly wrapper: HTMLDivElement;
    private optionsWrapper: HTMLElement;
    private selectedOptionsWrapper: HTMLElement;
    private readonly selectType: string;
    private selectOptions: any;
    constructor(options:any) {
        this.options = {
            anchor: '',
            placeholder: 'Select Something',
            watchers: [
                'change',
                // 'blur',
                // 'keyup'
            ],
        }
        this.options = extendDefaults(this.options, arguments[0]);
        if(!document.querySelector(`#${this.options.anchor}`)){
            console.log('No Input Field Found...');
            return;
        }
        this.anchor = document.querySelector(`#${this.options.anchor}`);
        if( !['select-one','select-multiple'].includes(this.anchor.type)) {
            console.log('Element is not an Input Select')
        }
        this.anchor.classList.add('offView')
        this.selectType = this.anchor.type;
        this.wrapper = document.createElement('div') ;
        this.wrapper.innerHTML = ISelect.templateComponent(this.options.placeholder);
        this.wrapper.className="iSelect";
        this.anchor.insertAdjacentElement('beforebegin', this.wrapper);
        this.optionsWrapper = this.wrapper.querySelector('.iSelectDrop')
        this.selectedOptionsWrapper = this.wrapper.querySelector('.iSelectFakeInput')
        this.selectType = this.anchor.type;

        this.wrapper.querySelector('.iSelectSwitch').addEventListener('click',(e:Event)=>{
            e.preventDefault();
            this.optionsWrapper.classList.toggle('hidden_')
        });
        console.log('ISelect v0.0.0 ' , this.options);
        this.initialize();
    }
    initialize(){
        this.selectOptions  = Array.prototype.slice.call(this.anchor.options, 0);
        this.updateComponent();
        this.addFieldWatchers(this.anchor);

    }
    updateComponent(){
        let available = '<ul>';
        let selected = '';
        let sel = 0;
        this.selectOptions.forEach((opt:any,i:number)=>{
            opt.dataset.image = opt.dataset.image?opt.dataset.image:'http://localhost:5000/images/placeholder.png';
            if(opt.selected){
                sel++;
                selected += ISelect.templateSelectedOption(opt.innerText,opt.dataset.image,i, this.selectType)
            }
            available += `<li class="${opt.selected?'selected':''}" data-index="${i}">`+ISelect.templateOption(opt.innerText,opt.dataset.image,2)+`</li>`;
        });
        this.optionsWrapper.innerHTML = available + `</ul>`;
        this.selectedOptionsWrapper.innerHTML  = selected;
        if(sel===0){
            this.selectedOptionsWrapper.innerHTML = `<div class="placeholder">${this.options.placeholder}</div>`;
            this.selectedOptionsWrapper.querySelector('.placeholder').addEventListener('click',(e:MouseEvent)=>{
                e.preventDefault();
                this.optionsWrapper.classList.toggle('hidden_')
            }, false );
        }

        this.setSelectedOptionsEvHandlers();
        this.setAvailableOptionsEvHandlers();
    }

    addFieldWatchers(field: HTMLSelectElement){
        this.options.watchers.forEach((event:string)=>{
            field.addEventListener(event,this.handleSelectChange.bind(this), false);
        });
        return field;
    }
    handleSelectChange(event: MouseEvent){
        event.preventDefault();
        console.log('Watching -> ', (<HTMLSelectElement>(event.target)));
        this.updateComponent();
    }
    setSelectedOptionsEvHandlers(){
        const  selOptionsTimes  = Array.prototype.slice.call(this.selectedOptionsWrapper.querySelectorAll('.times'), 0);
        selOptionsTimes.forEach(((opt:any)=>{
            opt.addEventListener('click', this.handleSelectedClick.bind(this),false)
        }))
        // const  selOptions  = Array.prototype.slice.call(this.selectedOptionsWrapper.querySelectorAll('.bagged'), 0);
        // selOptions.forEach(((opt:any)=>{
        //     opt.addEventListener('click', ()=>{
        //         this.optionsWrapper.classList.toggle('hidden_')
        //     },false)
        // }))
    }
    setAvailableOptionsEvHandlers(){
        const  selOptions  = Array.prototype.slice.call(this.optionsWrapper.querySelectorAll('li'), 0);
        selOptions.forEach(((opt:any)=>{
            opt.addEventListener('click', this.handleAvailableOptionEvent.bind(this),false)
        }))
    }

    handleAvailableOptionEvent(e: MouseEvent){
        e.preventDefault();
        console.log((e.target as HTMLElement));
        const index = parseInt((e.target as HTMLElement).dataset.index)
        console.log("Clicked: " , index);
        if( this.anchor.options[index].value === '0'){return}
        this.anchor.options[index].selected = !this.anchor.options[index].selected;
        let event = document.createEvent('HTMLEvents');
        event.initEvent('change', true, false);
        this.anchor.dispatchEvent(event);
        if (!e.ctrlKey) {
            this.optionsWrapper.classList.add('hidden_')
        }
        // this.optionsWrapper.classList.add('hidden_')
    }

    handleSelectedClick(e: Event){
        e.preventDefault();
        let index: number;
        if((e.target as HTMLElement).className === 'times'){
            index = parseInt(((e.target as HTMLElement).parentNode as HTMLElement).dataset.value);
        } else {
            index = parseInt((e.target as HTMLElement).dataset.value);
        }

        console.log("INDEX : " , index);

        this.anchor.options[index].selected = !this.anchor.options[index].selected;
        let event = document.createEvent('HTMLEvents');
        event.initEvent('change', true, false);
        this.anchor.dispatchEvent(event);

        // this.fadeOut((e.target as HTMLElement))
    }
    static templateComponent(label:string){
        return `<div class="iSelectSwitch"></div><div class="iSelectFakeInput"><div class="placeholder">${label}</div></div><div class="iSelectDrop hidden_"><ul></ul></div>`;
    }
    static templateSelectedOption(label:string, image: string, value: number, lClass:string = ''){
        let class_ = lClass==='select-one'?'single':'';
        return `<div class="bagged ${class_}" data-value="${value}"><img src="${image}" alt=""><span>${label}</span><div class="times">&nbsp;❌</div></div>`;
    }
    static templateOption(label:string, image: string, value: number){
        return `<div class="selectOption"><img src="${image}" alt=""><span>${label}</span></div>`;
    }


}
