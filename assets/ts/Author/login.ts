export default function main(){
    // @ts-ignore
    if(window['formDataJson'].email){
        // @ts-ignore

        (<HTMLInputElement>document.querySelector(`input[name="email"]`)).value = window['formDataJson'].email;
        // @ts-ignore

        (<HTMLInputElement>document.querySelector(`input[name="pass"]`)).value = window['formDataJson'].pass;
        (<HTMLInputElement>document.querySelector(`input[name="rme"]`)).checked = true;
        let event = document.createEvent('HTMLEvents');
        event.initEvent('change', true, false);
        (<HTMLInputElement>document.querySelector(`input[name="email"]`)).dispatchEvent(event);
        (<HTMLInputElement>document.querySelector(`input[name="pass"]`)).dispatchEvent(event);
    }
};

if (document.readyState === 'complete') {
    main()
} else {
    document.addEventListener('DOMContentLoaded', main);
}