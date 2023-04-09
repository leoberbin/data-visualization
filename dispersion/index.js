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
                            minutes : d['Time'],
                            name : d['Name'],
                            nationality : d['Nationality'],
                            doping : d['Doping'],
                            link : d['URL']
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
                .attr('id', (_,i) => i)
                .attr('class', 'dot')
                .attr('r', 7)
                .attr('cy', (d) => yScale(d.time))
                .attr('cx', (d) => xScale(d.year))
                .attr('data-xvalue', (d) => d.year)
                .attr('data-yvalue', (d) => d.time.toISOString())
                .attr('transform', ty)
                .attr('fill', (d) => d.doping === "" ? '#AA00FF' : '#FFBD00')
                .style('stroke', 'white')
                .style('cursor', 'pointer')
                .style('opacity', '.75')
                .on('mouseover', (event) => {
                    const i = event.target.id; 
                    const t = d3.select('#tooltip');

                        t.append('div')
                            .text(date[i]['nationality'])
                            .style('text-align', 'left')
                            .style('width', '50%')

                        t.append('div')
                            .text(date[i]['year'])
                            .style('text-align', 'right')
                            .style('width', '50%')

                        t.append('div')
                            .text(date[i]['name'])
                            .style('width', '100%')
                            .style('text-align', 'center')
                            .style('font-size', '1.25rem')

                        t.append('div')
                            .text(date[i]['doping'])
                            .style('font-size', '.85rem')

                        t.append('div')
                            .text('CLICK')
                            .style('width', '100%')
                            .style('font-size', '.7rem')
                            .style('color', 'red')

                            t.transition()
                                .attr('data-year', date[i]['year'])
                                .style('left', xScale(date[i]['year']) + 'px')
                                .style('top', yScale(date[i]['time']) + 'px')
                                .transition().duration(150).style('opacity', 1);
                })
                .on('mouseout', () => {
                    const t = d3.select('#tooltip');
                        t.html('')
                            .transition().duration(150).style('opacity', 0);
                })
                .on('click', (event) => {
                    const i = event.target.id; 
                    const link = date[i]['link']
                        window.open(link, '_blank');
                });

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
    };
}();