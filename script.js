const DECISION_THRESHOLD = 75; // distancia mínima para decidir (paso 3.3)

const cards = document.querySelector('.cards');

let actualCard = null; // la tarjeta que se está arrastrando
let startX = 0;        // dónde empezó el arrastre
let pullDeltaX = 0;    // distancia recorrida

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
function swipeTop(direction) {
  const card = cards.querySelector('article:last-child');
  if (!card) return;
  card.querySelector(direction === 'go-right' ? '.like' : '.nope').style.opacity = 1;
  setTimeout(() => dismiss(card, direction), 150);
}

document.querySelector('.undo').addEventListener('click',   () => console.log('undo'));
document.querySelector('.remove').addEventListener('click', () => { console.log('remove');      swipeTop('go-left'); });
document.querySelector('.star').addEventListener('click',   () => { console.log('super match'); swipeTop('go-right'); });
document.querySelector('.fav').addEventListener('click',    () => { console.log('match');       swipeTop('go-right'); });
document.querySelector('.zap').addEventListener('click',    () => console.log('boost'));