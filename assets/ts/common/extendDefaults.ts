export default function extendDefaults(source:any, properties:any) {
    let property;
    for (property in properties) {
        if (properties.hasOwnProperty(property)) {
            source[property] = properties[property];
        }
    }
    return source;
}
