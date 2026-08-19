export interface Company {
  id: number;
  name: string;
  address: string;
  building: string;
  room: string;
  contact: string;
  capability: string;
  demand: string;
}

export const companies: Company[] = [
  { id: 1, name: '千机变(杭州)科技有限公司', address: '4-202', building: '4', room: '202', contact: '王玉松', capability: '以自主研发算法为核心竞争力，打造承载 300 + 自研算法的一站式 AI 算法超市底座。', demand: '市场拓展需求、资源扶持需求、产业合作需求' },
  { id: 2, name: '杭州龙航智远无人机科技有限公司', address: '11-202-4', building: '11', room: '202', contact: '吴琼', capability: '全军指定的单一来源无人机供应商', demand: '对接资本，资金用于扩建标准化量产基地' },
  { id: 3, name: '浙江兔行科技有限公司', address: '9-215-1', building: '9', room: '215', contact: '卜鸿鸣', capability: '核心业务聚焦于中高等职业院校的无人机专业建设与人才培养解决方案；', demand: '对接高校资源，加深与杭州周边高校的合作' },
  { id: 4, name: '华翌智能装备（杭州）有限公司', address: '3-401-2&5', building: '3', room: '401', contact: '姚易', capability: '自研AI AOI工业检测软件全套算法与技术架构', demand: '需行业渠道、政企合作入口、行业展会资源' },
  { id: 5, name: '杭州翎视科技有限公司', address: '10-308', building: '10', room: '308', contact: '汪磊磊', capability: '高层住宅、商业综合体、历史建筑的外立面安全检测及测量', demand: '客户资源：高层住宅小区等； 技术资源：自动航线规划算法；' },
  { id: 6, name: '浙江星穹智航科技有限公司', address: '10-410', building: '10', room: '410', contact: '庄庆玉', capability: '高空清洗、CAAC培训', demand: 'B端客户资源：无人机清洗 C端培训学员资源' },
  { id: 7, name: '杭州脸脸会网络技术有限公司', address: '3-301', building: '3', room: '301', contact: '赵海斌', capability: 'AI智能体、AI数字人、智能互动应用及文商旅场景数字化解决方案的研发、实施与运营服务', demand: '对接文旅景区、展馆、商业体等应用场景' },
  { id: 8, name: '杭州微鸿科技有限公司', address: '10-404、405', building: '10', room: '404、405', contact: '张丹', capability: '成熟的飞控平台能力体系，覆盖飞行控制、感知融合、任务调度等核心环节', demand: '有更多低空巡检、低空交通、应急保障等实际应用场景项目' },
  { id: 9, name: '杭州万升航控智能科技有限公司', address: '10-503', building: '10', room: '503', contact: '曹志强', capability: '专注构建无人机 “大脑”，通过地理空间管理、核心业务系统打造', demand: '对全自动飞行和算法平台有需求的用户' },
  { id: 10, name: '杭州团簇科技有限公司', address: '10-411', building: '10', room: '411', contact: '王露芸 13989329103', capability: '具身智能+ 多模态感知为核心技术底座，自研 “空天地” 一体化智慧巡检管控系统', demand: '面向公安、城管、水利、城建等政府部门或其信息化服务商寻求合作' },
  { id: 11, name: '杭州标彰电子科技有限公司', address: '10-302', building: '10', room: '302', contact: '李攀峰', capability: '自主研发和生产的测控系统、数据采集卡、窄脉冲发生器、高速信号发生器等产品', demand: '各高校、研究所等量子计算研究团队、量子计算商业公司的客户' },
  { id: 12, name: '杭州星智创享科技有限公司', address: '9-222', building: '9', room: '222', contact: '温博桐', capability: 'CC80非接触式清洁无人机系统', demand: '在行业深入探索意向的客户、对早期项目感兴趣的投资人' },
  { id: 13, name: '全域通用航空（杭州）有限公司', address: '10-101', building: '10', room: '101', contact: '李宏志', capability: '低空经济一体化生态体系建设，自研飞行服务平台、机载电脑、低空之家APP等核心产品，构建全链路低空服务能力。', demand: '政务/国企对接渠道、产业链硬件协同合作、低空服务生态企业资源' },
  { id: 14, name: '浙江瀚为科技有限公司', address: '6#', building: '6', room: '-', contact: '陈志远', capability: 'AI算力中心用高安全、高功率电池及直流侧供配电解决方案', demand: 'OE电源设备厂、新建数据中心EPC、设计院及咨询公司、海外渠道商代理商等。' },
  { id: 15, name: '圣翔（杭州）航空科技有限公司', address: '10-301', building: '10', room: '301', contact: '葛龄雅', capability: '全品类低空起降装备高端智造及场景运营解决方案', demand: '各地低空应用场景开放与政策试点支持，对接政府基建采购项目与政策性资金渠道' },
  { id: 16, name: '重隼智能科技（浙江）有限公司', address: '8-401', building: '8', room: '401', contact: '马丽娜', capability: '提供无人机低空安防、冷链运输、室内建模等领域完整行业解决方案', demand: '客户资源、行业渠道' },
  { id: 17, name: '杭州鲣翼科技有限公司', address: '11-305', building: '11', room: '305', contact: '姚小明', capability: '水陆两栖多用途倾转动力升力体无人飞行器”整机的研发、生产和应用', demand: '无人机应用场景技术研发合作、应用市场、产品销售合作' },
  { id: 18, name: '浙江十子鹰飞行科技有限公司', address: '8-301', building: '8', room: '301', contact: '周吉玲', capability: '面向各类院校提供校园科技体育兴趣教学一站式校企合作解决方案', demand: '院校合作资源：、渠道与生源资源、赛事及活动合作机会、产业生态合作伙伴、品牌宣传与流量资源、政策与平台支持：' },
  { id: 19, name: '浙江同创空间技术有限公司', address: '8-402', building: '8', room: '402', contact: '党乐晨', capability: '民航局浙江03考试点及中国AOPA浙江考试点可提供CAAC无人机考证全流程培训服务', demand: '打通院校、行业企业渠道，吸引在校学生、行业在岗从业者报名参训' },
  { id: 20, name: '军创（杭州）空间技术有限公司', address: '8-403', building: '8', room: '403', contact: '党乐晨', capability: '无人机飞手资源库与行业业务需求对接渠道，具备飞手-业务智能匹配平台的开发与运维能力', demand: '品牌曝光宣传' },
  { id: 21, name: '杭州纵迹云科技有限公司', address: '15-302', building: '15', room: '302', contact: '孟意博', capability: '具备工业重载、自动巡检、低空全域管控自研生产能力，可提供软硬件一体化成套设备与行业落地定制方案', demand: '面向政府、国企、大型基建单位征集林业、电力、桥梁、管廊无人机示范采购项目，同步招募渠道代理商、上游供应链伙伴' },
  { id: 22, name: '杭州昊舜视讯科技有限公司', address: '3-201', building: '3', room: '201', contact: '蔡赟', capability: '无人机全自动机场系列产品、智能管控平台及专业飞手团队', demand: '产业链上下游技术协同伙伴、行业市场渠道与集成伙伴' },
  { id: 23, name: '杭州飞算科技有限公司', address: '10-209', building: '10', room: '209', contact: '付钰', capability: '长航时复合翼无人机、低空反制装备供货以及云端智能管控平台部署', demand: '政企单位、环保、测绘行业客户和产业链上下游配套企业' },
  { id: 24, name: '飞手杭州低空经济发展有限公司', address: '9-304', building: '9', room: '304', contact: '王泽玺', capability: '协助企业进行巡检、测试、城市内各类空域审批', demand: '需要更多的供应链支撑外贸体系' },
  { id: 25, name: '浙江鑫核聚能科技有限公司', address: '10-504、505、506、507', building: '10', room: '504、505、506、507', contact: '盛秋红', capability: '射频氮化镓工艺的超宽带功率放大器芯片设计技术', demand: '企业形象赋能' },
  { id: 26, name: '城飞智能（杭州）科技有限公司', address: '4-406', building: '4', room: '406', contact: '王婷', capability: '低空智能起降场运营商，提供从顶层规划、软硬件研发部署、智能化升级到全周期运营的一体化解决方案', demand: '对接产业基金、科创投融资机构，满足项目扩产、市场拓展融资需求' },
  { id: 27, name: '泊航科技有限公司', address: '9-411', building: '9', room: '411', contact: '王阳', capability: '提供复杂构型可变翼无人机整机设计、嵌入式系统开发到飞控软件平台测试全栈技术解决方案', demand: '需要管道、电网巡检，长距离运输等广域高效无人机作业场景' },
  { id: 28, name: '杭州九数商务咨询有限公司', address: '9-303', building: '9', room: '303', contact: '道九', capability: '拥有AIGC全栈内容生成能力（AI视频/图像/文案/数字人）', demand: '以AIGC复现传统文化，制作影视级TVC宣传片、定制AI小程序，服务智慧文旅、城市文化及政企项目' },
  { id: 29, name: '墨悉科技有限公司', address: '10-510', building: '10', room: '510', contact: '黄峰明', capability: '面向具身智能时代的智能大脑与多智能体协同系统提供商', demand: '对接园区、低空经济、安防警务、应急救援、能源巡检、城市治理等真实应用场景，联合开展多智能体协同示范项目和场景验证' },
  { id: 30, name: '杭州零储科技有限公司', address: '11-309-2', building: '11', room: '309', contact: '庞亚洲', capability: '构建 “户用-工商-大储” 全系列产品矩阵，拥有从电芯PACK到交直流一体系统的垂直整合制造能力。', demand: '优质电芯、PCS及温控系统供应商，共建稳定、高效的供应链生态。' },
  { id: 31, name: '杭州启航线科技有限公司', address: '10-201', building: '10', room: '201', contact: '姜丽媛', capability: '全栈式低空操作系统，覆盖低空监管、飞行准入、AI 空域分配、数据治理及资产化服务', demand: '需联动各地政府低空管理部门，拓展更多区域试点落地场景，扩大监管服务平台覆盖范围' },
  { id: 32, name: '杭州艾铂特智能科技有限公司', address: '11-207', building: '11', room: '207', contact: '孙宇鹏', capability: '专注于高危场景具身智能机器人和AI算法平台的开发，具备全栈解决方案的交付能力。', demand: '对接物流生产侧的纸箱装卸需求、油气化工厂的巡检需求、有色金属行业智能化需求等真实工业应用场景的需求。' },
  { id: 33, name: '杭州零到一工业设计有限公司', address: '9-322', building: '9', room: '322', contact: '李文凯', capability: '专注工业设计与产品创新服务，提供产品策略、外观设计、结构设计、CMF设计、品牌设计及产品落地全流程解决方案', demand: '核心需求客户资源：智能制造、消费电子、医疗器械、机器人、新材料、低空经济等行业企业设计需求' },
  { id: 34, name: '杭州慢伴文化创意有限公司', address: '9-321', building: '9', room: '321', contact: '于丹', capability: '聚焦生活方式品牌打造与香氛产品创新，集原创设计、产品研发、品牌运营及供应链整合于一体', demand: '政府采购、企业福利采购、商务礼赠、会议活动礼品、文旅文创、地产物业等客户资源' },
  { id: 35, name: '浙江蔚然长风智能科技有限公司', address: '9-313', building: '9', room: '313', contact: '倪晓春', capability: '自研AI情感边缘计算技术，构建“筛查-预警-干预-管理”的全链路心理服务体系', demand: '寻求重点中小学、职业院校、监狱管理局、戒毒所及头部康养机构的试点合作机会' },
  { id: 36, name: '中科祥云低空科技（浙江）有限公司', address: '15-303', building: '15', room: '303', contact: '章真祥', capability: '智慧巡检 + 低空物流配送一体化解决方案', demand: '游客量较多且需要科技推动文旅发展的景区资源；有智慧巡检需求的政企资源' },
  { id: 37, name: '杭州归一智能科技有限公司', address: '10-509', building: '10', room: '509', contact: '冯素琴', capability: '“AI超级产线”营销内容工程化平台与AI影视短漫剧一站式工作平台', demand: '自有/授权漫剧厂牌、短剧发行与投流团队、MCN、代理商、出海内容团队' },
  { id: 38, name: '杭州凡章科技有限公司', address: '4-204', building: '4', room: '204', contact: '章晓龙', capability: '仓储管理系统WMS+室内无人机仓储盘点', demand: '对仓储数字化和自动化盘点有需求的客户' },
  { id: 39, name: '杭州矩正医疗科技有限公司', address: '5-301', building: '5', room: '301', contact: '郑楚楚', capability: '球囊扩张导管、血管封堵止血系统、静脉腔内射频闭合导管及配套有源设备发生器等产品的设计制造能力', demand: '渠道拓展需求、战略合作需求、学术推广需求' },
  { id: 40, name: '杭州思变笃行管理科技有限公司', address: '4号楼205室', building: '4', room: '-', contact: '李秀红', capability: '面向中大型企业提供沙盘模拟培训和定制、AI培训咨询应用开发', demand: '寻求有内训需求的大中型企业客户合作；诚邀行业协会联合推广' },
  { id: 41, name: '杭州云酷智能科技有限公司', address: '8号楼-1', building: '8', room: '1', contact: '胡岩秀', capability: '自研冷却液、高精流场及多级智能控制等核心技术，可提供数据中心、通信基站、储能等多场景一体化液冷解决方案', demand: '需拓展全国及国际化市场资源，深化液冷上中下游产业链战略合作' },
  { id: 42, name: '赞塔（杭州）科技有限公司', address: '8-201', building: '8', room: '201', contact: '李敏婕', capability: '自主研发听鉴、智录、点线、智审、智策等十余种公安专用智能体软硬件产品', demand: '公安客户、具有公安行业资源的渠道商或集成商；' },
  { id: 43, name: '杭州紫深智测技术有限公司', address: '11-505、11-103', building: '11', room: '505、11', contact: '汤卓群', capability: '环境与可靠性、EMC、电气安全等检测认证；自主开发VeriFLY UQ数据分析平台，为风险结果做可量化', demand: '客户需求（低空）：自主研发型的主机厂客户可从研发验证到检测认证到适航的一条龙服务' },
  { id: 44, name: '埃法智造（杭州）人工智能科技有限公司', address: '11-307', building: '11', room: '307', contact: '魏清松', capability: '自研 ANIMA 人造电子生命平台，提供模块化 AI桌面机器人硬件', demand: '客户资源、渠道缺口、产业资源、市场推广、行业展会资源、行业合作机会' },
  { id: 45, name: '集光年（杭州）科技有限公司', address: '9-206', building: '9', room: '206', contact: '王磊', capability: '为企业提供AIGC内容制作与培训，以及AI化品牌战略服务', demand: '持续引入有内容制作需求的品牌企业' },
  { id: 46, name: '杭州竞速动力科技有限公司', address: '11-303', building: '11', room: '303', contact: '李翔', capability: '专注于动力控制系统研发与产品概念性落地，长期深耕汽车、摩托及航空动力系统', demand: '对动力，载重和续航有需求的无人机公司或机器人公司；' },
  { id: 47, name: '奕科先进智能科技（杭州）有限公司', address: '3#302-5', building: '3', room: '5', contact: '郭晓萱', capability: '具备从 2kW 到 280kW 全功率段的无人机电机、内燃机及动力总成测试台架搭建能力，同时支持定制化需求', demand: '寻求对各类低空飞行器动力系统测试、配套设备定制研发有需求的客户资源' },
  { id: 48, name: '浙江有鹿机器人科技有限公司', address: '3-503', building: '3', room: '503', contact: '杜博奇', capability: '具身智能通用大脑；室外商业巡扫机器人AI130', demand: '场景需求：大型商场、学校、医院、产业园区、住宅小区、大型公共社区的室外清洁场景' },
  { id: 49, name: '浙江百应科技有限公司', address: '8号楼5楼', building: '8', room: '-', contact: '百应科技', capability: 'AI Agent智能平台；商业对话大模型 Gravity LLM； 行业解决方案', demand: '行业客户：金融、零售电商、医疗健康、教育、政务、出海企业等领域的企事业单位。' },
  { id: 50, name: '杭州数智医济医疗科技有限公司', address: '4-101', building: '4', room: '101', contact: '韩海风', capability: '过敏疾病数字疗法、标准化诊疗与无接触健康评估', demand: '需求为医院及医疗机构合作资源、产业合作入口' },
];

export const buildingList = ['全部', '3', '4', '5', '6', '8', '9', '10', '11', '15'];

export const buildingColors: Record<string, string> = {
  '2': '#6366f1',
  '3': '#8b5cf6',
  '4': '#ec4899',
  '5': '#f43f5e',
  '6': '#f97316',
  '8': '#eab308',
  '9': '#22c55e',
  '10': '#06b6d4',
  '11': '#3b82f6',
  '15': '#a855f7',
  '-': '#94a3b8',
};
