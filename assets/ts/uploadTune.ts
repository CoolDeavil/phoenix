import EasyUpload from "./Classes/easyUpload";
import requestHTTP from "./Classes/requestHTTP";


function main(){
    console.log("Upload Tune");
    let up = new EasyUpload({
        anchor: 'uploader',
        viewPort: 'canvas'
    });

    const req = new requestHTTP();

    req.request({
        method:'get',
        targetURL: 'http://192.168.8.18/api/cors',
        payload: ''
    }).then((r)=>{
console.log('CORS:  ',r);
    })
}


if (document.readyState === 'complete') {
    main()
} else {
    document.addEventListener('DOMContentLoaded', main);
}