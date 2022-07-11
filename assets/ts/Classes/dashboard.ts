import extendDefaults from "../common/extendDefaults";
import StarRating from "./starRating";
import KeyMaster from "./keyMaster";
import UThumb from "./uThumb";
import humanFileSize from "../common/humanFileSize";
import IThumbUpdate from "../Interfaces/iThumbUpdate";
import IDashUpdate from "../Interfaces/iDashUpdate";



declare global {
    interface Event {
        detail: any;
    }
}

export default class Dashboard {
    private readonly defaults: any;
    private readonly body: HTMLDivElement;
    private stars: StarRating;
    private keys: KeyMaster;
    private entries: any;
    private overlay: HTMLDivElement;
    private entryCounter: HTMLDivElement;
    private isLoading: boolean;

    constructor(options:any) {

        this.defaults = {
            anchor: false,
            viewPort: false,
            watchFields:['name','desc']
        }
        this.isLoading=true;
        this.entries = [];
        this.defaults = extendDefaults(this.defaults, options);
        this.body = document.createElement('div') as HTMLDivElement;
        this.body.className = 'dashboard';
        this.body.innerHTML = Dashboard.renderComponent();
        if(typeof this.defaults.anchor === 'string'){
            document.querySelector(`#${this.defaults.anchor}`).appendChild(this.body)
        } else {
            this.defaults.anchor.appendChild(this.body);
        }
        this.stars = new StarRating(this.body.querySelector('.sr'), this.handleUpdates.bind(this), true);
        this.keys = new KeyMaster({
            anchor: this.body.querySelector('.km'),
            onUpdate: this.handleKeyMaster.bind(this)
        });
        this.overlay = this.body.querySelector('.overlay') as HTMLDivElement;
        this.entryCounter = this.body.querySelector('.counter') as HTMLDivElement;
        document.addEventListener('thumbUpdate',this.handleThumbEvent.bind(this),false);
        this.addFieldWatchers();
        this.checkUI();
    }
    handleKeyMaster(keys:any){
        console.log("From KM: " , keys.detail);
        this.reportUpdated({
            field: 'keys',
            value: keys.detail.value
        });
        // // this.checkUI();

    }
    addFieldWatchers(){
        this.defaults.watchFields.forEach((name:any)=>{
            let field  = this.body.querySelector(`[name="${name}"]`);
            ['change'].forEach((evt:any)=>{
                field.addEventListener(evt,(e:Event)=>{
                    e.preventDefault();
                    this.reportUpdated({
                        field:(e.target as HTMLInputElement).name,
                        value: (e.target as HTMLInputElement).value
                    })
                },false)
            })
        })
    }
    handleThumbEvent(e:Event){
        e.preventDefault();
        console.log('ThumbEvent ', e.detail);
        switch (e.detail.type){
            case 'SELECTED':
                if(this.checkIfRegistered(e.detail.thumb.get('id'))){
                    if(e.detail.thumb.getStatus() === false){
                        this.removeEntry(e.detail.thumb.get('id'));
                    }
                }else{
                    this.addEntry(e.detail.thumb);
                }
                break;
            case 'UPDATE':
                if(this.checkIfRegistered(e.detail.thumb.get('id'))){
                    this.checkUI();
                }
                break;
            case 'DELETE':
                this.removeEntry(e.detail.thumb.get('id'))
                break;
        }
    }
    addEntry(thumb: UThumb){
        this.entries.push({
            uid: thumb.get('id'),
            thumb: thumb
        });
        this.checkUI();
    }
    removeEntry(id:any){
        try{
            this.entries.forEach((entry:any, i:number)=>{
                if(entry.uid === id){
                    throw i;
                }
            })
        }catch(idx:any){
            this.entries.splice(idx,1)
        }
        this.entryCounter.innerHTML = this.entries.length.toString();
        this.checkUI();
    }
    checkIfRegistered(id:any){
        return this.entries.find((entry:any)=>{
            return entry.uid === id;
        })
    }
    checkUI(){
        this.isLoading = true;
        this.entryCounter.innerHTML = this.entries.length.toString();
        if(this.entries.length === 0 ){
            this.overlay.classList.add('noFiles');
            this.resetUI();
            return;
        } else {
            this.overlay.classList.remove('noFiles');
        }
        const regExp = /Multiple/i;
        if(! regExp.test(this.resolveLabel('stars' ))){
            this.stars.setRate(this.resolveLabel('stars' ))
        }else{
            this.stars.setRate(0);
        }
        let keys:any = [];
        this.entries.forEach((entry:any)=>{
            entry.thumb.get('keys').split(',').forEach((key:any)=>{
                keys.push(key)
            })
        });
        this.keys.resetKeys();
        this.keys.addKeys( keys.unique())
        const uiUpdate: any ={
            name:this.resolveLabel('name' ),
            desc:this.resolveLabel('desc' ),
            type:this.resolveLabel('type' ),
            size:this.resolveLabel('uiSize' ),
        }
        Object.keys(uiUpdate).forEach((key:any)=>{
           ( this.body.querySelector(`[name="${key}"]`) as HTMLInputElement ).placeholder = uiUpdate[key]
        });
        this.isLoading = false;
    }
    resetUI(){
        this.body.querySelectorAll('input:not(.inp), textarea').forEach((field:HTMLInputElement)=>{
            field.placeholder='';
            field.value='';
        });
        this.stars.setRate(0);
        this.keys.resetKeys();
    }
    resolveLabel(key:any ) : any {
        let needle = this.entries[0].thumb.get(key);
        try {
            this.entries.forEach((entry:any)=>{
                if(entry.thumb.get(key) !=  needle){
                    needle= "Multiple " + key + '(s)';
                    throw needle;
                }
            });
            return needle;
        }catch (err:any){
            return needle;
        }
    }
    handleUpdates(value:any){
        if(this.isLoading){return}
        console.log("All THUMBS GOT STARS SEND EVENT",value);
        this.reportUpdated({
            field: 'stars',
            value: value
        })
    }
    reportUpdated(event:any){
        if(this.isLoading){return}
        console.log(event)
        const evtData:IDashUpdate = {
            field: event.field,
            value: event.value
        }
        const dashUpdate = new CustomEvent('dashUpdate', {
            bubbles: true,
            detail: evtData
        });
        document.dispatchEvent(dashUpdate);
    }
    static renderComponent(){
        return `<div class="overlay"></div>
<div class="header">
    Selected Images [<span class="counter">999</span>]
</div>
<table>
    <tbody>
    <tr>
        <td>
            <div class="icon stars"></div>
            <div class="label sr">
            </div>
        </td>
        <td>
            <div class="icon name"></div>
            <div class="label"><input class="_inputKList" name="name" type="text"></div>
        </td>
        <td>
            <div class="icon type"></div>
            <div class="label"><input class="_inputKList" name="type" type="text" DISABLED></div>
        </td>
        <td>
            <div class="icon size"></div>
            <div class="label"><input class="_inputKList" name="size" type="text" DISABLED></div>
        </td>
        <td>
            <div class="icon comment"></div>
            <div class="label"><textarea name="desc"></textarea></div>
        </td>
        <td>
            <div class="icon keywords"></div>
            <div class="label km"> </div>
        </td>
    </tr>
</tbody>
</table>`
    }
}