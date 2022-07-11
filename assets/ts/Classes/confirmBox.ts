export default class ConfirmBox {
    protected overlay: HTMLElement;
    constructor() {
        this.overlay = document.createElement('DIV');
        this.overlay.className = 'user-confirm';
    }
    confirm(message:any){
        this.overlay.innerHTML = ConfirmBox.template(message);
        document.body.appendChild(this.overlay);
        // @ts-ignore
        return new Promise((resolve, reject )=>{

            (this.overlay.querySelector('#btnShow') as HTMLElement).onclick = (e)=>{
                e.preventDefault();
                document.body.removeChild(this.overlay)
                resolve(true);
            }
            (this.overlay.querySelector('#btnCancel') as HTMLElement).onclick = (e)=>{
                e.preventDefault();
                document.body.removeChild(this.overlay)
                resolve(false)
            }
        });

    }
    static template(message:any){
        return `<div class="confirmBox">
            <div class="confirm-error">
                ${message}<br><br>
                <button id="btnShow" class="btn btn-success btn-sm">OK</button>
                <button id="btnCancel" class="btn btn-danger btn-sm">Cancel</button>
            </div>
        </div>`;
    }
}

