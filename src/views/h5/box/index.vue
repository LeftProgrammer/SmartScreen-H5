<template>
  <div class="power-monitor-container">
    <!-- 状态标题 -->
    <div class="status-header">
      <div class="status-indicator" :class="statusClass" />
      <span class="status-text" :class="statusClass">{{ statusText }}</span>
    </div>

    <!-- 监测参数网格 -->
    <div class="monitor-grid">
      <div class="monitor-item">
        <span class="monitor-label">电压：</span>
        <div class="monitor-value">
          <span class="value">{{ formatVoltage(currentData?.voltageA) }}V</span>
          <span class="arrow" :class="getArrowClass('voltage')">{{
            getArrowSymbol("voltage")
          }}</span>
        </div>
      </div>

      <div class="monitor-item">
        <span class="monitor-label">过压：</span>
        <div class="monitor-value">
          <span class="value">{{ overVoltageCount }}次</span>
          <span class="arrow" :class="getArrowClass('overvoltage')">{{
            getArrowSymbol("overvoltage")
          }}</span>
        </div>
      </div>

      <div class="monitor-item">
        <span class="monitor-label">电流：</span>
        <div class="monitor-value">
          <span class="value">{{ formatCurrent(currentData?.currentA) }}A</span>
          <span class="arrow" :class="getArrowClass('current')">{{
            getArrowSymbol("current")
          }}</span>
        </div>
      </div>

      <div class="monitor-item">
        <span class="monitor-label">过流：</span>
        <div class="monitor-value">
          <span class="value">{{ overCurrentCount }}次</span>
          <span class="arrow" :class="getArrowClass('overcurrent')">{{
            getArrowSymbol("overcurrent")
          }}</span>
        </div>
      </div>

      <div class="monitor-item">
        <span class="monitor-label">频率：</span>
        <div class="monitor-value">
          <span class="value"
            >{{ formatFrequency(currentData?.frequencyA) }}hz</span
          >
          <span class="arrow" :class="getArrowClass('frequency')">{{
            getArrowSymbol("frequency")
          }}</span>
        </div>
      </div>

      <div class="monitor-item">
        <span class="monitor-label">过载：</span>
        <div class="monitor-value">
          <span class="value">{{ overLoadCount }}次</span>
          <span class="arrow" :class="getArrowClass('overload')">{{
            getArrowSymbol("overload")
          }}</span>
        </div>
      </div>

      <div class="monitor-item">
        <span class="monitor-label">温度：</span>
        <div class="monitor-value">
          <span class="value"
            >{{ formatTemperature(currentData?.temperatureA) }}°C</span
          >
          <span class="arrow" :class="getArrowClass('temperature')">{{
            getArrowSymbol("temperature")
          }}</span>
        </div>
      </div>

      <div class="monitor-item">
        <span class="monitor-label">过高：</span>
        <div class="monitor-value">
          <span class="value">{{ overTempCount }}次</span>
          <span class="arrow" :class="getArrowClass('overtemp')">{{
            getArrowSymbol("overtemp")
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { getPowerDeviceData, PowerDeviceRecord } from "@/api/h5";

defineOptions({
  name: "PowerMonitor"
});

const currentData = ref<PowerDeviceRecord | null>(null);
const deviceList = ref<PowerDeviceRecord[]>([]);
let timer: NodeJS.Timeout | null = null;

// 模拟异常计数数据
const overVoltageCount = ref(21);
const overCurrentCount = ref(10);
const overLoadCount = ref(12);
const overTempCount = ref(2);

// 状态计算
const statusClass = computed(() => {
  if (!currentData.value) return "offline";
  return currentData.value.alarmStatus === 0 ? "normal" : "alarm";
});

const statusText = computed(() => {
  if (!currentData.value) return "离线";
  return currentData.value.alarmStatus === 0 ? "正常" : "报警";
});

const fetchData = async () => {
  try {
    const response = await getPowerDeviceData({
      pageSize: 1,
      current: 1
    });
    if (response.success && response.data && response.data.records.length > 0) {
      currentData.value = response.data.records[0]; // 取第一条数据
      deviceList.value = response.data.records;
    } else {
      // 使用模拟数据
      const mockData: PowerDeviceRecord = {
        id: "1",
        deviceSn: "25060437550071",
        alarmStatus: 0,
        voltageA: "212",
        currentA: "212",
        frequencyA: "32",
        temperatureA: "54",
        voltageB: "231.40",
        currentB: "0.00",
        frequencyB: "49.95",
        temperatureB: "43.00",
        voltageC: "225.60",
        currentC: "0.00",
        frequencyC: "49.95",
        temperatureC: "43.00",
        temperature: "42.00",
        totalActivePower: "0.0000",
        monitorDateTime: Date.now()
      };
      currentData.value = mockData;
    }
  } catch (error) {
    console.error("获取用电监测数据失败:", error);
    // 请求失败时使用模拟数据
    const mockData: PowerDeviceRecord = {
      id: "1",
      deviceSn: "25060437550071",
      alarmStatus: 0,
      voltageA: "212",
      currentA: "212",
      frequencyA: "32",
      temperatureA: "54",
      voltageB: "231.40",
      currentB: "0.00",
      frequencyB: "49.95",
      temperatureB: "43.00",
      voltageC: "225.60",
      currentC: "0.00",
      frequencyC: "49.95",
      temperatureC: "43.00",
      temperature: "42.00",
      totalActivePower: "0.0000",
      monitorDateTime: Date.now()
    };
    currentData.value = mockData;
  }
};

// 格式化函数
const formatVoltage = (value: string | undefined) => {
  if (!value) return "0";
  return parseFloat(value).toFixed(2);
};

const formatCurrent = (value: string | undefined) => {
  if (!value) return "0";
  return parseFloat(value).toFixed(2);
};

const formatFrequency = (value: string | undefined) => {
  if (!value) return "0";
  return parseFloat(value).toFixed(2);
};

const formatTemperature = (value: string | undefined) => {
  if (!value) return "0";
  return parseFloat(value).toFixed(2);
};

// 箭头方向和样式（模拟数据）
const getArrowClass = (type: string) => {
  const directions = {
    voltage: "up",
    overvoltage: "up",
    current: "up",
    overcurrent: "up",
    frequency: "down",
    overload: "up",
    temperature: "up",
    overtemp: "up"
  };
  return directions[type] || "up";
};

const getArrowSymbol = (type: string) => {
  const directions = {
    voltage: "↑",
    overvoltage: "↑",
    current: "↑",
    overcurrent: "↑",
    frequency: "↓",
    overload: "↑",
    temperature: "↑",
    overtemp: "↑"
  };
  return directions[type] || "↑";
};

onMounted(() => {
  fetchData();
  // 每5秒刷新一次数据
  timer = setInterval(fetchData, 5000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped lang="scss">
.power-monitor-container {
  width: 300px;
  height: 248px;
  // background: rgba(10, 25, 40, 0.9);
  color: #ffffff;
  padding: 15px;
  border-radius: 4px;
  font-size: 14px;

  .status-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    .status-indicator {
      width: 3px;
      height: 10px;
      margin-right: 8px;

      &.normal {
        background: #25e973;
      }

      &.alarm {
        background: #ff4444;
      }

      &.offline {
        background: #666666;
      }
    }

    .status-text {
      font-size: 14px;
      font-weight: bold;

      &.normal {
        color: #25e973;
      }

      &.alarm {
        color: #ff4444;
      }

      &.offline {
        color: #666666;
      }
    }
  }

  .monitor-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 6px;

    .monitor-item {
      height: 36px;
      background: linear-gradient(
        180deg,
        rgba(53, 193, 121, 0.5) 0%,
        rgba(14, 110, 61, 0.5) 100%
      );
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
          rgba(236, 255, 242, 0.35)
        )
        1 1;
      color: #ffffff;
      font-size: 14px;
      transition: all 0.3s ease;

      .monitor-label {
        color: #ffffff;
        font-size: 13px;
      }

      .monitor-value {
        flex: 1;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;

        .arrow {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 4px;

          &.up {
            color: #ffffff;
          }

          &.down {
            color: #ffffff;
          }
        }
      }
    }
  }
}
</style>
