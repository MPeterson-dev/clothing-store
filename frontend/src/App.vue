<script setup>
import { computed, onMounted, ref } from 'vue'


// ref = Reactive values: Vue updates the page when these change.
const products = ref([])
const loading = ref(true)
const error = ref('')
const selectedCategory = ref('All')
const searchQuery = ref('')

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
  <main>
    <h1>Store Title here</h1>
    <p>Find your everyday favorites.</p>
<label for="search">Search products:</label>
<input
  id="search"
  v-model="searchQuery"
  type="search"
  placeholder="Search clothing..."
/>
<label for="category">Filter by category:</label>
    <select id="category" v-model="selectedCategory">
      const
      <option v-for="category in categories" :key="category" :value="category">
        {{ category }}
      </option>
    </select>

    <p v-if="loading">Loading products...</p>
    <p v-else-if="error" role="alert">{{ error }}</p>

    <ul v-else>
      <li v-if="filteredProducts.length === 0">
        No products match your search.
      </li>
      <li v-for="product in filteredProducts" :key="product.id">
        <h2>{{ product.name }}</h2>
        <p>{{ product.category }}</p>
        <p>${{ product.price.toFixed(2) }}</p>
      </li>
    </ul>
  </main>
</template>

<style scoped>
main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  padding: 0;
  list-style: none;
}

li {
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>

