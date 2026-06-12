import { NextRequest, NextResponse } from 'next/server';
import { runCalculation, previewCalculation } from '@/lib/calc';
import type { CalcRequest } from '@/lib/calc';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body: CalcRequest & { preview?: boolean } = await request.json();

    // 兼容旧的 templateId 参数
    const seriesId = body.seriesId;

    if (!seriesId) {
      return NextResponse.json(
        { error: '缺少系列ID' },
        { status: 400 }
      );
    }

    if (!body.sizeSpecs || body.sizeSpecs.length === 0) {
      return NextResponse.json(
        { error: '缺少尺寸规格' },
        { status: 400 }
      );
    }

    // 验证尺寸规格
    for (const spec of body.sizeSpecs) {
      if (!spec.width || spec.width <= 0) {
        return NextResponse.json(
          { error: '宽度必须大于0' },
          { status: 400 }
        );
      }
      if (!spec.height || spec.height <= 0) {
        return NextResponse.json(
          { error: '高度必须大于0' },
          { status: 400 }
        );
      }
      if (!spec.qty || spec.qty <= 0) {
        return NextResponse.json(
          { error: '数量必须大于0' },
          { status: 400 }
        );
      }
    }

    const calcReq: CalcRequest = {
      seriesId,
      sizeSpecs: body.sizeSpecs,
      kerf: body.kerf,
      useRemnants: body.useRemnants,
      saveRemnants: body.saveRemnants,
      casingType: body.casingType,
    };

    // 执行计算
    const result = body.preview
      ? await previewCalculation(calcReq)
      : await runCalculation(calcReq);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error('算料API错误:', error);
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err.message || '计算失败',
      },
      { status: 500 }
    );
  }
}
