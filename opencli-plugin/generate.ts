import { cli, Strategy } from '@jackwener/opencli/registry';
import { ArgumentError, CommandExecutionError } from '@jackwener/opencli/errors';
import * as fs from 'node:fs';
import * as path from 'node:path';

const DEFAULT_URL = 'https://bluebook-cover-generator.fhxqtech.com';
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const IMAGE_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const stringArgs = [
  'volume', 'topTag', 'series', 'subtitle', 'englishTitle', 'authorLabel', 'date',
  'org', 'author', 'version', 'tags', 'watermark', 'bgColor', 'accentColor',
  'titleColor', 'textColor', 'lineColor', 'pattern', 'layout', 'fontStyle',
] as const;

const numericRanges: Record<string, [number, number]> = {
  textureOpacity: [0, 60],
  vignetteOpacity: [0, 80],
  watermarkOpacity: [0, 40],
  patternOpacity: [0, 80],
  titleSize: [44, 86],
};

function requireRange(name: string, value: unknown): number {
  const number = Number(value);
  const [min, max] = numericRanges[name];
  if(!Number.isInteger(number) || number < min || number > max) {
    throw new ArgumentError(`--${name} 必须是 ${min}-${max} 的整数`);
  }
  return number;
}

function requireBoolean(name: string, value: unknown): boolean {
  if(value === 'true' || value === true) return true;
  if(value === 'false' || value === false) return false;
  throw new ArgumentError(`--${name} 必须是 true 或 false`);
}

function readLogoDataUrl(file: unknown): string | undefined {
  if(!file) return undefined;
  const absolute = path.resolve(String(file));
  if(!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    throw new ArgumentError(`Logo 文件不存在: ${absolute}`);
  }
  const mime = IMAGE_MIME[path.extname(absolute).toLowerCase()];
  if(!mime) {
    throw new ArgumentError('Logo 仅支持 PNG、JPEG、WebP、GIF 或 SVG');
  }
  return `data:${mime};base64,${fs.readFileSync(absolute).toString('base64')}`;
}

function resolveOutput(value: unknown): string {
  const output = path.resolve(String(value || './蓝皮书封面.png'));
  if(path.extname(output).toLowerCase() !== '.png') {
    throw new ArgumentError('--output 必须是以 .png 结尾的文件路径');
  }
  return output;
}

cli({
  site: 'bluebook-cover-generator',
  name: 'generate',
  description: '生成蓝皮书、白皮书或研究报告 PNG 封面并保存到本地',
  access: 'write',
  example: "opencli bluebook-cover-generator generate '人工智能产业蓝皮书' --subtitle '2026 年趋势与实践' -f json",
  domain: 'bluebook-cover-generator.fhxqtech.com',
  strategy: Strategy.UI,
  browser: true,
  navigateBefore: false,
  args: [
    {name:'title', type:'string', required:true, positional:true, help:'蓝皮书主标题'},
    {name:'volume', type:'string', default:'VOL. 01', help:'卷号或期号'},
    {name:'topTag', type:'string', default:'研究报告', help:'顶部标签'},
    {name:'series', type:'string', default:'', help:'系列名称'},
    {name:'subtitle', type:'string', default:'', help:'副标题或研究主题说明'},
    {name:'englishTitle', type:'string', default:'', help:'英文标题'},
    {name:'authorLabel', type:'string', default:'研究编纂', help:'署名说明'},
    {name:'date', type:'string', default:'', help:'发布日期'},
    {name:'org', type:'string', default:'', help:'机构或出品方'},
    {name:'author', type:'string', default:'', help:'作者或署名'},
    {name:'version', type:'string', default:'', help:'版本号、适用对象或备注'},
    {name:'tags', type:'string', default:'', help:'关键词标签，使用逗号分隔'},
    {name:'template', type:'string', default:'blueGold', choices:['blueGold','blackGold','green','light'], help:'封面模板'},
    {name:'bgColor', type:'string', default:'', help:'背景色，格式 #RRGGBB'},
    {name:'accentColor', type:'string', default:'', help:'强调色，格式 #RRGGBB'},
    {name:'titleColor', type:'string', default:'', help:'标题色，格式 #RRGGBB'},
    {name:'textColor', type:'string', default:'', help:'正文色，格式 #RRGGBB'},
    {name:'lineColor', type:'string', default:'', help:'线框色，格式 #RRGGBB'},
    {name:'textureOpacity', type:'int', default:18, help:'纸张颗粒质感 0-60'},
    {name:'vignetteOpacity', type:'int', default:32, help:'暗角强度 0-80'},
    {name:'pattern', type:'string', default:'circles', choices:['circles','grid','waves','none'], help:'装饰花纹'},
    {name:'layout', type:'string', default:'classic', choices:['classic','center','compact'], help:'标题版式'},
    {name:'watermark', type:'string', default:'BLUE BOOK', help:'水印文字'},
    {name:'watermarkOpacity', type:'int', default:10, help:'水印透明度 0-40'},
    {name:'patternOpacity', type:'int', default:26, help:'花纹透明度 0-80'},
    {name:'titleSize', type:'int', default:66, help:'主标题字号 44-86'},
    {name:'fontStyle', type:'string', default:'serif', choices:['serif','sans','mixed'], help:'字体气质'},
    {name:'showTags', type:'string', default:'true', choices:['true','false'], help:'是否显示关键词标签'},
    {name:'showBorder', type:'string', default:'true', choices:['true','false'], help:'是否显示专业线框'},
    {name:'logo', type:'string', default:'', help:'本地 Logo 图片路径'},
    {name:'scale', type:'int', default:2, choices:['1','2','3'], help:'PNG 导出倍率'},
    {name:'output', type:'string', default:'./蓝皮书封面.png', help:'目标 PNG 文件路径'},
  ],
  columns: ['file','width','height','scale','status'],
  func: async (page, kwargs) => {
    const title = String(kwargs.title || '').trim();
    if(!title) throw new ArgumentError('必须提供蓝皮书主标题');

    const output = resolveOutput(kwargs.output);
    const scale = Number(kwargs.scale);
    if(![1,2,3].includes(scale)) throw new ArgumentError('--scale 必须是 1、2 或 3');

    const config: Record<string, unknown> = {
      title,
      template:String(kwargs.template),
      showTags:requireBoolean('showTags', kwargs.showTags),
      showBorder:requireBoolean('showBorder', kwargs.showBorder),
      logoDataUrl:readLogoDataUrl(kwargs.logo) || '',
    };
    for(const name of stringArgs) {
      const value = String(kwargs[name] ?? '');
      if(name.endsWith('Color') && value && !HEX_COLOR.test(value)) {
        throw new ArgumentError(`--${name} 必须使用 #RRGGBB 格式`);
      }
      if(value) config[name] = value;
      else if(!name.endsWith('Color')) config[name] = '';
    }
    for(const name of Object.keys(numericRanges)) config[name] = requireRange(name, kwargs[name]);

    const url = process.env.BLUEBOOK_GENERATOR_URL || DEFAULT_URL;
    try {
      await page.goto(url);
      await page.wait({selector:'#coverSvg', timeout:20});
      const result = await page.evaluate(async (pageConfig, exportScale) => {
        const api = (window as any).bluebookCoverGenerator;
        if(!api?.applyConfig || !api?.exportPng) {
          throw new Error('网页未提供 bluebookCoverGenerator 自动化 API');
        }
        await api.applyConfig(pageConfig);
        return api.exportPng(exportScale);
      }, config, scale) as {base64:string; width:number; height:number};
      if(!result?.base64 || !result.width || !result.height) {
        throw new Error('网页返回了无效的 PNG 结果');
      }
      fs.mkdirSync(path.dirname(output), {recursive:true});
      fs.writeFileSync(output, Buffer.from(result.base64, 'base64'));
      return [{file:output, width:result.width, height:result.height, scale, status:'ok'}];
    } catch(error) {
      if(error instanceof ArgumentError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw new CommandExecutionError(
        `生成蓝皮书封面失败: ${message}`,
        `确认网页可访问且已部署自动化 API。当前地址: ${url}`
      );
    }
  },
});
