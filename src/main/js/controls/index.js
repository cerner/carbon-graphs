import Graph from "./Graph";
import Line from "./Line";
import PairedResult from "./PairedResult";

export default {
    graph: (input) => new Graph(input),
    line: (input) => new Line(input),
    pairedResult: (input) => new PairedResult(input)
};
