/** Independent examples for exploration, not a list of partners or endorsements. */
const catalog: Record<string, string> = {
  Japan:
    "日清製粉グループ|ニップン|昭和産業|日清オイリオグループ|不二製油|山崎製パン|敷島製パン|フジパン|ヤクルト本社|明治|森永乳業|カルビー|キユーピー|味の素|キーコーヒー|ホシザキ|パナソニック|オムロン|クボタ|ヤマトホールディングス",
  USA: "Microsoft|Apple|Alphabet|Amazon|NVIDIA|IBM|Intel|AMD|Oracle|Salesforce|Adobe|ServiceNow|Cisco|Dell Technologies|HP|Walmart|Costco|Target|Starbucks|McDonald's|PepsiCo|The Coca-Cola Company|General Mills|Kraft Heinz|Mondelez International|UPS|FedEx|Caterpillar|Deere & Company|Rockwell Automation",
  Canada:
    "Shopify|OpenText|CGI|Loblaw Companies|George Weston|Maple Leaf Foods|Saputo|McCain Foods|Canadian Tire|Magna International",
  Mexico: "Grupo Bimbo|Gruma|FEMSA|Alsea|Cemex|Grupo Lala",
  Brazil: "Natura|WEG|Embraer|JBS|BRF|Ambev|Suzano|TOTVS",
  Chile: "Cencosud|Falabella|Carozzi|Agrosuper",
  Argentina: "Arcor|Globant|Mercado Libre",
  Colombia: "Grupo Nutresa|Alpina|Rappi",
  UK: "Unilever|Tesco|Sainsbury's|Marks & Spencer|Associated British Foods|Tate & Lyle|Compass Group|Reckitt|Ocado Group|ARM|Sage|Dyson",
  Germany:
    "Siemens|SAP|Bosch|GEA Group|Krones|KUKA|Festo|Henkel|ALDI|REWE Group|Beiersdorf|Zalando",
  France:
    "Danone|Lactalis|Bel Group|Lesaffre|Roquette|Bonduelle|Accor|Carrefour|Schneider Electric|Groupe SEB|Veolia|Capgemini",
  Italy: "Barilla|Ferrero|Lavazza|illycaffè|De'Longhi|Smeg|IMA Group|Prysmian",
  Spain: "Inditex|Mercadona|Ebro Foods|Viscofan|Fluidra|Amadeus IT Group",
  Netherlands: "ASML|Philips|Heineken|Ahold Delhaize|FrieslandCampina|Corbion",
  Switzerland:
    "Nestlé|Bühler Group|Barry Callebaut|Lindt & Sprüngli|Givaudan|SIG Group",
  Sweden: "IKEA|Electrolux|Alfa Laval|Atlas Copco|Essity|Spotify",
  Denmark: "Carlsberg|Arla Foods|Novonesis|Danfoss|Grundfos",
  Norway: "Orkla|TOMRA|Yara International|Norsk Hydro",
  Finland: "KONE|Wärtsilä|Fazer|Valio",
  Belgium: "Puratos|Lotus Bakeries|Bekaert|Umicore",
  Austria: "ANDRITZ|Greiner|Wienerberger",
  Portugal: "Jerónimo Martins|Sonae|Corticeira Amorim",
  Ireland: "Kerry Group|Glanbia|Kingspan",
  Poland: "Maspex|InPost|LPP|Asseco Poland",
  Turkey: "Beko|Şişecam|Yıldız Holding|Migros Ticaret",
  India:
    "Tata Consultancy Services|Infosys|Wipro|HCLTech|Reliance Industries|ITC|Britannia Industries|Amul|Marico|Godrej Industries|Mahindra & Mahindra|UPL|Tata Consumer Products|Dabur|Asian Paints",
  China:
    "Alibaba Group|Tencent|JD.com|Baidu|Lenovo|Huawei|BYD|Midea Group|Haier|Gree Electric|Yili Group|Mengniu Dairy|Haidilao|Meituan|Pinduoduo",
  SouthKorea:
    "Samsung Electronics|LG Electronics|Hyundai Motor|SK hynix|CJ CheilJedang|Nongshim|Orion|Ottogi",
  Taiwan:
    "TSMC|ASUS|Acer|Delta Electronics|Uni-President Enterprises|Advantech",
  Singapore: "Wilmar International|Olam Group|Grab|Sea Limited|DBS Group|SATS",
  Indonesia: "Indofood|Mayora Indah|Garudafood|GoTo Group|Kalbe Farma",
  Thailand:
    "Charoen Pokphand Foods|Thai Union|Minor International|Central Group|ThaiBev",
  Malaysia: "IOI Corporation|Kuala Lumpur Kepong|MR D.I.Y.|Top Glove|AirAsia",
  Vietnam: "Vinamilk|Masan Group|FPT Corporation",
  Philippines: "Jollibee Foods|Universal Robina|San Miguel Corporation",
  Australia:
    "Woolworths Group|Coles Group|Wesfarmers|CSL|ResMed|Atlassian|Canva|Bega Group",
  NewZealand: "Fonterra|Fisher & Paykel Healthcare|Mainfreight|Xero",
  SouthAfrica:
    "Shoprite Holdings|Pick n Pay|Tiger Brands|AVI Limited|Bidcorp|Aspen Pharmacare",
  Kenya: "Safaricom|Bidco Africa|Kenya Airways",
  Nigeria: "Dangote Industries|BUA Group|Flour Mills of Nigeria",
  Egypt: "Edita Food Industries|Juhayna Food Industries",
  Morocco: "OCP Group|Lesieur Cristal",
  UAE: "Emirates Group|DP World|Agthia Group|Majid Al Futtaim",
  SaudiArabia: "Almarai|SABIC|Savola Group|ACWA Power",
  Ghana: "Kasapreko",
  Mauritius: "IBL Group",
  Bangladesh: "PRAN-RFL Group",
  Israel: "Strauss Group|SodaStream|Netafim|Check Point Software",
};
export const PARTNERSHIP_COMPANIES = Object.entries(catalog).flatMap(
  ([country, names]) => names.split("|").map((name) => ({ name, country })),
);
export const PARTNERSHIP_EXAMPLE_COUNT = 3;
export const PARTNERSHIP_EXAMPLES_STORAGE_KEY =
  "bakerization.partnership.examples.v1";

/** Equal sampling without replacement; the immediately previous examples cannot recur. */
export function selectPartnershipExamples(
  previous: readonly string[] = [],
  random = Math.random,
) {
  const pool = PARTNERSHIP_COMPANIES.filter(
    (c) => !previous.slice(0, PARTNERSHIP_EXAMPLE_COUNT).includes(c.name),
  );
  const selected: string[] = [];
  while (selected.length < PARTNERSHIP_EXAMPLE_COUNT && pool.length)
    selected.push(pool.splice(Math.floor(random() * pool.length), 1)[0].name);
  return selected;
}
