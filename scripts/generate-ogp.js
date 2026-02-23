import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WIDTH = 1200;
const HEIGHT = 630;

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// --- 背景: ダークパープルのグラデーション（中心→外） ---
// radial gradient: 中心 #2a1a3e → 外 #1a1a2e
const bgGrad = ctx.createRadialGradient(
  WIDTH / 2, HEIGHT / 2, 0,
  WIDTH / 2, HEIGHT / 2, WIDTH / 2
);
bgGrad.addColorStop(0, '#2a1a3e');
bgGrad.addColorStop(1, '#1a1a2e');
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// --- RPG風の外枠（太め） ---
const outerMargin = 16;
ctx.strokeStyle = '#3a3a6a';
ctx.lineWidth = 4;
ctx.strokeRect(
  outerMargin, outerMargin,
  WIDTH - outerMargin * 2, HEIGHT - outerMargin * 2
);

// --- 内側の細い枠 ---
const innerMargin = 28;
ctx.strokeStyle = '#5a4a8a';
ctx.lineWidth = 2;
ctx.strokeRect(
  innerMargin, innerMargin,
  WIDTH - innerMargin * 2, HEIGHT - innerMargin * 2
);

// --- コーナー装飾（L字型の線、#f1c40f） ---
const cornerLen = 40;
const cornerOffset = 12;
ctx.strokeStyle = '#f1c40f';
ctx.lineWidth = 3;

function drawCorner(x, y, dx, dy) {
  ctx.beginPath();
  ctx.moveTo(x + dx * cornerLen, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + dy * cornerLen);
  ctx.stroke();
}
// 左上
drawCorner(cornerOffset, cornerOffset, 1, 1);
// 右上
drawCorner(WIDTH - cornerOffset, cornerOffset, -1, 1);
// 左下
drawCorner(cornerOffset, HEIGHT - cornerOffset, 1, -1);
// 右下
drawCorner(WIDTH - cornerOffset, HEIGHT - cornerOffset, -1, -1);

// --- 装飾ライン（タイトル上下） ---
ctx.strokeStyle = '#5a4a8a';
ctx.lineWidth = 1;
// タイトル上の横線
const lineY1 = 200;
ctx.beginPath();
ctx.moveTo(200, lineY1);
ctx.lineTo(1000, lineY1);
ctx.stroke();
// タイトル下の横線
const lineY2 = 380;
ctx.beginPath();
ctx.moveTo(200, lineY2);
ctx.lineTo(1000, lineY2);
ctx.stroke();

// --- テキスト描画 ---
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// メインタイトル「中受クエスト」
// 影
ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
ctx.font = 'bold 90px "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif';
ctx.fillText('中受クエスト', WIDTH / 2 + 3, 290 + 3);
// 本体
ctx.fillStyle = '#f1c40f';
ctx.fillText('中受クエスト', WIDTH / 2, 290);

// サブタイトル「─ 我が子を合格に導け ─」
ctx.fillStyle = '#aaaaaa';
ctx.font = '28px "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif';
ctx.fillText('─ 我が子を合格に導け ─', WIDTH / 2, 410);

// 下部テキスト
ctx.fillStyle = '#aaaaaa';
ctx.font = '22px "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif';
ctx.fillText('★ レトロRPG風 中学受験シミュレーション ★', WIDTH / 2, 550);

// --- 出力 ---
const outputPath = resolve(__dirname, '..', 'public', 'ogp.png');
const buffer = canvas.toBuffer('image/png');
writeFileSync(outputPath, buffer);
console.log(`OGP画像を生成しました: ${outputPath}`);
console.log(`サイズ: ${buffer.length} bytes (${(buffer.length / 1024).toFixed(1)} KB)`);
