<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { versions } from '../versions.mjs'

const { page } = useData()

// Show banner only on root (next) pages — not on v*/ versioned pages
const isNextDocs = computed(() => !/^v\d+\./.test(page.value.relativePath))

// First entry whose text does not include 'next' is the latest stable version
const latestStable = versions.find(v => !v.text.includes('next'))
</script>

<template>
  <div v-if="isNextDocs && latestStable" class="next-banner">
    <span class="next-banner__text">
      ⚠️ You're reading unreleased (next) docs.
    </span>
    <a :href="latestStable.link" class="next-banner__link">
      Latest stable: {{ latestStable.text }} →
    </a>
  </div>
</template>

<style scoped>
.next-banner {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 16px;
  background-color: rgba(200, 241, 53, 0.12);
  border-bottom: 1px solid rgba(200, 241, 53, 0.3);
  font-size: 13px;
  text-align: center;
  flex-wrap: wrap;
}

.next-banner__text {
  color: var(--vp-c-text-1);
}

.next-banner__link {
  color: var(--vp-c-brand-1);
  font-weight: 500;
  text-decoration: none;
}

.next-banner__link:hover {
  text-decoration: underline;
}
</style>
