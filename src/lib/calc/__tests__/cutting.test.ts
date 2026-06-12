import { describe, it, expect } from 'vitest';
import { calcCutLength, evalFormula, validateFormula } from '../cutting';

describe('calcCutLength', () => {
  const width = 1000;
  const height = 1500;

  it('直接取宽度', () => {
    const result = calcCutLength({ type: 'width' }, width, height);
    expect(result).toBe(1000);
  });

  it('宽度扣减', () => {
    const result = calcCutLength({ type: 'width-sub', value: 50 }, width, height);
    expect(result).toBe(950);
  });

  it('直接取高度', () => {
    const result = calcCutLength({ type: 'height' }, width, height);
    expect(result).toBe(1500);
  });

  it('高度扣减', () => {
    const result = calcCutLength({ type: 'height-sub', value: 100 }, width, height);
    expect(result).toBe(1400);
  });

  it('固定长度', () => {
    const result = calcCutLength({ type: 'fixed', value: 800 }, width, height);
    expect(result).toBe(800);
  });

  it('公式计算', () => {
    const result = calcCutLength(
      { type: 'formula', formula: '宽-100' },
      width,
      height
    );
    expect(result).toBe(900);
  });
});

describe('evalFormula', () => {
  it('简单减法: 宽-100', () => {
    expect(evalFormula('宽-100', 1000, 1500)).toBe(900);
  });

  it('简单加法: 宽+高', () => {
    expect(evalFormula('宽+高', 1000, 1500)).toBe(2500);
  });

  it('乘法: 宽*0.5', () => {
    expect(evalFormula('宽*0.5', 1000, 1500)).toBe(500);
  });

  it('复杂表达式: (宽+高)*2', () => {
    expect(evalFormula('(宽+高)*2', 1000, 1500)).toBe(5000);
  });

  it('除法: 宽/2', () => {
    expect(evalFormula('宽/2', 1000, 1500)).toBe(500);
  });
});

describe('validateFormula', () => {
  it('有效公式', () => {
    const result = validateFormula('宽-100');
    expect(result.valid).toBe(true);
  });

  it('无效公式', () => {
    const result = validateFormula('宽++');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
