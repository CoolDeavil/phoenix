import IRules from "./IRule";

export default interface IErrorLabel extends HTMLInputElement {
    name: string;
    label: IErrorLabel;
    rules: IRules
}