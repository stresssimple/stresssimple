import { Controller, Get, Param } from '@nestjs/common';
import { InfluxService } from '../influxdb/influx.service';
import { RunsService } from './runs.service';

@Controller('runs/report')
export class RunReportController {
  constructor(
    private influx: InfluxService,
    private runs: RunsService,
  ) {}

  @Get(':runId')
  async getRunReport(@Param('runId') runId: string) {
    const run = await this.runs.getRun(runId);
    if (!run) {
      return null;
    }
    run.startTime = new Date(run.startTime);
    run.endTime = run.endTime ? new Date(run.endTime) : null;
    run.lastUpdated = new Date(run.lastUpdated);
    const startTime = new Date(run.startTime.getTime() - 1000);

    const endTime = new Date((run.endTime ?? run.lastUpdated).getTime() + 1000);

    return {
      users: await this.usersData(runId, startTime, endTime),
      http: await this.httpRequestsData(runId, startTime, endTime),
      rps: await this.rpsData(runId, startTime, endTime),
    };
  }

  private async rpsData(runId: string, startTime: Date, endTime: Date) {
    const duration = endTime.getTime() - startTime.getTime();
    const windowPeriod = Math.ceil(duration / 1000 / 200) + 's';

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
        label: r._time,
        value: r._value,
        category: r.name,
      }))
      .reduce(
        (
          acc: {
            labels: string[];
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

  private async usersData(runId: string, startTime: Date, endTime: Date) {
    const duration = endTime.getTime() - startTime.getTime();
    const windowPeriod = Math.ceil(duration / 1000 / 200) + 's';

    const query = `from(bucket: "test-runs")
  |> range(start: ${startTime.toISOString()}, stop: ${endTime.toISOString()})
  |> filter(fn: (r) => r["_measurement"] == "test_duration")
  |> filter(fn: (r) => r["runId"] == "${runId}")
  |> group(columns: ["_measurement", "runId", "_field","userId"])
  |> aggregateWindow(every: ${windowPeriod}, fn: count, createEmpty: false)
  |> group(columns: ["_measurement", "runId", "_field"])
  |> aggregateWindow(every: ${windowPeriod}, fn: count, createEmpty: false)
  |> yield(name: "median")`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.influx.queryApi.collectRows<any>(query);
    const labels = result.map((r) => r._time);
    const values = result.map((r) => r._value);

    return {
      labels,
      data: {
        'active users': values,
      },
    };
  }

  private async httpRequestsData(
    runId: string,
    startTime: Date,
    endTime: Date,
  ) {
    const duration = endTime.getTime() - startTime.getTime();
    const windowPeriod = Math.ceil(duration / 1000 / 200) + 's';

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
        label: r._time,
        value: r._value,
        category: r.name,
      }))
      .reduce(
        (
          acc: {
            labels: string[];
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
}
