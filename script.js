/* Page-specific interactions */
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav nav');
  menuBtn?.addEventListener('click', () => nav?.classList.toggle('mobile-open'));
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('mobile-open')));

  document.querySelectorAll('.slider-left').forEach(b => b.addEventListener('click', () => document.getElementById('famousSlider')?.scrollBy({left:-500,behavior:'smooth'})));
  document.querySelectorAll('.slider-right').forEach(b => b.addEventListener('click', () => document.getElementById('famousSlider')?.scrollBy({left:500,behavior:'smooth'})));

  const modal = document.getElementById('paymentModal');
  modal?.addEventListener('click', e => { if(e.target === modal) closeCheckout(); });
});
