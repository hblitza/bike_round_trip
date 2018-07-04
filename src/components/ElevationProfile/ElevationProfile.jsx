import React from 'react';
import PropTypes from 'prop-types';

import { isEqual, isFunction } from 'lodash';
import { select, mouse } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { bisector } from 'd3-array';
import { curveMonotoneX, line, area } from 'd3-shape';
import { axisLeft, axisBottom } from 'd3-axis';
import { format } from 'd3-format';

/**
 * Class ElevationProfile
 *
 * @class ElevationProfile
 * @extends React.Component
 */
export class ElevationProfile extends React.Component {

  /**
   * The properties.
   * @type {Object}
   */
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    elevationData: PropTypes.array,
    lineLength: PropTypes.number,
    onLineHighlight: PropTypes.func,
    t: PropTypes.func,
    intersectPoints: PropTypes.array
  }

  /**
   * The default props
   */
  static defaultProps = {
    elevationData: [],
    intersectPoints: [],
    lineLength: -1,
    onLineHighlight: () => {}
  }

  /**
   * @constructs ElevationProfile
   */
  constructor(props) {
    super(props);

    this.state = {
      chartMargin: {
        top: 10,
        right: 5,
        bottom: 40,
        left: 50
      }
    };
  }

  /**
   * componentDidMount - init SVG and draw initial chart based on props
   */
  componentDidMount() {
    const { chartMargin } = this.state;

    select(this._svg)
      .append('g')
      .attr('transform', 'translate(' + chartMargin.left + ', ' +
                        chartMargin.top + ')');

    this.drawChart(this.props);
  }

  /**
   * componentWillReceiveProps - check if chart needs to be redrawn
   *
   * @param {Object} nextProps new props of component
   */
  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.elevationData, nextProps.elevationData) ||
        !isEqual(this.props.intersectPoints, nextProps.intersectPoints) ||
        !isEqual(this.props.lineLength, nextProps.lineLength) ||
        !isEqual(this.props.width, nextProps.width) ||
        !isEqual(this.props.height, nextProps.height)) {
      this.drawChart(nextProps);
    }
  }

  /**
   * drawChart - (re-) draw chart for based on the results of elevation profile
   * WPS using D3
   *
   * @param {Object} config object (e.g. props) holding dataset and component
   * dimensions
   */
  drawChart = config => {
    const { t } = this.props;
    const { chartMargin } = this.state;
    const { elevationData, lineLength, width, height, intersectPoints } = config;
    const chartWidth = width - chartMargin.left - chartMargin.right;
    const chartHeight = height - chartMargin.top - chartMargin.bottom;

    let sum = 0;
    let minHeight = 1000;
    let maxHeight = -1000;

    if (elevationData.length === 0) {
      return;
    }

    const chartData = elevationData.map((val, idx) => {
      let x;
      const z = val[2];
      minHeight = Math.min(z, minHeight);
      maxHeight = Math.max(z, maxHeight);
      if (idx === 0) {
        x = 0;
      } else {
        const dx = (val[0] - elevationData[idx - 1][0]) / 1000;
        const dy = (val[1] - elevationData[idx - 1][1]) / 1000;
        sum += Math.sqrt(dx * dx + dy * dy);
      }
      return {
        x: idx === 0 ? x : sum,
        z: z
      };
    });
    let newSum = 0;
    const chartIntersects = intersectPoints.map((val, idx) => {
      let x;
      if (idx === 0) {
        x = 0;
      } else {
        const dx = (val[0] - intersectPoints[idx - 1][0]) / 1000;
        const dy = (val[1] - intersectPoints[idx - 1][1]) / 1000;
        newSum += Math.sqrt(dx * dx + dy * dy);
      }
      return {
        x: idx === 0 ? x : newSum,
      };
    });

    const xDomain = [0, lineLength / 1000];

    const xScale = scaleLinear()
      .domain(xDomain)
      .range([0, chartWidth]);
    const yDomain = [minHeight, maxHeight];

    const yScale = scaleLinear()
      .domain(yDomain)
      .nice()
      .range([chartHeight, 0]);

    const lineFunc = line()
      .curve(curveMonotoneX)
      .defined(function(d) {
        if (d.x === false) {
          return null;
        } else {
          return d;
        }
      })
      .x(function(d) {
        return xScale(d.x);
      })
      .y(function(d) {
        return yScale(d.z);
      });

    const StraightLineFunc = line()
      .x(function(d) {
        return xScale(d[0]);
      })
      .y(function(d) {
        return d[1];
      });

    const areaFunc = area()
      .curve(curveMonotoneX)
      .defined(function(d) {
        if (d.x === false) {
          return null;
        } else {
          return d;
        }
      })
      .x(function(d) {
        return xScale(d.x);
      })
      .y0(function(d) {
        return yScale(d.z);
      })
      .y1(chartHeight);

    const axisY = axisLeft(yScale).tickFormat(format(',.0f'));
    const axisX = axisBottom(xScale).tickFormat(format(',.2f'));

    const chartSvg = select(this._svg).select('g');
    const chartXAxis = chartSvg.select('g.x.axis');
    const chartYAxis = chartSvg.select('g.y.axis');
    const chartElevPath = chartSvg.select('.elev-path');
    const chartElevArea = chartSvg.select('.elev-area');
    const chartIntersectLines = chartSvg.selectAll('.intersect-path');
    chartXAxis.remove();
    chartYAxis.remove();
    chartElevPath.remove();
    chartElevArea.remove();
    chartIntersectLines.remove();

    // add area chart
    chartSvg.append('g')
      .append('path')
      .attr('class', 'elev-area')
      .datum(chartData)
      .attr('d', areaFunc);

    // add line chart
    chartSvg.append('g').append('path')
      .attr('class', 'elev-path')
      .datum(chartData)
      .attr('d', lineFunc);

    // add focus text and circle to indicate mouse position in chart
    const focus = chartSvg.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

    focus.append('circle')
      .attr('class', 'focus-circle')
      .attr('r', 6);

    focus.append('text')
      .attr('class', 'focus-text')
      .attr('x', 9)
      .attr('dy', '.5em');

    chartSvg.append('rect')
      .attr('class', 'point-elevation-overlay')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .on('mouseover', () => focus.style('display', null) )
      .on('mouseout',  () => focus.style('display', 'none'))
      .on('mousemove', this.onChartMouseMove.bind(this, xScale, yScale, chartData, focus));

    chartSvg.append('g')
      .attr('class', 'y axis')
      .call(axisY)
      .append('text')
      .attr('transform', function() {
        const parentNode = select(this.parentNode).node();
        if (!parentNode || !parentNode.getBBox) {
          return;
        }
        console.log(parentNode)
        debugger
        const axisBbbox = parentNode.getBBox();
        return 'rotate(-90) translate(' + axisBbbox.height / -2 + ', 0)';
      })
      .attr('dy', -35)
      .attr('fill', '#000')
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', 12)
      .text(t('ElevationProfile.yAxisText'));

    chartSvg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + chartHeight + ')')
      .call(axisX)
      .append('text')
      .attr('transform', function() {
        const parentNode = select(this.parentNode).node();
        if (!parentNode || !parentNode.getBBox) {
          return;
        }
        const axisBbbox = parentNode.getBBox();
        return 'translate(' + axisBbbox.width / 2 + ', 0)';
      })
      .attr('dy', 35)
      .attr('fill', '#000')
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', 12)
      .text(t('ElevationProfile.xAxisText'));

    // add lines representing the inserted point's position in the chart
    // with the corresponding point numbers
    chartIntersects.map((point,i)=>{
      if (i != 0 ){
        let g = chartSvg.append('g')
          .attr('class', 'intersect-path')
          .datum([[point.x,20],[point.x,chartHeight]]);
        g.append('path')
          .attr('class', 'cross-section ' + 'p-' + i)
          .attr('d',StraightLineFunc);
        g.append('text')
          .attr('class', 'intersect-text')
          .attr('x', xScale(point.x))
          .attr('dy', '.5em')
          .attr('dx', '-.3em')
          .text(function() { return i + 1; });
      }
    });

  }

  /**
   * onChartMouseMove - call onLineHighlight based on the coordinate derived by
   * mouse position on chart.
   *
   * @param {Object} xScale    The linear scale of abzissa
   * @param {Object} yScale    The linear scale of ordinate
   * @param {Array} chartData  The chart data
   * @param {Object} focus     The description
   */
  onChartMouseMove = (xScale, yScale, chartData, focus) => {
    const { chartMargin } = this.state;
    const bisectDate = bisector(function(d) {return d.x;}).left;
    const xValCurrent = xScale.invert(mouse(this._svg)[0] - chartMargin.left);
    const idx = bisectDate(chartData, xValCurrent, 1);
    const d0 = chartData[idx - 1];
    const d1 = chartData[idx];
    const d = xValCurrent - d0.x > d1.x - xValCurrent ? d1 : d0;

    focus.attr('transform', 'translate(' + xScale(d.x) + ',' + yScale(d.z) + ')');
    focus.select('text').text(`${d.z} m`);

    const { onLineHighlight } = this.props;
    if (isFunction(onLineHighlight)) {
      onLineHighlight(this.props.elevationData[idx]);
    }
  }

  /**
   * The render function
   */
  render() {
    const { width, height } = this.props;
    return (
      <svg
        width={width}
        height={height}
        ref={ svg => this._svg = svg }
      />
    );
  }
}

export default ElevationProfile;
