import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BookView from '../views/BookView.vue'

// 用 hash 模式（網址會有 #），這樣部署到 GitHub Pages
// 重新整理第二頁時才不會出現 404。
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/book', name: 'book', component: BookView },
  ],
})

export default router
