import IErrorLabel from "../Interfaces/iErrorLabel";
import IParsedRule from "../Interfaces/iParsedRule";
import IValidations from "../Interfaces/iValidations";
import parseRuleParams from "../common/parseParameters";

const BASE = 0;
const ALERT = 1;
const ERROR = 2;

type functionKey = Extract<keyof IValidations, string>;

export default class Label{
    private readonly labels: IErrorLabel[];

    private readonly cssStyle: string
    private readonly cssStyleAlert: string
    private readonly cssStyleError: string
    private readonly styles: any;

    constructor(lCollection:IErrorLabel[], styles:any) {
        this.labels = lCollection;
        this.styles = styles;
        this.resolveLabels();

        this.cssStyle = this.styles.cssBase
        this.cssStyleAlert = this.styles.cssAlert
        this.cssStyleError = this.styles.cssError


        console.log('Label V.0.0.0', this.styles);
    }
    resolveLabels(){
        this.labels.forEach((label:IErrorLabel,index:number)=>{
            this.resolveLabelByID(index,0)
        })
    }
    setStatusByID(id:number, status:number ){
        switch (status){
            case BASE:
                this.labels[id].label.className = `${this.cssStyle}`;
                break;
            case ALERT:
                this.labels[id].label.className = `${this.cssStyle} ${this.cssStyleAlert}`;
                break;
            case ERROR:
                this.labels[id].label.className = `${this.cssStyle} ${this.cssStyleError}`;
                break;

        }
    }
    setLabelByID(id:number, label:string ){
        this.labels[id].label.innerHTML = label;
    }
    getCSSClassByID(id:number){
        return this.labels[id].label.className
    }
    resolveLabelByID(id:number, validation: number){
        if(!this.labels[id].rules.errorMessages[validation]){
            let func: functionKey;
            if(typeof this.labels[id].rules.validation[validation] === 'function'){
                func = this.labels[id].rules.validation[validation].prototype.constructor.name
            }else {
                func =  parseRuleParams(this.labels[id].rules.validation[validation]).func;
            }
            this.labels[id].label.innerHTML = "Failed at " + func;
        } else {
            this.labels[id].label.innerHTML = this.labels[id].rules.errorMessages[validation];
        }
    }
}