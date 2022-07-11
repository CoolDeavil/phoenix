
import {getMaxChars} from './dataFunctions.js';
import {buildQuery} from './dataFunctions.js';
import {sanitize} from './dataFunctions.js';

const UserInput = `Polynesia`;

function main(){


    const maxChars = getMaxChars()
    const searchTerm = sanitize(UserInput)
    const requestQuery = buildQuery(encodeURI(searchTerm) , maxChars);

    fetch(`${requestQuery}`)
        .then((response) => {
            if (response.status !== 200) {
                console.log('Err: ' +
                    response.status);
                return;
            }
            response.json().then((data) => {
                renderResultsList(buildDataResult(data));
            });
        })
        .catch((err) => {
            console.log('Fetch Error :-S', err);
        });

    console.log("All Done;")
}

// #############  Utilities ####################

const buildDataResult  = (localData:any)=>{
    const local = localData['query'].pages;
    const keys = Object.keys(local);

    let title:any = '';
    let thumbnail:any = '';
    let listResults:any = [];

    keys.forEach(($key) => {
        title = local[$key].title;
        if(local[$key].thumbnail){
            thumbnail = local[$key].thumbnail.source;
        }
        listResults.push({
            title: title,
            thumbnail: thumbnail
        })
    });
    return listResults;
}
const renderResultsList = (items:any)=>{
    let html = '';
    items.forEach((item:any) => {
        html += template(item);
    })
    let list = document.createElement('UL');
    list.classList.add('resultListTemplate');
    list.innerHTML = sanitize(html);
    document.querySelector('#canvas').innerHTML='';
    document.querySelector('#canvas').appendChild(list);
}
const template = (item:any)=>{
    return  `<li>
                <div class="wrap">
                <span>
                    <img src="${item.thumbnail}" alt="" aria-label="thumbnail">
                </span>
                &emsp;
                <span class="itemTitle">
                    ${item.title}
                </span>
                </div>
            </li>`;
}

// #############   Document Listener ####################
if (document.readyState === 'complete') {
    main()
} else {
    document.addEventListener('DOMContentLoaded', main);
}
