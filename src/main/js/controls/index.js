import Graph from "./Graph";
import Line from "./Line";
import PairedResult from "./PairedResult";

/**
 * @module api
 * @property {Object} graph Graph Construct
 * @property {Object} line Line graph based on Graph Construct
 * @property {Object} pairedResult Paired Result graph based on Graph Construct
 * @enum {Object}
 */
export default {
    graph: (input) => new Graph(input),
    line: (input) => new Line(input),
    pairedResult: (input) => new PairedResult(input)
};
