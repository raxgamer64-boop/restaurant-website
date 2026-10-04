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

/*
  Supabase menu cache.
  Website will keep the existing design while menu data
  is loaded from Supabase.
*/

let MENU = [];

async function loadMenuFromSupabase() {
  try {
    if (
      typeof supabaseClient === 'undefined' ||
      !supabaseClient
    ) {
      console.error('Supabase client not available.');
      return [];
    }

    const { data, error } = await supabaseClient
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('id', { ascending: true });

    if (error) {
      console.error('Menu loading error:', error);
      return [];
    }

    MENU = (data || []).map(item => ({
      id: Number(item.id),
      name: item.name || '',
      price: Number(item.price || 0),
      cat: item.category || 'mains',
      desc: item.description || '',
      image_url: item.image_url || ''
    }));

    return MENU;

  } catch (error) {
    console.error('Menu loading failed:', error);
    return [];
  }
}


const CART_KEY = 'datta_restaurant_cart';

let cart = JSON.parse(
  localStorage.getItem(CART_KEY) || '[]'
);


function waUrl(message) {
  return (
    'https://wa.me/' +
    RESTAURANT.whatsapp +
    '?text=' +
    encodeURIComponent(message)
  );
}


function saveCart() {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );

  renderCart();
}


function addToCart(id, qty = 1) {

  qty = Math.max(
    1,
    Number(qty) || 1
  );

  const item = cart.find(
    x => x.id === id
  );

  if (item) {

    item.qty += qty;

  } else {

    const menuItem = MENU.find(
      x => x.id === id
    );

    if (menuItem) {

      cart.push({
        ...menuItem,
        qty
      });

    }

  }

  saveCart();
  openCart();
}


const menuQty = {};


function getMenuQty(id) {
  return menuQty[id] || 1;
}


function setMenuQty(id, qty) {

  qty = Math.max(
    1,
    Math.min(
      99,
      Number(qty) || 1
    )
  );

  menuQty[id] = qty;

  const el = document.getElementById(
    'menuQty-' + id
  );

  if (el) {
    el.textContent = qty;
  }
}


function upiUrl(
  amount,
  note = 'Datta Restaurant Order'
) {

  const p = new URLSearchParams({
    pa: RESTAURANT.upiId,
    pn: RESTAURANT.upiName,
    cu: 'INR'
  });

  if (Number(amount) > 0) {
    p.set(
      'am',
      Number(amount).toFixed(2)
    );
  }

  p.set('tn', note);

  return 'upi://pay?' + p.toString();
}


function changeQty(id, delta) {

  const item = cart.find(
    x => x.id === id
  );

  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {

    cart = cart.filter(
      x => x.id !== id
    );

  }

  saveCart();
}


async function renderCart() {

  const count = cart.reduce(
    (a, x) => a + x.qty,
    0
  );

  const total = cart.reduce(
    (a, x) => a + x.price * x.qty,
    0
  );


  const cartCount =
    document.getElementById('cartCount');

  const cartTotal =
    document.getElementById('cartTotal');

  if (cartCount) {
    cartCount.textContent = count;
  }

  if (cartTotal) {
    cartTotal.textContent = '₹' + total;
  }


  const list =
    document.getElementById('cartItems');


  if (list) {

    list.innerHTML = cart.length
      ? cart.map(x => `
          <div class="cart-row">
            <div>
              <b>${x.name}</b>
              <small>₹${x.price} each</small>
            </div>

            <div class="cart-qty">
              <button onclick="changeQty(${x.id},-1)">−</button>
              <span>${x.qty}</span>
              <button onclick="changeQty(${x.id},1)">+</button>
            </div>
          </div>
        `).join('')

      : `
        <div class="empty-cart">
          Your order is empty.
          <br>
          <small>Add dishes from the menu.</small>
        </div>
      `;

  }


  const msg =
`Hello ${RESTAURANT.name}, I would like to place an order:

${cart.map(
  x => `${x.name} x ${x.qty} = ₹${x.price * x.qty}`
).join('\n')}

Total: ₹${total}

Please confirm availability and delivery/pickup details.`;


  const checkoutBtn =
    document.getElementById('checkoutBtn');

  const whatsappOrderBtn =
    document.getElementById('whatsappOrderBtn');

  if (checkoutBtn) {
    checkoutBtn.disabled = !cart.length;
  }

  if (whatsappOrderBtn) {
    whatsappOrderBtn.href = waUrl(msg);
  }


  const paymentTotal =
    document.getElementById('paymentTotal');

  if (paymentTotal) {
    paymentTotal.textContent =
      '₹' + total;
  }


  const upiPayBtn =
    document.getElementById('upiPayBtn');

  if (upiPayBtn) {
    upiPayBtn.href =
      upiUrl(
        total,
        `Order ${RESTAURANT.name} - ₹${total}`
      );
  }


  const modalWhatsAppBtn =
    document.getElementById(
      'modalWhatsAppBtn'
    );

  if (modalWhatsAppBtn) {
    modalWhatsAppBtn.href =
      waUrl(msg);
  }

}


function openCart() {

  const panel =
    document.getElementById('cartPanel');

  if (panel) {
    panel.classList.add('open');
  }

}


function closeCart() {

  const panel =
    document.getElementById('cartPanel');

  if (panel) {
    panel.classList.remove('open');
  }

}


function setupBooking() {

  const form =
    document.getElementById('bookingForm');

  if (!form) return;


  const date =
    form.querySelector('[name="date"]');

  if (date) {

    date.min =
      new Date()
        .toISOString()
        .split('T')[0];

  }


  form.addEventListener(
    'submit',
    async e => {

      e.preventDefault();

      const d =
        new FormData(form);

      const booking = {

        name: d.get('name'),

        phone: d.get('phone'),

        date: d.get('date'),

        time: d.get('time'),

        guests: d.get('guests'),

        type: d.get('type'),

        event: d.get('event') || '',

        createdAt:
          new Date().toISOString(),

        status: 'New'

      };


      try {

        await saveBooking(booking);

        const msg =
`Hello ${RESTAURANT.name}, I want to book ${
  d.get('type') === 'Private Room'
    ? 'a private room'
    : 'a table'
}.

Name: ${d.get('name')}
Phone: ${d.get('phone')}
Date: ${d.get('date')}
Time: ${d.get('time')}
Guests: ${d.get('guests')}
Booking type: ${d.get('type')}${
  d.get('event')
    ? `\nEvent/requirements: ${d.get('event')}`
    : ''
}

Please confirm availability.`;


        const status =
          document.getElementById(
            'bookingStatus'
          );

        if (status) {
          status.textContent =
            'Opening WhatsApp…';
        }


        window.open(
          waUrl(msg),
          '_blank'
        );

      } catch (error) {

        console.error(
          'Booking error:',
          error
        );

        const status =
          document.getElementById(
            'bookingStatus'
          );

        if (status) {

          status.textContent =
            error.message ||
            'Please login before booking.';

        }

      }

    }
  );

}


function setupPayment() {

  const modal =
    document.getElementById(
      'paymentModal'
    );

  const openBtn =
    document.getElementById(
      'checkoutBtn'
    );

  const closeBtn =
    document.getElementById(
      'closePayment'
    );

  const qrBtn =
    document.getElementById(
      'showQrBtn'
    );

  const qrArea =
    document.getElementById(
      'qrArea'
    );

  const confirm =
    document.getElementById(
      'confirmPaymentBtn'
    );


  if (
    !modal ||
    !openBtn ||
    !closeBtn ||
    !qrBtn ||
    !qrArea ||
    !confirm
  ) {
    return;
  }


  const open = () => {

    if (!cart.length) return;

    modal.classList.add('open');

    modal.setAttribute(
      'aria-hidden',
      'false'
    );

    qrArea.hidden = true;

    renderCart();

  };


  const close = () => {

    modal.classList.remove(
      'open'
    );

    modal.setAttribute(
      'aria-hidden',
      'true'
    );

  };


  openBtn.addEventListener(
    'click',
    open
  );

  closeBtn.addEventListener(
    'click',
    close
  );


  modal.addEventListener(
    'click',
    e => {

      if (e.target === modal) {
        close();
      }

    }
  );


  qrBtn.addEventListener(
    'click',
    () => {
      qrArea.hidden =
        !qrArea.hidden;
    }
  );


  confirm.addEventListener(
    'click',
    async () => {

      const total =
        cart.reduce(
          (a, x) =>
            a + x.price * x.qty,
          0
        );


      const orderText =
        cart.map(
          x =>
            `${x.name} x ${x.qty} = ₹${x.price * x.qty}`
        ).join('\n');


      try {

        await saveOrder({

          customerName: '',

          email: '',

          phone: '',

          items:
            cart.map(x => ({
              id: x.id,
              name: x.name,
              price: x.price,
              qty: x.qty
            })),

          total,

          status:
            'Paid - Awaiting confirmation',

          createdAt:
            new Date().toISOString()

        });


        window.open(
          waUrl(
`Hello ${RESTAURANT.name}, I have made the UPI payment for my order.

${orderText}

Total paid: ₹${total}
UPI ID: ${RESTAURANT.upiId}

I am sending the payment screenshot for confirmation.`
          ),
          '_blank'
        );


      } catch (error) {

        alert(
          error.message ||
          'Please login before placing the order.'
        );

      }

    }
  );

}


async function initRestaurantPage() {

  await loadMenuFromSupabase();

  renderCart();

  setupBooking();

  setupPayment();


  document
    .querySelectorAll('.add-cart')
    .forEach(button => {

      button.addEventListener(
        'click',
        () => {

          addToCart(
            Number(button.dataset.id),
            getMenuQty(
              Number(button.dataset.id)
            )
          );

        }
      );

    });


  document
    .querySelectorAll('[data-action]')
    .forEach(button => {

      button.addEventListener(
        'click',
        () => {

          const id =
            Number(button.dataset.id);

          setMenuQty(
            id,
            getMenuQty(id) +
              (
                button.dataset.action ===
                'plus'
                  ? 1
                  : -1
              )
          );

        }
      );

    });


  const cartFab =
    document.getElementById(
      'cartFab'
    );

  if (cartFab) {
    cartFab.addEventListener(
      'click',
      openCart
    );
  }


  const closeCartBtn =
    document.getElementById(
      'closeCart'
    );

  if (closeCartBtn) {
    closeCartBtn.addEventListener(
      'click',
      closeCart
    );
  }


  document
    .querySelectorAll('.category-row button')
    .forEach(button => {

      button.addEventListener(
        'click',
        () => {

          document
            .querySelectorAll(
              '.category-row button'
            )
            .forEach(
              x =>
                x.classList.remove(
                  'active'
                )
            );


          button.classList.add(
            'active'
          );


          const cat =
            button.dataset.cat;


          document
            .querySelectorAll(
              '.menu-card'
            )
            .forEach(card => {

              card.style.display =
                cat === 'all'
                  ? 'block'
                  : (
                      card.dataset.cat ===
                      cat
                        ? 'block'
                        : 'none'
                    );

            });

        }
      );

    });


  const menuBtn =
    document.querySelector(
      '.menu-btn'
    );

  if (menuBtn) {

    menuBtn.addEventListener(
      'click',
      () => {

        const nav =
          document.querySelector(
            '.nav nav'
          );

        if (nav) {
          nav.classList.toggle(
            'mobile-open'
          );
        }

      }
    );

  }


  document
    .querySelectorAll('.nav nav a')
    .forEach(a => {

      a.addEventListener(
        'click',
        () => {

          const nav =
            document.querySelector(
              '.nav nav'
            );

          if (nav) {
            nav.classList.remove(
              'mobile-open'
            );
          }

        }
      );

    });


  const slider =
    document.getElementById(
      'famousSlider'
    );


  const left =
    document.querySelector(
      '.slider-left'
    );

  const right =
    document.querySelector(
      '.slider-right'
    );


  if (slider && left) {

    left.addEventListener(
      'click',
      () => {

        slider.scrollBy({
          left: -340,
          behavior: 'smooth'
        });

      }
    );

  }


  if (slider && right) {

    right.addEventListener(
      'click',
      () => {

        slider.scrollBy({
          left: 340,
          behavior: 'smooth'
        });

      }
    );

  }


  document
    .querySelectorAll('[data-wa]')
    .forEach(a => {

      a.href =
        waUrl(
          `Hello ${RESTAURANT.name}, I would like to know more.`
        );

    });


  document
    .querySelectorAll('[data-phone]')
    .forEach(a => {

      a.textContent =
        RESTAURANT.phone;

      a.href =
        'tel:' +
        RESTAURANT.phone;

    });


  document
    .querySelectorAll('[data-address]')
    .forEach(e => {

      e.textContent =
        RESTAURANT.address;

    });


  document
    .querySelectorAll('[data-hours]')
    .forEach(e => {

      e.textContent =
        RESTAURANT.hours;

    });

}


document.addEventListener(
  'DOMContentLoaded',
  initRestaurantPage
);
