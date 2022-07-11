import ADraggable from "./aDraggable";
import {IAreaOptions} from "../Interfaces/iAreaOptions";
import {IBoundaries} from "../Interfaces/iBoundaries";

export default class DraggableArea {
    private readonly options: IAreaOptions;
    private readonly defaults: any;
    protected  draggables: any[];
    private canvas: HTMLElement;
    private viewRect: ClientRect | DOMRect;
    private dragCounter: number;

    constructor(options:any = null) {
        this.draggables = [];
        this.dragCounter = 0;
        this.options = options;
        this.defaults = {
            canvas: null,
            contain: false,
            callback: null
        };
        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = extendDefaults(this.defaults, arguments[0]);
        } else {
            this.options = extendDefaults(this.defaults, []);
        }
        function extendDefaults(source:any, properties:any) {
            let property;
            for (property in properties) {
                if (properties.hasOwnProperty(property)) {
                    source[property] = properties[property];
                }
            }
            return source;
        }
        this.bootstrap();
    }
    bootstrap(){
        if(!this.options.canvas){
            throw ('No Canvas element defined');
        }
        this.canvas = document.querySelector(`#${this.options.canvas}`);
        this.canvas.className = 'untouched';
        this.viewRect = this.canvas.getBoundingClientRect();
        this.setCustomHandlers();
    }
    resetViewRect(){
        this.removeDraggable()
        this.viewRect = this.canvas.getBoundingClientRect();
    }
    addDraggable(label:any = null){
        let div = document.createElement('DIV');
        this.canvas.appendChild( div );
        div.id = this.makeId(8);
        this.draggables.push(new ADraggable({
            element: div.id,
            callback: this.options.callback
        }));
        if(this.options.contain) {
            this.draggables[this.dragCounter].setBoundaries(this.measureBoundaries(this.draggables[this.dragCounter]));
        }
        if(label){
            div.innerHTML = label+' ' + Math.round( this.dragCounter+1);
        }
        this.dragCounter++;
    }
    makeId(length:any) {
        let result           = '';
        let characters       = 'abcdefghijklmnopqrstuvwxyz';
        let charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    removeDraggable(){
        this.draggables = [];
        this.dragCounter = 0;
        this.canvas.innerHTML = '';
    }
    measureBoundaries(draggable:any) : IBoundaries {
        const draggableViewRect= draggable.getViewRect();
        return {
            minX: Math.round(this.viewRect.left - draggableViewRect.left + draggable.position.x),
            maxX: Math.round(this.viewRect.right - draggableViewRect.right + draggable.position.x),
            minY: Math.round(this.viewRect.top - draggableViewRect.top + draggable.position.y),
            maxY: Math.round(this.viewRect.bottom - draggableViewRect.bottom + draggable.position.y)
        };
    }
    resetDraggable(index: number = null){
        if(index){
            this.draggables[index].resetLocation();
        }else {
            this.draggables.forEach( drag =>{
                drag.resetLocation();
            })
        }
    }
    setCustomHandlers() {
        this.canvas.addEventListener('draggedConstructor', e => {
            this.draggables.forEach((drag, i) => {
                if (drag.domElement === (e.target)) {
                    drag.domElement.dispatchEvent(new CustomEvent('update', { bubbles: true, detail: { boundaries: () => this.measureBoundaries(this.draggables[i]) } }));
                }
            })
        });
    }

}
