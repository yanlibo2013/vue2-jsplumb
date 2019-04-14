import Vue from "vue";
import Vuex from "vuex";
import createLogger from "vuex/dist/logger";
import actions from "./action/index";
import getters from "@/store/getters";
import mutations from "./modules/index";

const debug = process.env.NODE_ENV !== "production";
Vue.use(Vuex);

const state = {
  isLoading: true,
  searchProduct1: "",
  searchProduct2: "",
  historyProductInfo: ""
};

const store = new Vuex.Store({
  state,
  actions,
  modules: mutations,
  getters,
  plugins: debug ? [createLogger()] : []
});

export default store;
