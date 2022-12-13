const margin = { top: 40, left: 40, bottom: 40, right: 40 };

const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const productivityData = [{ day: 'Monday', productive: 4, idle: 1 }, { day: 'Tuesday', productive: 2, idle: 5 }, { day: 'Wednesday', productive: 8, idle: 3 }]

const formatDate = (x) => {
    const date = new Date(x);
    return `${date.getDate() + 1}/${date.getMonth() + 1}/${date.getFullYear()}`
};

const renderBarChart = (data) => {
    const svg = d3.select('.barchart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    const x = d3.scaleBand()
        .domain(d3.map(data, d => d.day))
        .range([0, width])
        .padding(0.02);

    svg.append("g")
        .attr('class', 'x-axis-1')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
        .domain([0, 15])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    const barsContainer = svg.append('g');

    const addTooltip = (svg) => {
        const tip = d3.select('.tooltip');

        svg.selectAll('.bar-group')
            .on('mouseover', (e) => {
                tip.style('opacity', 1);
            })
            .on('mousemove', (e, d) => {
                tip.style('left', `${e.clientX + 20}px`);
                tip.style('top', `${e.clientY + 20}px`);

                d3.select(e.currentTarget)
                    .attr('stroke-width', 1)
                    .attr('stroke', '#000');

                const bodyData = [
                    ['Day', d.day],
                    ['Productivity', d.productive],
                    ['Idle', d.idle],
                ];

                d3.select('.tip-body')
                    .selectAll('p')
                    .data(bodyData)
                    .join('p')
                    .attr('class', 'tip-info')
                    .html(d => `${d[0]}: ${d[1]}`)

            })
            .on('mouseout', (e) => {
                tip.style('opacity', 0);
                d3.select(e.currentTarget)
                    .attr('stroke-width', 0)
            });
    };

    const drawItems = (arr, xScale, yScale) => {
        const dataJoin = barsContainer
            .selectAll('g')
            .data(arr)

        dataJoin.join(
            enter => {
                const groupSel = enter
                    .append('g')
                    .attr('class', 'bar-group')

                groupSel
                    .append('rect')
                    .attr('class', 'prod')
                    .attr("width", xScale.bandwidth())
                    .attr('y', d => yScale(d.productive))
                    .attr("height", (d) => yScale(0) - yScale(d.productive))
                    .transition().duration(300)
                    .attr('x', d => xScale(d.day))
                    .attr('opacity', 1)
                    .attr("fill", '#377eb8')

                groupSel
                    .append('rect')
                    .attr('class', 'idle')
                    .attr("width", xScale.bandwidth())
                    .attr('y', d => yScale(d.idle) - yScale(0) + yScale(d.productive))
                    .attr("height", (d) => yScale(0) - yScale(d.idle))
                    .transition().duration(300)
                    .attr('x', d => xScale(d.day))
                    .attr('opacity', 1)
                    .attr("fill", '#e41a1c')

                return groupSel;
            },
            update => {
                update.selectAll('.prod')
                    .transition().duration(300)
                    .attr('x', d => xScale(d.day))
                    .attr('y', d => yScale(d.productive))
                    .attr("height", (d) => yScale(0) - yScale(d.productive))
                    .attr("width", xScale.bandwidth());

                update.selectAll('.idle')
                    .transition().duration(300)
                    .attr('x', d => xScale(d.day))
                    .attr('y', d => yScale(d.idle) - yScale(0) + yScale(d.productive))
                    .attr("height", (d) => yScale(0) - yScale(d.idle))
                    .attr("width", xScale.bandwidth())
                return update;
            },
            exit => {
                return exit.remove();
            });

        addTooltip(svg);
    };

    drawItems(data, x, y);

    d3.select('#upd-bar').on('click', () => {
        const dataUpdate = [...data, { day: 'Thursday', productive: 6, idle: 1 }];

        x.domain(d3.map(dataUpdate, d => d.day));

        svg.select('.x-axis-1').transition().duration(300).call(d3.axisBottom(x));

        drawItems(dataUpdate, x, y);
    });
};

const renderLineChart = (data) => {
    const sorted = data.sort((a, b) => d3.ascending(a.date, b.date));

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

    d3.select('.chart > svg')
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

const renderHeatmapChart = (data) => {
    const transformData = (input) => {
        const groups = d3.groups(input, item => item.month, item => item.day);

        return d3.map(groups, (monthGroup) => {
            return d3.map(monthGroup[1], (dayGroup) => {
                return d3.map(dayGroup[1], (d) => {
                    return {
                        month: monthGroup[0],
                        avgPrice: d3.median(dayGroup[1], i => i.price),
                        avgVolume: d3.median(dayGroup[1], i => i.volume),
                        day: dayGroup[0],
                    };
                })
            }).flat()
        }).flat();
    };



    const drawHeatmapItems = (svg, d, xScale, yScale, colorScale) => {
        svg.selectAll('rect')
            .data(d)
            .join(
                enter => {
                    enter.append('rect')
                        .transition().duration(300)
                        .attr('x', (d) => xScale(d.month))
                        .attr('y', (d) => yScale(d.day))
                        .attr('width', xScale.bandwidth())
                        .attr('height', yScale.bandwidth())
                        .attr('fill', (d) => colorScale(d.avgVolume))
                },
                update => {
                    update
                        .transition().duration(300)
                        .style('opacity', 0)
                        .attr('x', (d) => xScale(d.month))
                        .attr('y', (d) => yScale(d.day))
                        .attr('width', xScale.bandwidth())
                        .attr('height', yScale.bandwidth())
                        .attr('fill', (d) => colorScale(d.avgVolume))
                        .style('opacity', 1)
                },
                exit => {
                    exit.transition().duration(300).style('opacity', 0).remove();
                },
            )
    };

    const addTooltip = (svg) => {
        const tip = d3.select('.tooltip');

        svg.selectAll('rect')
            .on('mouseover', (e) => {
                tip.style('opacity', 1);
            })
            .on('mousemove', (e, d) => {
                tip.style('left', `${e.clientX + 20}px`);
                tip.style('top', `${e.clientY + 20}px`);

                d3.select(e.currentTarget)
                    .attr('stroke-width', 1)
                    .attr('stroke', '#000');

                const bodyData = [
                    ['Month', monthNames[d.month]],
                    ['Day', d.day],
                    ['Avg Volume', d.avgVolume],
                    ['Avg Price', d.avgPrice],
                ];

                d3.select('.tip-body')
                    .selectAll('p')
                    .data(bodyData)
                    .join('p')
                    .attr('class', 'tip-info')
                    .html(d => `${d[0]}: ${d[1]}`)

            })
            .on('mouseout', (e) => {
                tip.style('opacity', 0);
                d3.select(e.currentTarget)
                    .attr('stroke-width', 0)
            });
    };

    const chartData = transformData(data);

    const xScale = d3.scaleBand()
        .domain(d3.map(chartData, i => i.month))
        .range([0, width])
        .padding(0.01);

    const yScale = d3.scaleBand()
        .domain(d3.map(chartData, i => i.day).sort(d3.ascending))
        .range([height, 0])
        .padding(0.02);

    const colorScale = d3.scaleLinear()
        .range(["#c8e6c9", "#1b5e20"])
        .domain([d3.min(chartData, d => d.avgVolume), d3.max(chartData, d => d.avgVolume)])

    // render container
    const renderSvg = () => d3.select('.heatmap')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    const svg = renderSvg();


    // axis
    const xAxis = d3.axisBottom(xScale)
        .tickFormat((v) => monthNames[v])
        .ticks(12)
        .tickSizeOuter(0);

    const yAxis = d3.axisLeft(yScale)
        .ticks(31)
        .tickSizeOuter(0)
        .tickSizeInner(-width);

    svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .transition().duration(300)
        .call(xAxis);

    svg
        .append('g')
        .attr('class', 'y-axis')
        .transition().duration(300)
        .call(yAxis);

    drawHeatmapItems(svg, chartData, xScale, yScale, colorScale);

    d3.select('#upd').on('click', () => {
        const dataUpdate = chartData.slice(100, 200);

        xScale.domain(d3.map(dataUpdate, i => i.month));
        yScale.domain(d3.map(dataUpdate, i => i.day).sort(d3.ascending));

        svg.select('.x-axis').transition().duration(300).call(xAxis);
        svg.select(".y-axis").transition().duration(300).call(yAxis)

        drawHeatmapItems(svg, dataUpdate, xScale, yScale, colorScale);
    });

    addTooltip(svg);
};


renderBarChart(productivityData);

d3.csv('https://www.marketwatch.com/investing/stock/path/downloaddatapartial?startdate=01/03/2022 00:00:00&enddate=11/02/2022 23:59:59&daterange=d30&frequency=p1d&csvdownload=true&downloadpartial=false&newdates=false',
    (d) => ({
        date: new Date(d.Date).getTime(),
        price: +d.Close,
        volume: +d.Volume.replaceAll(',', ''),
        month: new Date(d.Date).getMonth(),
        day: new Date(d.Date).getDate(),
    }))
    .then((data) => {
        renderLineChart(data);
        renderHeatmapChart(data);
    });