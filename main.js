async function init () {
  //const data = await fetchSourceJson('./heirarchy-data.json');
  //const data = await fetchSourceJson('./heirarchy-data-mini.json');

  const csv = await fetchSourceCsv('./heirarchy.csv')
  const table = d3.csvParse(csv);
  const data = d3.stratify()
                  .id((d) => d.Name)
                  .parentId((d) => d.ParentID)(table);
  
  console.log(data);

  return;

  //initExampleChart(data);  
  initIcicleChart(data, (i) => i.countofitems); // todo: fix count of items, so it is only count of immediate children (apart from lowest level folders)
}

function initIcicleChart(data, getValue) {
  // Specify the chart’s dimensions.
  const width = 928;
  const height = 1200;

  // Create the color scale.
  const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

  // Compute the layout.
  const hierarchy = d3.hierarchy(data)
      .sum(d => getValue(d))
      .sort((a, b) => b.height - a.height || getValue(b) - getValue(a));
  const root = d3.partition()
      .size([height, (hierarchy.height + 1) * width / 3])
    (hierarchy);

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  // Append cells.
  const cell = svg
    .selectAll("g")
    .data(root.descendants())
    .join("g")
      .attr("transform", d => `translate(${d.y0},${d.x0})`);

  const rect = cell.append("rect")
      .attr("width", d => d.y1 - d.y0 - 1)
      .attr("height", d => rectHeight(d))
      .attr("fill-opacity", 0.6)
      .attr("fill", d => {
        if (!d.depth) return "#ccc";
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .style("cursor", "pointer")
      .on("click", clicked);

  const text = cell.append("text")
      .style("user-select", "none")
      .attr("pointer-events", "none")
      .attr("x", 4)
      .attr("y", 13)
      .attr("fill-opacity", d => +labelVisible(d));

  text.append("tspan")
      .text(d => d.data.name);

  const format = d3.format(",d");
  const tspan = text.append("tspan")
      .attr("fill-opacity", d => labelVisible(d) * 0.7)
      .text(d => ` ${format(d.value)}`);      

  cell.append("title").text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);  

  // On click, change the focus and transitions it into view.
  let focus = root;
  function clicked(event, p) {
    focus = focus === p ? p = p.parent : p;

    root.each(d => d.target = {
      x0: (d.x0 - p.x0) / (p.x1 - p.x0) * height,
      x1: (d.x1 - p.x0) / (p.x1 - p.x0) * height,
      y0: d.y0 - p.y0,
      y1: d.y1 - p.y0
    });

    const t = cell.transition().duration(750)
        .attr("transform", d => `translate(${d.target.y0},${d.target.x0})`);

    rect.transition(t).attr("height", d => rectHeight(d.target));
    text.transition(t).attr("fill-opacity", d => +labelVisible(d.target));
    tspan.transition(t).attr("fill-opacity", d => labelVisible(d.target) * 0.7);
  }
  
  function rectHeight(d) {
    return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
  }

  function labelVisible(d) {
    return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
  }

  d3.select('#icicle-container').node().appendChild(svg.node());
  //return svg.node();
}

async function fetchSourceJson(fileName) {
  try {
    const response = await fetch(fileName);
    var json = await response.json();
    return json[0];
  } 
  catch (error) {
    console.error("Unable to fetch data:", error);
  }
}

async function fetchSourceCsv(fileName) {
  try {
    const response = await fetch(fileName);
    var csv = await response.text();
    return csv;
  } 
  catch (error) {
    console.error("Unable to fetch data:", error);
  }
}

function initExampleChart(data) {
  // Declare the chart dimensions and margins.
  const width = 640;
  const height = 400;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 40;
  
  // Declare the x (horizontal position) scale.
  const x = d3.scaleUtc()
      .domain([new Date("2023-01-01"), new Date("2024-01-01")])
      .range([marginLeft, width - marginRight]);
  
  // Declare the y (vertical position) scale.
  const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height - marginBottom, marginTop]);
  
  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height);
  
  // Add the x-axis.
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x));
  
  // Add the y-axis.
  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y));
  
  // Append the SVG element.
  d3.select('#icicle-container').node().appendChild(svg.node());  
}

document.addEventListener("DOMContentLoaded", async (arg) => { await init(); }, false);
