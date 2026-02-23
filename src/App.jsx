import { useState, useEffect, useCallback, useRef } from "react";

/* ─── FONTS ─── */
try {
  const fl = document.createElement("link");
  fl.href = "https://fonts.googleapis.com/css2?family=DotGothic16&family=Press+Start+2P&display=swap";
  fl.rel = "stylesheet";
  document.head.appendChild(fl);
} catch {}

/* ─── AUDIO ─── */
const B = import.meta.env.BASE_URL || "/";
const AU = {};
function ga(k) { if (!AU[k]) { try { AU[k] = new Audio(`${B}${k}.mp3`); AU[k].volume = 0.3; } catch { return null; } } return AU[k]; }
function playBGM(k, loop = true) {
  Object.values(AU).forEach(a => { if (a) { a.pause(); a.currentTime = 0; } });
  const a = ga(k); if (a) { a.loop = loop; a.play().catch(() => {}); }
}
function stopAll() { Object.values(AU).forEach(a => { if (a) { a.pause(); a.currentTime = 0; } }); }

/* ─── UTILS ─── */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ─── QUIZ POOL (60+ questions, 算数/国語/理科/社会) ─── */
const QUIZZES = [
  // 算数
  { q: "3.14 × 25 = ?", c: ["68.5", "78.5", "72.5"], a: 1 },
  { q: "1/3 + 1/6 = ?", c: ["1/2", "2/9", "1/4"], a: 0 },
  { q: "6² + 8² = ?", c: ["100", "128", "96"], a: 0 },
  { q: "252 ÷ 7 = ?", c: ["32", "36", "38"], a: 1 },
  { q: "0.25 × 0.4 = ?", c: ["0.1", "0.01", "1.0"], a: 0 },
  { q: "3/8 + 5/8 = ?", c: ["8/8", "8/16", "15/64"], a: 0 },
  { q: "時速60kmで2時間30分走ると？", c: ["120km", "150km", "180km"], a: 1 },
  { q: "正三角形の1つの角度は？", c: ["45°", "60°", "90°"], a: 1 },
  { q: "2, 5, 10, 17, 26, … 次は？", c: ["35", "37", "33"], a: 1 },
  { q: "円の面積の公式は？", c: ["2πr", "πr²", "πd"], a: 1 },
  { q: "120の約数はいくつ？", c: ["12個", "16個", "20個"], a: 1 },
  { q: "1000の10%の10%は？", c: ["1", "10", "100"], a: 1 },
  { q: "三角形の内角の和は？", c: ["90°", "180°", "360°"], a: 1 },
  { q: "48と36の最大公約数は？", c: ["6", "12", "24"], a: 1 },
  { q: "立方体の面の数は？", c: ["4", "6", "8"], a: 1 },
  // 国語
  { q: "「犬も歩けば□に当たる」□に入るのは？", c: ["石", "棒", "壁"], a: 1 },
  { q: "「情けは人の□ならず」□に入るのは？", c: ["為", "徳", "道"], a: 0 },
  { q: "「五十歩□歩」□に入る数字は？", c: ["百", "千", "六十"], a: 0 },
  { q: "「□の耳に念仏」□に入る動物は？", c: ["猫", "馬", "犬"], a: 1 },
  { q: "「急がば□れ」□に入るのは？", c: ["走", "回", "曲"], a: 1 },
  { q: "「塵も積もれば□となる」□は？", c: ["山", "川", "丘"], a: 0 },
  { q: "「花」の部首は？", c: ["くさかんむり", "にんべん", "きへん"], a: 0 },
  { q: "「走る」の対義語は？", c: ["止まる", "歩く", "座る"], a: 0 },
  { q: "「温故知新」の意味は？", c: ["古きを温め新しきを知る", "新しいことを始める", "温かい心で接する"], a: 0 },
  { q: "俳句の音数は？", c: ["五・七・五", "七・五・七", "五・五・七"], a: 0 },
  { q: "「月が綺麗ですね」は誰の言葉とされる？", c: ["夏目漱石", "太宰治", "芥川龍之介"], a: 0 },
  { q: "「矛盾」の故事の出典は？", c: ["韓非子", "論語", "孟子"], a: 0 },
  { q: "「推敲」の語源で門を叩く詩人は？", c: ["李白", "杜甫", "賈島"], a: 2 },
  { q: "主語・述語の関係で正しいのは？", c: ["花が・咲く", "花は・きれい・咲く", "花を・咲く"], a: 0 },
  { q: "「春はあけぼの」の作品は？", c: ["源氏物語", "枕草子", "徒然草"], a: 1 },
  // 理科
  { q: "水の化学式は？", c: ["CO2", "H2O", "O2"], a: 1 },
  { q: "光合成に必要な気体は？", c: ["酸素", "二酸化炭素", "窒素"], a: 1 },
  { q: "リトマス紙が赤→青になるのは？", c: ["酸性", "アルカリ性", "中性"], a: 1 },
  { q: "太陽系で最も大きい惑星は？", c: ["土星", "木星", "天王星"], a: 1 },
  { q: "地球の表面の約何%が海？", c: ["50%", "70%", "80%"], a: 1 },
  { q: "日本の国鳥は？", c: ["トキ", "キジ", "ウグイス"], a: 1 },
  { q: "音の速さは秒速約何m？", c: ["170m", "340m", "680m"], a: 1 },
  { q: "昆虫の足の数は？", c: ["4本", "6本", "8本"], a: 1 },
  { q: "月が地球を一周する日数は約？", c: ["7日", "27日", "365日"], a: 1 },
  { q: "虹は何色？", c: ["5色", "7色", "9色"], a: 1 },
  { q: "血液中で酸素を運ぶのは？", c: ["白血球", "赤血球", "血小板"], a: 1 },
  { q: "植物の根から水を吸い上げる管は？", c: ["師管", "道管", "気管"], a: 1 },
  { q: "氷が水になる温度は？", c: ["-10℃", "0℃", "10℃"], a: 1 },
  { q: "てこの原理で支点に近いのは？", c: ["力点", "作用点", "どちらでもない"], a: 0 },
  // 社会
  { q: "47都道府県で最も面積が大きいのは？", c: ["北海道", "岩手県", "長野県"], a: 0 },
  { q: "日本で一番長い川は？", c: ["利根川", "信濃川", "石狩川"], a: 1 },
  { q: "源頼朝が鎌倉幕府を開いたのは？", c: ["1185年", "1192年", "1221年"], a: 0 },
  { q: "本能寺の変は何年？", c: ["1573年", "1582年", "1600年"], a: 1 },
  { q: "日本国憲法が施行されたのは？", c: ["1946年", "1947年", "1948年"], a: 1 },
  { q: "鎌倉幕府を滅ぼした人物は？", c: ["足利尊氏", "新田義貞", "楠木正成"], a: 1 },
  { q: "「吾輩は猫である」の作者は？", c: ["芥川龍之介", "夏目漱石", "太宰治"], a: 1 },
  { q: "「奥の細道」を書いたのは？", c: ["松尾芭蕉", "与謝蕪村", "小林一茶"], a: 0 },
  { q: "日本の最高峰は？", c: ["北岳", "富士山", "奥穂高岳"], a: 1 },
  { q: "関ヶ原の戦いは何年？", c: ["1590年", "1600年", "1615年"], a: 1 },
  { q: "日本の国会は何院制？", c: ["一院制", "二院制", "三院制"], a: 1 },
  { q: "日本の都道府県の数は？", c: ["43", "47", "50"], a: 1 },
  { q: "江戸幕府を開いたのは？", c: ["豊臣秀吉", "徳川家康", "織田信長"], a: 1 },
  { q: "沖縄が日本に返還されたのは？", c: ["1968年", "1972年", "1975年"], a: 1 },
  { q: "世界で最も人口が多い国は？", c: ["中国", "インド", "アメリカ"], a: 1 },
  { q: "国連の本部がある都市は？", c: ["ロンドン", "ニューヨーク", "ジュネーブ"], a: 1 },
];

// Global used question tracker (indices into QUIZZES)
let usedQuizIndices = new Set();

function resetUsedQuizzes() { usedQuizIndices = new Set(); }

function pickQuizzes(n) {
  const available = QUIZZES.map((q, i) => i).filter(i => !usedQuizIndices.has(i));
  // If running low, reset
  if (available.length < n) { usedQuizIndices = new Set(); return pickQuizzes(n); }
  const shuffled = available.sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, n);
  picked.forEach(i => usedQuizIndices.add(i));
  return picked.map(i => ({ ...QUIZZES[i], _idx: i }));
}

/* ─── SCHOOL DATA ─── */
const SCHOOLS = {
  S: [{ name: "開誠", model: "開成", dev: 78 }, { name: "桜隠", model: "桜蔭", dev: 77 }],
  A: [{ name: "海城砦", model: "海城", dev: 72 }, { name: "渋谷教学", model: "渋渋", dev: 71 }],
  B: [{ name: "芝浦工附", model: "芝", dev: 65 }, { name: "本郷学舎", model: "本郷", dev: 64 }],
  C: [{ name: "成蹊学舎", model: "成蹊", dev: 58 }, { name: "國學久我", model: "國學院久我山", dev: 56 }],
  D: [{ name: "足立学院", model: "足立学園", dev: 48 }, { name: "桜丘学舎", model: "桜丘", dev: 47 }],
};

/* ─── STYLES ─── */
const dk = h => {
  const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16);
  return `#${Math.max(0,r-50).toString(16).padStart(2,'0')}${Math.max(0,g-50).toString(16).padStart(2,'0')}${Math.max(0,b-50).toString(16).padStart(2,'0')}`;
};

const SEASON_BG = {
  spring: "linear-gradient(180deg, #2d1b3d 0%, #1a1a2e 100%)",
  summer: "linear-gradient(180deg, #1b2d3d 0%, #1a1a2e 100%)",
  autumn: "linear-gradient(180deg, #3d2d1b 0%, #1a1a2e 100%)",
  winter: "linear-gradient(180deg, #1b1b2d 0%, #1a1a2e 100%)",
};

const SEASON_COLOR = { spring: "#f48fb1", summer: "#4fc3f7", autumn: "#ffb74d", winter: "#90a4ae" };

/* ════════════════════════════════════════════
   STORY CHAPTERS
   ════════════════════════════════════════════ */
function buildStory() {
  return [
  // ═══ 小4 春 ═══
  { season: "spring", year: 4, title: "小4・春「はじまりの教室」", emoji: "🌸", beats: [
    { t: "talk", who: "🏠", name: "", text: "桜が舞い散る4月。\n我が子が塾のドアを初めてくぐった。\n中学受験という長い旅が、今日始まる。" },
    { t: "talk", who: "👦", name: "我が子", text: "「塾って思ったより楽しいかも！\nとなりの席の子、もう友達になったよ！」" },
    { t: "talk", who: "👨‍🏫", name: "先生", text: "「ようこそ。まずは勉強を好きになること。\n焦らず、一歩ずつ行きましょう。」" },
    { t: "choice", text: "GW、どう過ごす？", opts: [
      { label: "🎓 塾の特別講座に参加", desc: "学力UP、でも疲れる", fx: { ac: 3, st: -8 } },
      { label: "🏖️ 家族旅行でリフレッシュ", desc: "やる気と体力が回復", fx: { mo: 10, st: 8, me: 5 } },
    ]},
  ]},
  // ═══ 小4 夏 ═══
  { season: "summer", year: 4, title: "小4・夏「はじめての夏期講習」", emoji: "🌻", beats: [
    { t: "talk", who: "☀️", name: "", text: "夏休みが来た！\n…でも塾通いの子に夏休みなんてない。\n朝から夕方まで、毎日授業。" },
    { t: "minigame", game: "mash", title: "🔥 夏期講習チャレンジ！", desc: "5秒間で連打！がんばった分だけ学力UP！", reward: { ac: [3, 6, 10] } },
    { t: "talk", who: "👦", name: "我が子", text: "「みんなプール行ってるのに\nなんで僕だけ…」" },
    { t: "choice", text: "子供が「遊びたい」と訴えてきた", opts: [
      { label: "🏊 「1日だけね」とプールへ", desc: "リフレッシュ", fx: { mo: 12, me: 8, ac: -1 } },
      { label: "📖 「今がんばれば来年楽だよ」", desc: "続行、でもストレス", fx: { ac: 2, mo: -5, me: -3 } },
    ]},
    { t: "talk", who: "👩", name: "ママ友", text: "「うちの子、SAFIXのαクラスに\n上がったの〜♪」\n\n…マウント合戦が始まった。" },
  ]},
  // ═══ 小4 秋 ═══
  { season: "autumn", year: 4, title: "小4・秋「はじめての模試」", emoji: "🍂", beats: [
    { t: "talk", who: "🍁", name: "", text: "秋風が吹き始めた頃。\n初めての全国模試。\n偏差値という残酷な数字と向き合う日が来た。" },
    { t: "minigame", game: "quiz", title: "📝 全国模試", desc: "3問勝負！", reward: { ac: [2, 5, 8] } },
    { t: "talk", who: "👨‍🏫", name: "先生（面談）", text: "「まだ4年生。今の偏差値は気にしすぎないで。\n大事なのは勉強の習慣をつけること。\n…ただ、算数はもう少し頑張りたいですね。」" },
    { t: "talk", who: "👦", name: "我が子", text: "「ねえ…僕って頭悪いのかな…」\n\n偏差値を見て、初めて落ち込んだ顔をしている。" },
    { t: "choice", text: "子供にどう声をかける？", opts: [
      { label: "🤗 「まだ始まったばかり、大丈夫」", desc: "安心させる", fx: { me: 10, mo: 5 } },
      { label: "💪 「悔しいなら次がんばろう！」", desc: "奮起させる", fx: { mo: 10, me: -3 } },
    ]},
  ]},
  // ═══ 小4 冬 ═══
  { season: "winter", year: 4, title: "小4・冬「サンタと偏差値」", emoji: "⛄", beats: [
    { t: "talk", who: "🎄", name: "", text: "クリスマス。\nサンタへの手紙に\n「偏差値60ください」と書いてあった。\n\n…泣ける。" },
    { t: "choice", text: "冬休み、どう過ごす？", opts: [
      { label: "📚 冬期講習に集中", desc: "学力UP", fx: { ac: 5, st: -8 } },
      { label: "🏠 家族でゆっくり過ごす", desc: "絆と心が回復", fx: { ha: 10, me: 8, mo: 5 } },
    ]},
    { t: "talk", who: "👫", name: "夫婦", text: "「…ねえ、本当にこのまま続けて大丈夫？」\n「まだ4年生だよ。もう少し様子を見よう」\n\n夫婦の間にも、温度差が生まれ始めている。" },
  ]},

  // ═══ 小5 春 ═══
  { season: "spring", year: 5, title: "小5・春「ライバル登場」", emoji: "🌸", beats: [
    { t: "talk", who: "🌸", name: "", text: "5年生。カリキュラムの難度がグッと上がった。\n新しい顔ぶれの中に、気になる転校生がいる。" },
    { t: "talk", who: "👦", name: "我が子", text: "「あの子すごいんだよ。\n算数で僕より全然速いし、国語も得意で…」\n\nライバルの登場だ。" },
    { t: "choice", text: "ライバルの存在をどう活かす？", opts: [
      { label: "🔥 「負けないようにがんばろう」", desc: "闘争心に火をつける", fx: { mo: 10, ac: 2, me: -3 } },
      { label: "🧘 「人と比べなくていいよ」", desc: "マイペースを守る", fx: { me: 8, mo: 3 } },
    ]},
    { t: "talk", who: "📝", name: "", text: "宿題の量が去年の1.5倍に。\n「終わらないんだけど…」が口癖になった。" },
    { t: "choice", text: "宿題が終わらない日々。どうする？", opts: [
      { label: "👨‍👩‍👦 親が横について一緒にやる", desc: "学力UP、親の負担大", fx: { ac: 3, ha: 5, an: 8 } },
      { label: "📋 優先順位をつけて取捨選択", desc: "効率的だが穴が出る", fx: { ac: 1, st: 5, me: 5 } },
    ]},
  ]},
  // ═══ 小5 夏 ═══
  { season: "summer", year: 5, title: "小5・夏「天王山」", emoji: "🌻", beats: [
    { t: "talk", who: "🔥", name: "", text: "「5年の夏は天王山」と先生が言った。\nここで差がつく。逆転もここから。\nプレッシャーが、親にも子にもかかる。" },
    { t: "minigame", game: "mash", title: "🏕️ 夏期合宿チャレンジ！", desc: "5秒間で全力連打！がんばりが成績に直結！", reward: { ac: [4, 8, 14] } },
    { t: "talk", who: "📞", name: "我が子（合宿中の電話）", text: "「帰りたい…夜、みんなの前で泣いちゃった…\nでも先生が『がんばってるぞ』って。\nもうちょっと、がんばってみる。」" },
    { t: "talk", who: "🍙", name: "夜食タイム", text: "夜10時。塾から帰った我が子に\n温かいおにぎりを出した。\n「おいしい…」と笑った顔に、少し安心する。" },
    { t: "talk", who: "👫", name: "夫婦喧嘩", text: "「成績上がらないじゃないか！」\n「口出しすると子供が萎縮するの！」\n\n真夏の夜。子供はきっと聞いている。" },
    { t: "choice", text: "夫婦の方針が対立。どうする？", opts: [
      { label: "🤝 冷静に話し合う", desc: "修復に向かう", fx: { ha: 10, me: 5, an: -5 } },
      { label: "😤 とりあえず片方が折れる", desc: "その場しのぎ", fx: { ha: -5, an: 5 } },
    ]},
  ]},
  // ═══ 小5 秋 ═══
  { season: "autumn", year: 5, title: "小5・秋「あの門をくぐりたい」", emoji: "🍂", beats: [
    { t: "talk", who: "🏫", name: "", text: "志望校の文化祭シーズン。\n初めて、目標の学校に足を踏み入れる。" },
    { t: "choice", text: "どのランクの学校を見に行く？", opts: [
      { label: "🏰 最難関校（開誠・桜隠）", desc: "夢は大きく！", fx: { mo: 15, an: 8 } },
      { label: "🏫 実力相応の学校", desc: "現実的に", fx: { mo: 8, me: 5 } },
      { label: "🏠 安全圏の学校", desc: "確実路線", fx: { mo: 3, me: 8, an: -5 } },
    ]},
    { t: "talk", who: "👦", name: "我が子", text: "「…すごい。\nこんな学校に通えたら毎日楽しいだろうな。」\n\nキラキラした目で校舎を見上げている。" },
    { t: "minigame", game: "balance", title: "📊 秋の実力テスト", desc: "集中力を保て！バーを中央にキープ！", reward: { ac: [2, 5, 9] } },
  ]},
  // ═══ 小5 冬 ═══
  { season: "winter", year: 5, title: "小5・冬「折り返し地点」", emoji: "⛄", beats: [
    { t: "talk", who: "❄️", name: "", text: "受験まであと1年。\n「まだ1年ある」のか「もう1年しかない」のか。\n感じ方は人それぞれ。" },
    { t: "minigame", game: "timing", title: "🎍 正月特訓ゼミ", desc: "タイミングよくタップ！集中力が試される！", reward: { ac: [3, 6, 10] } },
    { t: "talk", who: "🎍", name: "", text: "初詣で手を合わせる。\n「合格しますように」\n隣で小さな手も、同じことを祈っている。" },
    { t: "talk", who: "👦", name: "我が子", text: "「お父さん、お母さん。\n僕、がんばるから。見ててね。」\n\n成長したな、と思う。でもまだ11歳の子供だ。" },
    { t: "choice", text: "5年生の終わり。追加で何かする？", opts: [
      { label: "👨‍🏫 個別指導をつける", desc: "弱点補強、負荷増", fx: { ac: 5, st: -8 } },
      { label: "🙏 子供の自主性に任せる", desc: "信じて待つ", fx: { mo: 8, me: 5 } },
    ]},
  ]},

  // ═══ 小6 春 ═══
  { season: "spring", year: 6, title: "小6・春「ラストイヤー」", emoji: "🌸", beats: [
    { t: "talk", who: "🌸", name: "", text: "最終学年。教室の空気が変わった。\n先生の目が厳しくなり、テストの頻度が増える。" },
    { t: "talk", who: "👨‍🏫", name: "先生", text: "「いいですか。目標の学校と今の実力。\nそのギャップを9ヶ月で埋めるんです。\n甘い考えは捨ててください。」" },
    { t: "choice", text: "先生の言葉を受けて、志望校を考える", opts: [
      { label: "🏰 最難関に挑戦する", desc: "高い目標で追い込む", fx: { mo: 10, an: 12 } },
      { label: "🎯 実力相応を狙う", desc: "堅実路線", fx: { mo: 5, me: 5 } },
    ]},
    { t: "talk", who: "📱", name: "", text: "SNSで「中受やめました」投稿がバズっている。\n「子供の笑顔が戻った」\n「あの3年間はなんだったのか」\n\n…揺れる。" },
  ]},
  // ═══ 小6 夏 ═══
  { season: "summer", year: 6, title: "小6・夏「最後の夏休み」", emoji: "🌻", beats: [
    { t: "talk", who: "🔥", name: "", text: "小学校最後の夏休み。\n他の子は海やキャンプ。\n我が子は朝8時から夜9時まで、塾。" },
    { t: "minigame", game: "mash", title: "🔥 最後の夏期講習！", desc: "ここが正念場！5秒間全力連打！", reward: { ac: [5, 10, 16] } },
    { t: "talk", who: "👦", name: "我が子", text: "「…疲れた。でも、もう少しやる。\nあの学校に行きたいから。」\n\n机に向かう小さな背中。頼もしい。" },
    { t: "choice", text: "夏の終わり。子供が弱音を吐いた", opts: [
      { label: "🍦 アイスを買って気分転換", desc: "心の回復", fx: { me: 10, mo: 5, st: 5 } },
      { label: "💬 「あと半年、一緒にがんばろう」", desc: "覚悟を共有", fx: { mo: 8, ha: 5 } },
    ]},
  ]},
  // ═══ 小6 秋 ═══
  { season: "autumn", year: 6, title: "小6・秋「過去問との戦い」", emoji: "🍂", beats: [
    { t: "talk", who: "📚", name: "", text: "過去問演習が始まった。\n志望校の入試問題と初めて向き合う。\n…難しい。点が取れない。" },
    { t: "minigame", game: "quiz", title: "📝 志望校の過去問", desc: "入試レベルの問題に挑戦！", reward: { ac: [3, 7, 12] } },
    { t: "talk", who: "👨‍🏫", name: "先生", text: "「過去問は最初解けなくて当然。\n大事なのは『なぜ間違えたか』を分析すること。\n本番まで伸びますよ。」" },
    { t: "talk", who: "👦", name: "我が子", text: "「ライバルのあいつ、\n第一志望A判定出たらしい…\n僕はまだCなのに…」" },
    { t: "choice", text: "子供が不安でいっぱいだ", opts: [
      { label: "📊 一緒に弱点分析する", desc: "具体的な対策で安心", fx: { ac: 3, me: 5 } },
      { label: "🫂 「大丈夫。信じてる」と抱きしめる", desc: "心の支え", fx: { me: 12, mo: 5 } },
    ]},
  ]},
  // ═══ 小6 冬 ═══
  { season: "winter", year: 6, title: "小6・冬「いよいよ、その日」", emoji: "⛄", beats: [
    { t: "talk", who: "❄️", name: "", text: "1月。ついに受験シーズン。\n町中の掲示板に「合格祈願」の文字。\n家中がピリピリしている。" },
    { t: "minigame", game: "timing", title: "⚡ 直前ゼミ・最終調整", desc: "最後の追い込み！集中力を発揮せよ！", reward: { ac: [3, 6, 10] } },
    { t: "talk", who: "👫", name: "夫婦", text: "「…ここまでよくがんばったね、私たちも」\n「うん。あとは子供を信じよう」\n\n2人の間に、静かな覚悟がある。" },
    { t: "talk", who: "👦", name: "我が子（前夜）", text: "「明日、がんばるね。\n…怖いけど、がんばる。\nいっぱい応援してくれて、ありがとう。」" },
    { t: "talk", who: "🌙", name: "", text: "眠れない夜。\n明日の持ち物を何度も確認する。\n鉛筆、消しゴム、受験票…\n\nそして、3年間の想い。" },
  ]},
  ];
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */
export default function JukenQuest() {
  const [phase, setPhase] = useState("title"); // title, entrance_quiz, entrance_result, story, minigame_mash, minigame_balance, minigame_timing, minigame_quiz, exam_intro, exam_quiz, exam_result, ending
  const [muted, setMuted] = useState(false);
  const [blink, setBlink] = useState(true);

  // Stats
  const [stats, setStats] = useState({ ac: 40, mo: 70, st: 80, me: 75, ha: 80, an: 20 });
  // ac=academic, mo=motivation, st=stamina, me=mental, ha=harmony, an=anxiety

  // Entrance quiz
  const [eqQuizzes, setEqQuizzes] = useState([]);
  const [eqIndex, setEqIndex] = useState(0);
  const [eqCorrect, setEqCorrect] = useState(0);
  const [eqAnswered, setEqAnswered] = useState(false);
  const [eqResult, setEqResult] = useState(null);
  const [startClass, setStartClass] = useState("C");
  const [schoolName, setSchoolName] = useState("");

  // Story
  const [chapters, setChapters] = useState([]);
  const [chIdx, setChIdx] = useState(0);
  const [beatIdx, setBeatIdx] = useState(0);

  // Mini-game
  const [mgReward, setMgReward] = useState(null);
  const [mgResult, setMgResult] = useState(null);

  // Mash mini-game
  const [mashCount, setMashCount] = useState(0);
  const [mashActive, setMashActive] = useState(false);
  const [mashTimer, setMashTimer] = useState(5);
  const mashRef = useRef(null);
  const mashTimerRef = useRef(null);

  // Balance mini-game
  const [balPos, setBalPos] = useState(50);
  const [balScore, setBalScore] = useState(0);
  const [balActive, setBalActive] = useState(false);
  const [balTimer, setBalTimer] = useState(6);
  const balRef = useRef(null);
  const balTimerRef = useRef(null);

  // Timing mini-game
  const [timPos, setTimPos] = useState(0);
  const [timActive, setTimActive] = useState(false);
  const [timResults, setTimResults] = useState([]);
  const [timRound, setTimRound] = useState(0);
  const timRef = useRef(null);

  // Quiz mini-game
  const [mqQuizzes, setMqQuizzes] = useState([]);
  const [mqIndex, setMqIndex] = useState(0);
  const [mqCorrect, setMqCorrect] = useState(0);
  const [mqAnswered, setMqAnswered] = useState(false);

  // Exam
  const [examSchools, setExamSchools] = useState([]);
  const [examIdx, setExamIdx] = useState(0);
  const [examQuiz, setExamQuiz] = useState(null);
  const [examAnswered, setExamAnswered] = useState(false);
  const [examResults, setExamResults] = useState([]);
  const [examQList, setExamQList] = useState([]);
  const [examQIdx, setExamQIdx] = useState(0);
  const [examCorrectCount, setExamCorrectCount] = useState(0);
  // Dramatic reveal
  const [revealPhase, setRevealPhase] = useState(0); // 0=not started, 1-3=revealing each school
  const [revealStep, setRevealStep] = useState(0); // 0=building tension, 1=show result

  // Blink
  useEffect(() => { const t = setInterval(() => setBlink(b => !b), 600); return () => clearInterval(t); }, []);

  // Toggle mute
  const toggleMute = () => {
    const n = !muted; setMuted(n);
    Object.values(AU).forEach(a => { a.muted = n; });
  };

  // Apply stat effects
  const applyFx = useCallback((fx) => {
    setStats(s => ({
      ac: clamp((s.ac || 40) + (fx.ac || 0), 20, 100),
      mo: clamp((s.mo || 70) + (fx.mo || 0), 0, 100),
      st: clamp((s.st || 80) + (fx.st || 0), 0, 100),
      me: clamp((s.me || 75) + (fx.me || 0), 0, 100),
      ha: clamp((s.ha || 80) + (fx.ha || 0), 0, 100),
      an: clamp((s.an || 20) + (fx.an || 0), 0, 100),
    }));
  }, []);

  // ─── ENTRANCE QUIZ ───
  const startEntranceQuiz = () => {
    setEqQuizzes(pickQuizzes(5));
    setEqIndex(0); setEqCorrect(0); setEqAnswered(false); setEqResult(null);
    setPhase("entrance_quiz");
  };

  const answerEQ = (ci) => {
    if (eqAnswered) return;
    setEqAnswered(true);
    const correct = ci === eqQuizzes[eqIndex].a;
    if (correct) setEqCorrect(c => c + 1);
    setEqResult(correct);
    setTimeout(() => {
      if (eqIndex < 4) {
        setEqIndex(i => i + 1); setEqAnswered(false); setEqResult(null);
      } else {
        const total = (correct ? eqCorrect + 1 : eqCorrect);
        let cls, sn;
        if (total >= 5) { cls = "S"; sn = "SAFIX"; }
        else if (total >= 4) { cls = "A"; sn = "SAFIX"; }
        else if (total >= 3) { cls = "B"; sn = "四谷大砲"; }
        else if (total >= 2) { cls = "C"; sn = "日能験"; }
        else { cls = "D"; sn = "日能験"; }
        setStartClass(cls);
        setSchoolName(sn);
        setStats({ ac: 30 + total * 6, mo: 70, st: 80, me: 75, ha: 80, an: 20 });
        setPhase("entrance_result");
      }
    }, 1200);
  };

  // ─── STORY ───
  const startStory = () => {
    const ch = buildStory();
    setChapters(ch); setChIdx(0); setBeatIdx(0);
    playBGM("bgm");
    setPhase("story");
  };

  const currentBeat = () => {
    if (!chapters.length || chIdx >= chapters.length) return null;
    const ch = chapters[chIdx];
    if (beatIdx >= ch.beats.length) return null;
    return ch.beats[beatIdx];
  };

  const advanceBeat = () => {
    const ch = chapters[chIdx];
    if (beatIdx + 1 < ch.beats.length) {
      setBeatIdx(beatIdx + 1);
    } else if (chIdx + 1 < chapters.length) {
      setChIdx(chIdx + 1); setBeatIdx(0);
    } else {
      // Story done → exam
      startExam();
    }
  };

  const handleChoice = (opt) => {
    if (opt.fx) applyFx(opt.fx);
    advanceBeat();
  };

  const handleBeatTap = () => {
    const b = currentBeat();
    if (!b) return;
    if (b.t === "talk" || b.t === "event") {
      if (b.fx) applyFx(b.fx);
      advanceBeat();
    }
  };

  // Start a mini-game from story
  const startMinigameFromBeat = (beat) => {
    setMgReward(beat.reward);
    setMgResult(null);
    if (beat.game === "mash") {
      setMashCount(0); setMashActive(false); setMashTimer(5);
      setPhase("minigame_mash");
    } else if (beat.game === "balance") {
      setBalPos(50); setBalScore(0); setBalActive(false); setBalTimer(6);
      setPhase("minigame_balance");
    } else if (beat.game === "timing") {
      setTimPos(0); setTimActive(false); setTimResults([]); setTimRound(0);
      setPhase("minigame_timing");
    } else if (beat.game === "quiz") {
      setMqQuizzes(pickQuizzes(3)); setMqIndex(0); setMqCorrect(0); setMqAnswered(false);
      setPhase("minigame_quiz");
    }
  };

  // ─── MASH MINI-GAME ───
  const startMash = () => {
    setMashCount(0); setMashActive(true); setMashTimer(5);
    mashTimerRef.current = setInterval(() => {
      setMashTimer(t => {
        if (t <= 1) { clearInterval(mashTimerRef.current); setMashActive(false); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const doMash = () => { if (mashActive) setMashCount(c => c + 1); };

  useEffect(() => {
    if (phase === "minigame_mash" && !mashActive && mashTimer === 0) {
      const grade = mashCount >= 35 ? 2 : mashCount >= 20 ? 1 : 0;
      const reward = mgReward?.ac?.[grade] || 3;
      setMgResult({ grade, count: mashCount, reward });
      applyFx({ ac: reward });
    }
  }, [mashActive, mashTimer]);

  // ─── BALANCE MINI-GAME ───
  const startBalance = () => {
    setBalPos(50); setBalScore(0); setBalActive(true); setBalTimer(6);
    let drift = (Math.random() > 0.5 ? 1 : -1) * 2;
    balRef.current = setInterval(() => {
      setBalPos(p => {
        const np = clamp(p + drift + (Math.random() - 0.5) * 3, 0, 100);
        if (np <= 5 || np >= 95) drift = -drift;
        const center = Math.abs(np - 50);
        if (center < 15) setBalScore(s => s + 1);
        return np;
      });
    }, 100);
    balTimerRef.current = setInterval(() => {
      setBalTimer(t => {
        if (t <= 1) { clearInterval(balRef.current); clearInterval(balTimerRef.current); setBalActive(false); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const nudgeBalance = (dir) => { if (balActive) setBalPos(p => clamp(p + dir * 8, 0, 100)); };

  useEffect(() => {
    if (phase === "minigame_balance" && !balActive && balTimer === 0) {
      const grade = balScore >= 40 ? 2 : balScore >= 20 ? 1 : 0;
      const reward = mgReward?.ac?.[grade] || 3;
      setMgResult({ grade, score: balScore, reward });
      applyFx({ ac: reward });
    }
  }, [balActive, balTimer]);

  // ─── TIMING MINI-GAME ───
  const startTiming = () => {
    setTimResults([]); setTimRound(0); setTimActive(true);
    setTimPos(0);
    runTimingRound();
  };

  const runTimingRound = () => {
    setTimPos(0); setTimActive(true);
    if (timRef.current) cancelAnimationFrame(timRef.current);
    let pos = 0;
    const speed = 2.5;
    const animate = () => {
      pos += speed;
      if (pos > 100) pos = 0;
      setTimPos(pos);
      timRef.current = requestAnimationFrame(animate);
    };
    timRef.current = requestAnimationFrame(animate);
  };

  const tapTiming = () => {
    if (!timActive) return;
    cancelAnimationFrame(timRef.current);
    setTimActive(false);
    const dist = Math.abs(timPos - 50);
    const hit = dist < 8 ? "perfect" : dist < 18 ? "good" : "miss";
    const newResults = [...timResults, hit];
    setTimResults(newResults);
    if (newResults.length < 3) {
      setTimeout(() => {
        setTimRound(r => r + 1);
        runTimingRound();
      }, 800);
    } else {
      const perfects = newResults.filter(r => r === "perfect").length;
      const goods = newResults.filter(r => r === "good").length;
      const grade = perfects >= 2 ? 2 : (perfects + goods) >= 2 ? 1 : 0;
      const reward = mgReward?.ac?.[grade] || 3;
      setTimeout(() => {
        setMgResult({ grade, results: newResults, reward });
        applyFx({ ac: reward });
      }, 500);
    }
  };

  // ─── QUIZ MINI-GAME ───
  const answerMQ = (ci) => {
    if (mqAnswered) return;
    setMqAnswered(true);
    const correct = ci === mqQuizzes[mqIndex].a;
    if (correct) setMqCorrect(c => c + 1);
    setTimeout(() => {
      if (mqIndex < 2) {
        setMqIndex(i => i + 1); setMqAnswered(false);
      } else {
        const total = correct ? mqCorrect + 1 : mqCorrect;
        const grade = total >= 3 ? 2 : total >= 2 ? 1 : 0;
        const reward = mgReward?.ac?.[grade] || 3;
        setMgResult({ grade, correct: total, reward });
        applyFx({ ac: reward });
      }
    }, 800);
  };

  const finishMinigame = () => {
    setPhase("story");
    advanceBeat();
  };

  // ─── EXAM ───
  const startExam = () => {
    playBGM("quiz");
    const rank = stats.ac >= 70 ? "S" : stats.ac >= 60 ? "A" : stats.ac >= 50 ? "B" : stats.ac >= 40 ? "C" : "D";
    const ranks = ["S","A","B","C","D"];
    const ri = ranks.indexOf(rank);
    const challengeR = ranks[Math.max(0, ri - 1)];
    const safeR = ranks[Math.min(4, ri + 1)];
    // Pick unique schools (no duplicates)
    const usedNames = new Set();
    const pickSchool = (r) => {
      const pool = SCHOOLS[r].filter(s => !usedNames.has(s.name));
      if (!pool.length) return SCHOOLS[r][0]; // fallback
      const s = pool[Math.floor(Math.random() * pool.length)];
      usedNames.add(s.name);
      return s;
    };
    const schools = [
      { ...pickSchool(challengeR), rank: challengeR, type: "チャレンジ校" },
      { ...pickSchool(rank), rank, type: "本命校" },
      { ...pickSchool(safeR), rank: safeR, type: "安全校" },
    ];
    setExamSchools(schools);
    setExamIdx(0); setExamResults([]); setExamAnswered(false);
    setExamQList([]); setExamQIdx(0); setExamCorrectCount(0);
    setPhase("exam_intro");
  };

  const startExamRound = (idx) => {
    // 5 questions per school
    const qs = pickQuizzes(5);
    setExamQList(qs);
    setExamQIdx(0);
    setExamCorrectCount(0);
    setExamIdx(idx); setExamAnswered(false);
    setPhase("exam_quiz");
  };

  const answerExam = (ci) => {
    if (examAnswered) return;
    setExamAnswered(true);
    const q = examQList[examQIdx];
    const correct = ci === q.a;
    const newCorrect = examCorrectCount + (correct ? 1 : 0);
    setExamCorrectCount(newCorrect);

    setTimeout(() => {
      if (examQIdx + 1 < examQList.length) {
        // Next question in same school
        setExamQIdx(examQIdx + 1);
        setExamAnswered(false);
      } else {
        // Done with this school - calculate result
        const school = examSchools[examIdx];
        let prob = 0.4 + (stats.ac - school.dev) * 0.025 + (stats.me - 50) * 0.003 + (stats.mo - 50) * 0.003;
        // Quiz bonus: each correct answer adds 6%
        prob += newCorrect * 0.06;
        prob = clamp(prob, 0.05, 0.95);
        const passed = Math.random() < prob;
        const res = { school, passed, correct: newCorrect, total: examQList.length, prob: Math.round(prob * 100) };
        const newR = [...examResults, res];
        setExamResults(newR);
        setPhase("exam_result");
      }
    }, 800);
  };

  const nextExamOrEnd = () => {
    if (examResults.length < 3) startExamRound(examResults.length);
    else { playBGM("ending", false); setRevealPhase(1); setRevealStep(0); setPhase("ending"); }
  };

  // ─── RESTART ───
  const restart = () => {
    stopAll();
    resetUsedQuizzes();
    setPhase("title"); setStats({ ac: 40, mo: 70, st: 80, me: 75, ha: 80, an: 20 });
    setChIdx(0); setBeatIdx(0); setExamResults([]); setRevealPhase(0); setRevealStep(0);
  };

  /* ════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════ */

  const W = { width: "100%", maxWidth: 420, margin: "0 auto" };
  const Panel = ({ children, style = {} }) => (
    <div style={{ background: "#252550", border: "3px solid #3a3a6a", borderRadius: 2, padding: 12, margin: "8px 0", boxShadow: "4px 4px 0 #1a1a2e", ...style }}>{children}</div>
  );
  const Btn = ({ children, color = "#3498db", onClick, disabled, style = {} }) => (
    <div onClick={disabled ? null : onClick} style={{
      fontFamily: "'DotGothic16', monospace", fontSize: 13, padding: "10px 14px",
      background: disabled ? "#333" : color, color: disabled ? "#666" : "#fff",
      border: `3px solid ${disabled ? "#222" : dk(color)}`, borderRadius: 2,
      cursor: disabled ? "not-allowed" : "pointer", textAlign: "center",
      boxShadow: disabled ? "none" : `3px 3px 0 ${dk(color)}`,
      textShadow: disabled ? "none" : `1px 1px 0 ${dk(color)}`,
      transition: "all 0.1s", ...style,
    }}>{children}</div>
  );
  const Bar = ({ value, color, label }) => (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#999" }}>
        <span>{label}</span><span style={{ color }}>{Math.round(value)}</span>
      </div>
      <div style={{ height: 8, background: "#1a1a30", border: "1px solid #3a3a5a", borderRadius: 1, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${clamp(value, 0, 100)}%`, background: color, transition: "width 0.5s" }} />
      </div>
    </div>
  );

  const Header = ({ right }) => (
    <div style={{ background: "linear-gradient(90deg, #c0392b, #e74c3c)", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px solid #922b21" }}>
      <span style={{ fontFamily: "'Press Start 2P'", fontSize: 9, color: "#fff", textShadow: "2px 2px 0 #922b21" }}>中受クエスト</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "#fdd" }}>{right}</span>
        <span onClick={toggleMute} style={{ cursor: "pointer", fontSize: 13 }}>{muted ? "🔇" : "🔊"}</span>
      </div>
    </div>
  );

  // ─── TITLE ───
  if (phase === "title") return (
    <div style={{ fontFamily: "'DotGothic16'", background: "radial-gradient(ellipse at center, #2a1a3e, #1a1a2e 70%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ ...W, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>📚</div>
        <h1 style={{ fontFamily: "'Press Start 2P'", fontSize: 18, color: "#f1c40f", textShadow: "3px 3px 0 #7d6608", marginBottom: 8, lineHeight: 2 }}>中受クエスト</h1>
        <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.8, marginBottom: 4 }}>─ 我が子を合格に導け ─</p>
        <p style={{ fontSize: 10, color: "#666", lineHeight: 1.8, marginBottom: 32 }}>小4〜小6の3年間、塾通い・家庭のバランスを取り<br/>中学受験合格を目指すテキストシミュレーション</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
          {["📖","✏️","🏫","🎒","💯"].map((e,i) => <span key={i} style={{ fontSize: 26, animation: `bounce 1s ease infinite ${i*0.15}s` }}>{e}</span>)}
        </div>
        <Btn color="#e74c3c" onClick={startEntranceQuiz} style={{ maxWidth: 240, margin: "0 auto", fontSize: 15, padding: 14 }}>
          {blink ? "▶ はじめる" : "▶ はじめる "}
        </Btn>
        <p style={{ fontSize: 8, color: "#333", marginTop: 24 }}>© 2026 Paul</p>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  );

  // ─── ENTRANCE QUIZ ───
  if (phase === "entrance_quiz") {
    const q = eqQuizzes[eqIndex];
    return (
      <div style={{ fontFamily: "'DotGothic16'", background: "#1a1a2e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={W}>
          <Header right={`入塾テスト ${eqIndex + 1}/5`} />
          <div style={{ background: "#1e1e3a", border: "4px solid #4a4a6a", padding: 16, textAlign: "center" }}>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 9, color: "#f1c40f", marginBottom: 12 }}>📝 入塾テスト</div>
            <p style={{ fontSize: 10, color: "#888", marginBottom: 12 }}>この結果で最初のクラスが決まる！</p>

            <Panel>
              <p style={{ fontSize: 14, color: "#eee", lineHeight: 1.8, marginBottom: 16 }}>{q.q}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.c.map((c, ci) => (
                  <div key={ci} onClick={() => answerEQ(ci)} style={{
                    background: eqAnswered ? (ci === q.a ? "#1a4a1a" : eqResult === false && ci !== q.a ? "#1a1a30" : "#1a1a30") : "#2a2a50",
                    border: `2px solid ${eqAnswered && ci === q.a ? "#2ecc71" : "#4a4a7a"}`,
                    borderRadius: 2, padding: "10px 12px", cursor: eqAnswered ? "default" : "pointer",
                    fontSize: 13, color: "#eee", transition: "all 0.2s",
                  }}>
                    {["ア","イ","ウ"][ci]}. {c} {eqAnswered && ci === q.a && " ✓"}
                  </div>
                ))}
              </div>
            </Panel>

            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 12 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ width: 28, height: 6, borderRadius: 3, background: i < eqIndex ? "#2ecc71" : i === eqIndex ? "#f1c40f" : "#333" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── ENTRANCE RESULT ───
  if (phase === "entrance_result") return (
    <div style={{ fontFamily: "'DotGothic16'", background: "#1a1a2e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={W}>
        <Header right="入塾結果" />
        <div style={{ background: "#1e1e3a", border: "4px solid #4a4a6a", padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏫</div>
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: "#f1c40f", marginBottom: 8, lineHeight: 1.8 }}>
            入塾テスト結果
          </div>
          <div style={{ fontSize: 22, color: "#2ecc71", marginBottom: 8 }}>{eqCorrect} / 5 正解</div>
          <Panel>
            <div style={{ fontSize: 14, lineHeight: 2, color: "#eee" }}>
              <div>🏫 塾: <span style={{ color: "#3498db" }}>{schoolName}</span></div>
              <div>📚 配属クラス: <span style={{ color: "#f1c40f", fontSize: 20 }}>{startClass}</span>クラス</div>
            </div>
          </Panel>
          <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.7, margin: "12px 0" }}>
            {startClass === "S" || startClass === "A"
              ? "優秀な成績！ハイレベルなクラスからスタートだ。"
              : startClass === "B"
                ? "なかなかの結果。ここからの伸び次第で上位も狙える。"
                : "まだまだこれから。伸びしろたっぷりだ！"}
          </p>
          <Btn color="#2ecc71" onClick={startStory}>3年間の旅が始まる ▶</Btn>
        </div>
      </div>
    </div>
  );

  // ─── STORY ───
  if (phase === "story") {
    if (chIdx >= chapters.length) { startExam(); return null; }
    const ch = chapters[chIdx];
    const beat = currentBeat();
    if (!beat) { advanceBeat(); return null; }

    const sColor = SEASON_COLOR[ch.season] || "#aaa";

    // Mini-game beat → auto-start
    if (beat.t === "minigame") {
      return (
        <div style={{ fontFamily: "'DotGothic16'", background: SEASON_BG[ch.season], minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={W}>
            <Header right={ch.title} />
            <div style={{ background: "#1e1e3a", border: "4px solid #4a4a6a", padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{ch.emoji}</div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: sColor, marginBottom: 12, lineHeight: 1.8 }}>
                {beat.title}
              </div>
              <p style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>{beat.desc}</p>
              <Btn color="#e67e22" onClick={() => startMinigameFromBeat(beat)}>挑戦する！</Btn>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ fontFamily: "'DotGothic16'", background: SEASON_BG[ch.season], minHeight: "100vh", display: "flex", flexDirection: "column", padding: 8 }}>
        <div style={{ ...W, flex: 1, display: "flex", flexDirection: "column" }}>
          <Header right={ch.title} />
          <div style={{ background: "#1e1e3a", border: "4px solid #4a4a6a", flex: 1, display: "flex", flexDirection: "column" }}>

            {/* Season title bar */}
            <div style={{ background: `${sColor}22`, borderBottom: `2px solid ${sColor}44`, padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: sColor }}>{ch.emoji} 小{ch.year}</span>
              <span style={{ fontSize: 10, color: "#888" }}>学力 <span style={{ color: "#3498db" }}>{Math.round(stats.ac)}</span> やる気 <span style={{ color: "#2ecc71" }}>{Math.round(stats.mo)}</span></span>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: 12, display: "flex", flexDirection: "column", justifyContent: "center" }}>

              {/* Talk / Event */}
              {(beat.t === "talk" || beat.t === "event") && (
                <div onClick={handleBeatTap} style={{ cursor: "pointer", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  {beat.who && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 32 }}>{beat.who}</span>
                      {beat.name && <span style={{ fontSize: 12, color: sColor }}>{beat.name}</span>}
                    </div>
                  )}
                  <Panel style={{ background: "#1a1a35" }}>
                    <p style={{ fontSize: 14, lineHeight: 2, color: "#eee", whiteSpace: "pre-line" }}>{beat.text}</p>
                  </Panel>
                  <p style={{ fontSize: 10, color: "#555", textAlign: "center", marginTop: 12, animation: "pulse 1.5s infinite" }}>
                    ▼ タップして次へ
                  </p>
                </div>
              )}

              {/* Choice */}
              {beat.t === "choice" && (
                <div>
                  <Panel style={{ background: "#1a2a1a", border: "3px solid #4a6a4a" }}>
                    <p style={{ fontSize: 13, color: "#f1c40f", lineHeight: 1.8, marginBottom: 12 }}>
                      {beat.text}
                    </p>
                  </Panel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {beat.opts.map((o, i) => (
                      <div key={i} onClick={() => handleChoice(o)} style={{
                        background: "#252550", border: "3px solid #4a4a7a", borderRadius: 2,
                        padding: "12px", cursor: "pointer", transition: "all 0.15s",
                      }}>
                        <div style={{ fontSize: 14, color: "#eee" }}>{o.label}</div>
                        <div style={{ fontSize: 10, color: "#888", marginTop: 3 }}>{o.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats footer */}
            <div style={{ padding: "8px 12px", background: "#151530", borderTop: "2px solid #2a2a4a" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, fontSize: 9 }}>
                <Bar label="📖 学力" value={stats.ac} color="#3498db" />
                <Bar label="🔥 やる気" value={stats.mo} color="#2ecc71" />
                <Bar label="🧠 メンタル" value={stats.me} color="#9b59b6" />
              </div>
            </div>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:0.8} }`}</style>
      </div>
    );
  }

  // ─── MASH MINI-GAME ───
  if (phase === "minigame_mash") return (
    <div style={{ fontFamily: "'DotGothic16'", background: "#1a1a2e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={W}>
        <Header right="ミニゲーム" />
        <div style={{ background: "#1e1e3a", border: "4px solid #4a4a6a", padding: 20, textAlign: "center" }}>
          {!mashActive && mashTimer === 5 && !mgResult && (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👊</div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: "#e67e22", marginBottom: 12 }}>連打チャレンジ！</div>
              <p style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>5秒間でとにかくタップ（クリック）！<br/>がんばった分だけ学力UP！</p>
              <Btn color="#e67e22" onClick={startMash}>スタート！</Btn>
            </>
          )}
          {mashActive && (
            <>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 28, color: "#f1c40f", marginBottom: 8 }}>{mashTimer}</div>
              <div style={{ fontSize: 64, marginBottom: 8 }}>{mashCount < 15 ? "😐" : mashCount < 30 ? "😤" : "🔥"}</div>
              <div style={{ fontSize: 36, color: "#f1c40f", marginBottom: 16 }}>{mashCount}</div>
              <div onClick={doMash} style={{
                background: "#e67e22", color: "#fff", fontSize: 18, padding: "30px 20px",
                borderRadius: 4, cursor: "pointer", border: "4px solid #a05a00",
                boxShadow: "5px 5px 0 #7a4400", userSelect: "none",
                transition: "transform 0.05s",
              }}>
                👊 連打！！
              </div>
            </>
          )}
          {mgResult && (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{mgResult.grade === 2 ? "🏆" : mgResult.grade === 1 ? "👏" : "😅"}</div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 11, color: mgResult.grade === 2 ? "#f1c40f" : mgResult.grade === 1 ? "#2ecc71" : "#888", marginBottom: 8, lineHeight: 1.8 }}>
                {mgResult.grade === 2 ? "すばらしい！！" : mgResult.grade === 1 ? "がんばった！" : "もうひと踏ん張り…"}
              </div>
              <p style={{ fontSize: 13, color: "#aaa" }}>{mgResult.count}回タップ</p>
              <p style={{ fontSize: 14, color: "#2ecc71", margin: "8px 0" }}>学力 +{mgResult.reward}！</p>
              <Btn color="#3498db" onClick={finishMinigame}>次へ ▶</Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ─── BALANCE MINI-GAME ───
  if (phase === "minigame_balance") return (
    <div style={{ fontFamily: "'DotGothic16'", background: "#1a1a2e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={W}>
        <Header right="ミニゲーム" />
        <div style={{ background: "#1e1e3a", border: "4px solid #4a4a6a", padding: 20, textAlign: "center" }}>
          {!balActive && balTimer === 6 && !mgResult && (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚖️</div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: "#9b59b6", marginBottom: 12 }}>集中力キープ！</div>
              <p style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>バーが中央から離れないように<br/>左右ボタンで調整！6秒間耐えろ！</p>
              <Btn color="#9b59b6" onClick={startBalance}>スタート！</Btn>
            </>
          )}
          {balActive && (
            <>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 24, color: "#f1c40f", marginBottom: 12 }}>{balTimer}</div>
              <div style={{ position: "relative", height: 40, background: "#1a1a30", border: "2px solid #3a3a5a", borderRadius: 4, margin: "12px 0", overflow: "hidden" }}>
                {/* Center zone */}
                <div style={{ position: "absolute", left: "35%", width: "30%", height: "100%", background: "#2ecc7133", borderLeft: "2px dashed #2ecc71", borderRight: "2px dashed #2ecc71" }} />
                {/* Ball */}
                <div style={{ position: "absolute", left: `${balPos}%`, top: "50%", transform: "translate(-50%, -50%)", width: 20, height: 20, borderRadius: "50%", background: Math.abs(balPos - 50) < 15 ? "#2ecc71" : "#e74c3c", transition: "left 0.1s, background 0.2s", boxShadow: "0 0 8px rgba(255,255,255,0.3)" }} />
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <div onClick={() => nudgeBalance(-1)} style={{
                  background: "#3498db", color: "#fff", fontSize: 22, padding: "16px 28px",
                  borderRadius: 4, cursor: "pointer", border: "3px solid #2471a3", userSelect: "none",
                }}>◀</div>
                <div onClick={() => nudgeBalance(1)} style={{
                  background: "#3498db", color: "#fff", fontSize: 22, padding: "16px 28px",
                  borderRadius: 4, cursor: "pointer", border: "3px solid #2471a3", userSelect: "none",
                }}>▶</div>
              </div>
            </>
          )}
          {mgResult && (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{mgResult.grade === 2 ? "🏆" : mgResult.grade === 1 ? "👏" : "😅"}</div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 11, color: mgResult.grade === 2 ? "#f1c40f" : "#2ecc71", marginBottom: 8, lineHeight: 1.8 }}>
                {mgResult.grade === 2 ? "完璧な集中力！" : mgResult.grade === 1 ? "なかなか！" : "集中が切れた…"}
              </div>
              <p style={{ fontSize: 14, color: "#2ecc71", margin: "8px 0" }}>学力 +{mgResult.reward}！</p>
              <Btn color="#3498db" onClick={finishMinigame}>次へ ▶</Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ─── TIMING MINI-GAME ───
  if (phase === "minigame_timing") return (
    <div style={{ fontFamily: "'DotGothic16'", background: "#1a1a2e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={W}>
        <Header right="ミニゲーム" />
        <div style={{ background: "#1e1e3a", border: "4px solid #4a4a6a", padding: 20, textAlign: "center" }}>
          {!timActive && timResults.length === 0 && !mgResult && (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: "#e74c3c", marginBottom: 12 }}>タイミングチャレンジ！</div>
              <p style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>バーが中央に来た瞬間にタップ！<br/>3回チャレンジ！</p>
              <Btn color="#e74c3c" onClick={startTiming}>スタート！</Btn>
            </>
          )}
          {(timActive || (timResults.length > 0 && timResults.length < 3 && !mgResult)) && (
            <>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>ラウンド {timResults.length + 1} / 3</div>
              {/* Results so far */}
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
                {timResults.map((r, i) => (
                  <span key={i} style={{ fontSize: 12, color: r === "perfect" ? "#f1c40f" : r === "good" ? "#2ecc71" : "#e74c3c" }}>
                    {r === "perfect" ? "★" : r === "good" ? "○" : "✗"}
                  </span>
                ))}
              </div>
              {/* Timing bar */}
              <div style={{ position: "relative", height: 30, background: "#1a1a30", border: "2px solid #3a3a5a", borderRadius: 4, margin: "12px 0", overflow: "hidden" }}>
                {/* Target zone */}
                <div style={{ position: "absolute", left: "42%", width: "16%", height: "100%", background: "#f1c40f33", borderLeft: "2px solid #f1c40f", borderRight: "2px solid #f1c40f" }} />
                {/* Moving bar */}
                {timActive && <div style={{ position: "absolute", left: `${timPos}%`, top: 0, width: 4, height: "100%", background: "#e74c3c", boxShadow: "0 0 6px #e74c3c" }} />}
              </div>
              {timActive ? (
                <div onClick={tapTiming} style={{
                  background: "#e74c3c", color: "#fff", fontSize: 16, padding: "20px",
                  borderRadius: 4, cursor: "pointer", border: "3px solid #922b21", userSelect: "none",
                }}>
                  🎯 タップ！
                </div>
              ) : (
                <div style={{ fontSize: 18, color: timResults[timResults.length-1] === "perfect" ? "#f1c40f" : timResults[timResults.length-1] === "good" ? "#2ecc71" : "#e74c3c", marginTop: 8 }}>
                  {timResults[timResults.length-1] === "perfect" ? "★ PERFECT!" : timResults[timResults.length-1] === "good" ? "○ GOOD!" : "✗ MISS..."}
                </div>
              )}
            </>
          )}
          {mgResult && (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{mgResult.grade === 2 ? "🏆" : mgResult.grade === 1 ? "👏" : "😅"}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                {mgResult.results.map((r, i) => (
                  <span key={i} style={{ fontSize: 16, color: r === "perfect" ? "#f1c40f" : r === "good" ? "#2ecc71" : "#e74c3c" }}>
                    {r === "perfect" ? "★PERFECT" : r === "good" ? "○GOOD" : "✗MISS"}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 14, color: "#2ecc71", margin: "8px 0" }}>学力 +{mgResult.reward}！</p>
              <Btn color="#3498db" onClick={finishMinigame}>次へ ▶</Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ─── QUIZ MINI-GAME ───
  if (phase === "minigame_quiz") {
    if (mgResult) return (
      <div style={{ fontFamily: "'DotGothic16'", background: "#1a1a2e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={W}>
          <Header right="模試結果" />
          <div style={{ background: "#1e1e3a", border: "4px solid #4a4a6a", padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{mgResult.grade === 2 ? "🏆" : mgResult.grade === 1 ? "📈" : "📉"}</div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: mgResult.grade === 2 ? "#f1c40f" : "#2ecc71", marginBottom: 8, lineHeight: 1.8 }}>
              {mgResult.correct}/3 正解！
            </div>
            <p style={{ fontSize: 14, color: "#2ecc71", margin: "8px 0" }}>学力 +{mgResult.reward}！</p>
            <Btn color="#3498db" onClick={finishMinigame}>次へ ▶</Btn>
          </div>
        </div>
      </div>
    );
    const q = mqQuizzes[mqIndex];
    return (
      <div style={{ fontFamily: "'DotGothic16'", background: "#1a1a2e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={W}>
          <Header right={`模試 ${mqIndex+1}/3`} />
          <div style={{ background: "#1e1e3a", border: "4px solid #4a4a6a", padding: 16, textAlign: "center" }}>
            <Panel>
              <p style={{ fontSize: 14, color: "#eee", lineHeight: 1.8, marginBottom: 16 }}>{q.q}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.c.map((c, ci) => (
                  <div key={ci} onClick={() => answerMQ(ci)} style={{
                    background: mqAnswered ? (ci === q.a ? "#1a4a1a" : "#1a1a30") : "#2a2a50",
                    border: `2px solid ${mqAnswered && ci === q.a ? "#2ecc71" : "#4a4a7a"}`,
                    borderRadius: 2, padding: "10px 12px", cursor: mqAnswered ? "default" : "pointer", fontSize: 13, color: "#eee",
                  }}>
                    {["ア","イ","ウ"][ci]}. {c} {mqAnswered && ci === q.a && " ✓"}
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    );
  }

  // ─── EXAM INTRO ───
  if (phase === "exam_intro") return (
    <div style={{ fontFamily: "'DotGothic16'", background: "linear-gradient(180deg, #3a1a1a, #1a1a2e)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={W}>
        <Header right="🎌 受験本番" />
        <div style={{ background: "#1e1e3a", border: "4px solid #4a4a6a", padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏫</div>
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: 12, color: "#e74c3c", marginBottom: 12, lineHeight: 2, textShadow: "2px 2px 0 #5a1a1a" }}>
            ─ 二月の決戦 ─
          </div>
          <p style={{ fontSize: 12, color: "#ddd", lineHeight: 1.8, marginBottom: 16 }}>
            3年間の集大成。3校を受験する。<br/>各校で入試クイズが出題。<br/>正解で合格率UP！
          </p>
          <Panel style={{ textAlign: "left" }}>
            {examSchools.map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 2 ? "1px solid #3a3a5a" : "none", fontSize: 12 }}>
                <span><span style={{ color: "#888" }}>2月{i+1}日</span> <span style={{ color: "#f1c40f", marginLeft: 8 }}>{s.name}</span> <span style={{ color: "#666", fontSize: 10 }}>({s.type})</span></span>
                <span style={{ color: "#3498db" }}>偏差値{s.dev}</span>
              </div>
            ))}
          </Panel>
          <p style={{ fontSize: 11, color: "#888", marginTop: 8 }}>実力: 学力{Math.round(stats.ac)} (偏差値約{Math.round(stats.ac * 0.7 + 25)})</p>
          <Btn color="#e74c3c" onClick={() => startExamRound(0)} style={{ marginTop: 12 }}>受験開始 ▶</Btn>
        </div>
      </div>
    </div>
  );

  // ─── EXAM QUIZ ───
  if (phase === "exam_quiz" && examQList.length > 0) {
    const school = examSchools[examIdx];
    const q = examQList[examQIdx];
    return (
      <div style={{ fontFamily: "'DotGothic16'", background: "#1a1a2e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={W}>
          <Header right={`${school.name} 入試`} />
          <div style={{ background: "#1e1e3a", border: "4px solid #4a4a6a", padding: 16, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888", marginBottom: 8, padding: "0 4px" }}>
              <span>{school.type} ─ 偏差値{school.dev}</span>
              <span>第{examQIdx + 1}問 / {examQList.length}</span>
            </div>
            {/* Progress dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 12 }}>
              {examQList.map((_, i) => (
                <div key={i} style={{ width: 18, height: 5, borderRadius: 2, background: i < examQIdx ? "#2ecc71" : i === examQIdx ? "#f1c40f" : "#333" }} />
              ))}
            </div>
            <Panel style={{ background: "#1a2a3a", border: "3px solid #3498db" }}>
              <div style={{ fontSize: 10, color: "#3498db", marginBottom: 8 }}>📝 入試問題</div>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "#eee", marginBottom: 16 }}>{q.q}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.c.map((c, ci) => (
                  <div key={ci} onClick={() => answerExam(ci)} style={{
                    background: examAnswered ? (ci === q.a ? "#1a4a1a" : "#1a1a30") : "#252550",
                    border: `2px solid ${examAnswered && ci === q.a ? "#2ecc71" : "#4a4a7a"}`,
                    borderRadius: 2, padding: "10px 12px", cursor: examAnswered ? "default" : "pointer", fontSize: 13, color: "#eee",
                  }}>
                    {["ア","イ","ウ"][ci]}. {c} {examAnswered && ci === q.a && " ✓"}
                  </div>
                ))}
              </div>
            </Panel>
            <div style={{ fontSize: 10, color: "#666", marginTop: 8 }}>
              正解数: {examCorrectCount} / {examQIdx + (examAnswered ? 1 : 0)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── EXAM RESULT ───
  if (phase === "exam_result" && examResults.length > 0) {
    const r = examResults[examResults.length - 1];
    return (
      <div style={{ fontFamily: "'DotGothic16'", background: "#1a1a2e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={W}>
          <Header right="試験終了" />
          <div style={{ background: "#1e1e3a", border: "4px solid #4a4a6a", padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: "#f1c40f", marginBottom: 12, lineHeight: 1.8 }}>
              {r.school.name} 試験終了
            </div>
            <Panel style={{ textAlign: "left", fontSize: 12, lineHeight: 2 }}>
              <div>正解数: <span style={{ color: "#2ecc71" }}>{r.correct}</span> / {r.total}</div>
              <div>合格率: <span style={{ color: "#f1c40f" }}>{r.prob}%</span></div>
            </Panel>
            <p style={{ fontSize: 11, color: "#888", margin: "12px 0" }}>
              結果は…最後にまとめて発表！
            </p>
            <Btn color="#3498db" onClick={nextExamOrEnd}>
              {examResults.length < 3 ? "次の学校の入試へ ▶" : "合格発表へ ▶"}
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  // ─── ENDING: DRAMATIC REVEAL ───
  if (phase === "ending") {
    const passed = examResults.filter(r => r.passed);
    const best = [...passed].sort((a,b) => b.school.dev - a.school.dev)[0];
    const allFail = !passed.length;

    // Reveal each school one by one
    if (revealPhase <= 3 && revealPhase >= 1) {
      const idx = revealPhase - 1;
      const r = examResults[idx];
      if (!r) { setRevealPhase(4); return null; }

      // Step 0: building tension
      if (revealStep === 0) {
        return (
          <div style={{ fontFamily: "'DotGothic16'", background: "radial-gradient(ellipse at center, #2a1a2a, #0a0a1e 70%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={W}>
              <div style={{ background: "#1e1e3a", border: "4px solid #4a4a6a", padding: 28, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>合格発表 ─ {idx + 1}校目</div>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏫</div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 11, color: "#f1c40f", marginBottom: 8, lineHeight: 2 }}>
                  {r.school.name}
                </div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{r.school.type} ─ 偏差値{r.school.dev}</div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 20 }}>正解数: {r.correct}/{r.total}</div>

                <div style={{ fontSize: 13, color: "#aaa", lineHeight: 2, marginBottom: 20 }}>
                  {idx === 0 && "掲示板の前。\n人混みをかき分けて、番号を探す…"}
                  {idx === 1 && "2校目の発表。\n震える手でスマホの合否照会を開く…"}
                  {idx === 2 && "最後の学校。\n家族全員が画面を見つめている…"}
                </div>

                <p style={{ fontSize: 12, color: "#666", animation: "pulse 1.5s infinite" }}>…</p>

                <Btn color="#e74c3c" onClick={() => setRevealStep(1)} style={{ marginTop: 16 }}>
                  結果を見る
                </Btn>
              </div>
            </div>
            <style>{`@keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
          </div>
        );
      }

      // Step 1: show result
      return (
        <div style={{ fontFamily: "'DotGothic16'", background: r.passed ? "radial-gradient(ellipse at center, #1a3a1a, #0a0a1e 70%)" : "radial-gradient(ellipse at center, #3a1a1a, #0a0a1e 70%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={W}>
            <div style={{ background: "#1e1e3a", border: `4px solid ${r.passed ? "#2ecc71" : "#e74c3c"}`, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>{r.passed ? "🌸" : "😢"}</div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 18, color: r.passed ? "#2ecc71" : "#e74c3c", marginBottom: 8, textShadow: `2px 2px 0 ${r.passed ? "#1a5a1a" : "#5a1a1a"}`, lineHeight: 2 }}>
                {r.passed ? "合　格！" : "不合格…"}
              </div>
              <div style={{ fontSize: 14, color: "#f1c40f", marginBottom: 16 }}>{r.school.name}</div>
              {r.passed ? (
                <p style={{ fontSize: 13, color: "#ddd", lineHeight: 2 }}>
                  {idx === 0 && "番号があった！！\n思わず声が出る。隣にいた親子が振り返る。"}
                  {idx === 1 && "画面に「合格」の文字。\n手が震えて、スマホを落としそうになる。"}
                  {idx === 2 && "…あった。\n家族全員が、同時に泣いた。"}
                </p>
              ) : (
                <p style={{ fontSize: 13, color: "#ddd", lineHeight: 2 }}>
                  {idx === 0 && "何度見ても、番号がない。\n…でも、まだ次がある。"}
                  {idx === 1 && "「不合格」の文字が、画面に浮かぶ。\n…切り替えよう。"}
                  {idx === 2 && "…最後の望み。\nだが、結果は変わらなかった。"}
                </p>
              )}
              <Btn color={r.passed ? "#2ecc71" : "#3498db"} onClick={() => {
                if (revealPhase < 3) { setRevealPhase(revealPhase + 1); setRevealStep(0); }
                else { setRevealPhase(4); }
              }} style={{ marginTop: 20 }}>
                {revealPhase < 3 ? "次の学校の結果 ▶" : "最終結果へ ▶"}
              </Btn>
            </div>
          </div>
        </div>
      );
    }

    // Final summary (revealPhase === 4)
    let title, desc, emoji, color;
    if (allFail) { title = "残念…全滅"; desc = "3校すべて不合格。\nでもこの3年間は必ず糧になる。\n公立中学でリベンジだ！"; emoji = "😭"; color = "#888"; }
    else if (best.school.rank === "S") { title = "大逆転！最難関合格！"; desc = `${best.school.name}に合格！\n3年間の努力が報われた…！\n\nおめでとう！！`; emoji = "👑"; color = "#f1c40f"; }
    else if (best.school.rank === "A") { title = "難関校合格！"; desc = `${best.school.name}に合格！\n立派な結果。胸を張って入学式へ。`; emoji = "🎊"; color = "#2ecc71"; }
    else if (best.school.rank === "B") { title = "中堅校合格！"; desc = `${best.school.name}に合格。\n自分に合った学校で充実の6年間を。`; emoji = "🌸"; color = "#3498db"; }
    else { title = "合格おめでとう！"; desc = `${best.school.name}に合格。\n受験を乗り越えた経験は一生の財産。`; emoji = "✨"; color = "#9b59b6"; }

    return (
      <div style={{ fontFamily: "'DotGothic16'", background: allFail ? "linear-gradient(180deg,#1a1a2e,#0a0a1e)" : "radial-gradient(ellipse at center, #2a1a3e, #1a1a2e 70%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={W}>
          <div style={{ background: "#1e1e3a", border: "4px solid #4a4a6a", padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{emoji}</div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 12, color, marginBottom: 12, lineHeight: 2, textShadow: "2px 2px 0 rgba(0,0,0,0.5)" }}>
              {title}
            </div>
            <p style={{ fontSize: 13, lineHeight: 2, color: "#ddd", whiteSpace: "pre-line", marginBottom: 20 }}>{desc}</p>
            <Panel style={{ textAlign: "left", fontSize: 11, lineHeight: 2 }}>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: "#f1c40f", marginBottom: 8 }}>📊 3年間の記録</div>
              <div>📖 最終学力: <span style={{ color: "#3498db" }}>{Math.round(stats.ac)}</span> (偏差値約{Math.round(stats.ac * 0.7 + 25)})</div>
              <div>🔥 やる気: <span style={{ color: "#2ecc71" }}>{Math.round(stats.mo)}</span></div>
              <div>🧠 メンタル: <span style={{ color: "#9b59b6" }}>{Math.round(stats.me)}</span></div>
              <div>💕 夫婦仲: <span style={{ color: stats.ha > 50 ? "#2ecc71" : "#e74c3c" }}>{Math.round(stats.ha)}</span></div>
              <div style={{ borderTop: "1px solid #3a3a5a", marginTop: 8, paddingTop: 8 }}>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: "#f1c40f", marginBottom: 6 }}>🏫 受験結果</div>
                {examResults.map((er, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", color: er.passed ? "#2ecc71" : "#e74c3c" }}>
                    <span>{er.school.name} ({er.correct}/{er.total})</span><span>{er.passed ? "🌸 合格" : "✗ 不合格"}</span>
                  </div>
                ))}
              </div>
            </Panel>
            {!allFail && (
              <p style={{ fontSize: 12, color: "#aaa", lineHeight: 2, margin: "12px 0", whiteSpace: "pre-line" }}>
                {"3年間、よくがんばりました。\n子供も、親も。\n\nこの経験は、一生の宝物です。"}
              </p>
            )}
            <Btn color="#e74c3c" onClick={restart} style={{ marginTop: 12 }}>🔄 もう一度プレイ</Btn>
            <p style={{ fontSize: 8, color: "#333", marginTop: 16 }}>中受クエスト © 2026 Paul</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
