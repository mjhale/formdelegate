import * as d3 from 'd3';
import moment from 'moment';
import React from 'react';
import styled from 'styled-components/macro';

import Card from 'components/Card';

const GraphContainer = styled.div`
  height: auto;
`;

const Graph = styled.div`
  margin: 0 auto;
  max-width: 750px;
`;

class SubmissionActivity extends React.Component {
  componentDidMount() {
    const { activity } = this.props;
    if (activity && activity.length > 0) this.drawChart();
  }

  componentDidUpdate() {
    const { activity } = this.props;
    if (activity && activity.length > 0) this.drawChart();
  }

  /**
   * A utility class which creates an SVG activity graph heatmap.
   *
   * Various aspects adapted from calendar-heatmap:
   * https://github.com/DKirwan/calendar-heatmap
   */
  createHeatmap(data, startDay, endDay) {
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

    const firstDate = moment(startDay);
    const lastDate = moment(endDay);
    const parseTime = d3.timeParse('%Y-%m-%d');
    const dateRange = d3.timeDay.range(parseTime(startDay), parseTime(endDay));
    const monthRange = d3.timeMonths(
      moment(firstDate).startOf('month').toDate(),
      lastDate
    );

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
      .attr('viewBox', '0 0 730 115')
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
      .attr('fill', d => {
        const currentDayRectDate = d3.timeFormat('%Y-%m-%d')(d);
        const currentDayRectCount = data['dates'][currentDayRectDate]['count'];

        return formatColor(currentDayRectCount);
      })
      .attr('x', function (d, i) {
        const cellDate = moment(d);
        const result =
          cellDate.week() -
          firstDate.week() +
          firstDate.weeksInYear() *
            (cellDate.weekYear() - firstDate.weekYear());
        return result * (cellSize + cellSize * 0.15);
      })
      .attr('y', function (d, i) {
        return 20 + d.getDay() * (cellSize + cellSize * 0.15);
      });

    // Draw month labels
    svg
      .selectAll('.month')
      .data(monthRange)
      .enter()
      .append('text')
      .attr('class', 'month-name')
      .attr('font-size', 10)
      .text(function (d) {
        return locale.months[d.getMonth()];
      })
      .attr('x', function (d, i) {
        let matchIndex = 0;
        dateRange.find(function (element, index) {
          matchIndex = index;
          return (
            moment(d).isSame(element, 'month') &&
            moment(d).isSame(element, 'year')
          );
        });

        return Math.floor(matchIndex / 7) * (cellSize + cellSize * 0.15);
      })
      .attr('y', 10);
  }

  drawChart() {
    const { activity } = this.props;

    const data = this.formatData(activity);

    const startDay = activity[0]['day'];
    const endDay = activity[activity.length - 1]['day'];

    this.createHeatmap(data, startDay, endDay);
  }

  formatData(data) {
    let maxCount = 0;
    let dateLUT = {};

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

  render() {
    return (
      <Card header="Submission Activity Graph">
        <GraphContainer>
          <Graph className="activity-graph" />
        </GraphContainer>
      </Card>
    );
  }
}

export default SubmissionActivity;
