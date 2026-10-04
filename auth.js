/* Datta Restaurant - Supabase Authentication
   v3: single non-TDZ global client. */
(function () {
  const URL = 'https://sesclkmmmbtmewxbjryj.supabase.co';
  const KEY = 'sb_publishable_u6eNidG8pohT-hK7rTRliA_eO0rxXIP';
  if (!window.supabase || !window.supabase.createClient) {
    console.error('Supabase SDK did not load.');
    return;
  }
  if (!window.dattaSupabaseClient) {
    window.dattaSupabaseClient = window.supabase.createClient(URL, KEY);
  }
  window.supabaseClient = window.dattaSupabaseClient;
  // Also expose a stable getter used by every page. Never use a lexical `supabaseClient` variable.
  window.getDattaSupabase = function () { return window.dattaSupabaseClient; };
})();

async function getCurrentSupabaseUser() {
  const client = window.dattaSupabaseClient;
  if (!client) throw new Error('Supabase is not initialized. Please refresh the page.');
  const { data, error } = await client.auth.getUser();
  if (error || !data || !data.user) return null;
  return data.user;
}

async function getProfile(userId) {
  const client = window.dattaSupabaseClient;
  if (!client) throw new Error('Supabase is not initialized.');
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) {
    console.error('Profile error:', error);
    return null;
  }
  return data;
}

async function currentUser() {
  const user = await getCurrentSupabaseUser();
  if (!user) return null;
  const profile = await getProfile(user.id);
  return {
    id: user.id,
    name: profile?.name || user.user_metadata?.name || 'Customer',
    email: user.email || profile?.email || '',
    phone: profile?.phone || '',
    role: profile?.role || 'customer'
  };
}

function getSession() { return null; }
function setSession() {}

async function signup(name, email, phone, password) {
  const client = window.dattaSupabaseClient;
  if (!client) throw new Error('Supabase is not initialized.');
  email = email.trim().toLowerCase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { name, phone: phone || '' } }
  });
  if (error) throw error;
  if (data.user) {
    const { error: profileError } = await client.from('profiles').upsert({
      id: data.user.id, name, phone: phone || '', email, role: 'customer'
    });
    if (profileError) console.error('Profile creation error:', profileError);
  }
  return data.user;
}

async function login(email, password) {
  const client = window.dattaSupabaseClient;
  if (!client) throw new Error('Supabase is not initialized.');
  email = email.trim().toLowerCase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

async function logout() {
  if (window.dattaSupabaseClient) await window.dattaSupabaseClient.auth.signOut();
  location.href = 'index.html';
}

async function requireAuth(role) {
  const user = await getCurrentSupabaseUser();
  if (!user) {
    location.href = 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop());
    return null;
  }
  const profile = await getProfile(user.id);
  if (role && (!profile || profile.role !== role)) {
    location.href = 'index.html';
    return null;
  }
  return {
    id: user.id,
    name: profile?.name || user.user_metadata?.name || 'User',
    email: user.email || '',
    phone: profile?.phone || '',
    role: profile?.role || 'customer'
  };
}

async function saveOrder(order) {
  const client = window.dattaSupabaseClient;
  const user = await getCurrentSupabaseUser();
  if (!client || !user) throw new Error('Please login before placing an order.');

  const { data, error } = await client.from('orders').insert({
    user_id: user.id,
    customer_name: order.customerName || '',
    email: order.email || user.email || '',
    phone: order.phone || '',
    total: Number(order.total || 0),
    status: order.status || 'New',
    created_at: order.createdAt || new Date().toISOString()
  }).select().single();

  if (error) throw error;

  if (order.items?.length) {
    const items = order.items.map(item => ({
      order_id: data.id,
      product_id: String(item.id),
      name: item.name,
      price: Number(item.price || 0),
      quantity: Number(item.qty || 1)
    }));
    const { error: itemError } = await client.from('order_items').insert(items);
    if (itemError) throw itemError;
  }
  return data;
}

async function saveBooking(booking) {
  const client = window.dattaSupabaseClient;
  const user = await getCurrentSupabaseUser();
  if (!client || !user) throw new Error('Please login before booking.');

  const { data, error } = await client.from('bookings').insert({
    user_id: user.id,
    name: booking.name || '',
    phone: booking.phone || '',
    date: booking.date || '',
    time: booking.time || '',
    guests: Number(booking.guests || 1),
    type: booking.type || 'Table',
    event: booking.event || '',
    status: booking.status || 'New'
  }).select().single();

  if (error) throw error;
  return data;
}

async function userOrders() {
  const client = window.dattaSupabaseClient;
  const user = await getCurrentSupabaseUser();
  if (!client || !user) return [];
  const { data, error } = await client.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) { console.error('Orders error:', error); return []; }
  return data || [];
}

async function initAccountLink() {
  const a = document.getElementById('accountLink');
  if (!a) return;
  try {
    const user = await getCurrentSupabaseUser();
    if (!user) {
      a.textContent = '👤 Login';
      a.href = 'login.html';
      return;
    }
    const profile = await getProfile(user.id);
    if (profile?.role === 'admin') {
      a.textContent = '⚙ Admin Panel';
      a.href = 'admin.html';
    } else {
      const firstName = profile?.name || user.user_metadata?.name || 'Account';
      a.textContent = '👤 ' + firstName.split(' ')[0];
      a.href = 'login.html?account=1';
    }
  } catch (e) {
    console.error('Account link error:', e);
  }
}
document.addEventListener('DOMContentLoaded', initAccountLink);
