<template>
  <el-container class="container workplace-chart " id="work-container">
    <el-aside width="200px">
      <div class="template-box">
        <div class="header">
          Flow
          <i class="el-icon-circle-plus-outline add" title="新建" @click="handleClickTemp()"></i>
        </div>
        <ul class="template-list">
          <li
            class="item"
            :class="{'active':item.isActive}"
            v-for="item in templateList"
            :key="item.key"
            @click="handleClickTemp(item.key)"
          >
            {{item.name}}
            <!-- <router-link to="/demo-chart/fir"></router-link> -->
          </li>
        </ul>
      </div>
    </el-aside>
    <el-main>
      <!-- <el-button class="btn-save" @click="saveChart" type="success">保存</el-button> -->
      <!-- <el-button class="btn-save-img" @click="saveChartImg" type="info">保存为图片</el-button> -->
      <drop class="workplace " @drop="handleDrop">
        <div class="work-flow-panel" id="workplace">
          <!-- <template v-for="(item, idx) in flowNode">
            <flow-node v-bind="item" :key="idx" :jsp="param"></flow-node>
          </template>-->

          <!-- <flow-node v-for="(item, idx) in flowNode" v-bind="item" :key="idx" :jsp="param"></flow-node> -->
          <!-- <div
            v-for="(item, idx) in flowNodes"
            :key="idx"
            class="flow-node"
            :data-addEndpoint="customStep(item.id, item.type)"
            :style="{
              left: item.x +'px',
              top: item.y +'px',
              color: returnColorByType(item.type),
              borderColor: returnColorByType(item.type)
            }"
          >
            <dl>
              <dt>
                <i :class="returnIconByType(item.type)"/>
              </dt>
              <dd>
                <p class="step-name">{{ item.name }}</p>
                <p class="step-id">ID: {{ item.id }}</p>
              </dd>
            </dl>
            <div class="operation">
              <span>
                <i class="el-icon-star-off"/>
                <i class="el-icon-delete"/>
              </span>
            </div>
          </div> -->

          <flow-panel/>
        </div>
      </drop>
    </el-main>
    <el-aside width="300px">
      <right-aside></right-aside>
    </el-aside>

    <!-- 模型保存弹出层 -->
    <el-dialog title="智能模型保存" :visible.sync="dialogFormVisible">
      <el-form :model="chartForm" ref="chartForm" :label-width="formLabelWidth">
        <el-form-item label="模型名称">
          <el-input v-model="chartForm.name" auto-complete="off" placeholder="请输入模型名称"></el-input>
        </el-form-item>
        <el-form-item label="批注内容">
          <el-input
            type="textarea"
            :autosize="true"
            v-model="chartForm.msg"
            auto-complete="off"
            placeholder="请输入模型批注内容"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSave">取 消</el-button>
        <el-button type="primary" @click="submitSave">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 节点属性设置弹出层 -->
    <el-dialog :visible.sync="dialogFormVisible2">
      <div slot="title">属性设置</div>
      <el-form :model="nodeForm" ref="nodeForm" :label-width="formLabelWidth">
        <el-form-item label="开始时间">
          <el-date-picker v-model="nodeForm.startTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="nodeForm.endTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
        </el-form-item>
        <el-form-item label="最小出现天数">
          <el-input v-model="nodeForm.minDays" placeholder="请输入最小出现天数" style="width:100px"></el-input>
          <span>（请输入大于0的整数）</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveNodeEdit">确 定</el-button>
          <el-button @click="cancelSaveNodeEdit">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <div id="canvasDiv" style="display: none;"></div>
  </el-container>
</template>

<script>
import { jsPlumb } from 'jsplumb'
import { mapState, mapActions } from "vuex";
import ChartNode from "@/components/ChartNode";
import FlowNode from "@/components/FlowNode";
import ChartGroup from "@/components/ChartGroup";
import RightAside from "@/components/RightAside";
import FlowPanel from "@/components/FlowPanel";
// import html2canvas from "html2canvas";
export default {
  name: "DemoChart",
  data() {
    return {
      dialogFormVisible: false,
      dialogFormVisible2: false,
      chartForm: {
        name: "",
        msg: ""
      },
      formLabelWidth: "100px",
      nodeForm: {
        startTime: "",
        endTime: "",
        minDays: ""
      },
      templateList: [
        // {
        //   name: "模板一",
        //   key: "json.1"
        // },
        // {
        //   name: "模板二",
        //   key: "json.2"
        // }
      ],
      list: [
        [
          {
            icon: "el-icon-menu",
            name: "节点1-1",
            type: "diamond"
          },
          {
            icon: "el-icon-star-on",
            name: "节点1-2",
            type: "diamond"
          },
          {
            icon: "el-icon-location",
            name: "节点1-3",
            type: "diamond"
          }
        ],
        [
          {
            icon: "el-icon-date",
            name: "节点2-1",
            type: "diamond"
          },
          {
            icon: "el-icon-time",
            name: "节点2-2",
            type: "diamond"
          },
          {
            icon: "el-icon-bell",
            name: "节点2-3",
            type: "diamond"
          }
        ],
        [
          {
            icon: "el-icon-tickets",
            name: "节点3-1",
            type: "circle"
          },
          {
            icon: "el-icon-upload",
            name: "结束",
            type: "circle"
          }
        ],
        [
          {
            icon: "el-icon-more",
            name: "组",
            type: "group"
          }
        ]
      ],
      jsp: null,
      chartData: {
        nodes: [
          {
            id: "start",
            icon: "el-icon-loading",
            type: "circle",
            text: "开始",
            nodeStyle: {
              top: "100px",
              left: "300px"
            }
          }
        ],
        connections: [],
        props: {}
      },
      flowNodes: [
        {
          id: "source_1",
          name: "source_1",
          type: "source",
          x: 249,
          y: 162
        }
      ],

      flowData: [],
      //基本连接线样式
      connectorPaintStyle: {
        lineWidth: 4,
        strokeStyle: "#61b7cf",
        joinstyle: "round",
        outlineColor: "white",
        outlineWidth: 2
      },
      // 鼠标悬停浮在连接线上的样式
      connectorHoverStyle: {
        lineWidth: 4,
        strokeStyle: "#216477",
        outlineColor: "white",
        outlineWidth: 2
      },

      // 空心圆端点样式
      hollowCircle: {
        endpoint: [
          "Dot",
          {
            radius: 10
          }
        ], // 断点的形状
        connectorStyle: this.connectorPaintStyle, // 连接线的颜色, 大小样式
        connectorHoverStyle: this.connectorHoverStyle,
        paintStyle: {
          strokeStyle: "#1e8151", // 边框颜色
          fillStyle: "transparent",
          radius: 6,
          lineWidth: 3 // 边框宽度
        }, // 端点的颜色样式
        // anchor: 'AutoDefault',
        isSource: true,
        connector: [
          "Flowchart",
          {
            stub: [30, 60],
            gap: 10,
            cornerRadius: 5, //转角
            alwaysRespectStubs: true
          }
        ], // 连接线的样式种类有[Bezier], [Flowchart], [StateMachine], [Straight]
        isTarget: true,
        maxConnections: -1,
        connectorOverlays: [
          [
            "Arrow",
            {
              width: 13,
              length: 12,
              location: 1
            }
          ]
        ]
      },

      // 实心圆样式
      solidCircle: {
        endpoint: [
          "Dot",
          {
            radius: 8
          }
        ], // 断点的形状
        paintStyle: {
          fillStyle: "#58bc58"
        }, // 端点的颜色样式
        connectorStyle: {
          strokeStyle: "rgb(97, 183, 207)",
          lineWidth: 4
        }, //连接线的颜色, 大小样式
        isSource: true, // 是否可以拖动（作为连线起点）
        connector: [
          "Flowchart",
          {
            stub: [40, 60],
            gap: 10,
            cornerRadius: 7,
            alwaysRespectStubs: true
          }
        ],
        isTarget: true,
        maxConnections: 3,
        connectorOverlays: [
          [
            "Arrow",
            {
              width: 10,
              length: 10,
              location: 1
            }
          ]
        ]
      },
         links: [
      ],
    };
  },
  // created() {
  //   console.log("created 父组件");

  //      // 初始化 jsplumb
  //   // this.$nextTick(() => {
  //   //   //this.initJsplumb();
  //   //   this.init();
  //   // })
  // },
  mounted() {
    //console.log("mounted");

    // this.initJsplumb();

    console.log("父组件 mounted");
  },
  methods: {
    ...mapActions(["setParam"]),
    initJsplumb() {
      const _self = this;

      jsPlumb.ready(() => {
        // 默认配置
        
        // var instance = jsPlumb.getInstance({
        //   // Connector: "Straight",//节点连线样式设定
        //   Connector: [
        //     "Flowchart",
        //     {
        //       stub: [30, 60],
        //       gap: 10,
        //       cornerRadius: 5, //转角
        //       alwaysRespectStubs: true
        //     }
        //   ], // 连接线的样式种类有[Bezier], [Flowchart], [StateMachine], [Straight]
        //   HoverPaintStyle: { stroke: "#1e8151", strokeWidth: 2 },
        //   ConnectionOverlays: [
        //     [
        //       "Arrow",
        //       {
        //         width: 13,
        //         length: 12,
        //         location: 1
        //       }
        //     ]
        //   ],

        //   Container: "workplace"
        // });
        instance = jsPlumb.getInstance();
        this.jsp=instance;

        console.log("ready", this.jsp);

        var canvas = document.getElementById("workplace");

        // 删除连接线
        // instance.bind("click", function(c) {
        //   instance.deleteConnection(c);
        // });

        // 监听 connection 事件
        instance.bind("connection", function(info) {
          // info.connection.getOverlay("label").setLabel(info.connection.id);
          console.log("监听 connection 事件");
        });
        // 连接线删除时触发
        instance.bind("connectionDetached", function(connection) {
          console.log("连接线删除时触发");
          // console.log(connection)
          // _self.chartData.connections.forEach((conn, idx) => {
          //   if (connection.sourceId === conn.sourceId && connection.targetId === conn.targetId) {
          //     _self.chartData.connections.splice(idx, 1)
          //   }
          // });
        });
        // 监听拖动connection 事件，判断是否有重复链接
        instance.bind("beforeDrop", function(info) {
          console.log("监听拖动connection 事件，判断是否有重复链接");
          // info.connection.getOverlay("label").setLabel(info.connection.id);
          console.log(info);
          console.log("节点之间连线变化", _self.chartData.connections);

          // 判断是否已有该连接
          let isSame = true;
          _self.chartData.connections.forEach(item => {
            if (
              (item.targetId === info.targetId &&
                item.sourceId === info.sourceId) ||
              (item.targetId === info.sourceId &&
                item.sourceId === info.targetId)
            ) {
              isSame = false;
            }
          });
          if (isSame) {
            _self.chartData.connections.push({
              targetId: info.targetId,
              sourceId: info.sourceId
            });
          } else {
            _self.$message.error("不允许重复连接！");
          }
          return isSame;
        });
      });
    },
    // 初始化node节点
    initNode(el) {
      // initialise draggable elements.
      // 元素拖动，基于 katavorio.js 插件
      console.log("初始化节点", el);
      let _self = this;
      _self.switchType(el);
      this.jsp.draggable(el, {
        filter: ".resize",
        // containment: true,
        start(params) {
          // 拖动开始
          // console.log(params);
        },
        drag(params) {
          // 拖动中
          // console.log(params);
        },
        stop(params) {
          // 拖动结束
          console.log(params);
          let id = params.el.id;
          _self.$nextTick(() => {
            let top = params.el.style.top;
            let left = params.el.style.left;
            _self.chartData.nodes.forEach(item => {
              if (item.id === id) {
                item.nodeStyle.left = left;
                item.nodeStyle.top = top;
              }
            });
          });
        }
      });

      // this.jsp.makeSource(el, {
      //   filter: ".ep",
      //   anchor: "Continuous",
      //   anchor: ["Perimeter", { shape: "Rectangle" }],
      //   connectorStyle: {
      //     stroke: "#5c96bc",
      //     strokeWidth: 2,
      //     outlineStroke: "transparent",
      //     outlineWidth: 4
      //   },
      //   extract: {
      //     action: "the-action"
      //   },
      //   maxConnections: -1,
      //   onMaxConnections: function(info, e) {
      //     alert("Maximum connections (" + info.maxConnections + ") reached");
      //   }
      // });

      // this.jsp.makeTarget(el, {
      //   dropOptions: { hoverClass: "dragHover" },
      //   anchor: ["Perimeter", { shape: "Rectangle" }],
      //   allowLoopback: false
      // });

      // // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
      // // version of this demo to find out about new nodes being added.

      // this.jsp.fire("jsPlumbDemoNodeAdded", el);
    },
    // 保存
    saveChart() {
      this.dialogFormVisible = true;
      // console.log(this.jsp.getConnections());
      console.log(this.chartData);
      // jsPlumb.repaintEverything();
    },
    /**
     * @description 取消保存
     */
    cancelSave() {
      this.dialogFormVisible = false;
      this.chartForm = {
        name: "",
        msg: ""
      };
      this.$message.info("已取消保存");
    },
    submitSave() {
      this.dialogFormVisible = false;
      this.chartData.props = this.chartForm;
      this.$message.success("保存成功");
    },
    /**
     * @description 流程渲染
     * @param {data} 流程数据
     */
    draw(data) {
      data.nodes.forEach(item => {
        this.initNode(item.id);
      });
      // this.jsp.empty();
      data.connections.forEach(item => {
        this.jsp.connect({
          source: item.sourceId,
          target: item.targetId
        });
      });
    },
    /**
     * @description 模板点击事件
     * @param {String} key 模板关键值
     */
    handleClickTemp(key) {
      console.log("点击模板", key);

      this.chartData = {
        nodes: [],
        connections: [],
        props: {}
      };
      this.jsp.empty("workplace");
      if (key) {
        this.templateList.forEach(item => {
          if (item.key === key) {
            item.isActive = true;
          } else {
            item.isActive = false;
          }
        });
        // let url = "./static/json/" + key + ".json";
        let url = "/static/json/" + key + ".json";

        this.$axios
          .get(url)
          .then(resp => {
            console.log(resp);
            this.chartData = resp.data;
            this.$nextTick(() => {
              // this.chartData.nodes.forEach(item => {
              //   this.initNode(item.id);
              // });
              // // this.jsp.empty();
              // this.chartData.connections.forEach(item => {
              //   this.jsp.connect({
              //     source: item.sourceId,
              //     target: item.targetId
              //   });
              // });
              this.draw(this.chartData);
            });
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        console.log("新建流程", this.chartData.nodes);
        this.$nextTick(() => {
          this.chartData.nodes.push({
            id: "start",
            icon: "el-icon-loading",
            type: "circle",
            text: "开始",
            nodeStyle: {
              top: "100px",
              left: "300px"
            }
          });
          this.$nextTick(() => {
            this.jsp.batch(() => {
              this.initNode(jsPlumb.getSelector("#start"));
            });
          });
        });
      }
    },
    /**
     * @description 双击触发节点编辑事件
     * @param {Object} item 节点当前数据
     * @param {Number} idx 下标
     */
    editNode(item, idx) {
      this.dialogFormVisible2 = true;
    },
    /**
     * @description 触发节点缩放事件
     * @param {Object} item 节点当前数据
     * @param {Number} idx 下标
     */
    resizeGroup(el) {
      console.log(el);
      this.$nextTick(() => {
        this.jsp.repaintEverything();
      });
    },
    /**
     * @description 节点编辑保存
     */
    saveNodeEdit() {
      // 验证表单
      if (this.verifyNodeForm()) {
        this.$message.success("保存成功");
        this.dialogFormVisible2 = false;
      }
    },
    /**
     * @description 节点保存验证
     */
    verifyNodeForm() {
      console.log(this.nodeForm);
      let flag = false;
      if (this.nodeForm.startTime === "") {
        this.$message.warning("开始时间不能为空！");
      } else if (this.nodeForm.endTime === "") {
        this.$message.warning("结束时间不能为空！");
      } else if (this.nodeForm.minDays === "") {
        this.$message.warning("最小天数不能为空！");
      } else if (
        this.nodeForm.startTime.getTime() >= this.nodeForm.endTime.getTime()
      ) {
        this.$message.warning("开始时间必须小于结束时间！");
      } else if (
        !Number.isInteger(this.nodeForm.minDays - 0) ||
        this.nodeForm.minDays - 0 <= 0
      ) {
        this.$message.warning("请输入大于0的整数！");
      } else {
        flag = true;
      }
      return flag;
    },
    /**
     * @description 取消保存
     */
    cancelSaveNodeEdit() {
      this.dialogFormVisible2 = false;
    },
    /**
     * @description 保存为图片
     */
    saveChartImg() {
      var statemachinediv = document.getElementById("workplace");

      html2canvas(statemachinediv, {
        onrendered: function(canvas) {
          console.log(canvas);

          $("#canvasDiv").empty();
          document.getElementById("canvasDiv").appendChild(canvas);
          var svgList = $(statemachinediv).find("svg");

          svgList.each(function(index, value) {
            try {
              var svgExample = this;

              var serializer = new XMLSerializer();
              var svgMarkup = serializer.serializeToString(svgExample);
              console.log(svgMarkup);

              if (svgMarkup.indexOf("_jsPlumb_connector") > -1) {
                var leftIndex = svgMarkup.indexOf("left: ");
                var endOfLeft = svgMarkup.indexOf("px", leftIndex);
                var leftPosition = svgMarkup.substring(
                  leftIndex + 6,
                  endOfLeft
                );
                var left = parseInt(leftPosition);

                var topIndex = svgMarkup.indexOf("top: ");
                var endOfTop = svgMarkup.indexOf("px", topIndex);
                var topPosition = svgMarkup.substring(topIndex + 5, endOfTop);
                var top = parseInt(topPosition);

                svgMarkup = svgMarkup.replace(
                  'xmlns="http://www.w3.org/2000/svg"',
                  ""
                );

                var connectorCanvas = document.createElement("canvas");
                canvg(connectorCanvas, svgMarkup); //add connector to canvas

                var context = canvas.getContext("2d");
                context.drawImage(connectorCanvas, left, top);
              }
            } catch (err) {
              showBalloon("error in print");
            }
          });

          let ctx = canvas.getContext("2d");

          var image = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
          // window.location.href=image; // it will save locally
          var saveFile = function(data, filename) {
            var save_link = document.createElementNS(
              "http://www.w3.org/1999/xhtml",
              "a"
            );
            save_link.href = data;
            save_link.download = filename;

            var event = document.createEvent("MouseEvents");
            event.initMouseEvent(
              "click",
              true,
              false,
              window,
              0,
              0,
              0,
              0,
              0,
              false,
              false,
              false,
              false,
              0,
              null
            );
            save_link.dispatchEvent(event);
          };

          // 下载后的问题名
          var filename = "下载.png";
          // download
          saveFile(image, filename);
        }
      });
    },

    switchType(id) {
      // 添加端点
      jsPlumb.addEndpoint(
        id,
        {
          anchors: "TopCenter"
        },
        this.solidCircle
      );
      jsPlumb.addEndpoint(
        id,
        {
          anchors: "RightMiddle"
        },
        this.hollowCircle
      );
      jsPlumb.addEndpoint(
        id,
        {
          anchors: "BottomCenter"
        },
        this.hollowCircle
      );
      jsPlumb.addEndpoint(
        id,
        {
          anchors: "LeftMiddle"
        },
        this.hollowCircle
      );

      console.log("添加端点");
    },
    handleDrop(data, event) {
      //alert(`You dropped with data: ${JSON.stringify(data)}`);
      // console.log(data);
      // console.log(event);
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
    // 连线初始化配置
    init() {
      jsPlumb.ready(() => {
        jsPlumb.setContainer("work-flow-panel");
        // 数据集连线的实例
        this.jsp = jsPlumb.getInstance();

        console.log("初始化对象完成",this.jsp);
        // 连线成功的处理
        this.connectionSuccess();
        this.defaultConenction();
        // 给每个元素添加拖拽事件
        let element = this.jsp.getSelector(".flow-node");
        this.jsp.draggable(element);
        this.jsp.fire("jsPlumbDemoLoaded", this.jsp);
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

          console.log("/////////////////////////////////////////////////",this.jsp);
          
          
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
    // 连线成功
    connectionSuccess() {
      this.jsp.bind("connection", connInfo => {
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
            this.jsp.connect({
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
    },
  },
  /* beforeRouteUpdate(to, from, next) {
    console.log(to, from, next);
  }, */
  // watch: {
  //   $route(to, from) {
  //     console.log(to, from);

  //     // 对路由变化作出响应...
  //   },
  //   jsp(val, oldval) {
  //     console.log("夫组件 watch");
  //     console.log(val);
  //     console.log(oldval);
  //   }
  // },
  // computed: {
  //   getJsp: function() {
  //     console.log("父组件 computed", this.jsp);
  //     return this.jsp;
  //   },
  //   ...mapState({
  //     param: state => state.pk.param
  //   })
  // },
  components: {
    ChartNode,
    ChartGroup,
    RightAside,
    FlowNode,
    FlowPanel
  }
};
</script>
<style lang="scss">
.workplace {
  width: 100%;
  height: 100%;
  position: relative;
  background-image: url("../assets/img/designBg.png");

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
}
#start {
  top: 50px;
  left: 50px;
}
.group-demo {
  position: absolute;
  width: 250px;
  height: 250px;
  background: #ccc;
  top: 250px;
  left: 300px;
}
</style>


