// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from "./store/index";

// axios
import axios from 'axios'
Vue.prototype.$axios = axios;

// element-ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// style
import './style/index.scss';
import './style/jsplumb-demo.scss';
// jsplumb
// import 'jsplumb/dist/js/jsplumb.min.js';
// import 'jsplumb/css/jsplumbtoolkit-defaults.css';

// html2canvas
import html2canvas from 'html2canvas';


import VueDragDrop from 'vue-drag-drop';

Vue.use(VueDragDrop);
Vue.use(ElementUI);

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
