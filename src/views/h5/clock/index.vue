<template>
  <div class="attendance-container">
    <div class="header">
      <div class="cell">人员</div>
      <div class="cell">班组</div>
      <div class="cell time-cell wide-cell">入场时间</div>
      <div class="cell time-cell wide-cell">出场时间</div>
      <div class="cell">工作时长(h)</div>
    </div>
    <div class="body">
      <div v-for="item in attendanceList" :key="item.id" class="row">
        <div class="cell">{{ item.realName }}</div>
        <div class="cell">{{ item.teamName }}</div>
        <div class="cell time-cell wide-cell">
          {{ formatTime(item.inTime) }}
        </div>
        <div class="cell time-cell wide-cell">
          {{ formatTime(item.outTime) }}
        </div>
        <div class="cell">{{ item.workTime }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { getFaceAttendancePage, AttendanceRecord } from "@/api/h5";

defineOptions({
  name: "AttendanceClock"
});

const attendanceList = ref<AttendanceRecord[]>([]);
let timer: NodeJS.Timeout | null = null;

// 模拟数据
const mockData: AttendanceRecord[] = [
  {
    id: "1",
    realName: "张三",
    teamName: "钢筋组",
    inTime: "2025-09-12 09:21",
    outTime: "2025-09-12 21:18",
    workTime: 12
  },
  {
    id: "2",
    realName: "李四",
    teamName: "钢筋组",
    inTime: "2025-09-12 09:21",
    outTime: null,
    workTime: 5
  },
  {
    id: "3",
    realName: "王五",
    teamName: "钢筋组",
    inTime: "2025-09-12 09:21",
    outTime: null,
    workTime: 4
  },
  {
    id: "4",
    realName: "赵六",
    teamName: "钢筋组",
    inTime: "2025-09-12 09:21",
    outTime: null,
    workTime: 6
  },
  {
    id: "5",
    realName: "孙七",
    teamName: "钢筋组",
    inTime: "2025-09-12 09:21",
    outTime: null,
    workTime: 11
  },
  {
    id: "6",
    realName: "周八",
    teamName: "钢筋组",
    inTime: "2025-09-12 09:21",
    outTime: null,
    workTime: 25
  },
  {
    id: "7",
    realName: "吴九",
    teamName: "钢筋组",
    inTime: "2025-09-12 09:21",
    outTime: null,
    workTime: 1
  },
  {
    id: "8",
    realName: "郑十",
    teamName: "钢筋组",
    inTime: "2025-09-12 09:21",
    outTime: null,
    workTime: 3
  },
  {
    id: "9",
    realName: "刘一",
    teamName: "钢筋组",
    inTime: "2025-09-12 09:21",
    outTime: null,
    workTime: 4
  },
  {
    id: "10",
    realName: "陈二",
    teamName: "钢筋组",
    inTime: "2025-09-12 09:21",
    outTime: null,
    workTime: 2
  }
];

const fetchData = async () => {
  try {
    const response = await getFaceAttendancePage({
      devicePosition: "XLC",
      pageSize: 18,
      current: 1
    });
    if (response.success && response.data && response.data.records.length > 0) {
      attendanceList.value = response.data.records;
    } else {
      // 如果没有真实数据，使用模拟数据
      attendanceList.value = mockData;
    }
  } catch (error) {
    console.error("获取人员考勤数据失败:", error);
  }
};

const formatTime = (timeStr: string | null) => {
  if (!timeStr) return "--";
  // 假设时间格式是 YYYY-MM-DD HH:mm:ss，截取需要的部分
  return timeStr.replace(":ss", ""); // 简单移除秒
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
.attendance-container {
  width: 560px;
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

  .wide-cell {
    flex: 1.5; // 为入场时间和出场时间列设置更大的宽度
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
