import EasyList from "./Classes/easyList";

function midnight(){
    console.log('midnight');


    // let request = new XMLHttpRequest();
    // request.open('GET', 'user_avatar.json', true);
    // request.onload = function() {
    //     if (this.status >= 200 && this.status < 400) {
    //         // Success!
    //         let data = JSON.parse(this.response);
    //
    //
    //         console.log('users ', data)
    //     } else {
    //         // We reached our target server, but it returned an error
    //
    //     }
    // };
    // request.onerror = function() {
    //     console.log('There was a connection error of some sort');
    // };
    // request.send();

    const easyList = new EasyList({
        anchor: 'autocomplete',
        // endpoint: simpleArray,
        // endpoint:{
        //     targetJSON: 'worldCountries.json',
        //     needle: 'name'
        // },
        endpoint:{
            targetURL: `http://192.168.8.18/countries`,
            needle: 'name'
        },
        listMax: 10,
        highlight: true,
        render: renderCustomTemplate,
        cssActive: 'active',
        listCSS: 'countryList',
        listLI: 'countryItem',
    });

}


function renderCustomTemplate(item:any, i:any) {
    return `<li data-index="${i}">
                <div class="countryItem">
                        <div class="flag">
                            <img src="${item.flag}" alt="">
                        </div>
                        <div class="label">
                            <div class="name">${item.uiLabel}</div>
                            <div class="offName">${item.name_official}</div>
                        </div>
                    </div>
                </li>`
}



if (document.readyState === 'complete') {
    midnight()
} else {
    document.addEventListener('DOMContentLoaded', midnight);
}