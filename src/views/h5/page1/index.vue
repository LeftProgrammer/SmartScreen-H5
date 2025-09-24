<template>
  <div class="control-panel">
    <!-- 运行状态标题 -->
    <div class="status-header">
      <div
        class="status-indicator"
        :class="{ offline: statusText === '离线' }"
      />
      <span class="status-text" :class="{ offline: statusText === '离线' }">{{
        statusText
      }}</span>
    </div>

    <!-- 控制参数网格 -->
    <div class="controls-grid">
      <div class="control-item">
        <span class="control-label">幅度:</span>
        <div class="control-value">
          <span class="value">{{ controls.amplitude }}m</span>
          <span class="arrow"> ↑ </span>
        </div>
      </div>

      <div class="control-item">
        <span class="control-label">高度:</span>
        <div class="control-value">
          <span class="value">{{ controls.height }}m</span>
          <span class="arrow"> ↑ </span>
        </div>
      </div>

      <div class="control-item">
        <span class="control-label">回转:</span>
        <div class="control-value">
          <span class="value">{{ controls.rotation }}°</span>
          <span class="arrow"> ↑ </span>
        </div>
      </div>

      <div class="control-item">
        <span class="control-label">起重量:</span>
        <div class="control-value">
          <span class="value">{{ controls.weight }}t</span>
          <span class="arrow"> ↑ </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import { getProcessedControlData } from "@/api/page1";

defineOptions({
  name: "H5Page1"
});

// 响应式数据
const statusText = ref("运行");
const controls = ref({
  amplitude: "0",
  height: "0",
  rotation: "0",
  weight: "0"
});

// 定时器和错误计数
let timer: NodeJS.Timeout | null = null;
let errorCount = 0;

// 获取塔吊控制面板数据
const fetchControlData = async () => {
  try {
    const data = await getProcessedControlData("6577049", 0);

    // 更新控制面板数据
    controls.value = {
      amplitude: data.amplitude,
      height: data.height,
      rotation: data.rotation,
      weight: data.weight
    };
    statusText.value = data.status;

    // 重置错误计数
    errorCount = 0;
    console.log("塔吊数据更新:", data);
  } catch (error: any) {
    console.error("获取塔吊数据失败:", error);

    // 设置离线状态
    statusText.value = "离线";

    // 只在第一次错误时提示，避免频繁弹窗
    if (errorCount === 0) {
      ElMessage.warning("设备离线", { duration: 2000 });
    }
    errorCount++;
  }
};

// 启动定时刷新
const startPolling = () => {
  // 立即获取一次数据
  fetchControlData();

  // 每5秒刷新一次数据
  timer = setInterval(() => {
    fetchControlData();
  }, 5000);
};

// 停止定时刷新
const stopPolling = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

// 组件挂载时启动数据获取
onMounted(() => {
  startPolling();
});

// 组件卸载时清理定时器
onUnmounted(() => {
  stopPolling();
});

// 手动刷新数据
const refreshData = () => {
  fetchControlData();
};

// 暴露方法给父组件使用
defineExpose({
  refreshData,
  startPolling,
  stopPolling
});
</script>

<style scoped lang="scss">
.control-panel {
  width: 300px;
  // background: linear-gradient(135deg, #1a4b5c 0%, #2d6a7a 100%);
  padding: 12px;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  position: relative;
  overflow: hidden;
}

.status-header {
  display: flex;
  align-items: center;
  margin-bottom: 14px;

  .status-indicator {
    width: 3px;
    height: 10px;
    background: #00ff88;
    margin-right: 6px;
    box-shadow: 0 0 8px rgba(0, 255, 136, 0.6);
    transition: all 0.3s ease;

    &.offline {
      background: #ff4444;
      box-shadow: 0 0 8px rgba(255, 68, 68, 0.6);
    }
  }

  .status-text {
    color: #00ff88;
    font-size: 16px;
    transition: all 0.3s ease;

    &.offline {
      color: #ff4444;
    }
  }
}

.controls-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: calc(100% - 30px);
}

.control-item {
  height: 36px;
  background: linear-gradient(90deg, #35c179 0%, #0e6e3d 100%);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 2px;
  padding: 0 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid;
  border-image: linear-gradient(
      180deg,
      rgba(182, 255, 168, 0.14),
      rgba(236, 255, 242, 1)
    )
    1 1;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.control-label {
  margin-right: 2px;
}

.control-value {
  height: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
