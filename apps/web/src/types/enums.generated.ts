// Generated from ArchForgeSpec/enums/enums.yaml — do not edit by hand.
/* eslint-disable @typescript-eslint/no-redeclare */

export const StatusEnum = {
  DISABLE: 0,
  ENABLE: 1,
} as const;

export type StatusEnum = (typeof StatusEnum)[keyof typeof StatusEnum];

export const StatusEnumLabel: Record<number, string> = {
  0: "停用",
  1: "正常",
};

export const UserStatus = {
  NORMAL: 1,
  DISABLED: 2,
  FROZEN: 3,
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const UserStatusLabel: Record<number, string> = {
  1: "正常",
  2: "禁用",
  3: "冻结",
};

export const MenuTypeEnum = {
  MENU: 1,
  CATALOG: 2,
  IFRAME: 3,
  OUTSIDE_LINK_REDIRECT: 4,
} as const;

export type MenuTypeEnum = (typeof MenuTypeEnum)[keyof typeof MenuTypeEnum];

export const MenuTypeEnumLabel: Record<number, string> = {
  1: "页面",
  2: "目录",
  3: "内嵌Iframe",
  4: "外链跳转",
};

export const BlogArticleStatus = {
  DRAFT: 0,
  PUBLISHED: 1,
  OFFLINE: 2,
} as const;

export type BlogArticleStatus = (typeof BlogArticleStatus)[keyof typeof BlogArticleStatus];

export const BlogArticleStatusLabel: Record<number, string> = {
  0: "草稿",
  1: "已发布",
  2: "已下线",
};

export const NoticeTypeEnum = {
  NOTIFICATION: 1,
  ANNOUNCEMENT: 2,
} as const;

export type NoticeTypeEnum = (typeof NoticeTypeEnum)[keyof typeof NoticeTypeEnum];

export const NoticeTypeEnumLabel: Record<number, string> = {
  1: "通知",
  2: "公告",
};

export const NoticeStatusEnum = {
  CLOSE: 0,
  OPEN: 1,
} as const;

export type NoticeStatusEnum = (typeof NoticeStatusEnum)[keyof typeof NoticeStatusEnum];

export const NoticeStatusEnumLabel: Record<number, string> = {
  0: "关闭",
  1: "正常",
};

export const GenderEnum = {
  MALE: 0,
  FEMALE: 1,
  UNKNOWN: 2,
} as const;

export type GenderEnum = (typeof GenderEnum)[keyof typeof GenderEnum];

export const GenderEnumLabel: Record<number, string> = {
  0: "男",
  1: "女",
  2: "未知",
};

export const OperationStatusEnum = {
  FAIL: 0,
  SUCCESS: 1,
} as const;

export type OperationStatusEnum = (typeof OperationStatusEnum)[keyof typeof OperationStatusEnum];

export const OperationStatusEnumLabel: Record<number, string> = {
  0: "失败",
  1: "成功",
};

export const LoginStatusEnum = {
  LOGIN_FAIL: 0,
  LOGIN_SUCCESS: 1,
  LOGOUT: 2,
  REGISTER: 3,
} as const;

export type LoginStatusEnum = (typeof LoginStatusEnum)[keyof typeof LoginStatusEnum];

export const LoginStatusEnumLabel: Record<number, string> = {
  0: "登录失败",
  1: "登录成功",
  2: "退出成功",
  3: "注册",
};

export const VisibleStatusEnum = {
  HIDE: 0,
  SHOW: 1,
} as const;

export type VisibleStatusEnum = (typeof VisibleStatusEnum)[keyof typeof VisibleStatusEnum];

export const VisibleStatusEnumLabel: Record<number, string> = {
  0: "隐藏",
  1: "显示",
};
