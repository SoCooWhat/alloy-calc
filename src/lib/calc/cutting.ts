import type { CutRuleType, CasingType } from '@/types';

export interface CutRule {
  type: CutRuleType;
  value?: number;
  formula?: string;
}

/**
 * 计算切取长度
 * @param rule 切料规则
 * @param width 门宽度 mm
 * @param height 门高度 mm
 * @param wallThickness 墙厚 mm（可选）
 * @param casingType 包套类型（可选）
 * @returns 切取长度 mm
 */
export function calcCutLength(
  rule: CutRule,
  width: number,
  height: number,
  wallThickness?: number,
  casingType?: CasingType
): number {
  switch (rule.type) {
    case 'width':
      return width;

    case 'width-sub':
      return width - (rule.value || 0);

    case 'height':
      return height;

    case 'height-sub':
      return height - (rule.value || 0);

    case 'fixed':
      return rule.value || 0;

    case 'formula':
      return evalFormula(rule.formula || '0', width, height, wallThickness, casingType);

    default:
      return 0;
  }
}

/**
 * 计算公式表达式（安全版本）
 * 支持变量：宽、高、墙厚
 * 包套相关：单包套时「包套」= 1，双包套时「包套」= 2，无包套时「包套」= 0
 * 支持运算符：+、-、*、/、()
 * 示例：宽+墙厚、高-50、宽+墙厚*包套
 */
export function evalFormula(
  expr: string,
  width: number,
  height: number,
  wallThickness?: number,
  casingType?: CasingType
): number {
  try {
    // 包套系数：单包套=1，双包套=2，无包套=0
    const casingFactor = casingType === 'double' ? 2 : casingType === 'single' ? 1 : 0;
    const wt = wallThickness || 0;

    // 替换变量为数字
    let replaced = expr
      .replace(/墙厚/g, String(wt))
      .replace(/包套/g, String(casingFactor))
      .replace(/宽/g, String(width))
      .replace(/高/g, String(height));

    // 移除所有空格
    replaced = replaced.replace(/\s/g, '');

    // 验证表达式只包含数字、运算符和括号
    if (!/^[\d+\-*/().]+$/.test(replaced)) {
      console.error('公式包含非法字符:', expr);
      return 0;
    }

    // 安全的表达式计算（使用递归下降解析器）
    const result = safeEval(replaced);

    // 确保返回有效数字
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Math.round(result * 100) / 100;
    }

    return 0;
  } catch (error) {
    console.error('公式计算错误:', expr, error);
    return 0;
  }
}

/**
 * 安全的表达式计算器（递归下降解析器）
 * 只支持：数字、+、-、*、/、()
 */
function safeEval(expr: string): number {
  let pos = 0;

  function parseExpression(): number {
    let result = parseTerm();

    while (pos < expr.length) {
      if (expr[pos] === '+') {
        pos++;
        result += parseTerm();
      } else if (expr[pos] === '-') {
        pos++;
        result -= parseTerm();
      } else {
        break;
      }
    }

    return result;
  }

  function parseTerm(): number {
    let result = parseFactor();

    while (pos < expr.length) {
      if (expr[pos] === '*') {
        pos++;
        result *= parseFactor();
      } else if (expr[pos] === '/') {
        pos++;
        const divisor = parseFactor();
        if (divisor === 0) {
          throw new Error('Division by zero');
        }
        result /= divisor;
      } else {
        break;
      }
    }

    return result;
  }

  function parseFactor(): number {
    // 处理负号
    if (pos < expr.length && expr[pos] === '-') {
      pos++;
      return -parseFactor();
    }

    // 处理正号
    if (pos < expr.length && expr[pos] === '+') {
      pos++;
      return parseFactor();
    }

    // 处理括号
    if (pos < expr.length && expr[pos] === '(') {
      pos++; // 跳过 (
      const result = parseExpression();
      if (pos < expr.length && expr[pos] === ')') {
        pos++; // 跳过 )
      }
      return result;
    }

    // 处理数字
    const start = pos;
    while (pos < expr.length && (expr[pos] >= '0' && expr[pos] <= '9' || expr[pos] === '.')) {
      pos++;
    }

    if (start === pos) {
      throw new Error('Unexpected character at position ' + pos);
    }

    return parseFloat(expr.substring(start, pos));
  }

  const result = parseExpression();

  // 确保整个表达式都被解析
  if (pos < expr.length) {
    throw new Error('Unexpected character at position ' + pos);
  }

  return result;
}

/**
 * 验证公式表达式是否有效
 */
export function validateFormula(expr: string): { valid: boolean; error?: string } {
  try {
    // 替换变量为测试值
    const replaced = expr
      .replace(/墙厚/g, '100')
      .replace(/包套/g, '1')
      .replace(/宽/g, '100')
      .replace(/高/g, '200');

    // 尝试执行
    const result = Function('"use strict"; return (' + replaced + ')')();

    if (typeof result === 'number' && !isNaN(result)) {
      return { valid: true };
    }

    return { valid: false, error: '计算结果不是有效数字' };
  } catch (error) {
    return {
      valid: false,
      error: `公式语法错误: ${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}

/**
 * 获取切料规则的描述文本
 */
export function getCutRuleDescription(rule: CutRule, width?: number, height?: number, wallThickness?: number): string {
  switch (rule.type) {
    case 'width':
      return `取宽度${width ? ` (${width}mm)` : ''}`;
    case 'width-sub':
      return `宽度 - ${rule.value || 0}mm`;
    case 'height':
      return `取高度${height ? ` (${height}mm)` : ''}`;
    case 'height-sub':
      return `高度 - ${rule.value || 0}mm`;
    case 'fixed':
      return `固定长度 ${rule.value || 0}mm`;
    case 'formula':
      return `公式: ${rule.formula || '未定义'}${wallThickness ? ` (墙厚=${wallThickness}mm)` : ''}`;
    default:
      return '未知规则';
  }
}
