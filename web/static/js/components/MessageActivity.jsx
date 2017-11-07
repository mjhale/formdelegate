import React from 'react';
import * as d3 from 'd3';

class MessageActivity extends React.Component {
  componentDidMount() {
    const { activity } = this.props;
    if (activity) this.drawChart();
  }

  componentDidUpdate() {
    const { activity } = this.props;
    if (activity) this.drawChart();
  }

  drawChart() {
    const { activity } = this.props;

    const svg = d3.select('.activity-graph'),
      margin = { top: 20, right: 20, bottom: 20, left: 20 },
      width = +svg.attr('width') - margin.left - margin.right,
      height = +svg.attr('height') - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .rangeRound([0, width])
      .padding(0.1);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const g = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    x.domain(
      activity.map(function(d) {
        return d.day;
      })
    );

    y.domain([
      0,
      d3.max(activity, function(d) {
        return d.message_count > 10 ? d.message_count : 10;
      }),
    ]);

    g
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));

    g
      .append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Frequency');

    g
      .selectAll('.bar')
      .data(activity)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function(d) {
        return x(d.day);
      })
      .attr('y', function(d) {
        return y(d.message_count);
      })
      .attr('width', x.bandwidth())
      .attr('height', function(d) {
        return height - y(d.message_count);
      });
  }

  render() {
    return (
      <div className="message-activity">
        <div className="card-header">Message Activity Graph</div>
        <div className="card">
          <svg
            className="activity-graph"
            width="700"
            height="200"
            viewBox="0 0 700 200"
          />
        </div>
      </div>
    );
  }
}

export default MessageActivity;
