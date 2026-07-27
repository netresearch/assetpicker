import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createAppI18n } from '../src/i18n/index.js';
import App from '../src/App.vue';

const config = {
  title: 'AssetPicker',
  language: 'en',
  pick: { limit: 1, types: ['file'], extensions: [] },
  thumbnails: 'url',
  storages: {
    demo: { adapter: 'dummy', label: 'Demo storage' },
  },
};

function mountApp() {
  return mount(App, {
    props: { config },
    global: { plugins: [createAppI18n('en')] },
  });
}

describe('App', () => {
  it('renders the brand and the storage overview', () => {
    const wrapper = mountApp();
    expect(wrapper.find('.ap-brand').text()).toBe('AssetPicker');
    expect(wrapper.text()).toContain('Demo storage');
  });

  it('disables the pick button until something is picked', () => {
    const wrapper = mountApp();
    const pickButton = wrapper.find('.ap-btn-primary');
    expect(pickButton.attributes('disabled')).toBeDefined();
  });
});
