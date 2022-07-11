import extendDefaults from "../common/extendDefaults";
import IInput from "../Interfaces/iInput";
export default class EVTHandler {
    private readonly defaults: any;
    private readonly options: any;
    private readonly callBack: (e: any) => any;
    constructor(options:any) {
        this.defaults = {
            callBack: (e:KeyboardEvent)=>{
                e.preventDefault();
            },
            watchers: [
                'blur',
                'keyup',
                'focus',
            ],
        }
        this.options = extendDefaults(this.defaults, arguments[0]);
        this.callBack =this.defaults.callBack;
        this.defaults.watchList.forEach((input:IInput)=>{
            this.addFieldWatchers(input);
        });
        console.log("EVTHandler ", this.defaults)
    }
    addFieldWatchers(field: IInput){


        if(field.type === 'radio'){
            // console.log("Get all my Brothers - ", field.type);
            // console.log("Get all my Brothers - ", field.form);
            // console.log("Get all my Brothers - ", field.form.querySelectorAll(`input[name="${field.name}"]`));

            field.form.querySelectorAll(`input[name="${field.name}"]`).forEach((radio:any)=>{
                radio.validated = false;
                this.defaults.watchers.forEach((event:string)=>{
                    radio.addEventListener(event,this.handleFieldChange.bind(this), false);
                });

            });

        }else {
            this.defaults.watchers.forEach((event:string)=>{
                field.addEventListener(event,this.handleFieldChange.bind(this), false);
            });
        }

    }
    handleFieldChange(evt:Event){
        evt.preventDefault();
        this.callBack({
            type:evt.type,
            origin:(evt.target as IInput).idx
        })
    }
}