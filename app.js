(() => {
  const KEY = "dutta_restaurant_data_v2";
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const getData = () => { try { return JSON.parse(localStorage.getItem(KEY)) || window.DEFAULT_DATA; } catch { return window.DEFAULT_DATA; } };
  const wa = text => `https://wa.me/${getData().brand.whatsapp}?text=${encodeURIComponent(text)}`;
  let toastTimer;

  function render(){
    const d=getData(), b=d.brand;
    document.title=`${b.name} | ${b.tagline}`;
    document.getElementById("site").innerHTML=`
      <div class="top">OPEN TODAY · ${esc(b.hours)} <span>·</span> ${esc(b.city)}</div>
      <header class="siteHeader" id="siteHeader">
        <a class="logo" href="#home" aria-label="${esc(b.name)} home"><span class="logoMark">D</span><span class="logoText"><b>${esc(b.name)}</b><small>${esc(b.tagline)}</small></span></a>
        <button class="hamb" id="hamb" aria-label="Open menu" aria-expanded="false">☰</button>
        <nav class="nav" id="nav"><a href="#story">Story</a><a href="#menu">Menu</a><a href="#experience">Experience</a><a href="#gallery">Gallery</a><a href="#contact">Contact</a><a class="navCta" href="#reserve">Reserve</a></nav>
      </header>
      <main>
        <section class="hero" id="home">
          <div class="heroBg" style="--bg:url('${esc(d.hero.image)}')"></div><div class="heroOverlay"></div><div class="heroGlow"></div>
          <div class="heroIn reveal"><div class="eyebrow">${esc(d.hero.eyebrow)}</div><h1>${esc(d.hero.title)}<span>${esc(d.hero.emphasis)}</span></h1><p class="heroDesc">${esc(d.hero.description)}</p><div class="actions"><a class="btn gold" href="#menu">Explore Menu →</a><a class="btn" href="#reserve">Reserve a Table</a></div><small class="owner">OWNER · ${esc(b.owner)}</small></div>
          <div class="heroCard"><div class="miniImg" style="--mini:url('${esc(d.menu[0]?.image || d.hero.image)}')"></div><b>${esc(d.menu[0]?.name || "House Special")}</b><small>Signature selection · ₹${esc(d.menu[0]?.price || "—")}</small></div>
          <div class="heroScroll">SCROLL <span>↓</span></div>
        </section>
        <section class="light" id="story"><div class="sectionHead reveal"><div class="tag">01 — ${esc(d.story.eyebrow || "OUR STORY")}</div><div class="split"><div><h2 class="sectionTitle">${esc(d.story.title)}<em>${esc(d.story.emphasis)}</em></h2></div><div class="copy"><p>${esc(d.story.p1)}</p><p>${esc(d.story.p2)}</p><div class="sig">${esc(b.owner)}<small>Owner · ${esc(b.name)}</small></div></div></div></div></section>
        <section class="dark" id="menu"><div class="sectionHead reveal"><div class="head"><div><div class="tag">02 — THE MENU</div><h2 class="sectionTitle">Made to make you <em>come back.</em></h2></div><p>Fresh favourites, comforting classics and house specials. Every dish is easy to update from the owner dashboard.</p></div><div class="tabs" id="tabs"></div><div class="items" id="items"></div></div></section>
        <section class="experience" id="experience"><div class="expBg" style="--bg:url('${esc(d.experience.image)}')"></div><div class="expShade"></div><div class="expIn reveal"><div class="tag">03 — THE EXPERIENCE</div><h2 class="sectionTitle">${esc(d.experience.title)}<em>${esc(d.experience.emphasis)}</em></h2><div class="points"><div><b>01</b><strong>Freshly prepared</strong><small>Thoughtful cooking, made for the table.</small></div><div><b>02</b><strong>Warm hospitality</strong><small>Service that makes you feel at home.</small></div><div><b>03</b><strong>Worth returning for</strong><small>Food and moments guests remember.</small></div></div></div></section>
        <section class="light" id="gallery"><div class="sectionHead reveal"><div class="tag">04 — GALLERY</div><h2 class="sectionTitle">Take a look at <em>the experience.</em></h2><div class="galleryWrap"><div class="gallery">${(d.gallery||[]).map((x,i)=>`<button class="galleryItem" data-img="${esc(x)}" aria-label="Open gallery image ${i+1}"><img loading="lazy" src="${esc(x)}" alt="${esc(b.name)} gallery image ${i+1}"></button>`).join("")}</div></div></div></section>
        <section class="dark" id="reserve"><div class="sectionHead reserve reveal"><div><div class="tag">05 — RESERVATIONS</div><h2 class="sectionTitle">Make your <em>table yours.</em></h2><p>Send a reservation request directly to the restaurant team on WhatsApp. No third-party booking app required.</p></div><form id="book"><input required name="name" autocomplete="name" placeholder="Your name"><div class="tw"><input required name="date" type="date"><select name="guests"><option>2 guests</option><option>3 guests</option><option>4 guests</option><option>5 guests</option><option>6+ guests</option></select></div><input required name="time" type="time"><button class="btn gold" type="submit">Request Reservation →</button></form></div></section>
        <section class="dark contact" id="contact"><div class="sectionHead reveal"><div class="tag">06 — CONTACT</div><div class="contactGrid"><div><h2 class="sectionTitle">Let's make <em>dinner happen.</em></h2><div class="lines"><a href="tel:${esc(b.phone.replace(/\s/g,''))}"><small>CALL</small><strong>${esc(b.phone)}</strong></a><a target="_blank" rel="noopener" href="${wa('Hello Dutta Restaurant, I would like to know more about the restaurant.')}"><small>WHATSAPP</small><strong>Chat with us</strong></a><div><small>UPI</small><strong>${esc(b.upi)}</strong></div><div><small>ADDRESS</small><strong>${esc(b.address)}</strong></div><div><small>OPENING HOURS</small><strong>${esc(b.hours)}</strong></div></div></div><div class="map"><div class="mapPin">D</div><b>${esc(b.name)}</b><span>${esc(b.address)}</span></div></div></div></section>
      </main>
      <footer class="footer"><b>${esc(b.name)}</b><span>${esc(b.tagline)}</span><span>© ${new Date().getFullYear()} ${esc(b.name)}</span></footer>
      <div class="mobileBar"><a href="tel:${esc(b.phone.replace(/\s/g,''))}">Call Now</a><a href="${wa('Hello Dutta Restaurant, I would like to reserve a table.') }" target="_blank" rel="noopener">WhatsApp</a></div>
      <div class="toast" id="toast"></div>`;
    setupMenu(); setupForm(); setupNav(); setupMotion(); setupGallery();
  }

  function setupNav(){
    const header=$("#siteHeader"), nav=$("#nav"), hamb=$("#hamb");
    hamb.onclick=()=>{const open=nav.classList.toggle("open");hamb.setAttribute("aria-expanded",open)};
    $$(".nav a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");hamb.setAttribute("aria-expanded","false")}));
    const onScroll=()=>header.classList.toggle("scrolled",scrollY>45); addEventListener("scroll",onScroll,{passive:true}); onScroll();
  }

  function setupMenu(){
    const d=getData(), cats=[...new Set((d.menu||[]).map(x=>x.cat))], tabs=$("#tabs"), items=$("#items");
    if(!cats.length){items.innerHTML='<p style="color:#999">Menu coming soon.</p>';return}
    tabs.innerHTML=cats.map((x,i)=>`<button class="${i?"":"on"}" data-c="${esc(x)}">${esc(x)}</button>`).join("");
    const show=cat=>{items.innerHTML=d.menu.filter(x=>x.cat===cat).map(x=>`<article class="dish"><div class="dishImg" style="background-image:url('${esc(x.image)}')"></div><div class="dishShade"></div><div class="dishInfo"><div class="dishCat">${esc(x.cat)}</div><h3>${esc(x.name)}</h3><p>${esc(x.desc)}</p><b class="dishPrice">₹${esc(x.price)}</b></div></article>`).join("");setupTilt()};
    show(cats[0]); tabs.onclick=e=>{if(e.target.tagName!=="BUTTON")return;$$("button",tabs).forEach(x=>x.classList.remove("on"));e.target.classList.add("on");show(e.target.dataset.c)};
  }
  function setupTilt(){if(matchMedia("(pointer:fine)").matches){$$('.dish').forEach(card=>{card.onmousemove=e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${y*-3}deg) rotateY(${x*4}deg) translateY(-3px)`};card.onmouseleave=()=>card.style.transform=""})}}
  function setupForm(){const form=$("#book");form.onsubmit=e=>{e.preventDefault();const f=new FormData(form),d=getData(),msg=`Hello ${d.brand.name}, I want to request a table.\nName: ${f.get("name")}\nDate: ${f.get("date")}\nTime: ${f.get("time")}\nGuests: ${f.get("guests")}`;window.open(`https://wa.me/${d.brand.whatsapp}?text=${encodeURIComponent(msg)}`,"_blank");showToast("Opening WhatsApp reservation…")}}
  function setupGallery(){const lb=$("#lightbox"),img=$("#lightboxImg"),close=()=>{lb.classList.remove("open");lb.setAttribute("aria-hidden","true");document.body.classList.remove("lock")};$$('.galleryItem').forEach(x=>x.onclick=()=>{img.src=x.dataset.img;lb.classList.add("open");lb.setAttribute("aria-hidden","false");document.body.classList.add("lock")});$(".lightboxClose").onclick=close;lb.onclick=e=>{if(e.target===lb)close()};addEventListener("keydown",e=>{if(e.key==="Escape")close()})}
  function setupMotion(){const els=$$('.reveal');if(!('IntersectionObserver' in window)){els.forEach(x=>x.classList.add('visible'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});els.forEach(x=>io.observe(x));const hero=$(".heroBg"),exp=$(".expBg");if(!matchMedia('(prefers-reduced-motion: reduce)').matches){addEventListener('scroll',()=>{const y=scrollY;hero.style.transform=`translate3d(0,${y*.12}px,0) scale(1.05)`;exp.style.transform=`translate3d(0,${(y-document.querySelector('#experience').offsetTop)*.06}px,0) scale(1.06)`},{passive:true})}}
  function showToast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>x.classList.remove("show"),2200)}
  render();
})();