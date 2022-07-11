export default function getElComputedStyle(elem:any, prop:any) {
    let cs = window.getComputedStyle(elem, null);
    if (prop) {
        return cs.getPropertyValue(prop);
    }
}