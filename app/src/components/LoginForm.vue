<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

// Adapter login form. Was components/login — the imperative Vue 1 flow
// (`new Login({el})`, `$on('login-submit')`, `$remove().$destroy()`,
// `$promise`) is replaced by a plain declarative component: the parent shows
// it via v-if and drives authentication from the emitted `submit`.
const props = defineProps({
  failure: { type: Boolean, default: false },
  username: { type: String, default: '' },
  hint: { type: String, default: '' },
});
const emit = defineEmits(['submit']);
const { t } = useI18n();

const username = ref(props.username);
const password = ref('');

function onSubmit() {
  emit('submit', username.value, password.value);
}
</script>

<template>
  <div class="panel panel-primary">
    <div class="panel-heading">
      <h3 class="panel-title">{{ t('login.login') }}</h3>
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -- hint is operator-provided config, not user input -->
    <div v-if="hint" class="panel-footer" v-html="hint"></div>
    <div class="panel-body">
      <form @submit.prevent="onSubmit">
        <div v-if="failure" class="alert alert-danger" role="alert">{{ t('login.failure') }}</div>
        <div class="form-group">
          <label for="ap-login-username">{{ t('login.username') }}</label>
          <input id="ap-login-username" v-model="username" type="text" class="form-control" autocomplete="username" :placeholder="t('login.username')" />
        </div>
        <div class="form-group">
          <label for="ap-login-password">{{ t('login.password') }}</label>
          <input id="ap-login-password" v-model="password" type="password" class="form-control" autocomplete="current-password" :placeholder="t('login.password')" />
        </div>
        <button type="submit" class="btn btn-default">{{ t('login.login') }}</button>
      </form>
    </div>
  </div>
</template>
