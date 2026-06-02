<script setup>
import AlbumRadialGallery from './components/AlbumRadialGallery.vue'

// ===========================================================
//  你的作品資料：要改內容，只要改這個陣列就好！
//  - image：卡片縮圖（放在 public/works/ 裡，路徑用 /works/檔名）
//  - type：'image' 一般圖片，'video' 影片
//  - video：影片時才需要（YouTube 嵌入網址，或 /works/xxx.mp4）
//  - 想加一件作品，就複製一段 {...}，記得 id 不要重複
// ===========================================================
const works = [
  {
    id: 1,
    type: 'image',
    title: '晨間習作',
    subtitle: '攝影 · 2024',
    year: '2024',
    image: '/works/01.jpg',
    description: '在這裡寫下這件作品的故事、媒材、想法……想寫多長都可以。',
  },
  {
    id: 2,
    type: 'image',
    title: '城市切片',
    subtitle: '平面設計 · 2024',
    year: '2024',
    image: '/works/02.jpg',
    description: '這是第二件作品的介紹文字。',
  },
  {
    id: 3,
    type: 'image',
    title: '無聲對話',
    subtitle: '插畫 · 2025',
    year: '2025',
    image: '/works/03.jpg',
    description: '這是第三件作品的介紹文字。',
  },
  {
    id: 4,
    type: 'image',
    title: '光的容器',
    subtitle: '裝置 · 2025',
    year: '2025',
    image: '/works/04.jpg',
    description: '這是第四件作品的介紹文字。',
  },
  {
    id: 5,
    type: 'video',
    title: '第二秒',
    subtitle: '動態影像 · 2025',
    year: '2025',
    image: '/works/05.jpg',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: '這件是影片作品，點開後會直接播放。把上面的 video 換成你自己的影片網址即可。',
  },
  {
    id: 6,
    type: 'image',
    title: '紙上漫遊',
    subtitle: '手作書 · 2026',
    year: '2026',
    image: '/works/06.jpg',
    description: '這是第六件作品的介紹文字。',
  },
]
</script>

<template>
  <main class="page">
    <header class="top">
      <p class="name">王子榮</p>
      <p class="tag">個人作品集 · Portfolio</p>
    </header>

    <section class="hero">
      <h1 class="display">Selected<br />Works</h1>
      <p class="hint">拖曳或移動滑鼠旋轉　·　滑鼠移到卡片上會浮出，點擊放大展開</p>
    </section>

    <AlbumRadialGallery :works="works" />

    <footer class="foot">
      <span>© 2026 王子蓉</span>
      <span>跨域創作基礎</span>
    </footer>
  </main>
</template>

<style>
/* 全域樣式（這個 <style> 沒有 scoped，所以會套到整個頁面） */
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
</style>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.top {
  display: flex;
  justify-content: space-between;
  padding: 28px 40px;
  font-size: 14px;
  letter-spacing: 0.04em;
}
.top .tag {
  color: var(--muted);
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

.foot {
  margin-top: auto;
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
