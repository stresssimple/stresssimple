import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { InfluxService } from '../influxdb/influx.service';
import { RunsService } from './runs.service';

@Controller('runs/report')
export class RunReportController {
  constructor(
    private influx: InfluxService,
    private runs: RunsService,
  ) {}

  @Get(':runId')
  async getRunReport(
    @Param('runId') runId: string,
    @Query('dp') dataPoints: number = 50,
  ) {
    const run = await this.runs.getRun(runId);
    if (!run) {
      return null;
    }
    run.startTime = new Date(run.startTime);
    run.endTime = run.endTime ? new Date(run.endTime) : null;
    run.lastUpdated = new Date(run.lastUpdated);
    let startTime = new Date(run.startTime.getTime() - 1000 * 60 * 60 * 24);

    let endTime = new Date(
      (run.endTime ?? run.lastUpdated).getTime() + 1000 * 60 * 60 * 24,
    );

    const times = await this.getMinMaxTime(runId, startTime, endTime);
    if (!times) {
      return {};
    }
    startTime = times.minTime;
    startTime.setMilliseconds(0);
    endTime = times.maxTime;
    endTime.setMilliseconds(0);
    const duration = endTime.getTime() - startTime.getTime();
    const windowPeriod = Math.ceil(duration / 1000 / dataPoints) + 's';

    const result = {
      users: await this.usersData(runId, startTime, endTime, windowPeriod),
      http: await this.httpDurationData(
        runId,
        startTime,
        endTime,
        windowPeriod,
      ),
      rps: await this.rpsData(runId, startTime, endTime, windowPeriod),
    };

    const durationVsRps: Record<string, { x: number; y: number }[]> = {};
    for (const key of Object.keys(result.http.data)) {
      durationVsRps[key] = [];
      for (let i = 0; i < result.http.data[key].length; i++) {
        durationVsRps[key].push({
          y: result.http.data[key][i],
          x: result.rps.data[key][i],
        });
      }
    }

    result['durationVsRps'] = durationVsRps;
    return result;
  }

  private async rpsData(
    runId: string,
    startTime: Date,
    endTime: Date,
    windowPeriod: string,
  ) {
    const query = `from(bucket: "test-runs")
  |> range(start: ${startTime.toISOString()}, stop: ${endTime.toISOString()})
  |> filter(fn: (r) => r["_measurement"] == "http_request")
  |> filter(fn: (r) => r["runId"] == "${runId}")
  |> filter(fn: (r) => r["_field"] == "duration")
  |> aggregateWindow(every:1s, fn: count, createEmpty: true)
  |> aggregateWindow(every: ${windowPeriod}, fn: mean, createEmpty: true)
  |> yield(name: "count")`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.influx.queryApi.collectRows<any>(query);
    return result
      .map((r) => ({
        label: (Date.parse(r._time) - startTime.getTime()) / 1000,
        value: r._value,
        category: r.name,
      }))
      .reduce(
        (
          acc: {
            labels: number[];
            data: Record<string, number[]>;
          },
          cur,
        ) => {
          if (!acc.labels.includes(cur.label)) {
            acc.labels.push(cur.label);
          }
          if (!acc.data[cur.category]) {
            acc.data[cur.category] = [];
          }
          acc.data[cur.category].push(cur.value);
          return acc;
        },
        {
          labels: [],
          data: {},
        },
      );
  }

  private async usersData(
    runId: string,
    startTime: Date,
    endTime: Date,
    windowPeriod: string,
  ) {
    const query = `from(bucket: "test-runs")
  |> range(start: ${startTime.toISOString()}, stop: ${endTime.toISOString()})
  |> filter(fn: (r) => r["_measurement"] == "running_users")
  |> filter(fn: (r) => r["runId"] == "${runId}")
  |> aggregateWindow(every: ${windowPeriod}, fn: mean, createEmpty: true)
  |> yield(name: "median")`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.influx.queryApi.collectRows<any>(query);
    const labels = result.map(
      (r) => (Date.parse(r._time) - startTime.getTime()) / 1000,
    );
    const values = result.map((r) => r._value);

    return {
      labels,
      data: {
        'active users': values,
      },
    };
  }

  private async httpDurationData(
    runId: string,
    startTime: Date,
    endTime: Date,
    windowPeriod: string,
  ) {
    const query = `from(bucket: "test-runs")
  |> range(start: ${startTime.toISOString()}, stop: ${endTime.toISOString()})
  |> filter(fn: (r) => r["_measurement"] == "http_request")
  |> filter(fn: (r) => r["runId"] == "${runId}")
  |> filter(fn: (r) => r["_field"] == "duration")
  |> aggregateWindow(every: ${windowPeriod}, fn: median, createEmpty: true)
  |> yield(name: "median")`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.influx.queryApi.collectRows<any>(query);
    return result
      .map((r) => ({
        label: (Date.parse(r._time) - startTime.getTime()) / 1000,
        value: r._value,
        category: r.name,
      }))
      .reduce(
        (
          acc: {
            labels: number[];
            data: Record<string, number[]>;
          },
          cur,
        ) => {
          if (!acc.labels.includes(cur.label)) {
            acc.labels.push(cur.label);
          }
          if (!acc.data[cur.category]) {
            acc.data[cur.category] = [];
          }
          acc.data[cur.category].push(cur.value);
          return acc;
        },
        {
          labels: [],
          data: {},
        },
      );
  }

  private async getMinMaxTime(runId: string, startTime: Date, endTime: Date) {
    const query = `
min_time = from(bucket: "test-runs")
  |> range(start: ${startTime.toISOString()}, stop: ${endTime.toISOString()})
  |> filter(fn: (r) => r["runId"] == "${runId}")
  |> group(columns: []) // ensures no grouping
  |> min(column: "_time")
  |> rename(columns: {_time: "min_time"})

max_time = from(bucket: "test-runs")
  |> range(start: ${startTime.toISOString()}, stop: ${endTime.toISOString()})
  |> filter(fn: (r) => r["runId"] == "${runId}")
  |> group(columns: []) // ensures no grouping
  |> max(column: "_time")
  |> rename(columns: {_time: "max_time"})

union(tables: [min_time, max_time])`;
    const result = await this.influx.queryApi.collectRows<any>(query);
    if (result.length === 0) {
      return null;
    }

    const r = {
      minTime: new Date(result[1].min_time ?? result[0].min_time),
      maxTime: new Date(result[0].max_time ?? result[1].max_time),
    };
    return r;
  }
}
