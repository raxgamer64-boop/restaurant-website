const RESTAURANT = {
  name: 'Datta Restaurant',
  whatsapp: '919546320565',
  phone: '+919546320565',
  address: 'Ambedkar Chowk, Maheshpur, Pakur, Jharkhand, India',
  hours: 'Mon–Sun · 11:00 AM – 11:00 PM',
  maps: 'https://www.google.com/maps/search/?api=1&query=Ambedkar%20Chowk%20Maheshpur%20Pakur%20Jharkhand%20India',
  // Add the restaurant's public Razorpay Payment Link here when available.
  paymentLink: ''
};

const MENU = [
  {id:1, name:'Paneer Tikka', price:249, cat:'starters', desc:'Char-grilled paneer, peppers & mint chutney'},
  {id:2, name:'Butter Chicken', price:349, cat:'mains', desc:'Tender chicken in a creamy tomato gravy'},
  {id:3, name:'Chicken Biryani', price:329, cat:'biryani', desc:'Fragrant basmati rice, spices & slow-cooked chicken'},
  {id:4, name:'Dal Makhani', price:229, cat:'mains', desc:'Slow-cooked black lentils, butter & cream'},
  {id:5, name:'Tandoori Chicken', price:319, cat:'starters', desc:'Yogurt-marinated chicken from the tandoor'},
  {id:6, name:'Mango Lassi', price:129, cat:'drinks', desc:'Chilled mango, yogurt & cardamom'}
];

const CART_KEY = 'datta_restaurant_cart';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

function waUrl(message){
  return 'https://wa.me/' + RESTAURANT.whatsapp + '?text=' + encodeURIComponent(message);
}
function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); renderCart(); }
function addToCart(id){
  const item = cart.find(x=>x.id===id);
  if(item) item.qty++; else { const m=MENU.find(x=>x.id===id); if(m) cart.push({...m,qty:1}); }
  saveCart(); openCart();
}
function changeQty(id, delta){
  const item=cart.find(x=>x.id===id); if(!item) return;
  item.qty += delta; if(item.qty<=0) cart=cart.filter(x=>x.id!==id); saveCart();
}
function renderCart(){
  const count=cart.reduce((a,x)=>a+x.qty,0);
  const total=cart.reduce((a,x)=>a+x.price*x.qty,0);
  const countEl=document.getElementById('cartCount');
  const totalEl=document.getElementById('cartTotal');
  const list=document.getElementById('cartItems');
  const checkout=document.getElementById('checkoutBtn');
  if(countEl) countEl.textContent=count;
  if(totalEl) totalEl.textContent='₹'+total;
  if(list) list.innerHTML=cart.length ? cart.map(x=>`<div class="cart-row"><div><b>${x.name}</b><small>₹${x.price} each</small></div><div class="qty"><button onclick="changeQty(${x.id},-1)">−</button><span>${x.qty}</span><button onclick="changeQty(${x.id},1)">+</button></div></div>`).join('') : '<div class="empty-cart">Your order is empty.<br><small>Add dishes from the menu.</small></div>';
  if(checkout){
    checkout.href=waUrl(`Hello ${RESTAURANT.name}, I would like to place an order:\n\n${cart.map(x=>`${x.name} x ${x.qty} = ₹${x.price*x.qty}`).join('\n')}\n\nTotal: ₹${total}\n\nPlease confirm availability and delivery/pickup details.`);
  }
}
function openCart(){document.getElementById('cartPanel')?.classList.add('open')}
function closeCart(){document.getElementById('cartPanel')?.classList.remove('open')}

function setupBooking(){
  const form=document.getElementById('bookingForm');
  if(!form) return;
  const date=form.querySelector('[name="date"]');
  if(date) date.min=new Date().toISOString().split('T')[0];
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const data=new FormData(form);
    const type=data.get('type');
    const msg=`Hello ${RESTAURANT.name}, I want to book ${type === 'Private Room' ? 'a private room' : 'a table'}.\n\nName: ${data.get('name')}\nPhone: ${data.get('phone')}\nDate: ${data.get('date')}\nTime: ${data.get('time')}\nGuests: ${data.get('guests')}\nBooking type: ${type}${data.get('event') ? `\nEvent/requirements: ${data.get('event')}` : ''}\n\nPlease confirm availability.`;
    document.getElementById('bookingStatus').textContent='Opening WhatsApp…';
    window.open(waUrl(msg),'_blank');
  });
}

function setupPayment(){
  const pay=document.getElementById('payAdvanceBtn');
  const note=document.getElementById('paymentNote');
  if(!pay) return;
  if(RESTAURANT.paymentLink){ pay.href=RESTAURANT.paymentLink; pay.style.display='inline-flex'; if(note) note.textContent='Pay the advance securely through the restaurant payment page.'; }
  else { pay.style.display='none'; if(note) note.textContent='Online advance payment can be activated after the restaurant owner adds their Razorpay Payment Link.'; }
}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.add-cart').forEach(btn=>btn.addEventListener('click',()=>{
    const id=Number(btn.dataset.id);
    addToCart(id, getMenuQty(id));
  }));
  document.querySelectorAll('.menu-qty-btn').forEach(btn=>btn.addEventListener('click',()=>{
    const id=Number(btn.dataset.id);
    const current=getMenuQty(id);
    setMenuQty(id, btn.dataset.action==='plus' ? current+1 : current-1);
  }));
  document.getElementById('cartFab')?.addEventListener('click',openCart);
  document.getElementById('closeCart')?.addEventListener('click',closeCart);
  document.querySelectorAll('.tabs button').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); const cat=btn.dataset.cat;
    document.querySelectorAll('.food').forEach(card=>card.style.display=(cat==='all'||card.dataset.cat===cat)?'grid':'none');
  }));
  document.querySelector('.menu-btn')?.addEventListener('click',()=>document.querySelector('.nav nav')?.classList.toggle('mobile-open'));
  document.querySelectorAll('.nav nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.nav nav')?.classList.remove('mobile-open')));
  window.addEventListener('scroll',()=>document.querySelector('.nav')?.classList.toggle('scrolled',scrollY>20));
  setupBooking(); setupPayment(); renderCart();
  document.querySelectorAll('[data-name]').forEach(el=>el.textContent=RESTAURANT.name);
  document.querySelectorAll('[data-phone]').forEach(el=>{el.textContent=RESTAURANT.phone; el.href='tel:'+RESTAURANT.phone;});
  document.querySelectorAll('[data-wa]').forEach(el=>el.href=waUrl(`Hello ${RESTAURANT.name}, I would like to know more.`));
  document.querySelectorAll('[data-address]').forEach(el=>el.textContent=RESTAURANT.address);
  document.querySelectorAll('[data-hours]').forEach(el=>el.textContent=RESTAURANT.hours);
  document.querySelectorAll('[data-maps]').forEach(el=>el.href=RESTAURANT.maps);
});
