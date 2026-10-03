const buttons=document.querySelectorAll(".tabs button"),foods=document.querySelectorAll(".food");
buttons.forEach(btn=>btn.addEventListener("click",()=>{buttons.forEach(b=>b.classList.remove("active"));btn.classList.add("active");const cat=btn.dataset.cat;foods.forEach(f=>f.style.display=cat==="all"||f.dataset.cat===cat?"grid":"none")}));
const nav=document.querySelector(".nav");window.addEventListener("scroll",()=>nav.classList.toggle("scrolled",scrollY>20));
document.querySelector(".menu-btn").addEventListener("click",()=>{const n=document.querySelector(".nav nav");n.style.display=n.style.display==="flex"?"none":"flex";n.style.position="absolute";n.style.top="68px";n.style.left="0";n.style.right="0";n.style.padding="22px";n.style.background="#f7f4ee";n.style.flexDirection="column"});
