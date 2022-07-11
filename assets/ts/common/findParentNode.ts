export default function findParentNode(el:any, node:any) {
    while (el.parentNode) {
        el = el.parentNode;
        if (el.nodeName === node){
            return el;
        }
    }
    return null;
}
