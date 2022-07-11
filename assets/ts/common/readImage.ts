export default function readImage(image:any){
    return new Promise((resolve, reject )=>{
        let reader = new FileReader();
        reader.onload = ()=>{
            let i = new Image();
            i.src = reader.result as string;
            i.onload = ()=>{
                resolve(
                    [reader.result, i.height, i.width]
                );
            };
            i.onerror = ()=>{
                reject('Image not Found...');
            }
        };
        reader.readAsDataURL(image);
    });
}