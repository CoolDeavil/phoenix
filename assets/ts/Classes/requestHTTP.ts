import {IRequest} from "../Interfaces/iRequest";

export default class requestHTTP {
    public reqObj: XMLHttpRequest;
    private method: string;
    private targetURL: string;
    private payLoad: string | FormData;

    constructor(){
        this.reqObj = null;
        this.method = 'get'
    }
    request(obj : IRequest) {
        this.method = obj.method;
        this.targetURL = obj.targetURL;
        this.payLoad = obj.payload;
        return new Promise((resolve, reject) => {
            if(this.reqObj === null){
                this.reqObj = new XMLHttpRequest();
            }else if(this.reqObj && this.reqObj.readyState !== 4){
                this.reqObj.abort();
                this.reqObj =  new XMLHttpRequest();
            }
            if(this.method === 'get'){
                this.reqObj.open("GET", this.targetURL+"?"+this.payLoad);
            }else{
                this.reqObj.open("POST", this.targetURL, true);
            }
            this.reqObj.onload = () => {
                if (this.reqObj.status >= 200 && this.reqObj.status < 300) {
                    resolve(this.reqObj.response);
                } else {
                    console.log('requestHTTP ERROR',this.reqObj.response);
                    reject(this.reqObj.response);
                }
            };
            this.reqObj.onerror = () => reject(this.reqObj.statusText);
            this.reqObj.onabort = () => reject('Operation canceled by new Search');
            this.reqObj.setRequestHeader('X-Requested-With', 'XMLHttpRequest' );
            // // this.reqObj.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
            // this.reqObj.setRequestHeader("Content-Type", "multipart/form-data");
            this.reqObj.setRequestHeader("Access-Control-Allow-Origin", "*");
            if(this.method === 'get'){
                this.reqObj.send();
            }else{
                if(typeof this.payLoad === 'string'){
                    this.reqObj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded" );
                }
                this.reqObj.send(this.payLoad);
            }
        });
    }
}
