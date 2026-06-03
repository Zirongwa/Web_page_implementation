<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const base = import.meta.env.BASE_URL
const imgUrl = (path) => path ? base + path.replace(/^\//, '') : ''

const props = defineProps({
  works: { type: Array, required: true },
})

const N = computed(() => props.works.length)
const radius = computed(() => Math.max(340, (N.value * 250) / (2 * Math.PI)))

const LIFT_FORWARD = 130
const LIFT_UP = -40
const LIFT_SCALE = 1.1

const hovered = ref(null)
const album = ref(null)
const currentImg = ref(0)
const ring = ref(null)
const stage = ref(null)

// 這個作品有哪些展開圖
const albumImages = computed(() => {
  if (!album.value) return []
  return album.value.images
    || (album.value.cover ? [album.value.cover] : [album.value.image])
})

function cardTransform(i) {
  const angle = (360 / N.value) * i
  if (i === hovered.value) {
    return `rotateY(${angle}deg) translateZ(${radius.value + LIFT_FORWARD}px) translateY(${LIFT_UP}px) scale(${LIFT_SCALE})`
  }
  return `rotateY(${angle}deg) translateZ(${radius.value}px)`
}

let curY = 0
let curX = -6
let tgtX = -6
let dragVel = 0
const autoSpin = 0.12
let raf = 0
let dragging = false
let lastX = 0
let moved = false

function loop() {
  if (album.value === null && hovered.value === null && !dragging) {
    curY += autoSpin + dragVel
    dragVel *= 0.92
  }
  curX += (tgtX - curX) * 0.08
  if (ring.value) {
    ring.value.style.transform = `rotateX(${curX}deg) rotateY(${curY}deg)`
  }
  raf = requestAnimationFrame(loop)
}

function onDown(e) {
  dragging = true
  moved = false
  lastX = e.clientX
  dragVel = 0
}
function onMove(e) {
  const r = stage.value.getBoundingClientRect()
  const cy = r.top + r.height / 2
  tgtX = -6 + ((e.clientY - cy) / (r.height / 2)) * -12
  if (dragging) {
    const dx = e.clientX - lastX
    if (Math.abs(dx) > 3) moved = true
    curY += dx * 0.3
    dragVel = dx * 0.3
    lastX = e.clientX
  }
}
function onUp() { dragging = false }

function onEnter(i) { if (!dragging) hovered.value = i }
function onLeave() { hovered.value = null }

function onCard(i) {
  if (moved) { moved = false; return }
  album.value = props.works[i]
  currentImg.value = 0
}
function closeAlbum() {
  album.value = null
  currentImg.value = 0
}
function onKey(e) { if (e.key === 'Escape') closeAlbum() }

onMounted(() => {
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('keydown', onKey)
  loop()
})
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('keydown', onKey)
  cancelAnimationFrame(raf)
})

const isVideo = (item) => item?.type === 'video'
const isMp4 = (src) => typeof src === 'string' && src.endsWith('.mp4')
</script>

<template>
  <div class="gallery">
    <div ref="stage" class="stage" @pointerdown="onDown">
      <div ref="ring" class="ring">
        <button
          v-for="(item, i) in works"
          :key="item.id"
          class="card"
          :class="{ hovered: i === hovered }"
          :style="{
            transform: cardTransform(i),
            width: item.width ? item.width + 'px' : null,
            height: item.height ? item.height + 'px' : null,
            left: item.width ? -(item.width / 2) + 'px' : null,
            top: item.height ? -(item.height / 2) + 'px' : null,
          }"
          @mouseenter="onEnter(i)"
          @mouseleave="onLeave"
          @click="onCard(i)"
        >
          <img :src="imgUrl(item.cover || item.image)" alt="" draggable="false" />
          <!--<span v-if="isVideo(item)" class="play">▶</span>-->
          <div class="info">
            <p class="info-year">{{ item.year }}</p>
            <p class="info-sub">{{ item.subtitle }}</p>
          </div>
        </button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="album" class="overlay" @click.self="closeAlbum">
        <button class="close" @click="closeAlbum" aria-label="關閉">✕</button>
        <div class="album">

          <!-- 圖片區：自動符合大小，支援多張切換 -->
          <div class="media-wrap">
            <template v-if="isVideo(album)">
              <video v-if="isMp4(album.video)" :src="album.video"
                controls autoplay playsinline class="media-img"></video>
              <iframe v-else :src="album.video"
                allow="autoplay; fullscreen" allowfullscreen class="media-img"></iframe>
            </template>
            <img v-else :src="imgUrl(albumImages[currentImg])"
              :alt="album.title" class="media-img" />

            <template v-if="!isVideo(album) && albumImages.length > 1">
              <button class="img-prev" :disabled="currentImg === 0"
                @click="currentImg--">←</button>
              <button class="img-next" :disabled="currentImg === albumImages.length - 1"
                @click="currentImg++">→</button>
              <div class="img-dots">
                <span v-for="(_, di) in albumImages" :key="di"
                  :class="{ active: di === currentImg }"
                  @click="currentImg = di"></span>
              </div>
            </template>
          </div>

          <!-- 文字資訊 -->
          <div class="meta">
            <p class="year">{{ album.year }}</p>
            <h3>{{ album.title }}</h3>
            <p class="role">{{ album.subtitle }}</p>
            <p class="desc">{{ album.description }}</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.gallery {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.stage {
  flex: 1;
  min-height: 72vh;
  perspective: 1700px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  touch-action: none;
  overflow: visible;
}
.stage:active { cursor: grabbing; }
.ring {
  position: relative;
  transform-style: preserve-3d;
  width: 0;
  height: 0;
  will-change: transform;
}
.card {
  position: absolute;
  left: -110px;
  top: -150px;
  width: 212.5px;
  height: 300px;
  border: none;
  padding: 0;
  border-radius: 2.5px;
  overflow: hidden;
  cursor: pointer;
  background: #e7e3da;
  backface-visibility: hidden;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.22);
  transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.4s;
}
.card.hovered {
  box-shadow: 0 50px 90px rgba(0, 0, 0, 0.4);
  z-index: 10;
}
.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}
.card .play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  background: rgba(0, 0, 0, 0.25);
}
.info {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  padding: 0 4px 8px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.card.hovered .info { opacity: 1; }
.info-year {
  font-size: 11px;
  letter-spacing: 0.15em;
  color: var(--ink);
  margin-bottom: 3px;
}
.info-sub {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.04em;
}

/* 展開大圖 */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(20, 19, 15, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 80px;
  backdrop-filter: blur(6px);
}
.close {
  position: absolute;
  top: 24px;
  right: 28px;
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}
.album {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 48px;
  max-width: 1100px;
  width: 100%;
  align-items: center;
  color: var(--paper);
}
.media-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 78vh;
}
.media-img {
  max-height: 78vh;
  max-width: 100%;
  width: auto;
  height: auto;
  border-radius: 6px;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
  display: block;
  object-fit: contain;
  border: none;
}
.img-prev,
.img-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  font-size: 18px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}
.img-prev:hover,
.img-next:hover { background: rgba(255, 255, 255, 0.3); }
.img-prev:disabled,
.img-next:disabled { opacity: 0.2; cursor: default; }
.img-prev { left: -50px; }
.img-next { right: -50px; }
.img-dots {
  position: absolute;
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}
.img-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: background 0.2s;
}
.img-dots span.active { background: #fff; }

.meta .year {
  color: var(--accent);
  letter-spacing: 0.2em;
  font-size: 13px;
}
.meta h3 {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: 40px;
  margin: 10px 0;
}
.meta .role {
  color: #c9c3b8;
  margin-bottom: 18px;
  letter-spacing: 0.04em;
}
.meta .desc {
  line-height: 1.7;
  color: #e7e2d8;
  font-size: 15px;
}
.fade-enter-active,
.fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

@media (max-width: 760px) {
  .stage { min-height: 48vh; perspective: 1100px; }
  .card { width: 160px; height: 220px; left: -80px; top: -110px; }
  .album { grid-template-columns: 1fr; gap: 24px; }
  .overlay { padding: 20px 20px 40px; }
  .img-prev { left: -32px; }
  .img-next { right: -32px; }
}
</style>