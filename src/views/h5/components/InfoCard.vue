<template>
  <div class="info-card" :style="cardStyle">
    <div class="card-title">
      <div class="title-icon" :style="{ backgroundColor: titleColor }" />
      <span>{{ title }}</span>
    </div>

    <div v-for="(item, index) in allItems" :key="index" class="card-item">
      <img v-if="item.icon" :src="item.icon" class="item-icon" alt="icon" />
      <span class="item-text" :style="item.textStyle">{{ item.text }}</span>
      <span v-if="item.trend" class="trend" :class="item.trend">
        {{ item.trend === "up" ? "↑" : "↓" }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

// 导入默认图标
import card1Icon from "@/assets/h5/card-1.png";
import card2Icon from "@/assets/h5/card-2.png";
import card3Icon from "@/assets/h5/card-3.png";
import card4Icon from "@/assets/h5/card-4.png";
import card5Icon from "@/assets/h5/card-5.png";

// 默认图标数组
const defaultIcons = [card1Icon, card2Icon, card3Icon, card4Icon, card5Icon];

interface CardItem {
  icon?: string;
  label?: string;
  value?: string | number;
  text?: string; // 直接显示的文本
  trend?: "up" | "down";
  textStyle?: Record<string, string>; // 自定义文本样式
}

interface Props {
  title: string;
  titleColor?: string;
  items: CardItem[];
  // 位置设置
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "custom";
  // 自定义位置偏移
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  titleColor: "#00ff00",
  position: "top-left"
});

// 合并items，统一处理
const allItems = computed(() => {
  const result: CardItem[] = [];

  // 处理items，为没有图标的项目分配默认图标
  const processedItems = props.items.map((item, index) => {
    let processedItem = { ...item };

    // 处理文本显示
    if (!processedItem.text && processedItem.label && processedItem.value) {
      processedItem.text = `${processedItem.label}：${processedItem.value}`;
    }

    // 分配默认图标
    if (!processedItem.icon && index < defaultIcons.length) {
      processedItem.icon = defaultIcons[index];
    }

    return processedItem;
  });

  result.push(...processedItems);
  return result;
});

// 计算卡片样式
const cardStyle = computed(() => {
  // 检查是否有自定义位置参数
  const hasCustomPosition =
    props.top !== undefined ||
    props.left !== undefined ||
    props.right !== undefined ||
    props.bottom !== undefined;

  if (hasCustomPosition) {
    // 自定义位置
    const style: Record<string, string> = {};

    if (props.top !== undefined) {
      style.top = typeof props.top === "number" ? `${props.top}px` : props.top;
    }
    if (props.left !== undefined) {
      style.left =
        typeof props.left === "number" ? `${props.left}px` : props.left;
    }
    if (props.right !== undefined) {
      style.right =
        typeof props.right === "number" ? `${props.right}px` : props.right;
    }
    if (props.bottom !== undefined) {
      style.bottom =
        typeof props.bottom === "number" ? `${props.bottom}px` : props.bottom;
    }

    return style;
  } else {
    // 预设位置
    const positions = {
      "top-left": { top: "15px", left: "15px" },
      "top-right": { top: "15px", right: "15px" },
      "bottom-left": { bottom: "15px", left: "15px" },
      "bottom-right": { bottom: "15px", right: "15px" }
    };

    return positions[props.position] || positions["top-left"];
  }
});
</script>

<style scoped lang="scss">
.info-card {
  position: absolute;
  background: rgba(5, 63, 27, 0.65);
  color: #ffffff;
  padding: 0.6vw; /* 调小 */
  border-radius: 0.15vw; /* 调小 */
  font-size: 0.9vw; /* 调小 */
  pointer-events: auto;
  min-width: 12vw; /* 调小 */

  .card-title {
    font-size: 1.1vw; /* 调小 */
    font-weight: bold;
    margin-bottom: 0.4vw; /* 调小 */
    color: #ffffff;
    display: flex;
    align-items: center;

    .title-icon {
      width: 0.6vw; /* 调小 */
      height: 0.6vw; /* 调小 */
      margin-right: 0.6vw; /* 调小 */
      border-radius: 0.15vw; /* 调小 */
    }
  }

  .card-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(25, 126, 74, 0.74);
    padding: 0.3vw; /* 调小 */
    border-radius: 0.1vw;
    margin-bottom: 0.3vw; /* 调小 */

    &:last-child {
      margin-bottom: 0;
    }

    .item-icon {
      margin-right: 0.2vw;
      width: 1.2vw; /* 调小 */
      height: 1.2vw; /* 调小 */
    }

    .item-text {
      flex: 1;
    }

    .trend {
      font-weight: bold;
      margin-left: 0.3vw; /* 调小 */

      &.up {
        color: #ff4444;
      }

      &.down {
        color: #00ff00;
      }
    }
  }
}
</style>
