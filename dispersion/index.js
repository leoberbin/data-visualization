!function(){
    var w = 800; 
    var h = 400; 
    var p = 60; 

    let main = d3.select('main');
        
        main.append('h1')
            .attr('id', 'title')
            .text('Doping in Professional Bicycle Racing');

        main.append('h2')
            .text("35 Fastest times up Alpe d'Huez");

        main.append('h4')
            .attr('class', 'axis-guide')
            .style('transform', 'rotate(270deg)')
            .style('bottom', p * 2 + 'px')
            .style('left', -p + 'px')
            .text('Time in Minutes');

        main.append('h4')
            .attr('class', 'axis-guide')
            .style('bottom', -p / 4 + 'px')
            .style('left', w - p + 'px')
            .text('Years');

    let svg = main.append('svg')
        .attr('width', w + p)
        .attr('height', h + p)

let date;
let xScale = d3.scaleLinear().range([0, w - p]);
let yScale = d3.scaleTime().range([0, h]);

        d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
            .then(data => {
                date = data.map(d => {
                    var time = d['Time'].split(':');
                    return {
                            time : new Date(0, 0, 1, 0, time[0], time[1]),
                            year : d['Year'],
                            doping : d['Doping']
                        };
                });
                    xScale.domain([
                        d3.min(data, d => {
                            return d.Year - 1;
                        }),
                        d3.max(data, d => {
                            return d.Year + 1;
                        })
                    ]);

                    yScale.domain(
                        d3.extent(date, d => {
                            return d.time;
                        })
                    )
                ready();
            }); 

    const ready = () => {
        var xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
        var yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));

            var tx = 'translate('+ p +',' + (h + p/2) + ')'; 
            var ty = 'translate(' + p + ',' + p/2 + ')'
            svg.append('g')
                .attr('transform', tx)
                .attr('id', 'x-axis')
                .call(xAxis)

            svg.append('g')
                .attr('transform', ty)
                .attr('id', 'y-axis')
                .call(yAxis)

            svg.selectAll('circle')
                .data(date)
                .enter()
                .append('circle')
                .attr('r', 7)
                .attr('cy', (d) => yScale(d.time))
                .attr('cx', (d) => xScale(d.year))
                .attr('transform', ty)
                .attr('fill', (d) => d.doping === "" ? '#AA00FF' : '#FFBD00')
                .style('stroke', 'white')
                .style('opacity', '.75')
    }
}();