import { describe, it, expect } from 'vitest';
import { calcPurchase, calcBatchPurchase, calcUtilizationRate } from '../cost';

describe('calcPurchase', () => {
  it('基本计算: 切段1200mm, 需100段', () => {
    const result = calcPurchase({
      cutLength: 1200,
      totalSegments: 100,
      barLength: 6000,
      kerf: 4,
      stockQty: 0,
    });

    // 每根可切段数 = floor((6000+4)/(1200+4)) = floor(6004/1204) = 4
    expect(result.segmentsPerBar).toBe(4);

    // 需用根数 = ceil(100/4) = 25
    expect(result.barsNeeded).toBe(25);

    // 每根余料 = 6000 - 4*(1200+4) + 4 = 6000 - 4816 + 4 = 1188mm
    expect(result.remnantPerBar).toBe(1188);

    // 需采购 = max(0, 25-0) = 25
    expect(result.purchaseQty).toBe(25);
  });

  it('有库存的情况', () => {
    const result = calcPurchase({
      cutLength: 1200,
      totalSegments: 100,
      barLength: 6000,
      kerf: 4,
      stockQty: 10,
    });

    expect(result.barsNeeded).toBe(25);
    expect(result.purchaseQty).toBe(15); // 25 - 10 = 15
  });

  it('库存充足的情况', () => {
    const result = calcPurchase({
      cutLength: 1200,
      totalSegments: 100,
      barLength: 6000,
      kerf: 4,
      stockQty: 30,
    });

    expect(result.barsNeeded).toBe(25);
    expect(result.purchaseQty).toBe(0); // 库存充足
  });
});

describe('calcBatchPurchase', () => {
  it('批量计算', () => {
    const needs = [
      {
        materialId: '1',
        materialName: '方管 50×50×2',
        cutLength: 1200,
        totalSegments: 100,
        unit: '根',
        stockQty: 0,
      },
      {
        materialId: '2',
        materialName: '圆管 D60×3',
        cutLength: 800,
        totalSegments: 50,
        unit: '根',
        stockQty: 5,
      },
    ];

    const results = calcBatchPurchase(needs);

    expect(results).toHaveLength(2);
    expect(results[0].materialName).toBe('方管 50×50×2');
    expect(results[1].materialName).toBe('圆管 D60×3');
  });
});

describe('calcUtilizationRate', () => {
  it('计算利用率', () => {
    expect(calcUtilizationRate(4800, 6000)).toBe(80);
    expect(calcUtilizationRate(5400, 6000)).toBe(90);
    expect(calcUtilizationRate(3000, 6000)).toBe(50);
  });

  it('边界情况', () => {
    expect(calcUtilizationRate(0, 6000)).toBe(0);
    expect(calcUtilizationRate(100, 0)).toBe(0);
  });
});
