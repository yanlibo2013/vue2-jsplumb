<template>
  <drop class="workplace" @drop="handleDrop" id="workplace">
    <ul class="step-list">
      <li
        v-for="(item) in steps"
        :id="item.id"
        :key="item.id"
        class="step-item"
        :data-addEndpoint="customStep(item.id, item.type)"
        :style="{
        left: item.x +'px',
        top: item.y +'px',
        color: returnColorByType(item.type),
        borderColor: returnColorByType(item.type)
      }"
        @dblclick="querySourceData(item.id, item.type)"
      >
        <dl>
          <dt>
            <i :class="returnIconByType(item.type)"/>
          </dt>
          <dd>
            <p class="step-name">{{ item.name }}</p>
            <p class="step-id">ID: {{ item.name }}</p>
          </dd>
        </dl>
        <div class="operation">
          <span>
            <i class="el-icon-star-off"/>
            <i class="el-icon-delete"/>
          </span>
        </div>
      </li>
    </ul>
  </drop>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      jsplumbInstance: null,
      steps: [],
      querySourceMap: {},
      links: [],
      connectorPaintStyle: {
        // 基本连接线样式
        strokeWidth: 2,
        stroke: "#4e5568",
        joinstyle: "round",
        outlineColor: "white",
        outlineWidth: 0
      },
      connectorHoverStyle: {
        // 鼠标悬浮在连接线上的样式
        strokeWidth: 3,
        stroke: "#ff4e4e",
        outlineColor: "white",
        outlineWidth: 0
      },
      origin: {
        // 起点
        endpoint: ["Dot", { radius: 8 }], // 端点的形状
        connectorStyle: this.connectorPaintStyle, // 连接线的颜色，大小样式
        connectorHoverStyle: this.connectorHoverStyle,
        paintStyle: {
          stroke: "#4e5568",
          fill: "transparent",
          radius: 6,
          lineWidth: 6
        }, // 端点的颜色样式
        // anchor: "AutoDefault",
        isSource: true, // 是否可以拖动（作为连线起点）
        connector: [
          "Flowchart",
          { stub: [5, 5], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }
        ], // 连接线的样式种类有[Bezier],[Flowchart],[StateMachine ],[Straight ]
        isTarget: false, // 是否可以放置（连线终点）
        maxConnections: 1, // 设置连接点最多可以连接几条线,-1表示无限大
        connectorOverlays: [["Arrow", { width: 10, length: 10, location: 1 }]]
      },
      destination: {
        // 终点
        endpoint: ["Dot", { radius: 6 }], // 端点的形状
        connectorStyle: this.connectorPaintStyle, // 连接线的颜色，大小样式
        connectorHoverStyle: this.connectorHoverStyle,
        paintStyle: { fill: "#4e5568" }, // 端点的颜色样式
        isSource: false, // 是否可以拖动（作为连线起点）
        connector: [
          "Straight",
          { stub: [5, 5], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }
        ], // 连接线的样式种类有[Bezier],[Flowchart],[StateMachine ],[Straight ]
        isTarget: true, // 是否可以放置（连线终点）
        maxConnections: 1, // 设置连接点最多可以连接几条线,-1表示无限大
        connectorOverlays: [["Arrow", { width: 10, length: 10, location: 1 }]]
      }
    };
  },
  created() {
    // console.log("子组件 created");

    // console.log("子组件 nextTick");
  },
  mounted() {
    //console.log("子组件 mounted");

    this.init([]);

    // this.init([ {
    //       'id': 'source_1',
    //       'name': 'source_1',
    //       'type': 'source',
    //       'x': 249,
    //       'y': 162
    //     },
    //     {
    //       'id': 'sink_1',
    //       'name': 'sink_1',
    //       'type': 'sink',
    //       'x': 504,
    //       'y': 156
    //     },
    //     {
    //       'id': 'validate_1',
    //       'name': 'validate_1',
    //       'type': 'validate',
    //       'x': 704,
    //       'y': 256
    //     },
    //     {
    //       'id': 'join_4',
    //       'name': 'join_4',
    //       'type': 'join',
    //       'x': 204,
    //       'y': 356
    //     },
    //     {
    //       'id': 'transform_4',
    //       'name': 'transform_4',
    //       'type': 'transform',
    //       'x': 504,
    //       'y': 356
    //     }]);
  },
  methods: {
        handleDrop(data, event) {
      //alert(`You dropped with data: ${JSON.stringify(data)}`);
      // console.log(data);
      // console.log(event);

      // this.$refs.flowpanel.nodes.push({
      //   id: data.item.id,
      //   name: data.item.id,
      //   type: data.item.name,
      //   x: event.x,
      //   y: event.y
      // });
      

      
      //  top: ui.position.top - 60 + "px",
      //       left: ui.position.left - 200 + "px"
      let id = jsPlumbUtil.uuid();
      let currentItem = {
        id,
        name: data.item.id,
        type: data.item.name,
        x: event.screenX - 250,
        y: event.screenY - 200
      };

      this.steps.push(currentItem);

      this.$nextTick(() => {
        //console.log(this.steps);
        // console.log(this.$refs.flowpanel.nodes);
        this.initNode(currentItem.id);
      });
    },
    // 根据类型返回 ICON
    returnIconByType(type) {
      if (type === "sink") {
        return "el-icon-printer";
      } else if (type === "sqlsource" || type === "source") {
        return "el-icon-share";
      } else {
        return "el-icon-news";
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
    // 初始化node节点
    initNode(el) {
      // initialise draggable elements.
      // 元素拖动，基于 katavorio.js 插件
      //console.log("初始化节点", el);
      let _self = this;
      this.jsplumbInstance.draggable(el, {
        filter: ".resize",
        containment: true,//true  限制节点拖动区域
        start(params) {
          // 拖动开始
          // console.log(params);
          //console.log("拖动开始");
        },
        drag(params) {
          // 拖动中
          //console.log("拖动中");
          // console.log(params);
        },
        stop(params) {
          // 拖动结束
         /// console.log("拖动介绍");
          // console.log(params);
          // let id = params.el.id;
          // _self.$nextTick(() => {
          //   let top = params.el.style.top;
          //   let left = params.el.style.left;
          //   _self.chartData.nodes.forEach(item => {
          //     if (item.id === id) {
          //       item.nodeStyle.left = left;
          //       item.nodeStyle.top = top;
          //     }
          //   });
          // });
        }
      });

      // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
      // version of this demo to find out about new nodes being added.

      this.jsplumbInstance.fire("jsPlumbDemoNodeAdded", el);
    },
    // 连线初始化配置
    init(data) {
      jsPlumb.ready(() => {
       
        // 数据集连线的实例111sdfdsgvfds

        this.jsplumbInstance = jsPlumb.getInstance();
        // this.jsplumbInstance.empty("step-list");
        //  this.jsplumbInstance.empty("workplace");

        this.steps = data;

         this.jsplumbInstance.setContainer("workplace");
         //jsPlumb.Defaults.Container = $('#workplace');

        // jsPlumb.detachEveryConnection();

        //  this.jsplumbInstance.deleteEveryEndpoint();

        // this.jsplumbInstance.empty("workplace");
        // 连线成功的处理

        this.connectionSuccess();
        this.defaultConenction();
        // 给每个元素添加拖拽事件

        this.$nextTick(() => {
          //jsPlumb.empty("workplace");
          let element = this.jsplumbInstance.getSelector(".step-item");
          this.jsplumbInstance.draggable(element);
          this.jsplumbInstance.fire("jsPlumbDemoLoaded", this.jsplumbInstance);
        });
      });
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
      this.addEndpoint(element, current, type);
    },
    addEndpoint(element, current, type) {
      let index = 0;
      for (let value of current.stepInformation) {
        let labels = value.label ? value.label(type)[index++] : "";
        let sign = labels ? labels[1]["label"] + "_" + element : element;
        this.$nextTick(() => {
          this.jsplumbInstance.addEndpoint(
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
    // 连线成功
    connectionSuccess() {
      this.jsplumbInstance.bind("connection", connInfo => {
        // 连线成功之后存储 links 数据 和 和 双击自己 是查找 source的词典
        let tmp = this.querySourceMap[connInfo.targetId];
        let _key = connInfo.targetEndpoint.connectionType.type;
        // 存在的话 tmp 等于一个数组
        if (tmp) {
          tmp.push({
            [_key]: connInfo.sourceId
          });
        } else {
          // 如果不存在 数组 push 一条数据
          this.querySourceMap[connInfo.targetId] = [
            {
              [_key]: connInfo.sourceId
            }
          ];
        }
        this.links.push({
          source: connInfo.sourceEndpoint.connectionType.type,
          target: connInfo.targetEndpoint.connectionType.type
        });
        // 去除重复的值
        this.links = this.duplicateRemoval(this.links, "source");
      });
    },
    // 默认连线
    defaultConenction() {
      this.$nextTick(() => {
        jsPlumb.batch(() => {
          this.links.forEach(item => {
            this.jsplumbInstance.connect({
              uuids: [item.source, item.target],
              editable: true
            });
          });
        }, true);
      });
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
    }
  }
};
</script>
<style lang="scss" scoped>
.workplace {
  width: 100%;
  height: 100%;
  position: relative;
  background-image: url("../assets/img/designBg.png");
  .step-list {
    line-height: 1;
    height: 100%;
    //position: relative;
    li {
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
  }
}
</style>
