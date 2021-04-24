import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { select } from 'd3';

function TimeSeries() {

    const ref = useRef();

    useEffect(() => {

        const svg = select(ref.current)
        var node= ref.current;
        node.querySelectorAll('*').forEach(n => n.remove());

        const margin = { top: 70, right: 30, bottom: 30, left: 50 }; 
        const height = 1500;
  

        var minTime = new Date();
        minTime.setHours(0, 0, 0, 0);


        var maxTime = new Date();
        maxTime.setHours(24, 0, 0, 0);

        const yScale = d3
            .scaleTime()
            .domain([minTime, maxTime])
            .range([margin.top, height - margin.bottom]);

     
        const yAxis = d3
            .axisLeft()
            .ticks(24)
            .scale(yScale);
        
        svg
            .append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .attr('opacity', 0.5)
            .call(yAxis);

        svg
            .selectAll('g.tick')
            .filter((d, i, ticks) => i === 0 || i === ticks.length - 1)
            .select('text')
            .text('12 AM');


    }, []);
    return (
       
            <svg width="50" height="1500"  ref={ref}></svg>
       
    );
}

export default TimeSeries;