import IParsedRule from "../Interfaces/iParsedRule";
import IValidations from "../Interfaces/iValidations";

export default function parseRuleParams( rule:string ) : IParsedRule{
    let startParse: number;
    let validator: string
    let param: string;

    if(rule.indexOf('(')>0) {
        startParse = rule.indexOf('(');
        validator= rule.substring(0,startParse);
        param= rule.substring(startParse+1,rule.length-1);
    }else {
        validator = rule;
        param = '';
    }
    return {
        func: validator as keyof IValidations,
        params: param
    }
}
