'use client';

import * as d3 from 'd3';
import { getISOWeeksInYear, getWeek, getWeekYear } from 'date-fns';
import * as React from 'react';

export default function SubmissionActivity({ activity }) {
  React.useEffect(() => {
    if (activity && activity.length > 0) {
      const data = formatData(activity);

      const startDay = activity[0]['day'];
      const endDay = activity[activity.length - 1]['day'];

      createHeatmap(data, startDay, endDay);
    }
  }, [activity]);

  return (
    <div className="border border-grey-600 rounded-t">
      <div className="bg-carnation-400 text-white rounded-t border-stone-200 block text-sm font-semibold leading-6 p-2 uppercase">
        Submission Activity Graph
      </div>
      <div className="py-4 px-6 bg-white">
        <div className="h-auto">
          <div className="activity-graph"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * A utility class which creates an SVG activity graph heatmap.
 *
 * Various parts adapted from calendar-heatmap:
 * https://github.com/DKirwan/calendar-heatmap MIT License
 */
function createHeatmap(data, startDay, endDay) {
  const cellSize = 12;
  const locale = {
    months: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
  };

  const firstDate = new Date(startDay);
  const lastDate = new Date(endDay);
  const parseTime = d3.timeParse('%Y-%m-%d');
  const dateRange = d3.timeDay.range(parseTime(startDay), parseTime(endDay));
  const monthRange = d3.timeMonths(firstDate, lastDate);

  // Determines color based on input (i.e., [0 - maxCount])
  const formatColor = d3
    .scaleQuantize()
    .domain([0, data.maxCount])
    .range(['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b']);

  // Remove existing graph if it exists
  d3.select('.activity-heatmap').remove();

  // Create graph
  const svg = d3
    .select('.activity-graph')
    .append('svg')
    .attr('class', 'activity-heatmap')
    .attr('viewBox', '0 0 800 115')
    .classed('svg-content', true);

  // Draw day rectangles
  svg
    .selectAll('.day')
    .data(dateRange)
    .enter()
    .append('rect')
    .attr('class', 'day-cell')
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('fill', (d) => {
      const currentDayRectDate = d3.timeFormat('%Y-%m-%d')(d);
      const currentDayRectCount = data['dates'][currentDayRectDate]['count'];

      return formatColor(currentDayRectCount);
    })
    .attr('x', function (d) {
      const cellDate = d;

      const result =
        getWeek(cellDate) -
        getWeek(firstDate) +
        getISOWeeksInYear(firstDate) *
          (getWeekYear(cellDate) - getWeekYear(firstDate));
      return result * (cellSize + cellSize * 0.15);
    })
    .attr('y', function (d) {
      return 20 + d.getDay() * (cellSize + cellSize * 0.15);
    });

  // Draw month labels
  svg
    .selectAll('.month')
    .data(monthRange)
    .enter()
    .append('text')
    .attr('class', 'month-name')
    .attr('font-size', 14)
    .text(function (d) {
      return locale.months[d.getMonth()];
    })
    .attr('x', function (d) {
      let matchIndex = 0;
      dateRange.find(function (element, index) {
        matchIndex = index;

        return (
          d.getMonth() === element.getMonth() &&
          d.getYear() === element.getYear()
        );
      });

      return Math.floor(matchIndex / 7) * (cellSize + cellSize * 0.15);
    })
    .attr('y', 10);
}

function formatData(data) {
  let maxCount = 0;
  const dateLUT = {};

  for (const object of data) {
    if (object['submission_count'] > maxCount) {
      maxCount = object['submission_count'];
    }

    dateLUT[object['day']] = {
      count: object['submission_count'],
    };
  }

  return {
    dates: dateLUT,
    maxCount,
    startDate: data[0]['day'],
  };
}
