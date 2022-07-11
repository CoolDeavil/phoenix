import {IRequest} from "../Interfaces/iRequest";
import {boyerMooreSearch} from "../common/booyerMoore";


export default class DataBank {
    private dataVault: any;
    private needle: any = false;
    constructor() { }
    loadData(data:any){
        if(data[0] != undefined ){
            if(typeof data[0] === 'string' ){
                console.log('Simple Array ', data.length);
                this.dataVault = data;
            } else {
                console.log('OBJECT ', data.length);
                if(this.needle){
                    if(data[0][this.needle]){
                        console.log("Object Validated.... %c[OK]",'color: green;font-weight: bolder');
                        this.dataVault = data;
                    }else {
                        console.log("Needle invalid.... %c[error]",'color: red;font-weight: bolder');
                        return;
                    }
                }else {
                    console.log("No needle defined");
                    return;
                }
            }
        }
    }
    setNeedle(value: any) {
        this.needle = value;
        console.log("DataBank [needle] " , value);
    }

    request(obj : IRequest){
        return new Promise((resolve,reject)=>{
            let result: any = [];
            this.dataVault.forEach((data:any)=>{
                if(boyerMooreSearch(
                    this.needle?data[this.needle].toUpperCase():data.toUpperCase(),
                    // @ts-ignore
                    obj.payload.toString().split('=')[1].toUpperCase())
                    >= 0){
                    result.push(data)
                }
            })
            resolve(JSON.stringify(result));
        });
    }

}