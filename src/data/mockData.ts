export const STATS = {
  companyCount: 200,
  industryCount: 6,
  techCapabilityCount: 80,
  cooperationCount: 120,
};

export const HOT_DIRECTIONS = [
  { label: 'AI大模型', icon: 'fa-brain', color: '#6366f1' },
  { label: '低空经济', icon: 'fa-plane', color: '#0ea5e9' },
  { label: '具身智能', icon: 'fa-robot', color: '#8b5cf6' },
  { label: '未来医疗', icon: 'fa-heart-pulse', color: '#ec4899' },
  { label: '算力基础', icon: 'fa-microchip', color: '#f59e0b' },
  { label: '机器人', icon: 'fa-gears', color: '#10b981' },
];

export const FEATURED_COMPANIES = [
  {
    id: 1,
    name: '实在智能',
    industry: 'AI Agent',
    tags: ['AI大模型', '企业数字化'],
    coreTech: 'RPA + AI Agent 智能体平台',
    description: '企业级软件智能体，数字员工服务超6000家企业',
    seeking: '寻找制造业、政务场景合作伙伴',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=shizai',
  },
  {
    id: 2,
    name: '有鹿机器人',
    industry: '具身智能',
    tags: ['具身智能', '机器人'],
    coreTech: '通用大脑 + 专业设备具身智能系统',
    description: '聚焦具身智能，完成6亿元具身智能通用大脑订单',
    seeking: '寻找工业场景验证与量产合作',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=youlu',
  },
  {
    id: 3,
    name: '昊舜视讯',
    industry: '低空经济',
    tags: ['低空经济', '无人机'],
    coreTech: '无人机集群智能管控系统',
    description: '低空经济领域深耕10年，全自动无人机机场研发生产',
    seeking: '寻找城市治理、文旅场景应用合作',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=haoshun',
  },
  {
    id: 4,
    name: '浙江聚众',
    industry: '智能传感',
    tags: ['集成电路', '传感器'],
    coreTech: 'MEMS高精传感器全产业链',
    description: '高精传感器全产业链科创公司，与之江实验室深度合作',
    seeking: '寻找航空航天、工业检测应用场景',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=juzhong',
  },
  {
    id: 5,
    name: '赞塔科技',
    industry: 'AI安全',
    tags: ['AI大模型', '公共安全'],
    coreTech: '大数据 + 大模型 AI社会治理',
    description: '六大AI助手产品矩阵，服务杭州多个基层公安系统',
    seeking: '寻找政务、安防领域深度合作',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=zanta',
  },
  {
    id: 6,
    name: '同创空间',
    industry: '低空经济',
    tags: ['低空经济', '人才培养'],
    coreTech: '低空人才培养与无人机场景应用',
    description: 'CAAC无人机驾照浙江03考点，低空产业服务全链条',
    seeking: '寻找低空经济产业链上下游合作',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=tongchuang',
  },
];

export const EXPLORE_ENTRIES = [
  {
    id: 'map',
    title: '园区技术地图',
    description: '从空间维度探索企业，发现南湖各楼栋的技术分布与产业集群',
    icon: 'fa-map-location-dot',
    buttonText: '进入地图',
    color: 'from-blue-600 to-cyan-500',
    href: '#/map',
  },
  {
    id: 'resources',
    title: '产业资源广场',
    description: '从技术、产品、需求、合作维度寻找资源，连接产业伙伴',
    icon: 'fa-store',
    buttonText: '探索资源',
    color: 'from-violet-600 to-purple-500',
    href: '#/resources',
  },
];
