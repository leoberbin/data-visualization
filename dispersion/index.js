!function(){
    var w = 800; 
    var h = 400; 
    var p = 60; 

    let main = d3.select('main')
        .append('h1')
        .attr('id', 'title')
        .text('Doping in Professional Bicycle Racing');

        main.append('h4')
            .text("35 Fastest times up Alpe d'Huez");

    let svg = main.append('svg')
        .attr('width', w + p)
        .attr('height', h + p)
        .style('background-color', 'gray')

let date;
let xScale = d3.scaleLinear().range([0, w - p]);
let yScale = d3.scaleTime().range([0, h]);

        d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
            .then(data => {
                date = data.map(d => {
                    var time = d['Time'].split(':');
                    return {
                            time : new Date(0, 0, 1, 0, time[0], time[1]),
                            year : d['Year']
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

            svg.append('g')
                .attr('transform', 'translate('+ p +',' + (h + p/2) + ')')
                .attr('id', 'x-axis')
                .call(xAxis); 

            svg.append('g')
                .attr('transform', 'translate(' + p + ',' + p/2 + ')')
                .attr('id', 'y-axis')
                .call(yAxis)
    }
}();