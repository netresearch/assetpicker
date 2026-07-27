import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { messages } from '../src/i18n/messages.js';
import LoginForm from '../src/components/LoginForm.vue';

function mountForm(props = {}) {
  const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages });
  return mount(LoginForm, { props, global: { plugins: [i18n] } });
}

describe('LoginForm', () => {
  it('emits submit with the entered credentials', async () => {
    const wrapper = mountForm();
    await wrapper.find('#ap-login-username').setValue('admin');
    await wrapper.find('#ap-login-password').setValue('secret');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('submit')?.[0]).toEqual(['admin', 'secret']);
  });

  it('shows the failure alert only when failure is set', async () => {
    const wrapper = mountForm();
    expect(wrapper.find('.alert-danger').exists()).toBe(false);
    await wrapper.setProps({ failure: true });
    expect(wrapper.find('.alert-danger').text()).toBe('Your username or password were wrong');
  });

  it('renders the hint as HTML', () => {
    const wrapper = mountForm({ hint: 'User: <b>admin</b>' });
    expect(wrapper.find('.panel-footer').html()).toContain('<b>admin</b>');
  });
});
