<!-- AR鹰眼浮窗 -->
<template>
  <div class="overlay-container">
    <!-- 全屏绘制画布 -->
    <svg
      id="drawingCanvas"
      ref="drawingCanvas"
      class="drawing-canvas"
      viewBox="0 0 1920 1080"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      @click="onCanvasClick"
      @mousemove="onCanvasMouseMove"
      @dblclick="finishDrawing"
      @contextmenu.prevent
    ></svg>
    <!-- 顶部状态栏 -->
    <div class="top-bar">
      <div class="status-info">
        <div class="status-dot" />
        <span>设备在线</span>
        <span>|</span>
        <span>{{ deviceSerial }}</span>
        <span>|</span>
        <span>{{ currentTime }}</span>
      </div>
      <div>AR鹰眼监控</div>
    </div>

    <!-- 右侧信息面板 -->
    <div class="info-panel">
      <div class="info-title">实时数据</div>
      <div class="info-item">
        <span>温度:</span>
        <span>{{ temperature }}°C</span>
      </div>
      <div class="info-item">
        <span>湿度:</span>
        <span>{{ humidity }}%</span>
      </div>
      <div class="info-item">
        <span>风速:</span>
        <span>{{ windSpeed }}m/s</span>
      </div>
      <div class="info-item">
        <span>人员:</span>
        <span>{{ personCount }}人</span>
      </div>
    </div>

    <!-- CallBridge数据展示面板 -->
    <div v-show="showCallBridgePanel" class="callbridge-panel">
      <div class="callbridge-title">CallBridge 通信监听</div>
      <div class="callbridge-status" :class="callBridgeStatusClass">
        {{ callBridgeStatusText }}
      </div>
      <div id="callbridgeMessages">
        <div
          v-for="(message, index) in callBridgeMessages"
          :key="index"
          class="callbridge-data"
        >
          <div class="callbridge-timestamp">{{ message.timestamp }}</div>
          <div class="callbridge-raw">原始: {{ message.raw }}</div>
          <div class="callbridge-parsed">解析: {{ message.parsed }}</div>
        </div>
        <div v-if="callBridgeMessages.length === 0" class="callbridge-data">
          <div class="callbridge-timestamp">等待数据...</div>
          <div class="callbridge-raw">原始数据将在这里显示</div>
          <div class="callbridge-parsed">解析后的数据将在这里显示</div>
        </div>
      </div>
    </div>

    <!-- 绘制工具栏 -->
    <div v-show="showDrawingToolbar" class="drawing-toolbar">
      <button class="tool-btn" @click="startDrawing">
        {{ isDrawing ? "⏹️ 停止绘制" : "绘制区域" }}
      </button>
      <button class="tool-btn" @click="clearAllAreas">清除全部</button>
      <button class="tool-btn" @click="copyAreasData">复制数据</button>
      <button class="tool-btn" @click="loadAreasData">加载区域</button>
      <span class="area-count"
        >区域数量: <span>{{ areas.length }}</span></span
      >
    </div>

    <!-- 绘制状态提示 -->
    <div v-show="isDrawing" class="drawing-status">
      <span>点击页面任意位置添加顶点，双击完成绘制</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
// import markerImage from "@/assets/h5/marker-1.png";

defineOptions({
  name: "H5Home"
});

// 响应式数据
const currentTime = ref("--:--:--");
const deviceSerial = ref("GC2247794");
const temperature = ref("32.1");
const humidity = ref("65");
const windSpeed = ref("2.3");
const personCount = ref("12");

// 绘制相关状态
const drawingCanvas = ref<SVGElement | null>(null);
const isDrawing = ref(false);
const currentPoints = ref<number[]>([]);
const areas = ref<any[]>([]);
const showDrawingToolbar = ref(false);
const showCallBridgePanel = ref(false);

// CallBridge相关状态
const callBridgeStatusText = ref("检查中...");
const callBridgeStatusClass = ref("not-exists");
const callBridgeMessages = ref<any[]>([]);

let areaIdCounter = 1;
let selectedAreaId: number | null = null;
let timeTimer: NodeJS.Timeout | null = null;
let dataTimer: NodeJS.Timeout | null = null;
let callBridgeTimer: NodeJS.Timeout | null = null;
const maxMessages = 10;

// 完整的初始区域数据
const AREA_DATA = [
  {
    id: 1,
    points: [
      1141.021897810219, 464.5023696682465, 1395.6204379562043,
      660.2843601895735, 1132.846715328467, 731.9431279620853
    ],
    color: "#ffa500"
    // type: "polygon"
    // labelImage: markerImage,
    // labelText: "施工区域",
    // labelOffset: { x: 50, y: -80 },
    // clickable: true
  }
];

// 时间更新
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("zh-CN", { hour12: false });
};

// 数据更新
const updateData = () => {
  temperature.value = (30 + Math.random() * 10).toFixed(1);
  humidity.value = (60 + Math.random() * 20).toFixed(0);
  windSpeed.value = (1 + Math.random() * 3).toFixed(1);
  personCount.value = Math.floor(10 + Math.random() * 10).toString();
};

// 绘制功能
const onCanvasClick = (e: MouseEvent) => {
  if (!isDrawing.value || e.detail === 2) return;

  const canvas = drawingCanvas.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const svgRect = canvas.viewBox.baseVal;

  const x = ((e.clientX - rect.left) / rect.width) * svgRect.width;
  const y = ((e.clientY - rect.top) / rect.height) * svgRect.height;

  currentPoints.value.push(x, y);
  console.log(
    `添加顶点 ${currentPoints.value.length / 2}: (${x.toFixed(1)}, ${y.toFixed(1)})`
  );

  drawPreviewPoints();
};

const onCanvasMouseMove = (e: MouseEvent) => {
  if (!isDrawing.value || currentPoints.value.length === 0) return;

  const canvas = drawingCanvas.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const svgRect = canvas.viewBox.baseVal;

  const x = ((e.clientX - rect.left) / rect.width) * svgRect.width;
  const y = ((e.clientY - rect.top) / rect.height) * svgRect.height;

  drawPreviewLine(x, y);
};

const finishDrawing = (e: MouseEvent) => {
  if (!isDrawing.value || currentPoints.value.length < 6) {
    console.log("绘制未完成：需要至少3个点才能形成多边形");
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  const newArea = {
    id: areaIdCounter++,
    name: `电子围栏${areaIdCounter - 1}`,
    points: [...currentPoints.value],
    color: getRandomColor(),
    type: "polygon",
    clickable: false
  };

  areas.value.push(newArea);
  addAreaToSVG(newArea);
  currentPoints.value = [];
  removePreviewElements();

  console.log("区域绘制完成:", newArea);
  console.log(
    `多边形已自动闭合，共${newArea.points.length / 2}个顶点，继续绘制下一个区域`
  );
};

const startDrawing = () => {
  const canvas = drawingCanvas.value;
  if (!canvas) return;

  if (isDrawing.value) {
    // 停止绘制
    isDrawing.value = false;
    currentPoints.value = [];
    canvas.style.pointerEvents = "none";
    removePreviewElements();
    console.log("停止绘制");
  } else {
    // 开始绘制
    isDrawing.value = true;
    currentPoints.value = [];
    canvas.style.pointerEvents = "auto";
    console.log("开始绘制区域 - 点击画布添加顶点，双击完成");
  }
};

// 绘制预览点
const drawPreviewPoints = () => {
  const canvas = drawingCanvas.value;
  if (!canvas) return;

  removePreviewElements();

  // 绘制已有的点
  for (let i = 0; i < currentPoints.value.length; i += 2) {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", currentPoints.value[i].toString());
    circle.setAttribute("cy", currentPoints.value[i + 1].toString());
    circle.setAttribute("r", "8");
    circle.setAttribute("fill", "#ffff00");
    circle.setAttribute("stroke", "#000000");
    circle.setAttribute("stroke-width", "3");
    circle.setAttribute("class", "preview-point");
    canvas.appendChild(circle);
  }

  // 绘制连接线
  if (currentPoints.value.length >= 4) {
    const polyline = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline"
    );
    const pointsStr = [];
    for (let i = 0; i < currentPoints.value.length; i += 2) {
      pointsStr.push(`${currentPoints.value[i]},${currentPoints.value[i + 1]}`);
    }
    polyline.setAttribute("points", pointsStr.join(" "));
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "#ffff00");
    polyline.setAttribute("stroke-width", "5");
    polyline.setAttribute("stroke-dasharray", "20,10");
    polyline.setAttribute("class", "preview-line");
    canvas.appendChild(polyline);
  }
};

// 绘制预览线
const drawPreviewLine = (x: number, y: number) => {
  const canvas = drawingCanvas.value;
  if (!canvas) return;

  removePreviewLine();

  if (currentPoints.value.length >= 2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute(
      "x1",
      currentPoints.value[currentPoints.value.length - 2].toString()
    );
    line.setAttribute(
      "y1",
      currentPoints.value[currentPoints.value.length - 1].toString()
    );
    line.setAttribute("x2", x.toString());
    line.setAttribute("y2", y.toString());
    line.setAttribute("stroke", "#ffff00");
    line.setAttribute("stroke-width", "5");
    line.setAttribute("stroke-dasharray", "20,10");
    line.setAttribute("class", "preview-cursor-line");
    canvas.appendChild(line);
  }
};

// 移除预览元素
const removePreviewElements = () => {
  const canvas = drawingCanvas.value;
  if (!canvas) return;

  const previews = canvas.querySelectorAll(".preview-point, .preview-line");
  previews.forEach(el => el.remove());
  removePreviewLine();
};

const removePreviewLine = () => {
  const canvas = drawingCanvas.value;
  if (!canvas) return;

  const line = canvas.querySelector(".preview-cursor-line");
  if (line) line.remove();
};

const addAreaToSVG = (area: any) => {
  const canvas = drawingCanvas.value;
  if (!canvas) return;

  const polygon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polygon"
  );
  const pointsStr = [];

  for (let i = 0; i < area.points.length; i += 2) {
    pointsStr.push(`${area.points[i]},${area.points[i + 1]}`);
  }

  polygon.setAttribute("id", `area-${area.id}`);
  polygon.setAttribute("points", pointsStr.join(" "));
  polygon.setAttribute("fill", `${area.color}20`);
  polygon.setAttribute("stroke", area.color);
  polygon.setAttribute("stroke-width", "6");
  polygon.setAttribute("stroke-dasharray", "30,20");
  polygon.setAttribute("stroke-linejoin", "round");
  polygon.setAttribute("class", "fence-polygon");
  polygon.setAttribute("data-area-id", area.id.toString());
  polygon.setAttribute("data-area-name", area.name || "");

  canvas.appendChild(polygon);

  // 添加区域标签
  nextTick(() => {
    addAreaLabel(area);
  });
};

// 添加区域标签
const addAreaLabel = (area: any) => {
  console.log("添加标签 - 区域数据:", area);

  // 先检查是否已存在该区域的标签，如果存在则删除
  const existingLabel = document.getElementById(`label-${area.id}`);
  if (existingLabel) {
    console.log("删除已存在的标签:", area.id);
    existingLabel.remove();
  }

  // 计算区域中心点
  const center = calculateAreaCenter(area.points);

  // 创建标签容器
  const labelContainer = document.createElement("div");
  labelContainer.className = "area-label";
  labelContainer.id = `label-${area.id}`;
  labelContainer.setAttribute("data-area-id", area.id.toString());

  // 根据配置决定标签位置
  const labelPos = getLabelPosition(area, center);
  labelContainer.style.left = labelPos.x + "px";
  labelContainer.style.top = labelPos.y + "px";

  // 生成标签内容
  let labelHTML = "";

  // 添加图片
  if (area.labelImage) {
    labelHTML += `<div class="label-image" style="background-image: url(${area.labelImage});"></div>`;
  }

  // 添加文字
  if (area.labelText) {
    console.log("添加文字:", area.labelText);
    const backgroundColor = area.color + "80";
    const borderColor = area.color;

    labelHTML += `<div class="label-text" style="
      background: ${backgroundColor};
      border-color: ${borderColor};
    ">${area.labelText}</div>`;
  }

  // 如果没有任何内容，不创建标签
  if (labelHTML === "") {
    console.log("没有标签内容，跳过创建");
    return;
  }

  labelContainer.innerHTML = labelHTML;

  // 只对配置了clickable的标签添加点击事件
  if (area.clickable === true) {
    labelContainer.style.pointerEvents = "auto";
    labelContainer.style.cursor = "pointer";

    labelContainer.addEventListener("click", function (e) {
      e.stopPropagation();
      onLabelClick(area, e);
    });

    labelContainer.addEventListener("mouseenter", function () {
      labelContainer.style.transform =
        "translate(-50%, -50%) scale(1.02) translateX(5px)";
      labelContainer.style.transition = "transform 0.2s ease";
    });

    labelContainer.addEventListener("mouseleave", function () {
      labelContainer.style.transform = "translate(-50%, -50%) scale(1)";
    });
  } else {
    labelContainer.style.pointerEvents = "none";
    labelContainer.style.cursor = "default";
  }

  // 添加到页面
  document.body.appendChild(labelContainer);
  console.log("标签已添加:", labelContainer);
};

// 标签点击事件处理函数
const onLabelClick = (area: any, event: MouseEvent) => {
  console.log("标签被点击:", area);
  alert(`区域信息:\n名称: ${area.name}\n颜色: ${area.color}\nID: ${area.id}`);
};

// 计算区域中心点
const calculateAreaCenter = (points: number[]) => {
  let sumX = 0,
    sumY = 0;
  const pointCount = points.length / 2;

  for (let i = 0; i < points.length; i += 2) {
    sumX += points[i];
    sumY += points[i + 1];
  }

  return {
    x: sumX / pointCount,
    y: sumY / pointCount
  };
};

// 获取标签位置
const getLabelPosition = (area: any, center: any) => {
  if (area.labelPosition) {
    return area.labelPosition;
  }

  const canvas = drawingCanvas.value;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  const svgRect = canvas.viewBox.baseVal;

  const screenX = (center.x / svgRect.width) * rect.width + rect.left;
  const screenY = (center.y / svgRect.height) * rect.height + rect.top;

  let offsetX = 0,
    offsetY = -40;

  if (area.labelOffset) {
    offsetX = area.labelOffset.x || 0;
    offsetY = area.labelOffset.y || -40;
  }

  return {
    x: screenX + offsetX,
    y: screenY + offsetY
  };
};

// 清除所有标签
const clearAllLabels = () => {
  const labels = document.querySelectorAll(".area-label");
  labels.forEach(label => label.remove());
};

// 选择区域
const selectArea = (areaId: number) => {
  selectedAreaId = areaId;
  const area = areas.value.find(a => a.id === areaId);

  // 高亮选中的区域
  document.querySelectorAll(".fence-polygon").forEach(poly => {
    (poly as HTMLElement).style.strokeWidth = "6";
    (poly as HTMLElement).style.filter = "none";
  });

  const selectedPoly = document.getElementById(`area-${areaId}`);
  if (selectedPoly) {
    selectedPoly.style.strokeWidth = "8";
    selectedPoly.style.filter = "drop-shadow(0 0 2px currentColor)";
  }

  console.log("选中区域:", area);
};

const clearAllAreas = () => {
  if (isDrawing.value) {
    exitDrawingMode();
  }

  if (confirm("确定要清除所有区域吗？")) {
    areas.value = [];
    const canvas = drawingCanvas.value;
    if (canvas) {
      const polygons = canvas.querySelectorAll(".fence-polygon");
      polygons.forEach(poly => poly.remove());
    }
    clearAllLabels();
    areaIdCounter = 1;
    selectedAreaId = null;
    console.log("已清除所有区域");
  }
};

const copyAreasData = () => {
  if (isDrawing.value) {
    exitDrawingMode();
  }

  if (areas.value.length === 0) {
    ElMessage.warning("没有区域数据可复制");
    return;
  }

  const exportData = areas.value.map(area => ({
    id: area.id,
    name: area.name,
    points: area.points,
    color: area.color,
    type: area.type,
    labelImage: area.labelImage,
    labelText: area.labelText,
    labelOffset: area.labelOffset,
    clickable: area.clickable
  }));

  const dataStr = JSON.stringify(exportData, null, 2);
  console.log("复制区域数据:", dataStr);

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(dataStr)
      .then(() => {
        ElMessage.success(`已复制 ${areas.value.length} 个区域的数据到剪贴板`);
      })
      .catch(() => {
        copyToClipboardFallback(dataStr);
      });
  } else {
    copyToClipboardFallback(dataStr);
  }
};

const loadAreasData = () => {
  if (isDrawing.value) {
    exitDrawingMode();
  }

  const data = prompt("请粘贴区域数据（JSON格式）：");
  if (!data) return;

  try {
    const importData = JSON.parse(data);
    let areasData;

    if (Array.isArray(importData)) {
      areasData = importData;
    } else if (importData.areas && Array.isArray(importData.areas)) {
      areasData = importData.areas;
    } else {
      ElMessage.error("数据格式错误：需要区域数组");
      return;
    }

    // 清除现有区域
    areas.value = [];
    const canvas = drawingCanvas.value;
    if (canvas) {
      const polygons = canvas.querySelectorAll(".fence-polygon");
      polygons.forEach(poly => poly.remove());
    }
    clearAllLabels();
    areaIdCounter = 1;
    selectedAreaId = null;

    // 导入新区域数据
    areasData.forEach((areaData: any) => {
      const newArea = {
        id: areaIdCounter++,
        name: areaData.name || `电子围栏${areaIdCounter - 1}`,
        points: areaData.points,
        color: areaData.color || getRandomColor(),
        type: areaData.type || "polygon",
        labelImage: areaData.labelImage,
        labelText: areaData.labelText,
        labelOffset: areaData.labelOffset || { x: 0, y: -50 },
        clickable: areaData.clickable || false
      };

      areas.value.push(newArea);
      addAreaToSVG(newArea);
    });

    ElMessage.success(`成功加载 ${areasData.length} 个区域`);
    console.log("已导入区域数据:", areas.value);
  } catch (err) {
    console.error("导入区域数据失败:", err);
    ElMessage.error("数据格式错误，请检查JSON格式是否正确");
  }
};

// 退出绘制模式
const exitDrawingMode = () => {
  isDrawing.value = false;
  currentPoints.value = [];
  const canvas = drawingCanvas.value;
  if (canvas) {
    canvas.style.pointerEvents = "none";
  }
  removePreviewElements();
  console.log("退出绘制模式");
};

// 复制到剪贴板的降级方案
const copyToClipboardFallback = (text: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
    ElMessage.success(`已复制 ${areas.value.length} 个区域的数据到剪贴板`);
  } catch (err) {
    console.error("复制失败:", err);
    ElMessage.error("复制失败，请手动复制控制台中的数据");
  }

  document.body.removeChild(textarea);
};

const getRandomColor = () => {
  const colors = [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#ffa500",
    "#800080"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 控制面板切换
const toggleDrawingToolbar = () => {
  showDrawingToolbar.value = !showDrawingToolbar.value;
};

const toggleCallBridgePanel = () => {
  showCallBridgePanel.value = !showCallBridgePanel.value;
};

const resetView = () => {
  if (isDrawing.value) {
    exitDrawingMode();
  }
  ElMessage.success("视图已重置");
};

// CallBridge 相关功能
const checkCallBridge = () => {
  const hasCallBridge = !!(window as any).CallBridge;
  const hasWebControl = !!(window as any).WebControl;
  const hasOWebControl = !!(window as any).oWebControl;

  console.log("=== 控件对象检测详情 ===");
  console.log(
    "window.CallBridge:",
    hasCallBridge ? "✓ 存在" : "✗ 不存在",
    (window as any).CallBridge
  );
  console.log(
    "window.WebControl:",
    hasWebControl ? "✓ 存在" : "✗ 不存在",
    (window as any).WebControl
  );
  console.log(
    "window.oWebControl:",
    hasOWebControl ? "✓ 存在" : "✗ 不存在",
    (window as any).oWebControl
  );

  let statusText = "控件对象检测:\n";
  statusText += `CallBridge: ${hasCallBridge ? "✓" : "✗"}\n`;
  statusText += `WebControl: ${hasWebControl ? "✓" : "✗"}\n`;
  statusText += `oWebControl: ${hasOWebControl ? "✓" : "✗"}`;

  if (hasCallBridge || hasWebControl || hasOWebControl) {
    callBridgeStatusClass.value = "exists";
    callBridgeStatusText.value = statusText;
    return true;
  } else {
    callBridgeStatusClass.value = "not-exists";
    statusText += "\n环境: " + (window.parent !== window ? "iframe" : "顶层");
    callBridgeStatusText.value = statusText;
    return false;
  }
};

const initCallBridge = () => {
  console.log("初始化CallBridge监听器...");

  if (!checkCallBridge()) {
    setTimeout(() => {
      initCallBridge();
    }, 3000);
    return;
  }

  try {
    const listenersAdded = [];

    // 方式1: 使用 window.CallBridge
    if (
      (window as any).CallBridge &&
      typeof (window as any).CallBridge.addEventListener === "function"
    ) {
      (window as any).CallBridge.addEventListener(
        "TransFuncToWeb",
        function (res: any) {
          console.log("收到前端透传消息 (CallBridge.TransFuncToWeb):", res);
          handleCallBridgeMessage(res, "CallBridge.TransFuncToWeb");
        }
      );

      (window as any).CallBridge.addEventListener(
        "callFromclient",
        function (res: any) {
          console.log("收到callFromclient消息 (CallBridge):", res);
          handleCallBridgeMessage(res, "CallBridge.callFromclient");
        }
      );

      listenersAdded.push("CallBridge");
    }

    // 方式2: 使用 window.WebControl
    if (
      (window as any).WebControl &&
      typeof (window as any).WebControl.addEventListener === "function"
    ) {
      (window as any).WebControl.addEventListener(
        "TransFuncToWeb",
        function (res: any) {
          console.log("收到前端透传消息 (WebControl.TransFuncToWeb):", res);
          handleCallBridgeMessage(res, "WebControl.TransFuncToWeb");
        }
      );
      listenersAdded.push("WebControl");
    }

    // 方式3: 监听全局事件
    document.addEventListener("TransFuncToWeb", function (event: any) {
      console.log("收到全局TransFuncToWeb事件:", event.detail);
      handleCallBridgeMessage(event.detail, "document.TransFuncToWeb");
    });
    listenersAdded.push("document");

    // 方式4: 监听window消息事件
    window.addEventListener("message", function (event: any) {
      if (
        event.data &&
        (event.data.type === "TransFuncToWeb" || event.data.eventName)
      ) {
        console.log("收到window.message事件:", event.data);
        handleCallBridgeMessage(event.data, "window.message");
      }
    });
    listenersAdded.push("window.message");

    console.log("事件监听器已添加:", listenersAdded);
    addMessageToPanel("系统", "监听器已启动", {
      status: "ready",
      listeners: listenersAdded
    });
  } catch (error) {
    console.error("添加CallBridge监听器失败:", error);
    addMessageToPanel("错误", error.toString(), { error: true });
  }
};

// 处理CallBridge消息
const handleCallBridgeMessage = (res: any, source = "unknown") => {
  console.log(`处理CallBridge消息 (来源: ${source}):`, res);

  let parsedData = {};
  let rawData = res || "{}";

  try {
    if (typeof res === "string") {
      parsedData = JSON.parse(res || "{}") || {};
    } else if (typeof res === "object") {
      parsedData = res;
      rawData = JSON.stringify(res);
    }
    console.log("解析后的数据:", parsedData);
  } catch (error) {
    console.error("JSON解析失败:", error);
    parsedData = {
      error: "JSON解析失败",
      originalData: res,
      parseError: (error as Error).message
    };
  }

  const eventName =
    (parsedData as any).eventName || (parsedData as any).type || "未知事件";
  addMessageToPanel(`${eventName} [${source}]`, rawData, parsedData);
};

// 添加消息到展示面板
const addMessageToPanel = (
  eventName: string,
  rawData: any,
  parsedData: any
) => {
  const timestamp = new Date().toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3
  });

  let displayRawData = String(rawData);
  if (displayRawData.length > 200) {
    displayRawData = displayRawData.substring(0, 200) + "...";
  }

  let displayParsedData = "";
  try {
    if (typeof parsedData === "object") {
      displayParsedData = JSON.stringify(parsedData, null, 2);
      if (displayParsedData.length > 300) {
        displayParsedData = displayParsedData.substring(0, 300) + "...";
      }
    } else {
      displayParsedData = String(parsedData);
    }
  } catch (e) {
    displayParsedData = "无法格式化";
  }

  const message = {
    timestamp: `[${timestamp}] 事件: ${eventName}`,
    raw: displayRawData,
    parsed: displayParsedData
  };

  callBridgeMessages.value.unshift(message);

  if (callBridgeMessages.value.length > maxMessages) {
    callBridgeMessages.value = callBridgeMessages.value.slice(0, maxMessages);
  }

  console.log(`消息已添加到面板`);
};

// 定期检查CallBridge状态
const monitorCallBridge = () => {
  checkCallBridge();
};

// 设置全局API接口
const setupGlobalAPI = () => {
  // 设置区域数据并绘制到页面
  (window as any).setAreasData = function (data: any) {
    try {
      let areasData;

      if (Array.isArray(data)) {
        areasData = data;
      } else if (data && data.areas && Array.isArray(data.areas)) {
        areasData = data.areas;
      } else {
        console.error("无效的区域数据格式");
        return false;
      }

      // 清除现有区域
      areas.value = [];
      const canvas = drawingCanvas.value;
      if (canvas) {
        const polygons = canvas.querySelectorAll(".fence-polygon");
        polygons.forEach(poly => poly.remove());
      }
      clearAllLabels();
      areaIdCounter = 1;
      selectedAreaId = null;

      // 绘制新区域
      areasData.forEach((areaData: any) => {
        const newArea = {
          id: areaIdCounter++,
          name: areaData.name || `电子围栏${areaIdCounter - 1}`,
          points: areaData.points,
          color: areaData.color || getRandomColor(),
          type: areaData.type || "polygon",
          labelImage: areaData.labelImage,
          labelText: areaData.labelText,
          labelOffset: areaData.labelOffset || { x: 0, y: -50 },
          clickable: areaData.clickable || false
        };

        areas.value.push(newArea);
        addAreaToSVG(newArea);
      });

      console.log(`成功设置 ${areasData.length} 个区域`);
      return true;
    } catch (err) {
      console.error("设置区域数据失败:", err);
      return false;
    }
  };

  // 获取当前所有区域数据
  (window as any).getAreasData = function () {
    return areas.value.map(area => ({
      id: area.id,
      name: area.name,
      points: area.points,
      color: area.color,
      type: area.type,
      labelImage: area.labelImage,
      labelText: area.labelText,
      labelOffset: area.labelOffset,
      clickable: area.clickable
    }));
  };

  // 清除所有区域数据
  (window as any).clearAreas = function () {
    clearAllAreas();
  };

  // 设置全局区域数据
  (window as any).AREA_DATA = AREA_DATA;
};

// 初始化
const initComponent = () => {
  // 检查URL参数是否包含debug=true来决定是否显示工具栏和监听面板
  const debug = window.location.href.includes("debug");

  showDrawingToolbar.value = debug;
  showCallBridgePanel.value = debug;

  // 设置全局API
  setupGlobalAPI();

  // 加载初始区域数据
  if (AREA_DATA.length > 0) {
    areas.value = [...AREA_DATA];
    areas.value.forEach(area => addAreaToSVG(area));
    console.log("已自动加载初始区域数据");
  }

  // 启动定时器
  updateTime();
  updateData();
  timeTimer = setInterval(updateTime, 1000);
  dataTimer = setInterval(updateData, 5000);

  // 初始化CallBridge监听
  // initCallBridge();

  // 定期监控CallBridge状态（每10秒检查一次）
  // callBridgeTimer = setInterval(monitorCallBridge, 10000);
};

onMounted(() => {
  initComponent();
});

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer);
  if (dataTimer) clearInterval(dataTimer);
  if (callBridgeTimer) clearInterval(callBridgeTimer);
  clearAllLabels();
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.overlay-container {
  position: relative;
  width: 100%;
  height: 100vh;
  pointer-events: none;
  font-family: "Microsoft YaHei", Arial, sans-serif;
  overflow: hidden;
}

.top-bar {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00ff00;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.bottom-controls {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 10px 20px;
  border-radius: 25px;
  display: flex;
  gap: 15px;
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(0, 123, 255, 0.7);
  border-color: #007bff;
  transform: translateY(-2px);
}

.info-panel {
  position: absolute;
  right: 15px;
  top: 60px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-size: 11px;
  min-width: 150px;
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.info-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #00ff00;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.drawing-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.drawing-status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.drawing-toolbar {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.8);
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  backdrop-filter: blur(10px);
  pointer-events: auto;
  min-width: 150px;
  z-index: 1000;
}

.tool-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.3s ease;
}

.tool-btn:hover {
  background: rgba(0, 123, 255, 0.7);
  border-color: #007bff;
  transform: translateY(-2px);
}

.area-count {
  font-size: 12px;
  color: white;
}

.callbridge-panel {
  position: absolute;
  top: 60px;
  left: 15px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-size: 11px;
  min-width: 300px;
  max-width: 400px;
  max-height: 300px;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  pointer-events: auto;
  border: 1px solid rgba(0, 255, 0, 0.3);
}

.callbridge-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #00ff00;
  border-bottom: 1px solid rgba(0, 255, 0, 0.3);
  padding-bottom: 5px;
}

.callbridge-status {
  margin-bottom: 10px;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 10px;
}

.callbridge-status.exists {
  background: rgba(0, 255, 0, 0.2);
  border: 1px solid #00ff00;
}

.callbridge-status.not-exists {
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid #ff0000;
}

.callbridge-data {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
  font-family: "Courier New", monospace;
  font-size: 10px;
  word-break: break-all;
}

.callbridge-timestamp {
  color: #888;
  font-size: 9px;
  margin-bottom: 3px;
}

.callbridge-raw {
  color: #ffff00;
  margin-bottom: 5px;
}

.callbridge-parsed {
  color: #00ffff;
}

.fence-polygon {
  stroke-dasharray: 30, 20;
  stroke-linejoin: round;
  cursor: pointer;
}
</style>

<!-- 全局样式 - 区域标签 -->
<style>
.area-label {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.area-label .label-image {
  width: 75px;
  height: 45px;
  background-image: "@/assets/h5/marker-1.png";
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  flex-shrink: 0;
}

.area-label .label-text {
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 12px;
  margin-bottom: 10px;
  color: white;
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
  backdrop-filter: blur(5px);
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.area-label .icon-only {
  font-size: 24px;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
}
</style>
