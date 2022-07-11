import IInput from "./iInput";

export default interface IValidations {
    min: (el:IInput,params:any) => boolean;
    max: (el:IInput,params:any) => boolean;
    range: (el:IInput,params:any) => boolean;
    required: (el:IInput,params:any) => boolean;
    validEmail: (el:IInput,params:any) => boolean;
    securePassword: (el:IInput,params:any) => boolean;
    matchField: (el:IInput,params:any) => boolean;
    mobileNumber: (el:IInput,params:any) => boolean;

}
