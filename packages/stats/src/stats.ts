import { cross, histogram, mean, quantile } from 'd3-array';
import { scaleLinear } from 'd3-scale';

import { confidenceInterval } from './confidence-interval';
import { toNearestHundreth } from './utils';

export interface Bucket {
  min: number;
  max: number;
  count: {
    control: number;
    experiment: number;
  };
}

export interface ISevenFigureSummary {
  min: number;
  max: number;
  10: number;
  25: number;
  50: number;
  75: number;
  90: number;
}

export interface IOutliers {
  IQR: number;
  outliers: number[];
  lowerOutlier: number;
  upperOutlier: number;
}

export interface IStatsOptions {
  control: number[];
  experiment: number[];
  name: string;
  confidenceLevel?: 0.8 | 0.85 | 0.9 | 0.95 | 0.99 | 0.995 | 0.999;
}

export interface IConfidenceInterval {
  min: number;
  max: number;
  isSig: boolean;
  median: number;
  zScore: number;
  pValue: number;
  U: number;
}
export class Stats {
  public readonly name: string;
  public readonly estimator: number;
  public readonly sparkLine: { control: string; experiment: string };
  public readonly confidenceIntervals: { [key: number]: IConfidenceInterval };
  public readonly confidenceInterval: IConfidenceInterval;
  public readonly sevenFigureSummary: {
    control: ISevenFigureSummary;
    experiment: ISevenFigureSummary;
  };
  public readonly outliers: {
    control: IOutliers;
    experiment: IOutliers;
  };
  public readonly sampleCount: { control: number; experiment: number };
  public readonly experimentSorted: number[];
  public readonly controlSorted: number[];
  public readonly buckets: Bucket[];
  public readonly range: { min: number; max: number };
  public readonly populationVariance: { control: number; experiment: number };
  public readonly control: number[];
  public readonly experiment: number[];
  constructor(options: IStatsOptions) {
    const { name, control, experiment, confidenceLevel } = options;

    this.control = control;
    this.experiment = experiment;

    const controlSorted = control;
    const experimentSorted = experiment;
    this.controlSorted = controlSorted.sort((a, b) => a - b);
    this.experimentSorted = experimentSorted.sort((a, b) => a - b);

    this.name = name;
    this.sampleCount = {
      control: this.controlSorted.length,
      experiment: this.experimentSorted.length
    };
    this.range = this.getRange(this.controlSorted, this.experimentSorted);
    this.sparkLine = {
      control: this.getSparkline(
        this.getHistogram(this.range, this.controlSorted)
      ),
      experiment: this.getSparkline(
        this.getHistogram(this.range, this.experimentSorted)
      )
    };
    this.confidenceIntervals = {
      80: this.getConfidenceInterval(
        this.controlSorted,
        this.experimentSorted,
        0.8
      ),
      85: this.getConfidenceInterval(
        this.controlSorted,
        this.experimentSorted,
        0.85
      ),
      90: this.getConfidenceInterval(
        this.controlSorted,
        this.experimentSorted,
        0.9
      ),
      95: this.getConfidenceInterval(
        this.controlSorted,
        this.experimentSorted,
        0.95
      ),
      99: this.getConfidenceInterval(
        this.controlSorted,
        this.experimentSorted,
        0.99
      ),
      995: this.getConfidenceInterval(
        this.controlSorted,
        this.experimentSorted,
        0.995
      ),
      999: this.getConfidenceInterval(
        this.controlSorted,
        this.experimentSorted,
        0.999
      )
    };
    this.confidenceInterval = this.getConfidenceInterval(
      this.controlSorted,
      this.experimentSorted,
      confidenceLevel
    );
    this.estimator = Math.round(
      this.getHodgesLehmann(this.controlSorted, this.experimentSorted) as number
    );
    this.sevenFigureSummary = {
      control: this.getSevenFigureSummary(this.controlSorted),
      experiment: this.getSevenFigureSummary(this.experimentSorted)
    };
    this.outliers = {
      control: this.getOutliers(
        this.controlSorted,
        this.sevenFigureSummary.control
      ),
      experiment: this.getOutliers(
        this.experimentSorted,
        this.sevenFigureSummary.experiment
      )
    };
    this.buckets = this.getBuckets(this.controlSorted, this.experimentSorted);
    this.populationVariance = {
      control: this.getPopulationVariance(this.controlSorted),
      experiment: this.getPopulationVariance(this.experimentSorted)
    };
  }

  private getOutliers(
    a: number[],
    sevenFigSum: ISevenFigureSummary
  ): IOutliers {
    const IQR = sevenFigSum[75] - sevenFigSum[25];
    const obj: IOutliers = {
      IQR,
      lowerOutlier: Math.floor(sevenFigSum[25] - 1.5 * IQR),
      upperOutlier: Math.round(sevenFigSum[75] + 1.5 * IQR),
      outliers: []
    };

    a.forEach((n) => {
      const roundedN: number = Math.round(n);
      if (roundedN < obj.lowerOutlier || roundedN > obj.upperOutlier) {
        obj.outliers.push(roundedN);
      }
    });

    return obj;
  }

  private getSevenFigureSummary(a: number[]): ISevenFigureSummary {
    return {
      min: Math.round(Math.min.apply(null, a)),
      max: Math.round(Math.max.apply(null, a)),
      10: Math.round(quantile(a, 0.1) as number),
      25: Math.round(quantile(a, 0.25) as number),
      50: Math.round(quantile(a, 0.5) as number),
      75: Math.round(quantile(a, 0.75) as number),
      90: Math.round(quantile(a, 0.9) as number)
    };
  }

  private getConfidenceInterval(
    control: number[],
    experiment: number[],
    confidenceLevel: 0.8 | 0.85 | 0.9 | 0.95 | 0.99 | 0.995 | 0.999 = 0.95
  ): IConfidenceInterval {
    const ci = confidenceInterval(control, experiment, confidenceLevel);
    const isSig =
      (ci.lower < 0 && 0 < ci.upper) ||
      (ci.lower > 0 && 0 > ci.upper) ||
      (ci.lower === 0 && ci.upper === 0)
        ? false
        : true;
    return {
      min: Math.round(Math.ceil(ci.lower * 100) / 100),
      max: Math.round(Math.ceil(ci.upper * 100) / 100),
      isSig,
      median: ci.median,
      zScore: ci.zScore,
      pValue: ci.pValue,
      U: ci.U
    };
  }

  private getHodgesLehmann(
    control: number[],
    experiment: number[]
  ): number | undefined {
    const crossProduct = cross(control, experiment, (a, b) => a - b).sort(
      (a, b) => a - b
    );
    return quantile(crossProduct, 0.5);
  }

  private getRange(
    control: number[],
    experiment: number[]
  ): { min: number; max: number } {
    const a = control.concat(experiment);
    return { min: Math.min(...a), max: Math.max(...a) };
  }

  private getHistogram(
    range: { min: number; max: number },
    a: number[]
  ): number[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const x: any = scaleLinear()
      .domain([range.min, range.max])
      .range([range.min, range.max]);
    const h = histogram()
      .value((d) => {
        return d;
      })
      .domain(x.domain())
      .thresholds(x.ticks());

    return h(a).map((i) => {
      return i.length;
    });
  }

  private getSparkline(
    numbers: number[],
    min: number = Math.min.apply(null, numbers),
    max: number = Math.max.apply(null, numbers)
  ): string {
    function lshift(n: number, bits: number): number {
      return Math.floor(n) * Math.pow(2, bits);
    }

    const ticks: string[] = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const results: string[] = [];
    let f: number = Math.floor(lshift(max - min, 8) / (ticks.length - 1));

    if (f < 1) {
      f = 1;
    }

    numbers.forEach((n: number) => {
      const value: string = ticks[Math.floor(lshift(n - min, 8) / f)];

      results.push(value);
    });

    return `${results.join('')}`;
  }

  private getBuckets(
    controlSorted: number[],
    experimentSorted: number[],
    bucketCount = 12
  ): Bucket[] {
    const { min, max } = this.range;
    const buffer = 1;
    const minBuffer = min - buffer;
    const maxBuffer = max + buffer;
    const bucketIncrementor = (maxBuffer - minBuffer) / bucketCount;
    const buckets = [];
    let count = minBuffer;
    while (count < maxBuffer) {
      buckets.push({
        min: Math.floor(count),
        max: Math.floor(count + bucketIncrementor),
        count: {
          control: 0,
          experiment: 0
        }
      });
      count += bucketIncrementor;
    }

    // since we use a buffer all samples will be caught
    // within each bucket regardless of comparator
    // and without overlap
    buckets.map((bucket) => {
      controlSorted.map((sample) => {
        if (sample >= bucket.min && sample < bucket.max) {
          bucket.count.control++;
        }
      });
      experimentSorted.map((sample) => {
        if (sample >= bucket.min && sample < bucket.max) {
          bucket.count.experiment++;
        }
      });
    });

    return buckets;
  }

  private getPopulationVariance(a: number[]): number {
    const _mean = mean(a);
    let sum = 0;
    if (_mean) {
      a.map((n) => {
        sum = sum + Math.pow(n - _mean, 2);
      });
    }
    return toNearestHundreth(sum / a.length);
  }

  // private getPower(): number {
  //   // increase sample size, increases power
  //   // decrease variance, increases power

  // }
}
