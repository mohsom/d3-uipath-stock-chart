const renderLineChart = (data) => {
    const formatDate = (x) => {
        const date = new Date(x);
        return `${date.getDate() + 1}/${date.getMonth() + 1}/${date.getFullYear()}`
    };

    const sorted = data.sort((a, b) => d3.ascending(a.date, b.date));
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
    const xExtent = d3.extent(sorted, d => d.date);

    const xScale = d3.scaleLinear()
        .domain(xExtent)
        .range([0, width]);

    const yExtent = d3.extent(sorted, d => d.price);

    const yScale = d3.scaleLinear()
        .domain(yExtent)
        .range([height, 0]);

    // axis
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(formatDate)
        .ticks(8)
        .tickSizeOuter(0);

    svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(y => `${y}$`)
        .tickSizeOuter(0)
        .tickSizeInner(-width);

    svg
        .append('g')
        .attr('class', 'y-axis')
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
        .style('stroke', '#dd2c00');

    const bisectDate = d3.bisector((d) => { return d.date }).left;

    const tip = d3.select('.tooltip');

    const focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 3)
        .attr("fill", '#757de8');

    const line = svg.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', height)
        .style('stroke-width', 1)
        .style('stroke', '#757de8')
        .style('stroke-dasharray', 3)
        .style("opacity", 0);;

    d3.select('svg')
        .on('mouseover', (e) => {
            tip.style('opacity', 1);
            focus.style('display', 'block');
            line.style('opacity', 1);
        })
        .on('mousemove', (e) => {
            tip.style('left', `${e.clientX}px`);
            tip.style('top', `${e.clientY}px`);

            const x0 = Math.round(xScale.invert(d3.pointer(e)[0]));

            const i = bisectDate(sorted, x0, 1);

            const d0 = sorted[i - 1];
            const d1 = sorted[i];
            const d = x0 - d0.date > d1.date - x0 ? d1 : d0;

            const bodyData = [
                ['Date', formatDate(d.date)],
                ['Price', d.price]
            ];

            const tipX = xScale(d.date);
            const tipY = yScale(d.price);

            tip.style('left', `${tipX}px`);
            tip.style('top', `${tipY}px`);

            focus.attr("transform", "translate(" + tipX + "," + tipY + ")");
            line.style("transform", `translateX(${tipX}px)`);

            d3.select('.tip-body')
                .selectAll('p')
                .data(bodyData)
                .join('p')
                .attr('class', 'tip-info')
                .html(d => `${d[0]}: ${d[1]}`)

        })
        .on('mouseout', (e) => {
            tip.style('opacity', 0);
            focus.style('display', 'none');
            line.style('opacity', 0)
        });
};



d3.csv('https://www.marketwatch.com/investing/stock/path/downloaddatapartial?startdate=01/03/2022 00:00:00&enddate=11/02/2022 23:59:59&daterange=d30&frequency=p1d&csvdownload=true&downloadpartial=false&newdates=false', (d) => ({ date: new Date(d.Date).getTime(), price: +d.Close })).then((data) => {
    console.log('data ->', data);
    renderLineChart(data);
});