import { pk } from '../../mutation-types/index';

console.log(pk.GET_AD_VIEW);

const history = {
  state: {
    historyProductInfo1: {},
    analyseProduct:"",
    // searchProduct1:"",
    // searchProduct2:"",
    param:{}
  },
  mutations: {
    [pk.GET_AD_VIEW](state, data){
      state.historyProductInfo1 = data;
    },
    [pk.SET_pk_PARAM](state, data){
      state.param = data;
    }
  }
}

export default history;



// export default {
//   [pk.GET_AD_VIEW](state, data){
//     state.historyProductInfo = data;
//   },
// }
