const box = {
    'width' : 1200,
    'height' : 30 * 12, 
    'padding' : 30, 
    'margin' : 20,
};

const keyColor = [
    "#053061",
    "#2166ac",
    "#4393c3",
    "#92c5de",
    "#d1e5f0",
    "#f7f7f7",
    "#fddbc7",
    "#f4a582",
    "#d6604d",
    "#b2182b",
    "#67001f"
];

async function getDataFromAPI() {
    const response = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json');
    const data = await response.json();
    return data;
};

(async function build() {    
    const data = await getDataFromAPI();

        const dataset = data['monthlyVariance'];
        const base = data['baseTemperature'];
        
        box.width = 4 * Math.ceil(dataset.length / 12);
        const {width, height, padding, margin} = box;
        // definimos main dentro del body e insertamo h2 para titulo y h3 para subtitulo
        // o descripcion, luego se define svg dentro del main.  
        const main = 
            d3.select('body')
              .append('main')

            main.append('h2')
                .attr('id', 'title')
                .text('Monthly Global Land-Surface Temperature');

            main.append('h3')
                .attr('id', 'description')
                .text('1753 - 2015: base temperature 8.66 ℃');
            
            const tooltip = main.append('div')
                               .attr('id', 'tooltip')
                               .attr('data-year', 'none')

        const svg = 
            main.append('svg')
                .attr('width', width + padding *  2 + margin)
                .attr('height', height + padding * 2 + margin);

        const year = [], 
              month = [], 
              variance = [];
        // separameos los datos en cada objeto y los asignamos a las constantes
        // year, month y variance ya declaradas 
        dataset.forEach(Element => {
            year.push( Element['year'] ); 
            month.push( 
                Element['month'] - 1
            ); 
            variance.push( Element['variance']);
        });
        
        // definimos las escalas 
            const x = d3.scaleBand()
                  .domain( year )
                  .range([ 0, width]); 
        
            const y = d3.scaleBand()
                  .domain( month )
                  .rangeRound([ 0, height]); 
                  
        // definimos los ejes
        const xAxis =
                d3.axisBottom(x)
                  .tickValues(
                      x.domain()
                      .filter(year => { 
                          return year % 10 === 0; 
                      })
                   )
                  .tickFormat( d3.format('d') );
                  
        const yAxis = 
                d3.axisLeft(y)
                  .tickFormat(function (month) {
                      const date = new Date(0);
                        date.setUTCMonth(month);
                      const format = d3.utcFormat('%B');
                      return format(date);
                    }); 

        // insertamos los ejes
                svg.append('g')
                   .attr('id', 'x-axis')
                   .attr(
                    'transform', 'translate(' + (padding * 2) + ',' + height + ')'
                    )
                   .call(xAxis);
                    
                svg.append('g')
                   .attr('id', 'y-axis')
                   .attr(
                    'transform', 'translate(' + (padding * 2) + ',0)'
                    )
                   .call(yAxis);

        const min = base + d3.min( variance ); 
        const max = base + d3.max( variance ); 
        // en este punto se crea un array con los umbrales de temperatura y una escala basada en este
        const temperature =   
            (function(){
                const average = (max - min) / keyColor.length;
                const arr = [];
                for (let i = 1; i < keyColor.length; i++){
                    const values = min + (i * average); 
                        arr.push( Math.round( values * 10 ) / 10 );
                };
                return arr; 
            })();

        const threshold = 
            d3.scaleThreshold()
              .domain( temperature )
              .range ( keyColor ); 

        // definimos la escala y eje de legend
        const tempScale =
                d3.scaleLinear()
                  .domain([ min, max ])
                  .range([ 0, width / 3 ]);
            
        const temoAxis = 
                d3.axisBottom()
                  .scale(tempScale)
                  .tickValues( temperature )
                  .tickFormat(d3.format('.1f'));

        // insertamos legend en svg 
        const legend = 
            svg.append('g')
               .attr('id', 'legend')
               .attr('transform', 'translate(' + (padding * 2) + ',' + (height + 2 * padding) + ')')

            // insertamos los cuadros de colores
            let spacingColor = 1.25; // este valor separa los cuadros de colores en legend
            legend.append('g')
                  .selectAll('rect')
                  .data(
                    keyColor.map(color => {
                        const avg = threshold.invertExtent(color);
                            !avg[0] ? avg[0] = min :
                            !avg[1] ? avg[1] = max : null; 
                            return avg
                    })
                  )      
                  .enter()    
                  .append('rect')
                  .attr('x', (d) => tempScale(d[0]) + spacingColor)
                  .attr('y', -padding - spacingColor)
                  .attr('width', (d, i) =>
                    i > 0 && i < (keyColor.length - 1) ? // omitimos el primer y ultimo cuadro de color 
                    tempScale(d[1]) - tempScale(d[0]) - (spacingColor * 2) : 0
                  )
                  .attr('height', padding)
                  .attr('fill', (d) => threshold(d[0]))
                  .attr('stroke', '#800000')
                  .attr('stroke-width', spacingColor + 'px');
                  
            // insertamos el eje
            legend.append('g')
                  .call( temoAxis )

            // insertamos los datos para generar rect elements 
            svg.append('g')
               .attr('transform', 'translate(' + (padding * 2) + ',0)')
               .selectAll('rect')
               .data(dataset)
               .enter()
               .append('rect')
               .classed('cell', true)
               .attr('data-month', (_, i) => month[i])
               .attr('data-year', (_, i) => year[i])
               .attr('data-temp', (_, i) => base + variance[i])
               .attr('x', (_, i) => x( year[i] ))
               .attr('y', (_, i) =>  y( month[i] ))
               .attr('width', (_, i) => x.bandwidth( year[i] ))
               .attr('height', (_, i) => y.bandwidth( month[i] ))
               .attr('fill', (_, i) => threshold( base + variance[i] ))
               .on('mouseover', event => {
                    const e = event.target
                    // tomamos los datos necesarios para imprimir en tooltip
                    const year = e.getAttribute('data-year'); 
                    const month = parseFloat(e.getAttribute('data-month')) + 1;
                    const temp = parseFloat(e.getAttribute('data-temp')).toFixed(1);  
                    let variance = base - parseFloat(temp);

                    // definimos date para extraer el nombre del mes correspondiente al valor en data-month
                    const date = new Date( year + '-' + month.toString() + '-1');
                    const format = d3.timeFormat('%B');

                    // imprimimos los span con los datos en cadena de texto
                    tooltip.append('span')
                           .text( format(date) + ' - ' + year )

                    tooltip.append('span')
                           .text( temp + ' ºC' )
                           .style('font-size', '2rem')

                    tooltip.append('span')
                           .text(function(){ 
                                let str = variance > 0 ? 'increase' : 'decrease'
                                return 'There was a ' + str + ' of ∼ '+ variance.toFixed(1).replace(/-/, "") + ' ºC'
                            })
                           .style('font-size', '.8rem')

                    tooltip.attr('data-year', year)
                           .style('top', e.getAttribute('y') + 'px')
                           .style('left', e.getAttribute('x') + 'px')
                           .transition().duration(150).style('opacity', 1);
               })
               .on('mouseout', () => {
                // finalmente removemos todo dentro de tooltip cuando el mouse deja de estar sobre un rect especifico
                    tooltip.html('')
                           .transition().duration(150).style('opacity', 0)
               })
})();





