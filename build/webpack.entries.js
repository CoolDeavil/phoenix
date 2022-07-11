exports.baseCode = () => {
    return {
        main: [
            './assets/ts/main',
            './assets/scss/main',
            './assets/scss/skeleton',
        ],
        routes: [
            './assets/ts/routes',
            './assets/scss/routes',
        ],
        avatarUpdate :[
            './assets/ts/Author/avatarCrop',
            './assets/scss/avatarCrop',
        ],
        landing :[
            './assets/ts/landing'
        ],
        usrRegister :[
            './assets/ts/Author/registerUser',
        ],
        authLog :[
            './assets/ts/Author/login',
        ],
        upload: [
            './assets/ts/uploadTune',
            './assets/scss/dropZone',
            './assets/scss/uploadThumb',
            './assets/scss/starRate',
            './assets/scss/uploader',
            './assets/scss/dashboard',
            './assets/scss/keyMaster',
            './assets/scss/confirmBox',
            './assets/scss/circleProgress',
        ],


        formRules :[
            './assets/ts/gadgets/formRules',
            './assets/scss/validator',
        ],
        midnight :[
            './assets/ts/midnight',
            './assets/scss/easyList',
            './assets/scss/countryList',
        ],
        scrollBox :[
            './assets/ts/gadgets/scrollBox',
            './assets/scss/scrollBox',
        ],
        calendar :[
            './assets/ts/gadgets/iDateTrial',
            './assets/scss/iDate',
        ],
        iSelect :[
            './assets/ts/gadgets/inputSelect',
            './assets/scss/iSelect',
        ],
        keyMaster :[
            './assets/ts/gadgets/keyMaster',
            './assets/scss/keyMaster',
        ],

    }
};
