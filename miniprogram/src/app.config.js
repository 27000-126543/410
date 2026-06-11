{
  "pages": [
    "pages/index/index",
    "pages/trip/search",
    "pages/trip/publish",
    "pages/trip/detail",
    "pages/trip/myTrips",
    "pages/order/list",
    "pages/order/detail",
    "pages/review/create",
    "pages/review/list",
    "pages/user/index",
    "pages/user/profile",
    "pages/user/login",
    "pages/user/reputation",
    "pages/user/favorites",
    "pages/user/complaints",
    "pages/user/complaintDetail",
    "pages/user/notifications",
    "pages/user/agreement"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#1890ff",
    "navigationBarTitleText": "社区拼车",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#f5f5f5"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#1890ff",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      },
      {
        "pagePath": "pages/trip/myTrips",
        "text": "行程"
      },
      {
        "pagePath": "pages/order/list",
        "text": "订单"
      },
      {
        "pagePath": "pages/user/index",
        "text": "我的"
      }
    ]
  },
  "permission": {
    "scope.userLocation": {
      "desc": "您的位置信息将用于匹配附近的拼车行程"
    }
  },
  "requiredPrivateInfos": [
    "getLocation"
  ]
}
