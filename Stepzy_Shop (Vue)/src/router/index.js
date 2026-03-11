import { createRouter, createWebHistory } from 'vue-router';
import CatalogView from '../views/CatalogView.vue';
import ProductView from '../views/ProductView.vue';
import CartView from '../views/CartView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import ProfileView from '../views/ProfileView.vue';
import AdminView from '../views/AdminView.vue';
import { useShopStore } from '../store';

const routes = [
  { path: '/', name: 'Catalog', component: CatalogView },
  { path: '/product/:id', name: 'Product', component: ProductView },
  { path: '/cart', name: 'Cart', component: CartView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/profile', name: 'Profile', component: ProfileView },
  { 
    path: '/admin', 
    name: 'Admin', 
    component: AdminView,
    meta: { requiresAdmin: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const store = useShopStore();
  
  if (to.meta.requiresAdmin) {
    if (!store.user || store.user.role !== 'администратор') {
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
