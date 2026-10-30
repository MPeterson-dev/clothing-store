import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

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