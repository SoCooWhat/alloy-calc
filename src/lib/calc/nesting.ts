export interface Segment {
  partName: string;
  length: number;
  count: number;
}

export interface BarLayout {
  segments: { partName: string; length: number }[];
  remnant: number;
  utilizationRate: number;
}

/**
 * 贪心排料算法
 * 将多个部件的切段按照长度降序排列，然后依次装入标准料中
 *
 * @param segments 所有需要切割的段
 * @param barLength 标准料长度 mm
 * @param kerf 锯缝宽度 mm
 * @returns 排料方案数组
 */
export function greedyNesting(
  segments: Segment[],
  barLength: number = 6000,
  kerf: number = 4
): BarLayout[] {
  // 1. 展开所有段并按长度降序排列
  const allSegs: { partName: string; length: number }[] = [];

  segments.forEach(seg => {
    for (let i = 0; i < seg.count; i++) {
      allSegs.push({
        partName: seg.partName,
        length: seg.length,
      });
    }
  });

  // 按长度降序排列（大件优先）
  allSegs.sort((a, b) => b.length - a.length);

  // 2. 贪心装箱
  const bars: BarLayout[] = [];

  allSegs.forEach(seg => {
    let placed = false;

    // 尝试放入已有的料中
    for (const bar of bars) {
      const usedLength = bar.segments.reduce(
        (sum, s) => sum + s.length + kerf,
        0
      );

      // 检查是否能放下（考虑锯缝）
      if (usedLength + seg.length + kerf <= barLength) {
        bar.segments.push({
          partName: seg.partName,
          length: seg.length,
        });

        // 更新余料
        bar.remnant = barLength - (usedLength + seg.length + kerf) + kerf;

        // 更新利用率
        const totalCutLength = bar.segments.reduce((sum, s) => sum + s.length, 0);
        bar.utilizationRate = Math.round(
          (totalCutLength / (barLength - bar.remnant)) * 10000
        ) / 100;

        placed = true;
        break;
      }
    }

    // 如果放不下，开新料
    if (!placed) {
      bars.push({
        segments: [{
          partName: seg.partName,
          length: seg.length,
        }],
        remnant: barLength - seg.length,
        utilizationRate: Math.round((seg.length / barLength) * 10000) / 100,
      });
    }
  });

  return bars;
}

/**
 * 优化排料算法
 * 使用首次适配递减算法（First Fit Decreasing）
 * 在贪心基础上尝试更均匀的分配
 */
export function optimizedNesting(
  segments: Segment[],
  barLength: number = 6000,
  kerf: number = 4
): BarLayout[] {
  // 1. 展开并排序
  const allSegs: { partName: string; length: number; originalIndex: number }[] = [];
  let index = 0;

  segments.forEach(seg => {
    for (let i = 0; i < seg.count; i++) {
      allSegs.push({
        partName: seg.partName,
        length: seg.length,
        originalIndex: index++,
      });
    }
  });

  // 按长度降序
  allSegs.sort((a, b) => b.length - a.length);

  // 2. 首次适配递减算法
  const bars: BarLayout[] = [];

  allSegs.forEach(seg => {
    let bestBarIndex = -1;
    let bestRemnant = barLength;

    // 找到余料最接近但能放下当前段的料
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      const usedLength = bar.segments.reduce(
        (sum, s) => sum + s.length + kerf,
        0
      );

      if (usedLength + seg.length + kerf <= barLength) {
        const remnant = barLength - (usedLength + seg.length + kerf) + kerf;
        if (remnant < bestRemnant) {
          bestRemnant = remnant;
          bestBarIndex = i;
        }
      }
    }

    if (bestBarIndex >= 0) {
      // 放入最佳匹配的料
      const bar = bars[bestBarIndex];
      const usedLength = bar.segments.reduce(
        (sum, s) => sum + s.length + kerf,
        0
      );

      bar.segments.push({
        partName: seg.partName,
        length: seg.length,
      });

      bar.remnant = barLength - (usedLength + seg.length + kerf) + kerf;

      const totalCutLength = bar.segments.reduce((sum, s) => sum + s.length, 0);
      bar.utilizationRate = Math.round(
        (totalCutLength / (barLength - bar.remnant)) * 10000
      ) / 100;
    } else {
      // 开新料
      bars.push({
        segments: [{
          partName: seg.partName,
          length: seg.length,
        }],
        remnant: barLength - seg.length,
        utilizationRate: Math.round((seg.length / barLength) * 10000) / 100,
      });
    }
  });

  return bars;
}

/**
 * 计算排料统计信息
 */
export interface NestingStats {
  totalBars: number;
  totalSegments: number;
  averageUtilization: number;
  minUtilization: number;
  maxUtilization: number;
  totalRemnant: number;
  remnantOver500Count: number; // 余料≥500mm的数量
}

export function calcNestingStats(layouts: BarLayout[]): NestingStats {
  if (layouts.length === 0) {
    return {
      totalBars: 0,
      totalSegments: 0,
      averageUtilization: 0,
      minUtilization: 0,
      maxUtilization: 0,
      totalRemnant: 0,
      remnantOver500Count: 0,
    };
  }

  const totalSegments = layouts.reduce(
    (sum, bar) => sum + bar.segments.length,
    0
  );

  const utilizations = layouts.map(bar => bar.utilizationRate);
  const averageUtilization = Math.round(
    utilizations.reduce((sum, u) => sum + u, 0) / utilizations.length * 100
  ) / 100;

  const minUtilization = Math.min(...utilizations);
  const maxUtilization = Math.max(...utilizations);

  const totalRemnant = Math.round(
    layouts.reduce((sum, bar) => sum + bar.remnant, 0) * 100
  ) / 100;

  const remnantOver500Count = layouts.filter(bar => bar.remnant >= 500).length;

  return {
    totalBars: layouts.length,
    totalSegments,
    averageUtilization,
    minUtilization,
    maxUtilization,
    totalRemnant,
    remnantOver500Count,
  };
}

/**
 * 筛选可复用余料（≥500mm）
 */
export function filterReusableRemnants(
  layouts: BarLayout[],
  minLength: number = 500
): { barIndex: number; remnant: number }[] {
  return layouts
    .map((bar, index) => ({
      barIndex: index,
      remnant: bar.remnant,
    }))
    .filter(item => item.remnant >= minLength);
}

/**
 * 余料排料算法
 * 将可复用的余料当作短料，优先往里排切段
 * 返回余料排料结果 + 剩余未排入的切段
 */
export function remnantGreedyNesting(
  segments: Segment[],
  remnantLengths: number[],
  kerf: number = 4
): { remnantLayouts: BarLayout[]; remainingSegments: Segment[] } {
  if (remnantLengths.length === 0 || segments.length === 0) {
    return { remnantLayouts: [], remainingSegments: segments };
  }

  // 展开所有段并按长度降序排列
  const allSegs: { partName: string; length: number }[] = [];
  segments.forEach(seg => {
    for (let i = 0; i < seg.count; i++) {
      allSegs.push({ partName: seg.partName, length: seg.length });
    }
  });
  allSegs.sort((a, b) => b.length - a.length);

  // 余料按长度降序排列（大余料优先利用）
  const sortedRemnants = [...remnantLengths].sort((a, b) => b - a);

  // 为每根余料创建一个"料桶"
  const remnantBars: { barLength: number; bar: BarLayout }[] = sortedRemnants.map(len => ({
    barLength: len,
    bar: {
      segments: [],
      remnant: len,
      utilizationRate: 0,
    },
  }));

  const placed = new Set<number>();

  allSegs.forEach((seg, segIdx) => {
    for (const rb of remnantBars) {
      const usedLength = rb.bar.segments.reduce(
        (sum, s) => sum + s.length + kerf, 0
      );
      if (usedLength + seg.length + kerf <= rb.barLength) {
        rb.bar.segments.push({ partName: seg.partName, length: seg.length });
        rb.bar.remnant = rb.barLength - (usedLength + seg.length + kerf) + kerf;
        const totalCutLength = rb.bar.segments.reduce((sum, s) => sum + s.length, 0);
        rb.bar.utilizationRate = Math.round(
          (totalCutLength / (rb.barLength - rb.bar.remnant)) * 10000
        ) / 100;
        placed.add(segIdx);
        break;
      }
    }
  });

  // 收集排入了切段的余料布局（过滤掉空余料）
  const remnantLayouts = remnantBars
    .filter(rb => rb.bar.segments.length > 0)
    .map(rb => rb.bar);

  // 收集剩余未排入的切段，重新聚合为 Segment[]
  const remainingSegs = allSegs.filter((_, i) => !placed.has(i));
  const segCountMap = new Map<string, { partName: string; length: number; count: number }>();
  remainingSegs.forEach(seg => {
    const key = seg.partName;
    if (segCountMap.has(key)) {
      segCountMap.get(key)!.count++;
    } else {
      segCountMap.set(key, { partName: seg.partName, length: seg.length, count: 1 });
    }
  });

  return {
    remnantLayouts,
    remainingSegments: Array.from(segCountMap.values()),
  };
}
