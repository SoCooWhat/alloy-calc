import { describe, it, expect } from 'vitest';
import { calcWeight, parseModelParams } from '../formulas';

describe('calcWeight', () => {
  it('方管 50×50×2, L=1200mm, 铝合金', () => {
    const result = calcWeight({
      formulaType: 'square',
      outer: 50,
      wall: 2,
      length: 1200,
      density: 2.70,
      unitPrice: 28.5,
    });

    // 截面积 = 50² - 46² = 2500 - 2116 = 384 mm²
    expect(result.crossSectionArea).toBe(384);

    // 重量 = 384 × 1200 × 2.70 / 10⁶ = 1.24416 kg
    expect(result.weightPerPiece).toBeCloseTo(1.2442, 3);

    // 成本 = 1.24416 × 28.5 ≈ 35.46 元
    expect(result.materialCost).toBeCloseTo(35.46, 1);
  });

  it('圆管 D60×3, L=1000mm, 铝合金', () => {
    const result = calcWeight({
      formulaType: 'round',
      outer: 60,
      wall: 3,
      length: 1000,
      density: 2.70,
      unitPrice: 28.5,
    });

    // 截面积 = π/4 × (60² - 54²) = π/4 × (3600 - 2916) ≈ 534.07 mm²
    expect(result.crossSectionArea).toBeCloseTo(534.07, 0);

    // 重量 = 534.07 × 1000 × 2.70 / 10⁶ ≈ 1.442 kg
    expect(result.weightPerPiece).toBeCloseTo(1.442, 2);
  });

  it('板材 100×2, L=500mm, 铝合金', () => {
    const result = calcWeight({
      formulaType: 'plate',
      outer: 100,
      wall: 2,
      length: 500,
      density: 2.70,
      unitPrice: 28.5,
    });

    // 截面积 = 100 × 2 = 200 mm²
    expect(result.crossSectionArea).toBe(200);

    // 重量 = 200 × 500 × 2.70 / 10⁶ = 0.27 kg
    expect(result.weightPerPiece).toBeCloseTo(0.27, 2);
  });

  it('棒材 D20, L=300mm, 铝合金', () => {
    const result = calcWeight({
      formulaType: 'bar',
      outer: 20,
      wall: 0,
      length: 300,
      density: 2.70,
      unitPrice: 28.5,
    });

    // 截面积 = π/4 × 20² ≈ 314.16 mm²
    expect(result.crossSectionArea).toBeCloseTo(314.16, 0);

    // 重量 = 314.16 × 300 × 2.70 / 10⁶ ≈ 0.254 kg
    expect(result.weightPerPiece).toBeCloseTo(0.254, 2);
  });
});

describe('parseModelParams', () => {
  it('方管 50×50×2', () => {
    const result = parseModelParams('50×50×2', 'square');
    expect(result).toEqual({ outer: 50, wall: 2 });
  });

  it('方管 50×2', () => {
    const result = parseModelParams('50×2', 'square');
    expect(result).toEqual({ outer: 50, wall: 2 });
  });

  it('圆管 D60×3', () => {
    const result = parseModelParams('D60×3', 'round');
    expect(result).toEqual({ outer: 60, wall: 3 });
  });

  it('板材 100×2', () => {
    const result = parseModelParams('100×2', 'plate');
    expect(result).toEqual({ outer: 100, wall: 2 });
  });

  it('棒材 D20', () => {
    const result = parseModelParams('D20', 'bar');
    expect(result).toEqual({ outer: 20, wall: 0 });
  });
});
