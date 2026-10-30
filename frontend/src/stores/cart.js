import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const items = ref(loadCart())

function loadCart() {
  try {
    const savedCart = localStorage.getItem('clothing-store-cart')
    const parsed = savedCart ? JSON.parse(savedCart) : []

    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item) =>
        item !== null &&
        typeof item === 'object' &&
        Number.isInteger(item.id) &&
        typeof item.name === 'string' &&
        typeof item.category === 'string' &&
        Number.isFinite(item.price) &&
        item.price >= 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    )
  } catch {
    return []
  }
}

watch(
  items,
  (updatedItems) => {
    try {
      localStorage.setItem('clothing-store-cart', JSON.stringify(updatedItems))
    } catch {
      console.warn('Unable to save the cart in this browser.')
    }
  },
  { deep: true },
)

  const itemCount = computed(() =>
    items.value.reduce((count, item) => count + item.quantity, 0),
  )

  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  function addItem(product) {
    const existingItem = items.value.find((item) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
  }

  function removeItem(productId) {
    items.value = items.value.filter((item) => item.id !== productId)
  }

  function decreaseQuantity(productId) {
    const item = items.value.find((item) => item.id === productId)

    if (!item) return

    if (item.quantity > 1) {
      item.quantity--
    } else {
      removeItem(productId)
    }
  }

  return {
    items,
    itemCount,
    total,
    addItem,
    removeItem,
    decreaseQuantity,
  }
})