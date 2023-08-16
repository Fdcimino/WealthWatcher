import { AccountWithSnapshot, Snapshot } from "@/app/page";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

const initialAccountsWithSnapshots: AccountWithSnapshot[] | undefined = []


var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };
const formatTime = d3.timeFormat("%B %d, %Y");


function getLength(div: string, style: string) {
    var width = d3.select(div)
        // get the width of div element
        .style(style)
        // take of 'px'
        .slice(0, -2)
    // return as an integer
    return Math.round(Number(width))
}

export default function LineChartBalances({ accountsWithSnapshots = initialAccountsWithSnapshots }) {
    const svgRef = useRef(null);

    useEffect(() => {
        console.log(accountsWithSnapshots)
        if (!accountsWithSnapshots || accountsWithSnapshots.length == 0)
            return;


        const lineSvg = d3.select(svgRef.current)
        let maxBalance = Math.max(...accountsWithSnapshots.map(accountsWithSnapshots => Math.max(...accountsWithSnapshots.snapshots.map(snapshot => snapshot.balance)))) + 1000;

        let dates = accountsWithSnapshots.map(function (account) {
            return account.snapshots;
        }).reduce((pre, cur) => {
            return pre.concat(cur);
        }).map((snapshot) => {
            return new Date(snapshot.date);
        });

        let oldestDate: Date = dates[0]
        let latestDate: Date = dates[0]
        for (let date of dates) {
            if (date > latestDate) {
                latestDate = date
            }
            if (date < oldestDate) {
                oldestDate = date
            }
        }
        console.log("Oldest/Latest: " + oldestDate + " " + latestDate)
        lineSvg.selectAll("*").remove();
        let g = lineSvg.append('g');

        var lineWidth = getLength('.lineGraphDiv', 'width');
        var lineHeight = getLength('.lineGraphDiv', 'height');

        var lineInnerHeight = lineHeight * .8;
        var lineInnerWidth = lineWidth * .85;


        const xScale = d3.scaleTime().domain([oldestDate, latestDate]).range([0, lineInnerWidth]);
        var yScale = d3.scaleLinear().domain([0, maxBalance]).range([lineInnerHeight, 0]);

        // X label
        g.append('text')
            .attr('x', lineInnerWidth / 2 + 50)
            .attr('y', lineInnerHeight - 15 + 70)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 12)
            .text('Date');

        // Y label
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(40,' + lineInnerHeight / 2 + ')rotate(-90)')
            .style('font-family', 'Helvetica')
            .style('font-size', 12)
            .text('Balance');

        g.append("g")
            .attr("transform", "translate(92," + (lineInnerHeight + 20) + ")")
            .attr("class", "axisGrey")
            .call(d3.axisBottom<Date>(xScale).tickFormat(d3.timeFormat("%B %d, %Y")));

        g.append("g")
            .attr("transform", "translate(80," + 20 + ")")
            .call(d3.axisRight(yScale)
                .tickSize(lineInnerWidth))
            .call(g => g.select(".domain")
                .remove())
            .call(g => g.selectAll(".tick:not(:first-of-type) line")
                .attr("stroke-opacity", 0.5))
            .call(g => g.selectAll(".tick text")
                .attr("x", -30)
                .attr("dy", -1))
                .attr("class", "")
            .call(g => g.select('.tick:first-child')
                .attr("stroke-opacity", 0))

        const line = d3.line<any>()
            .x(d => { return xScale(d.x) })
            .y(d => { return yScale(d.y) })


        let lineDatas: {x: Date, y: number}[][] = []
        
        accountsWithSnapshots.forEach((accountWithSnapshot) => {
            const lineData = accountWithSnapshot.snapshots
                .filter((snapshot) => snapshot.balance !== undefined && snapshot.date !== undefined)
                .map((snapshot) => { return { x: new Date(snapshot.date), y: snapshot.balance } })
            var randomColor = Math.floor(Math.random() * 16777215).toString(16);
            lineDatas.push(lineData)
            g.append("path")
                .attr("class", "line")
                .attr("transform", "translate(" + 80 + "," + 20 + ")")
                .attr("d", line(lineData))
                .style("fill", "none")
                .style("stroke", "#" + randomColor)
                .style("stroke-width", "2");
        })


        // Create the circle that travels along the curve of chart
        var focus = g
            .append('g')
            .append('rect')
            .attr("stroke", "red")
            .attr("height", lineInnerHeight)
            .attr("width", 2)
            .attr("y", 20)
            .style("opacity", 0)


        // Create a rect on top of the svg area: this rectangle recovers mouse position
        g.append('rect')
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('width', lineWidth)
            .attr('height', lineHeight)
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseout', mouseout);

        let tooltipTemplate = d3.select("#tooltipdiv")

        let div = d3.select("body")
            .append("div")
            .attr("class", tooltipTemplate.property("className"))
        
        // What happens when the mouse move -> show the annotations at the right positions.
        function mouseover() {
            focus.style("opacity", 1)

            div.transition()
                .duration(50)
                .style("opacity", 1);
        }

        function mousemove(event: MouseEvent) {
            // recover coordinate we need
            var x0 = xScale.invert(d3.pointer(event)[0] - 75);
            var smallestDistance = Number.MAX_VALUE;
            var i = 0;
            for(let d = 0; d < lineDatas[0].length; d++){
                
                let distance = Math.abs(lineDatas[0][d].x.getTime() - x0.getTime());
                if(smallestDistance > distance){
                    i = d;
                    smallestDistance = distance;
                }
                    
            }
            var selectedData = lineDatas[0][i]
            
            focus
                .attr("x", xScale(selectedData.x) + 80)

            function getBalance(){
                let balanceString = ""
                if(!accountsWithSnapshots)
                    return ""
                for(let accountWithSnapshot of accountsWithSnapshots){
                    balanceString += `<br> ${accountWithSnapshot.account.mask}: $${accountWithSnapshot.snapshots[i].balance}`
                }

                return balanceString
            }

            div.html(`${d3.timeFormat("%B %d, %Y")(selectedData.x)} ${getBalance()}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");

        }

        function mouseout() {
            focus.style("opacity", 0)
            div.transition()
                .duration(50)
                .style("opacity", 0);
        }




    }, [accountsWithSnapshots]);

    return (
        <div className="lineGraphDiv w-full h-full">
            <svg ref={svgRef} className="w-full h-full">
                
            </svg>
            <div id="tooltipdiv" className=" absolute text-left p-1 text-xs bg-slate-800 text-slate-50 pointer-events-none rounded-lg outline outline-5 opacity-0">

            </div>
        </div>

    )
}