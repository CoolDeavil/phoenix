import requestHTTP from "../Classes/requestHTTP";
import ScrollBox from "../Classes/scrollBox";

const req = new requestHTTP();

const scroll = new ScrollBox({
    anchor: 'scroll',
    listMax: 5,
    cssActive: 'active',
    listCSS: 'countryList',
});


export default function scrollIt(){
    console.log('ScrollBox Trials.');

    // const req = new requestHTTP();
    // req.request({
    //     method: 'get',
    //     targetURL: 'http://192.168.8.18/api/cors',
    //     payload: ''
    // }).then((cors:any)=>{
    //     console.log('CORS: ' , cors );
    // });
    //
    req.request({
        method: 'get',
        targetURL: 'http://192.168.8.18/countries',
        payload: 'name=uni'
    }).then((response:any)=>{
        build(response);
    });

    document.querySelector('#load').addEventListener('click',(e:Event)=>{
        req.request({
            method: 'get',
            targetURL: 'http://192.168.8.18/countries',
            payload: 'name=uni'
        }).then((response:any)=>{
            build(response);
        });
    }, false);
    document.querySelector('#next').addEventListener('click',(e:Event)=>{
        scroll.next();
    }, false);
    document.querySelector('#previous').addEventListener('click',(e:Event)=>{
        scroll.previous();
    }, false);
    document.querySelector('#clear').addEventListener('click',(e:Event)=>{
        scroll.clear();
    }, false);
}
function build(data:any){
    data = JSON.parse(data);

    console.log('INITIAL DATA ' , data);

    let html = '';
    data.forEach((item:any,i:number)=>{
        item.uiLabel = item.name;
        html += renderCustomTemplate(item,i);
    });
    const list = document.createElement('ul');

    list.innerHTML = html;
    scroll.load(list);

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
    scrollIt()
} else {
    document.addEventListener('DOMContentLoaded', scrollIt);
}