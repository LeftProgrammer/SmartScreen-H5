<template>
  <div class="h5-page2">
    <div class="container">
      <!-- 顶部导航 -->
      <nav class="nav-bar">
        <div class="logo">SmartScreen</div>
        <div class="nav-menu">
          <span class="menu-item">首页</span>
          <span class="menu-item">产品</span>
          <span class="menu-item">关于</span>
        </div>
      </nav>

      <!-- 主要内容 -->
      <main class="main-content">
        <section class="hero-section">
          <h1 class="hero-title">H5页面2</h1>
          <p class="hero-subtitle">现代化的移动端体验</p>
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">{{ stats.users }}</div>
              <div class="stat-label">用户数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.projects }}</div>
              <div class="stat-label">项目数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.success }}</div>
              <div class="stat-label">成功率</div>
            </div>
          </div>
        </section>

        <section class="services-section">
          <h2 class="section-title">我们的服务</h2>
          <div class="services-grid">
            <div
              v-for="service in services"
              :key="service.id"
              class="service-card"
              @click="handleServiceClick(service)"
            >
              <div class="service-icon" v-html="service.icon" />
              <h3 class="service-title">{{ service.title }}</h3>
              <p class="service-desc">{{ service.description }}</p>
            </div>
          </div>
        </section>

        <section class="contact-section">
          <h2 class="section-title">联系我们</h2>
          <div class="contact-info">
            <p>
              访问链接：<code>{{ fullUrl }}</code>
            </p>
            <button class="contact-btn" @click="handleContact">立即咨询</button>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";

defineOptions({
  name: "H5Page2"
});

const stats = ref({
  users: "0",
  projects: "0",
  success: "0%"
});

const services = ref([
  {
    id: 1,
    icon: "🎯",
    title: "精准定位",
    description: "为您提供精准的市场定位服务"
  },
  {
    id: 2,
    icon: "🚀",
    title: "快速部署",
    description: "快速部署您的项目到生产环境"
  },
  {
    id: 3,
    icon: "📊",
    title: "数据分析",
    description: "深度数据分析，助力业务增长"
  },
  {
    id: 4,
    icon: "🔒",
    title: "安全保障",
    description: "企业级安全保障，数据无忧"
  }
]);

const fullUrl = computed(() => {
  return `${window.location.origin}${window.location.pathname}#/h5/page2`;
});

// 数字动画效果
const animateNumbers = () => {
  const targets = {
    users: 1200,
    projects: 89,
    success: 98
  };

  const duration = 2000;
  const steps = 60;
  const stepTime = duration / steps;

  let currentStep = 0;

  const timer = setInterval(() => {
    currentStep++;
    const progress = currentStep / steps;

    stats.value.users = Math.floor(targets.users * progress).toLocaleString();
    stats.value.projects = Math.floor(targets.projects * progress).toString();
    stats.value.success = Math.floor(targets.success * progress) + "%";

    if (currentStep >= steps) {
      clearInterval(timer);
    }
  }, stepTime);
};

const handleServiceClick = (service: any) => {
  ElMessage.info(`点击了服务：${service.title}`);
};

const handleContact = () => {
  ElMessage.success("感谢您的咨询，我们会尽快联系您！");
};

onMounted(() => {
  setTimeout(() => {
    animateNumbers();
  }, 500);
});
</script>

<style scoped lang="scss">
.h5-page2 {
  min-height: 100vh;
  background: #f8fafc;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #e2e8f0;

  .logo {
    font-size: 24px;
    font-weight: 700;
    color: #2d3748;
  }

  .nav-menu {
    display: flex;
    gap: 30px;

    .menu-item {
      color: #4a5568;
      cursor: pointer;
      transition: color 0.3s ease;

      &:hover {
        color: #3182ce;
      }
    }
  }
}

.main-content {
  padding: 40px 0;
}

.hero-section {
  text-align: center;
  padding: 60px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  margin-bottom: 60px;

  .hero-title {
    font-size: 48px;
    font-weight: 800;
    margin-bottom: 20px;
  }

  .hero-subtitle {
    font-size: 20px;
    opacity: 0.9;
    margin-bottom: 40px;
  }

  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 60px;

    .stat-item {
      text-align: center;

      .stat-number {
        font-size: 36px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        opacity: 0.8;
      }
    }
  }
}

.services-section {
  margin-bottom: 60px;

  .section-title {
    text-align: center;
    font-size: 32px;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 40px;
  }

  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;

    .service-card {
      background: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
      }

      .service-icon {
        font-size: 48px;
        margin-bottom: 20px;
      }

      .service-title {
        font-size: 20px;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 12px;
      }

      .service-desc {
        color: #718096;
        line-height: 1.6;
      }
    }
  }
}
</style>
