const dataset = {
    'video-game' : {
        title : "Video Game Sales",
        description : "Top 100 Most Sold Video Games Grouped by Platform",
        url : "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
    },
    'movie' : {
        title : "Movie Sales",
        description : "Top 100 Highest Grossing Movies Grouped By Genre",
        url : "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
    },
    'kickstarter' : {
        title : "Kickstarter Pledges",
        description : "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
        url : "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"
    }
}; 

const colors = [
    '#D32F2F', '#C2185B', '#7B1FA2', '#512DA8', '#303F9F', 
    '#1976D2', '#0288D1', '#0097A7', '#00796B', '#388E3C',
    '#689F38', '#AFB42B', '#FBC02D', '#FFA000', '#F57C00',
    '#E64A19', '#5D4037', '#616161', '#455A64', '#263238'
]; 

const buttonChanger = document.querySelectorAll('.change-promise')
    buttonChanger.forEach(button => {
        button.addEventListener('click', (event) => {
            const e = event.target.id; 
            console.log(e)
                hanletChange(dataset[e]); 
        });
    })

const svg = d3.select('#treemap')
              .attr('width', 900)
              .attr('height', 600); 

let w = 900

const legend = d3.select('#legend')
                 .style('margin', '2rem auto');

const tooltip = d3.select('#tooltip'); 

const hanletChange = (obj) => {
    const {title, description, url} = obj;
    
    svg.selectAll('*')
       .remove();
    
    legend.selectAll('*')
          .remove();

        d3.select('#title')
          .text(title);
        
        d3.select('#description')
          .text(description);

        d3.json(url).then( data => 
            ready(data)
        );
}; 

const ready = (data) => {
    const {children} = data; 
    const legendKeyColor = 
        d3.scaleOrdinal()
          .domain(children.map(item => {return item.name}))
          .range(children.map((_, index) => {return colors[index]}));

    const tree = d3.treemap()
                   .size([w, 570])
                   .paddingInner(1);

    const hierarchy = d3.hierarchy(data)
                        .eachBefore( d  => {
                            d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
                        })
                        .sum(d => {
                            return d.value; 
                        })
                        .sort((a, b) => {
                            return b.height - a.height || b.value - a.value;
                        });

      tree(hierarchy)

      const dataForVisualization = 
        svg.selectAll('g')
           .data(hierarchy.leaves())
           .enter()
           .append('g')
           .attr('transform', d => 'translate(' + d.x0 + ',' + d.y0 + ')');

    dataForVisualization
      .append('rect')
      .attr('id', d => d.data.id)
      .attr('class', 'tile')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('data-name', d => d.data.name)
      .attr('data-category', d => d.data.category)
      .attr('data-value', d => d.data.value)
      .attr('fill', d => legendKeyColor(d.data.category) + 'cc')
      .on('mouseover', (event, d) => {
        tooltip.html(
            'Name: ' + d.data.name + 
            '<br>' +
            'Category: ' + d.data.category + 
            '<br>' +
            'Value: ' + d.data.value
          )
          .attr('data-value', d.data.value)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px')
          .transition().duration(150).style('opacity', .9);
      })
      .on('mouseout', () => {
            tooltip.html('')
                   .transition().duration(150).style('opacity', 0)
      }); 

    dataForVisualization
      .append('text')
      .attr('fill', '#CFD8DC')
      .style('font-size', '.7rem')
      .selectAll('tspan')
      .data(d  =>  d.data.name.split(" "))
      .enter()
      .append('tspan')
      .attr('x', 4)
      .attr('y', (d, i)  => 10 + i * 10)
      .text(d =>  d);
    
    legend.attr('width', w)
          .attr('height', legendKeyColor.range().length / 4 * 30)
          .selectAll('g')
          .data(legendKeyColor.range())
          .enter()
          .append('g')
          .attr('transform', (_, i) => 'translate('+ (30 + (i % 5 * w/5)) +',' + Math.floor(i/5) * 30 + ')')
          .append('rect')
          .attr('class', 'legend-item')
          .attr('width', 20)
          .attr('height', 20)
          .attr('fill', d => d + 'cc')
          .attr('stroke', 'white');

    legend.selectAll('g')
          .append('text')
          .attr('x', 25)
          .attr('y', 15)
          .text((_, i) => legendKeyColor.domain()[i])
          .attr('fill', 'gray');
}; 

hanletChange(dataset['video-game']);