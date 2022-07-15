import * as d3 from "https://cdn.skypack.dev/d3@7";
import * as d3annotation from "https://cdnjs.cloudflare.com/ajax/libs/d3-annotation/2.5.1/d3-annotation.min.js";
window.onload = async function () {
	console.log("onload");
};
d3annotation.annotation();
const data = await d3.csv("./data/History_of_Mass_Shootings_in_the_USA.csv");
d3.select("#graph").append("svg").attr("width", 900).attr("height", 900);
