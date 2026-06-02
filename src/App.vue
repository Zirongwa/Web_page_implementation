<script setup>
// 這裡不用寫東西，頁面內容由 router 決定
</script>

<template>
  <div class="shell">
    <header class="top">
      <p class="name">王子蓉</p>
      <nav class="nav">
        <RouterLink to="/">作品輪盤</RouterLink>
        <RouterLink to="/book">書頁展開</RouterLink>
      </nav>
    </header>

    <!-- 不同頁面會顯示在這裡 -->
    <RouterView />

    <footer class="foot">
      <span>© 2026 王子蓉</span>
      <span>跨域創作基礎</span>
    </footer>
  </div>
</template>

<style>
/* 全域樣式（沒有 scoped，整站共用） */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..600&family=Archivo:wght@400;500;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --ink: #15130f;
  --paper: #f4f1ea;
  --accent: #e0552b;
  --muted: #9a948a;
}

body {
  background: var(--paper);
  color: var(--ink);
  font-family: 'Archivo', sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* 每個頁面共用的版面（給 HomeView / BookView 用） */
.page {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.hero {
  text-align: center;
  padding: 8px 20px 0;
}
.display {
  font-family: 'Fraunces', serif;
  font-weight: 350;
  font-size: clamp(38px, 6.5vw, 84px);
  line-height: 0.92;
  letter-spacing: -0.02em;
}
.hint {
  margin-top: 14px;
  font-size: 13px;
  color: var(--muted);
  letter-spacing: 0.03em;
}
</style>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
}
.top .name {
  font-size: 15px;
  letter-spacing: 0.04em;
}
.nav {
  display: flex;
  gap: 22px;
}
.nav a {
  text-decoration: none;
  color: var(--muted);
  font-size: 14px;
  letter-spacing: 0.04em;
  padding-bottom: 2px;
  border-bottom: 1px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}
.nav a:hover {
  color: var(--ink);
}
/* 目前所在的頁面，連結會變深色 + 底線 */
.nav a.router-link-active {
  color: var(--ink);
  border-color: var(--ink);
}
.foot {
  display: flex;
  justify-content: space-between;
  padding: 24px 40px;
  font-size: 12px;
  color: var(--muted);
}
@media (max-width: 600px) {
  .top,
  .foot {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
