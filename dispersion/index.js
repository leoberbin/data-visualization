!function(){
    var w = 800; 
    var h = 400; 
    var p = 120; 

    const main = d3.select('main');
        
        main.append('h1')
            .attr('id', 'title')
            .text('Doping in Professional Bicycle Racing');

        main.append('h2')
            .text("35 Fastest times up Alpe d'Huez");

        main.append('h4')
            .attr('class', 'axis-guide')
            .style('transform', 'rotate(270deg)')
            .style('bottom', p + 'px')
            .style('left', 0)
            .text('Time in Minutes');
        
        main.append('div')
            .attr('id', 'tooltip');

    const svg = main.append('svg')
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
                    );
                ready();
            }); 

    const ready = () => {
        var xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
        var yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));

            var tx = 'translate('+ p +',' + (h + p/2) + ')'; 
            var ty = 'translate(' + p + ',' + p/2 + ')';
            svg.append('g')
                .attr('transform', tx)
                .attr('id', 'x-axis')
                .call(xAxis);

            svg.append('g')
                .attr('transform', ty)
                .attr('id', 'y-axis')
                .call(yAxis);

            var xl = 50
            const legend = svg.append('g')
                            .attr('id', 'legend');

            svg.selectAll('circle')
                .data(date)
                .enter()
                .append('circle')
                .attr('r', 7)
                .attr('cy', (d) => yScale(d.time))
                .attr('cx', (d) => xScale(d.year))
                .attr('data-xvalue', (d) => d.year)
                .attr('data-yvalue', (d) => d.time)
                .attr('transform', ty)
                .attr('fill', (d) => d.doping === "" ? '#AA00FF' : '#FFBD00')
                .style('stroke', 'white')
                .style('opacity', '.75')

            legend.append('g')
                .attr('class', 'legend')
                .attr('transform', 'translate(0, ' + (h / 2 - 30) + ')')
                .append('text')
                .text('No doping allegations')
                .attr('x', w / 1.5);

            legend.append('g')
                .attr('class', 'legend')
                .attr('transform', 'translate(0, ' + (h / 2) + ')')
                .append('text')
                .text('Riders with doping allegations')
                .attr('x', w / 1.5);

            legend.selectAll('g')
                .append('rect')
                .attr('width', 15)
                .attr('height', 15)
                .attr('x', w)
                .attr('y', -12);

            legend.select('g:first-child')
                .select('rect')
                .attr('fill','#FFBD00')
                
            legend.select('g:last-child')
                .select('rect')
                .attr('fill','#AA00FF');
    }
}();