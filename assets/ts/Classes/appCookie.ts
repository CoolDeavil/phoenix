import ICookie from "../Interfaces/iCookie";

export default class AppCookie {
    constructor(){}
    setCookie(values: ICookie){
        let d = new Date();
        d.setTime(d.getTime() + 1000 );
        let expires = "expires="+d.toUTCString();
        if(values.path === null ){
            values.path =  '/'
        }
        document.cookie = `${values.name}=${values.value};${expires} ;path=${values.path}`;
    }
    getCookie(cname:any) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                let cookie = c.substring(name.length, c.length);
                if(cookie !== ''){

                    // console.log('AppCookie ',decodeURIComponent(cookie));
                    return JSON.parse(decodeURIComponent(cookie))
                    // return decodeURIComponent(cookie);
                }
            }
        }
        return '';
    }
    delCookie(name: string){
        let d = new Date();
        d.setTime(d.getTime() - 1000 );
        document.cookie = name + "=" + ";" + d + ";path=/";
    }
}