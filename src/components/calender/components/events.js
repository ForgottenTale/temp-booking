import * as d3 from 'd3';
import { select } from 'd3';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import './events.scss';

export default function Events({ day }) {

    const ref = useRef();
    const [active, setActive] = useState(false);
    const [prevDay, setPrevDay] = useState(false);

    useEffect(() => {

        var d = new Date();
        d.setHours(0, 0, 0, 0);
        if (d.toISOString() === day.toISOString()) {
            setActive(true);
        }

        const margin = { top: 70, right: 0, bottom: 30, left: 0 };
        const height = 1500;
        const barStyle = {
            startPadding: 2,
            endPadding: 3,
        };
        const svg = select(ref.current);

        if (d.toISOString().slice(0, 10) <= day.toISOString().slice(0, 10)) {
            setPrevDay(true);
        }
        else if (d.toISOString().slice(0, 10) > day.toISOString().slice(0, 10)) {
            setPrevDay(false);
        }

        var node = ref.current;
        node.querySelectorAll('*').forEach(n => n.remove());

        var dates = [];

        if (day.events !== null) {
            dates = [
                ...day.events.map(d => new Date(d.startTime)),
                ...day.events.map(d => new Date(d.endTime))
            ];
        }
        else {
            dates.push(new Date());
        }
       
        var minTime = new Date(dates[0]);
        minTime.setHours(0, 0, 0, 0);


        var maxTime = new Date(dates[0]);
        maxTime.setHours(24, 0, 0, 0);

        const yScale = d3
            .scaleTime()
            .domain([minTime, maxTime])
            .range([margin.top, height - margin.bottom]);


        const gridLines = d3
            .axisRight()
            .ticks(24)
            .tickSize(ref.current.clientWidth)
            .tickFormat('')
            .scale(yScale);

        svg
            .append('g')
            .attr('class', 'svg_gridlines')
            .call(gridLines);

        if (day.events !== null) {

            const barGroups = svg
                .selectAll('g.barGroup')
                .data(day.events)
                .join('g')
                .attr('class', 'svg_barGroup');

            barGroups
                .append('rect')
                .attr('x', margin.left)
                .attr('y', d => yScale(new Date(d.startTime)) + barStyle.startPadding)
                .attr('height', d => {
                    const startPoint = yScale(new Date(d.startTime));
                    const endPoint = yScale(new Date(d.endTime));
                    return (
                        endPoint - startPoint - barStyle.endPadding - barStyle.startPadding
                    );
                })
                .attr('class', 'svg_barGroup_rect');


            barGroups
                .append('text')
                .attr('x', margin.left + 10)
                .attr('y', d => yScale(new Date(d.startTime)) + 20)
                .text(d => d.title)
                .attr('class', 'svg_barGroup_text');

            barGroups
                .append('text')
                .attr('x', margin.left + 10)
                .attr('y', d => yScale(new Date(d.startTime)) + 40)
                .text(d => d.speakerName)
                .attr('class', 'svg_barGroup_agent');

            barGroups
                .append('rect')
                .attr('x', margin.left)
                .attr('y', d => yScale(new Date(d.startTime)) + barStyle.startPadding)
                .attr('height', d => {
                    const startPoint = yScale(new Date(d.startTime));
                    const endPoint = yScale(new Date(d.endTime));
                    return (
                        endPoint - startPoint - barStyle.endPadding - barStyle.startPadding
                    );
                })
                .attr('class', 'svg_barGroup_rectDes');

        }


    }, [day])


    return (
        <div className="events">
            {prevDay ? <div className={active ? "events_date_active" : "events_date"}>{day.format("DD")}</div> :
                <div className="events_date prevDay">{day.format("DD")}</div>}
            {prevDay ? <svg className="svg" ref={ref} /> : <svg className="svg prevDay" ref={ref} />}
        </div>
    );
}
