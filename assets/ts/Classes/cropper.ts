import DraggableArea from './draggableArea';
import ICropper from "../Interfaces/iCropper";
import requestHTTP from "./requestHTTP";
import DropZone from "./dropZone";
import IAvatar from "../Interfaces/iAvatar";

export default class Cropper {
    protected dragArea: DraggableArea;
    protected dropZone: DropZone;
    protected canvas: HTMLElement;
    private request: requestHTTP;
    private options: ICropper;
    private selectedImage: any;
    private imageIsCropped: boolean;
    private dataUri: string;

    constructor(options: ICropper = null) {
        this.options = options;
        this.imageIsCropped = false;
        this.dragArea = new DraggableArea({
            canvas: 'canvas',
            contain: true,
            callback: this.onDragEnd.bind(this),
        });

        let dropElement : HTMLElement = options.canvas;
        let fileSelector: HTMLElement = options.fileInput;

        this.dropZone = new DropZone(dropElement, this.previewFile.bind(this))
        this.request = new requestHTTP();

        fileSelector.onchange = this.handlePreviewFile.bind(this);
        this.options.fakeButton.onclick = (e:any) => {
            e.preventDefault();
            fileSelector.click();
        };
    }
    onDragEnd(position:any) {


        // console.log(debug);
        //
        // const size = "250";
        //
        // (debug.querySelector(`input[name="image"]`) as HTMLInputElement).value =  this.selectedImage
        // (debug.querySelector(`input[name="top"]`) as HTMLInputElement).value =  position.y
        // (debug.querySelector(`input[name="left"]`) as HTMLInputElement).value =  position.x
        // (debug.querySelector(`input[name="width"]`) as HTMLInputElement).value =  size
        // (debug.querySelector(`input[name="height"]`) as HTMLInputElement).value =  size
        // return;


        let cropData = new FormData();
        cropData.append('image',this.selectedImage);
        cropData.append('top',position.y);
        cropData.append('left',position.x);
        cropData.append('width','250');
        cropData.append('height', '250');

        const cropped = {
            image:this.selectedImage,
            top:position.y,
            left:position.x,
            width:250,
            height:250,
        }

        let debug = document.querySelector('#image');


        // // (debug as HTMLInputElement).files[0] = this.selectedImage;
        // console.log(cropped);
        // // console.log(debug);
        // return;

        this.request.request({
            method: 'POST',
            targetURL: window.location.origin +'/api/auth/avatarCrop',
            payload: cropData
        }).then(
            results => {
                let res : IAvatar;
                if(typeof results === 'string'){
                    res = JSON.parse(results);
                }
                if(res.result === 'ok'){
                    this.imageIsCropped = true;
                    this.options.preview.src = res.dataUri
                    this.dataUri = res.dataUri;
                }
            }
        ).catch((err)=>{console.log('WTF!!  ', err );})
    }
    handlePreviewFile() {
        this.selectedImage = this.options.fileInput.files[0];
        this.previewFile(this.selectedImage);
        this.imageIsCropped = false;
        // this.options.callBack();
    }
    previewFile(file:any) {
        this.selectedImage = file;
        let reader = new FileReader();
        reader.addEventListener('load', this.handleLoad.bind(this), false)
        reader.readAsDataURL(file);
    }
    handleLoad(e:any) : void {
        let img: HTMLImageElement = document.createElement('IMG') as HTMLImageElement;
        let element = this.options.canvas;
        img.onload = () => {
            if (img.naturalHeight <= 250 || img.naturalWidth <= 250) {
                console.log('Image selected is too small');
                window['flash'].flashIt({
                    type: 'warning',
                    title: 'Image Error',
                    message: 'The selected image is too small min 250x250',
                });
                return;
            } else {
                element.style.height = img.naturalHeight + 'px';
                element.style.width = img.naturalWidth + 'px';
                element.style.backgroundImage = `url(${e.target.result})`;
                this.dragArea.resetViewRect();
                this.dragArea.addDraggable()
            }
        }
        img.src = e.target.result;
    }
    isImageCropped() :  boolean{
        return this.imageIsCropped;
    }
    getImageCropped() :  string {
        return this.dataUri;
    }
}
