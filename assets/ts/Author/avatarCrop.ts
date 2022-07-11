import ICropper from "../Interfaces/iCropper";
import Cropper from "../Classes/cropper";

let crop: Cropper;
let options:ICropper;
declare global {
    interface Window {
        userAvatar: any;
        user_id: any;
        url_confirm_avatar: any;
        url_user_profile: any;
    }
}

export function main() : void {
    options = {
        fileInput: document.querySelector("#fileSelect"),
        canvas: document.querySelector('#canvas'),
        fakeButton: document.querySelector('#fakeButton'),
        resetButton: document.querySelector('#resetBtn'),
        preview: document.querySelector('#cropped'),
        callBack: setUserAvatar
    }
    setUserAvatar();
    crop = new Cropper(options);
    
    (<HTMLElement>document.querySelector('#confirmCrop')).onclick = ()=>{
        if(crop.isImageCropped()){
            confirmNewAvatar()
        }else {
            window.flash.flashIt(
                {
                    type: 'warning',
                    title: 'No new Avatar Available',
                    message: 'You need to crop a image to get a new Avatar, no image crop found',
                }
            )
        }
    }
}
function confirmNewAvatar() : void {
    let parts = window.userAvatar.split('/');
    let dataLoad = new FormData();
    dataLoad.append("dataUri",crop.getImageCropped());
    dataLoad.append("user", window.user_id);
    dataLoad.append("old_avatar", parts[parts.length-1]);

    httpRequest(dataLoad,window['url_confirm_avatar'])
        .then( () => {
            window.location.replace(window['url_user_profile']);
        })
        .catch( (error:any) => {
            console.log("WTF, avatar confirm failed => ", error)
        })

}
function httpRequest( payload:any, url:any )  : any {

    return new Promise(function(resolve, reject){
        let reqObj = new XMLHttpRequest();
        reqObj.open("POST", url , true );
        reqObj.onload = () => {
            if (reqObj.status >= 200 && reqObj.status < 300) {
                resolve(reqObj.response);
            } else {
                reject(reqObj.statusText);
            }
        };
        reqObj.onerror = () => reject( reqObj.statusText);
        reqObj.onabort = () => reject('Operation canceled by new Search Term.');
        reqObj.setRequestHeader('X-Requested-With', 'XMLHttpRequest' );
        reqObj.send(payload);
    })
}
function setUserAvatar(){
    (<HTMLImageElement>document.querySelector('#cropped')).src = window['userAvatar']
}



if (document.readyState === 'complete') {
    main()
} else {
    document.addEventListener('DOMContentLoaded', main);
}