<template>
  <div class="health-container">
    <div class="header">
      <div class="cell">监测人员</div>
      <div class="cell">班组</div>
      <div class="cell time-cell">监测时间</div>
      <div class="cell value-cell">心率值(bpm)</div>
      <div class="cell value-cell">收缩压(mmhg)</div>
      <div class="cell value-cell">舒张压(mmhg)</div>
      <div class="cell">体温(℃)</div>
    </div>
    <div class="body">
      <div v-for="item in healthList" :key="item.personid" class="row">
        <div class="cell">{{ item.username }}</div>
        <div class="cell">{{ item.orgName || "--" }}</div>
        <div class="cell time-cell">{{ formatTime(item.monitortime) }}</div>
        <div class="cell value-cell">{{ formatValue(item.heartbeat) }}</div>
        <div class="cell value-cell">{{ formatValue(item.shrink) }}</div>
        <div class="cell value-cell">{{ formatValue(item.diastolic) }}</div>
        <div class="cell">{{ formatValue(item.temperature) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { getHealthMonitorData, HealthRecord } from "@/api/h5";

defineOptions({
  name: "HealthMonitor"
});

const healthList = ref<HealthRecord[]>([]);
let timer: NodeJS.Timeout | null = null;

// 模拟数据
const mockData: HealthRecord[] = [
  {
    personid: "1",
    username: "邱之涵",
    orgName: "钢筋组",
    monitortime: "2025-09-12 09:21",
    heartbeat: 80,
    shrink: 120,
    diastolic: 80,
    temperature: 36.5
  },
  {
    personid: "2",
    username: "黄波",
    orgName: "钢筋组",
    monitortime: "2025-09-12 09:21",
    heartbeat: 90,
    shrink: 130,
    diastolic: 90,
    temperature: 36.8
  },
  {
    personid: "3",
    username: "刘祥林",
    orgName: "钢筋组",
    monitortime: "2025-09-12 09:21",
    heartbeat: 70,
    shrink: 110,
    diastolic: 70,
    temperature: 36.2
  },
  {
    personid: "4",
    username: "廖应彬",
    orgName: "钢筋组",
    monitortime: "2025-09-12 09:21",
    heartbeat: 85,
    shrink: 125,
    diastolic: 85,
    temperature: 36.6
  },
  {
    personid: "5",
    username: "冉豪",
    orgName: "钢筋组",
    monitortime: "2025-09-12 09:21",
    heartbeat: 95,
    shrink: 135,
    diastolic: 95,
    temperature: 36.9
  },
  {
    personid: "6",
    username: "尔古极石",
    orgName: "钢筋组",
    monitortime: "2025-09-12 09:21",
    heartbeat: 75,
    shrink: 115,
    diastolic: 75,
    temperature: 36.1
  },
  {
    personid: "7",
    username: "冀永文",
    orgName: "钢筋组",
    monitortime: "2025-09-12 09:21",
    heartbeat: 80,
    shrink: 120,
    diastolic: 80,
    temperature: 36.5
  },
  {
    personid: "8",
    username: "贾正权",
    orgName: "钢筋组",
    monitortime: "2025-09-12 09:21",
    heartbeat: 90,
    shrink: 130,
    diastolic: 90,
    temperature: 36.8
  },
  {
    personid: "9",
    username: "曾维明",
    orgName: "钢筋组",
    monitortime: "2025-09-12 09:21",
    heartbeat: 70,
    shrink: 110,
    diastolic: 70,
    temperature: 36.2
  },
  {
    personid: "10",
    username: "陶正明",
    orgName: "钢筋组",
    monitortime: "2025-09-12 09:21",
    heartbeat: 85,
    shrink: 125,
    diastolic: 85,
    temperature: 36.6
  }
];

const fetchData = async () => {
  try {
    const response = await getHealthMonitorData({
      devicePosition: "XLC",
      pageSize: 18,
      current: 1
    });
    console.log("response.data======", response.data);
    if (response.success && response.data && response.data.list.length > 0) {
      healthList.value = response.data.list;
    } else {
      // 如果没有真实数据，使用模拟数据
      healthList.value = mockData;
    }
  } catch (error) {
    console.error("获取人员健康监测数据失败:", error);
  }
};

const formatTime = (timeStr: string | number[] | null) => {
  if (!timeStr) return "--";

  // 如果是数组格式 [年, 月, 日, 时, 分, 秒]
  if (Array.isArray(timeStr)) {
    const [year, month, day, hour, minute] = timeStr;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(hour || 0).padStart(2, "0")}:${String(minute || 0).padStart(2, "0")}`;
  }

  // 如果是字符串格式
  if (typeof timeStr === "string") {
    return timeStr.replace(/:ss/, ""); // 简单移除秒
  }

  return "--";
};

const formatValue = (value: number | null) => {
  if (value === null) return "--";
  return value.toString();
};

onMounted(() => {
  fetchData();
  // 每10秒刷新一次数据
  timer = setInterval(fetchData, 10000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped lang="scss">
.health-container {
  width: 680px;
  height: 380px;
  color: #ffffff;
  font-size: 14px;
  background: rgba(10, 25, 40, 0.8);
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border-radius: 4px;

  .cell {
    flex: 1;
    text-align: center;
    padding: 8px 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .time-cell {
    flex: 1.8; // 为监测时间列设置更大的宽度
  }
  .value-cell {
    flex: 1.6;
  }

  .header {
    display: flex;
    font-weight: bold;
    background: rgba(21, 125, 94, 0.82);
    flex-shrink: 0; // 防止标题被压缩
    .cell {
      padding: 10px 4px;
    }
  }

  .body {
    flex: 1;
    overflow-y: auto;
    min-height: 0; // 确保可以收缩

    .row {
      display: flex;
      border-bottom: 1px solid rgba(104, 163, 146, 0.8);
      transition: background-color 0.2s;

      // &:nth-child(even) {
      //   background: rgba(255, 255, 255, 0.05);
      // }

      // &:hover {
      //   background: rgba(37, 233, 115, 0.2);
      // }
    }

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #25e973;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
