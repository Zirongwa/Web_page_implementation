<script setup>
import AlbumRadialGallery from '../components/AlbumRadialGallery.vue'
import { works } from '../works.js'
</script>

<template>
  <main class="page">
    <section class="hero">
      <h1 class="display">Selected<br />Works</h1>
      <p class="hint">拖曳或移動滑鼠旋轉　·　滑鼠移到卡片上會浮出，點擊放大展開</p>
    </section>

    <AlbumRadialGallery :works="works" />
  </main>
</template>
