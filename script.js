const DECISION_THRESHOLD = 75; // distancia mínima para decidir (paso 3.3)

const cards = document.querySelector('.cards');

let actualCard = null; // la tarjeta que se está arrastrando
let startX = 0;        // dónde empezó el arrastre
let pullDeltaX = 0;    // distancia recorrida
const removed = [];

cards.addEventListener('pointerdown', (e) => {
  const card = e.target.closest('article');
  // solo se puede arrastrar la tarjeta de arriba (la última del DOM)
  if (!card || card !== cards.querySelector('article:last-child')) return;

  actualCard = card;
  startX = e.clientX;
  pullDeltaX = 0;

  card.classList.remove('reset');
  card.style.transition = 'none'; // sin animación mientras arrastras
  card.setPointerCapture(e.pointerId);
});

cards.addEventListener('pointermove', (e) => {
  if (!actualCard) return;

  pullDeltaX = e.clientX - startX;

  const deg = pullDeltaX / 14;
  actualCard.style.transform = `translateX(${pullDeltaX}px) rotate(${deg}deg)`;

  // LIKE / NOPE se hacen visibles mientras te acercas al umbral
  const opacity = Math.min(Math.abs(pullDeltaX) / DECISION_THRESHOLD, 1);
  actualCard.querySelector('.like').style.opacity = pullDeltaX > 0 ? opacity : 0;
  actualCard.querySelector('.nope').style.opacity = pullDeltaX < 0 ? opacity : 0;
});

function release() {
  if (!actualCard) return;

  const card = actualCard;
  actualCard = null;
  card.style.transition = ''; // vuelve a usar el transition del CSS

  if (Math.abs(pullDeltaX) >= DECISION_THRESHOLD) {
    dismiss(card, pullDeltaX > 0 ? 'go-right' : 'go-left');
  } else {
    card.classList.add('reset');
    card.style.transform = '';
    card.querySelectorAll('.choice').forEach((c) => (c.style.opacity = 0));
  }
  pullDeltaX = 0;
}

function dismiss(card, direction) {
  card._dir = direction;
  removed.push(card);            
  card.style.transform = '';
  card.classList.add(direction);
  card.addEventListener('transitionend', () => card.remove(), { once: true });
}

cards.addEventListener('pointerup', release);
cards.addEventListener('pointercancel', release);


function swipeTop(direction) {
  const card = cards.querySelector('article:last-child:not(.go-left):not(.go-right)');
  if (!card) return;
  card.querySelector(direction === 'go-right' ? '.like' : '.nope').style.opacity = 1;
  setTimeout(() => dismiss(card, direction), 150);
}


function undo() {
  // si una tarjeta todavía se está yendo, esperamos a que termine
  if (cards.querySelector('.go-left, .go-right')) return;

  const card = removed.pop();
  if (!card) return;

  // la dejamos limpia, como nueva
  card.classList.remove('go-left', 'go-right', 'reset');
  card.querySelectorAll('.choice').forEach((c) => (c.style.opacity = 0));

  // la ponemos fuera de pantalla, del lado por donde salió, sin animación
  const side = card._dir === 'go-right' ? 150 : -150;
  card.style.transition = 'none';
  card.style.transform = `translateX(${side}%) rotate(${side / 5}deg)`;
  cards.appendChild(card);       // al ser la última del DOM, queda arriba

  card.offsetWidth;              // fuerza al navegador a registrar la posición
  card.style.transition = '';    // reactiva la animación del CSS
  card.style.transform = '';     // vuelve al centro
}

let boostTimer = null;
function boost() {
  const device = document.querySelector('.device');
  if (device.classList.contains('boost')) return; // ya está activo
  device.classList.add('boost');
  showToast('⚡ Boost activado');
  boostTimer = setTimeout(() => {
    device.classList.remove('boost');
    showToast('Boost terminado');
  }, 6000);
}

function showToast(text) {
  const toast = document.querySelector('.toast');
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}

document.querySelector('.undo').addEventListener('click',   () => { console.log('undo'); undo(); });
document.querySelector('.remove').addEventListener('click', () => { console.log('remove');      swipeTop('go-left'); });
document.querySelector('.star').addEventListener('click',   () => { console.log('super match'); showToast('⭐ Super match'); swipeTop('go-right'); });
document.querySelector('.fav').addEventListener('click',    () => { console.log('match');       swipeTop('go-right'); });
document.querySelector('.zap').addEventListener('click',    () => { console.log('boost');       boost(); });