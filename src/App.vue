<script setup>
import { computed, ref } from 'vue'

const whatsappNumber = '573234668067'
const deliveryFee = 5000
const selectedCategory = ref('Todo')
const categories = [
  { name: 'Todo', icon: '🍽️' },
  { name: 'Hamburguesas', icon: '🍔' },
  { name: 'Perros calientes', icon: '🌭' },
  { name: 'Para picar', icon: '🍟' },
  { name: 'Bebidas', icon: '🥤' },
]

const products = [
  {
    id: 'mundo-burger',
    name: 'Mundo Burger',
    description: 'Carne jugosa, queso, tocineta, vegetales frescos y salsa de la casa.',
    category: 'Hamburguesas',
    price: 18000,
    image: '/images/burger.svg',
    label: 'La favorita',
    tag: '⭐ Más pedida',
  },
  {
    id: 'burger-clasica',
    name: 'Burger Clásica',
    description: 'Carne a la plancha, queso cheddar, lechuga y tomate.',
    category: 'Hamburguesas',
    price: 15000,
    image: '/images/classic-burger.svg',
    label: 'Un clásico',
    tag: '',
  },
  {
    id: 'perro-mundo',
    name: 'Perro Mundo',
    description: 'Salchicha, queso, papitas crocantes y salsas.',
    category: 'Perros calientes',
    price: 14000,
    image: '/images/hot-dog.svg',
    label: 'Bien cargadito',
    tag: '',
  },
  {
    id: 'salchipapa',
    name: 'Salchipapa Mini',
    description: 'Papas doraditas, salchicha, queso y nuestras salsas.',
    category: 'Para picar',
    price: 16000,
    image: '/images/fries.svg',
    label: 'Para compartir',
    tag: '💛 Antojo feliz',
  },
  {
    id: 'nuggets',
    name: 'Nuggets crocantes',
    description: 'Seis bocaditos dorados con salsa para acompañar.',
    category: 'Para picar',
    price: 12000,
    image: '/images/nuggets.svg',
    label: 'Crujientes',
    tag: '',
  },
  {
    id: 'gaseosa',
    name: 'Gaseosa fría',
    description: 'Bien fría y perfecta para acompañar tu pedido.',
    category: 'Bebidas',
    price: 5000,
    image: '/images/soda.svg',
    label: 'Bien fría',
    tag: '',
  },
]

const cart = ref([])
const cartOpen = ref(false)
const selectedProduct = ref(null)
const selectedQuantity = ref(1)
const selectedDelivery = ref('domicilio')
const selectedPayment = ref('efectivo')
const customer = ref({
  name: '',
  phone: '',
  address: '',
  notes: '',
  cashReceived: '',
})

const visibleProducts = computed(() =>
  selectedCategory.value === 'Todo'
    ? products
    : products.filter((product) => product.category === selectedCategory.value),
)

const itemCount = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))
const subtotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
)
const currentDeliveryFee = computed(() =>
  selectedDelivery.value === 'domicilio' && cart.value.length > 0 ? deliveryFee : 0,
)
const total = computed(() => subtotal.value + currentDeliveryFee.value)
const changeDue = computed(() =>
  Math.max(0, Number(customer.value.cashReceived || 0) - total.value),
)
const validPhone = computed(() => /^\d{7,15}$/.test(customer.value.phone.replace(/\D/g, '')))
const canSubmitOrder = computed(
  () =>
    cart.value.length > 0 &&
    customer.value.name.trim().length > 1 &&
    validPhone.value &&
    (selectedDelivery.value !== 'domicilio' || customer.value.address.trim().length > 5) &&
    (selectedPayment.value !== 'efectivo' || Number(customer.value.cashReceived) >= total.value),
)

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

function formatPrice(value) {
  return money.format(value)
}

function quantityInCart(productId) {
  return cart.value.find((item) => item.product.id === productId)?.quantity ?? 0
}

function openQuantitySelector(product) {
  selectedProduct.value = product
  selectedQuantity.value = 1
}

function confirmAddToCart() {
  const product = selectedProduct.value
  const quantity = Number(selectedQuantity.value)

  if (!product || !Number.isSafeInteger(quantity) || quantity < 1) return

  const existingItem = cart.value.find((item) => item.product.id === product.id)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.value.push({ product, quantity })
  }

  selectedProduct.value = null
}

function updateQuantity(id, amount) {
  const item = cart.value.find((entry) => entry.product.id === id)

  if (!item) return

  item.quantity += amount

  if (item.quantity <= 0) {
    cart.value = cart.value.filter((entry) => entry.product.id !== id)
  }
}

function removeFromCart(id) {
  cart.value = cart.value.filter((entry) => entry.product.id !== id)
}

function buildOrderMessage() {
  const lines = cart.value.map(
    ({ product, quantity }) =>
      `• ${quantity} x ${product.name} — ${formatPrice(product.price * quantity)}`,
  )
  const details = [
    '¡Hola, Mundo Mini! Quiero hacer este pedido:',
    '',
    ...lines,
    '',
    `Subtotal: ${formatPrice(subtotal.value)}`,
    ...(currentDeliveryFee.value
      ? [`Domicilio: ${formatPrice(currentDeliveryFee.value)}`]
      : []),
    `TOTAL: ${formatPrice(total.value)}`,
    '',
    `Nombre: ${customer.value.name.trim()}`,
    `Teléfono: ${customer.value.phone}`,
    `Entrega: ${selectedDelivery.value === 'domicilio' ? 'Domicilio' : 'Recoger en el local'}`,
    ...(selectedDelivery.value === 'domicilio'
      ? [`Dirección: ${customer.value.address.trim()}`]
      : ['Por favor, confírmenme la dirección para recoger.']),
    ...(customer.value.notes.trim() ? [`Indicaciones: ${customer.value.notes.trim()}`] : []),
    `Pago: ${selectedPayment.value === 'efectivo' ? 'Efectivo' : 'Transferencia'}`,
    ...(selectedPayment.value === 'efectivo'
      ? [
          `Pagaré con: ${formatPrice(Number(customer.value.cashReceived))}`,
          `Mi cambio: ${formatPrice(changeDue.value)}`,
        ]
      : ['Por favor, envíenme los datos para realizar la transferencia.']),
  ]

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(details.join('\n'))}`
}

function submitOrder() {
  if (!canSubmitOrder.value) return

  window.open(buildOrderMessage(), '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="restaurant-site">
    <div class="food-announcement">
      <span aria-hidden="true">✦</span>
      Hecho con antojo, preparado con cariño.
      <span aria-hidden="true">✦</span>
    </div>

    <header class="food-header">
      <a class="food-brand" href="#inicio" aria-label="Mundo Mini, inicio">
        <span class="food-brand-icon" aria-hidden="true">🍔</span>
        <span class="food-brand-name">mundo mini<span>.</span></span>
      </a>

      <nav class="food-nav" aria-label="Navegación principal">
        <a href="#menu">Menú</a>
        <a href="#nosotros">Sobre nosotros</a>
      </nav>

      <button
        class="cart-button"
        type="button"
        :aria-label="`Abrir carrito, ${itemCount} productos`"
        @click="cartOpen = true"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 4h2l2.4 11.1a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 8H6"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="10" cy="20" r="1.3" fill="currentColor" />
          <circle cx="18" cy="20" r="1.3" fill="currentColor" />
        </svg>
        <span class="cart-button-label">Mi pedido</span>
        <span class="cart-count">{{ itemCount }}</span>
      </button>
    </header>

    <main>
      <section id="inicio" class="food-hero">
        <div class="hero-copy">
          <span class="food-eyebrow"><span aria-hidden="true">✳</span> ANTÓJATE SIN PENA</span>
          <h1>Tu antojo<br />tiene un <span>mundo</span><br />de sabor.</h1>
          <p>
            Hamburguesas, perros y cositas deliciosas hechas al momento.
            ¡Pide lo que se te antoje!
          </p>
          <div class="hero-actions">
            <a class="food-button food-button-dark" href="#menu">
              Pedir ahora
              <span aria-hidden="true">→</span>
            </a>
            <span class="hero-love"><span aria-hidden="true">♥</span> Rico, fácil y sin complicaciones</span>
          </div>
          <div class="hero-rating">
            <span class="rating-stars" aria-label="5 estrellas">★★★★★</span>
            <span>Preparado con mucho cariño</span>
          </div>
        </div>

        <div class="hero-food-art">
          <div class="hero-art-disc"></div>
          <span class="hero-food-spark hero-food-spark-one" aria-hidden="true">✦</span>
          <span class="hero-food-spark hero-food-spark-two" aria-hidden="true">✳</span>
          <span class="hero-food-spark hero-food-spark-three" aria-hidden="true">✧</span>
          <img
            class="hero-burger"
            src="/images/hero-combo.svg"
            alt="Hamburguesa y papas fritas, ilustración del combo Mundo Mini"
          />
          <div class="hero-badge">
            <span>EL ANTOJO</span>
            <strong>de hoy</strong>
            <span aria-hidden="true">♥</span>
          </div>
          <span class="hero-caption">GRAN SABOR, GRAN SONRISA</span>
        </div>

        <a class="hero-scroll" href="#menu" aria-label="Ver menú">
          <span></span>
        </a>
      </section>

      <section id="menu" class="menu-section">
        <div class="menu-heading">
          <div>
            <span class="food-eyebrow"><span aria-hidden="true">✳</span> BUENO, BONITO Y DELICIOSO</span>
            <h2>¿Qué se te <span>antoja?</span></h2>
          </div>
          <p>Preparamos tu favorito al momento. Precios de ejemplo en pesos colombianos.</p>
        </div>

        <div class="category-scroll" role="group" aria-label="Filtrar el menú por categoría">
          <button
            v-for="category in categories"
            :key="category.name"
            type="button"
            class="food-category"
            :class="{ 'food-category-active': selectedCategory === category.name }"
            :aria-pressed="selectedCategory === category.name"
            @click="selectedCategory = category.name"
          >
            <span aria-hidden="true">{{ category.icon }}</span>
            {{ category.name }}
          </button>
        </div>

        <div class="food-product-grid">
          <article v-for="product in visibleProducts" :key="product.id" class="food-product-card">
            <div class="food-product-image">
              <span class="food-product-label">{{ product.label }}</span>
              <img :src="product.image" :alt="product.name" loading="lazy" />
              <span v-if="product.tag" class="food-product-tag">{{ product.tag }}</span>
            </div>
            <div class="food-product-details">
              <span class="food-product-category">{{ product.category }}</span>
              <h3>{{ product.name }}</h3>
              <p>{{ product.description }}</p>
              <span v-if="quantityInCart(product.id)" class="product-cart-quantity">
                En tu pedido: {{ quantityInCart(product.id) }}
                {{ quantityInCart(product.id) === 1 ? 'unidad' : 'unidades' }}
              </span>
              <div class="food-product-buy">
                <span class="food-product-price">{{ formatPrice(product.price) }}</span>
                <button
                  type="button"
                  class="add-product-button"
                  :aria-label="`Elegir cantidad de ${product.name}`"
                  @click="openQuantitySelector(product)"
                >
                  <span aria-hidden="true">+</span> Agregar
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="nosotros" class="food-story">
        <span class="story-spark story-spark-left" aria-hidden="true">✳</span>
        <div class="food-story-content">
          <span class="food-eyebrow"><span aria-hidden="true">✦</span> BIENVENIDO A MUNDO MINI</span>
          <h2>Los antojos saben<br />mejor <span>compartidos.</span></h2>
          <p>
            Nos encanta resolver ese “¿qué vamos a comer?” con comida rica,
            porciones generosas y una buena dosis de cariño. Escoge tus favoritos
            y nosotros nos encargamos del resto.
          </p>
          <a class="food-button food-button-light" href="#menu">
            Echar un vistazo al menú <span aria-hidden="true">→</span>
          </a>
        </div>
        <span class="story-spark story-spark-right" aria-hidden="true">♥</span>
      </section>

      <section class="food-how">
        <span class="food-eyebrow"><span aria-hidden="true">✳</span> ASÍ DE FÁCIL</span>
        <h2>Tu pedido, en <span>tres pasos.</span></h2>
        <div class="food-steps">
          <article class="food-step">
            <span class="food-step-icon">🍟</span>
            <span class="food-step-number">01</span>
            <h3>Escoge tu antojo</h3>
            <p>Arma tu pedido con todo lo que más te gusta.</p>
          </article>
          <article class="food-step">
            <span class="food-step-icon">🛵</span>
            <span class="food-step-number">02</span>
            <h3>Cuéntanos cómo lo quieres</h3>
            <p>Envíanos tu pedido por WhatsApp y confirma la entrega.</p>
          </article>
          <article class="food-step">
            <span class="food-step-icon">😋</span>
            <span class="food-step-number">03</span>
            <h3>¡A disfrutar!</h3>
            <p>Preparamos algo rico para alegrarte el día.</p>
          </article>
        </div>
      </section>
    </main>

    <footer class="food-footer">
      <a class="food-brand" href="#inicio" aria-label="Mundo Mini, inicio">
        <span class="food-brand-icon" aria-hidden="true">🍔</span>
        <span class="food-brand-name">mundo mini<span>.</span></span>
      </a>
      <span class="footer-tagline">Antojos felices, pancitas contentas. <span>♥</span></span>
      <a class="footer-whatsapp" href="https://wa.me/573234668067" target="_blank" rel="noreferrer">
        Pedidos: 323 466 8067 <span aria-hidden="true">↗</span>
      </a>
      <a
        class="footer-tiktok"
        href="https://www.tiktok.com/@mundo.mini89"
        target="_blank"
        rel="noreferrer"
      >
        TikTok @mundo.mini89 <span aria-hidden="true">↗</span>
      </a>
    </footer>

    <button
      class="floating-cart"
      type="button"
      :aria-label="`Ver mi pedido: ${itemCount} productos, ${formatPrice(subtotal)}`"
      @click="cartOpen = true"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 4h2l2.4 11.1a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 8H6"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="10" cy="20" r="1.3" fill="currentColor" />
        <circle cx="18" cy="20" r="1.3" fill="currentColor" />
      </svg>
      <span class="floating-cart-info">
        <strong>Mi pedido</strong>
        <span>{{ itemCount }} {{ itemCount === 1 ? 'producto' : 'productos' }} · {{ formatPrice(subtotal) }}</span>
      </span>
      <span class="floating-cart-action">Ver pedido <span aria-hidden="true">→</span></span>
    </button>

    <div
      v-if="selectedProduct"
      class="quantity-overlay"
      @click.self="selectedProduct = null"
    >
      <form
        class="quantity-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quantity-dialog-title"
        @submit.prevent="confirmAddToCart"
      >
        <button
          class="cart-close quantity-close"
          type="button"
          aria-label="Cerrar selección de cantidad"
          @click="selectedProduct = null"
        >
          ×
        </button>
        <img :src="selectedProduct.image" :alt="selectedProduct.name" />
        <span class="food-eyebrow"><span aria-hidden="true">✳</span> A TU GUSTO</span>
        <h2 id="quantity-dialog-title">¿Cuántas <span>unidades</span>?</h2>
        <p class="quantity-product-name">{{ selectedProduct.name }} · {{ formatPrice(selectedProduct.price) }} c/u</p>
        <p v-if="quantityInCart(selectedProduct.id)" class="quantity-already-added">
          Ya tienes {{ quantityInCart(selectedProduct.id) }}
          {{ quantityInCart(selectedProduct.id) === 1 ? 'unidad' : 'unidades' }} en tu pedido.
          Elige cuántas más quieres agregar.
        </p>
        <div class="quantity-picker">
          <button
            type="button"
            aria-label="Restar una unidad"
            :disabled="Number(selectedQuantity) <= 1"
            @click="selectedQuantity = Number(selectedQuantity) - 1"
          >
            −
          </button>
          <input
            v-model.number="selectedQuantity"
            type="number"
            min="1"
            step="1"
            aria-label="Cantidad de unidades"
            required
          />
          <button
            type="button"
            aria-label="Agregar una unidad a la cantidad"
            @click="selectedQuantity = (Number(selectedQuantity) || 0) + 1"
          >
            +
          </button>
        </div>
        <p class="quantity-subtotal">
          Subtotal de estos productos:
          <strong>
            {{
              formatPrice(
                selectedProduct.price *
                  (Number.isSafeInteger(Number(selectedQuantity)) && Number(selectedQuantity) > 0
                    ? Number(selectedQuantity)
                    : 0),
              )
            }}
          </strong>
        </p>
        <button
          class="send-order-button quantity-confirm"
          type="submit"
          :disabled="!Number.isSafeInteger(Number(selectedQuantity)) || Number(selectedQuantity) < 1"
        >
          Agregar {{ selectedQuantity || 0 }}
          {{ Number(selectedQuantity) === 1 ? 'unidad' : 'unidades' }}
          <span aria-hidden="true">✓</span>
        </button>
      </form>
    </div>

    <div v-if="cartOpen" class="cart-overlay" @click.self="cartOpen = false">
      <aside class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div class="cart-drawer-header">
          <div>
            <span class="food-eyebrow"><span aria-hidden="true">✳</span> CASI ESTÁ</span>
            <h2 id="cart-title">Tu pedido <span>rico</span></h2>
          </div>
          <button
            class="cart-close"
            type="button"
            aria-label="Cerrar pedido"
            @click="cartOpen = false"
          >
            ×
          </button>
        </div>

        <div v-if="cart.length === 0" class="cart-empty">
          <span aria-hidden="true">🍔</span>
          <h3>¡Está muy solito por aquí!</h3>
          <p>Agrega algo rico del menú para empezar tu pedido.</p>
          <button type="button" class="food-button food-button-dark" @click="cartOpen = false">
            Ver el menú <span aria-hidden="true">→</span>
          </button>
        </div>

        <form v-else class="order-form" @submit.prevent="submitOrder">
          <div class="cart-items">
            <article v-for="item in cart" :key="item.product.id" class="cart-item">
              <img :src="item.product.image" :alt="item.product.name" />
              <div class="cart-item-info">
                <h3>{{ item.product.name }}</h3>
                <span>{{ formatPrice(item.product.price) }} c/u</span>
                <div class="quantity-control" :aria-label="`Cantidad de ${item.product.name}`">
                  <button
                    type="button"
                    :aria-label="`Quitar una unidad de ${item.product.name}`"
                    @click="updateQuantity(item.product.id, -1)"
                  >
                    −
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button
                    type="button"
                    :aria-label="`Agregar una unidad de ${item.product.name}`"
                    @click="updateQuantity(item.product.id, 1)"
                  >
                    +
                  </button>
                </div>
              </div>
              <span class="cart-item-subtotal">
                {{ formatPrice(item.product.price * item.quantity) }}
              </span>
              <button
                type="button"
                class="remove-cart-item"
                :aria-label="`Eliminar ${item.product.name} del pedido`"
                @click="removeFromCart(item.product.id)"
              >
                ×
              </button>
            </article>
          </div>

          <fieldset class="order-fieldset">
            <legend>¿Cómo quieres recibirlo?</legend>
            <div class="choice-grid">
              <label class="choice-option">
                <input v-model="selectedDelivery" type="radio" name="delivery" value="domicilio" />
                <span>🛵 A domicilio</span>
              </label>
              <label class="choice-option">
                <input v-model="selectedDelivery" type="radio" name="delivery" value="recoger" />
                <span>🏃 Paso a recoger</span>
              </label>
            </div>
            <label v-if="selectedDelivery === 'domicilio'" class="form-label">
              Dirección de entrega *
              <input
                v-model="customer.address"
                name="address"
                type="text"
                minlength="6"
                placeholder="Calle, carrera, barrio y apartamento"
                required
              />
            </label>
            <p v-else class="pickup-note">
              Coordinaremos por WhatsApp la dirección y hora para recoger.
            </p>
            <label class="form-label">
              Indicaciones <span>(opcional)</span>
              <input
                v-model="customer.notes"
                name="notes"
                type="text"
                placeholder="Ej.: sin cebolla, portería..."
              />
            </label>
          </fieldset>

          <fieldset class="order-fieldset">
            <legend>Tus datos</legend>
            <label class="form-label">
              Nombre *
              <input
                v-model="customer.name"
                name="name"
                type="text"
                minlength="2"
                autocomplete="name"
                placeholder="¿A nombre de quién?"
                required
              />
            </label>
            <label class="form-label">
              Teléfono *
              <input
                v-model="customer.phone"
                name="phone"
                type="tel"
                inputmode="numeric"
                pattern="[0-9+() -]{7,20}"
                autocomplete="tel"
                placeholder="Tu número de contacto"
                required
              />
            </label>
          </fieldset>

          <fieldset class="order-fieldset">
            <legend>¿Cómo vas a pagar?</legend>
            <div class="choice-grid">
              <label class="choice-option">
                <input v-model="selectedPayment" type="radio" name="payment" value="efectivo" />
                <span>💵 Efectivo</span>
              </label>
              <label class="choice-option">
                <input v-model="selectedPayment" type="radio" name="payment" value="transferencia" />
                <span>📲 Transferencia</span>
              </label>
            </div>
            <template v-if="selectedPayment === 'efectivo'">
              <label class="form-label">
                ¿Con cuánto vas a pagar? *
                <input
                  v-model.number="customer.cashReceived"
                  name="cashReceived"
                  type="number"
                  :min="total"
                  :step="1000"
                  :placeholder="`Mínimo ${formatPrice(total)}`"
                  required
                />
              </label>
              <p v-if="Number(customer.cashReceived) >= total && total > 0" class="change-note">
                Tu cambio: <strong>{{ formatPrice(changeDue) }}</strong>
              </p>
              <p v-else-if="customer.cashReceived && Number(customer.cashReceived) < total" class="validation-note">
                El valor debe cubrir el total del pedido.
              </p>
            </template>
            <p v-else class="pickup-note">
              Al confirmar, pídenos por WhatsApp los datos para transferir.
              Tu pago quedará pendiente hasta confirmar el comprobante.
            </p>
          </fieldset>

          <div class="order-totals">
            <div>
              <span>Subtotal · {{ itemCount }} {{ itemCount === 1 ? 'producto' : 'productos' }}</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>
            <div v-if="currentDeliveryFee"><span>Domicilio</span><span>{{ formatPrice(currentDeliveryFee) }}</span></div>
            <div class="order-grand-total"><span>Total</span><strong>{{ formatPrice(total) }}</strong></div>
            <p>Tarifa de domicilio de ejemplo; confirma el valor final por WhatsApp.</p>
          </div>

          <button class="send-order-button" type="submit" :disabled="!canSubmitOrder">
            Enviar pedido por WhatsApp <span aria-hidden="true">↗</span>
          </button>
          <p class="whatsapp-disclaimer">
            El mensaje se abrirá en WhatsApp para que lo revises y lo envíes.
          </p>
        </form>
      </aside>
    </div>
  </div>
</template>
