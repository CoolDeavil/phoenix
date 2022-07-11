import requestHTTP from "./Classes/requestHTTP";


function main(){
    console.log("Site Root!");

    // const req = new requestHTTP();
    // req.request({
    //     method: 'get',
    //     targetURL: 'http://192.168.8.18/api/cors',
    //     payload: ''
    // }).then((cors:any)=>{
    //     console.log('CORS: ' , cors );
    // });

    // req.request({
    //     method: 'get',
    //     targetURL: 'user_avatar.json',
    //     payload: ''
    // }).then((users:any)=>{
    //
    //     const oUsers = JSON.parse(users);
    //     console.log('USERS: ' ,oUsers );
    // });



    // let request = new XMLHttpRequest();
    // request.open('GET', 'user_avatar.json', true);
    // request.onload = function() {
    //     if (this.status >= 200 && this.status < 400) {
    //         // Success!
    //         let data = JSON.parse(this.response);
    //
    //
    //         console.log('users ', data)
    //     } else {
    //         // We reached our target server, but it returned an error
    //
    //     }
    // };
    // request.onerror = function() {
    //     console.log('There was a connection error of some sort');
    // };
    // request.send();
    //



}

if (document.readyState === 'complete') {
    main()
} else {
    document.addEventListener('DOMContentLoaded', main);
}