import LazyLoader from "./lazyLoader";
import {ILocation} from "../Interfaces/iLocation";

const DEFAULT_ZOOM = 6;
const RESPONSE_TYPE:any = 'json';
// const RESPONSE_TYPE:any = 'xml';
const defaultIcon = `http://maps.google.com/mapfiles/kml/pushpin/blue-pushpin.png`;
const home_location: ILocation = {
    lat: 37.128171,
    lng: -7.647184,
};


export default class Maps {
    public mapElement: HTMLElement;
    public markers: Array<any>;
    private map: any;
    public bounds: any;
    private directionsService: any;
    private directionsRenderer: any;

    constructor(baseEl: string ) {
        this.markers = []
        LazyLoader.getInstance();
        this.mapElement = document.querySelector(`#${baseEl}`);
        this.initMapComponent();
    }
    initMapComponent(){
        LazyLoader.load().then(
            api=>{
                this.directionsService = new window['google'].maps.DirectionsService();
                this.directionsRenderer = new window['google'].maps.DirectionsRenderer();
                this.map = new window['google'].maps.Map(  this.mapElement , {
                    center: new window['google'].maps.LatLng(0, 0),
                    zoom: Math.ceil(Math.log2(800)) - 8,
                });
                this.directionsRenderer.setMap(this.map);
                this.bounds =  new window['google'].maps.LatLngBounds();
            }
        );
    }
    addMarker(lat,lng, key, label ){
        let myLatLng = {lat: parseInt(lat), lng: parseInt(lng)};
        this.markers[key] = new window['google'].maps.Marker({
            position: myLatLng,
            map: this.map,
            title: label
        });
        this.map.setZoom(6)
        this.map.setCenter(myLatLng)
    }

    mapAddMarker(position: ILocation, label: string, event: any = null, icon:string=defaultIcon, callBack:any, info: string ){
        if(this.markers[label]){
            console.log("Marker already SET!");
            return;
        }
        const that = this;
        this.markers[label] = (new window['google'].maps.Marker({
            position: position,
            map: this.map,
            title: label,
            draggable: !!event,
            icon: icon,
            animation: window['google'].maps.Animation.DROP,
        }));
        if(event){
            // console.log("Add DragEnd");
            this.markers[label].addListener('dragend', function(evt) {
                // noinspection TypeScriptValidateJSTypes
                // console.log( that.mapGetDistance(
                //     home_location,
                //     {lat:evt.latLng.lat(),lng:evt.latLng.lng()}
                //     ));
                // noinspection TypeScriptValidateJSTypes
                document.querySelector('#count').innerHTML = that.mapGetDistance(
                    home_location,
                    {lat:evt.latLng.lat(),lng:evt.latLng.lng()}
                );
                console.log({lat:evt.latLng.lat(),lng:evt.latLng.lng()});
                if(callBack){
                    return callBack({lat:evt.latLng.lat(),lng:evt.latLng.lng()})
                }
            });
        }
        let contentString = '<div id="content">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h3 id="thirdHeading" class="thirdHeading">microMVC.com</h3>'+
            '<div id="bodyContent">'+
            '<p>Custom InfoWindow for Marker additional info.</p>'+
            '</div>'+
            '</div>';

        let infoWindow = new window['google'].maps.InfoWindow({
            content: info?info:contentString
        });
        this.markers[label].addListener('click', function() {
            infoWindow.open(that.map, that.markers[label]);
        });
        this.markers[label].addListener('click', function() {
            that.map.setZoom(8);
            that.map.setCenter(that.markers[label].getPosition());
        });
        if(Object.keys(this.markers).length <= 1 ) {
            this.mapSetCenter(position);
        }else{
            this.extendBounds();
        }
    }

    removeMarker(label: string) {
        this.markers[label].setMap(null);
        delete this.markers[label];

        if(Object.keys(this.markers).length>1){
            console.log("BOUNDS");
            this.extendBounds();
        }else if (Object.keys(this.markers).length === 1){
            this.setCenter({
                lat: this.markers[Object.keys(this.markers)[0]].position.lat(),
                lng: this.markers[Object.keys(this.markers)[0]].position.lng()
            });
            this.mapSetZoom(6)
        } else {
            console.log("RESETTING");
            // this.mapReset()
        }
    }
    setCenter(location: ILocation){
        this.map.setCenter(location);
        this.map.setZoom(DEFAULT_ZOOM)
    }
    mapSetZoom(level: number){
        this.map.setZoom(level)
    }
    mapSetCenter(location: ILocation){
        this.map.setCenter(location);
        this.map.setZoom(DEFAULT_ZOOM)
    }
    geoCodeAddress(address: any) : any {
        let request = new XMLHttpRequest();
        request.open('GET', `https://maps.googleapis.com/maps/api/geocode/${RESPONSE_TYPE}?address=${address}&key=AIzaSyCP-sWULnC7ErSIX0SPuB9ORiMf9aNC6mc`, false);  // `false` makes the request synchronous
        request.send(null);
        if (request.status === 200) {
            if(RESPONSE_TYPE === 'json'){
                let geoLocated = Maps.getLocationFromJSON(request.responseText );
                return {
                    lat:geoLocated['lat'],
                    lng:geoLocated['lng'],
                    address:geoLocated['address']

                };
            }else if(RESPONSE_TYPE === 'xml'){
                console.log("RESOLVE XML: ",request.responseText );
                return {lat:0,lng:0};
            }
        }else{
            console.log("Error calling API");
        }
        // return {lat:0,lng:0};
        // return this.promiseAResult(address).then(result =>{
        //
        //     if(RESPONSE_TYPE === 'json'){
        //         console.log('[DELIVERED] Process JSON');
        //         this.getLocationGeometry(result).then(
        //            r=>{ console.log("Geometry ", r);}
        //         );
        //
        //     }else if(RESPONSE_TYPE === 'xml') {
        //         console.log('[DELIVERED] Process XML')
        //     }
        //
        //     // console.log('getLocationGeometry', result);
        //     // const getLocationGeometry = result;
        //     // resolve()
        //     // console.log(getLocationGeometry);
        // }).then(r=>{
        //    console.log('[DELIVERED] then',r);
        // });
        //     // resp=>{
        //     //     if(RESPONSE_TYPE === 'json'){
        //     //         // console.log('[@@@] JSON_FILE ' , resp );
        //     //         this.geometry  = AppGMaps.getLocationFromJSON(resp);
        //     //         console.log('[@geometry@] JSON_FILE ' , this.geometry );
        //     //         this.geometry  = AppGMaps.getLocationFromJSON(resp);
        //     //         // console.log(AppGMaps.getLocationFromJSON(resp));
        //     //         // return this.geometry;
        //     //     }else if(RESPONSE_TYPE === 'xml') {
        //     //         // console.log('[%%%%] XML_FILE ' , resp );
        //     //         this.geometry  = AppGMaps.getLocationFromXML(resp);
        //     //         // console.log("LOC XML_FILE: ", AppGMaps.getLocationFromXML(resp) );
        //     //         // return  true ;
        //     //     }
        //     //     return this.geometry;
        //     // }
        // );
        // let result:any = 'WTF';
        // if(address === '' || address === undefined ){ return }
        // if(RESPONSE_TYPE === 'json'){
        //     // let parsedJson: any = JSON.parse(resp.toString());
        //     // this.getLocationFromJSON();
        //     AppGMaps.getLocationFromJSON(address).then(
        //         resp=>{
        //             console.log('JSON_FILE ' , resp );
        //             // return '[IF] PROCESSED=>' + RESPONSE_TYPE
        //         }
        //     );
        //     return '[EOP] PROCESSED=>' + RESPONSE_TYPE
        // }else if(RESPONSE_TYPE === 'xml') {
        //     return 'PROCESSED=>' + RESPONSE_TYPE
        // }
        //
        // switch(RESPONSE_TYPE){
        //     // @ts-ignore
        //     case 'json':
        //         this.mapGetGeoCode(address).then( resp =>{
        //             let parsedJson: any = JSON.parse(resp.toString());
        //             console.log('STATUS ', parsedJson.status);
        //             if(parsedJson.status  === 'ZERO_RESULTS'){
        //                 console.log('[JSON] Bad Address .... ZERO_RESULTS');
        //                 // return false;
        //                 return false;
        //             }else{
        //                 // let parsedJson: any = JSON.parse(resp.toString());
        //                 return AppGMaps.getLocationFromJSON(parsedJson);
        //                 // console.log('[ JSON $$$ CLASS @@@ ] mapGeoCode ', result);
        //                 // return result;   //console.log('[ JSON $$$ CLASS @@@ ] mapGeoCode ', json);
        //             }
        //         });
        //         return result;
        //     // @ts-ignore
        //     case 'xml':
        //         console.log("XML RESPONSE");
        //         this.mapGetGeoCode(address).then( resp =>{
        //             let parser = new DOMParser();
        //             let xmlDoc = parser.parseFromString(resp.toString(),"text/xml");
        //             const xml = AppGMaps.getLocationFromXML(xmlDoc);
        //             if(xml === 'ZERO_RESULTS'){
        //                 console.log('[XML] Bad Address .... ');
        //                 return false;
        //             }else{
        //                 console.log('[ XML $$$ CLASS $$$ ] mapGeoCode ', xml);
        //                 return xml;
        //             }
        //         });
        //         return true;
        // }
        // console.log("Reached until HERE");
    };
    geoCodeLocation(location: ILocation) : any {
        let request = new XMLHttpRequest();
        request.open('GET', `https://maps.googleapis.com/maps/api/geocode/${RESPONSE_TYPE}?latlng=${location.lat},${location.lng}&key=AIzaSyCP-sWULnC7ErSIX0SPuB9ORiMf9aNC6mc`, false);  // `false` makes the request synchronous
        request.send(null);
        if (request.status === 200) {
            if(RESPONSE_TYPE === 'json'){
                let geoLocated = Maps.getLocationFromJSON(request.responseText );
                return {
                    lat:geoLocated['lat'],
                    lng:geoLocated['lng'],
                    address:geoLocated['address']

                };
            }else if(RESPONSE_TYPE === 'xml'){
                console.log("RESOLVE XML: ",request.responseText );
                return {lat:0,lng:0};
            }
        }else{
            console.log("Error calling API");
        }
        // return {lat:0,lng:0};
        // return this.promiseAResult(address).then(result =>{
        //
        //     if(RESPONSE_TYPE === 'json'){
        //         console.log('[DELIVERED] Process JSON');
        //         this.getLocationGeometry(result).then(
        //            r=>{ console.log("Geometry ", r);}
        //         );
        //
        //     }else if(RESPONSE_TYPE === 'xml') {
        //         console.log('[DELIVERED] Process XML')
        //     }
        //
        //     // console.log('getLocationGeometry', result);
        //     // const getLocationGeometry = result;
        //     // resolve()
        //     // console.log(getLocationGeometry);
        // }).then(r=>{
        //    console.log('[DELIVERED] then',r);
        // });
        //     // resp=>{
        //     //     if(RESPONSE_TYPE === 'json'){
        //     //         // console.log('[@@@] JSON_FILE ' , resp );
        //     //         this.geometry  = AppGMaps.getLocationFromJSON(resp);
        //     //         console.log('[@geometry@] JSON_FILE ' , this.geometry );
        //     //         this.geometry  = AppGMaps.getLocationFromJSON(resp);
        //     //         // console.log(AppGMaps.getLocationFromJSON(resp));
        //     //         // return this.geometry;
        //     //     }else if(RESPONSE_TYPE === 'xml') {
        //     //         // console.log('[%%%%] XML_FILE ' , resp );
        //     //         this.geometry  = AppGMaps.getLocationFromXML(resp);
        //     //         // console.log("LOC XML_FILE: ", AppGMaps.getLocationFromXML(resp) );
        //     //         // return  true ;
        //     //     }
        //     //     return this.geometry;
        //     // }
        // );
        // let result:any = 'WTF';
        // if(address === '' || address === undefined ){ return }
        // if(RESPONSE_TYPE === 'json'){
        //     // let parsedJson: any = JSON.parse(resp.toString());
        //     // this.getLocationFromJSON();
        //     AppGMaps.getLocationFromJSON(address).then(
        //         resp=>{
        //             console.log('JSON_FILE ' , resp );
        //             // return '[IF] PROCESSED=>' + RESPONSE_TYPE
        //         }
        //     );
        //     return '[EOP] PROCESSED=>' + RESPONSE_TYPE
        // }else if(RESPONSE_TYPE === 'xml') {
        //     return 'PROCESSED=>' + RESPONSE_TYPE
        // }
        //
        // switch(RESPONSE_TYPE){
        //     // @ts-ignore
        //     case 'json':
        //         this.mapGetGeoCode(address).then( resp =>{
        //             let parsedJson: any = JSON.parse(resp.toString());
        //             console.log('STATUS ', parsedJson.status);
        //             if(parsedJson.status  === 'ZERO_RESULTS'){
        //                 console.log('[JSON] Bad Address .... ZERO_RESULTS');
        //                 // return false;
        //                 return false;
        //             }else{
        //                 // let parsedJson: any = JSON.parse(resp.toString());
        //                 return AppGMaps.getLocationFromJSON(parsedJson);
        //                 // console.log('[ JSON $$$ CLASS @@@ ] mapGeoCode ', result);
        //                 // return result;   //console.log('[ JSON $$$ CLASS @@@ ] mapGeoCode ', json);
        //             }
        //         });
        //         return result;
        //     // @ts-ignore
        //     case 'xml':
        //         console.log("XML RESPONSE");
        //         this.mapGetGeoCode(address).then( resp =>{
        //             let parser = new DOMParser();
        //             let xmlDoc = parser.parseFromString(resp.toString(),"text/xml");
        //             const xml = AppGMaps.getLocationFromXML(xmlDoc);
        //             if(xml === 'ZERO_RESULTS'){
        //                 console.log('[XML] Bad Address .... ');
        //                 return false;
        //             }else{
        //                 console.log('[ XML $$$ CLASS $$$ ] mapGeoCode ', xml);
        //                 return xml;
        //             }
        //         });
        //         return true;
        // }
        // console.log("Reached until HERE");
    };
    drawRoute(){
        this.directionsService.route({
            origin: { query: 'lisboa, av da liberdade' },
            destination: { query: 'faro, av da republica 110' },
            travelMode: "DRIVING"
        }, (response, status)=>{
            if (status === "OK") {
                this.directionsRenderer.setDirections(response);
            } else {
                window.alert("Directions request failed due to " + status);
            }
        })
    }
    showAllMarkers(){
        if( Object.keys(this.markers).length > 0 && Object.keys(this.markers).length > 1){
            this.extendBounds();
        }else if(Object.keys(this.markers).length === 1){
            console.log("Center map on marker[0]")
        }
    }
    private extendBounds(){
        this.bounds =  new window['google'].maps.LatLngBounds();
        const KEYS = Object.keys(this.markers);
        for (let i = 0; i < KEYS.length; i++) {
            this.bounds.extend(this.markers[KEYS[i]].getPosition());
        }
        this.map.fitBounds(this.bounds);
    }
    private static getLocationFromXML(XMLDoc: any){
        if(XMLDoc.getElementsByTagName("status")[0].innerHTML === 'ZERO_RESULTS'){
            return 'ZERO_RESULTS';
        }
        return {
            lat:XMLDoc.getElementsByTagName("geometry")[0]
                .getElementsByTagName("location")[0]
                .getElementsByTagName("lat")[0].innerHTML,
            lng:XMLDoc.getElementsByTagName("geometry")[0]
                .getElementsByTagName("location")[0]
                .getElementsByTagName("lng")[0].innerHTML
        }
    }
    private static getLocationFromJSON(JSONDoc: any){
        JSONDoc = JSON.parse(JSONDoc);
        if(JSONDoc.status === 'ZERO_RESULTS'){
            return 'ZERO_RESULTS';
        }
        return {
            lat:JSONDoc.results[0].geometry.location.lat ,
            lng:JSONDoc.results[0].geometry.location.lng,
            address: JSONDoc.results[0].formatted_address
        }
    }

}
