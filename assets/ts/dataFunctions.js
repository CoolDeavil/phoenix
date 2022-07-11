
//////////////////////////////////////////////////////
//              Utility Functions                   //
//////////////////////////////////////////////////////

export const getMaxChars = ()=>{
    let maxChars = 0;
    const width = window.innerWidth || document.clientWidth;
    if(width < 414) maxChars = 65; 
    if(width >= 414) maxChars = 100; 
    if(width > 1400 ) maxChars = 130;
    return maxChars;
}

export const buildQuery = (searchTerm, maxChars )=>{

    // const APIRandomImages = `https://i.picsum.photos/id/866/200/300.jpg?hmac=rcadCENKh4rD6MAp6V_ma-AyWv641M4iiOpe1RyFHeI`;
    // return APIRandomImages;

    const APIQuery = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerm}&gsrlimit=${10}&prop=pageimages|extracts&exchars=${130}&exlimit=1&format=json&origin=*`;
    return APIQuery;
}

export const sanitize = (rawSearchTerm) => {
    const regex = /[ ]{2,}/gi;
    const searchTerm = rawSearchTerm.replaceAll(regex," ");
    return searchTerm;
}

