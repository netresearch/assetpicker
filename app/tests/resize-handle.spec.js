import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ResizeHandle from '../src/components/ResizeHandle.vue';

function mouseEvent(type, pageX) {
  const event = new Event(type, { bubbles: true });
  if (pageX !== undefined) {
    Object.defineProperty(event, 'pageX', { value: pageX });
  }
  return event;
}

let host;
function mountInHost() {
  host = document.createElement('div');
  document.body.appendChild(host);
  return mount(ResizeHandle, { attachTo: host });
}

afterEach(() => {
  host?.remove();
  host = undefined;
});

describe('ResizeHandle', () => {
  it('emits move and exposes x while dragging', () => {
    const wrapper = mountInHost();
    const el = wrapper.element;

    el.dispatchEvent(mouseEvent('mousedown'));
    el.parentNode.dispatchEvent(mouseEvent('mousemove', 123));

    expect(wrapper.emitted('move')?.[0]).toEqual([123]);
    expect(wrapper.vm.x).toBe(123);
    wrapper.unmount();
  });

  it('stops dragging after mouseup', () => {
    const wrapper = mountInHost();
    const el = wrapper.element;

    el.dispatchEvent(mouseEvent('mousedown'));
    el.parentNode.dispatchEvent(mouseEvent('mousemove', 100));
    document.body.dispatchEvent(mouseEvent('mouseup'));
    el.parentNode.dispatchEvent(mouseEvent('mousemove', 200));

    expect(wrapper.emitted('move')).toHaveLength(1);
    expect(wrapper.vm.x).toBe(100);
    wrapper.unmount();
  });
});
