<template>
  <el-container class="container workplace-chart" id="work-container">
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

      <!-- <drop class="workplace" @drop="handleDrop" id="workplace">
        <div class="work-flow-panel" >
          <flow-panel ref="flowpanel"/>
        </div>
      </drop>-->
      <flow-panel ref="flowpanel"/>
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
import { jsPlumb } from "jsplumb";
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
        ///
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
      }
    };
  },
  created() {},
  mounted() {
    //
    // this.$refs.flowpanel.nodes.push({
    //   id: "source_1",
    //   name: "source_1",
    //   type: "source",
    //   x: 249,
    //   y: 162
    // });
    // this.$nextTick(() => {
    //   console.log(this.$refs.flowpanel.nodes);
    //   this.$refs.flowpanel.initNode(this.$refs.flowpanel.nodes);
    // });
    // this.$nextTick(() => {
    //   this.$refs.flowpanel.initNode([
    //     {
    //       id: "source_1",
    //       name: "source_1",
    //       type: "source",
    //       x: 249,
    //       y: 162
    //     }
    //     // {
    //     //   id: "sink_1",
    //     //   name: "sink_1",
    //     //   type: "sink",
    //     //   x: 504,
    //     //   y: 156
    //     // },
    //     // {
    //     //   id: "validate_1",
    //     //   name: "validate_1",
    //     //   type: "validate",
    //     //   x: 704,
    //     //   y: 256
    //     // },
    //     // {
    //     //   id: "join_4",
    //     //   name: "join_4",
    //     //   type: "join",
    //     //   x: 204,
    //     //   y: 356
    //     // },
    //     // {
    //     //   id: "transform_4",
    //     //   name: "transform_4",
    //     //   type: "transform",
    //     //   x: 504,
    //     //   y: 356
    //     // }
    //   ]);
    // });
  },
  methods: {
    ...mapActions(["setParam"]),
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
      data.forEach(item => {
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
      //console.log("点击模板", key);
      
      this.$refs.flowpanel.clearAllpanel();



      // this.$refs.flowpanel.chartData = {
      //   nodes: [
      //         {
      //     'id': 'source_1',
      //     'name': 'source_1',
      //     'type': 'source',
      //     'x': 249,
      //     'y': 162
      //   },
      //   ],
      //   connections: [],
      //   props: {}
      // };

      // this.$refs.flowpanel.init( [
      //         {
      //     'id': 'source_1',
      //     'name': 'source_1',
      //     'type': 'source',
      //     'x': 249,
      //     'y': 162
      //   },]
      //   );

      //     this.$refs.flowpanel.jsplumbInstance.empty("workplace");
      //       this.$refs.flowpanel.chartData = {
      //   nodes: [
      //   ],
      //   connections: [],
      //   props: {}
      // };

      // this.$refs.flowpanel.init( [
      //       {
      //   'id': 'source_1',
      //   'name': 'source_1',
      //   'type': 'source',
      //   'x': 249,
      //   'y': 162
      // },]
      // );

      //console.log("清空操作",this.$refs.flowpanel.chartData);

      return;

      // if (key) {
      //   this.templateList.forEach(item => {
      //     if (item.key === key) {
      //       item.isActive = true;
      //     } else {
      //       item.isActive = false;
      //     }
      //   });
      //   // let url = "./static/json/" + key + ".json";
      //   let url = "/static/json/" + key + ".json";

      //   this.$axios
      //     .get(url)
      //     .then(resp => {
      //       console.log(resp);
      //       this.chartData = resp.data;
      //       this.$nextTick(() => {
      //         // this.chartData.nodes.forEach(item => {
      //         //   this.initNode(item.id);
      //         // });
      //         // // this.jsp.empty();
      //         // this.chartData.connections.forEach(item => {
      //         //   this.jsp.connect({
      //         //     source: item.sourceId,
      //         //     target: item.targetId
      //         //   });
      //         // });
      //         this.draw(this.chartData);
      //       });
      //     })
      //     .catch(err => {
      //       console.log(err);
      //     });
      // } else {
      //   console.log("新建流程", this.chartData.nodes);
      //   this.$nextTick(() => {
      //     this.chartData.nodes.push({
      //       id: "start",
      //       icon: "el-icon-loading",
      //       type: "circle",
      //       text: "开始",
      //       nodeStyle: {
      //         top: "100px",
      //         left: "300px"
      //       }
      //     });
      //     this.$nextTick(() => {
      //       this.jsp.batch(() => {
      //         this.initNode(jsPlumb.getSelector("#start"));
      //       });
      //     });
      //   });
      // }
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
    }

    // 根据类型返回 ICON
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


