export default function humanFileSize(size:any) {
    if(size===0){
        return "0 <strong>B</strong>";
    }
    let i = Math.floor( Math.log(size) / Math.log(1024) );
    // @ts-ignore
    return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['<strong>B</strong>', '<strong>kB</strong>', '<strong>MB</strong>', '<strong>GB</strong>', '<strong>TB</strong>'][i];
}
