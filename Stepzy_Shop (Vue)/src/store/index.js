import { defineStore } from 'pinia';
import axios from 'axios';

export const useShopStore = defineStore('shop', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    cart: [],
  }),
  actions: {
    async setUser(user) {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      await this.fetchCart();
    },
    logout() {
      this.user = null;
      this.cart = [];
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
    },
    async fetchCart() {
      if (this.user) {
        try {
          const res = await axios.get(`http://localhost:3001/api/cart/${this.user.id}`);
          this.cart = res.data;
        } catch (err) {
          console.error('Error fetching cart:', err);
        }
      } else {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
      }
    },
    async addToCart(product) {
      const stock = product.stock_quantity || 0;
      const existing = this.cart.find(p => p.id === product.id || p.device_id === product.id);
      
      let quantityToAdd = 1;
      if (existing) {
        if (existing.quantity >= stock) {
          alert('Достигнут лимит товара на складе');
          return;
        }
      } else if (stock <= 0) {
        alert('Товара нет в наличии');
        return;
      }

      if (this.user) {
        try {
          await axios.post('http://localhost:3001/api/cart', {
            user_id: this.user.id,
            device_id: product.id,
            quantity: 1
          });
          await this.fetchCart();
        } catch (err) {
          console.error('Error adding to cart:', err);
          alert(err.response?.data?.message || 'Ошибка добавления в корзину');
        }
      } else {
        if (existing) {
          existing.quantity++;
        } else {
          this.cart.push({ ...product, quantity: 1 });
        }
        this.saveLocalCart();
      }
    },
    async decreaseQuantity(productId) {
      const existing = this.cart.find(p => p.id === productId || p.device_id === productId);
      if (!existing) return;

      if (this.user) {
        try {
          if (existing.quantity <= 1) {
            await axios.delete(`http://localhost:3001/api/cart/${existing.id}`);
          } else {
            await axios.put(`http://localhost:3001/api/cart/${existing.id}`, {
              quantity: existing.quantity - 1
            });
          }
          await this.fetchCart();
        } catch (err) {
          console.error('Error updating cart:', err);
        }
      } else {
        existing.quantity--;
        if (existing.quantity <= 0) {
          this.cart = this.cart.filter(p => p.id !== productId);
        }
        this.saveLocalCart();
      }
    },
    async removeFromCart(cartItemIdOrProductId) {
      if (this.user) {
        try {
           await axios.delete(`http://localhost:3001/api/cart/${cartItemIdOrProductId}`);
           await this.fetchCart();
        } catch (err) {
          console.error('Error removing from cart:', err);
        }
      } else {
        this.cart = this.cart.filter(p => p.id !== cartItemIdOrProductId);
        this.saveLocalCart();
      }
    },
    async clearCart() {
      if (this.user) {
        try {
          await axios.delete(`http://localhost:3001/api/cart/user/${this.user.id}`);
          this.cart = [];
        } catch (err) {
          console.error('Error clearing cart:', err);
        }
      } else {
        this.cart = [];
        this.saveLocalCart();
      }
    },
    saveLocalCart() {
      localStorage.setItem('cart', JSON.stringify(this.cart));
    },
    async init() {
        if (this.user) {
            await this.fetchCart();
        } else {
            this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        }
    }
  },
  getters: {
    cartTotal: (state) => state.cart.reduce((total, p) => total + p.price * p.quantity, 0),
    cartCount: (state) => state.cart.reduce((total, p) => total + p.quantity, 0),
  }
});
