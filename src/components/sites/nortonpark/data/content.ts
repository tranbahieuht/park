// Generated from the Norton Park source (index.html, js/page.js). Edit freely.
import type { Lang } from "./i18n";

export type L10n = Record<Lang, string>;
export type Collection = "std" | "ltd";
export interface LifeItem { id: string; name: L10n; tag: L10n; desc: L10n; img: string; shot: L10n }
export interface PlanLevel { img: string; w: number; h: number }
export interface Residence {
  id: string; col: Collection; code: string; img: string; tab: L10n; name: L10n; rooms: L10n;
  gfa: string; nua: string; garden?: string; total?: boolean; floors?: L10n; levels?: PlanLevel[]; view?: L10n; desc: L10n;
}
export type NewsCategory = "progress" | "infra" | "legal" | "market" | "event";
export interface NewsItem {
  id: string; cat: NewsCategory; date: string; pub?: string; source: string; img: string; imgAlt: string;
  title: L10n; excerpt: L10n; url: string;
}
export interface TeamMember { role: L10n; logo: string; name: string }

export const LIFE: LifeItem[] = [
  {
    "id": "wellness",
    "name": {
      "vi": "Wellness",
      "en": "Wellness"
    },
    "tag": {
      "vi": "Đánh thức nguồn năng lượng mỗi ngày",
      "en": "Awaken your energy every day"
    },
    "desc": {
      "vi": "Hồ bơi trung tâm rộng mở giữa những tầng cây xanh mướt. Những nhịp bơi dài buổi sớm để cơ thể dần thức giấc, một ngày bắt đầu đẹp như thế.",
      "en": "A central pool opens up among layers of lush green. Long morning laps let the body gently wake, and the day begins just as beautifully."
    },
    "img": "assets/images/cgi/life-wellness.jpg",
    "shot": {
      "vi": "Hồ bơi trung tâm bên khối tiện ích kính",
      "en": "The central pool beside the glass amenity pavilion"
    }
  },
  {
    "id": "green",
    "name": {
      "vi": "Xanh và tĩnh",
      "en": "Green and Calm"
    },
    "tag": {
      "vi": "Từ những khoảnh khắc thân thương",
      "en": "From the moments we hold dear"
    },
    "desc": {
      "vi": "Lối dạo rợp bóng cây, thảm cỏ mềm và những khoảng xanh tĩnh tại, nơi cả nhà cùng chậm lại giữa nhịp sống thường ngày.",
      "en": "Tree-shaded walks, soft lawns and quiet green spaces where the whole family can slow down amid everyday life."
    },
    "img": "assets/images/cgi/life-green.jpg",
    "shot": {
      "vi": "Thảm cỏ và lối dạo nội khu",
      "en": "The lawn and internal walkways"
    }
  },
  {
    "id": "work",
    "name": {
      "vi": "Làm việc và tập trung",
      "en": "Work and Focus"
    },
    "tag": {
      "vi": "Khơi mở không gian, đánh thức tiềm năng",
      "en": "Open up space, awaken potential"
    },
    "desc": {
      "vi": "Góc làm việc cá nhân ngập ánh sáng hướng cảnh quan, không gian nhóm và phòng họp riêng tư, sẵn sàng cho mọi cuộc họp trực tuyến hay phiên làm việc nhóm.",
      "en": "Light-filled solo desks facing the landscape, team spaces and private meeting rooms, ready for any online meeting or team session."
    },
    "img": "assets/images/cgi/life-work-r8.jpg",
    "shot": {
      "vi": "Không gian Work Hub",
      "en": "The Work Hub"
    }
  },
  {
    "id": "community",
    "name": {
      "vi": "Cộng đồng",
      "en": "Community"
    },
    "tag": {
      "vi": "Từ những kết nối tự nhiên, dệt nên bản sắc cộng đồng",
      "en": "Natural connections that weave a community"
    },
    "desc": {
      "vi": "Quảng trường, BBQ giữa rừng và những cuộc hẹn cuối tuần, nơi cư dân đa thế hệ, đa quốc gia gặp gỡ và gắn bó.",
      "en": "A plaza, barbecues in the forest and weekend gatherings where residents of every generation and nationality meet and belong."
    },
    "img": "assets/images/cgi/life-community.jpg",
    "shot": {
      "vi": "Góc BBQ giữa vườn cây nội khu",
      "en": "A barbecue corner in the internal garden"
    }
  },
  {
    "id": "retail",
    "name": {
      "vi": "Mua sắm và cà phê",
      "en": "Retail and Café"
    },
    "tag": {
      "vi": "Nhịp sống toàn cầu lan toả phố xá",
      "en": "A global rhythm spilling onto the street"
    },
    "desc": {
      "vi": "Ly cà phê thơm lừng nơi góc phố, dãy Podium Shop nối tiếp khối cửa hàng độc lập, mọi trải nghiệm nối tiếp trong một dòng chảy sống động.",
      "en": "Fragrant coffee on the corner, Podium Shops flowing into standalone stores, every experience carrying on in one lively stream."
    },
    "img": "assets/images/cgi/life-retail.jpg",
    "shot": {
      "vi": "Phố thương mại và cà phê tại khối đế",
      "en": "The podium retail street and café"
    }
  }
];

export const COL: Record<Collection, L10n> = {
  "std": {
    "vi": "Bộ sưu tập chuẩn sống toàn cầu",
    "en": "Global Living Collection"
  },
  "ltd": {
    "vi": "Bộ sưu tập chuẩn sống đặc tuyển",
    "en": "Signature Living Collection"
  }
};

export const RESI: Residence[] = [
  {
    "id": "studio",
    "col": "std",
    "code": "ST1.1a",
    "img": "assets/images/plans/studio-st1-1a.jpg",
    "tab": {
      "vi": "Studio",
      "en": "Studio"
    },
    "name": {
      "vi": "Studio",
      "en": "Studio"
    },
    "rooms": {
      "vi": "1 phòng ngủ, 1 phòng vệ sinh",
      "en": "1 bedroom, 1 bathroom"
    },
    "gfa": "42,12",
    "nua": "38,13",
    "view": {
      "vi": "Công viên nội khu, Khu dân cư Home Canary",
      "en": "Internal park, Home Canary residential area"
    },
    "desc": {
      "vi": "Hệ kính kịch trần mang vẻ đẹp khoáng đạt của kiến trúc tầng không, vẫn vun đắp cảm giác thân thuộc nhờ bảng màu trung tính và vật liệu gần gũi.",
      "en": "Floor-to-ceiling glazing brings the airy beauty of high-rise architecture, while a neutral palette and familiar materials keep it feeling like home."
    }
  },
  {
    "id": "1br",
    "col": "std",
    "code": "A1.1a",
    "img": "assets/images/plans/1pn-a1-1a.jpg",
    "tab": {
      "vi": "1PN+",
      "en": "1BR+"
    },
    "name": {
      "vi": "1 phòng ngủ+",
      "en": "1 Bedroom+"
    },
    "rooms": {
      "vi": "1 phòng ngủ, 1 phòng vệ sinh",
      "en": "1 bedroom, 1 bathroom"
    },
    "gfa": "50,65",
    "nua": "46,57",
    "view": {
      "vi": "Công viên nội khu, Đường D4",
      "en": "Internal park, Road D4"
    },
    "desc": {
      "vi": "Hệ kính kịch trần mang vẻ đẹp khoáng đạt của kiến trúc tầng không, vẫn vun đắp cảm giác thân thuộc nhờ bảng màu trung tính và vật liệu gần gũi.",
      "en": "Floor-to-ceiling glazing brings the airy beauty of high-rise architecture, while a neutral palette and familiar materials keep it feeling like home."
    }
  },
  {
    "id": "2br",
    "col": "std",
    "code": "B1.4a",
    "img": "assets/images/plans/2pn-b1-4a.jpg",
    "tab": {
      "vi": "2PN",
      "en": "2BR"
    },
    "name": {
      "vi": "2 phòng ngủ",
      "en": "2 Bedroom"
    },
    "rooms": {
      "vi": "2 phòng ngủ, 2 phòng vệ sinh",
      "en": "2 bedrooms, 2 bathrooms"
    },
    "gfa": "79,24",
    "nua": "72,07",
    "view": {
      "vi": "Công viên nội khu",
      "en": "Internal park"
    },
    "desc": {
      "vi": "Ban công nối dài không gian sống thành một “phòng khách ngoài trời” riêng tư; qua những ô cửa rộng, tầm nhìn thành phố cũng trở thành một phần của ngôi nhà.",
      "en": "The balcony extends the living space into a private “outdoor lounge”; through wide windows, the city view becomes part of the home."
    }
  },
  {
    "id": "2brp",
    "col": "std",
    "code": "B2.2a",
    "img": "assets/images/plans/2pn-plus-b2-2a.jpg",
    "tab": {
      "vi": "2PN+",
      "en": "2BR+"
    },
    "name": {
      "vi": "2 phòng ngủ+",
      "en": "2 Bedroom+"
    },
    "rooms": {
      "vi": "2 phòng ngủ, 2 phòng vệ sinh",
      "en": "2 bedrooms, 2 bathrooms"
    },
    "gfa": "87,20",
    "nua": "80,00",
    "view": {
      "vi": "Phố thương mại",
      "en": "Retail street"
    },
    "desc": {
      "vi": "Ban công nối dài không gian sống thành một “phòng khách ngoài trời” riêng tư; qua những ô cửa rộng, tầm nhìn thành phố cũng trở thành một phần của ngôi nhà.",
      "en": "The balcony extends the living space into a private “outdoor lounge”; through wide windows, the city view becomes part of the home."
    }
  },
  {
    "id": "3br",
    "col": "std",
    "code": "C4.1a",
    "img": "assets/images/plans/3pn-c4-1a.jpg",
    "tab": {
      "vi": "3PN",
      "en": "3BR"
    },
    "name": {
      "vi": "3 phòng ngủ",
      "en": "3 Bedroom"
    },
    "rooms": {
      "vi": "3 phòng ngủ, 2 phòng vệ sinh",
      "en": "3 bedrooms, 2 bathrooms"
    },
    "gfa": "113,65",
    "nua": "106,54",
    "view": {
      "vi": "Đường D3",
      "en": "Road D3"
    },
    "desc": {
      "vi": "Hơn 95% căn hộ sở hữu “đặc quyền căn góc” với ít nhất hai mặt thoáng, tối ưu khả năng đón ánh sáng, lưu thông gió và khí tươi.",
      "en": "Over 95% of residences enjoy the “corner privilege” of at least two open sides, optimising daylight, airflow and fresh air."
    }
  },
  {
    "id": "pes",
    "col": "ltd",
    "code": "C3.1c.PES",
    "img": "assets/images/plans/pes-c3-1c.jpg",
    "tab": {
      "vi": "Căn hộ sân vườn",
      "en": "Garden residence"
    },
    "name": {
      "vi": "Căn hộ sân vườn",
      "en": "Garden Residence"
    },
    "rooms": {
      "vi": "3 phòng ngủ, 2 phòng vệ sinh",
      "en": "3 bedrooms, 2 bathrooms"
    },
    "gfa": "95,44",
    "nua": "88,55",
    "garden": "64,00",
    "desc": {
      "vi": "Kề bên phòng khách và phòng ngủ, khoảng sân vườn hiện diện như một “phòng khách giữa thiên nhiên” cho những phút giây sum vầy, và một “lời chào xanh” đợi sẵn bên khung cửa mỗi sớm mai.",
      "en": "Beside the living room and bedrooms, the garden becomes a “living room in nature” for time together, and a “green greeting” waiting at the window each morning."
    }
  },
  {
    "id": "duplex",
    "col": "ltd",
    "code": "D2.1c",
    "img": "assets/images/plans/duplex-d2-1c.jpg",
    "tab": {
      "vi": "Duplex",
      "en": "Duplex"
    },
    "name": {
      "vi": "Duplex",
      "en": "Duplex"
    },
    "rooms": {
      "vi": "3 phòng ngủ, 3 phòng vệ sinh",
      "en": "3 bedrooms, 3 bathrooms"
    },
    "gfa": "156,07",
    "nua": "143,01",
    "total": true,
    "floors": {
      "vi": "Tầng 1: 95,04 m² · Tầng 2: 61,03 m²",
      "en": "Level 1: 95.04 m² · Level 2: 61.03 m²"
    },
    "levels": [
      {
        "img": "assets/images/plans/duplex-d2-1c-t1-r8.webp",
        "w": 1407,
        "h": 1000
      },
      {
        "img": "assets/images/plans/duplex-d2-1c-t2.webp",
        "w": 1044,
        "h": 970
      }
    ],
    "desc": {
      "vi": "Với số lượng căn hộ giới hạn, Duplex cuốn hút bởi cấu trúc hai tầng sống đầy khác biệt. Cầu thang nội bộ tạo nên chiều sâu và sự bề thế hiếm gặp ở một căn hộ thông thường. Càng lên cao, tầm nhìn hướng công viên nội khu càng rộng mở, để độ khoáng đạt của không gian hòa cùng vị thế trên cao, làm nên niềm kiêu hãnh dành riêng cho số ít gia chủ.",
      "en": "With a limited number of residences, the Duplex captivates with a distinctive two-level layout. The internal staircase brings a depth and grandeur rarely found in a typical apartment. The higher you go, the wider the view over the internal park, pairing open space with an elevated position: a pride reserved for a select few homeowners."
    }
  },
  {
    "id": "gduplex",
    "col": "ltd",
    "code": "D1.1c",
    "img": "assets/images/plans/duplex-san-vuon-d1-1c.jpg",
    "tab": {
      "vi": "Duplex sân vườn",
      "en": "Garden duplex"
    },
    "name": {
      "vi": "Duplex sân vườn",
      "en": "Garden Duplex"
    },
    "rooms": {
      "vi": "3 phòng ngủ, 3 phòng vệ sinh",
      "en": "3 bedrooms, 3 bathrooms"
    },
    "gfa": "139,86",
    "nua": "128,96",
    "garden": "60,20",
    "total": true,
    "floors": {
      "vi": "Tầng 1: 76,14 m² · Tầng 2: 63,72 m²",
      "en": "Level 1: 76.14 m² · Level 2: 63.72 m²"
    },
    "levels": [
      {
        "img": "assets/images/plans/duplex-san-vuon-d1-1c-t1.webp",
        "w": 1202,
        "h": 1000
      },
      {
        "img": "assets/images/plans/duplex-san-vuon-d1-1c-t2.webp",
        "w": 1196,
        "h": 1017
      }
    ],
    "desc": {
      "vi": "Trong hình dung về một chốn an cư đáng mơ ước, luôn có một khoảng vườn ngập nắng và các tầng sống đủ rộng để cả gia đình vừa gần gũi, vừa có khoảng trời riêng. Duplex sân vườn đưa hình dung ấy vào một thiết kế phân tầng tinh tế, đủ đầy khoảng chung, trọn vẹn khoảng riêng, kề cận hệ tiện ích nội khu chỉ vài bước chân.",
      "en": "Every vision of a dream home holds a sunlit garden and levels generous enough for the family to be close yet keep their own space. The Garden Duplex brings that vision into a refined split-level design, with ample shared space and fully private retreats, just steps from the internal amenities."
    }
  },
  {
    "id": "shophouse",
    "col": "ltd",
    "code": "SH04",
    "img": "assets/images/plans/shophouse-sh04-t1.webp",
    "tab": {
      "vi": "Podium Shop",
      "en": "Podium Shop"
    },
    "name": {
      "vi": "Podium Shop",
      "en": "Podium Shop"
    },
    "rooms": {
      "vi": "2 tầng, mặt tiền thương mại",
      "en": "2 levels, retail frontage"
    },
    "gfa": "189,01",
    "nua": "174,99",
    "garden": "68,10",
    "total": true,
    "levels": [
      {
        "img": "assets/images/plans/shophouse-sh04-t1.webp",
        "w": 1808,
        "h": 1447
      },
      {
        "img": "assets/images/plans/shophouse-sh04-t2.webp",
        "w": 1570,
        "h": 1041
      }
    ],
    "view": {
      "vi": "Công viên nội khu, Đường D3",
      "en": "Internal park, Road D3"
    },
    "desc": {
      "vi": "Toạ lạc tại khối đế các toà tháp, Podium Shop sở hữu mặt tiền thương mại và cấu trúc hai tầng thông nhau: tầng 1 đón khách trực tiếp từ phố, tầng 2 linh hoạt làm văn phòng, kho hay không gian trải nghiệm. Ngay dưới chân cộng đồng cư dân và kế cận VSIP 1, mỗi căn là khởi đầu vững vàng cho việc kinh doanh lâu dài.",
      "en": "Set in the podium of the towers, the Podium Shop offers a retail frontage and a connected two-level layout: level 1 welcomes customers straight from the street, while level 2 adapts as an office, storage or experience space. Right below a residential community and next to VSIP 1, each unit is a steady start for a lasting business."
    }
  }
];

/** Already sorted: progress first, then newest publish date first (as page.js does). */
export const NEWS: NewsItem[] = [
  {
    "id": "cafef-nguon-cung-nang-hang",
    "cat": "market",
    "date": "",
    "pub": "2026-10-14",
    "source": "CafeF",
    "img": "assets/images/news/cafef-nguon-cung-nang-hang.webp",
    "imgAlt": "Toàn cảnh trục Đại lộ Bình Dương và khu dân cư phía Bắc TP.HCM nhìn từ trên cao, phía xa là các tòa nhà cao tầng trung tâm",
    "title": {
      "vi": "Nguồn cung nâng hạng, giá căn hộ phía Bắc TP.HCM thiết lập mặt bằng mới",
      "en": "Upgraded supply, apartment prices in northern Ho Chi Minh City set a new baseline"
    },
    "excerpt": {
      "vi": "Năm 2026 chứng kiến sự tăng tốc rõ nét của thị trường căn hộ phía Bắc TP.HCM, với giá bán thiết lập mặt bằng mới và nhiều chủ đầu tư lớn cùng gia nhập “đường đua”.",
      "en": "2026 has seen a clear acceleration in the northern Ho Chi Minh City apartment market, with selling prices setting a new baseline as major developers join the race."
    },
    "url": "https://cafef.vn/nguon-cung-nang-hang-gia-can-ho-phia-bac-tphcm-thiet-lap-mat-bang-moi-188261013104820842.chn"
  },
  {
    "id": "vietnamnet-chuan-song-quoc-te",
    "cat": "market",
    "date": "",
    "pub": "2026-10-12",
    "source": "VietNamNet",
    "img": "assets/images/news/vietnamnet-chuan-song-quoc-te.webp",
    "imgAlt": "Phối cảnh hồ bơi, lối đi cảnh quan và quán cà phê kính cong trong khu nội khu Norton Park",
    "title": {
      "vi": "Gamuda Land đưa chuẩn sống quốc tế đến phía Bắc TP.HCM",
      "en": "Gamuda Land brings international living standards to northern Ho Chi Minh City"
    },
    "excerpt": {
      "vi": "Norton Park đánh dấu bước tiến mới của Gamuda Land tại phía Bắc TP.HCM, dự án quy mô 7,9 ha với sáu tòa tháp và mật độ xây dựng khoảng 20%.",
      "en": "Norton Park marks a new step for Gamuda Land in northern Ho Chi Minh City, a 7.9 ha project with six towers and a building density of about 20%."
    },
    "url": "https://vietnamnet.vn/gamuda-land-dua-chuan-song-quoc-te-den-phia-bac-tp-hcm-2563454.html"
  },
  {
    "id": "vneconomy-the-sync-show",
    "cat": "event",
    "date": "",
    "pub": "2026-10-10",
    "source": "VnEconomy",
    "img": "assets/images/news/vneconomy-the-sync-show.webp",
    "imgAlt": "Sân khấu lễ ra quân Norton Park tại The Sync Show, hàng nghìn khán giả vẫy cờ dưới ánh đèn",
    "title": {
      "vi": "Norton Park ra mắt ấn tượng tại The Sync Show, thu hút 2.000 chuyên viên kinh doanh",
      "en": "Norton Park makes a striking debut at The Sync Show, drawing 2,000 sales professionals"
    },
    "excerpt": {
      "vi": "Hai nghìn chuyên viên kinh doanh tề tựu tại The Sync Show, nơi Gamuda Land lần đầu giới thiệu Norton Park, dự án quy mô 7,9 ha với sáu tòa tháp.",
      "en": "Two thousand sales professionals gathered at The Sync Show, where Gamuda Land introduced Norton Park for the first time."
    },
    "url": "https://en.vneconomy.vn/norton-park-makes-a-striking-debut-at-the-sync-show-drawing-2000-sales-professionals.htm"
  },
  {
    "id": "vnexpress-le-ra-quan",
    "cat": "event",
    "date": "",
    "pub": "2026-10-09",
    "source": "VnExpress",
    "img": "assets/images/news/vnexpress-le-ra-quan.webp",
    "imgAlt": "Hai cụm tháp Norton Park nhìn từ trục đường nội khu lúc hoàng hôn",
    "title": {
      "vi": "Hơn 2.000 người tham gia lễ ra quân dự án Norton Park",
      "en": "More than 2,000 people attend the Norton Park launch ceremony"
    },
    "excerpt": {
      "vi": "Gamuda Land giới thiệu Norton Park, dự án quy mô 7,9 ha với 1.286 sản phẩm tại phía Bắc TP.HCM, trong sự kiện The Sync Show dành cho hơn 2.000 chuyên viên kinh doanh.",
      "en": "Gamuda Land introduces Norton Park, a 7.9 ha project with 1,286 units in northern Ho Chi Minh City, at The Sync Show for more than 2,000 sales specialists."
    },
    "url": "https://vnexpress.net/hon-2-000-nguoi-tham-gia-le-ra-quan-du-an-norton-park-5130441.html"
  },
  {
    "id": "vietnamnet-bac-tphcm-nang-chuan",
    "cat": "market",
    "date": "",
    "pub": "2026-10-06",
    "source": "VietNamNet",
    "img": "assets/images/news/cafeland-bac-tphcm-r8.jpg",
    "imgAlt": "Toàn cảnh khu công nghiệp và khu dân cư phía Bắc TP.HCM nhìn từ trên cao",
    "title": {
      "vi": "Bất động sản phía bắc TP.HCM bước vào ‘cuộc đua’ nâng chuẩn không gian sống",
      "en": "Northern Ho Chi Minh City real estate enters a ‘race’ to raise living standards"
    },
    "excerpt": {
      "vi": "Khi chuyển dịch từ “công xưởng sản xuất” sang cực tăng trưởng công nghệ cao và đổi mới sáng tạo, phía Bắc TP.HCM đang nâng chuẩn nhà ở theo hướng không gian sống tích hợp.",
      "en": "As northern Ho Chi Minh City shifts from a “production hub” to a high-tech and innovation growth pole, its housing standards are rising toward integrated living spaces."
    },
    "url": "https://vietnamnet.vn/bat-dong-san-phia-bac-tp-hcm-buoc-vao-cuoc-dua-nang-chuan-khong-gian-song-2561812.html"
  },
  {
    "id": "cafeland-bac-tphcm",
    "cat": "market",
    "date": "",
    "source": "Cafeland",
    "img": "assets/images/news/cafeland-bac-tphcm-r8.jpg",
    "imgAlt": "Toàn cảnh khu công nghiệp và khu dân cư phía Bắc TP.HCM nhìn từ trên cao",
    "title": {
      "vi": "Từ “thủ phủ công nghiệp” đến cực tăng trưởng mới: thị trường bất động sản phía Bắc TP.HCM bước vào cuộc đua nâng chuẩn",
      "en": "From “industrial hub” to new growth pole: the northern Ho Chi Minh City property market enters a race to raise standards"
    },
    "excerpt": {
      "vi": "Góc nhìn về sự chuyển mình của khu vực phía Bắc TP.HCM, nơi nền tảng công nghiệp đang mở ra nhu cầu về một chuẩn sống mới.",
      "en": "A look at how the north of Ho Chi Minh City is evolving, as its industrial foundation opens up demand for a new standard of living."
    },
    "url": "https://cafeland.vn/tin-tuc/tu-thu-phu-cong-nghiep-den-cuc-tang-truong-moi-thi-truong-bat-dong-san-phia-bac-tphcm-buoc-vao-cuoc-dua-nang-chuan-155552.html"
  }
];

export const CAT: Record<NewsCategory, L10n> = {
  "progress": {
    "vi": "Tiến độ",
    "en": "Progress"
  },
  "infra": {
    "vi": "Hạ tầng",
    "en": "Infrastructure"
  },
  "legal": {
    "vi": "Pháp lý",
    "en": "Legal"
  },
  "market": {
    "vi": "Thị trường",
    "en": "Market"
  },
  "event": {
    "vi": "Sự kiện",
    "en": "Event"
  }
};

export const TEAM: TeamMember[] = [
  {
    "role": {
      "vi": "Tư vấn thiết kế kiến trúc",
      "en": "Architecture consultant"
    },
    "logo": "assets/logos/team/architecture-dpa.png",
    "name": "DP Architects"
  },
  {
    "role": {
      "vi": "Tư vấn thiết kế nội thất",
      "en": "Interior design consultant"
    },
    "logo": "assets/logos/team/interior-dwp.png",
    "name": "dwp"
  },
  {
    "role": {
      "vi": "Tư vấn thiết kế cảnh quan",
      "en": "Landscape consultant"
    },
    "logo": "assets/logos/team/landscape-beltcollins.png",
    "name": "Belt Collins"
  },
  {
    "role": {
      "vi": "Tư vấn kết cấu",
      "en": "Structural consultant"
    },
    "logo": "assets/logos/team/structural.png",
    "name": ""
  },
  {
    "role": {
      "vi": "Nhà thầu phần ngầm",
      "en": "Substructure contractor"
    },
    "logo": "assets/logos/team/substructure-cbm.png",
    "name": "CBM"
  }
];

export const RESI_L = {
  "vi": {
    "rooms": "Phòng",
    "gfa": "Diện tích sàn",
    "nua": "Diện tích sử dụng",
    "gfaT": "Tổng diện tích sàn",
    "nuaT": "Tổng diện tích sử dụng",
    "view": "Cảnh quan",
    "floors": "Từng tầng",
    "code": "Căn tiêu biểu",
    "garden": "Diện tích sân vườn",
    "gNote": "Diện tích sân vườn không bao gồm trong giấy chứng nhận quyền sở hữu."
  },
  "en": {
    "rooms": "Rooms",
    "gfa": "Floor area",
    "nua": "Usable area",
    "gfaT": "Total area",
    "nuaT": "Total usable area",
    "view": "View",
    "floors": "By level",
    "code": "Typical unit",
    "garden": "Garden area",
    "gNote": "The garden area is not included in the ownership certificate."
  }
} as const;
