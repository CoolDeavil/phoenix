export default class DropZone {
    protected dropElement: HTMLElement;
    protected callBack: any;

    constructor( element : HTMLElement, callBack: any ) {
        this.dropElement = element;
        this.dropElement.className = 'dragDrop';
        this.callBack = callBack;
        this.setEventHandlers();
        console.log('DropZone v0.0.0')
    }
    setEventHandlers(){
        ['dragenter','dragover','drop'].forEach( eventType => {
            window.addEventListener(eventType, this.filterTarget.bind(this), false);
        });
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventType => {
            this.dropElement.addEventListener(eventType, this.preventDefaults, false)
        });
        ['dragenter', 'dragover'].forEach(eventType => {
            this.dropElement.addEventListener(eventType, this.highlight.bind(this), false)
        });
        ['dragleave', 'drop'].forEach(eventName => {
            this.dropElement.addEventListener(eventName, this.unHighlight.bind(this), false)
        });
        this.dropElement.addEventListener('drop', this.handleImageDrop.bind(this),false)
    }
    filterTarget($event: any ){
        if ($event.target !== this.dropElement) {
            $event.preventDefault();
            $event.dataTransfer.effectAllowed = "none";
            $event.dataTransfer.dropEffect = "none";
        }
    }
    preventDefaults ($event:any) {
        $event.preventDefault();
        $event.stopPropagation();
    }
    highlight(){
        this.dropElement.classList.add('dragOver')
    }
    unHighlight(){
        this.dropElement.classList.remove('dragOver')
    }
    handleImageDrop($event : any ){
        let dt = $event.dataTransfer;
        let files = dt.files;
        if(typeof this.callBack === 'function'){
            // this.callBack(files[0]);
            this.callBack(files);
        }
    }
}
