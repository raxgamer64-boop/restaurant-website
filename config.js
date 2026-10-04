/* Datta Restaurant - Live website configuration and interactions */
const RESTAURANT = {
  name: 'Datta Restaurant',
  phone: '+91 95463 20565',
  whatsapp: '919546320565',
  address: 'Ambedkar Chowk, Maheshpur, Pakur, Jharkhand, India',
  hours: 'Mon–Sun · 11:00 AM – 10:00 PM',
  maps: 'https://www.google.com/maps/search/?api=1&query=Ambedkar%20Chowk%20Maheshpur%20Pakur%20Jharkhand%20India',
  upiId: '9546320565-2@ibl',
  upiName: 'Datta Restaurant'
};

let MENU = [];
let cart = JSON.parse(localStorage.getItem('datta_cart') || '[]');

const esc = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
const money = v => '₹' + Number(v || 0).toFixed(0);

function categoryLabel(cat) {
  const map = { starters:'STARTER', mains:'MAIN COURSE', biryani:'BIRYANI', tandoor:'TANDOOR', chinese:'CHINESE', bread:'INDIAN BREAD', drinks:'BEVERAGE' };
  return map[cat] || String(cat || 'FOOD').toUpperCase();
}

async function loadMenuFromSupabase() {
  const { data, error } = await supabaseClient.from('menu_items').select('*').eq('is_available', true).order('id', { ascending: true });
  if (error) throw error;
  MENU = (data || []).map(item => ({
    id:Number(item.id), name:item.name || '', price:Number(item.price || 0),
    cat:item.category || 'mains', desc:item.description || '', image_url:item.image_url || ''
  }));
  return MENU;
}

function menuCard(item, featured=false) {
  const image = item.image_url ? ` style="background-image:url('${esc(item.image_url)}')"` : '';
  if (featured) return `<article class="dish-card"><div class="dish-photo"${image}><span>${esc(item.badge || 'Popular')}</span><button type="button" aria-label="Favourite">♡</button></div><div class="dish-info"><h3>${esc(item.name)}</h3><b>${money(item.price)}</b><p>${esc(item.desc)}</p><div class="dish-actions"><div class="qty"><button data-action="minus" data-id="${item.id}">−</button><span id="menuQty-${item.id}">1</span><button data-action="plus" data-id="${item.id}">+</button></div><button class="add-cart" data-id="${item.id}">Add to Cart</button></div></div></article>`;
  return `<article class="menu-card" data-cat="${esc(item.cat)}"><div class="menu-photo"${image}></div><div class="menu-body"><small>${categoryLabel(item.cat)}</small><h3>${esc(item.name)}</h3><p>${esc(item.desc)}</p><strong>${money(item.price)}</strong><div class="dish-actions"><div class="qty"><button data-action="minus" data-id="${item.id}">−</button><span id="menuQty-${item.id}">1</span><button data-action="plus" data-id="${item.id}">+</button></div><button class="add-cart" data-id="${item.id}">Add to Cart</button></div></div></article>`;
}

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  const slider = document.getElementById('famousSlider');
  if (!grid || !slider) return;
  if (!MENU.length) {
    grid.innerHTML = '<div class="empty-cart" style="grid-column:1/-1;padding:30px;text-align:center">Menu is currently unavailable. Please check back shortly.</div>';
    slider.innerHTML = '<div class="empty-cart" style="padding:30px;text-align:center">No featured dishes available.</div>';
    return;
  }
  grid.innerHTML = MENU.map(item => menuCard(item)).join('');
  slider.innerHTML = MENU.slice(0, 8).map((item,i) => menuCard({...item,badge:i===0?'Best Seller':i===1?"Chef's Special":'Popular'}, true)).join('');
}

function saveCart(){ localStorage.setItem('datta_cart', JSON.stringify(cart)); }
function findMenuItem(id){ return MENU.find(x => Number(x.id) === Number(id)); }
function getCartTotal(){ return cart.reduce((t,x)=>t+Number(x.price||0)*Number(x.qty||0),0); }
function addToCart(id){ const item=findMenuItem(id); if(!item)return; const old=cart.find(x=>Number(x.id)===Number(id)); if(old) old.qty++; else cart.push({id:item.id,name:item.name,price:item.price,qty:1}); saveCart(); renderCart(); }
function changeCartQty(id,change){ const item=cart.find(x=>Number(x.id)===Number(id)); if(!item)return; item.qty+=change; if(item.qty<=0)cart=cart.filter(x=>Number(x.id)!==Number(id)); saveCart(); renderCart(); }
function renderCart(){
  const items=document.getElementById('cartItems'), total=document.getElementById('cartTotal'), count=document.getElementById('cartCount');
  if(count) count.textContent=cart.reduce((s,x)=>s+Number(x.qty||0),0);
  if(!items)return;
  if(!cart.length){items.innerHTML='<div class="empty-cart">Your cart is empty.</div>';if(total)total.textContent='₹0';return;}
  items.innerHTML=cart.map(x=>`<div class="cart-item"><div class="cart-item-info"><strong>${esc(x.name)}</strong><span>${money(x.price)} × ${x.qty}</span></div><div class="cart-item-actions"><button type="button" onclick="changeCartQty(${x.id},-1)">−</button><span>${x.qty}</span><button type="button" onclick="changeCartQty(${x.id},1)">+</button></div><strong>${money(x.price*x.qty)}</strong></div>`).join('');
  if(total)total.textContent=money(getCartTotal());
}

function whatsappUrl(message){ return `https://wa.me/${RESTAURANT.whatsapp}?text=${encodeURIComponent(message)}`; }
function cartMessage(){ return `Hello ${RESTAURANT.name}, I want to order:\n\n${cart.map(x=>`• ${x.name} × ${x.qty} = ${money(x.price*x.qty)}`).join('\n')}\n\nTotal: ${money(getCartTotal())}`; }

async function placeOrder(paymentMethod='WhatsApp/UPI', paymentStatus='Pending') {
  const user=await getCurrentSupabaseUser();
  if(!user){ location.href='login.html?next=index.html'; return null; }
  const profile=await getProfile(user.id);
  return saveOrder({
    customerName:profile?.name || user.user_metadata?.name || '', email:user.email || '', phone:profile?.phone || '',
    total:getCartTotal(), status:'New', paymentStatus, paymentMethod,
    items:cart.map(x=>({id:x.id,name:x.name,price:x.price,qty:x.qty}))
  });
}

async function openCheckout(){
  if(!cart.length){ alert('Your cart is empty.'); return; }
  const user=await getCurrentSupabaseUser();
  if(!user){ location.href='login.html?next=index.html'; return; }
  document.getElementById('paymentTotal').textContent=money(getCartTotal());
  const upi=`upi://pay?pa=${encodeURIComponent(RESTAURANT.upiId)}&pn=${encodeURIComponent(RESTAURANT.upiName)}&am=${getCartTotal().toFixed(2)}&cu=INR`;
  const upiBtn=document.getElementById('upiPayBtn'); if(upiBtn) upiBtn.href=upi;
  const wa=whatsappUrl(cartMessage());
  ['whatsappOrderBtn','modalWhatsAppBtn'].forEach(id=>{const a=document.getElementById(id);if(a)a.href=wa;});
  const modal=document.getElementById('paymentModal'); if(modal){modal.setAttribute('aria-hidden','false');modal.classList.add('open');}
}
function closeCheckout(){const modal=document.getElementById('paymentModal');if(modal){modal.setAttribute('aria-hidden','true');modal.classList.remove('open');}}

async function setupBooking(){
  const form=document.getElementById('bookingForm'); if(!form)return;
  const date=form.querySelector('[name="date"]'); if(date)date.min=new Date().toISOString().slice(0,10);
  form.addEventListener('submit',async e=>{
    e.preventDefault(); const data=new FormData(form); const booking=Object.fromEntries(data.entries());
    try{
      await saveBooking(booking);
      const message=`Hello ${RESTAURANT.name}, I want to book a ${booking.type}.\n\nName: ${booking.name}\nPhone: ${booking.phone}\nDate: ${booking.date}\nTime: ${booking.time}\nGuests: ${booking.guests}\nEvent/Request: ${booking.event || 'None'}`;
      document.getElementById('bookingStatus').innerHTML=`Booking saved. <a target="_blank" href="${whatsappUrl(message)}">Send details on WhatsApp →</a>`;
      form.reset();
    }catch(err){document.getElementById('bookingStatus').textContent=err.message || 'Booking failed. Please try again.';}
  });
}

async function initRestaurantPage(){
  document.querySelectorAll('[data-wa]').forEach(a=>a.href=whatsappUrl(`Hello ${RESTAURANT.name}, I would like to place an order.`));
  document.querySelectorAll('[data-phone]').forEach(a=>{a.textContent=RESTAURANT.phone;a.href=`tel:${RESTAURANT.phone.replace(/\s/g,'')}`;});
  document.querySelectorAll('[data-address]').forEach(el=>el.textContent=RESTAURANT.address);
  document.querySelectorAll('[data-hours]').forEach(el=>el.textContent=RESTAURANT.hours);
  try{await loadMenuFromSupabase();renderMenu();}catch(err){console.error(err);const grid=document.getElementById('menu-grid');if(grid)grid.innerHTML='<div class="empty-cart" style="grid-column:1/-1;padding:30px;text-align:center">Unable to load the live menu right now.</div>';}
  renderCart(); await setupBooking();
  document.querySelectorAll('.add-cart').forEach(b=>b.addEventListener('click',()=>addToCart(Number(b.dataset.id))));
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const q=document.getElementById('menuQty-'+b.dataset.id);if(!q)return;let v=Number(q.textContent||1)+(b.dataset.action==='plus'?1:-1);q.textContent=Math.max(1,v);}));
  document.querySelectorAll('[data-cat]').forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.cat;document.querySelectorAll('.menu-card').forEach(c=>c.style.display=(f==='all'||c.dataset.cat===f)?'':'none');document.querySelectorAll('.category-row button').forEach(x=>x.classList.remove('active'));b.classList.add('active');}));
  const cartPanel=document.getElementById('cartPanel');
  document.getElementById('cartFab')?.addEventListener('click',()=>cartPanel?.classList.add('open'));
  document.getElementById('closeCart')?.addEventListener('click',()=>cartPanel?.classList.remove('open'));
  document.getElementById('checkoutBtn')?.addEventListener('click',openCheckout);
  document.getElementById('closePayment')?.addEventListener('click',closeCheckout);
  document.getElementById('showQrBtn')?.addEventListener('click',()=>document.getElementById('qrArea')?.removeAttribute('hidden'));
  document.getElementById('modalWhatsAppBtn')?.addEventListener('click',async()=>{try{await placeOrder('WhatsApp', 'Pending');cart=[];saveCart();renderCart();closeCheckout();}catch(e){alert(e.message);}});
  document.getElementById('whatsappOrderBtn')?.addEventListener('click',async()=>{try{await placeOrder('WhatsApp','Pending');cart=[];saveCart();renderCart();}catch(e){e.preventDefault();alert(e.message);}});
  document.getElementById('confirmPaymentBtn')?.addEventListener('click',async()=>{try{await placeOrder('UPI','Customer marked paid');cart=[];saveCart();renderCart();closeCheckout();alert('Order saved. Please send the payment screenshot on WhatsApp.');}catch(e){alert(e.message);}});
}

document.addEventListener('DOMContentLoaded',initRestaurantPage);
