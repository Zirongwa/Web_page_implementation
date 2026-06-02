<script setup>
import BookGallery from '../components/BookGallery.vue'
import { works } from '../works.js'
</script>

<template>
  <main class="page">
    <section class="hero">
      <h1 class="display">In<br />Pages</h1>
      <p class="hint">滑鼠移到卡片上會升起、前後展開　·　點擊放大顯示</p>
    </section>

    <BookGallery :works="works" />
  </main>
</template>
