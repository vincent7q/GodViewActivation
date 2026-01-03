// tests/components/PrimingScreen.test.js
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimingScreen from '@/components/PrimingScreen.vue'

describe('PrimingScreen', () => {
  it('should render priming message', () => {
    const wrapper = mount(PrimingScreen)
    expect(wrapper.text()).toContain('You are about to see Earth as astronauts see it')
  })

  it('should emit "ready" event when button clicked', async () => {
    const wrapper = mount(PrimingScreen)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('ready')
  })

  it('should have "I\'m Ready" button', () => {
    const wrapper = mount(PrimingScreen)
    expect(wrapper.find('button').text()).toBe("I'm Ready")
  })
})
