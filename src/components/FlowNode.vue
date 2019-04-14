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
    },
    jsp:{
      type:Object
    }
  },
  data() {
    return {
    };
  },
  created() {
    //this.initJsplumb();
    console.log("子组件 created", this.jsp);
  },
  mounted() {
    console.log("子组件", this.jsp);
  },
  methods: {
    handleNodeDbclick() {
      this.$emit("edit");
    },

    returnIconByType(type) {
      if (type === "sink") {
        return "el-icon-printer";
      } else if (type === "sqlsource" || type === "source") {
        return "el-icon-share";
      } else {
        return "el-icon-news";
      }
    },

    // 根据字段是否在数组 返回当前对象
    // 比如 type 是否在 array 数组中 type 中
    // array = [
    //   {
    //     type: ['type1', 'type2']
    //   }
    // ]
    getCurrentObj(type, step) {
      for (let value of step) {
        if (value.type.includes(type)) {
          return value;
        }
      }
    },
    getLable(type) {
      // 按文字分类
      // 右边两个点 yes no
      let step = [
        // 右边两个点 yes no
        {
          type: ["decision", "split"],
          text: ["yes", "no"],
          location: [[-2, 0], [-2, 1.2]]
        },
        // 右边两个点 ok  error
        {
          type: ["validate"],
          text: ["ok", "error"],
          location: [[2, -0.5], [2.5, 1.2]]
        },
        // 左边连个点 left right
        {
          type: ["join", "productjion"],
          text: ["left", "right"],
          location: [[-2, 0], [-2, 1.2]]
        },
        // 左边连个点 input1 input2
        {
          type: ["minus"],
          text: ["input1", "input2"],
          location: [[2, -0.5], [2.5, 1.2]]
        }
      ];
      let current = this.getCurrentObj(type, step);
      if (!current) {
        return false;
      }
      return [
        [
          "Label",
          {
            label: current.text[0],
            id: "label-1",
            cssClass: "aLabel",
            location: current.location[0]
          }
        ],
        [
          "Label",
          {
            label: current.text[1],
            id: "label-2",
            cssClass: "aLabel",
            location: current.location[1]
          }
        ]
      ];
    },
    customStep(element, type) {
      let step = [
        // 只有左边一个点
        {
          type: ["sink"],
          stepInformation: [
            { position: "Left", style: "destination", type: "input" }
          ],
          maxConnections: 1
        },
        // 右边一个点
        {
          type: ["sqlsource", "source"],
          stepInformation: [
            { position: "Right", style: "origin", type: "output" }
          ],
          maxConnections: 100
        },
        // 左边一个点， 右边两个点
        {
          type: ["decision", "validate", "split"],
          stepInformation: [
            { position: "Left", style: "destination", type: "input" },
            {
              position: [1, 0.3, 0, 0],
              style: "origin",
              label: this.getLable,
              type: "output"
            },
            {
              position: [1, 0.7, 0, 0],
              style: "origin",
              label: this.getLable,
              type: "output"
            }
          ],
          maxConnections: 1
        },
        // 左边两个点， 右边一个点
        {
          type: ["minus", "join", "lookup", "productjoin"],
          stepInformation: [
            { position: "Right", style: "origin", type: "output" },
            {
              position: [0, 0.3, 0, 0],
              style: "destination",
              label: this.getLable,
              type: "input"
            },
            {
              position: [0, 0.7, 0, 0],
              style: "destination",
              label: this.getLable,
              type: "input"
            }
          ],
          maxConnections: 1
        },
        // 左右两个点
        {
          type: [
            "supplement",
            "sample",
            "filter",
            "sql",
            "transform",
            "aggregate",
            "top",
            "lookupTable",
            "intersect",
            "union",
            "lookup",
            "starjoin"
          ],
          stepInformation: [
            { position: "Left", style: "destination", type: "input" },
            { position: "Right", style: "origin", type: "output" }
          ],
          maxConnections: 1
        }
      ];
      let current = this.getCurrentObj(type, step);
      if (!current) {
        console.error(`${type} 类型不存在`);
        return;
      }
         this.$nextTick(() => {
           this.addEndpoint(element, current, type);
         });
      
    },
    addEndpoint(element, current, type) {

      console.log(element);
      console.log(current);
      console.log(type);
      let index = 0;
      for (let value of current.stepInformation) {
        let labels = value.label ? value.label(type)[index++] : "";
        let sign = labels ? labels[1]["label"] + "_" + element : element;
        this.$nextTick(() => {
          console.log(
            "/////////////////////////////////////////////////",
            this.jsp
          );

          this.jsp.addEndpoint(
            element,
            {
              anchors: value.position,
              maxConnections: current.maxConnections,
              connectionType: {
                type: value.type + "_" + sign
              },
              uuid: value.type + "_" + sign,
              overlays: labels ? [labels] : ""
            },
            this[value["style"]]
          );
        });
      }
    },

    // 数组对象去重
    duplicateRemoval(arr, _key) {
      let map = new Map();
      arr.forEach((item, index) => {
        if (!map.has(item[_key])) {
          map.set(item[_key], item);
        }
      });
      return [...map.values()];
    },
    // 查找前查找是谁链接的自己 和判断是否已经连线
    querySourceData(id, type) {
      // source  sqlsource 特殊处理 没有连线也可以双击
      if (type === "source" || type === "sqlsource") {
        console.log("处理");
        return true;
      }
      let querySource = this.querySourceMap[id];
      // 没有连线
      if (!querySource) {
        console.log("没有连线");
        return false;
      }
      let isLine = "";
      // 如果能走到这 判断 是一根线 还是两根线  根据 getLabel 来判断 this.querySourceMap[id] 里边是一个值 还是两个值
      if (this.getLable(type)) {
        isLine = querySource.length === 2 ? querySource : false;
      } else {
        isLine = querySource.length === 1 ? querySource : false;
      }
      if (isLine) {
        console.log("处理");
      } else {
        console.log("没有连线");
      }
    },

    // 根据类型返回 color
    returnColorByType(type) {
      if (type === "sink") {
        return "#8367df";
      } else if (type === "sqlsource" || type === "source") {
        return "#48c038";
      } else {
        return "#4586f3";
      }
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


