import ISelect from "../Classes/iSelect";
import requestHTTP from "../Classes/requestHTTP";


export default function main(){
    console.log("Select with images...");

    const req = new requestHTTP();
    req.request({
        method: 'get',
        targetURL: 'http://localhost:5000/api/cors',
        payload: ''
    }).then((cors:any)=>{
        console.log('CORS: ' , cors );
    });

    const iSelectOne = new ISelect({
        anchor:'selectOne',
        placeholder: 'Preferred Language'

    });
    const iSelectMultiple = new ISelect({
        anchor:'selectMultiple',
        placeholder: 'Preferred Language'
    });

}




if (document.readyState === 'complete') {
    main()
} else {
    document.addEventListener('DOMContentLoaded', main);
}