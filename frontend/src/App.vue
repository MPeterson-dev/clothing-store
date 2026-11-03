<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCartStore } from './stores/cart.js'

// ref = Reactive values: Vue updates the page when these change.
const products = ref([])
const loading = ref(true)
const error = ref('')
const selectedCategory = ref('All')
const searchQuery = ref('')
const cart = useCartStore()

const categories = computed(() => [ 
  'All', 
  ...new Set(products.value.map((product) => product.category)),
])

const filteredProducts = computed(() =>
  products.value.filter((product) => {
    const matchesCategory =
      selectedCategory.value === 'All' ||
      product.category === selectedCategory.value

    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.value.trim().toLowerCase())

    return matchesCategory && matchesSearch
  }),
)

// Load products after the component appears on the page.
onMounted(async () => {
  try {
    const response = await fetch('/api/products')

    // Treat unsuccessful HTTP responses as errors.
    if (!response.ok) {
      throw new Error('Unable to load products.')
    }

    products.value = await response.json()
  } catch {
    error.value = 'Could not load products. Please try again later.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="container py-5">
    <h1>Store Title here</h1>
    <p>Find your everyday favorites.</p>
        <div class="row g-3 mb-4">
      <div class="col-12 col-md-8">
        <label for="search" class="form-label">Search products</label>
        <input
          id="search"
          v-model="searchQuery"
          type="search"
          class="form-control"
          placeholder="Search clothing..."
        />
      </div>
    
      <div class="col-12 col-md-4">
        <label for="category" class="form-label">Filter by category</label>
        <select id="category" v-model="selectedCategory" class="form-select">
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
    </div>
      <p v-if="loading">Loading products...</p>
      <p v-else-if="error" role="alert">{{ error }}</p>

      <ul v-else class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3 list-unstyled">
        <li v-if="filteredProducts.length === 0" class="col-12">
          No products match your search.
        </li>
        <li v-for="product in filteredProducts" :key="product.id" class="col">
          <article class="card h-100 shadow-sm">
            <div class="card-body">
              <h2 class="h5 card-title">{{ product.name }}</h2>
              <p class="text-muted">{{ product.category }}</p>
              <p class="fw-bold">${{ product.price.toFixed(2) }}</p>
              <button type="button" class="btn btn-dark" @click="cart.addItem(product)">
                Add to Cart
              </button>
            </div>
          </article>
        </li>
      </ul>
    <section class="mt-5">
    <h2 class="h4">Shopping cart ({{ cart.itemCount }})</h2>

    <p v-if="cart.items.length === 0">Your cart is empty.</p>

    <ul v-else class="list-group mb-3">
      <li v-for="item in cart.items" :key="item.id" class="list-group-item">
        <h3 class="h6">{{ item.name }}</h3>
        <p>${{ item.price.toFixed(2) }} each · Quantity: {{ item.quantity }}</p>

        <button
          type="button"
          class="btn btn-outline-secondary btn-sm me-2"
          :aria-label="`Decrease quantity of ${item.name}`"
          @click="cart.decreaseQuantity(item.id)"
        >
          −
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm me-2"
          :aria-label="`Increase quantity of ${item.name}`"
          @click="cart.addItem(item)"
        >
          +
        </button>
        <button
          type="button"
          class="btn btn-outline-danger btn-sm"
          @click="cart.removeItem(item.id)"
        >
          Remove
        </button>
      </li>
    </ul>

    <p><strong>Total: ${{ cart.total.toFixed(2) }}</strong></p>
    </section>
  </main>
</template>
