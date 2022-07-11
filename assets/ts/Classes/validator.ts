import IValidations from "../Interfaces/iValidations";
import IInput from "../Interfaces/iInput";
import IParsedRule from "../Interfaces/iParsedRule";
import parseRuleParams from "../common/parseParameters";


export default class Validator {
    private validation: IValidations;
    private watchFields: IInput[];

    constructor(watchFields:IInput[]) {
        this.watchFields = watchFields;
        this.loadValidations();
        console.log("Validator v0.0.0.0")
    }
    pipe(validations:any[],field:IInput){
        let result:boolean = false;
        try{
            validations.forEach((fnf:any, index:number)=>{
                if(typeof fnf === 'function'){
                    result = fnf(field);
                } else {
                    let pr: IParsedRule = parseRuleParams(fnf);
                    result = this.validateRule(pr.func,field,pr.params)
                }
                if(!result){
                    throw {
                        status: false,
                        failIdx: index,
                    };
                }
            });

        }catch(error:any){
            return error;
        }

        return {
            status: true,
            failIdx: 9999,
        };
    }
    validateRule(rule: keyof IValidations, el: IInput,params:any){
        return this.validation[rule](el,params);
    }
    loadValidations(){
        this.validation = {
            min: (target:IInput,params:any) => {
                const p = params.split(',');
                let limit = p[0];
                if(target.type == 'number'){
                    return parseInt(target.value) >= limit;
                }else{
                    return target.value.length >= limit;
                }
            },
            max: (el:IInput,params:any) => {
                const p = params.split(',');
                let limit = p[0];
                if(el.type == 'number'){
                    return parseInt(el.value)<= limit;
                }else{
                    return el.value.length <= limit;
                }
            },
            range: (el:IInput,params:any) => {
                const p = params.split(',');
                let min = p[0];
                let max = p[1];
                if(el.type == 'number'){
                    return (parseInt(el.value) >= min && parseInt(el.value) <= max)

                }else{
                    return (el.value.length >= min && el.value.length <= max)
                }
            },
            required: (el:IInput,params:any) => {
                switch (el.type){
                    case 'checkbox':
                        return el.checked;
                    case 'radio':
                        let radioSiblings = el.form.querySelectorAll(`input[name="${el.name}"]`)
                        try {
                            radioSiblings.forEach((r:IInput)=>{
                                if(r.checked) {
                                    throw true
                                }
                            })
                            return false;
                        } catch (valid) {
                            radioSiblings.forEach((r:IInput)=>{
                                r.validated = true
                            })
                            return true
                        }
                    case 'select-one':
                        return parseInt(el.value) !== 0;
                    case 'file':
                        return el.files.length != 0 ;
                    default:
                        return !(el.value === '' || el.value === null || parseInt(el.value) === 0);
                }
            },
            validEmail: (el:IInput, params:any) => {
                const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(el.value.toLowerCase());
            },
            securePassword: (el:IInput,params:any) => {
                const re = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
                return re.test(el.value);
            },
            matchField: (el:IInput,params:any) => {
                let target = this.watchFields.filter((field:any)=>{
                    return field.name === params
                })[0];
                return el.value === target.value
            },
            mobileNumber(target:IInput) :boolean {
                let regex = new RegExp("^[0-9]{9}$");
                let number = target.value.replace(/ /g,'');
                let isValid = regex.test(number);
                if(isValid){
                    let USNumber2 = number.match(/(\d{3})(\d{3})(\d{3})/);
                    target.value = USNumber2[1] + " " + USNumber2[2] + " " + USNumber2[3];
                    return true;
                }
                return false;
            }
        }
    }
}