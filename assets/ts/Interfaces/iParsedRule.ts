import IValidations from "./iValidations";

export default interface IParsedRule {
    func: keyof IValidations;
    params: any;
}