const d3 = window.d3;
var data, groupByYear, xRange, xDomain, xScale, yRange, yDomain, yScale;
const btns = [];
const sceneData = [];
const margin = 100;
const width = 900 - margin * 2;
const height = 900 - margin * 2;
let currentScene = 0;
const annotationList = [];
function getEntry(x) {
	return groupByYear.filter(a_i => a_i.Year === x)[0];
}
window.onload = async function () {
	btns[0] = document.getElementById("btn1");
	btns[1] = document.getElementById("btn2");
	btns[2] = document.getElementById("btn3");
	data = await d3.csv("./data/History_of_Mass_Shootings_in_the_USA.csv");
	data = data.reverse();
	data.forEach(d => {
		d.Total = +d.Total;
		d.Date = new Date(d.Date);
	});
	groupByYear = d3.group(data, d => d.Date.getFullYear());
	groupByYear = [...groupByYear.entries()].map(d => {
		return {
			Year: d[0],
			YearTotal: d[1].reduce((a, b) => a + b.Total, 0),
		};
	});
	xRange = [0, width];
	xDomain = d3.extent(groupByYear, d => d.Year);
	xScale = d3.scaleLinear().domain(xDomain).range(xRange);
	yRange = [height, 0];
	yDomain = d3.extent(groupByYear, d => d.YearTotal);
	yScale = d3.scaleLinear().domain(yDomain).range(yRange);
	annotationList.push(
		{
			id: "pre-2000",
			note: {
				title: "1923-2000",
				label: "Before 2000, the annual average casualty for mass shooting is less than 30",
			},
			x: 545,
			y: 677,
			dx: -55,
			dy: -57,
			subject: {
				width: -550,
				height: 44,
			},
		},
		{
			id: "vegas",
			note: {
				title: "2017 Las Vegas shooting",
				label: "A man in a hotel opened fire on a music festival and killed 60 people and injured 867 others. This is the dealiest mass shooting incident in US history.",
			},
			data: getEntry(2017),
			dx: -105,
			dy: -150,
			subject: {
				radius: 18.5,
			},
		},
		{
			id: "now",
			note: {
				title: "2021",
				label: "50% jump in active-shooter incidents from 2020 to 2021 according to FBI.",
			},
			data: getEntry(2021),
			dx: -54,
			dy: 39,
		}
	);
	sceneData[0] = {
		data: groupByYear.filter(d => d.Year <= 2000),
		aList: [annotationList[0]],
		aStyle: d3.annotationCalloutRect,
	};
	sceneData[1] = {
		data: groupByYear.filter(d => d.Year <= 2017),
		aList: annotationList.slice(0, 2),
		aStyle: d3.annotationCalloutCircle,
	};
	sceneData[2] = {
		data: groupByYear.filter(d => d.Year <= 2021),
		aList: annotationList,
		aStyle: d3.annotationCalloutCircle,
	};
	render(currentScene);
};

function next(button) {
	currentScene = (currentScene + 1) % 3;
	btns.forEach(btn => {
		btn.classList.remove("selected");
	});
	btns[currentScene].classList.add("selected");
	render(currentScene);
}

function render(scene, button) {
	// clear old content
	currentScene = scene;
	if (button) {
		btns.forEach(btn => {
			btn.classList.remove("selected");
		});
		button.classList.add("selected");
	}
	const svg = d3.select("svg").selectAll("*").remove();
	drawChart(scene);
	drawAnnotations(scene);
	drawTooltips(scene);
}

function drawChart(scene) {
	const svg = d3.select("svg");
	const path = svg.append("path");

	// y axis
	svg.append("g")
		.attr("transform", `translate(${margin},${margin})`)
		.call(d3.axisLeft(yScale))
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("fill", "black") //set the fill here
		.attr("transform", `rotate(-90)translate(${-height / 2},-45)`)
		.text("Year Total Casualty");
	// x axis
	svg.append("g")
		.attr("transform", `translate(${margin},${height + margin})`)
		.call(
			d3
				.axisBottom(xScale)
				.ticks((xDomain[1] - xDomain[0]) / 5)
				.tickFormat(x => x)
		)
		.append("text")
		.attr("fill", "black") //set the fill here
		.attr("transform", `translate(${width / 2},35)`)
		.text("Time (Year)");
	var line = d3
		.line()
		.x(d => xScale(d.Year))
		.y(d => yScale(d.YearTotal))
		.curve(d3.curveMonotoneX);

	path.datum(sceneData[scene].data)
		.attr("class", "line")
		.attr("transform", `translate(${margin},${margin})`)
		.attr("d", line)
		.style("fill", "none")
		.style("stroke", "red")
		.style("stroke-width", "2");
}

function drawAnnotations(scene) {
	const svg = d3.select("svg");
	let makeLabelAnnotations = d3
		.annotation()
		.type(sceneData[scene].aStyle)
		.accessors({
			x: d => xScale(d.Year),
			y: d => yScale(d.YearTotal),
		})
		.accessorsInverse({
			Year: d => xScale.invert(d.Year),
			YearTotal: d => yScale.invert(d.YearTotal),
		})
		.annotations(sceneData[scene].aList);
	svg.append("g")
		.attr("transform", `translate(${margin},${margin})`)
		.attr("class", "annotation-group")
		.call(makeLabelAnnotations);
}

function drawTooltips(scene) {
	const svg = d3.select("svg");
	var focus = svg.append("g").attr("class", "focus").style("display", "none");
	focus.append("circle").attr("r", 5);
	focus
		.append("rect")
		.attr("class", "tooltip")
		.attr("width", 100)
		.attr("height", 50)
		.attr("x", 10)
		.attr("y", -22)
		.attr("rx", 4)
		.attr("ry", 4);
	focus
		.append("text")
		.attr("class", "tooltip-date")
		.attr("x", 18)
		.attr("y", -2);
	focus.append("text").attr("x", 18).attr("y", 18).text("Casualty:");
	focus
		.append("text")
		.attr("class", "tooltip-casualty")
		.attr("x", 76)
		.attr("y", 18);
	const overlay = svg
		.append("rect")
		.attr("transform", `translate(${margin},${margin})`)
		.attr("class", "overlay")
		.attr("width", width)
		.attr("height", height);
	overlay
		.on("mouseover", () => {
			focus.style("display", null);
		})
		.on("mouseout", () => {
			focus.style("display", "none");
		})
		.on("mousemove", mousemove);
	function mousemove(event) {
		var x0 = xScale.invert(d3.pointer(event, this)[0]),
			i = d3.bisector(d => d.Year).left(groupByYear, x0, 1),
			d0 = sceneData[scene].data[i - 1],
			d1 = sceneData[scene].data[i];
		if (!d0 || !d1) {
			return;
		}
		d = x0 - d0.Year > d1.Year - x0 ? d1 : d0;

		focus.attr(
			"transform",
			`translate(${xScale(d.Year) + margin},${
				yScale(d.YearTotal) + margin
			})`
		);
		focus.select(".tooltip-date").text(d.Year);
		focus.select(".tooltip-casualty").text(d.YearTotal);
	}
}
