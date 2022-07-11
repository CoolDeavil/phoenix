import {IDragOptions} from "../Interfaces/iDragOptions";
import {IBoundaries} from "../Interfaces/iBoundaries";
import {IPosition} from "../Interfaces/iPosition";

export default class ADraggable {
    domElement:HTMLElement;
    boundary: IBoundaries;
    position: IPosition;
    startPosition: IPosition;
    dragging:boolean;
    respectBoundaries:boolean;
    reset :boolean;
    private readonly options: IDragOptions;
    private readonly defaults:any;
    private viewRect: ClientRect | DOMRect;
    constructor(options:any){
        this.defaults = {
            element:null,
            reset: false,
            extraClass: null,
            callback: null
        };
        this.options = options;
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
        if(!this.options.element){
            throw ('No base element defined');
        }
        this.position = {x: 0, y: 0};
        this.reset = this.options.reset;
        // this.domElement = document.querySelector(`#${this.options.element}`);
        this.domElement = document.querySelector(`#${this.options.element}`);
        this.domElement.className = 'box';
        if(this.options.extraClass){
            this.domElement.classList.add(this.options.extraClass);
        }
        this.dragging = false;
        this.position = {x: 0, y: 0};
        this.startPosition = {x: 0, y: 0};
        this.reset = this.options.reset;
        this.respectBoundaries = false;
        this.viewRect = this.domElement.getBoundingClientRect();
        this.domElement.dispatchEvent(new CustomEvent('draggedConstructor', { bubbles: true, detail: { viewRect: () => this.viewRect } }));
        this.setHandlers();
    }
    setHandlers(){
        this.domElement.addEventListener('pointerdown',this.dragStart.bind(this),false);
        document.addEventListener('pointerup',this.dragEnd.bind(this),false);
        document.addEventListener('pointermove',this.drag.bind(this),false);
        document.addEventListener('mousedown',this.dragStart.bind(this),false);
        document.addEventListener('mouseup',this.dragEnd.bind(this),false);
        document.addEventListener('mousemove',this.drag.bind(this),false);
    }
    getViewRect(){
        return this.viewRect;
    }
    resetLocation(){
        this.dragging=true;
        this.reset=true;
        this.dragEnd();
        setTimeout(()=>{
            this.reset=false;
        },300);

    }
    setBoundaries(boundary:any){
        this.respectBoundaries = true;
        this.boundary  = boundary;
    }
    dragStart(event: PointerEvent){
        event.stopPropagation();
        if(event.target !== this.domElement ){
            return;
        }
        this.dragging = true;
        this.domElement.classList.add('dragging');
        this.startPosition = {
            x: event.clientX - this.position.x,
            y: event.clientY - this.position.y
        };
    }
    dragEnd(){
        if (!this.dragging) {
            return;
        }
        this.dragging = false;
        this.domElement.classList.remove('isDragging');
        if (this.reset) {
            this.position = {x: 0, y: 0};
            this.setTranslate(0, 0)
        }

        if(typeof this.options.callback === 'function'){
            this.options.callback(this.position);
        }
    }
    drag(event: PointerEvent){
        if (!this.dragging) {
            return;
        }
        this.position.x = event.clientX - this.startPosition.x;
        this.position.y = event.clientY - this.startPosition.y;
        this.domElement.classList.add('isDragging');
        if(this.respectBoundaries){
            this.maintainBoundaries(this.position);
        }
        this.setTranslate(this.position.x, this.position.y);
    }
    maintainBoundaries(position: IPosition ) {
        position.x = Math.round(Math.max(this.boundary.minX, position.x));
        position.x = Math.round(Math.min(this.boundary.maxX, position.x));
        position.y = Math.round(Math.max(this.boundary.minY, position.y));
        position.y = Math.round(Math.min(this.boundary.maxY, position.y));
    }
    setTranslate(xPos:any, yPos:any) {
        this.domElement.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
}
