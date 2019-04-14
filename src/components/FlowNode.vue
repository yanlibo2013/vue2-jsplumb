<template>
  <div>
    <div
      class="flow-node"
      :data-addEndpoint="customStep(id, type)"
      :style="{
        left: x +'px',
        top: y +'px',
        color: returnColorByType(type),
        borderColor: returnColorByType(type)
      }"
      @dblclick="handleNodeDbclick"
    >
      <dl>
        <dt>
          <i :class="returnIconByType(type)"/>
        </dt>
        <dd>
          <p class="step-name">{{ name }}</p>
          <p class="step-id">ID: {{ id }}</p>
        </dd>
      </dl>
      <div class="operation">
        <span>
          <i class="el-icon-star-off"/>
          <i class="el-icon-delete"/>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "ChartNode",
  // props 验证
  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    x: {
      type: Number
    },
    y: {
      type: Number
    }
  },
  data() {
    return {
      jsplumbInstance: null,
      jsp:null
    };
  },
  created() {
    
    this.initJsplumb();
      console.log("子组件 created", this.jsp);
  },
  mounted() {
    console.log("子组件", this.mounted);
  },
  methods: {
    handleNodeDbclick() {
      this.$emit("edit");
    },

  },
  watch: {
    jsp(val, oldval) {
      console.log("子组件 watch");
      console.log(val);
      console.log(oldval);
    }
  }
};
</script>
<style lang="scss">
.flow-node {
  line-height: 1;
  cursor: pointer;
  border-width: 2px;
  border-style: solid;
  box-shadow: 0 10px 18px -9px rgba(0, 0, 0, 0.5);
  background: #ffffff;
  height: 70px;
  width: 150px;
  position: absolute;
  dl {
    display: flex;
    padding: 4px;
    dt {
      margin-right: 5px;
      i {
        font-size: 30px;
      }
    }
    .step-name {
      font-size: 14px;
      font-weight: 900;
      width: 100px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .step-id {
      margin-top: 3px;
      font-size: 10px;
    }
  }
  .operation {
    padding-right: 10px;
    span {
      float: right;
    }
  }
}
</style>


