/* Datta Restaurant - customer/admin account layer.
   Demo mode works on GitHub Pages using localStorage.
   For production, replace the storage layer with Firebase/Supabase Auth + database. */
const AUTH_USERS_KEY='datta_auth_users';
const AUTH_SESSION_KEY='datta_auth_session';
const ORDERS_KEY='datta_orders';
const BOOKINGS_KEY='datta_bookings';
const ADMIN_EMAIL='admin@datta.local';
const ADMIN_PASSWORD='Datta@123';

function getUsers(){return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)||'[]')}
function saveUsers(v){localStorage.setItem(AUTH_USERS_KEY,JSON.stringify(v))}
function getSession(){return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY)||'null')}
function setSession(v){if(v)localStorage.setItem(AUTH_SESSION_KEY,JSON.stringify(v));else localStorage.removeItem(AUTH_SESSION_KEY)}
function currentUser(){return getSession()}
function hashLite(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
function signup(name,email,phone,password){email=email.trim().toLowerCase();let users=getUsers();if(users.some(u=>u.email===email))throw Error('Email already registered');const user={id:'u_'+Date.now(),name,email,phone:phone||'',password:hashLite(password),role:'customer',createdAt:new Date().toISOString()};users.push(user);saveUsers(users);setSession({id:user.id,name:user.name,email:user.email,phone:user.phone,role:user.role});return user}
function login(email,password){email=email.trim().toLowerCase();if(email===ADMIN_EMAIL&&password===ADMIN_PASSWORD){const a={id:'admin',name:'Datta Admin',email,phone:RESTAURANT.phone,role:'admin'};setSession(a);return a}const user=getUsers().find(u=>u.email===email&&u.password===hashLite(password));if(!user)throw Error('Email or password is incorrect');const s={id:user.id,name:user.name,email:user.email,phone:user.phone,role:user.role};setSession(s);return s}
function logout(){setSession(null);location.href='index.html'}
function requireAuth(role){const u=currentUser();if(!u){location.href='login.html?next='+encodeURIComponent(location.pathname.split('/').pop());return null}if(role&&u.role!==role){location.href='index.html';return null}return u}
function saveOrder(order){const all=JSON.parse(localStorage.getItem(ORDERS_KEY)||'[]');all.unshift(order);localStorage.setItem(ORDERS_KEY,JSON.stringify(all))}
function saveBooking(booking){const all=JSON.parse(localStorage.getItem(BOOKINGS_KEY)||'[]');all.unshift(booking);localStorage.setItem(BOOKINGS_KEY,JSON.stringify(all))}
function userOrders(){const u=currentUser();return JSON.parse(localStorage.getItem(ORDERS_KEY)||'[]').filter(x=>!u||u.role==='admin'||x.userId===u.id)}
function initAccountLink(){const a=document.getElementById('accountLink');if(!a)return;const u=currentUser();if(u){a.textContent=u.role==='admin'?'⚙ Admin Panel':'👤 '+u.name.split(' ')[0];a.href=u.role==='admin'?'admin.html':'login.html?account=1';a.title='Account';}}
document.addEventListener('DOMContentLoaded',initAccountLink);
