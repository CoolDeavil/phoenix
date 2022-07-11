import extendDefaults from "../common/extendDefaults";
import fadeIn from "../common/fadeIn";

interface ICustomKeyword extends HTMLDivElement {
    keyword: string;
    kIndex: number
}
declare global {
    interface Window { callBack: any; }
}
export default class KeyMaster {
    private readonly options: any;
    private keysElements: ICustomKeyword[]
    private body: HTMLDivElement;
    private inputAnchor: any;
    private isRunning: boolean = false;
    private needle: HTMLInputElement;
    constructor(options:any) {
        this.options = {
            anchor: '',
            delete: true,
            onUpdate: (e:Event)=>{e.preventDefault();return true;},
            response: 'string'    // string, array, json
        }
        this.options = extendDefaults(this.options, arguments[0]);

        if(this.options.anchor===''){
            console.log("Wrong Parameters, no Anchor defined....");
            return;
        }
        this.keysElements = [];

        if(typeof this.options.anchor === 'string'){
            console.log('STRING');
            this.body = document.querySelector(`#${this.options.anchor}`);
        }else {
            console.log('OBJECT')
            this.body = this.options.anchor;
        }
        this.body.className = 'keywordWrapper';
        console.log(this.options);
        // this.isRunning = true;
        this.resetKeys();

    }

    keyboardHandler(event: KeyboardEvent) {
        switch (event.key) {
            case 'Escape':
               this.needle.value='';
                break;
            case 'Enter':
                if(this.needle.value===''){return}
                //TODO Needs sanitize
                this.addKey(this.needle.value);
                this.needle.value = '';

                break;
            case ' ':
                if(this.needle.value===' '){return}
                this.addKey(this.needle.value);
                this.needle.value = '';
                break;
            default:
                // console.log("DEFAULT: ", event.key)
                break;

        }
    }

    reportStatus(update:any){
        const keyMaster = new CustomEvent('dashUpdate', {
            detail: {
                origin: 'keyMaster',
                value: update
            },
        });
        this.options.onUpdate(keyMaster);

    }
    addKey(key:any){
        if(this.checkForDuplicate(key)){
            this.appendKey(key);
            this.reportStatus({
                action: 'ADD',
                value: key
            });
            return true;
        }
        return false;
    }
    setTagsGrade(){}
    addKeys(keys: any[]){
        this.isRunning = true;
        keys.forEach((key:any)=>{
            if(this.checkForDuplicate(key)){
                this.appendKey(key);
            }
        });
        this.isRunning = false;
    }
    appendKey(key:any){
        if(key === ''){return}
        let newKey = this.buildKeyTag(key);
        this.keysElements.push(newKey);
        newKey.kIndex = this.keysElements.length-1;
        this.body.insertBefore(newKey, this.inputAnchor)
        fadeIn(newKey,'flex');
    }
    buildKeyTag(keyword:any) {
        let tag = (document.createElement('div') as ICustomKeyword);
        tag.innerHTML = KeyMaster.template(keyword);
        tag.className = 'kTag';
        tag.keyword = keyword;
        tag.kIndex = 0;
        tag.querySelector('.times').addEventListener('click',(e:Event)=>{
            e.preventDefault();
            this.deleteKey(keyword);
        });
        return tag;
    }
    deleteKey(dKey:any){
        // if(!this.isRunning){console.log("I am RUNNING!");return}
        console.log("DELETE! ", dKey)
        this.keysElements.forEach((el:any)=>{
            if(el.keyword == dKey ){
                this.fadeOut(el);
            }
        });


    }
    resetKeys(){
        this.body.innerHTML = KeyMaster.templateComponent();
        this.needle = this.body.querySelector('input');
        this.needle.addEventListener('keyup',this.keyboardHandler.bind(this), false);
        this.inputAnchor = this.body.querySelectorAll('.kTag')[0];
        this.keysElements = [];
    }
    getAllKeys(){
        // if(!this.isRunning){return}
        let response: any;
        switch (this.options.response){
            case 'string':
                response='';
                this.keysElements.forEach((key)=>{
                    response+=key.keyword + ', '
                });
                response = response.substr(0,response.length-2)
                break;
            case 'json':
                response = []
                this.keysElements.forEach((key)=>{
                    response.push({key: key.keyword })
                });
                response = JSON.stringify(response);
                break;

            case 'array':
                response = []
                this.keysElements.forEach((key)=>{
                    response.push(key.keyword)
                });
                break;
            default:
                console.log("There is an alien on Board!")
        }
        return response;
    }
    checkForDuplicate(key:string) : boolean {
        let target = this.keysElements.filter((tag:ICustomKeyword)=>{
            return tag.keyword.toUpperCase() == key.toUpperCase();
        });
        if(target[0]){
            this.alertDuplicate(target[0]);
        }
        if(!this.isRunning){
            this.reportStatus({
                action: 'ADD',
                value: key
            });
        }
        return !target[0];
    }
    alertDuplicate(el:any){
        el.classList.add('error');
        setTimeout(()=>{
            el.classList.remove('error');
        },1000);
    }
    fadeOut(el:any){
        window.callBack = this.killKeyTag.bind(this);
        el.style.opacity = 1;
        (function fade() {
            if ((el.style.opacity -= .1) < 0) {
                el.style.display = "none";
                el.parentNode.removeChild(el);
                window.callBack(el);
            } else {
                requestAnimationFrame(fade);
            }
        })();
    }
    killKeyTag(el:any){
        const key = this.keysElements[el.kIndex].querySelector('.kVal').innerHTML
        this.keysElements.splice(el.kIndex,1);
        this.keysElements.forEach((key,i)=>{
            key.kIndex = i;
        });
        this.reportStatus({
            action: 'DELETE',
            value: key
        })
    }

    static template(label:string){
        return `<span class="kVal">${label}</span><span class="times"></span>`;
    }
    static templateComponent(){
        return `<div class="kTag dataEntry" style="opacity: 1; display: flex;">
        <div class="cursor">
            <input type="text"  class="inp" placeholder="&ensp;&#9998;"/>
            <i></i>
        </div>
    </div>
`;
    }
}