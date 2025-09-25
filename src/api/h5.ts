import { http } from "@/utils/http";

// 塔吊数据类型定义
export type TowerCraneResult = {
  success: boolean;
  code: number;
  meta: null;
  message: null;
  messages: null;
  data: any;
  complexData: boolean;
  encryptData: boolean;
  disableEncrypt: boolean;
};

// 处理后的控制面板数据
export type ProcessedControlData = {
  /** 幅度 */
  amplitude: string;
  /** 高度 */
  height: string;
  /** 回转 */
  rotation: string;
  /** 起重量 */
  weight: string;
  /** 运行状态 */
  status: string;
  /** 原始数据 */
  rawData: any;
};

// 环境监测数据类型定义
export type EnvironmentResult = {
  success: boolean;
  code: number;
  meta: null;
  message: null;
  messages: null;
  data: {
    id: string;
    mn: string;
    temperature: string;
    humidity: string;
    pressure: string;
    windSpeed: string;
    windDirection: number;
    pm25: number;
    pm10: number;
    tsp: number;
    noise: string;
    updTime: string;
    createTime: string;
    deleted: number;
    location: null;
  };
  complexData: boolean;
  encryptData: boolean;
  disableEncrypt: boolean;
};

// 处理后的环境监测数据
export type ProcessedEnvironmentData = {
  /** 温度 */
  temperature: string;
  /** 湿度 */
  humidity: string;
  /** 大气压 */
  pressure: string;
  /** 风速 */
  windSpeed: string;
  /** 运行状态 */
  status: string;
  /** 原始数据 */
  rawData: any;
};

// 人员考勤记录
export interface AttendanceRecord {
  id: string;
  realName: string; // 人员姓名
  teamName: string; // 班组
  inTime: string; // 入场时间
  outTime: string | null; // 出场时间
  workTime: number; // 工作时长 (h)
}

// 人员考勤API分页响应
export interface FaceAttendanceResult {
  success: boolean;
  code: number;
  data: {
    records: AttendanceRecord[];
    total: number;
    pages: number;
    pageSize: number;
    current: number;
  };
}

// 健康监测记录
export interface HealthRecord {
  username: string; // 监测人员
  orgName: string | null; // 班组
  monitortime: number[] | string; // 监测时间 [年, 月, 日, 时, 分, 秒] 或字符串
  heartbeat: number | null; // 心率值 (bpm)
  shrink: number | null; // 收缩压 (mmhg)
  diastolic: number | null; // 舒张压 (mmhg)
  temperature: number | null; // 体温 (℃)
  devicecode: string; // 设备编码
  personid: string; // 人员ID
}

// 健康监测API响应
export interface HealthDataResult {
  success: boolean;
  code: number;
  data: {
    type: string;
    count: number;
    list: HealthRecord[];
    fields: any[];
  };
}

/**
 * 格式化数字，去掉末尾的0，最多保留2位小数
 * @param value 数字字符串
 * @returns 格式化后的字符串
 */
const formatNumber = (value: string): string => {
  const num = parseFloat(value);
  if (isNaN(num)) return "0";

  // 保留2位小数，然后去掉末尾的0
  return num.toFixed(2).replace(/\.?0+$/, "");
};

/**
 * 获取塔吊最新数据
 * @param towerCraneId 塔吊ID，默认为6577049
 * @param type 数据类型，默认为0
 */
export const getTowerCraneLatestData = (
  towerCraneId: string = "6577049",
  type: number = 0
) => {
  return http.request<TowerCraneResult>(
    "get",
    "/anon/kjxa/action/tower-crane/latest-data",
    {
      params: {
        type,
        towerCraneId
      }
    },
    {
      // 禁用进度条，避免视觉干扰
      disableProgress: true
    }
  );
};

/**
 * 获取处理后的控制面板数据
 * @param towerCraneId 塔吊ID
 * @param type 数据类型
 */
export const getProcessedControlData = async (
  towerCraneId: string = "6577049",
  type: number = 0
): Promise<ProcessedControlData> => {
  try {
    const response = await getTowerCraneLatestData(towerCraneId, type);

    if (response.success && response.data) {
      const data = response.data;

      return {
        amplitude: formatNumber(data.craneRange),
        height: formatNumber(data.craneHeight),
        rotation: formatNumber(data.craneRotation),
        weight: formatNumber(data.craneElevatingCapacity),
        status: "运行", // 请求成功表示运行状态
        rawData: data
      };
    } else {
      throw new Error("获取数据失败");
    }
  } catch (error) {
    // 请求失败表示离线状态
    throw new Error("设备离线");
  }
};

/**
 * 获取环境监测最新数据
 * @param mn 监测点编号，默认为20250702GC0001
 */
export const getEnvironmentLatestData = (mn: string = "20250702GC0001") => {
  return http.request<EnvironmentResult>(
    "get",
    `/anon/kjxa/environment/data/latest/${mn}`,
    {},
    {
      // 禁用进度条，避免视觉干扰
      disableProgress: true
    }
  );
};

/**
 * 获取处理后的环境监测数据
 * @param mn 监测点编号
 */
export const getProcessedEnvironmentData = async (
  mn: string = "20250702GC0001"
): Promise<ProcessedEnvironmentData> => {
  try {
    const response = await getEnvironmentLatestData(mn);

    if (response.success && response.data) {
      const data = response.data;

      return {
        temperature: formatNumber(data.temperature),
        humidity: formatNumber(data.humidity),
        pressure: formatNumber(data.pressure),
        windSpeed: formatNumber(data.windSpeed),
        status: "运行", // 请求成功表示运行状态
        rawData: data
      };
    } else {
      throw new Error("获取数据失败");
    }
  } catch (error) {
    // 请求失败表示离线状态
    throw new Error("设备离线");
  }
};

/**
 * 获取人员考勤分页数据
 * @param data 请求体
 */
export const getFaceAttendancePage = (data: {
  realName?: string;
  devicePosition?: string;
  pageSize?: number;
  current?: number;
}) => {
  return http.request<FaceAttendanceResult>(
    "post",
    "/anon/kjxa/action/face-attendance/work/search-page",
    { data },
    {
      disableProgress: true
    }
  );
};

/**
 * 获取人员健康监测数据
 * @param data 请求体
 */
export const getHealthMonitorData = (data: {
  userName?: string;
  orgId?: string;
  deviceCode?: string;
  unit?: string;
  pageSize?: number;
  current?: number;
}) => {
  return http.request<HealthDataResult>(
    "post",
    "/api/base/data/data-select/search-collect-page?code=smartBandLogGroup",
    { data },
    {
      disableProgress: true
    }
  );
};
