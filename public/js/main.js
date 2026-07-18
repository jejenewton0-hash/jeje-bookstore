// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast${type === 'error' ? ' error' : ''}`;
  toast.innerHTML = `<i class="fas fa-${type === 'error' ? 'times-circle' : 'check-circle'}"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== CART BADGE UPDATE =====
async function updateCartBadge() {
  try {
    const res = await fetch('/api/cart');
    const data = await res.json();
    const count = data.items ? data.items.reduce((s, i) => s + i.quantity, 0) : 0;
    document.querySelectorAll('#cartBadge').forEach(el => el.textContent = count);
  } catch (e) {}
}

// ===== ADD TO CART =====
async function addToCart(productId, quantity = 1) {
  try {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: String(productId), quantity: Number(quantity) })
    });
    const data = await res.json();
    if (data.success) {
      document.querySelectorAll('#cartBadge').forEach(el => el.textContent = data.cartCount);
      showToast('Added to cart!');
    } else {
      showToast(data.error || 'Could not add to cart', 'error');
    }
  } catch (e) {
    showToast('Network error. Please try again.', 'error');
  }
}

// ===== BIND ADD TO CART BUTTONS =====
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    // Skip product detail page button (handled inline)
    if (btn.id === 'addToCartBtn') return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      addToCart(btn.dataset.id, 1);
    });
  });
});
