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
    path: "/h5/page1",
    name: "H5Page1",
    component: () => import("@/views/h5/page1/index.vue"),
    meta: {
      title: "H5页面1",
      showLink: false,
      rank: 201
    }
  },
  {
    path: "/h5/page2",
    name: "H5Page2",
    component: () => import("@/views/h5/page2/index.vue"),
    meta: {
      title: "H5页面2",
      showLink: false,
      rank: 202
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
