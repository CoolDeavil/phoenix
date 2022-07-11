import IFormField from "./iFormField";

export default interface IForm {
    form: string;
    fields: IFormField[],
    defaults: any;
}