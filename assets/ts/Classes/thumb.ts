import IThumbData from "../Interfaces/iThumbData";
import IGetMethods from "../Interfaces/IGetMethods";
import ISetMethods from "../Interfaces/iSetMethods";
import humanFileSize from "../common/humanFileSize";
export default class Thumb implements IThumbData {
    public image: any;
    public desc: any;
    public height: any;
    public id: any;
    public keys: any;
    public name: any;
    public size: any;
    public stars: any;
    public type: any;
    public width: any;
    private getMethods: IGetMethods
    private setMethods: ISetMethods
    constructor() {
        this.image = ''
        this.desc = ''
        this.height = ''
        this.id = ''
        this.keys = ''
        this.name = ''
        this.size = ''
        this.stars = ''
        this.type = ''
        this.width = ''
    }

    get(rule: keyof IGetMethods ){
        return this.getMethods[rule]();
    }
    set(rule: keyof ISetMethods , value: any){
        return this.setMethods[rule](value);
    }
    loadGetMethods() {
        this.getMethods = {
            id: () => {
                return this.id
            },
            name: () => {
                return this.name
            },
            image: () => {
                return this.image
            },
            desc: () => {
                return this.desc
            },
            keys: () => {
                return this.keys
            },
            size: () => {
                return this.size
            },
            uiSize: () => {
                const regex = /(<([^>]+)>)/ig
                const human = humanFileSize(this.size).replace(regex, "");
                return '(' + this.height + '/' + this.width + ') ' + human;
            },
            stars: () => {
                return this.stars
            },
            type: () => {
                return this.type
            },
            height: () => {
                return this.height
            },
            width: () => {
                return this.width
            },
        }
    }
    loadSetMethods() {
        this.setMethods = {
            id: (id:any) => {
                this.id = id;
            },
            name: (name:any) => {
                this.name = name;
            },
            image: (name:any) => {
                this.image = name;
            },
            desc: (name:any) => {
                this.desc = name;
            },
            keys: (name:any) => {
                this.keys = name;
            },
            stars: (name:any) => {
                this.stars = name;
            },
            size: (name:any) => {
                this.size = name;
            },
            type: (name:any) => {
                this.type = name;
            },
            height: (name:any) => {
                this.height = name;
            },
            width: (name:any) => {
                this.width = name;
            },
        }
    }
    getJsonData(){
        let me:any = {};
        Object.keys(new Thumb()).forEach((key:any)=>{
            me[key] = this.get(key)
        })
        return JSON.stringify(me);
    }
    getFormData(){
        const payload = new FormData();
        Object.keys(new Thumb()).forEach((key:any)=>{
            payload.append(key,this.get(key))
        })
        return payload;
    }
    asyncEndPoint(el:HTMLElement, url:string, payload:any){
        const reqObj = new XMLHttpRequest();
        return new Promise((resolve,reject)=>{
            reqObj.onload = () => {
                if (reqObj.status >= 200 && reqObj.status < 300) {
                    resolve(reqObj.response);
                } else {
                    reject(reqObj.response);
                }
            };
            reqObj.upload.onprogress = (e:ProgressEvent) => {
                if (e.lengthComputable) {
                    let percentComplete = (e.loaded / e.total) * 100; //e.loaded / e.total * 100;
                    el.innerHTML =  percentComplete + '%';
                }
            };
            reqObj.onerror = () => reject(reqObj.statusText);
            reqObj.onabort = () => reject(reqObj.statusText);
            reqObj.open("POST", url);
            reqObj.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            reqObj.setRequestHeader("Access-Control-Allow-Origin", "*");
            reqObj.send(payload);
        })
    }
}