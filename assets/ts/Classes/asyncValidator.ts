

export default class Async {
    private endPoints: string[];
    private resolver: any;
    private asyncCount: number;
    private currentAsync: number;
    constructor() {}
    pipe(endPoints:string[]){
        this.endPoints = endPoints;
        this.asyncCount = endPoints.length;
        this.currentAsync = 0;
        return new Promise((resolve,reject)=>{
            this.resolver = resolve;
            this.callAsyncEndPoint()
        })
    }
    callAsyncEndPoint(){
        let reqObj = new XMLHttpRequest();
        reqObj.open("GET", this.endPoints[this.currentAsync]);
        reqObj.onload = () => {
            if (reqObj.status >= 200 && reqObj.status < 300) {
                this.validateAsyncResponse(reqObj.response);
            }
        };
        reqObj.send();
    }
    validateAsyncResponse(response:any){
        const result = JSON.parse(response);
        console.log("[@@@] validateAsyncResponse   ", result.status, this.currentAsync);
        if(result.status){
            this.currentAsync++;
            if(this.currentAsync<this.asyncCount){
               return this.callAsyncEndPoint();
            }
        }
        return this.resolver({
            status: result.status,
            callIndex: this.currentAsync,
            label:result.label
        })
    }
}

