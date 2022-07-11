import Thumb from "./thumb";
import readImage from "../common/readImage";
import IThumbData from "../Interfaces/iThumbData";
import ISetMethods from "../Interfaces/iSetMethods";
import StarRating from "./starRating";
import humanFileSize from "../common/humanFileSize";
import IThumbUpdate from "../Interfaces/iThumbUpdate";

const LOADED = 0;
const UPLOADED = 10;
const UPLOADED_FAIL = 99;
const REGISTERED = 109;
const REGISTERED_FAIL = 110;

export default class UThumb extends Thumb {
    private canvas: HTMLDivElement;
    private readonly callback: Function;
    private isActive: boolean;
    private readonly body: HTMLDivElement;
    private activeStatus: HTMLDivElement;
    private controls:any;
    private labels: any;
    private starRating: StarRating;
    private isUpdating: boolean = false;
    private starRatingLayer: HTMLDivElement;
    private toolBarLayer: HTMLDivElement;
    private uploadLayer: HTMLDivElement;
    private uploadProgress: HTMLDivElement;
    private activeStatusBar: HTMLDivElement;
    private serverName: string;
    constructor( thumbData:any, canvas: HTMLDivElement, callback: Function) {
        super();
        this.canvas = canvas;
        this.callback = callback;
        this.isActive = false;
        this.loadGetMethods();
        this.loadSetMethods();
        this.body = document.createElement('div') as HTMLDivElement;
        this.body.innerHTML = UThumb.thumbWireFrame();
        this.body.className = 'uploadThumb';
        this.starRatingLayer = this.body.querySelector('.starBar') as HTMLDivElement;
        this.toolBarLayer = this.body.querySelector('.toolBar') as HTMLDivElement;
        this.uploadLayer = this.body.querySelector('.loadProgress') as HTMLDivElement;
        this.uploadProgress = this.body.querySelector('.c100').querySelector('span') as HTMLDivElement;
        this.uploadProgress.innerHTML='0%';
        this.controls =Array.prototype.slice.call(this.body.querySelectorAll('.ctrl'),0);
        this.starRating = new StarRating(this.body.querySelector('.starRate'), this.handleStarRate.bind(this), true)
        this.controls.forEach((ctrl:any)=>{
            ctrl.addEventListener('click', this.handleControls.bind(this), false)
        });
        this.labels = Array.prototype.slice.call(this.body.querySelector('.fileInfo').querySelectorAll('div'),0);
        this.activeStatusBar = this.body.querySelector('.active') as HTMLDivElement;
        this.activeStatus = this.body.querySelector('.status') as HTMLDivElement;
        this.canvas.appendChild(this.body);
        if(thumbData['render_mode'] === 'BROWSER'){
            this.browserInit(thumbData['image'],thumbData['id']);
        }else {
            this.body.querySelector('img').src = thumbData['blob'];
            delete thumbData['render_mode'];
            delete thumbData['blob'];
            delete thumbData['exif'];
            this.remoteInit(thumbData);
            return;
        }
        document.addEventListener('dashUpdate',(e:Event)=>{
            if(this.isActive){
                this.isUpdating = true;
                this.handleDashUpdate( e.detail);
            }
        }, false)
    }
    remoteInit(data:IThumbData){
        Object.keys(data).forEach((key: keyof ISetMethods)=>{
            this.set(key ,data[key] )
        });
        this.canvas.appendChild(this.body);
        this.setFileInfo();
        this.callback(LOADED,this.id);
    }
    browserInit(image:any,id:any){
        const data:IThumbData = {
            image: image,
            desc:'',
            height: 0,
            id:id,
            keys:'',
            name:image.name,
            size:image.size,
            stars:'0',
            type:image.type,
            width:0,
        }
        Object.keys(data).forEach((key: keyof ISetMethods)=>{
            this.set(key ,data[key] )
        });
        readImage(image).then((arrBuff:any)=>{
            this.body.querySelector('img').src = arrBuff[0];
            const cur_W = this.body.querySelector('img').offsetWidth;
            data.height = arrBuff[1];
            data.width = arrBuff[2];
            Object.keys(data).forEach((key: keyof ISetMethods)=>{
                this.set(key ,data[key] )
            });
            this.canvas.appendChild(this.body);
            setTimeout(()=>{
                this.body.style.width = cur_W + 'px'
            },50);

            this.setFileInfo();
            this.callback(LOADED,this.id);
        });
    }
    handleControls(e: Event){
        e.preventDefault();
        const origin = (e.target as HTMLDivElement).classList[0];
        switch (origin){
            case 'show':
            case 'delete':
                this.callback(origin,this.id)
                break;
            case 'status':
                this.controls[1].classList.remove('overlay');
                this.activeStatus.classList.remove('on');
                this.isActive = false;
                this.reportChanges('SELECTED');
                break;
            case 'check':
                this.controls[1].classList.add('overlay');
                this.activeStatus.classList.add('on');
                this.isActive=true;
                this.reportChanges('SELECTED');
                break;
        }
    }
    handleDashUpdate(update:any){
        console.log('Update ',update.field, update.value);
        this.isUpdating = true;
        if(update.field === 'keys'){
            console.log("Check this key: " ,update.value );
            if(update.value.action === 'ADD'){
                let tmpKeys = this.keys.split(',');
                tmpKeys.push(update.value.value)
                this.keys = tmpKeys.unique().join(',');
            } else {
                let tmpKeys = this.keys.split(',');
                if(tmpKeys.indexOf(update.value.value)){
                    tmpKeys.splice(tmpKeys.indexOf(update.value.value),1);
                    this.keys = tmpKeys.unique().join(',');
                }
            }
            this.isUpdating = false;
            return;
        }
        this.set(update.field,update.value);
        if(update.field === 'stars'){
            this.starRating.setRate(update.value);
        }
        this.setFileInfo();
        this.isUpdating = false;

    }
    handleStarRate(rate: any){
        this.stars = rate;
        console.log("handleStarRate ",this.isUpdating )

        if(this.isUpdating){ return }
        this.reportChanges('UPDATE')
    }
    setFileInfo(){
        const data:any = {
            name: this.get('name'),
            type: this.get('type'),
            size: '(&thinsp;'+this.get('width') + '/' + this.get('height') +'&thinsp;)&thinsp;'+ humanFileSize(this.get('size')),
        }
        Object.keys(data).forEach((label:any)=>{
            try{
                this.labels.forEach((input:any)=>{
                    if((input as HTMLDivElement).dataset.input === label){
                        input.innerHTML = data[label];
                        throw true;
                    }
                })
            }
            catch (err:any){
            }
        })
    }
    upload(){
        this.starRatingLayer.classList.add('uploading');
        this.toolBarLayer.classList.add('uploading');
        this.uploadLayer.classList.add('working');
        const payload_ = new FormData()
        payload_.append('image',this.image);
        this.asyncEndPoint(this.uploadProgress,`http://192.168.8.18/api/back-end`,payload_).then((r:any)=>{
            this.uploadLayer.classList.add('working');
            this.activeStatusBar.classList.add('uploaded');
            console.log(JSON.parse(r).file);
            this.serverName = JSON.parse(r).file;
            this.callback(UPLOADED,this.id);
        }).catch((err)=>{
            this.activeStatusBar.classList.add('upError')
            this.uploadLayer.classList.remove('working');
            this.callback(UPLOADED_FAIL,this.id);
        })
    }
    register(){
        let payload = this.getFormData();
        payload.append('server_name',this.serverName);
        this.asyncEndPoint(this.uploadProgress,`http://192.168.8.18/api/back-end/store`,payload)
            .then((resp:any)=>{
                console.log('Registered ' , resp );
                this.callback(REGISTERED,this.id);
            })
            .catch((err:any)=>{
                console.log('WTF, got an error: ' , err );
                this.callback(REGISTERED_FAIL,this.id);
            })
    }
    getStatus(){
        return this.isActive;
    }
    select(){
        if(this.isActive){console.log('Already SELECTED');return}
        this.controls[1].classList.add('overlay');
        this.activeStatus.classList.add('on');
        this.isActive=true;
        this.reportChanges('SELECTED');
    }
    unSelect(){
        if(!this.isActive){console.log('Already UNSELECTED');return}
        this.controls[1].classList.remove('overlay');
        this.activeStatus.classList.remove('on');
        this.isActive = false;
        this.reportChanges('SELECTED');
    }
    kill(){
        this.fadeOut(this.body);
    }
    fadeOut(el:any){
        el.style.opacity = 1;
        const $report = this.reportChanges.bind(this);
        (function fade() {
            if ((el.style.opacity -= .1) < 0) {
                el.style.display = "none";
                el.parentNode.removeChild(el);
                $report('DELETE')
            } else {
                requestAnimationFrame(fade);
            }
        })();
    }
    reportChanges(type:any){
        const evtData:IThumbUpdate = {
            type: type,
            thumb: this
        }
        const thumbUpdate = new CustomEvent('thumbUpdate', {
            bubbles: true,
            detail: evtData
        });
        document.dispatchEvent(thumbUpdate);
    }
    static thumbWireFrame(){
        return `<img src="" alt="">
<div class="active">
 <div class="ctrlBtn">
 <div class="status ctrl"></div>
 </div>
</div>
<div class="starBar">
    <div class="starRate"></div>
    <div class="ctrlBtn">
        <div class="check ctrl"></div>
        <div class="delete ctrl"></div>
    </div>
</div>
<div class="toolBar">
    <div class="fileInfo">
        <div data-input="name">animals-q-c-640-480-9.jpg</div>
        <div data-input="type">image/jpeg</div>
        <div data-input="size">( 480 / 640 ) 61.38 kB</div>
    </div>
    <div class="show ctrl"></div>
</div>
<div class="loadProgress">
<div class="c100 p100 med">
    <span>100%</span>
    <div class="slice">
        <div class="bar"></div>
        <div class="fill"></div>
    </div>
</div>
</div>`

    }

    //
    //
    // // iniRegister(){
    // //     // let register = this.getFormData();
    // //     // register.append('server_name',this.serverName);
    // //     this.register(this.uploadProgress,this.serverName,this.callback);
    // //
    // // }
    //
    //
    // getHTMLForm(){
    //     let keys = Object.keys(new Thumb());
    //     const form = document.createElement("form");
    //     form.setAttribute("method", "post");
    //     form.setAttribute("action", "http://192.168.33.33/api/back-end/store");
    //     form.setAttribute("enctype", "multipart/form-data");
    //
    //     let IMAGE = document.createElement("input");
    //     IMAGE.setAttribute("type", "text");
    //     IMAGE.setAttribute("name", "image");
    //     IMAGE.setAttribute("value",  this.image.name);
    //     form.appendChild(IMAGE);
    //
    //     keys.splice(keys.indexOf('image'),1)
    //     keys.forEach((field: keyof IGetMethods)=>{
    //         let inputField = document.createElement("input");
    //         inputField.setAttribute("type", "text");
    //         inputField.setAttribute("name", field);
    //         inputField.setAttribute("value", this.get(field));
    //         form.appendChild(inputField);
    //         form.innerHTML += '<br>';
    //     });
    //
    //     let SERVER_NAME = document.createElement("input");
    //     SERVER_NAME.setAttribute("type", "text");
    //     SERVER_NAME.setAttribute("name", "server_name");
    //     SERVER_NAME.setAttribute("value",  this.serverName);
    //     form.appendChild(SERVER_NAME);
    //     form.innerHTML += '<br>';
    //
    //     const submit = document.createElement('input');
    //     submit.setAttribute("type", "submit");
    //     submit.setAttribute("value", "TRY ME");
    //     form.appendChild(submit);
    //     return form;
    // }

}