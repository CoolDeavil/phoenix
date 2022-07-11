import EVTHandler from "./eventHandler";
import IForm from "../Interfaces/iForm";
import extendDefaults from "../common/extendDefaults";
import IInput from "../Interfaces/iInput";
import IFormField from "../Interfaces/iFormField";
import Label from "./labels"
import Validator from "./validator";
import Async from "./asyncValidator";

const BASE = 0;
const ALERT = 1;
const ERROR = 2;

export default class FRules {
    private form: IForm;
    private readonly defaults: any;
    private readonly watchFields: IInput[];
    private submitBtn: HTMLElement;
    private formElement: HTMLFormElement;
    private label: Label;
    private eventHandler: EVTHandler;
    private validator: Validator;
    private async: Async;
    constructor(form:IForm) {
        this.defaults = {
            render: true,
            cssBase: 'eRor',
            cssAlert: 'eAlert',
            cssError: 'eError',
            cssAsync: 'async',
            watchers: [
                'input',
                'blur',
                'keyup',
                'focus',
            ],
        }
        if(form.form === '' || !document.querySelector(`#${form.form}`)){
            throw 'Define the target Form to validate';
        }
        this.defaults = extendDefaults(this.defaults, form.defaults);
        this.form = form;
        this.formElement = document.querySelector(`#${form.form}`);
        this.submitBtn = Array.prototype.slice.call(this.formElement.elements, 0).filter((input: any) => {
            return input.type === 'submit';
        })[0];
        this.watchFields = [];
        console.log('FManager V0.0.0.0 - ' , this.defaults);
        this.initWatchFields(form.fields);

        const labelStyles = {
            cssBase: this.defaults.cssBase,
            cssAlert: this.defaults.cssAlert,
            cssError: this.defaults.cssError,
            cssAsync: this.defaults.cssAsync,
        };

        if(this.defaults.render){
            this.label = new Label(this.renderErrorLabels(form.fields),labelStyles);
        }else{
            this.label = new Label(this.loadErrorLabels(),labelStyles) ;
        }
        this.eventHandler = new EVTHandler({
            watchList: this.watchFields,
            callBack: this.$handleFieldStatus.bind(this),
            watchers: this.defaults.watchers
        });
        this.validator = new Validator(this.watchFields);
        this.async = new Async();
        this.formElement.autocomplete = "off";
        this.formElement.noValidate = true;

        this.formElement.onsubmit = this.reviewValidation.bind(this);
    }
    reviewValidation(evt:Event){
        evt.preventDefault();
        try{
            this.watchFields.forEach((field:IInput, index:number)=>{
                if(!field.validated){
                    this.watchFields[index].validated = false;
                    this.label.setStatusByID(index,ERROR);
                    throw index;
                }
            });
        }catch (error:any){
            this.submitBtn.classList.add('locked');
            setTimeout(()=>{
                this.submitBtn.classList.remove('locked');
                return;
            },1000);
            console.log("Catch: " , error );
            return;
        }
        console.log("Revision say God To Go!");
        this.formElement.submit();

    }
    $handleFieldStatus(result:any){
        switch (result.type){
            case 'focus':
                if(!this.watchFields[result.origin].validated){
                    this.label.setStatusByID(result.origin,ALERT);
                    // if(this.label.getCSSClassByID(result.origin) === CSS_BASE){
                    //     this.label.setStatusByID(result.origin,ALERT);
                    // }else {
                    //     this.label.setStatusByID(result.origin,ALERT);
                    // }
                }
                break;
            case 'blur':
                if(!this.watchFields[result.origin].validated){
                    this.label.setStatusByID(result.origin,ERROR);
                }
                break;
            case 'input':
            case 'change':
            case 'keyup':
                this.validateField(result.origin)
                break;
        }
        return;
    }
    validateField(id:number){
        const result_ = this.validator.pipe(this.watchFields[id].rules.validation, this.watchFields[id]);
        console.log(result_);
        if(!result_.status){
            console.log("Field is invalidated");
            this.watchFields[id].validated=false;
            this.label.setStatusByID(id,ALERT);
            this.label.resolveLabelByID(id, result_.failIdx);
            return;
        }
        this.watchFields[id].validated = true;
        this.label.setStatusByID(id,BASE);
        if(this.watchFields[id].rules.asyncValidation.length===0){return}
        console.log("Start Async Process.....")
        this.watchFields[id].classList.add(this.defaults.cssAsync);

        let parsed:any = [];

        this.watchFields[id].rules.asyncValidation.forEach((url:any)=>{
            parsed.push(url[0]+'?'+url[1] +'='+this.watchFields[id].value)
        });

        // console.log('@@@@', parsed);
        // return;


        this.async.pipe(parsed). then((resp:any)=>{
            console.log('@@@ PIPE: ',resp);
            if(!resp.status){
                this.label.setStatusByID(id,ALERT);
                this.label.setLabelByID(id,resp.label);
                this.watchFields[id].validated=false;
            }
            this.watchFields[id].classList.remove(this.defaults.cssAsync)
        });
    }
    initWatchFields(rules:any[]){
        const  fields  = Array.prototype.slice.call(this.formElement.elements, 0);
        rules.forEach((rule:IFormField, index)=>{
            let input:IInput = fields.filter((f:any)=>{
                return f.name === rule.name;
            })[0];
            if(!input){
                throw 'Field configuration does not match... ';
            }
            if(input.type==='radio'){
                input.form.querySelectorAll(`input[name="${input.name}"]`).forEach((input:IInput)=>{
                    let data = {
                        index: index,
                        validation: rule.validation,
                        asyncValidation: rule.asyncValidation,
                        errorMessages: rule.errorMessages
                    }
                    this.initializeField(input,data);
                })
            }else {
                let data = {
                    index: index,
                    validation: rule.validation,
                    asyncValidation: rule.asyncValidation,
                    errorMessages: rule.errorMessages
                }
                this.initializeField(input,data);
            }
            this.watchFields.push(input);
        });
    }
    initializeField(input:IInput,data: any){
        input.validated = false;
        input.idx = data.index;
        input.rules = {
            validation: data.validation,
            asyncValidation: data.asyncValidation,
            errorMessages: data.errorMessages
        }
    }
    renderErrorLabels(rules:any[]){
        let labelCollection:any = [];
        const  fields  = Array.prototype.slice.call(this.formElement.elements, 0);
        rules.forEach((rule:IFormField, index)=>{
            let input = fields.filter((f:any)=>{
                return f.name === rule.name;
            })[0];
            let errorLabel = document.createElement('DIV');
            errorLabel.className = this.defaults.cssBase;
            // errorLabel.innerHTML =  this.defaults.label
            if(input.parentNode.nodeName === 'LABEL'){
                if(input.type === 'radio'){
                    const siblings = this.formElement.querySelectorAll(`input[name="${input.name}"]`);
                    if((siblings[siblings.length-1].parentNode as HTMLElement).nodeName === 'LABEL'){
                        (siblings[siblings.length-1].parentNode as HTMLElement).insertAdjacentElement('afterend',errorLabel );
                    }else {
                        siblings[siblings.length-1].insertAdjacentElement('afterend',errorLabel );
                    }
                }else {
                    (input.parentNode as HTMLFormElement).insertAdjacentElement('afterend',errorLabel );
                }
            } else {
                if( (input.nextElementSibling as HTMLElement) ){
                    if((input.nextElementSibling as HTMLElement).nodeName=='LABEL'){
                        if(input.type === 'radio'){
                            const siblings = this.formElement.querySelectorAll(`input[name="${input.name}"]`);
                            siblings[siblings.length-1].nextElementSibling.insertAdjacentElement('afterend',errorLabel );
                        } else {
                            input.nextElementSibling.insertAdjacentElement('afterend',errorLabel );
                        }
                    } else{
                        input.insertAdjacentElement('afterend',errorLabel );
                    }
                } else {
                    input.insertAdjacentElement('afterend',errorLabel );
                }
            }
            labelCollection.push({
                name: input.name,
                label: errorLabel as IInput,
                rules: input.rules
            });
        });
        return labelCollection;
    }
    loadErrorLabels(){
        let labelCollection:any = [];
        const  labels  = Array.prototype.slice.call(document.querySelectorAll(`.${this.defaults.cssBase}`), 0);

        if(labels.length !== this.watchFields.length){
            throw 'Field error labels dont match... ';
        }
        this.watchFields.forEach((item:IInput)=>{
            let errLabel = labels.filter((f:any)=>{
                return f.dataset.name === item.name;
            })[0];
            if(!errLabel){
                throw 'Field configuration does not match... ';
            }
            labelCollection.push({
                name: item.name,
                label: errLabel as IInput,
                rules: item.rules
            });
        });
        return labelCollection;
    }
}