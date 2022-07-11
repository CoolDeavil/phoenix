import FRules from "../Classes/FRules";
import requestHTTP from "../Classes/requestHTTP";


export default function main(){

    const req = new requestHTTP();
    req.request({
        method: 'get',
        targetURL: 'http://192.168.8.18/api/cors',
        payload: ''
    }).then((cors:any)=>{
        console.log('CORS: ' , cors );
    });


    let fr = new FRules({
        form: 'lucille',
        fields: [
            {
                name: 'userName',
                validation: ['required','range(8,24)'],
                errorMessages: [],
                asyncValidation: [
                    ['http://localhost:5000/','name'],
                ]
            },
            {
                name: 'email',
                validation: ['required','validEmail'],
                errorMessages: [],
                asyncValidation: [[`http://localhost:5000/`,'email']]
            },
            {
                name: 'password',
                validation: ['required'],
                errorMessages: [],
                asyncValidation: []
            },
            {
                name: 'confirmPassword',
                validation: ['required'],
                errorMessages: [],
                asyncValidation: []
            },
            {
                name: 'age',
                validation: ['required'],
                errorMessages: [],
                asyncValidation: []
            },
            {
                name: 'mobile',
                validation: ['required'],
                errorMessages: [],
                asyncValidation: []
            },
            {
                name: 'lang',
                validation: ['required'],
                errorMessages: [],
                asyncValidation: []
            },
            {
                name: 'upload',
                validation: ['required'],
                errorMessages: [],
                asyncValidation: []
            },
            {
                name: 'dateStart',
                validation: ['required'],
                errorMessages: [],
                asyncValidation: []
            },
            {
                name: 'dateEnd',
                validation: ['required'],
                errorMessages: [],
                asyncValidation: []
            },
            {
                name: 'radios',
                validation: ['required'],
                errorMessages: [],
                asyncValidation: []
            },
            {
                name: 'multiple',
                validation: ['required'],
                errorMessages: [],
                asyncValidation: []
            },
            {
                name: 'terms',
                validation: ['required'],
                errorMessages: [],
                asyncValidation: []
            },
        ],
        defaults: {
            // render: true,
            // cssBase: 'errorLabel',
            // cssAlert: 'cAlert',
            // cssError: 'cError',
            // cssAsync: 'async',
        }
    })

    const kp = getKeyPair('lucille');
    const serialized = serialize(kp);
    console.log(kp);
    console.log(serialized);

    document.querySelector('#unicode').innerHTML = getRandomIcon();
}
function getKeyPair(form:string){
    const  formElements  = Array.prototype.slice.call((document.querySelector(`#${form}`) as HTMLFormElement).elements, 0);
    console.log(formElements);
    let keyPairValues:any = [];
    formElements.forEach((input:any)=>{
        let field:any = {};
        switch (input.type) {
            case 'text':
            case 'number':
            case 'email':
            case 'date':
            case 'password':
            case 'hidden':
                field = {
                    name: input.name,
                    value: input.value,
                    type: input.type
                };
                break;
            case 'select-one':
                field = {
                    name: input.name,
                    value: input.selectedIndex,
                    type: input.type
                };
                break;
            case 'checkbox':
                field = {
                    name: input.name,
                    value: input.checked ? input.value : '',
                    type: input.type
                };
                break;
            case 'select-multiple':
                field = {
                    name: input.name,
                    value: 'this.constructor.getMultipleSelectValues(input)',
                    type: input.type
                };
                break;
            case 'radio':
                field = {
                    name: input.name,
                    value: 'this.constructor.getRadioValue(input.name, this.formElements )',
                    type: input.type
                };
                break;
            case 'textarea':
                field = {
                    name: input.name,
                    value: input.value,
                    type: input.type
                };
                break;
            case 'file':
                console.log('FILE:  ',field)
                field = {
                    name: input.name,
                    value: input.value,
                    type: input.type
                };
                break;
            case 'submit':
            case 'button':
                field = {
                    name: "BUTTON",
                    value: 'EXCLUDE THIS INPUT'
                };
                break;
            default:
                console.log('Something is Wrong ..... ');
                break;
        }
        keyPairValues.push(field);
    })
    return keyPairValues;
}
function serialize(keyPairValues:any) {
    let uri_ = "";
    keyPairValues.forEach((key:any) => {
        if (typeof key.value === 'object') {
            if(Object.keys(key.value).length >0){
                for (let fo = 0; fo < Object.keys(key.value).length; fo++) {
                    uri_ += key.name + '=' + key.value[fo] + '&';
                }
            }else{
                uri_ += key.name + '=&';
            }
        } else {
            uri_ += key.name + '=' + key.value + '&';
        }
    });
    let serialize = encodeURI(uri_.slice(0, -1));
    if(serialize.slice(-2) === '&=') {
        serialize = serialize.substring(0,serialize.length-2);
        console.log('sanitized &= ', serialize);
    }
    return serialize;
}



const random_iconsU = ["&#xf26e;","&#xf042;","&#xf170;","&#xf037;","&#xf039;","&#xf036;","&#xf038;","&#xf270;","&#xf0f9;","&#xf13d;","&#xf17b;","&#xf209;","&#xf103;","&#xf100;","&#xf101;","&#xf102;","&#xf107;","&#xf104;","&#xf105;","&#xf106;","&#xf179;","&#xf187;","&#xf1fe;","&#xf0ab;","&#xf0a8;","&#xf01a;","&#xf190;","&#xf18e;","&#xf01b;","&#xf0a9;","&#xf0aa;","&#xf063;","&#xf060;","&#xf061;","&#xf062;","&#xf047;","&#xf0b2;","&#xf07e;","&#xf07d;","&#xf069;","&#xf1fa;","&#xf1b9;","&#xf04a;","&#xf24e;","&#xf05e;","&#xf19c;","&#xf080;","&#xf080;","&#xf02a;","&#xf0c9;","&#xf244;","&#xf243;","&#xf242;","&#xf241;","&#xf240;","&#xf244;","&#xf240;","&#xf242;","&#xf243;","&#xf241;","&#xf236;","&#xf0fc;","&#xf1b4;","&#xf1b5;","&#xf0f3;","&#xf0a2;","&#xf1f6;","&#xf1f7;","&#xf206;","&#xf1e5;","&#xf1fd;","&#xf171;","&#xf172;","&#xf15a;","&#xf27e;","&#xf032;","&#xf0e7;","&#xf1e2;","&#xf02d;","&#xf02e;","&#xf097;","&#xf0b1;","&#xf15a;","&#xf188;","&#xf1ad;","&#xf0f7;","&#xf0a1;","&#xf140;","&#xf207;","&#xf20d;","&#xf1ba;","&#xf1ec;","&#xf073;","&#xf274;","&#xf272;","&#xf133;","&#xf271;","&#xf273;","&#xf030;","&#xf083;","&#xf1b9;","&#xf0d7;","&#xf0d9;","&#xf0da;","&#xf150;","&#xf191;","&#xf152;","&#xf151;","&#xf0d8;","&#xf218;","&#xf217;","&#xf20a;","&#xf1f3;","&#xf24c;","&#xf1f2;","&#xf24b;","&#xf1f1;","&#xf1f4;","&#xf1f5;","&#xf1f0;","&#xf0a3;","&#xf0c1;","&#xf127;","&#xf00c;","&#xf058;","&#xf05d;","&#xf14a;","&#xf046;","&#xf13a;","&#xf137;","&#xf138;","&#xf139;","&#xf078;","&#xf053;","&#xf054;","&#xf077;","&#xf1ae;","&#xf268;","&#xf111;","&#xf10c;","&#xf1ce;","&#xf1db;","&#xf0ea;","&#xf017;","&#xf24d;","&#xf00d;","&#xf0c2;","&#xf0ed;","&#xf0ee;","&#xf157;","&#xf121;","&#xf126;","&#xf1cb;","&#xf0f4;","&#xf013;","&#xf085;","&#xf0db;","&#xf075;","&#xf0e5;","&#xf27a;","&#xf27b;","&#xf086;","&#xf0e6;","&#xf14e;","&#xf066;","&#xf20e;","&#xf26d;","&#xf0c5;","&#xf1f9;","&#xf25e;","&#xf09d;","&#xf125;","&#xf05b;","&#xf13c;","&#xf1b2;","&#xf1b3;","&#xf0c4;","&#xf0f5;","&#xf0e4;","&#xf210;","&#xf1c0;","&#xf03b;","&#xf1a5;","&#xf108;","&#xf1bd;","&#xf219;","&#xf1a6;","&#xf155;","&#xf192;","&#xf019;","&#xf17d;","&#xf16b;","&#xf1a9;","&#xf044;","&#xf052;","&#xf141;","&#xf142;","&#xf1d1;","&#xf0e0;","&#xf003;","&#xf199;","&#xf12d;","&#xf153;","&#xf153;","&#xf0ec;","&#xf12a;","&#xf06a;","&#xf071;","&#xf065;","&#xf23e;","&#xf08e;","&#xf14c;","&#xf06e;","&#xf070;","&#xf1fb;","&#xf09a;","&#xf09a;","&#xf230;","&#xf082;","&#xf049;","&#xf050;","&#xf1ac;","&#xf09e;","&#xf182;","&#xf0fb;","&#xf15b;","&#xf1c6;","&#xf1c7;","&#xf1c9;","&#xf1c3;","&#xf1c5;","&#xf1c8;","&#xf016;","&#xf1c1;","&#xf1c5;","&#xf1c5;","&#xf1c4;","&#xf1c7;","&#xf15c;","&#xf0f6;","&#xf1c8;","&#xf1c2;","&#xf1c6;","&#xf0c5;","&#xf008;","&#xf0b0;","&#xf06d;","&#xf134;","&#xf269;","&#xf024;","&#xf11e;","&#xf11d;","&#xf0e7;","&#xf0c3;","&#xf16e;","&#xf0c7;","&#xf07b;","&#xf114;","&#xf07c;","&#xf115;","&#xf031;","&#xf280;","&#xf211;","&#xf04e;","&#xf180;","&#xf119;","&#xf1e3;","&#xf11b;","&#xf0e3;","&#xf154;","&#xf1d1;","&#xf013;","&#xf085;","&#xf22d;","&#xf265;","&#xf260;","&#xf261;","&#xf06b;","&#xf1d3;","&#xf1d2;","&#xf09b;","&#xf113;","&#xf092;","&#xf184;","&#xf000;","&#xf0ac;","&#xf1a0;","&#xf0d5;","&#xf0d4;","&#xf1ee;","&#xf19d;","&#xf184;","&#xf0c0;","&#xf0fd;","&#xf1d4;","&#xf255;","&#xf258;","&#xf0a7;","&#xf0a5;","&#xf0a4;","&#xf0a6;","&#xf256;","&#xf25b;","&#xf25a;","&#xf255;","&#xf257;","&#xf259;","&#xf256;","&#xf0a0;","&#xf1dc;","&#xf025;","&#xf004;","&#xf08a;","&#xf21e;","&#xf1da;","&#xf015;","&#xf0f8;","&#xf236;","&#xf254;","&#xf251;","&#xf252;","&#xf253;","&#xf253;","&#xf252;","&#xf250;","&#xf251;","&#xf27c;","&#xf13b;","&#xf246;","&#xf20b;","&#xf03e;","&#xf01c;","&#xf03c;","&#xf275;","&#xf129;","&#xf05a;","&#xf156;","&#xf16d;","&#xf19c;","&#xf26b;","&#xf224;","&#xf208;","&#xf033;","&#xf1aa;","&#xf157;","&#xf1cc;","&#xf084;","&#xf11c;","&#xf159;","&#xf1ab;","&#xf109;","&#xf202;","&#xf203;","&#xf06c;","&#xf212;","&#xf0e3;","&#xf094;","&#xf149;","&#xf148;","&#xf1cd;","&#xf1cd;","&#xf1cd;","&#xf1cd;","&#xf0eb;","&#xf201;","&#xf0c1;","&#xf0e1;","&#xf08c;","&#xf17c;","&#xf03a;","&#xf022;","&#xf0cb;","&#xf0ca;","&#xf124;","&#xf023;","&#xf175;","&#xf177;","&#xf178;","&#xf176;","&#xf0d0;","&#xf076;","&#xf064;","&#xf112;","&#xf122;","&#xf183;","&#xf279;","&#xf041;","&#xf278;","&#xf276;","&#xf277;","&#xf222;","&#xf227;","&#xf229;","&#xf22b;","&#xf22a;","&#xf136;","&#xf20c;","&#xf23a;","&#xf0fa;","&#xf11a;","&#xf223;","&#xf130;","&#xf131;","&#xf068;","&#xf056;","&#xf146;","&#xf147;","&#xf10b;","&#xf10b;","&#xf0d6;","&#xf186;","&#xf19d;","&#xf21c;","&#xf245;","&#xf001;","&#xf0c9;","&#xf22c;","&#xf1ea;","&#xf247;","&#xf248;","&#xf263;","&#xf264;","&#xf23d;","&#xf19b;","&#xf26a;","&#xf23c;","&#xf03b;","&#xf18c;","&#xf1fc;","&#xf1d8;","&#xf1d9;","&#xf0c6;","&#xf1dd;","&#xf0ea;","&#xf04c;","&#xf1b0;","&#xf1ed;","&#xf040;","&#xf14b;","&#xf044;","&#xf095;","&#xf098;","&#xf03e;","&#xf03e;","&#xf200;","&#xf1a7;","&#xf1a8;","&#xf0d2;","&#xf231;","&#xf0d3;","&#xf072;","&#xf04b;","&#xf144;","&#xf01d;","&#xf1e6;","&#xf067;","&#xf055;","&#xf0fe;","&#xf196;","&#xf011;","&#xf02f;","&#xf12e;","&#xf1d6;","&#xf029;","&#xf128;","&#xf059;","&#xf10d;","&#xf10e;","&#xf1d0;","&#xf074;","&#xf1d0;","&#xf1b8;","&#xf1a1;","&#xf1a2;","&#xf021;","&#xf25d;","&#xf00d;","&#xf18b;","&#xf0c9;","&#xf01e;","&#xf112;","&#xf122;","&#xf079;","&#xf157;","&#xf018;","&#xf135;","&#xf0e2;","&#xf01e;","&#xf158;","&#xf09e;","&#xf143;","&#xf158;","&#xf158;","&#xf156;","&#xf267;","&#xf0c7;","&#xf0c4;","&#xf002;","&#xf010;","&#xf00e;","&#xf213;","&#xf1d8;","&#xf1d9;","&#xf233;","&#xf064;","&#xf1e0;","&#xf1e1;","&#xf14d;","&#xf045;","&#xf20b;","&#xf20b;","&#xf132;","&#xf21a;","&#xf214;","&#xf07a;","&#xf090;","&#xf08b;","&#xf012;","&#xf215;","&#xf0e8;","&#xf216;","&#xf17e;","&#xf198;","&#xf1de;","&#xf1e7;","&#xf118;","&#xf1e3;","&#xf0dc;","&#xf15d;","&#xf15e;","&#xf160;","&#xf161;","&#xf0de;","&#xf0dd;","&#xf0dd;","&#xf162;","&#xf163;","&#xf0de;","&#xf1be;","&#xf197;","&#xf110;","&#xf1b1;","&#xf1bc;","&#xf0c8;","&#xf096;","&#xf18d;","&#xf16c;","&#xf005;","&#xf089;","&#xf123;","&#xf123;","&#xf123;","&#xf006;","&#xf1b6;","&#xf1b7;","&#xf048;","&#xf051;","&#xf0f1;","&#xf249;","&#xf24a;","&#xf04d;","&#xf21d;","&#xf0cc;","&#xf1a4;","&#xf1a3;","&#xf12c;","&#xf239;","&#xf0f2;","&#xf185;","&#xf12b;","&#xf1cd;","&#xf0ce;","&#xf10a;","&#xf0e4;","&#xf02b;","&#xf02c;","&#xf0ae;","&#xf1ba;","&#xf26c;","&#xf1d5;","&#xf120;","&#xf034;","&#xf035;","&#xf00a;","&#xf009;","&#xf00b;","&#xf08d;","&#xf165;","&#xf088;","&#xf087;","&#xf164;","&#xf145;","&#xf00d;","&#xf057;","&#xf05c;","&#xf043;","&#xf150;","&#xf191;","&#xf204;","&#xf205;","&#xf152;","&#xf151;","&#xf25c;","&#xf238;","&#xf224;","&#xf225;","&#xf1f8;","&#xf014;","&#xf1bb;","&#xf181;","&#xf262;","&#xf091;","&#xf0d1;","&#xf195;","&#xf1e4;","&#xf173;","&#xf174;","&#xf195;","&#xf26c;","&#xf1e8;","&#xf099;","&#xf081;","&#xf0e9;","&#xf0cd;","&#xf0e2;","&#xf19c;","&#xf127;","&#xf09c;","&#xf13e;","&#xf0dc;","&#xf093;","&#xf155;","&#xf007;","&#xf0f0;","&#xf234;","&#xf21b;","&#xf235;","&#xf0c0;","&#xf221;","&#xf226;","&#xf228;","&#xf237;","&#xf03d;","&#xf27d;","&#xf194;","&#xf1ca;","&#xf189;","&#xf027;","&#xf026;","&#xf028;","&#xf071;","&#xf1d7;","&#xf18a;","&#xf1d7;","&#xf232;","&#xf193;","&#xf1eb;","&#xf266;","&#xf17a;","&#xf159;","&#xf19a;","&#xf0ad;","&#xf168;","&#xf169;","&#xf23b;","&#xf1d4;","&#xf19e;","&#xf23b;","&#xf1d4;","&#xf1e9;","&#xf157;","&#xf167;","&#xf16a;","&#xf166;"]
function randomFaUnicode(){
    let min=0;
    let max=random_iconsU.length;
    let random =Math.floor(Math.random() * (+max - +min)) + +min;
    // return `<i class="fas ${random_icons[random]}"></i>`;
    return random_iconsU[random];
}
const random_icons = ["fas fa-flag","fas fa-caret-down","fas fa-flag","fas fa-rub","fas fa-camera-retro","fas fa-check-square","fas fa-won","fas fa-file-text-o","fas fa-hand-o-right","fas fa-play-circle","fas fa-github","fas fa-medkit","fas fa-caret-down","fas fa-flag","fas fa-rub","fas fa-ruble","fas fa-rouble","fas fa-pagelines","fas fa-stack-exchange","fas fa-arrow-circle-o-right","fas fa-arrow-circle-o-left","fas fa-caret-square-o-left","fas fa-toggle-left","fas fa-dot-circle-o","fas fa-wheelchair","fas fa-vimeo-square","fas fa-try","fas fa-turkish-lira","fas fa-plus-square-o","fas fa-adjust","fas fa-anchor","fas fa-archive","fas fa-arrows","fas fa-arrows-h","fas fa-arrows-v","fas fa-asterisk","fas fa-ban","fas fa-bar-chart-o","fas fa-barcode","fas fa-bars","fas fa-beer","fas fa-bell","fas fa-bell-o","fas fa-bolt","fas fa-book","fas fa-bookmark","fas fa-bookmark-o","fas fa-briefcase","fas fa-bug","fas fa-building-o","fas fa-bullhorn","fas fa-bullseye","fas fa-calendar","fas fa-calendar-o","fas fa-camera","fas fa-camera-retro","fas fa-caret-square-o-down","fas fa-caret-square-o-left","fas fa-caret-square-o-right","fas fa-caret-square-o-up","fas fa-certificate","fas fa-check","fas fa-check-circle","fas fa-check-circle-o","fas fa-check-square","fas fa-check-square-o","fas fa-circle","fas fa-circle-o","fas fa-clock-o","fas fa-cloud","fas fa-cloud-download","fas fa-cloud-upload","fas fa-code","fas fa-code-fork","fas fa-coffee","fas fa-cog","fas fa-cogs","fas fa-comment","fas fa-comment-o","fas fa-comments","fas fa-comments-o","fas fa-compass","fas fa-credit-card","fas fa-crop","fas fa-crosshairs","fas fa-cutlery","fas fa-dashboard","fas fa-desktop","fas fa-dot-circle-o","fas fa-download","fas fa-edit","fas fa-ellipsis-h","fas fa-ellipsis-v","fas fa-envelope","fas fa-envelope-o","fas fa-eraser","fas fa-exchange","fas fa-exclamation","fas fa-exclamation-circle","fas fa-exclamation-triangle","fas fa-external-link","fas fa-external-link-square","fas fa-eye","fas fa-eye-slash","fas fa-female","fas fa-fighter-jet","fas fa-film","fas fa-filter","fas fa-fire","fas fa-fire-extinguisher","fas fa-flag","fas fa-flag-checkered","fas fa-flag-o","fas fa-flash","fas fa-flask","fas fa-folder","fas fa-folder-o","fas fa-folder-open","fas fa-folder-open-o","fas fa-frown-o","fas fa-gamepad","fas fa-gavel","fas fa-gear","fas fa-gears","fas fa-gift","fas fa-glass","fas fa-globe","fas fa-group","fas fa-hdd-o","fas fa-headphones","fas fa-heart","fas fa-heart-o","fas fa-home","fas fa-inbox","fas fa-info","fas fa-info-circle","fas fa-key","fas fa-keyboard-o","fas fa-laptop","fas fa-leaf","fas fa-legal","fas fa-lemon-o","fas fa-level-down","fas fa-level-up","fas fa-lightbulb-o","fas fa-location-arrow","fas fa-lock","fas fa-magic","fas fa-magnet","fas fa-mail-forward","fas fa-mail-reply","fas fa-mail-reply-all","fas fa-male","fas fa-map-marker","fas fa-meh-o","fas fa-microphone","fas fa-microphone-slash","fas fa-minus","fas fa-minus-circle","fas fa-minus-square","fas fa-minus-square-o","fas fa-mobile","fas fa-mobile-phone","fas fa-money","fas fa-moon-o","fas fa-music","fas fa-pencil","fas fa-pencil-square","fas fa-pencil-square-o","fas fa-phone","fas fa-phone-square","fas fa-picture-o","fas fa-plane","fas fa-plus","fas fa-plus-circle","fas fa-plus-square","fas fa-plus-square-o","fas fa-power-off","fas fa-print","fas fa-puzzle-piece","fas fa-qrcode","fas fa-question","fas fa-question-circle","fas fa-quote-left","fas fa-quote-right","fas fa-random","fas fa-refresh","fas fa-reply","fas fa-reply-all","fas fa-retweet","fas fa-road","fas fa-rocket","fas fa-rss","fas fa-rss-square","fas fa-search","fas fa-search-minus","fas fa-search-plus","fas fa-share","fas fa-share-square","fas fa-share-square-o","fas fa-shield","fas fa-shopping-cart","fas fa-sign-in","fas fa-sign-out","fas fa-signal","fas fa-sitemap","fas fa-smile-o","fas fa-sort","fas fa-sort-alpha-asc","fas fa-sort-alpha-desc","fas fa-sort-amount-asc","fas fa-sort-amount-desc","fas fa-sort-asc","fas fa-sort-desc","fas fa-sort-down","fas fa-sort-numeric-asc","fas fa-sort-numeric-desc","fas fa-sort-up","fas fa-spinner","fas fa-square","fas fa-square-o","fas fa-star","fas fa-star-half","fas fa-star-half-empty","fas fa-star-half-full","fas fa-star-half-o","fas fa-star-o","fas fa-subscript","fas fa-suitcase","fas fa-sun-o","fas fa-superscript","fas fa-tablet","fas fa-tachometer","fas fa-tag","fas fa-tags","fas fa-tasks","fas fa-terminal","fas fa-thumb-tack","fas fa-thumbs-down","fas fa-thumbs-o-down","fas fa-thumbs-o-up","fas fa-thumbs-up","fas fa-ticket","fas fa-times","fas fa-times-circle","fas fa-times-circle-o","fas fa-tint","fas fa-toggle-down","fas fa-toggle-left","fas fa-toggle-right","fas fa-toggle-up","fas fa-trash-o","fas fa-trophy","fas fa-truck","fas fa-umbrella","fas fa-unlock","fas fa-unlock-alt","fas fa-unsorted","fas fa-upload","fas fa-user","fas fa-users","fas fa-video-camera","fas fa-volume-down","fas fa-volume-off","fas fa-volume-up","fas fa-warning","fas fa-wheelchair","fas fa-wrench","fas fa-check-square","fas fa-check-square-o","fas fa-circle","fas fa-circle-o","fas fa-dot-circle-o","fas fa-minus-square","fas fa-minus-square-o","fas fa-plus-square","fas fa-plus-square-o","fas fa-square","fas fa-square-o","fas fa-bitcoin","fas fa-btc","fas fa-cny","fas fa-dollar","fas fa-eur","fas fa-euro","fas fa-gbp","fas fa-inr","fas fa-jpy","fas fa-krw","fas fa-money","fas fa-rmb","fas fa-rouble","fas fa-rub","fas fa-ruble","fas fa-rupee","fas fa-try","fas fa-turkish-lira","fas fa-usd","fas fa-won","fas fa-yen","fas fa-align-center","fas fa-align-justify","fas fa-align-left","fas fa-align-right","fas fa-bold","fas fa-chain","fas fa-chain-broken","fas fa-clipboard","fas fa-columns","fas fa-copy","fas fa-cut","fas fa-dedent","fas fa-eraser","fas fa-file","fas fa-file-o","fas fa-file-text","fas fa-file-text-o","fas fa-files-o","fas fa-floppy-o","fas fa-font","fas fa-indent","fas fa-italic","fas fa-link","fas fa-list","fas fa-list-alt","fas fa-list-ol","fas fa-list-ul","fas fa-outdent","fas fa-paperclip","fas fa-paste","fas fa-repeat","fas fa-rotate-left","fas fa-rotate-right","fas fa-save","fas fa-scissors","fas fa-strikethrough","fas fa-table","fas fa-text-height","fas fa-text-width","fas fa-th","fas fa-th-large","fas fa-th-list","fas fa-underline","fas fa-undo","fas fa-unlink","fas fa-angle-double-down","fas fa-angle-double-left","fas fa-angle-double-right","fas fa-angle-double-up","fas fa-angle-down","fas fa-angle-left","fas fa-angle-right","fas fa-angle-up","fas fa-arrow-circle-down","fas fa-arrow-circle-left","fas fa-arrow-circle-o-down","fas fa-arrow-circle-o-left","fas fa-arrow-circle-o-right","fas fa-arrow-circle-o-up","fas fa-arrow-circle-right","fas fa-arrow-circle-up","fas fa-arrow-down","fas fa-arrow-left","fas fa-arrow-right","fas fa-arrow-up","fas fa-arrows","fas fa-arrows-alt","fas fa-arrows-h","fas fa-arrows-v","fas fa-caret-down","fas fa-caret-left","fas fa-caret-right","fas fa-caret-square-o-down","fas fa-caret-square-o-left","fas fa-caret-square-o-right","fas fa-caret-square-o-up","fas fa-caret-up","fas fa-chevron-circle-down","fas fa-chevron-circle-left","fas fa-chevron-circle-right","fas fa-chevron-circle-up","fas fa-chevron-down","fas fa-chevron-left","fas fa-chevron-right","fas fa-chevron-up","fas fa-hand-o-down","fas fa-hand-o-left","fas fa-hand-o-right","fas fa-hand-o-up","fas fa-long-arrow-down","fas fa-long-arrow-left","fas fa-long-arrow-right","fas fa-long-arrow-up","fas fa-toggle-down","fas fa-toggle-left","fas fa-toggle-right","fas fa-toggle-up","fas fa-arrows-alt","fas fa-backward","fas fa-compress","fas fa-eject","fas fa-expand","fas fa-fast-backward","fas fa-fast-forward","fas fa-forward","fas fa-pause","fas fa-play","fas fa-play-circle","fas fa-play-circle-o","fas fa-step-backward","fas fa-step-forward","fas fa-stop","fas fa-youtube-play","fas fa-adn","fas fa-android","fas fa-apple","fas fa-bitbucket","fas fa-bitbucket-square","fas fa-bitcoin","fas fa-btc","fas fa-css3","fas fa-dribbble","fas fa-dropbox","fas fa-facebook","fas fa-facebook-square","fas fa-flickr","fas fa-foursquare","fas fa-github","fas fa-github-alt","fas fa-github-square","fas fa-gittip","fas fa-google-plus","fas fa-google-plus-square","fas fa-html5","fas fa-instagram","fas fa-linkedin","fas fa-linkedin-square","fas fa-linux","fas fa-maxcdn","fas fa-pagelines","fas fa-pinterest","fas fa-pinterest-square","fas fa-renren","fas fa-skype","fas fa-stack-exchange","fas fa-stack-overflow","fas fa-trello","fas fa-tumblr","fas fa-tumblr-square","fas fa-twitter","fas fa-twitter-square","fas fa-vimeo-square","fas fa-vk","fas fa-weibo","fas fa-windows","fas fa-xing","fas fa-xing-square","fas fa-youtube","fas fa-youtube-play","fas fa-youtube-square","fas fa-ambulance","fas fa-h-square","fas fa-hospital-o","fas fa-medkit","fas fa-plus-square","fas fa-stethoscope","fas fa-user-md","fas fa-wheelchair","fas fa-flag","fas fa-maxcdn" ];
function getRandomIcon(){
    let min=0;
    let max=random_icons.length;
    let random =Math.floor(Math.random() * (+max - +min)) + +min;
    return `<i class="fas ${random_icons[random]}"></i>`;
}

function noAdminAllowed(field :any)  {
    const regExp = /admin/i;
    return {
        status: !regExp.test(field.value),
        element: field,
        message: "The word ADMIN is not allowed in the user name"
    };
}



if (document.readyState === 'complete') {
    main()
} else {
    document.addEventListener('DOMContentLoaded', main);
}