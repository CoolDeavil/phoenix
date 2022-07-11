declare global {
    interface Window {
        google: any;
    }
}
export default class LazyLoader {
    private static instance: LazyLoader;
    private static scriptIsLoaded: boolean;
    constructor() { }
    public static getInstance(): LazyLoader {
        if (!LazyLoader.instance) {
            LazyLoader.instance = new LazyLoader();
            LazyLoader.initScript();
        }
        return LazyLoader.instance;
    }
    private static initScript() {
        LazyLoader.loadScript().then(
            api => {
                LazyLoader.scriptIsLoaded = true;
                console.log('Google API Loaded', api);
            }
        );
    }
    private static loadScript() {
        const existingScript = document.getElementById('googleMaps');
        return new Promise((resolve, reject) => {
            if (!existingScript) {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.defer = true;
                script.id = 'googleMaps';
                script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCP-sWULnC7ErSIX0SPuB9ORiMf9aNC6mc&libraries=places`;
                document.body.appendChild(script);
                script.onload = () => {
                    resolve(window['google']);
                };
            }
        });
    }
    public static load() {
        return new Promise<any>((resolve, reject) => {
            function loadTimeOut() {
                setTimeout(() => {
                    checkIfLoaded();
                }, 10);
            }
            function checkIfLoaded() {
                if (LazyLoader.scriptIsLoaded) {
                    resolve(window['google']);
                } else {
                    loadTimeOut();
                }
            }
            checkIfLoaded();
        });
    }
}
