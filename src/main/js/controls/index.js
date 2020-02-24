import Bar from "./Bar";
import Gantt from "./Gantt";
import Graph from "./Graph";
import Line from "./Line";
import PairedResult from "./PairedResult";
import Pie from "./Pie";
import Timeline from "./Timeline";
import Scatter from "./Scatter";
import Bubble from "./Bubble";

/**
 * @module api
 * @property {object} gantt Gantt based on Construct
 * @property {object} graph Graph based on Construct
 * @property {object} line Line graph based on Graph
 * @property {object} bar Bar graph based on Graph
 * @property {object} pairedResult Paired Result graph based on Graph
 * @property {object} timeline Timeline graph based on Construct
 * @property {object} bubble Bubble graph based on Graph
 * @enum {object}
 */
export default {
    gantt: (input) => new Gantt(input),
    graph: (input) => new Graph(input),
    line: (input) => new Line(input),
    pairedResult: (input) => new PairedResult(input),
    timeline: (input) => new Timeline(input),
    pie: (input) => new Pie(input),
    bar: (input) => new Bar(input),
    scatter: (input) => new Scatter(input),
    bubble: (input) => new Bubble(input)
};
