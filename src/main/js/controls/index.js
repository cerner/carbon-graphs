import Graph from "./Graph";
import Line from "./Line";
import PairedResult from "./PairedResult";

/**
 * @module api
 * @property {Object} graph Graph based on Construct
 * @property {Object} line Line graph based on Graph
 * @property {Object} pairedResult Paired Result graph based on Graph
 * @enum {Object}
 */
export default {
    graph: (input) => new Graph(input),
    line: (input) => new Line(input),
    pairedResult: (input) => new PairedResult(input)
};
