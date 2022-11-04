const type = (d) => ({ date: d.Date, price: +d.Close });

const ready = (data) => {
    const sorted = data.sort((a, b) => d3.descending(a.date, b.date));
    console.log('sorted => ', sorted);

    const margin = { top: 40, left: 40, bottom: 40, right: 40 };

    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // container
    const svg = d3.select('.chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // scales
    const xExtent = d3.extent(sorted, d => new Date(d.date));

    const xScale = d3.scaleLinear()
        .domain(xExtent)
        .range([0, width]);

    const yExtent = d3.extent(sorted, d => d.price);

    const yScale = d3.scaleLinear()
        .domain(yExtent)
        .range([height, 0]);

    // axis
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(x => {
            const date = new Date(x);
            return `${date.getDate() + 1}/${date.getMonth() + 1}/${date.getFullYear()}`
        })
        .ticks(8)
        .tickSizeOuter(0);

    const xAxisDraw = svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(y => `${y}$`)
        .tickSizeOuter(0)
        .tickSizeInner(-width);

    const yAxisDraw = svg
        .attr('class', 'y-axis')
        .append('g')
        .call(yAxis);


    // drawing line
    const lineGen = d3.line().x(d => xScale(new Date(d.date))).y(d => yScale(d.price));

    const chartGroup = svg.append('g').attr('class', 'line-chart');

    chartGroup
        .selectAll('.line-series')
        .data([{ values: sorted }])
        .enter()
        .append('path')
        .attr('class', `line-series`)
        .attr('d', (d) => lineGen(d.values))
        .style('fill', 'none')
        .style('stroke', '#ff8a65');
};

d3.csv('https://www.marketwatch.com/investing/stock/path/downloaddatapartial?startdate=01/03/2022 00:00:00&enddate=11/02/2022 23:59:59&daterange=d30&frequency=p1d&csvdownload=true&downloadpartial=false&newdates=false', type).then((data) => {
    console.log('data ->', data);
    ready(data);
});