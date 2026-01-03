// tests/App.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App', () => {
  it('should show priming screen initially', () => {
    const wrapper = mount(App)
    expect(wrapper.html()).toContain('You are about to see Earth')
  })

  it('should hide priming screen when ready event emitted', async () => {
    const wrapper = mount(App)
    await wrapper.findComponent({ name: 'PrimingScreen' }).vm.$emit('ready')
    // Will fail initially - no state management yet
    expect(wrapper.findComponent({ name: 'PrimingScreen' }).exists()).toBe(false)
  })
})
