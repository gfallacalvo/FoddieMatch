// Utilidades DOM
function $(sel) { return document.querySelector(sel); }
function $all(sel) { return document.querySelectorAll(sel); }
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }
function fadeOverlay(showing) {
  const ov = $('#overlay');
  if (showing) { ov.classList.remove('hidden'); }
  else { ov.classList.add('hidden'); }
}

// ------- Toast notifications ---------
function showToast(msg, time = 2600) {
  const toast = $('#toast');
  toast.innerHTML = msg;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, time);
}

// ------- Modo oscuro/tema ---------
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('foodiematch-theme', theme);
  $('#theme-icon').textContent = theme === "dark" ? "🌙" : "☀️";
}
function toggleTheme() {
  const curr = document.documentElement.getAttribute('data-theme');
  setTheme(curr === "dark" ? "light" : "dark");
}
$('#toggle-theme').addEventListener('click', toggleTheme);
setTheme(localStorage.getItem('foodiematch-theme') || (prefersDark ? "dark" : "light"));

// ------- Datos de demo ---------
const platosData = [
  {nombre:"Ajiaco Santafereño",descr:"Tradición en cada cucharada, perfecto para días fríos.",img:"ajiaco.jpg"},
  {nombre:"Changua Boyacense",descr:"Desayuno reconfortante típico de Boyacá.",img:"changua.jpg"},
  {nombre:"Tamal Tunjeño",descr:"Relleno de sabor, ¡ideal para compartir!",img:"tamal.jpg"},
  {nombre:"Mute Boyacense",descr:"Un guiso abundante para los paladares más exigentes.",img:"silencio.jpg"},
  {nombre:"Arepa de Choclo",descr:"Dulzura y suavidad en cada bocado.",img:"arepa-choclo.jpg"}
];
const demoUsers = [
  {nombre:"Sofía",img:"user2.png",bio:"Fanática de la cocina fusión y el brunch dominguero."},
  {nombre:"Carlos",img:"user1.png",bio:"Amo los sabores tradicionales y los postres."},
  {nombre:"María",img:"user3.png",bio:"Vegana creativa. Siempre busco nuevos restaurantes."},
  {nombre:"Juan",img:"images/user4.jpg",bio:"Chef aficionado. ¿Vamos por un buen ajiaco?"},
  {nombre:"Lucía",img:"images/user5.jpg",bio:"Me encanta descubrir cafés secretos."}
];
const eventosData = [
  {nombre:"Viernes Social FoodieMatch", lugar:"Café Tunja", fecha: proxViernes(19,0)},
  {nombre:"Brunch Dominical", lugar:"Parque Central", fecha: proxDomingo(11,0)}
];
function proxViernes(hora, min) {
  const now = new Date();
  let next = new Date(now);
  next.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
  next.setHours(hora, min, 0, 0);
  if (next < now) next.setDate(next.getDate() + 7);
  return next;
}
function proxDomingo(hora, min) {
  const now = new Date();
  let next = new Date(now);
  next.setDate(now.getDate() + ((0 - now.getDay() + 7) % 7));
  next.setHours(hora, min, 0, 0);
  if (next < now) next.setDate(next.getDate() + 7);
  return next;
}
function formatoFecha(date) {
  const d = new Date(date);
  const opciones = {weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'};
  return d.toLocaleDateString('es-CO', opciones);
}

// ------- Usuarios y sesiones ---------
function hash(str) {let h=0,i,chr;for(i=0;i<str.length;i++){chr=str.charCodeAt(i);h=((h<<5)-h)+chr;h|=0;}return h;}
function getUsers(){return JSON.parse(localStorage.getItem('foodieUsers')||"[]");}
function setUsers(users){localStorage.setItem('foodieUsers',JSON.stringify(users));}
function getUserCount(){return Number(localStorage.getItem('foodieUserCount'))||1200;}
function setUserCount(c){localStorage.setItem('foodieUserCount',String(c));}
function saveSession(email){sessionStorage.setItem('foodieSession',email);}
function getSession(){return sessionStorage.getItem('foodieSession');}
function clearSession(){sessionStorage.removeItem('foodieSession');}
function getUserByEmail(email){return getUsers().find(u=>u.email===email);}
function updateUserCounter(val){$('#user-counter').textContent=`+${val}`;$('#user-counter-form').textContent=`+${val}`;}
updateUserCounter(getUserCount());

// ------- Platos favoritos y votos ---------
function getFavoritos(email){return JSON.parse(localStorage.getItem(`foodieFavs_${email}`)||"[]");}
function setFavoritos(email,favs){localStorage.setItem(`foodieFavs_${email}`,JSON.stringify(favs));}
function getVotos(){return JSON.parse(localStorage.getItem('foodieVotes')||"{}");}
function setVotos(votos){localStorage.setItem('foodieVotes',JSON.stringify(votos));}

// ------- Render platos y eventos ---------
function renderPlatos() {
  const cont = $('#platos-cards');
  cont.innerHTML = '';
  const session = getSession();
  const userFavs = session?getFavoritos(session):[];
  const votos = getVotos();
  platosData.forEach(plato => {
    const fav = userFavs.includes(plato.nombre);
    const votosPlato = votos[plato.nombre]||0;
    const card = document.createElement('article');
    card.className = 'food-card';
    card.tabIndex = 0;
    card.innerHTML = `
      <div class="parallax-img" style="background-image:url('${plato.img}');" data-parallax></div>
      <div class="card-info">
        <h3>${plato.nombre}</h3>
        <p>${plato.descr}</p>
        <div class="card-actions">
          <button class="fav-btn${fav?' faved':''}" title="Favorito" aria-label="Favorito"><span class="emoji">⭐</span></button>
          <button class="vote-btn${session && votos[plato.nombre+'_'+session]?' voted':''}" title="Votar" aria-label="Votar"><span class="emoji">👍</span></button>
          <span class="vote-count" title="Número de votos">${votosPlato}</span>
        </div>
      </div>
    `;
    // Favoritos
    card.querySelector('.fav-btn').onclick = () => {
      if(!session){showToast("Inicia sesión para agregar favoritos");return;}
      let favs = getFavoritos(session);
      const ix = favs.indexOf(plato.nombre);
      if(ix>=0) favs.splice(ix,1);
      else favs.push(plato.nombre);
      setFavoritos(session,favs);
      renderPlatos();
      renderPerfilFavoritos();
      showToast(ix>=0?"Eliminado de favoritos":"¡Añadido a favoritos!");
    };
    // Votos
    card.querySelector('.vote-btn').onclick = () => {
      if(!session){showToast("Inicia sesión para votar");return;}
      let votos = getVotos();
      if(votos[plato.nombre+'_'+session]){showToast("Solo puedes votar una vez"); return;}
      votos[plato.nombre] = (votos[plato.nombre]||0)+1;
      votos[plato.nombre+'_'+session] = 1;
      setVotos(votos);
      renderPlatos();
      renderRanking();
      showToast("¡Gracias por tu voto!");
    };
    cont.appendChild(card);
  });
}
function renderEventos() {
  const ul = $('#lista-eventos');
  ul.innerHTML = '';
  eventosData.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).forEach(ev => {
    ul.innerHTML += `<li><strong>${ev.nombre}:</strong> ${formatoFecha(ev.fecha)} @ ${ev.lugar}</li>`;
  });
}
function renderRanking() {
  // Ranking usuarios (más votos emitidos)
  const users = getUsers().sort((a,b)=>(b.votos||0)-(a.votos||0)).slice(0,5);
  $('#ranking-usuarios').innerHTML = users.map(u=>`<li>${u.nombre} (${u.votos||0} votos)</li>`).join('');
  // Ranking platos
  const votos = getVotos();
  const platosRank = platosData.map(p=>({nombre:p.nombre,votos:votos[p.nombre]||0}))
    .sort((a,b)=>b.votos-a.votos).slice(0,5);
  $('#ranking-platos').innerHTML = platosRank.map(p=>`<li>${p.nombre} (${p.votos})</li>`).join('');
}
function renderPerfilFavoritos() {
  if(!getSession()) return;
  const lista = $('#favoritos-lista');
  const favs = getFavoritos(getSession());
  lista.innerHTML = "";
  if(!favs.length) { lista.innerHTML = "<li>No tienes favoritos aún.</li>"; return;}
  favs.forEach(nomb=>{
    const li = document.createElement('li');
    li.textContent = nomb;
    lista.appendChild(li);
  });
}
function renderPerfilEventos(user) {
  const ul = $('#perfil-eventos');
  ul.innerHTML = '';
  eventosData.forEach(ev => {
    ul.innerHTML += `<li>${ev.nombre} - ${formatoFecha(ev.fecha)}</li>`;
  });
}

// ------- Plato del día -------
const platosDia = platosData.map(p=>p.nombre);
const badge = $('#badge-dia');
const todayPlato = platosDia[(new Date()).getDay() % platosDia.length];
badge.textContent = todayPlato;

// ------- Reloj cuenta regresiva -------
function updateCountdown() {
  const now = new Date();
  const eventos = eventosData.map(ev=>new Date(ev.fecha)).filter(e=>e>now);
  if(eventos.length===0) {
    $('#countdown').textContent = "--:--:--";
    return;
  }
  const prox = eventos.sort((a,b)=>a-b)[0];
  const diff = prox - now;
  let h = String(Math.floor(diff / 3.6e6)).padStart(2, '0');
  let m = String(Math.floor((diff % 3.6e6) / 6e4)).padStart(2, '0');
  let s = String(Math.floor((diff % 6e4) / 1000)).padStart(2, '0');
  $('#countdown').textContent = `${h}:${m}:${s}`;
}
setInterval(updateCountdown, 1000); updateCountdown();

// ------- Parallax y lazy loading -------
function enableParallax() {
  $all('[data-parallax]').forEach(parallax => {
    let bg = parallax.style.backgroundImage;
    parallax.style.backgroundImage = '';
    const observer = new IntersectionObserver(([entry], obs) => {
      if (entry.isIntersecting) {
        parallax.style.backgroundImage = bg;
        obs.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(parallax);
    window.addEventListener('scroll', () => {
      const rect = parallax.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const y = (rect.top - window.innerHeight * 0.5) * 0.18;
        parallax.style.backgroundPosition = `center ${y}px`;
      }
    });
  });
}

// ------- Menú hamburguesa y scrollspy -------
const menuToggle = $('.menu-toggle');
const navLinks = $('.nav-links');
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
});
$all('.nav-links a').forEach(link=>link.addEventListener('click',()=>navLinks.classList.remove('active')));
const sections = $all('main section, #hero');
const navItems = $all('.nav-links a');
window.addEventListener('scroll', () => {
  let fromTop = window.scrollY + 75;
  sections.forEach(section => {
    if (section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop) {
      navItems.forEach(link=>link.classList.remove('active'));
      const id = section.getAttribute('id') || 'hero';
      const nav = document.querySelector('.nav-links a[href="#' + id + '"]');
      if(nav) nav.classList.add('active');
    }
  });
});

// ------- Registro, login y sesión ---------
function updatePerfilUI() {
  const session = getSession();
  $('.perfil-section').classList.toggle('d-none', !session);
  $('.registro-section').classList.toggle('d-none', !!session);
  $('#li-usuario').classList.toggle('d-none', !session);
  $('#li-login').classList.toggle('d-none', !!session);
  $('#li-admin').classList.toggle('d-none', !(session&&getUserByEmail(session).email==="admin@foodiematch.com"));
  if(session) {
    const user = getUserByEmail(session);
    if(user) {
      $('#perfil-nombre').textContent = user.nombre;
      $('#perfil-email').textContent = user.email;
      $('#usuario-link').textContent = user.nombre.split(' ')[0];
      $('#perfil-ultimo-acceso').textContent = user.lastAccess?user.lastAccess:"Primera vez";
      // Invitación
      $('#codigo-invitacion').value = btoa(user.email+":"+user.nombre).slice(0,10)+'-'+user.email.length;
      renderPerfilEventos(user);
      renderPerfilFavoritos();
    }
  }
}
function setLastAccess(email) {
  let users = getUsers();
  const idx = users.findIndex(u=>u.email===email);
  if(idx>=0) {
    users[idx].lastAccess = (new Date()).toLocaleString();
    setUsers(users);
  }
}
$('#form-registro').addEventListener('input', e=>{
  if(e.target.tagName==='INPUT'){
    const errorSpan = e.target.nextElementSibling;
    if(!e.target.validity.valid){
      if(e.target.name==='email') errorSpan.textContent="Ingresa un email válido";
      else if(e.target.name==='nombre') errorSpan.textContent="Nombre requerido (solo letras)";
      else if(e.target.name==='pass') errorSpan.textContent="Mínimo 6 caracteres";
      else errorSpan.textContent="Campo obligatorio";
    } else errorSpan.textContent="";
  }
});
$('#form-registro').addEventListener('submit', e=>{
  e.preventDefault();
  const f = e.target;
  const nombre = f.nombre.value.trim();
  const email = f.email.value.trim().toLowerCase();
  const pass = f.pass.value;
  if(!nombre || !email || !pass) return;
  if(getUserByEmail(email)) {f.email.nextElementSibling.textContent="Este email ya está registrado.";return;}
  let users = getUsers();
  users.push({nombre,email,pass:hash(pass),lastAccess:(new Date()).toLocaleString(),votos:0});
  setUsers(users);
  let n = getUserCount()+1; setUserCount(n); updateUserCounter(n);
  saveSession(email);
  setLastAccess(email);
  updatePerfilUI();
  f.reset();
  showToast("¡Registro exitoso!");
  window.location.hash="#perfil";
});
$('#btn-logout').addEventListener('click', ()=>{
  clearSession();
  updatePerfilUI();
  showToast("Sesión cerrada.");
  window.location.hash="#hero";
});

// Login modal
function openLoginModal() { show($('#modal-login')); fadeOverlay(true); $('#form-login').reset(); $all('#form-login .error').forEach(e=>e.textContent=""); }
function closeLoginModal() { hide($('#modal-login')); fadeOverlay(false);}
$('#abrir-login').addEventListener('click',e=>{e.preventDefault();openLoginModal();});
$('#abrir-login-link').addEventListener('click',e=>{e.preventDefault();openLoginModal();});
$('#close-login').addEventListener('click',closeLoginModal);
$('#form-login').addEventListener('input',e=>{
  if(e.target.tagName==='INPUT'){
    const errorSpan = e.target.nextElementSibling;
    if(!e.target.validity.valid){
      if(e.target.name==='login-email') errorSpan.textContent="Email inválido";
      else if(e.target.name==='login-pass') errorSpan.textContent="Mínimo 6 caracteres";
      else errorSpan.textContent="Campo obligatorio";
    } else errorSpan.textContent="";
  }
});
$('#form-login').addEventListener('submit',e=>{
  e.preventDefault();
  const f = e.target;
  const email = f['login-email'].value.trim().toLowerCase();
  const pass = f['login-pass'].value;
  const user = getUserByEmail(email);
  if(!user || user.pass!==hash(pass)) {f['login-email'].nextElementSibling.textContent="Credenciales incorrectas";return;}
  saveSession(email);
  setLastAccess(email);
  updatePerfilUI();
  closeLoginModal();
  showToast("Bienvenido/a "+user.nombre.split(' ')[0]);
  window.location.hash="#perfil";
});

// Copiar invitación
$('#btn-copiar-invitacion').addEventListener('click',()=>{
  const val = $('#codigo-invitacion').value;
  navigator.clipboard.writeText(val).then(()=>showToast("Código copiado")).catch(()=>showToast("Error al copiar"));
});

// Modal sugerir evento
function openEventoModal(){show($('#modal-evento'));fadeOverlay(true);$('#form-evento').reset();$all('#form-evento .error').forEach(e=>e.textContent="");}
function closeEventoModal(){hide($('#modal-evento'));fadeOverlay(false);}
$('#btn-sugerir-evento').addEventListener('click',e=>{e.preventDefault();openEventoModal();});
$('#close-evento').addEventListener('click',closeEventoModal);
$('#form-evento').addEventListener('submit',e=>{
  e.preventDefault();
  const f = e.target;
  const nombre = f['evento-nombre'].value.trim();
  const lugar = f['evento-lugar'].value.trim();
  const fecha = f['evento-datetime'].value;
  if(!nombre||!lugar||!fecha) return;
  eventosData.push({nombre,lugar,fecha});
  renderEventos();
  closeEventoModal();
  showToast("¡Evento sugerido con éxito!");
});

// Hash navegación
window.addEventListener('hashchange',()=>{
  if(window.location.hash==="#perfil"&&!getSession())
    window.location.hash="#hero";
  if(window.location.hash==="#admin"&&(!getSession()||getUserByEmail(getSession()).email!=="admin@foodiematch.com"))
    window.location.hash="#hero";
  $all('main > section').forEach(sec=>{
    if(sec.id==="perfil")sec.classList.toggle('d-none',window.location.hash!=="#perfil");
    if(sec.id==="admin")sec.classList.toggle('d-none',window.location.hash!=="#admin");
  });
});

// ------- Matchmaking ---------
let matchIdx = 0;
function renderMatchmakingCard(idx){
  const cont = $('#matchmaking-cards');
  cont.innerHTML = '';
  const user = demoUsers[idx%demoUsers.length];
  const card = document.createElement('div');
  card.className = "match-card";
  card.innerHTML = `<img src="${user.img}" alt="${user.nombre}"><h4>${user.nombre}</h4><p>${user.bio}</p>`;
  cont.appendChild(card);
}
$('#btn-like').addEventListener('click',()=>{
  $('#match-feedback').textContent = "¡Has hecho match! 🎉";
  setTimeout(()=>{
    $('#match-feedback').textContent = "";
    matchIdx = (matchIdx+1)%demoUsers.length;
    renderMatchmakingCard(matchIdx);
  },1100);
});
$('#btn-next').addEventListener('click',()=>{
  matchIdx = (matchIdx+1)%demoUsers.length;
  renderMatchmakingCard(matchIdx);
  $('#match-feedback').textContent = "";
});

// ------- Admin panel (demo) ---------
function renderAdminUsuarios(){
  const tbody = $('#tabla-usuarios tbody');
  const users = getUsers();
  tbody.innerHTML = users.map(u=>
    `<tr><td>${u.nombre}</td><td>${u.email}</td><td>${u.lastAccess||"-"}</td><td><button class="btn-small btn-elim-usr" data-email="${u.email}">Eliminar</button></td></tr>`
  ).join('');
  $all('.btn-elim-usr').forEach(btn=>{
    btn.onclick = ()=>{
      if(confirm("¿Eliminar este usuario?")){
        let users = getUsers().filter(u=>u.email!==btn.dataset.email);
        setUsers(users); renderAdminUsuarios(); showToast("Usuario eliminado");
      }
    }
  });
}
function renderAdminEventos(){
  const ul = $('#admin-eventos');
  ul.innerHTML = eventosData.map(e=>`<li>${e.nombre} - ${formatoFecha(e.fecha)}</li>`).join('');
}

// ------- Inicialización ---------
renderPlatos();
renderEventos();
renderRanking();
renderMatchmakingCard(matchIdx);
enableParallax();
updatePerfilUI();

window.addEventListener('hashchange',()=>{
  if(window.location.hash==="#admin"){
    renderAdminUsuarios();
    renderAdminEventos();
  }
});

// Accesibilidad: cerrar modales con ESC y tabIndex en botones importantes
document.addEventListener('keydown',function(e){
  if(e.key==="Escape"){closeLoginModal();closeEventoModal();}
  if(e.key==="Tab" && document.activeElement===menuToggle && !navLinks.classList.contains('active')) navLinks.classList.add('active');
});
$all('.to-registro').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();closeLoginModal();window.location.hash="#registro";}));

// Muestra ranking y favoritos al volver al perfil
window.addEventListener('hashchange',()=>{
  if(window.location.hash==="#perfil") {renderPerfilFavoritos();renderRanking();}
});
