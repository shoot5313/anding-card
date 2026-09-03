/* Generated from docs/TRIVIA_*.md by scripts/build-trivia-data.cjs. */
(function (root, factory) {
  var questions = factory();
  if (root) root.ANDING_TRIVIA = questions;
  if (typeof module === "object" && module.exports) module.exports = questions;
}(typeof window !== "undefined" ? window : this, function () {
  return [
    {
      "id": "nature-001",
      "code": "NAT-001",
      "number": 1,
      "category": "nature",
      "title": "金星的一天和一年",
      "prompt": "金星自转一圈和绕太阳一圈，哪个更久？",
      "choices": [
        "绕太阳一圈",
        "自转一圈",
        "两者一样久"
      ],
      "answerIndex": 1,
      "answer": "自转一圈",
      "explanation": "金星自转一圈约需 243 个地球日，绕太阳一圈约需 225 个地球日。在那里，转个身比过一年还慢。",
      "sourceLabel": "NASA Science · Venus Facts",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-002",
      "code": "NAT-002",
      "number": 2,
      "category": "nature",
      "title": "藏在海里的瀑布",
      "prompt": "地球上规模最大的瀑布藏在哪里？",
      "choices": [
        "亚马孙雨林深处",
        "南极冰盖边缘",
        "丹麦海峡的海面下"
      ],
      "answerIndex": 2,
      "answer": "丹麦海峡的海面下",
      "explanation": "冷而密的海水沉到暖水下方，再越过海底落差，形成约 3.5 千米高的水下瀑布。它很壮观，只是站在岸上看不见。",
      "sourceLabel": "NOAA Ocean Service · Where is Earth’s Largest Waterfall?",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-003",
      "code": "NAT-003",
      "number": 3,
      "category": "nature",
      "title": "没有沙子的沙漠",
      "prompt": "按降水量判断，下面哪个地方也属于沙漠？",
      "choices": [
        "南极洲",
        "亚马孙雨林",
        "长江三角洲"
      ],
      "answerIndex": 0,
      "answer": "南极洲",
      "explanation": "沙漠看的是降水少，不是有没有沙子、天气热不热。南极洲每年降雪折算成的降雨量只有约 150 毫米。",
      "sourceLabel": "British Antarctic Survey · Antarctic factsheet",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-004",
      "code": "NAT-004",
      "number": 4,
      "category": "nature",
      "title": "从山脚量起",
      "prompt": "如果从山脚一路量到山顶，哪座山比珠穆朗玛峰更高？",
      "choices": [
        "富士山",
        "冒纳凯阿火山",
        "乞力马扎罗山"
      ],
      "answerIndex": 1,
      "answer": "冒纳凯阿火山",
      "explanation": "它从海底山脚到山顶超过 10,210 米；珠穆朗玛峰仍是海拔最高的山峰。换一种尺子，冠军就换人了。",
      "sourceLabel": "NOAA Ocean Service · What is the highest point on Earth?",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-005",
      "code": "NAT-005",
      "number": 5,
      "category": "nature",
      "title": "谁才是莓果",
      "prompt": "按植物学定义，下面哪个是“莓果”？",
      "choices": [
        "草莓",
        "覆盆子",
        "香蕉"
      ],
      "answerIndex": 2,
      "answer": "香蕉",
      "explanation": "真正的莓果来自一朵花里的一个子房；草莓和覆盆子反而不属于这一类。水果摊和植物学，各有各的分组方式。",
      "sourceLabel": "Royal Botanic Gardens, Kew · Pomegranate facts",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-006",
      "code": "NAT-006",
      "number": 6,
      "category": "nature",
      "title": "雨味也有名字",
      "prompt": "雨落在干土上时那股特别的气味，有哪个英文名字？",
      "choices": [
        "Petrichor",
        "Aurora",
        "Monsoon"
      ],
      "answerIndex": 0,
      "answer": "Petrichor",
      "explanation": "澳大利亚 CSIRO 的 Joy Bear 和 Richard Thomas 在 1964 年提出这个词，用来描述湿气从岩石和土壤中带出的那股雨味。",
      "sourceLabel": "CSIRO · The smell of rain",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-007",
      "code": "NAT-007",
      "number": 7,
      "category": "nature",
      "title": "火星的蓝色告别",
      "prompt": "火星日落时，太阳附近的天空通常更接近哪种颜色？",
      "choices": [
        "蓝色",
        "绿色",
        "亮白色"
      ],
      "answerIndex": 0,
      "answer": "蓝色",
      "explanation": "火星大气中的细尘让蓝光更容易沿太阳方向穿过并散射，所以日落附近会显出蓝色；这颗红色星球，告别白天时反而偏蓝。",
      "sourceLabel": "NASA Science · What Do Sunrises and Sunsets Look Like on Mars?",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-008",
      "code": "NAT-008",
      "number": 8,
      "category": "nature",
      "title": "侧着滚的行星",
      "prompt": "哪颗行星看起来像一只球侧着滚动，绕太阳前进？",
      "choices": [
        "木星",
        "天王星",
        "水星"
      ],
      "answerIndex": 1,
      "answer": "天王星",
      "explanation": "它的自转轴相对公转轨道倾斜将近 90 度，所以看起来几乎是躺着转的。别的行星转圈，它颇像把转圈改成了打滚。",
      "sourceLabel": "NASA Science · Uranus Facts",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-009",
      "code": "NAT-009",
      "number": 9,
      "category": "nature",
      "title": "最短的一天",
      "prompt": "太阳系八大行星中，哪颗行星的一天最短？",
      "choices": [
        "地球",
        "土星",
        "木星"
      ],
      "answerIndex": 2,
      "answer": "木星",
      "explanation": "木星自转一圈只需约 9.9 小时，是八大行星里一天最短的；块头很大，转身倒挺利索。",
      "sourceLabel": "NASA Science · Jupiter Facts",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-010",
      "code": "NAT-010",
      "number": 10,
      "category": "nature",
      "title": "能漂起来的行星",
      "prompt": "假如真有一个足够大的水池，哪颗行星理论上能漂在水面上？",
      "choices": [
        "土星",
        "火星",
        "海王星"
      ],
      "answerIndex": 0,
      "answer": "土星",
      "explanation": "土星的平均密度低于水，因此在这个只存在于想象里的超大水池中可以浮起。水池的施工方案，NASA 暂时没有提供。",
      "sourceLabel": "NASA Science · Cassini FAQ",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-011",
      "code": "NAT-011",
      "number": 11,
      "category": "nature",
      "title": "月亮也在转",
      "prompt": "我们总看到月球大致同一面，主要是因为什么？",
      "choices": [
        "月球完全不自转",
        "月球自转一圈与绕地球一圈用时相同",
        "地球的影子挡住了另一面"
      ],
      "answerIndex": 1,
      "answer": "月球自转一圈与绕地球一圈用时相同",
      "explanation": "这叫同步自转，所以它每绕一圈，也刚好自己转一圈；月亮不是不转，只是配合得很准。",
      "sourceLabel": "NASA Science · Moon Facts",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-012",
      "code": "NAT-012",
      "number": 12,
      "category": "nature",
      "title": "八分钟以前的阳光",
      "prompt": "太阳发出的光到达地球，大约需要多久？",
      "choices": [
        "8 秒",
        "8 小时",
        "8 分钟"
      ],
      "answerIndex": 2,
      "answer": "8 分钟",
      "explanation": "NASA 给出的单程光行时间约为 8.35 分钟，因此此刻照到窗边的阳光，是太阳八分多钟前寄出的。",
      "sourceLabel": "NASA Science · Facts About Earth",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-013",
      "code": "NAT-013",
      "number": 13,
      "category": "nature",
      "title": "最快过年的行星",
      "prompt": "哪颗行星绕太阳一圈只需约 88 个地球日？",
      "choices": [
        "水星",
        "地球",
        "火星"
      ],
      "answerIndex": 0,
      "answer": "水星",
      "explanation": "水星绕太阳运行得比其他行星都快，大约 88 个地球日就是它的一年。日历翻得很勤快。",
      "sourceLabel": "NASA Science · Mercury Facts",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-014",
      "code": "NAT-014",
      "number": 14,
      "category": "nature",
      "title": "文学味的卫星名字",
      "prompt": "哪颗行星的卫星常以莎士比亚和亚历山大·蒲柏作品中的人物命名？",
      "choices": [
        "火星",
        "天王星",
        "海王星"
      ],
      "answerIndex": 1,
      "answer": "天王星",
      "explanation": "它的卫星名字在行星家族中很特别，许多来自莎士比亚和蒲柏笔下的人物，像是把一小座文学馆送上了轨道。",
      "sourceLabel": "NASA Science · Uranus Facts",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-015",
      "code": "NAT-015",
      "number": 15,
      "category": "nature",
      "title": "香草其实是兰花",
      "prompt": "天然香草香料主要来自什么？",
      "choices": [
        "一种草的根",
        "一种树的汁液",
        "一种兰花经干燥熟化的果实"
      ],
      "answerIndex": 2,
      "answer": "一种兰花经干燥熟化的果实",
      "explanation": "香荚兰的长条果实经过干燥和熟化，才产生熟悉的香草风味；冰淇淋里藏着一点兰花身世。",
      "sourceLabel": "Royal Botanic Gardens, Kew · Vanilla",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-016",
      "code": "NAT-016",
      "number": 16,
      "category": "nature",
      "title": "竹子的植物学身份",
      "prompt": "竹子在植物分类上属于哪一类？",
      "choices": [
        "禾本科的草",
        "棕榈科的树",
        "一种蕨类"
      ],
      "answerIndex": 0,
      "answer": "禾本科的草",
      "explanation": "竹子属于禾本科，有些巨竹可长到约 25 米高。它把“草”这个身份发挥得相当高调。",
      "sourceLabel": "Royal Botanic Gardens, Kew · Giant Bamboo",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-017",
      "code": "NAT-017",
      "number": 17,
      "category": "nature",
      "title": "一朵向日葵有很多朵花",
      "prompt": "我们看到的一整盘向日葵，实际上是什么？",
      "choices": [
        "一朵特别大的花",
        "许多小花组成的花序",
        "叶片层层叠成的圆盘"
      ],
      "answerIndex": 1,
      "answer": "许多小花组成的花序",
      "explanation": "外围的黄色舌状花和中央密集的管状花共同组成花盘；看似独唱，其实是合唱团。",
      "sourceLabel": "Royal Botanic Gardens, Kew · Sunflower",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-018",
      "code": "NAT-018",
      "number": 18,
      "category": "nature",
      "title": "成熟向日葵的固定方向",
      "prompt": "常见向日葵成熟后，花盘通常固定朝向哪边？",
      "choices": [
        "西边",
        "北边",
        "东边"
      ],
      "answerIndex": 2,
      "answer": "东边",
      "explanation": "会从东向西追随太阳的主要是尚未成熟的花蕾，成熟花盘通常固定朝东。它不是追不动了，而是正式选好了座位。",
      "sourceLabel": "Royal Botanic Gardens, Kew · Sunflower",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-019",
      "code": "NAT-019",
      "number": 19,
      "category": "nature",
      "title": "世界最大的种子",
      "prompt": "哪种植物能结出世界上最大、最重的种子？",
      "choices": [
        "海椰子（coco-de-mer）",
        "普通椰子",
        "牛油果"
      ],
      "answerIndex": 0,
      "answer": "海椰子",
      "explanation": "它的种子可重达约 25 千克、长约半米；这颗种子出门，大概值得单独办一件行李。",
      "sourceLabel": "Royal Botanic Gardens, Kew · Double Coconut: The Largest Seed in the World",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-020",
      "code": "NAT-020",
      "number": 20,
      "category": "nature",
      "title": "菠萝是一支合唱队",
      "prompt": "一个菠萝通常由大约多少朵花结成的小果融合而成？",
      "choices": [
        "10 至 20 朵",
        "100 至 200 朵",
        "1,000 至 2,000 朵"
      ],
      "answerIndex": 1,
      "answer": "100 至 200 朵",
      "explanation": "菠萝属于复果，来自许多花各自结出的小果再融合成整体；外皮上的一格一格，颇像它保留下来的集体照。",
      "sourceLabel": "Royal Botanic Gardens, Kew Science · Ananas comosus",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-021",
      "code": "NAT-021",
      "number": 21,
      "category": "nature",
      "title": "咖啡豆不是豆",
      "prompt": "从植物结构看，咖啡“豆”其实是什么？",
      "choices": [
        "根部的小块茎",
        "树皮上的结节",
        "咖啡果实里的种子"
      ],
      "answerIndex": 2,
      "answer": "咖啡果实里的种子",
      "explanation": "咖啡豆原本待在通常呈红色的咖啡果实中，烘焙后才变成熟悉的深褐色。它只是长得很像豆，名字就这么定下来了。",
      "sourceLabel": "Royal Botanic Gardens, Kew · 5 Things You Didn't Know About Coffee",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-022",
      "code": "NAT-022",
      "number": 22,
      "category": "nature",
      "title": "花生的近亲",
      "prompt": "从植物分类看，花生与下面哪一种食物更接近？",
      "choices": [
        "豌豆",
        "核桃",
        "葵花籽"
      ],
      "answerIndex": 0,
      "answer": "豌豆",
      "explanation": "花生属于豆科，是豆类而不是坚果；授粉后，花梗还会向下钻入土中，让种子在那里发育。",
      "sourceLabel": "Royal Botanic Gardens, Kew · Peanut",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-023",
      "code": "NAT-023",
      "number": 23,
      "category": "nature",
      "title": "肉桂来自哪里",
      "prompt": "烹饪中使用的肉桂粉和肉桂棒，主要取自肉桂树的哪一部分？",
      "choices": [
        "花瓣",
        "内层树皮",
        "果核"
      ],
      "answerIndex": 1,
      "answer": "内层树皮",
      "explanation": "肉桂树的内层树皮经过处理和干燥，会卷成常见的桂皮棒。它不是木头味调料，而是树皮认真上班。",
      "sourceLabel": "Royal Botanic Gardens, Kew · Cinnamon",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-024",
      "code": "NAT-024",
      "number": 24,
      "category": "nature",
      "title": "树干上开花",
      "prompt": "可可树会把小花开在什么地方？",
      "choices": [
        "地下根部",
        "最嫩的叶尖",
        "树干和较粗的枝条上"
      ],
      "answerIndex": 2,
      "answer": "树干和较粗的枝条上",
      "explanation": "这种现象叫作老茎生花，可可果之后也会直接挂在树干或大枝上。巧克力的开场位置，确实有点出人意料。",
      "sourceLabel": "Royal Botanic Gardens, Kew · Cacao Tree",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-025",
      "code": "NAT-025",
      "number": 25,
      "category": "nature",
      "title": "彩虹原来是圆的",
      "prompt": "如果视野没有被地面挡住，一道完整彩虹实际是什么形状？",
      "choices": [
        "一个圆",
        "一条直线",
        "一个三角形"
      ],
      "answerIndex": 0,
      "answer": "一个圆",
      "explanation": "人在地面上通常只能看到圆的一部分，而从合适高度和角度观察，有机会看见完整的圆形彩虹。彩虹没有缺一截，只是地平线先替它收起来了。",
      "sourceLabel": "NOAA NESDIS · What Causes a Rainbow?",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-026",
      "code": "NAT-026",
      "number": 26,
      "category": "nature",
      "title": "雾和云的关系",
      "prompt": "从形成方式看，雾最接近下面哪一种描述？",
      "choices": [
        "飘得特别高的云",
        "贴近或接触地面的云",
        "河流升起的一团水汽"
      ],
      "answerIndex": 1,
      "answer": "贴近或接触地面的云",
      "explanation": "雾和云都由空气中的小水滴或冰晶形成，主要区别是雾出现在地面附近。云偶尔也会下来散个步。",
      "sourceLabel": "NOAA NESDIS · What's the Difference Between Fog and Clouds?",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-027",
      "code": "NAT-027",
      "number": 27,
      "category": "nature",
      "title": "雨滴并不像眼泪",
      "prompt": "较大的雨滴在下落时，形状更接近什么？",
      "choices": [
        "尖尖的泪滴",
        "一根细针",
        "上圆下平的汉堡面包顶"
      ],
      "answerIndex": 2,
      "answer": "上圆下平的汉堡面包顶",
      "explanation": "小雨滴接近球形，较大的雨滴受空气流动影响，底部会变平；天气图标里的泪滴造型，属于美术部门的决定。",
      "sourceLabel": "NASA Global Precipitation Measurement Mission · The Shape of a Raindrop",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-028",
      "code": "NAT-028",
      "number": 28,
      "category": "nature",
      "title": "天空为什么偏蓝",
      "prompt": "晴朗白天的天空看起来偏蓝，主要是因为什么？",
      "choices": [
        "较短波长的蓝光更容易被大气散射",
        "海洋把蓝色反射到了整个天空",
        "空气中含有蓝色颜料"
      ],
      "answerIndex": 0,
      "answer": "较短波长的蓝光更容易被大气散射",
      "explanation": "阳光进入大气后，蓝光比多数其他可见光更容易向各个方向散开，于是天空像给自己铺了一层蓝色背景。",
      "sourceLabel": "NOAA NESDIS · Why Is the Sky Blue?",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-029",
      "code": "NAT-029",
      "number": 29,
      "category": "nature",
      "title": "看起来轻飘飘的云",
      "prompt": "按 USGS 的估算，一朵体积约 1 立方千米的积云，其中水滴总重大约多少？",
      "choices": [
        "500 千克",
        "50 万千克",
        "5 亿千克"
      ],
      "answerIndex": 1,
      "answer": "50 万千克",
      "explanation": "云中水滴虽然合计很重，却分散在巨大的空间里，云团密度仍低于周围较干的空气，所以可以浮在空中。看起来轻，不等于没分量。",
      "sourceLabel": "U.S. Geological Survey · How Much Does a Cloud Weigh?",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-030",
      "code": "NAT-030",
      "number": 30,
      "category": "nature",
      "title": "板块的慢动作",
      "prompt": "地球构造板块通常每年移动多快？",
      "choices": [
        "数十千米",
        "数十米",
        "几厘米，约等于指甲生长速度"
      ],
      "answerIndex": 2,
      "answer": "几厘米，约等于指甲生长速度",
      "explanation": "不同板块的速度和方向不完全相同，但总体都是人难以察觉的慢动作；地球办大事，并不总是着急。",
      "sourceLabel": "U.S. Geological Survey · How Fast Do Tectonic Plates Move?",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-031",
      "code": "NAT-031",
      "number": 31,
      "category": "nature",
      "title": "会漂的石头",
      "prompt": "有些浮石放进水里，会出现什么情况？",
      "choices": [
        "漂在水面",
        "立刻溶解",
        "像磁铁一样吸住容器"
      ],
      "answerIndex": 0,
      "answer": "漂在水面",
      "explanation": "浮石内部有大量被困住的气泡，使整体密度可能低于水；它是石头，却暂时拿到了船票。",
      "sourceLabel": "U.S. Geological Survey · Rocks Float Briefly Where Lava Meets the Sea",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-032",
      "code": "NAT-032",
      "number": 32,
      "category": "nature",
      "title": "海浪送走了什么",
      "prompt": "海浪跨过海面时，主要向前传递的是什么？",
      "choices": [
        "原地的大量海水",
        "能量",
        "海底的沙粒"
      ],
      "answerIndex": 1,
      "answer": "能量",
      "explanation": "波浪中的水主要做近似圆周运动，向远方传播的是能量，并不是同一批水一路跑到岸边。海水大多只是在原地比划。",
      "sourceLabel": "NOAA Ocean Service · Why Does the Ocean Have Waves?",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-033",
      "code": "NAT-033",
      "number": 33,
      "category": "nature",
      "title": "水下的声音很赶时间",
      "prompt": "声音在海水中的传播速度，与在空气中相比怎样？",
      "choices": [
        "慢得多",
        "大致相同",
        "快四倍左右"
      ],
      "answerIndex": 2,
      "answer": "快四倍左右",
      "explanation": "声音在海水中约为每秒 1,500 米，在空气中约为每秒 340 米。消息一进水，脚步反而快了。",
      "sourceLabel": "NOAA Ocean Service · How Far Does Sound Travel in the Ocean?",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "nature-034",
      "code": "NAT-034",
      "number": 34,
      "category": "nature",
      "title": "会唱歌的沙丘",
      "prompt": "在少数地方，完全干燥的沙粒沿沙丘滑动时可能发出什么？",
      "choices": [
        "彩色闪光",
        "低沉的嗡鸣声",
        "清甜的香味"
      ],
      "answerIndex": 1,
      "answer": "低沉的嗡鸣声",
      "explanation": "美国国家公园管理局在大沙丘记录过这种罕见声音，听起来像低音管风琴或远处飞机的轰鸣，因此人们称它为“会唱歌的沙”。",
      "sourceLabel": "U.S. National Park Service · Singing Sands",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-001",
      "code": "ANI-001",
      "number": 1,
      "category": "animal",
      "title": "章鱼的心脏配置",
      "prompt": "章鱼有几颗心脏？",
      "choices": [
        "一颗",
        "两颗",
        "三颗"
      ],
      "answerIndex": 2,
      "answer": "三颗",
      "explanation": "两颗把血送过鳃，一颗把血送往身体其他部分；它们的血因含铜的血蓝蛋白呈蓝色。章鱼在心脏配置上相当不节省。",
      "sourceLabel": "Smithsonian Ocean · Cephalopods",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-002",
      "code": "ANI-002",
      "number": 2,
      "category": "animal",
      "title": "海马爸爸的育儿袋",
      "prompt": "海马宝宝出生前，通常由谁把它们装在育儿袋里？",
      "choices": [
        "雌性海马",
        "雄性海马",
        "海马把卵留在海草上"
      ],
      "answerIndex": 1,
      "answer": "雄性海马",
      "explanation": "雌性把卵送进雄性的育儿袋，卵在那里受精和发育，最后由雄性生产。海马爸爸是真的会怀孕。",
      "sourceLabel": "NOAA Ocean Service · How do seahorses differ?",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-003",
      "code": "ANI-003",
      "number": 3,
      "category": "animal",
      "title": "蝴蝶用哪里尝味道",
      "prompt": "蝴蝶站在叶子上时，可以用哪里“尝味道”？",
      "choices": [
        "脚",
        "翅膀",
        "眼睛"
      ],
      "answerIndex": 0,
      "answer": "脚",
      "explanation": "蝴蝶脚上有感受化学物质的结构，落在叶片上就能判断这里是否适合进食或产卵。它们踩一脚，确实能尝出点东西。",
      "sourceLabel": "Smithsonian’s National Zoo · Pollinator facts",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-004",
      "code": "ANI-004",
      "number": 4,
      "category": "animal",
      "title": "驯鹿眼里的冬季模式",
      "prompt": "北极驯鹿眼底的反光层，到了冬天会更接近哪种颜色？",
      "choices": [
        "金黄色",
        "橙红色",
        "深蓝色"
      ],
      "answerIndex": 2,
      "answer": "深蓝色",
      "explanation": "这层结构在夏天偏金色，冬天变成深蓝色，能提高昏暗环境中的感光能力。驯鹿自带季节显示模式。",
      "sourceLabel": "UCL Discovery · Shifting mirrors in Arctic reindeer",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-005",
      "code": "ANI-005",
      "number": 5,
      "category": "animal",
      "title": "方块便便",
      "prompt": "哪种动物能拉出接近小方块的便便？",
      "choices": [
        "水獭",
        "袋熊",
        "水豚"
      ],
      "answerIndex": 1,
      "answer": "袋熊",
      "explanation": "方块是在大肠末端由不同方向的软硬差异和肌肉收缩塑成的，不是因为出口是方的——科学家认真确认过这一点。",
      "sourceLabel": "Georgia Tech · Ig Nobel for Cubed Poops",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-006",
      "code": "ANI-006",
      "number": 6,
      "category": "animal",
      "title": "倒着飞的鸟",
      "prompt": "下面哪种鸟能真正向后飞？",
      "choices": [
        "蜂鸟",
        "企鹅",
        "鸵鸟"
      ],
      "answerIndex": 0,
      "answer": "蜂鸟",
      "explanation": "蜂鸟的翅膀能以近似八字形运动，在两个方向的挥动中都产生升力，因此能悬停、侧飞和倒着飞。",
      "sourceLabel": "U.S. National Park Service · Earth’s Original Aviators",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-007",
      "code": "ANI-007",
      "number": 7,
      "category": "animal",
      "title": "熊猫的“伪拇指”",
      "prompt": "大熊猫用来夹住竹子的“伪拇指”，主要是什么结构？",
      "choices": [
        "一小撮特别硬的毛",
        "加长、变大的腕骨",
        "额外长出的真正手指"
      ],
      "answerIndex": 1,
      "answer": "加长、变大的腕骨",
      "explanation": "这块腕骨外面包着肉垫，能和其他手指配合抓住竹子；名字叫拇指，身份证上仍是腕骨。",
      "sourceLabel": "Smithsonian’s National Zoo · Giant panda",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-008",
      "code": "ANI-008",
      "number": 8,
      "category": "animal",
      "title": "小熊猫的随身围巾",
      "prompt": "天气很冷时，小熊猫蓬松的长尾巴还能怎么用？",
      "choices": [
        "敲树干发声",
        "卷起落叶挖洞",
        "围住身体和脸挡风保暖"
      ],
      "answerIndex": 2,
      "answer": "围住身体和脸挡风保暖",
      "explanation": "长尾巴平时帮助它在树枝上保持平衡，裹起来又像围巾和小毯子，一件装备打两份工。",
      "sourceLabel": "Smithsonian’s National Zoo · Meet Red Pandas Asa and Chris-Anne",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-009",
      "code": "ANI-009",
      "number": 9,
      "category": "animal",
      "title": "长颈鹿的颈椎数",
      "prompt": "长颈鹿的脖子很长，但颈椎通常有多少块？",
      "choices": [
        "7 块",
        "14 块",
        "28 块"
      ],
      "answerIndex": 0,
      "answer": "7 块",
      "explanation": "它和人类的颈椎数量相同，只是每一块都能长到约 25 厘米以上；不是多装了几块，而是每块都很争气。",
      "sourceLabel": "San Diego Zoo Wildlife Alliance · Giraffe",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-010",
      "code": "ANI-010",
      "number": 10,
      "category": "animal",
      "title": "骆驼峰里装什么",
      "prompt": "骆驼的驼峰主要储存什么？",
      "choices": [
        "水",
        "脂肪",
        "空气"
      ],
      "answerIndex": 1,
      "answer": "脂肪",
      "explanation": "食物不足时，骆驼可以利用驼峰中的脂肪获得能量，驼峰也会随储量变化而变小或歪倒。",
      "sourceLabel": "San Diego Zoo Wildlife Alliance · Camel",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-011",
      "code": "ANI-011",
      "number": 11,
      "category": "animal",
      "title": "耳朵也是散热器",
      "prompt": "耳廓狐那双格外大的耳朵，除了听声音还有什么作用？",
      "choices": [
        "储存饮水",
        "遮住眼睛",
        "帮助散去热量"
      ],
      "answerIndex": 2,
      "answer": "帮助散去热量",
      "explanation": "大耳朵能把身体的热量散出去，毛茸茸的脚掌则隔开滚烫的沙地；它的沙漠装备相当齐全。",
      "sourceLabel": "Smithsonian’s National Zoo · How Does a Fennec Fox Survive in the Desert?",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-012",
      "code": "ANI-012",
      "number": 12,
      "category": "animal",
      "title": "闻起来像电影院",
      "prompt": "熊狸身上常被形容有哪种熟悉的气味？",
      "choices": [
        "黄油爆米花",
        "薄荷糖",
        "橙子皮"
      ],
      "answerIndex": 0,
      "answer": "黄油爆米花",
      "explanation": "熊狸的气味中含有 2-乙酰基-1-吡咯啉，爆米花的香味里也有这种化合物，路过它身边容易突然想找电影票。",
      "sourceLabel": "Smithsonian’s National Zoo · Claws and Paws Pathway Opens",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-013",
      "code": "ANI-013",
      "number": 13,
      "category": "animal",
      "title": "北极熊的底色",
      "prompt": "在看起来白色的毛发下面，北极熊的皮肤更接近什么颜色？",
      "choices": [
        "浅粉色",
        "黑色",
        "雪白色"
      ],
      "answerIndex": 1,
      "answer": "黑色",
      "explanation": "北极熊外层毛发本身无色、近乎透明，光线散射后才显得白；白外套下面其实是深色底。",
      "sourceLabel": "U.S. National Park Service · Arctic Animal Discovery: Polar Bear",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-014",
      "code": "ANI-014",
      "number": 14,
      "category": "animal",
      "title": "海獭的天然口袋",
      "prompt": "海獭潜水时，会把暂时带不走的食物放在哪里？",
      "choices": [
        "脸颊里的囊袋",
        "尾巴卷成的兜里",
        "前肢下方的松弛皮肤里"
      ],
      "answerIndex": 2,
      "answer": "前肢下方的松弛皮肤里",
      "explanation": "两侧前肢下面都有像口袋一样的皮肤褶皱，海獭可以先把食物存进去，腾出爪子继续忙。",
      "sourceLabel": "Monterey Bay Aquarium · Sea otter",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-015",
      "code": "ANI-015",
      "number": 15,
      "category": "animal",
      "title": "象鼻尖的“手指”",
      "prompt": "非洲象和亚洲象的鼻尖分别有几个手指状突起？",
      "choices": [
        "非洲象两个，亚洲象一个",
        "两者都是一个",
        "非洲象一个，亚洲象两个"
      ],
      "answerIndex": 0,
      "answer": "非洲象两个，亚洲象一个",
      "explanation": "这些小突起能帮助象鼻精细地拿取东西，同样是灵活的鼻子，末端配置略有不同。",
      "sourceLabel": "Smithsonian’s National Zoo · How to Care for Asian Elephants",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-016",
      "code": "ANI-016",
      "number": 16,
      "category": "animal",
      "title": "九带犰狳的四胞胎",
      "prompt": "九带犰狳一胎通常会迎来怎样的一组幼崽？",
      "choices": [
        "两只长相不同的幼崽",
        "四只遗传上相同的幼崽",
        "八只随机组合的幼崽"
      ],
      "answerIndex": 1,
      "answer": "四只遗传上相同的幼崽",
      "explanation": "九带犰狳每胎通常是四只遗传上相同、性别也相同的幼崽，家庭合照很考验认人水平。",
      "sourceLabel": "San Diego Zoo Wildlife Alliance · Armadillo",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-017",
      "code": "ANI-017",
      "number": 17,
      "category": "animal",
      "title": "羊驼的日常语音",
      "prompt": "羊驼表达自己时，常会发出哪种声音？",
      "choices": [
        "像钟一样的清脆声",
        "拍打身体的鼓点",
        "轻柔的哼鸣声"
      ],
      "answerIndex": 2,
      "answer": "轻柔的哼鸣声",
      "explanation": "羊驼还会配合耳朵、尾巴、脖子和脑袋的姿势传递信息，交流时颇有声有色。",
      "sourceLabel": "Smithsonian’s National Zoo · Alpaca",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-018",
      "code": "ANI-018",
      "number": 18,
      "category": "animal",
      "title": "火烈鸟的进餐姿势",
      "prompt": "火烈鸟在浅水里滤食时，头通常是什么姿势？",
      "choices": [
        "倒过来伸进水里",
        "侧躺在水面上",
        "一直仰向天空"
      ],
      "answerIndex": 0,
      "answer": "倒过来伸进水里",
      "explanation": "它用舌头把水泵进泵出，再由喙缘梳子般的结构留下食物；吃饭姿势看着倒置，过滤系统运行正常。",
      "sourceLabel": "Smithsonian’s National Zoo · Why Are Flamingos Pink?",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-019",
      "code": "ANI-019",
      "number": 19,
      "category": "animal",
      "title": "猫头鹰如何转移视线",
      "prompt": "猫头鹰想看向侧面时，主要靠什么改变视线方向？",
      "choices": [
        "大幅转动眼球",
        "转动头部",
        "旋转耳朵"
      ],
      "answerIndex": 1,
      "answer": "转动头部",
      "explanation": "猫头鹰的眼睛固定在眼眶里，不能像人的眼球那样转动；灵活的颈部能让头转到约 270 度。",
      "sourceLabel": "U.S. National Park Service · Owls at Big Bend",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-020",
      "code": "ANI-020",
      "number": 20,
      "category": "animal",
      "title": "变色龙的双路视线",
      "prompt": "变色龙的两只眼睛可以怎样工作？",
      "choices": [
        "只能一起闭合",
        "轮流看清颜色",
        "分别转动并注视不同物体"
      ],
      "answerIndex": 2,
      "answer": "分别转动并注视不同物体",
      "explanation": "两只眼睛能各自转动和对焦，需要仔细观察同一目标时又会一起朝向它，像随身带着双路镜头。",
      "sourceLabel": "San Diego Zoo Wildlife Alliance · Chameleon",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-021",
      "code": "ANI-021",
      "number": 21,
      "category": "animal",
      "title": "一直保留“小时候配置”",
      "prompt": "成年美西螈仍会保留哪种幼体特征？",
      "choices": [
        "羽毛状的外鳃",
        "能飞行的薄翼",
        "可闭合的硬壳"
      ],
      "answerIndex": 0,
      "answer": "羽毛状的外鳃",
      "explanation": "美西螈成年后仍保留多种幼体特征，一生都生活在水中；可以说长大了，但没有按常见两栖动物的模板换装。",
      "sourceLabel": "American Museum of Natural History · Axolotl",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-022",
      "code": "ANI-022",
      "number": 22,
      "category": "animal",
      "title": "陆龟壳是不是外套",
      "prompt": "陆龟的壳和身体是什么关系？",
      "choices": [
        "是后来找到的坚硬住处",
        "是自身骨骼系统的一部分",
        "是变硬后不会脱落的毛"
      ],
      "answerIndex": 1,
      "answer": "是自身骨骼系统的一部分",
      "explanation": "陆龟的脊柱沿着背甲内侧延伸，壳不是可以脱下来的盔甲，更不是随身小房子。",
      "sourceLabel": "Smithsonian’s National Zoo · Meet Our Cool Creep of Aldabra Tortoises",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-023",
      "code": "ANI-023",
      "number": 23,
      "category": "animal",
      "title": "壁虎的眼睛清洁法",
      "prompt": "有些没有活动眼睑的壁虎，会怎样清洁眼睛表面的透明膜？",
      "choices": [
        "吹气",
        "用前脚擦",
        "用舌头舔"
      ],
      "answerIndex": 2,
      "answer": "用舌头舔",
      "explanation": "透明膜能替眼睛挡住灰尘和强光，舌头则负责日常保洁；没有眼皮，也有自己的擦镜布。",
      "sourceLabel": "San Diego Zoo Wildlife Alliance · Lizard",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-024",
      "code": "ANI-024",
      "number": 24,
      "category": "animal",
      "title": "海星的眼点在哪里",
      "prompt": "许多海星的眼点长在哪里？",
      "choices": [
        "每条腕的末端",
        "身体中央的背面",
        "管足之间随机分布"
      ],
      "answerIndex": 0,
      "answer": "每条腕的末端",
      "explanation": "不同海星的视觉能力不一样，有的只能分辨明暗，有的可能看出简单图像；五条腕的海星像在五个方向各放了一盏小探照灯。",
      "sourceLabel": "Smithsonian Ocean · Sea Stars, Urchins, Sand Dollars, and Relatives",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-025",
      "code": "ANI-025",
      "number": 25,
      "category": "animal",
      "title": "水母的神经系统",
      "prompt": "水母没有通常意义上的大脑，主要靠什么传递和处理感觉信息？",
      "choices": [
        "藏在伞缘的小脊髓",
        "分散的神经网",
        "每根触手各有一颗大脑"
      ],
      "answerIndex": 1,
      "answer": "分散的神经网",
      "explanation": "这套遍布身体的神经网络能感知触碰和水中环境变化，有些水母还具有感光和平衡结构。",
      "sourceLabel": "Smithsonian Ocean · Jellyfish and Comb Jellies",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-026",
      "code": "ANI-026",
      "number": 26,
      "category": "animal",
      "title": "鲎有多少只“眼睛”",
      "prompt": "大西洋鲎全身共有多少个眼睛或感光器官？",
      "choices": [
        "2 个",
        "5 个",
        "10 个"
      ],
      "answerIndex": 2,
      "answer": "10 个",
      "explanation": "它们分布在头甲、身体其他部位和尾部附近，既有复眼，也有较简单的感光结构；看着像戴了头盔，其实感光点开得不少。",
      "sourceLabel": "Aquarium of the Pacific · Atlantic Horseshoe Crab",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-027",
      "code": "ANI-027",
      "number": 27,
      "category": "animal",
      "title": "几维鸟的鼻孔",
      "prompt": "几维鸟的鼻孔长在什么位置？",
      "choices": [
        "长喙接近尖端的位置",
        "两侧翅膀下面",
        "脚趾之间"
      ],
      "answerIndex": 0,
      "answer": "长喙接近尖端的位置",
      "explanation": "它是唯一把鼻孔放在喙尖附近的鸟类，并用灵敏的嗅觉在地面寻找食物；这根长喙很像自带探头。",
      "sourceLabel": "San Diego Zoo Wildlife Alliance · Kiwi",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-028",
      "code": "ANI-028",
      "number": 28,
      "category": "animal",
      "title": "绵羊也认照片",
      "prompt": "剑桥大学的一项实验中，研究人员训练绵羊从屏幕照片里识别什么？",
      "choices": [
        "不同的几何图形",
        "四位名人的脸",
        "四种花的颜色"
      ],
      "answerIndex": 1,
      "answer": "四位名人的脸",
      "explanation": "实验中的 8 只绵羊学会识别 4 张名人面孔，换成倾斜角度的照片后仍能认出，并能从照片中辨认熟悉的饲养员。",
      "sourceLabel": "University of Cambridge Repository · Sheep recognise familiar and unfamiliar human faces from 2D images",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-029",
      "code": "ANI-029",
      "number": 29,
      "category": "animal",
      "title": "会滚小球的熊蜂",
      "prompt": "在没有食物奖励的实验中，熊蜂会主动反复做什么？",
      "choices": [
        "把积木叠高",
        "穿过水下圆环",
        "推动和滚动木制小球"
      ],
      "answerIndex": 2,
      "answer": "推动和滚动木制小球",
      "explanation": "研究人员排除了觅食、清理和交配等用途，将这种自发而重复的行为描述为类似玩耍；小球没有奖励，熊蜂还是愿意再滚一次。",
      "sourceLabel": "Queen Mary University of London · First-ever study shows bumble bees ‘play’",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-030",
      "code": "ANI-030",
      "number": 30,
      "category": "animal",
      "title": "海豚的专属口哨",
      "prompt": "宽吻海豚各自独特的“标志哨声”，主要能传递什么信息？",
      "choices": [
        "发声者的身份",
        "当天的水温",
        "所在水域的深度"
      ],
      "answerIndex": 0,
      "answer": "发声者的身份",
      "explanation": "宽吻海豚会在幼年学会各自独特的哨声轮廓，用它保持联系和让同伴识别自己，功能有点像声音名片。",
      "sourceLabel": "University of St Andrews Research Repository · The Sarasota Dolphin Whistle Database",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-031",
      "code": "ANI-031",
      "number": 31,
      "category": "animal",
      "title": "大象照镜子的标记实验",
      "prompt": "2006 年的镜子实验中，通过标记测试的那头亚洲象做了什么？",
      "choices": [
        "给镜中的影像让路",
        "对着镜子触碰自己头上的可见标记",
        "反复触碰镜面上的同一位置"
      ],
      "answerIndex": 1,
      "answer": "对着镜子触碰自己头上的可见标记",
      "explanation": "研究中的 3 头亚洲象有 1 头通过了标记测试：它借助镜子，用象鼻触碰原本看不到的头部标记。",
      "sourceLabel": "Plotnik, de Waal & Reiss (2006) · Self-recognition in an Asian elephant",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-032",
      "code": "ANI-032",
      "number": 32,
      "category": "animal",
      "title": "山羊更愿意接近哪张脸",
      "prompt": "同时看到陌生人的开心和生气表情照片时，实验中的山羊整体上更愿意先接近哪一张？",
      "choices": [
        "闭着眼睛的照片",
        "生气表情",
        "开心表情"
      ],
      "answerIndex": 2,
      "answer": "开心表情",
      "explanation": "研究中的山羊能区分两种人类表情，整体上更常先看、靠近并用鼻子探索开心的脸；看来友好表情不只对人有效。",
      "sourceLabel": "Queen Mary University of London · Goats prefer happy people",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "animal-033",
      "code": "ANI-033",
      "number": 33,
      "category": "animal",
      "title": "蜜蜂舞蹈里的导航信息",
      "prompt": "蜜蜂的摇摆舞能告诉同伴花源的哪两项信息？",
      "choices": [
        "方向和距离",
        "花瓣数量和颜色",
        "湿度和气温"
      ],
      "answerIndex": 0,
      "answer": "方向和距离",
      "explanation": "摇摆路线相对竖直方向的角度，对应花源相对太阳的方向；直线摇摆段持续越久，通常表示距离越远。",
      "sourceLabel": "NC State Extension · The Honey Bee Dance Language",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-001",
      "code": "ART-001",
      "number": 1,
      "category": "art",
      "title": "五米多长的画",
      "prompt": "故宫所藏《清明上河图》的画芯大约有多长？",
      "choices": [
        "52.8 厘米",
        "5.28 米",
        "52.8 米"
      ],
      "answerIndex": 1,
      "answer": "5.28 米",
      "explanation": "这幅画纵约 24.8 厘米、横约 528 厘米，展开时像沿着北宋汴京慢慢走了一段路。",
      "sourceLabel": "故宫博物院 · 张择端《清明上河图》卷",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-002",
      "code": "ART-002",
      "number": 2,
      "category": "art",
      "title": "灰色不是原装色",
      "prompt": "我们今天看到的兵马俑大多灰扑扑，它们刚制成时更接近什么样？",
      "choices": [
        "通体雪白",
        "只有黑色",
        "色彩鲜艳"
      ],
      "answerIndex": 2,
      "answer": "色彩鲜艳",
      "explanation": "秦俑表面原有生漆底层和颜料，已发现红、蓝、绿、紫等十多种颜色；多数彩绘后来剥落了。",
      "sourceLabel": "秦始皇帝陵博物院 · 唯一的绿脸兵马俑",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-003",
      "code": "ART-003",
      "number": 3,
      "category": "art",
      "title": "莫高窟的一千年",
      "prompt": "敦煌莫高窟的造像与壁画，大致跨越了多长的艺术历史？",
      "choices": [
        "一千年",
        "一百年",
        "五百年"
      ],
      "answerIndex": 0,
      "answer": "一千年",
      "explanation": "联合国教科文组织记录的 492 个洞窟与石窟寺，保存了跨越约一千年的佛教艺术。",
      "sourceLabel": "UNESCO World Heritage Centre · Mogao Caves",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-004",
      "code": "ART-004",
      "number": 4,
      "category": "art",
      "title": "名气很大的小浪",
      "prompt": "葛饰北斋《神奈川冲浪里》的原作大约有多大？",
      "choices": [
        "一张明信片",
        "26 × 38 厘米",
        "2.6 × 3.8 米"
      ],
      "answerIndex": 1,
      "answer": "26 × 38 厘米",
      "explanation": "它是一幅约 25.7 × 37.9 厘米的木版画。浪的名气很大，原作并不大。",
      "sourceLabel": "The Metropolitan Museum of Art · The Great Wave",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-005",
      "code": "ART-005",
      "number": 5,
      "category": "art",
      "title": "两笔画出的珍珠",
      "prompt": "《戴珍珠耳环的少女》里那颗发亮的“珍珠”，主要用了多少笔制造错觉？",
      "choices": [
        "大约二十笔",
        "大约两百笔",
        "大约两笔"
      ],
      "answerIndex": 2,
      "answer": "大约两笔",
      "explanation": "亮部和衣领反光组成了珍珠的错觉；它大得不像真珍珠，也可能是玻璃饰品，甚至只是画家的想象。",
      "sourceLabel": "Mauritshuis · Girl with a Pearl Earring",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-006",
      "code": "ART-006",
      "number": 6,
      "category": "art",
      "title": "会挪动的铁塔",
      "prompt": "晴天里，太阳晒着埃菲尔铁塔的一侧，塔尖会怎样？",
      "choices": [
        "缓慢画出一个小圆圈",
        "完全不动",
        "向地下沉一米"
      ],
      "answerIndex": 0,
      "answer": "缓慢画出一个小圆圈",
      "explanation": "受热的一侧会轻微膨胀，使塔尖在一天里移动出直径约 15 厘米的轨迹。铁塔只是很稳，不是完全不动。",
      "sourceLabel": "The Eiffel Tower · Why does the Eiffel Tower change size?",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-007",
      "code": "ART-007",
      "number": 7,
      "category": "art",
      "title": "檐角小队",
      "prompt": "故宫太和殿的每个檐角上，安放了多少个走兽？",
      "choices": [
        "10 个",
        "7 个",
        "9 个"
      ],
      "answerIndex": 0,
      "answer": "10 个",
      "explanation": "檐角小兽早期也用于遮饰固定屋脊的铁钉，后来成为建筑装饰与等级的标志；太和殿所用数量为现存古建筑中仅见。檐角上的队伍，编制相当完整。",
      "sourceLabel": "故宫博物院 · 太和殿",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-008",
      "code": "ART-008",
      "number": 8,
      "category": "art",
      "title": "十八岁的青绿山水",
      "prompt": "王希孟完成《千里江山图》时，大约多少岁？",
      "choices": [
        "38 岁",
        "18 岁",
        "58 岁"
      ],
      "answerIndex": 1,
      "answer": "18 岁",
      "explanation": "画卷后的蔡京题跋记下了希孟当时的年龄，故宫据此判断这幅作品约完成于 1113 年。画面气势很大，作者年纪很轻。",
      "sourceLabel": "故宫博物院 · 王希孟《千里江山图》卷",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-009",
      "code": "ART-009",
      "number": 9,
      "category": "art",
      "title": "白菜叶上的访客",
      "prompt": "翠玉白菜的叶子上还雕着哪两只昆虫？",
      "choices": [
        "蝴蝶和蜻蜓",
        "瓢虫和蜜蜂",
        "螽斯和蝗虫"
      ],
      "answerIndex": 2,
      "answer": "螽斯和蝗虫",
      "explanation": "工匠在翠绿菜叶上刻下两只小昆虫，让一块翠玉有了田园里的生气。一棵白菜，还自带两位访客。",
      "sourceLabel": "国立故宫博物院 · 翠玉白菜",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-010",
      "code": "ART-010",
      "number": 10,
      "category": "art",
      "title": "不能下锅的肉",
      "prompt": "看起来像一块红烧肉的“肉形石”，主要是什么材料？",
      "choices": [
        "碧石类矿物",
        "染色木料",
        "烧制陶土"
      ],
      "answerIndex": 0,
      "answer": "碧石类矿物",
      "explanation": "工匠顺着石头天然的层状纹理加工，又在表面钻出细孔并染色，才有了肉皮和肥瘦层次。看着很入味，实际咬不动。",
      "sourceLabel": "国立故宫博物院 · 清 肉形石",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-011",
      "code": "ART-011",
      "number": 11,
      "category": "art",
      "title": "一架六十五口钟",
      "prompt": "曾侯乙编钟全套共有多少件钟？",
      "choices": [
        "45 件",
        "65 件",
        "85 件"
      ],
      "answerIndex": 1,
      "answer": "65 件",
      "explanation": "它们分三层八组悬挂，而且每件钟都能敲出相隔三度的两个音。不是一排钟，是一整套青铜乐团。",
      "sourceLabel": "湖北省博物馆 · 曾侯乙编钟",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-012",
      "code": "ART-012",
      "number": 12,
      "category": "art",
      "title": "袖子兼职当烟道",
      "prompt": "长信宫灯点亮后，烟尘会沿着哪里进入灯体？",
      "choices": [
        "灯盘下面的小孔",
        "宫女身后的底座",
        "宫女的右臂袖管"
      ],
      "answerIndex": 2,
      "answer": "宫女的右臂袖管",
      "explanation": "灯中人像是中空的，袖管把烟尘导入体内，减少它在室内飘散。这只袖子不只负责造型，也顺便上班当烟道。",
      "sourceLabel": "河北省文化和旅游厅（来源：国家文物局）· 河北博物院探寻文明印迹",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-013",
      "code": "ART-013",
      "number": 13,
      "category": "art",
      "title": "四只羊站在哪里",
      "prompt": "四羊青铜方尊上的四只卷角羊怎样分布？",
      "choices": [
        "各据一角，与器身融为一体",
        "并排站在器盖顶端",
        "藏在器物内壁上"
      ],
      "answerIndex": 0,
      "answer": "各据一角，与器身融为一体",
      "explanation": "羊的肩部、腹部和足部被巧妙地纳入方尊造型，立体动物与器身没有各忙各的。",
      "sourceLabel": "中国国家博物馆 · 四羊青铜方尊",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-014",
      "code": "ART-014",
      "number": 14,
      "category": "art",
      "title": "鼎肚里的长文",
      "prompt": "上海博物馆藏大克鼎的内壁铸有多少字的铭文？",
      "choices": [
        "29 字",
        "290 字",
        "900 字"
      ],
      "answerIndex": 1,
      "answer": "290 字",
      "explanation": "铭文记录了作器者“克”及相关册命内容，也是一篇重要的西周金文。鼎的肚子里，装着一篇不短的文章。",
      "sourceLabel": "上海博物馆 · 大克鼎",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-015",
      "code": "ART-015",
      "number": 15,
      "category": "art",
      "title": "青铜冷藏装备",
      "prompt": "青铜冰鉴在春夏使用时，外层方鉴与内层尊缶之间会放什么？",
      "choices": [
        "细沙",
        "香草",
        "冰块"
      ],
      "answerIndex": 2,
      "answer": "冰块",
      "explanation": "酒放在内层尊缶中，冰块放进两层器壁之间的空间，用来给饮品降温。古人的冷饮装备，分量很足。",
      "sourceLabel": "中国国家博物馆 · 青铜冰鉴",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-016",
      "code": "ART-016",
      "number": 16,
      "category": "art",
      "title": "骆驼背上的乐队",
      "prompt": "三彩釉陶载乐骆驼的背上共有多少位表演者？",
      "choices": [
        "5 位",
        "7 位",
        "9 位"
      ],
      "answerIndex": 0,
      "answer": "5 位",
      "explanation": "中间一人在跳舞，另外四人围坐演奏乐器，骆驼则临时兼任移动舞台。",
      "sourceLabel": "中国国家博物馆 · 三彩釉陶载乐骆驼",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-017",
      "code": "ART-017",
      "number": 17,
      "category": "art",
      "title": "陶盆里的圆圈舞",
      "prompt": "舞蹈纹彩陶盆内壁的每组舞蹈图里，有几个人手拉着手？",
      "choices": [
        "3 人",
        "5 人",
        "8 人"
      ],
      "answerIndex": 1,
      "answer": "5 人",
      "explanation": "盆内共有三组舞蹈图，每组五人，三组人物绕着内壁形成一圈。陶盆安静地放着，里面的人一直在踩拍子。",
      "sourceLabel": "中国国家博物馆 · 舞蹈纹彩陶盆",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-018",
      "code": "ART-018",
      "number": 18,
      "category": "art",
      "title": "鸡缸杯的两次上色",
      "prompt": "明成化斗彩鸡缸杯的彩色图案是怎样完成的？",
      "choices": [
        "所有颜色都在烧成后直接涂上",
        "只用釉下青花一种颜色",
        "先用釉下青花勾绘，再施釉上彩"
      ],
      "answerIndex": 2,
      "answer": "先用釉下青花勾绘，再施釉上彩",
      "explanation": "杯上既有釉下青花，也有釉上的红、绿、黄等颜色；“斗彩”是两套色彩工艺一起配合。",
      "sourceLabel": "故宫博物院 · 成化款斗彩鸡缸杯",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-019",
      "code": "ART-019",
      "number": 19,
      "category": "art",
      "title": "长廊也是画廊",
      "prompt": "颐和园长廊的廊枋上，大约绘有多少幅苏式彩画？",
      "choices": [
        "14,000 余幅",
        "1,400 余幅",
        "140 余幅"
      ],
      "answerIndex": 0,
      "answer": "14,000 余幅",
      "explanation": "这条长廊全长 728 米、共有 273 间，彩画题材包括山水、花鸟与古典文学故事。慢慢走，是真的在逛一条画廊。",
      "sourceLabel": "北京市公园管理中心 · 长廊",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-020",
      "code": "ART-020",
      "number": 20,
      "category": "art",
      "title": "把天空铺上屋顶",
      "prompt": "北京天坛祈年殿的三重屋顶，琉璃瓦以什么颜色为主？",
      "choices": [
        "翠绿色",
        "蓝色",
        "金黄色"
      ],
      "answerIndex": 1,
      "answer": "蓝色",
      "explanation": "联合国教科文组织的遗产资料记载，祈年殿有三重蓝色琉璃瓦屋顶。屋顶像是把一小片晴天留了下来。",
      "sourceLabel": "UNESCO World Heritage Centre · Temple of Heaven",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-021",
      "code": "ART-021",
      "number": 21,
      "category": "art",
      "title": "《蒙娜丽莎》住在木板上",
      "prompt": "达·芬奇的《蒙娜丽莎》画在什么支撑材料上？",
      "choices": [
        "亚麻画布",
        "铜板",
        "白杨木板"
      ],
      "answerIndex": 2,
      "answer": "白杨木板",
      "explanation": "卢浮宫的藏品记录写明，这是一幅画在白杨木板上的油画。并不是所有油画都住在画布上。",
      "sourceLabel": "卢浮宫藏品数据库 · La Joconde ou Monna Lisa",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-022",
      "code": "ART-022",
      "number": 22,
      "category": "art",
      "title": "严肃合影的生活化选角",
      "prompt": "《美国哥特式》中的一男一女，现实中是谁为画家当模特？",
      "choices": [
        "画家的牙医和妹妹",
        "两位职业演员",
        "房屋原来的农场主夫妇"
      ],
      "answerIndex": 0,
      "answer": "画家的牙医和妹妹",
      "explanation": "格兰特·伍德请牙医 B. H. McKeeby 和妹妹 Nan Wood 分别扮作画里的农夫与女儿。表情很严肃，选角很生活。",
      "sourceLabel": "芝加哥艺术博物馆 · American Art 教育手册，第 59 页",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-023",
      "code": "ART-023",
      "number": 23,
      "category": "art",
      "title": "名叫挂毯，其实是刺绣",
      "prompt": "著名的“贝叶挂毯”实际主要采用了哪种制作方式？",
      "choices": [
        "把彩色丝线编织成毯",
        "在亚麻布上刺绣",
        "在湿灰泥上绘画"
      ],
      "answerIndex": 1,
      "answer": "在亚麻布上刺绣",
      "explanation": "贝叶博物馆把它描述为一条约 70 米长、由九段亚麻布拼成的刺绣作品。名字叫挂毯，手艺更接近刺绣。",
      "sourceLabel": "Bayeux Museum · Explore the Bayeux Tapestry online",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-024",
      "code": "ART-024",
      "number": 24,
      "category": "art",
      "title": "Big Ben 到底是谁",
      "prompt": "“Big Ben”这个名字原本专指什么？",
      "choices": [
        "四面钟盘",
        "整座伊丽莎白塔",
        "塔内敲响整点的大钟"
      ],
      "answerIndex": 2,
      "answer": "塔内敲响整点的大钟",
      "explanation": "英国议会把塔称为 Elizabeth Tower，把计时装置称为 Great Clock，而 Big Ben 是塔内的 Great Bell。大家平时常把整套建筑一起叫成它的名字。",
      "sourceLabel": "UK Parliament · Facts and figures: Big Ben and Elizabeth Tower",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-025",
      "code": "ART-025",
      "number": 25,
      "category": "art",
      "title": "自由女神原来的颜色",
      "prompt": "自由女神像在 1886 年刚完成时，更接近什么颜色？",
      "choices": [
        "铜币般的棕色",
        "与今天一样的绿色",
        "大理石般的白色"
      ],
      "answerIndex": 0,
      "answer": "铜币般的棕色",
      "explanation": "它的外层由铜制成，后来经过约三十年的自然氧化，才逐渐形成今天的绿色铜锈层。绿色不是出厂配色。",
      "sourceLabel": "U.S. National Park Service · Statue of Liberty FAQ",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-026",
      "code": "ART-026",
      "number": 26,
      "category": "art",
      "title": "歌剧院屋顶的百万块小方格",
      "prompt": "悉尼歌剧院的屋顶一共铺了大约多少块瓷砖？",
      "choices": [
        "约 10 万块",
        "约 105 万块",
        "约 1,000 万块"
      ],
      "answerIndex": 1,
      "answer": "约 105 万块",
      "explanation": "悉尼歌剧院记录的准确数量是 1,056,006 块，它们组成了远看简洁、近看细密的屋顶表面。",
      "sourceLabel": "Sydney Opera House · The spherical solution",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-027",
      "code": "ART-027",
      "number": 27,
      "category": "art",
      "title": "会随光线变脸的外墙",
      "prompt": "毕尔巴鄂古根海姆博物馆外层约 33,000 片薄板主要是什么材料？",
      "choices": [
        "不锈钢",
        "彩色玻璃",
        "钛"
      ],
      "answerIndex": 2,
      "answer": "钛",
      "explanation": "这些很薄的钛板会随天气和光线显出不同色调，让建筑外表看起来不那么安分守色。",
      "sourceLabel": "Guggenheim Museum Bilbao · The construction of the Building",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-028",
      "code": "ART-028",
      "number": 28,
      "category": "art",
      "title": "两个椭圆房间里的《睡莲》",
      "prompt": "莫奈的大型《睡莲》在巴黎橘园美术馆中怎样陈列？",
      "choices": [
        "8 幅巨型画面环绕两个椭圆展厅",
        "1 幅方形小画独挂一面墙",
        "一组雕塑散放在庭院里"
      ],
      "answerIndex": 0,
      "answer": "8 幅巨型画面环绕两个椭圆展厅",
      "explanation": "这些画面高约 2 米，总长约 91 米；两个展厅从平面上看还组成了无穷符号。",
      "sourceLabel": "Musée de l’Orangerie · From the orangerie to the museum",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-029",
      "code": "ART-029",
      "number": 29,
      "category": "art",
      "title": "《吻》里的金色不全是颜料",
      "prompt": "克里姆特的《吻》中，金色装饰实际使用了什么？",
      "choices": [
        "只有黄色油画颜料",
        "金箔，并搭配银和铂等材料",
        "整块打磨过的黄铜板"
      ],
      "answerIndex": 1,
      "answer": "金箔，并搭配银和铂等材料",
      "explanation": "画中人物衣饰用了金箔，背景还含有细小的金、银和铂质效果；它会发光，不全靠黄色颜料努力。",
      "sourceLabel": "Belvedere Museum Vienna · The Belvedere and Viennese Modernism",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-030",
      "code": "ART-030",
      "number": 30,
      "category": "art",
      "title": "比照片里高得多的《大卫》",
      "prompt": "米开朗琪罗的《大卫》雕像大约有多高？",
      "choices": [
        "1.7 米",
        "3.1 米",
        "5.17 米"
      ],
      "answerIndex": 2,
      "answer": "5.17 米",
      "explanation": "佛罗伦萨学院美术馆登记的作品高度为 517 厘米，常见图片确实很容易把它看小。",
      "sourceLabel": "Galleria dell’Accademia di Firenze · David",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-031",
      "code": "ART-031",
      "number": 31,
      "category": "art",
      "title": "一份内容，三种文字",
      "prompt": "罗塞塔石碑上的同一份法令用了哪三种文字系统书写？",
      "choices": [
        "象形文字、世俗体文字和古希腊文",
        "拉丁文、阿拉伯文和古希腊文",
        "楔形文字、腓尼基文和拉丁文"
      ],
      "answerIndex": 0,
      "answer": "象形文字、世俗体文字和古希腊文",
      "explanation": "同一内容重复出现三次，让仍能读懂古希腊文的学者获得了解读埃及文字的重要线索。",
      "sourceLabel": "British Museum · The Rosetta Stone",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-032",
      "code": "ART-032",
      "number": 32,
      "category": "art",
      "title": "用剪刀做出的《蜗牛》",
      "prompt": "马蒂斯的《蜗牛》主要由什么材料和方法完成？",
      "choices": [
        "彩色马赛克拼贴",
        "水粉上色的纸张剪贴",
        "不同颜色的针织布缝合"
      ],
      "answerIndex": 1,
      "answer": "水粉上色的纸张剪贴",
      "explanation": "马蒂斯把上过色的纸剪开再拼贴，粗略的彩色纸块沿着蜗牛壳的感觉旋转排列。剪刀在这里也算画笔。",
      "sourceLabel": "Tate · The Snail",
      "verifiedOn": "2026-09-03"
    },
    {
      "id": "art-033",
      "code": "ART-033",
      "number": 33,
      "category": "art",
      "title": "画面里放一点 Boogie-Woogie",
      "prompt": "蒙德里安的《百老汇爵士乐》直接受到哪类音乐启发？",
      "choices": [
        "歌剧",
        "圆舞曲",
        "Boogie-Woogie 音乐"
      ],
      "answerIndex": 2,
      "answer": "Boogie-Woogie 音乐",
      "explanation": "蒙德里安很喜欢这种节奏鲜明的钢琴音乐，并把原本连续的色条拆成跳动的彩色小段。画面没有声音，节拍倒很清楚。",
      "sourceLabel": "Museum of Modern Art · Broadway Boogie Woogie",
      "verifiedOn": "2026-09-03"
    }
  ];
}));
