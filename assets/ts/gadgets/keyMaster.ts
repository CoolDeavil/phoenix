import KeyMaster from "../Classes/keyMaster";
import requestHTTP from "../Classes/requestHTTP";


export default function main(){
    console.log('KeyMaster');

    const req = new requestHTTP();
    req.request({
        method: 'get',
        targetURL: 'http://192.168.8.18/api/cors',
        payload: ''
    }).then((cors:any)=>{
        console.log('CORS: ' , cors );
    });

    const kMaster = new KeyMaster({
        anchor: 'keyMaster'
    })
}


if (document.readyState === 'complete') {
    main()
} else {
    document.addEventListener('DOMContentLoaded', main);
}