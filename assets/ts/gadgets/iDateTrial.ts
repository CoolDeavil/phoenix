import IDate from "../Classes/iDate";
import requestHTTP from "../Classes/requestHTTP";

export default function main(){
    console.log("IDate Tuning");


    const req = new requestHTTP();
    req.request({
        method: 'get',
        targetURL: 'http://192.168.8.18/api/cors',
        payload: ''
    }).then((cors:any)=>{
        console.log('CORS: ' , cors );
    });


    const calendar = new IDate({
        anchor:'calendar'
    })
}


if (document.readyState === 'complete') {
    main()
} else {
    document.addEventListener('DOMContentLoaded', main);
}