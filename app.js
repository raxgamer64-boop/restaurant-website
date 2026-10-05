const KEY="dutta_restaurant_data_v2";
const D=()=>JSON.parse(localStorage.getItem(KEY)||JSON.stringify(window.DEFAULT_DATA));
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function wa(text){return `https://wa.me/${D().brand.whatsapp}?text=${encodeURIComponent(text)}`}
function render(){
 const d=D(), b=d.brand;
 document.title=`${b.name} | ${b.tagline}`;
 document.getElementById("site").innerHTML=`
 <div class="top">OPEN TODAY · ${esc(b.hours)} <span>·</span> ${esc(b.city)}</div>
 <header><a class="logo" href="#home"><i>D</i><span><b>${esc(b.name)}</b><small>${esc(b.tagline)}</small></span></a>
 <button id="hamb">☰</button><nav><a href="#story">Story</a><a href="#menu">Menu</a><a href="#experience">Experience</a><a href="#gallery">Gallery</a><a href="#contact">Contact</a><a class="gold" href="#reserve">Reserve</a></nav></header>
 <main>
 <section class="hero" id="home" style="--bg:url('${esc(d.hero.image)}')"><div class="shade"></div><div class="heroIn">
 <label>${esc(d.hero.eyebrow)}</label><h1>${esc(d.hero.title)}<em>${esc(d.hero.emphasis)}</em></h1><p>${esc(d.hero.description)}</p>
 <div class="actions"><a class="btn gold" href="#menu">Explore Menu →</a><a class="btn" href="#reserve">Reserve a Table</a></div>
 <small class="owner">OWNER · ${esc(b.owner)}</small></div><div class="scroll">SCROLL ↓</div></section>
 <section class="light" id="story"><div class="tag">01 — OUR STORY</div><div class="split"><div><h2>${esc(d.story.title)}<em>${esc(d.story.emphasis)}</em></h2></div><div class="copy"><p>${esc(d.story.p1)}</p><p>${esc(d.story.p2)}</p><div class="sig">${esc(b.owner)}<small>Owner · ${esc(b.name)}</small></div></div></div></section>
 <section class="dark" id="menu"><div class="head"><div><div class="tag">02 — THE MENU</div><h2>Made to make you <em>come back.</em></h2></div><p>Fresh favourites, comforting classics and house specials. Prices and dishes are fully editable from the admin panel.</p></div>
 <div class="tabs" id="tabs"></div><div class="items" id="items"></div></section>
 <section class="experience" id="experience" style="--bg:url('${esc(d.experience.image)}')"><div class="shade"></div><div class="expIn"><div class="tag">03 — THE EXPERIENCE</div><h2>${esc(d.experience.title)}<em>${esc(d.experience.emphasis)}</em></h2><div class="points"><div><b>01</b><strong>Freshly prepared</strong><small>Thoughtful cooking, made for the table.</small></div><div><b>02</b><strong>Warm hospitality</strong><small>Service that makes you feel at home.</small></div><div><b>03</b><strong>Worth returning for</strong><small>Food and moments guests remember.</small></div></div></div></section>
 <section class="light" id="gallery"><div class="tag">04 — GALLERY</div><h2>Take a look at <em>the experience.</em></h2><div class="gallery">${d.gallery.map((x,i)=>`<img class="g${i}" src="${esc(x)}" alt="Dutta Restaurant gallery ${i+1}">`).join("")}</div></section>
 <section class="dark reserve" id="reserve"><div><div class="tag">05 — RESERVATIONS</div><h2>Make your <em>table yours.</em></h2><p>Send a reservation request directly to the restaurant team on WhatsApp.</p></div><form id="book"><input required name="name" placeholder="Your name"><div class="tw"><input required name="date" type="date"><select name="guests"><option>2 guests</option><option>3 guests</option><option>4 guests</option><option>5 guests</option><option>6+ guests</option></select></div><input required name="time" type="time"><button class="btn gold">Request Reservation →</button></form></section>
 <section class="dark contact" id="contact"><div class="tag">06 — CONTACT</div><div class="contactGrid"><div><h2>Let's make <em>dinner happen.</em></h2><div class="lines"><a href="tel:${esc(b.phone.replace(/\\s/g,''))}"><small>CALL</small><strong>${esc(b.phone)}</strong></a><a target="_blank" href="${wa("Hello Dutta Restaurant, I would like to know more about the restaurant.")}"><small>WHATSAPP</small><strong>Chat with us</strong></a><div><small>UPI</small><strong>${esc(b.upi)}</strong></div><div><small>ADDRESS</small><strong>${esc(b.address)}</strong></div><div><small>OPENING HOURS</small><strong>${esc(b.hours)}</strong></div></div></div><div class="map"><div class="mapPin">D</div><b>${esc(b.name)}</b><span>${esc(b.address)}</span></div></div></section>
 </main><footer><b>${esc(b.name)}</b><span>${esc(b.tagline)}</span><span>© ${new Date().getFullYear()} ${esc(b.name)}</span></footer>
 <div class="toast" id="toast"></div>`;
 setupMenu(); setupForm(); document.getElementById("hamb").onclick=()=>document.querySelector("nav").classList.toggle("open");
}
function setupMenu(){
 const d=D(), cats=[...new Set(d.menu.map(x=>x.cat))], tabs=document.getElementById("tabs"), items=document.getElementById("items");
 tabs.innerHTML=cats.map((x,i)=>`<button class="${i?"":"on"}" data-c="${esc(x)}">${esc(x)}</button>`).join("");
 function show(cat){items.innerHTML=d.menu.filter(x=>x.cat===cat).map(x=>`<article><img src="${esc(x.image)}"><div><h3>${esc(x.name)}<b>₹${esc(x.price)}</b></h3><p>${esc(x.desc)}</p></div></article>`).join("");}
 show(cats[0]);tabs.onclick=e=>{if(e.target.tagName!=="BUTTON")return;tabs.querySelectorAll("button").forEach(x=>x.classList.remove("on"));e.target.classList.add("on");show(e.target.dataset.c)}
}
function setupForm(){
 document.getElementById("book").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),d=D();const msg=`Hello ${d.brand.name}, I want to request a table.%0AName: ${f.get("name")}%0ADate: ${f.get("date")}%0ATime: ${f.get("time")}%0AGuests: ${f.get("guests")}`;window.open(`https://wa.me/${d.brand.whatsapp}?text=${msg}`,"_blank")}
}
render();