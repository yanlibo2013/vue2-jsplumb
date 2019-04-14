import { pk } from "../../mutation-types/index";

//获取对比数据
export const getProductInfo = ({ commit }, data) => {
  commit(pk.GET_AD_VIEW, data);
};

export const setParam = ({ commit }, data) => {
  commit(pk.SET_pk_PARAM, data);
};
