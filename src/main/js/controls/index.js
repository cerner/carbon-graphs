import Bar from "./Bar";
import Gantt from "./Gantt";
import Graph from "./Graph";
import Line from "./Line";
import PairedResult from "./PairedResult";
import Pie from "./Pie";
import Timeline from "./Timeline";

/**
 * @module api
 * @property {Object} gantt Gantt based on Construct
 * @property {Object} graph Graph based on Construct
 * @property {Object} line Line graph based on Graph
 * @property {Object} bar Bar graph based on Graph
 * @property {Object} pairedResult Paired Result graph based on Graph
 * @property {Object} timeline Timeline graph based on Construct
 * @enum {Object}
 */
export default {
    gantt: (input) => new Gantt(input),
    graph: (input) => new Graph(input),
    line: (input) => new Line(input),
    pairedResult: (input) => new PairedResult(input),
    timeline: (input) => new Timeline(input),
    pie: (input) => new Pie(input),
    bar: (input) => new Bar(input)
};
