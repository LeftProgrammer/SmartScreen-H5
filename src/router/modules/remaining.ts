const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录",
      showLink: false,
      rank: 101
    }
  },
  // H5页面路由 - 独立页面
  {
    path: "/h5/home",
    name: "H5Home",
    component: () => import("@/views/h5/home/index.vue"),
    meta: {
      title: "ARWeb遮罩H5",
      showLink: false
    }
  },
  {
    path: "/h5/clock",
    name: "H5Clock",
    component: () => import("@/views/h5/clock/index.vue"),
    meta: {
      title: "人员打卡",
      showLink: false
    }
  },
  {
    path: "/h5/health",
    name: "H5Health",
    component: () => import("@/views/h5/health/index.vue"),
    meta: {
      title: "人员健康监测",
      showLink: false
    }
  },
  {
    path: "/h5/box",
    name: "H5Box",
    component: () => import("@/views/h5/box/index.vue"),
    meta: {
      title: "一号配电箱",
      showLink: false
    }
  },
  {
    path: "/h5/crane",
    name: "H5Crane",
    component: () => import("@/views/h5/crane/index.vue"),
    meta: {
      title: "一号塔吊",
      showLink: false
    }
  },
  {
    path: "/redirect",
    component: Layout,
    meta: {
      title: "加载中...",
      showLink: false,
      rank: 102
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/layout/redirect.vue")
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;
