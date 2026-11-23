/** Authorized source families and safe article IDs shared by indexing and UI. */
export const IKEDA_PUBLICATIONS = {
  bunshun: {
    label: "文春オンライン",
    urlPrefix: "https://bunshun.jp/articles/-/",
  },
  php: {
    label: "PHPオンライン",
    urlPrefix: "https://shuchi.php.co.jp/article/",
  },
  fujinkoron: {
    label: "婦人公論.jp",
    urlPrefix: "https://fujinkoron.jp/articles/-/",
  },
  italianity: {
    label: "ITALIANITY",
    urlPrefix: "https://italianity.jp/lifestyle/food/",
  },
  ippin: { label: "ippin", urlPrefix: "https://ippin.gnavi.co.jp/article-" },
  andpremium: {
    label: "&Premium",
    urlPrefix: "https://andpremium.jp/column/eyes/hiroaki-ikeda-",
  },
  rtsushin: {
    label: "料理通信",
    urlPrefix: "https://r-tsushin.com/people/innovator/hiroaki_ikeda_",
  },
  hanako: {
    label: "Hanako Web",
    urlPrefix: "https://hanako.tokyo/",
    paths: ["learn/", "food/"],
  },
  kurashi: {
    label: "暮らしとおしゃれの編集室",
    urlPrefix: "https://kurashi-to-oshare.jp/food/",
  },
  viewtabi: {
    label: "びゅうたび",
    urlPrefix: "https://www.viewtabi.jp/articles/",
  },
  elle: {
    label: "ELLE gourmet",
    urlPrefix: "https://www.elle.com/jp/gourmet/gourmet-restaurants-events/",
  },
  seifun: {
    label: "製粉振興",
    urlPrefix: "https://www.seifun.or.jp/relays/download/",
  },
} as const;
const originalSources = [
  { label: "パンラボ", urlPrefix: "https://panlabo.jugem.jp/?eid=" },
  {
    label: "朝日新聞デジタルマガジン＆",
    urlPrefix: "https://www.asahi.com/and/w/article/",
  },
];
export const IKEDA_SOURCE_URL_PATTERNS = [
  ...originalSources.map((s) => s.urlPrefix + "%"),
  ...Object.values(IKEDA_PUBLICATIONS).flatMap((s) =>
    "paths" in s
      ? s.paths.map((path) => s.urlPrefix + path + "%")
      : [s.urlPrefix + "%"],
  ),
];
export const IKEDA_ARTICLE_SLUG = new RegExp(
  `^(?:panlabo-\\d+|asahi-konopan-\\d+|ikeda-(?:${Object.keys(IKEDA_PUBLICATIONS).join("|")})-\\d+)$`,
);
export function articleSourceLabel(url: string) {
  return (
    [...originalSources, ...Object.values(IKEDA_PUBLICATIONS)].find((s) =>
      url.startsWith(s.urlPrefix),
    )?.label || "出典"
  );
}
