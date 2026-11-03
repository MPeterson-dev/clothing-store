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
          item.quantity > 0 &&
          typeof item.variantKey === 'string' &&
          typeof item.size === 'string' &&
          typeof item.color === 'string',
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

  const itemCount = computed(() => items.value.reduce((count, item) => count + item.quantity, 0))

  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  function addItem(product) {
    const variantKey = JSON.stringify([product.id, product.size, product.color])
    const existingItem = items.value.find((item) => item.variantKey === variantKey)

    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({ ...product, variantKey, quantity: 1 })
    }
  }

  function removeItem(variantKey) {
    items.value = items.value.filter((item) => item.variantKey !== variantKey)
  }

  function decreaseQuantity(variantKey) {
    const item = items.value.find((item) => item.variantKey === variantKey)
    if (!item) return

    if (item.quantity > 1) {
      item.quantity--
    } else {
      removeItem(variantKey)
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
