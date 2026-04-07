import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import NextBanner from './NextBanner.vue'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(NextBanner),
    })
  },
}
