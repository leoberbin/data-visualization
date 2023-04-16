const colors = ['#424645','#506662','#548D83', '#42B4A0', '#2DD4B6', '#07F6CB']; 

var size = 50;
var axis_size = colors.length * size; 
var width = 900; 
var height = 600; 

const path = d3.geoPath();
const axios = function(req){
    return d3.json(req); 
};

const educ = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"; 
const usa = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([axios(educ), axios(usa)])
        .then(data => {
            ready(data[0], data[1]); 
        })

function ready(education, usa){
    const svg = d3.select('#content')
                  .append('svg')
                  .attr('width', width)
                  .attr('height', height + size); 
    
    const legend = svg.append('g')
                      .attr('id', 'legend')
                      .attr('transform', 'translate(' + (width - axis_size) / 2 + ',' + 0 + ')');

    const percentage = 
        colors.map((_, i, arr) => {
            const length = arr.length;
            const index = i + 1; 
            
            return (55 / length) * index; 
        });

    const x = d3.scaleLinear()
                .domain([0, d3.max(percentage)])
                .range([0, axis_size]); 

    const threshold = d3.scaleThreshold()
                        .domain(percentage)
                        .range( colors ); 
    
    const axis = d3.axisBottom()
                   .scale(x)
                   .tickValues([0 , ...percentage])
                   .tickFormat(function (x) {
                    return Math.round(x) + '%';
                  }); 

        legend.append('g')
              .selectAll('rect')
              .data(
                threshold.range().map(d => {
                    d = threshold.invertExtent(d);
                        !d[0] ? d[0] = 0 : null; 
                    
                    return d; 
                })
              )
              .enter()
              .append('rect')
              .attr('x', d => x(d[0]))
              .attr('y', 0)
              .attr('width', size)
              .attr('height', size/4)
              .attr('fill', d => threshold(d[0]))

        legend.append('g')
              .call(axis)

              d3.select('.domain').remove();
              d3.selectAll('line').attr('y2', size/4 * 1.5);
              d3.selectAll('.tick').select('text').attr('y', size/4 * 2);

    svg.append('g')
       .attr('class', 'counties')
       .selectAll('path')
       .data(topojson.feature(usa, usa.objects.counties).features)
       .enter()
       .append('path')
       .attr('class', 'county')
       .attr('data-fips', d => d.id)
       .attr('data-education', d => {
            const data = education.filter(o => {
                return o.fips === d.id; 
            })[0]; 
            if(data){
                return data.bachelorsOrHigher
            }
            console.log('could find data for: ', d.id);
            return 0
       })
       .attr('fill', d => {
          const i = education.findIndex(educ => educ.fips === d.id);
          const value = education[i] ? education[i].bachelorsOrHigher : 0; 
            return threshold(value)
       })
       .attr('d', path)
       .on('mouseover', (event) => {
            const e = event.target; 
            const fips = e.getAttribute('data-fips');
            const bachelorsOrHigher = e.getAttribute('data-education') 

            const data = education.filter(o => {
                return o.fips === parseFloat(fips); 
            })[0]; 
            
            const state = data.state; 
            const area = data['area_name']; 

            d3.select('#tooltip')
              .attr('data-education', bachelorsOrHigher)
              .html(
                '<p>'+ area + ', ' + state + ': ' + bachelorsOrHigher + '%' + '</p>'
              )
              .style('left', event.pageX + 'px')
              .style('top', event.pageY - (size * 2) + 'px')
              .transition().duration(150).style('opacity', 1); 

       })
       .on('mouseout', function(){
            d3.select('#tooltip').transition(0).duration(150).style('opacity', 0); 
       })
}