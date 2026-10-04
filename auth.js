/* Datta Restaurant - Supabase Authentication */
const SUPABASE_URL = 'https://sesclkmmmbtmewxbjryj.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_u6eNidG8pohT-hK7rTRliA_eO0rxXIP';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function getCurrentSupabaseUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

async function getProfile(userId) {
  const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) { console.error('Profile error:', error); return null; }
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
    phone: profile?.phone || user.user_metadata?.phone || '',
    role: profile?.role || 'customer'
  };
}

async function signup(name, email, phone, password) {
  name = name.trim(); email = email.trim().toLowerCase(); phone = phone.trim();
  const { data, error } = await supabaseClient.auth.signUp({
    email, password, options: { data: { name, phone } }
  });
  if (error) throw error;
  if (data.user) {
    const { error: profileError } = await supabaseClient.from('profiles').upsert({
      id: data.user.id, name, phone, email, role: 'customer'
    });
    if (profileError) console.error('Profile creation error:', profileError);
  }
  return data.user;
}

async function login(email, password) {
  email = email.trim().toLowerCase();
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const profile = await getProfile(data.user.id);
  return { user: data.user, role: profile?.role || 'customer', profile };
}

async function logout() {
  await supabaseClient.auth.signOut();
  location.href = 'index.html';
}

async function requireAuth(role) {
  const user = await getCurrentSupabaseUser();
  if (!user) {
    location.href = 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop());
    return null;
  }
  const profile = await getProfile(user.id);
  const actualRole = profile?.role || 'customer';
  if (role && actualRole !== role) {
    location.href = 'index.html';
    return null;
  }
  return {
    id: user.id,
    name: profile?.name || user.user_metadata?.name || 'User',
    email: user.email || '',
    phone: profile?.phone || user.user_metadata?.phone || '',
    role: actualRole
  };
}

async function saveOrder(order) {
  const user = await getCurrentSupabaseUser();
  if (!user) throw new Error('Please login before placing an order.');
  const payload = { user_id:user.id, customer_name:order.customerName || '', email:order.email || user.email || '', phone:order.phone || '', total:Number(order.total || 0), status:order.status || 'New', created_at:order.createdAt || new Date().toISOString() };
  let result = await supabaseClient.from('orders').insert({ ...payload, payment_status:order.paymentStatus || 'Pending', payment_method:order.paymentMethod || 'WhatsApp/UPI' }).select().single();
  if (result.error && /payment_(status|method)|column/i.test(result.error.message || '')) result = await supabaseClient.from('orders').insert(payload).select().single();
  const { data, error } = result;
  if (error) throw error;

  if (order.items?.length) {
    const items = order.items.map(item => ({
      order_id: data.id, product_id: String(item.id), name: item.name,
      price: Number(item.price || 0), quantity: Number(item.qty || 1)
    }));
    const { error: itemError } = await supabaseClient.from('order_items').insert(items);
    if (itemError) throw itemError;
  }
  return data;
}

async function saveBooking(booking) {
  const user = await getCurrentSupabaseUser();
  if (!user) throw new Error('Please login before booking.');
  const { data, error } = await supabaseClient.from('bookings').insert({
    user_id: user.id, name: booking.name || '', phone: booking.phone || '',
    date: booking.date || '', time: booking.time || '', guests: Number(booking.guests || 1),
    type: booking.type || 'Table', event: booking.event || '', status: 'New',
    created_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data;
}

async function userOrders() {
  const user = await getCurrentSupabaseUser();
  if (!user) return [];
  const { data, error } = await supabaseClient.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

async function initAccountLink() {
  const a = document.getElementById('accountLink');
  if (!a) return;
  const user = await getCurrentSupabaseUser();
  if (!user) { a.textContent = '👤 Login'; a.href = 'login.html'; return; }
  const profile = await getProfile(user.id);
  if (profile?.role === 'admin') { a.textContent = '⚙ Admin Panel'; a.href = 'admin.html'; }
  else { a.textContent = '👤 ' + (profile?.name || user.user_metadata?.name || 'Account').split(' ')[0]; a.href = 'login.html?account=1'; }
}

document.addEventListener('DOMContentLoaded', initAccountLink);
