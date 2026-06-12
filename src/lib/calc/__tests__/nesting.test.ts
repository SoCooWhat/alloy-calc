import { describe, it, expect } from 'vitest';
import { greedyNesting, optimizedNesting, calcNestingStats, filterReusableRemnants } from '../nesting';
import type { Segment } from '../nesting';

describe('greedyNesting', () => {
  it('单个部件排料', () => {
    const segments: Segment[] = [
      { partName: '框料', length: 1200, count: 5 },
    ];

    const result = greedyNesting(segments, 6000, 4);

    // 每根可放4段: floor((6000+4)/(1200+4)) = 4
    // 5段需要2根
    expect(result).toHaveLength(2);
    expect(result[0].segments).toHaveLength(4);
    expect(result[1].segments).toHaveLength(1);
  });

  it('多种部件混合排料', () => {
    const segments: Segment[] = [
      { partName: '框料', length: 1200, count: 3 },
      { partName: '扇料', length: 800, count: 4 },
    ];

    const result = greedyNesting(segments, 6000, 4);

    // 应该能优化排料
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('空部件列表', () => {
    const result = greedyNesting([], 6000, 4);
    expect(result).toHaveLength(0);
  });
});

describe('optimizedNesting', () => {
  it('优化排料结果', () => {
    const segments: Segment[] = [
      { partName: '框料', length: 1200, count: 5 },
      { partName: '扇料', length: 800, count: 5 },
    ];

    const greedyResult = greedyNesting(segments, 6000, 4);
    const optimizedResult = optimizedNesting(segments, 6000, 4);

    // 优化算法应该使用相同或更少的料
    expect(optimizedResult.length).toBeLessThanOrEqual(greedyResult.length);
  });
});

describe('calcNestingStats', () => {
  it('计算统计信息', () => {
    const layouts = greedyNesting(
      [{ partName: '框料', length: 1200, count: 10 }],
      6000,
      4
    );

    const stats = calcNestingStats(layouts);

    expect(stats.totalBars).toBe(layouts.length);
    expect(stats.totalSegments).toBe(10);
    expect(stats.averageUtilization).toBeGreaterThan(0);
    expect(stats.averageUtilization).toBeLessThanOrEqual(100);
  });

  it('空排料', () => {
    const stats = calcNestingStats([]);

    expect(stats.totalBars).toBe(0);
    expect(stats.totalSegments).toBe(0);
    expect(stats.averageUtilization).toBe(0);
  });
});

describe('filterReusableRemnants', () => {
  it('筛选可复用余料', () => {
    const layouts = [
      { segments: [{ partName: 'A', length: 1200 }], remnant: 600, utilizationRate: 80 },
      { segments: [{ partName: 'B', length: 1200 }], remnant: 300, utilizationRate: 85 },
      { segments: [{ partName: 'C', length: 1200 }], remnant: 800, utilizationRate: 75 },
    ];

    const remnants = filterReusableRemnants(layouts, 500);

    expect(remnants).toHaveLength(2);
    expect(remnants[0].barIndex).toBe(0);
    expect(remnants[0].remnant).toBe(600);
    expect(remnants[1].barIndex).toBe(2);
    expect(remnants[1].remnant).toBe(800);
  });

  it('无可复用余料', () => {
    const layouts = [
      { segments: [{ partName: 'A', length: 1200 }], remnant: 200, utilizationRate: 90 },
      { segments: [{ partName: 'B', length: 1200 }], remnant: 400, utilizationRate: 85 },
    ];

    const remnants = filterReusableRemnants(layouts, 500);

    expect(remnants).toHaveLength(0);
  });
});
