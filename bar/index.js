const dataset = [];

(function(){
    fetch('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json')
        .then(res => res.json())
        .then(response => {
            dataset.push(...response.data);
            ready();
        });
})();

const ready = function(){
const getDate = dataset.map(data => {
    return new Date(data[0]);
});

const getValue = dataset.map(data => {
    return data[1];
});

const w = 800; 
const h = 400; 
let wr = w/dataset.length;
let padding = 60; 

d3.select('main')
    .style('width', (w + 100) + 'px')

d3.select('#holder')
    .style('position', 'relative')
    .append('div')
    .attr('id', 'tooltip')
    .style('display', 'none');
    
const svg = d3
    .select('#holder')
    .append('svg')
    .attr('width', w + padding)
    .attr('height', h + padding);

let x = new Date(d3.max(getDate));
    x.setMonth(
        x.getMonth() + 5
    );

const xScale = d3.scaleTime()
    .domain([d3.min(getDate), x])
    .range([0, w]);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(getValue)])
    .range([h,  0]);

const xAxis = d3.axisBottom().scale(xScale);
const yAxis = d3.axisLeft().scale(yScale);
    
    svg.append('g')
        .attr('transform', 'translate('+ padding + ',' + h + ')')
        .attr('id', 'x-axis')
        .call(xAxis);

    svg.append('g')
        .attr('transform', 'translate('+ padding + ',0)')
        .attr('id', 'y-axis')
        .call(yAxis);

    svg.selectAll('rect')
       .data(getValue)
       .enter()
       .append('rect')
       .attr('data-date', (_, i) => dataset[i][0])
       .attr('data-gdp', (d) => d)
       .attr('class', 'bar')
       .attr('x', (_, i) => xScale(getDate[i]))
       .attr('y', (d) => yScale(d))
       .attr('width', wr)
       .attr('height', (d) => h - yScale(d))
       .attr('transform', 'translate(' + padding + ',0)')
       .attr('fill', '#00FF00')
       .attr('id', (_, i) => i)
       .on('mouseover', (event) => {
            const i = event.target.id; 
            let gdp = '$' + getValue[i] + ' Billion'
            let date = dataset[i][0]
            let html = '<div>'+ date +'</div>' +
                        '<div>'+ gdp +'<div>'
                d3.select('#tooltip')
                    .html(html)
                    .attr('class', 'tooltip')
                    .attr('data-date', date)
                    .style('bottom', padding * 2 + 'px')
                    .style('left', (xScale(getDate[i]) + (padding * 1.5)) + 'px')
                    .transition().duration(150).style('opacity', 1);
       })
       .on('mouseout', () => {
            d3.select('.tooltip').transition().duration(150).style('opacity', 0);
       })
};
