import extendDefaults from "../common/extendDefaults";
import uid from "../common/uid";
import DropZone from "./dropZone";
import UThumb from "./uThumb";
import Dashboard from "./dashboard";
import humanFileSize from "../common/humanFileSize";
import requestHTTP from "./requestHTTP";
import ConfirmBox from "./confirmBox";


const LOADED = 0;
const UPLOADED = 10;
const UPLOADED_FAIL = 99;
const REGISTERED = 109;
const REGISTERED_FAIL = 110;

export default class EasyUpload {
    private readonly defaults: any;
    private readonly body: HTMLDivElement;
    private canvas: HTMLDivElement;
    private inputField: HTMLInputElement;
    private controls: any;
    private drop: DropZone;
    private loadLayer: HTMLDivElement;
    private readonly thumbViewPort: HTMLDivElement;
    private dash: Dashboard;
    private thumbList: any;
    private fileCounter: HTMLDivElement;
    private byteCounter: HTMLDivElement;
    private loaderCounter: number;
    private promiseToLoad: number;
    private asyncLoaderCounter: number;
    private asyncPromiseToLoad: number;
    private req: requestHTTP;
    private imagesToLoad: any;
    private choice: ConfirmBox;
    constructor(options:any) {
        this.defaults = {
            anchor: false,
            viewPort: false,
            targetURL: 'http://192.168.8.18/api/back-end/thumb',
            renderMode: 'BROWSER',
            scroll: ''
        }
        this.loaderCounter = 0;
        this.promiseToLoad = 0;

        this.defaults = extendDefaults(this.defaults, options);
        this.body = document.querySelector(`#${this.defaults.anchor}`) as HTMLDivElement;
        this.body.className = 'uploader';
        this.body.innerHTML= EasyUpload.renderComponentBody();

        this.fileCounter = this.body.querySelector('.fCounter') as HTMLDivElement;
        this.byteCounter = this.body.querySelector('.bCounter') as HTMLDivElement;

        this.canvas = document.querySelector(`#${this.defaults.viewPort}`) as HTMLDivElement;
        this.canvas.className = 'viewPort';
        this.canvas.innerHTML = EasyUpload.renderViewPort();

        this.loadLayer = this.canvas.querySelector('.isLoading') as HTMLDivElement;
        this.thumbViewPort = this.canvas.querySelector('.imageViewPort') as HTMLDivElement;

        this.controls = Array.prototype.slice.call(this.body.querySelectorAll('.ctrl'));
        this.drop = new DropZone(this.body.querySelector('.dragDrop'),this.handleFileInput.bind(this));
        this.dash = new Dashboard({
            anchor: 'dash'
        })
        this.req = new requestHTTP();
        this.choice = new ConfirmBox();
        this.thumbList=[];
        this.imagesToLoad=[];
        this.bootstrap();
    }
    bootstrap(){
        this.controls.forEach((ctrl:any)=>{
            ctrl.addEventListener('click',this.handleControls.bind(this),false)
        });
        this.inputField = this.body.querySelector('input[type="file"]') as HTMLInputElement;
        this.inputField.addEventListener('change',(e:Event)=>{
            const files = (e.target as HTMLInputElement).files;
            this.handleFileInput(files)
        }, false);
        this. updatePayload();
    }
    handleControls(e:Event){
        const action = (e.target as HTMLDivElement).dataset.action;
        switch (action){
            case 'UPLOAD':
                console.log('Start upload on all Thumbs');
                this.promiseToLoad = this.thumbList.length;
                this.loaderCounter = 0;
                this.thumbList.forEach((el:any)=>{
                    el.thumb.upload();
                });
                break;
            case 'CANCEL':
                break;
            case 'TOGGLE':
                break;
            case 'NONE':
                this.thumbList.forEach((item:any)=>{
                    item.thumb.unSelect();
                })
                break;
            case 'ALL':
                this.thumbList.forEach((item:any)=>{
                    item.thumb.select();
                })
                break;
            default:
                console.log("Alien on Board....");
        }
        console.log("Action ", action)


    }
    handleFileInput(files:any){
        this.loadLayer.classList.add('on');
        let errList = [];
        const images = Array.prototype.slice.call(files,0);
        this.loaderCounter = 0;
        this.promiseToLoad = files.length;
        this.imagesToLoad = files;

        if(this.defaults.renderMode === 'URL'){
            this.asyncLoaderCounter= 0;
            this.asyncPromiseToLoad=files.length;
            this.imagesToLoad = files;
            this.callAsyncEndPoint(images[this.asyncLoaderCounter]);
        }else {
            this.getBrowserThumbs(images);
        }
        return;
    }
    callAsyncEndPoint(image:any){
        let request = new XMLHttpRequest();
        const data = new FormData();
        data.append('image',image)
        request.open('POST', `${this.defaults.targetURL}`, true);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest' );
        request.setRequestHeader("Access-Control-Allow-Origin", "*");
        request.send(data);
        request.onload = () => {
            if (request.status >= 200 && request.status < 300) {
                this.validateAsyncResponse(request.response);
            }
        };
    }
    validateAsyncResponse(obj:any){
        this.asyncLoaderCounter++;
        let td = JSON.parse(obj);
        td['id'] = uid();
        td['render_mode'] = 'URL';

        // const exif = JSON.parse(td['exif']);
        // console.log(exif);

        this.thumbList.push({
            uid: td['id'],
            thumb: new UThumb(td,this.thumbViewPort,this.handleThumbCallBack.bind(this))
        });
        if(this.asyncLoaderCounter>=this.asyncPromiseToLoad){
            console.log("All Async Thumbs Loaded");
            this.updatePayload();
        }else {
            this.callAsyncEndPoint(this.imagesToLoad[this.asyncLoaderCounter])
        }
    }
    getBrowserThumbs(images:any){
        let errList:any =[];
        images.forEach((image:any) => {
            let thumbData:any = [];
            const uid_ = uid();
            thumbData['id'] = uid_
            thumbData['image'] = image;
            thumbData['render_mode'] = 'BROWSER'

            if(this.validateMIME(image.type)){
                this.thumbList.push({
                    uid: uid_,
                    thumb: new UThumb(thumbData,this.thumbViewPort,this.handleThumbCallBack.bind(this))
                });
            }else {
                errList.push(image);
                this.handleThumbCallBack(LOADED, uid_ );
            }
        });
        this.updatePayload();
    }
    handleThumbCallBack(action:any, id: string ){
        console.log('ThumbCallBack ', action, id );
        switch (action) {
            case LOADED:
                this.loaderCounter++;
                if(this.loaderCounter>=this.promiseToLoad){
                    console.log("All Loaded");
                    this.loadLayer.classList.remove('on');
                    this.updatePayload();

                }
            break;
            case UPLOADED:
                this.loaderCounter++
                if(this.loaderCounter>=this.promiseToLoad){
                    console.log("All Uploaded. Initialize Register: " , this.loaderCounter );
                    // document.querySelector('#success').classList.add('done');
                    this.reportUploadResult();
                }
            break;
            case UPLOADED_FAIL:
                console.log("[######] Error on the pipeline");
                this.loaderCounter++
                if(this.loaderCounter>=this.promiseToLoad){
                    document.querySelector('#success').classList.add('error')
                }
            break;
            case REGISTERED:
                this.loaderCounter++
                if(this.loaderCounter>=this.promiseToLoad){
                    console.log("All registered");
                    document.querySelector('#success').classList.add('done');
                }
            break;
            case 'delete':
                this.choice.confirm('Are you sure?').then((choice:any)=>{
                    if(choice){
                        this.thumbList.find((item:any)=>{
                            return item.uid === id;
                        }).thumb.kill();
                        this.deleteThumbEntry(id);
                        this.updatePayload();
                    }
                });
            break;
        }
    }
    reportUploadResult(){
        // REGISTERED
        this.promiseToLoad = this.thumbList.length;
        this.loaderCounter = 0;

        this.thumbList.forEach((item:any)=>{
            item.thumb.register();
        })
    }
    deleteThumbEntry(id:string){
        try{
            this.thumbList.forEach((item:any,i:number)=>{
                if(item.uid === id){
                    throw i;
                }
            });
        }catch(idx:any){
            this.thumbList.splice(idx,1);
        }
       return true;
    }
    validateMIME(type:any){
        let res = ['image/jpeg','image/png'].find( mime =>{
            return mime === type;
        });
        return !!res;
    }
    updatePayload(){
        console.log('EXECUTING updatePayload ');
        let totalBytes = 0;
        this.thumbList.forEach((entry:any)=>{
            totalBytes += entry.thumb.get('size');
        });
        this.fileCounter.innerHTML = this.thumbList.length;
        this.byteCounter.innerHTML = humanFileSize(totalBytes);
    }
    static renderComponentBody(){
        let uid_ = uid();
        return `<ul class="uploadControls">
                <li>
                    <label for="${uid_}" class="custom-file-upload">&nbsp;&#128449;&nbsp;</label>
                    <input name="image" id="${uid_}" type="file" multiple="">
                </li>
                <li>
                    <div class="addAll ctrl" data-action="ALL">&#x2713;</div>
                </li>
                <li>
                    <div class="removeAll ctrl" data-action="NONE">&#10008;</div>
                </li>
                <li>
                    <div class="toggleAll ctrl" data-action="TOGGLE">&#8634;</div>
                </li>
                <li>
                    <div class="cancelAll ctrl" data-action="CANCEL">&#x2620;</div>
                </li>
                <li>
                    <div class="uploadAll ctrl" data-action="UPLOAD">&#9757;</div>
                </li>
            </ul>
            <div class="dragDrop">
             <div class="report"><span class="fCounter">99</span>&nbsp;&#128193;&nbsp;<span class="bCounter">99</span></div>
</div>
           `;
    }
    static renderViewPort(){
        return `<div class="isLoading">
        <div class="_progress">
            <div class="c100 p100 big">
                <span>100%</span>
                <div class="slice">
                    <div class="bar"></div>
                    <div class="fill"></div>
                </div>
            </div>
        </div>
        </div><div class="imageViewPort"></div>`;
    }
    static renderCustomTemplate(item:any, i:any) {
        return `<li data-index="${i}">
<div class="imageItem">
<div class="pic">
<img src="./images/${item.name}" alt="">
</div>
<div class="label">
<div class="name">${item.name}</div>
<div class="type">${item.type}</div>
</div>
</div>
</li>`
    }
}