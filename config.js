const RESTAURANT = {
  name: 'Datta Restaurant',
  whatsapp: '919546320565',
  phone: '+919546320565',
  address: 'Ambedkar Chowk, Maheshpur, Pakur, Jharkhand, India',
  hours: 'Mon–Sun · 11:00 AM – 10:00 PM',
  maps: 'https://www.google.com/maps/search/?api=1&query=Ambedkar%20Chowk%20Maheshpur%20Pakur%20Jharkhand%20India',
  upiId: '9546320565-2@ibl',
  upiName: 'Datta Restaurant'
};

const MENU = [
  {id:1,name:'Chicken Biryani',price:180,cat:'biryani',desc:'Aromatic basmati rice with tender chicken & special spices'},
  {id:2,name:'Paneer Butter Masala',price:150,cat:'mains',desc:'Rich & flavorful paneer in creamy tomato gravy'},
  {id:5,name:'Tandoori Chicken',price:200,cat:'tandoor',desc:'Juicy, smoky and full of flavour from the tandoor'},
  {id:7,name:'Chicken Curry',price:160,cat:'mains',desc:'Traditional desi style chicken curry with rich gravy'},
  {id:8,name:'Veg Fried Rice',price:90,cat:'chinese',desc:'Fresh vegetables with aromatic rice'},
  {id:9,name:'Paneer Tikka',price:130,cat:'starters',desc:'Char-grilled paneer, peppers & mint chutney'},
  {id:10,name:'Veg Manchurian',price:100,cat:'chinese',desc:'Crispy vegetable balls in spicy Manchurian sauce'},
  {id:11,name:'Chicken Lollipop',price:120,cat:'starters',desc:'Juicy chicken lollipop, marinated and fried crisp'},
  {id:12,name:'Chicken Tikka',price:180,cat:'tandoor',desc:'Boneless chicken, smoky and marinated in spices'},
  {id:13,name:'Chilli Chicken',price:110,cat:'chinese',desc:'Indo-Chinese chicken with peppers and onion'},
  {id:14,name:'Masala Dosa',price:80,cat:'bread',desc:'Crispy dosa with potato filling and chutney'}
];

const CART_KEY='datta_restaurant_cart';
let cart=JSON.parse(localStorage.getItem(CART_KEY)||'[]');
function waUrl(message){return 'https://wa.me/'+RESTAURANT.whatsapp+'?text='+encodeURIComponent(message)}
function saveCart(){localStorage.setItem(CART_KEY,JSON.stringify(cart));renderCart()}
function addToCart(id,qty=1){qty=Math.max(1,Number(qty)||1);const item=cart.find(x=>x.id===id);if(item)item.qty+=qty;else{const m=MENU.find(x=>x.id===id);if(m)cart.push({...m,qty})}saveCart();openCart()}
const menuQty={};
function getMenuQty(id){return menuQty[id]||1}
function setMenuQty(id,qty){qty=Math.max(1,Math.min(99,Number(qty)||1));menuQty[id]=qty;const el=document.getElementById('menuQty-'+id);if(el)el.textContent=qty}
function upiUrl(amount,note='Datta Restaurant Order'){const p=new URLSearchParams({pa:RESTAURANT.upiId,pn:RESTAURANT.upiName,cu:'INR'});if(Number(amount)>0)p.set('am',Number(amount).toFixed(2));p.set('tn',note);return 'upi://pay?'+p.toString()}
function changeQty(id,delta){const item=cart.find(x=>x.id===id);if(!item)return;item.qty+=delta;if(item.qty<=0)cart=cart.filter(x=>x.id!==id);saveCart()}
function renderCart(){
 const count=cart.reduce((a,x)=>a+x.qty,0),total=cart.reduce((a,x)=>a+x.price*x.qty,0);
 document.getElementById('cartCount').textContent=count;document.getElementById('cartTotal').textContent='₹'+total;
 const list=document.getElementById('cartItems');
 list.innerHTML=cart.length?cart.map(x=>`<div class="cart-row"><div><b>${x.name}</b><small>₹${x.price} each</small></div><div class="cart-qty"><button onclick="changeQty(${x.id},-1)">−</button><span>${x.qty}</span><button onclick="changeQty(${x.id},1)">+</button></div></div>`).join(''):'<div class="empty-cart">Your order is empty.<br><small>Add dishes from the menu.</small></div>';
 const u=currentUser();
 const msg=`Hello ${RESTAURANT.name}, I would like to place an order:\n\n${cart.map(x=>`${x.name} x ${x.qty} = ₹${x.price*x.qty}`).join('\n')}\n\nTotal: ₹${total}\n\nPlease confirm availability and delivery/pickup details.`;
 document.getElementById('checkoutBtn').disabled=!cart.length;document.getElementById('whatsappOrderBtn').href=waUrl(msg);
 const pt=document.getElementById('paymentTotal');if(pt)pt.textContent='₹'+total;
 const upi=document.getElementById('upiPayBtn');if(upi)upi.href=upiUrl(total,`Order ${RESTAURANT.name} - ₹${total}`);
 const mw=document.getElementById('modalWhatsAppBtn');if(mw)mw.href=waUrl(msg);
}
function openCart(){document.getElementById('cartPanel').classList.add('open')}
function closeCart(){document.getElementById('cartPanel').classList.remove('open')}
function setupBooking(){
 const form=document.getElementById('bookingForm');if(!form)return;const date=form.querySelector('[name="date"]');if(date)date.min=new Date().toISOString().split('T')[0];
 form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form);const u=currentUser();
 const booking={id:'b_'+Date.now(),userId:u?.id||'guest',name:d.get('name'),phone:d.get('phone'),date:d.get('date'),time:d.get('time'),guests:d.get('guests'),type:d.get('type'),event:d.get('event')||'',createdAt:new Date().toISOString(),status:'New'};saveBooking(booking);const msg=`Hello ${RESTAURANT.name}, I want to book ${d.get('type')==='Private Room'?'a private room':'a table'}.\n\nName: ${d.get('name')}\nPhone: ${d.get('phone')}\nDate: ${d.get('date')}\nTime: ${d.get('time')}\nGuests: ${d.get('guests')}\nBooking type: ${d.get('type')}${d.get('event')?`\nEvent/requirements: ${d.get('event')}`:''}\n\nPlease confirm availability.`;document.getElementById('bookingStatus').textContent='Opening WhatsApp…';window.open(waUrl(msg),'_blank')})
}
function setupPayment(){
 const modal=document.getElementById('paymentModal'),openBtn=document.getElementById('checkoutBtn'),closeBtn=document.getElementById('closePayment'),qrBtn=document.getElementById('showQrBtn'),qrArea=document.getElementById('qrArea'),confirm=document.getElementById('confirmPaymentBtn');
 const open=()=>{if(!cart.length)return;modal.classList.add('open');modal.setAttribute('aria-hidden','false');qrArea.hidden=true;renderCart()},close=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')};
 openBtn.addEventListener('click',open);closeBtn.addEventListener('click',close);modal.addEventListener('click',e=>{if(e.target===modal)close()});qrBtn.addEventListener('click',()=>qrArea.hidden=!qrArea.hidden);
 confirm.addEventListener('click',()=>{const total=cart.reduce((a,x)=>a+x.price*x.qty,0);const order=cart.map(x=>`${x.name} x ${x.qty} = ₹${x.price*x.qty}`).join('\n');const u=currentUser();saveOrder({id:'o_'+Date.now(),userId:u?.id||'guest',customerName:u?.name||'Guest',email:u?.email||'',phone:u?.phone||'',items:cart.map(x=>({id:x.id,name:x.name,price:x.price,qty:x.qty})),total,status:'Paid - Awaiting confirmation',createdAt:new Date().toISOString()});window.open(waUrl(`Hello ${RESTAURANT.name}, I have made the UPI payment for my order.\n\n${order}\n\nTotal paid: ₹${total}\nUPI ID: ${RESTAURANT.upiId}\n\nI am sending the payment screenshot for confirmation.`),'_blank')})
}
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.add-cart').forEach(b=>b.addEventListener('click',()=>addToCart(Number(b.dataset.id),getMenuQty(Number(b.dataset.id)))));
 document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const id=Number(b.dataset.id);setMenuQty(id,getMenuQty(id)+(b.dataset.action==='plus'?1:-1))}));
 document.getElementById('cartFab').addEventListener('click',openCart);document.getElementById('closeCart').addEventListener('click',closeCart);
 document.querySelectorAll('.category-row button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.category-row button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const cat=b.dataset.cat;document.querySelectorAll('.menu-card').forEach(c=>c.style.display=cat==='all'?'block':(c.dataset.cat===cat?'block':'none'))}));
 document.querySelector('.menu-btn').addEventListener('click',()=>document.querySelector('.nav nav').classList.toggle('mobile-open'));
 document.querySelectorAll('.nav nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.nav nav').classList.remove('mobile-open')));
 document.querySelector('.slider-left').addEventListener('click',()=>document.getElementById('famousSlider').scrollBy({left:-340,behavior:'smooth'}));
 document.querySelector('.slider-right').addEventListener('click',()=>document.getElementById('famousSlider').scrollBy({left:340,behavior:'smooth'}));
 document.querySelectorAll('[data-wa]').forEach(a=>a.href=waUrl(`Hello ${RESTAURANT.name}, I would like to know more.`));
 document.querySelectorAll('[data-phone]').forEach(a=>{a.textContent=RESTAURANT.phone;a.href='tel:'+RESTAURANT.phone});
 document.querySelectorAll('[data-address]').forEach(e=>e.textContent=RESTAURANT.address);
 document.querySelectorAll('[data-hours]').forEach(e=>e.textContent=RESTAURANT.hours);
 setupBooking();setupPayment();renderCart();
});
