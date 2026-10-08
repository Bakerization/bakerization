import type { Locale } from "@/lib/locale";

/**
 * Service detail content — single source of truth for the home page cards
 * and the /services/[slug] detail pages.
 *
 * NOTE: The body copy here is intentionally written as evocative *placeholder*
 * text — it speaks to the real feelings of a bakery owner so the page reads
 * with empathy before the final, fact-checked copy lands. Swap freely.
 */

export type ServiceStep = {
  num: string;
  title: string;
  body: string;
};

export type LocalizedService = {
  /** Big page headline (the service name). */
  title: string;
  /** One-line tagline shown under the headline. */
  tagline: string;
  /** Empathetic lead paragraph. */
  deck: string;
  /** Pull quote — the feeling we hear most often on the floor. */
  pullQuote: string;
  /** "We hear this a lot" — the shared pains, in the owner's own voice. */
  empathyLabel: string;
  empathyLead: string;
  pains: string[];
  /** What we actually do about it. */
  approachLabel: string;
  approach: string[];
  /** How the work unfolds. */
  stepsLabel: string;
  steps: ServiceStep[];
  /** Closing line — the future we're reaching for together. */
  outcomeLabel: string;
  outcome: string;
};

export type Service = {
  slug: string;
  num: string;
  /** English label, reused as kicker in both locales. */
  titleEn: string;
  ja: LocalizedService;
  en: LocalizedService;
};

export const SERVICES: Service[] = [
  {
    slug: "store-operations",
    num: "01",
    titleEn: "Store Operations Support",
    ja: {
      title: "店舗オペレーション支援",
      tagline: "段取りを、頭の中から現場へ。",
      deck:
        "気づけば、いつも自分が一番早く店に立っている。レシピも仕込み量も、その日の段取りも——ぜんぶ、自分の頭の中。Bakerizationは、その「重さ」を軽くするのではなく、続けられる形に整えます。",
      pullQuote:
        "「自分が倒れたら、この店は明日開かない。」——そう感じたことのある、すべてのパン屋さんへ。",
      empathyLabel: "こんな声を、よく聞きます",
      empathyLead:
        "現場を回しているのは、いつも誰かの無理かもしれません。私たちが最初に耳を傾けるのは、数字ではなく、こうした小さなため息です。",
      pains: [
        "新しい人が入っても、教える時間がなくて、結局また自分でやってしまう。",
        "仕込みの量は「だいたい」で決めている。売り切れても、売れ残っても、胃が痛い。",
        "休みの日も、店のことが頭から離れない。",
        "段取りは全部わかっている。でも、それを誰かに渡せる形にはなっていない。",
      ],
      approachLabel: "私たちにできること",
      approach: [
        "フローを設計し、パン屋さんのコンサルティングや店舗開発を担当します。職人の勘や手の動きを否定するのではなく、それを誰でも読める手順へと翻訳していくのが私たちの仕事です。",
        "朝の仕込みから店じまいまで、まず一緒に現場に立ちます。そのうえで、無理なく回り、人が育ち、あなたが一日休んでも店が開く——そんなオペレーションを、お店と一緒につくります。",
      ],
      stepsLabel: "進め方",
      steps: [
        {
          num: "01",
          title: "現場に入る",
          body:
            "朝いちばんの仕込みから店じまいまで、まずは横に立たせてください。数字の前に、空気を知ることから始めます。",
        },
        {
          num: "02",
          title: "暗黙知を形にする",
          body:
            "頭の中にある段取りを、新しい人でも迷わず動ける手順に。属人化を、チームの財産に変えます。",
        },
        {
          num: "03",
          title: "続く形に整える",
          body:
            "回してみて、直して、また回す。あなたが休んでも、店がちゃんと開く状態を一緒に目指します。",
        },
      ],
      outcomeLabel: "その先にあるもの",
      outcome:
        "目指すのは、効率化ではなく「続けられること」。あなたの手から離れても残る段取りこそ、次の世代へ渡せる、いちばん大切なレシピだと考えています。",
    },
    en: {
      title: "Store Operations Support",
      tagline: "From inside your head, onto the floor.",
      deck:
        "You're always the first one in. The recipes, the prep volumes, the rhythm of the day — all of it lives in your head. Bakerization doesn't try to lighten the craft; we give it a shape that can keep going.",
      pullQuote:
        "“If I go down, the shop doesn't open tomorrow.” — for every baker who has felt that weight.",
      empathyLabel: "We hear this a lot",
      empathyLead:
        "More often than not, the floor runs on someone quietly pushing through. Before any numbers, these are the small sighs we listen for.",
      pains: [
        "New hires come on, but there's no time to train them — so you end up doing it yourself again.",
        "Prep volume is mostly a gut call. Sell out or have leftovers, either way it knots your stomach.",
        "Even on your day off, the shop never quite leaves your head.",
        "You know every step by heart — but none of it is in a form you can hand to someone else.",
      ],
      approachLabel: "What we do",
      approach: [
        "We design the flow and handle bakery consulting and store development. Rather than overriding a craftsperson's instinct, our job is to translate it into steps anyone can read.",
        "We stand on the floor with you, from the first prep of the morning to closing. From there, we build — together — an operation that runs without strain, grows your people, and opens even on the days you rest.",
      ],
      stepsLabel: "How it works",
      steps: [
        {
          num: "01",
          title: "We join the floor",
          body:
            "From the morning's first prep to closing, let us stand beside you. We learn the air of the place before we touch a single number.",
        },
        {
          num: "02",
          title: "We give tacit knowledge a shape",
          body:
            "The routine in your head becomes steps a new hire can follow without hesitation — turning what only you know into something the whole team owns.",
        },
        {
          num: "03",
          title: "We shape it to last",
          body:
            "Run it, refine it, run it again. We work toward a shop that opens properly even on the days you step away.",
        },
      ],
      outcomeLabel: "What this leads to",
      outcome:
        "The goal isn't efficiency — it's the ability to keep going. The routine that survives once it leaves your hands is, we believe, the most important recipe you can pass to the next generation.",
    },
  },
  {
    slug: "data-visibility",
    num: "02",
    titleEn: "Data Visibility & Improvement",
    ja: {
      title: "データの可視化",
      tagline: "「なんとなく」を、確かな手応えに。",
      deck:
        "今日は、なぜか売れなかった。その「なぜか」を、ずっと勘で済ませてきた。毎晩の廃棄を見るたび、少しだけ胸が痛む。Bakerizationは、パンにまつわる数値を徹底的に可視化し、その手応えをあなたの隣に置きます。",
      pullQuote:
        "「捨てるために焼いている日がある気がする。」——その感覚に、数字で答えを出したい。",
      empathyLabel: "こんな声を、よく聞きます",
      empathyLead:
        "経験は嘘をつきません。でも、経験だけに背負わせるには、いまのパン屋さんは少し荷が重すぎます。",
      pains: [
        "どのパンが本当に利益を生んでいるのか、実は、はっきりとは分からない。",
        "天気や曜日で売れ方が変わるのは分かる。でも、それを次の仕込みに活かせていない。",
        "値上げをしたいけれど、どこをどう動かせばいいのか判断できない。",
        "数字は大事だと分かっている。けれど、それを集める時間も余裕もない。",
      ],
      approachLabel: "私たちにできること",
      approach: [
        "パン屋さんに特化したSaaSの開発を行い、パンにまつわる数値を徹底的に可視化します。",
        "大切なのは、現場に新しい負担を増やさないこと。レジを打つ、パンを並べる——その当たり前の動作の裏側で数字が静かに集まり、翌朝の判断に変わっていく。そんな仕組みを目指しています。",
      ],
      stepsLabel: "進め方",
      steps: [
        {
          num: "01",
          title: "計る",
          body:
            "パンにまつわる数値を、現場の手間を増やさずに集める仕組みを整えます。まずは「見える」ようにすることから。",
        },
        {
          num: "02",
          title: "視る",
          body:
            "売上・廃棄・時間帯別の需要を、専門知識がなくてもひと目で読めるかたちに。勘を、裏づけのある実感へ。",
        },
        {
          num: "03",
          title: "変える",
          body:
            "見えた数字を、明日の仕込み量や品ぞろえの判断へ。小さな改善を、毎朝くり返せるようにします。",
        },
      ],
      outcomeLabel: "その先にあるもの",
      outcome:
        "数字は、職人の勘を置きかえるためのものではありません。長年の経験に、ひとつの安心を添えるためのもの。捨てるパンが一つ減るたび、その朝の判断に、少しだけ自信が持てるように。",
    },
    en: {
      title: "Data Visibility & Improvement",
      tagline: "Turning a hunch into something you can hold.",
      deck:
        "Today, for some reason, it just didn't sell. You've always settled that “for some reason” with instinct. Every night, the waste tin stings a little. Bakerization makes the numbers behind bread fully visible — and sets that certainty down beside you.",
      pullQuote:
        "“Some days it feels like I'm baking just to throw it away.” — we want to answer that feeling with numbers.",
      empathyLabel: "We hear this a lot",
      empathyLead:
        "Experience never lies. But to carry a modern bakery on experience alone is, frankly, too much to ask of one person.",
      pains: [
        "Which breads actually turn a profit? Honestly, you couldn't say for sure.",
        "You know sales shift with the weather and the day — but none of that feeds back into tomorrow's prep.",
        "You'd like to raise prices, but you can't tell what to move, or by how much.",
        "You know the numbers matter. You just don't have the time or room to gather them.",
      ],
      approachLabel: "What we do",
      approach: [
        "We build SaaS made for bakeries — making the numbers behind bread thoroughly visible.",
        "What matters is adding no new burden to the floor. Ring up a sale, set out a loaf — and behind those ordinary motions, the numbers quietly gather and become tomorrow morning's decision. That's the kind of system we're after.",
      ],
      stepsLabel: "How it works",
      steps: [
        {
          num: "01",
          title: "Measure",
          body:
            "We set up a way to gather the numbers behind bread without adding work to the floor. It starts with simply making them visible.",
        },
        {
          num: "02",
          title: "See",
          body:
            "Sales, waste, and demand by time of day, rendered so anyone can read them at a glance — turning a hunch into grounded conviction.",
        },
        {
          num: "03",
          title: "Change",
          body:
            "What you can now see feeds straight into tomorrow's prep volume and lineup, so small improvements become a daily habit.",
        },
      ],
      outcomeLabel: "What this leads to",
      outcome:
        "Numbers aren't here to replace a craftsperson's instinct — they're here to add a little reassurance to years of experience. So that every time one fewer loaf is thrown away, you face that morning's decision with a touch more confidence.",
    },
  },
  {
    slug: "future-of-bakery-culture",
    num: "03",
    titleEn: "Future of Bakery Culture",
    ja: {
      title: "パン文化の未来づくり",
      tagline: "この街の味を、次の世紀へ。",
      deck:
        "自分が辞めたら、この街からこの味が消えてしまう——。長く愛された店ほど、続けることの難しさを抱えています。Bakerizationは、地域や職人の魅力を守りながら、次の世代へつながるパン屋のあり方を企画し、実装します。",
      pullQuote:
        "「うちのパンは、22世紀にも残っているだろうか。」——その問いを、一緒に背負わせてください。",
      empathyLabel: "こんな声を、よく聞きます",
      empathyLead:
        "パンは、ただの商品ではありません。街の朝そのものです。だからこそ、その火を絶やさないための悩みは、いつも切実です。",
      pains: [
        "技術を継ぐ人がいない。この手の動きは、自分とともに消えてしまうのかもしれない。",
        "地域に愛されている実感はある。でも、それを次の世代にどう手渡せばいいのか分からない。",
        "原価も人手も厳しくなる一方で、この先も店を続けられるのか、ふと不安になる。",
        "新しいことに挑戦したい気持ちはある。けれど、日々を回すだけで精一杯。",
      ],
      approachLabel: "私たちにできること",
      approach: [
        "地域や職人の魅力を守りながら、次世代へつながるパン屋のあり方を企画・実装します。一つの店の物語を、街の記憶として、そして次に焼く人への手紙として残していきます。",
        "東大パン研究会と「パンラボ」池田浩明から始まったこの運動は、日本のパン文化を世界に広げ、22世紀のパン屋さんを創造することを目指しています。あなたの店も、その未来の一部です。",
      ],
      stepsLabel: "進め方",
      steps: [
        {
          num: "01",
          title: "残す",
          body:
            "地域と職人の魅力を、記録し、言葉にする。失われてしまう前に、その価値をきちんと見える形にします。",
        },
        {
          num: "02",
          title: "つなぐ",
          body:
            "技術と物語を、次の世代・次の街へ。継ぐ人、応援する人との出会いを設計します。",
        },
        {
          num: "03",
          title: "描く",
          body:
            "22世紀のパン屋のあり方を、あなたの店から一緒に企画・実装する。守ることと、変えることを両立させます。",
        },
      ],
      outcomeLabel: "その先にあるもの",
      outcome:
        "宇宙の全てのパン好きのために、Bakerizationは今日も文化を紡ぎ続けます。あなたの店の味が、次の世紀の朝にも当たり前にあること——それが、私たちの描く未来です。",
    },
    en: {
      title: "Future of Bakery Culture",
      tagline: "This town's flavor, into the next century.",
      deck:
        "“If I stop, this flavor disappears from the town.” The more loved a shop is, the harder it can be to keep it going. Bakerization preserves the charm of a place and its craftspeople while designing — and building — what a bakery can be for the next generation.",
      pullQuote:
        "“Will our bread still be here in the 22nd century?” — let us help you carry that question.",
      empathyLabel: "We hear this a lot",
      empathyLead:
        "Bread isn't just a product. It's the morning of a town. Which is exactly why the worry of keeping that fire lit always runs deep.",
      pains: [
        "There's no one to inherit the craft. These movements of the hand might vanish along with you.",
        "You can feel the town loves the shop — but you're not sure how to hand that down to the next generation.",
        "With costs and staffing only getting tighter, you sometimes wonder how long you can keep the doors open.",
        "You'd love to try something new. But just getting through each day takes everything you have.",
      ],
      approachLabel: "What we do",
      approach: [
        "We preserve the charm of local communities and craftspeople while designing and implementing what a bakery can become for the next generation — keeping one shop's story as a memory for the town, and as a letter to whoever bakes next.",
        "Born when the University of Tokyo Bread Society met Hiroaki Ikeda of “Pan Labo,” this movement aims to carry Japanese bread culture to the world and create the bakery of the 22nd century. Your shop is part of that future, too.",
      ],
      stepsLabel: "How it works",
      steps: [
        {
          num: "01",
          title: "Preserve",
          body:
            "We record and put into words the charm of a place and its craftspeople — making that value visible before it can be lost.",
        },
        {
          num: "02",
          title: "Connect",
          body:
            "We carry the craft and the story to the next generation and the next town, designing the encounters with those who'll inherit and champion it.",
        },
        {
          num: "03",
          title: "Envision",
          body:
            "Starting from your shop, we plan and build what a 22nd-century bakery can be — holding what's worth keeping and what's worth changing in the same hand.",
        },
      ],
      outcomeLabel: "What this leads to",
      outcome:
        "For every bread lover in the universe, Bakerization keeps weaving culture today. That your shop's flavor will simply be there, on the mornings of the next century too — that is the future we're working toward.",
    },
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getServiceCopy(service: Service, locale: Locale): LocalizedService {
  return locale === "en" ? service.en : service.ja;
}
