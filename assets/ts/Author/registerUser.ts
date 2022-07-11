export default function main(){

 console.log('User Register');


    let el = document.querySelector('#resetCaptcha') as HTMLElement;

    el.addEventListener('click', resetCaptcha, false)


}
function resetCaptcha(){

    console.log("Resetting Captcha");

    resetCaptcha()
        .then((data:any)=>{
            data = JSON.parse(data);
            (document.querySelector('#cImage') as HTMLImageElement).src = data.image;
            // mForm.resetField('captcha')
        })
        .catch((error)=>{
            console.log("ERROR ",error);
        });
    function resetCaptcha(){
        let data = new FormData();
        data.append('req','new captcha');
        let reqObj = new XMLHttpRequest();
        // @ts-ignore
        return new Promise((resolve, reject) => {
            reqObj.open("POST", '/api/auth/resetCaptcha', true);
            reqObj.onload = ()=>{
                if(reqObj.status >= 200 && reqObj.status < 300){
                    resolve(reqObj.response);
                }else{
                    console.log("PROMISE ERROR " , reqObj.responseText);
                    reject(reqObj.responseText);
                }
            };
            reqObj.onerror = () => reject(reqObj.statusText);
            reqObj.setRequestHeader('X-Requested-With', 'XMLHttpRequest' );
            reqObj.send(data);
        });
    }
}

if (document.readyState === 'complete') {
    main()
} else {
    document.addEventListener('DOMContentLoaded', main);
}