import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../src/App.vue';

describe('App scaffold', () => {
  it('renders the heading', () => {
    const wrapper = mount(App);
    expect(wrapper.find('h1').text()).toBe('AssetPicker');
  });

  it('renders the scaffold notice', () => {
    const wrapper = mount(App);
    expect(wrapper.text()).toContain('Vue 3 rewrite scaffold');
  });
});
