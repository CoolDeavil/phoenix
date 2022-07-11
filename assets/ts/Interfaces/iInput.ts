import IFormField from "./iFormField";
import IRules from "./IRule";


export default interface IInput extends HTMLInputElement{
    validated: boolean
    idx: number
    rules: IRules
}