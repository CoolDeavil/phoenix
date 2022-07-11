export function main(){
    console.log("%cRoute List... %c[OK]" , 'color: green','color:magenta');
    let acc = document.getElementsByClassName("accordion");
    let i;
    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function () {
            this.classList.toggle("isOn");
            let panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }
}
if (document.readyState === 'complete') {
    main()
} else {
    document.addEventListener('DOMContentLoaded', main);
}



