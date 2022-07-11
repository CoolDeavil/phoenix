import toAscii from '../common/regHighlight';

export default class Highlight {
    public css: string;

    constructor(css: string) {
        this.css = css;
    }
    transform(haystack: string, needle: string){
        const indexes = Highlight.getIndexes(haystack, needle);
        if (indexes.length === 0) {return haystack ; }
        let strOut = haystack.substr(0, indexes[0].start);
        for (let i = 0; i < indexes.length; i++) {
            strOut += '<span class="'+  this.css + '">' + haystack.substr(indexes[i].start, (indexes[i].end - indexes[i].start)) + '</span>';
            if ( (i + 1) < indexes.length) {
                strOut += haystack.substr(indexes[i].end, indexes[i + 1].start - indexes[i].end);
            } else {
                strOut += haystack.substr(indexes[indexes.length - 1].end, haystack.length - indexes[indexes.length - 1].end);
            }
        }
        return strOut;
    }
    static getIndexes(haystack: string, needle: string){

        const modHaystack: any = toAscii(haystack);
        const modNeedle: any = toAscii(needle);

        const pattern_ = new RegExp(escapeRegExp(modNeedle), 'gi');
        const results = []; // this is the results you want
        let result_;
        while ( (result_ = pattern_.exec(modHaystack)) ) {
            results.push({
                start: result_.index,
                end: pattern_.lastIndex
            });
        }
        return results;
        function escapeRegExp(text:any) {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        }
    }
}

