import {
    AxesExample,
    registerAxesExamples,
    triggerAxesExample
} from "./content/renderAxesExamples";
import {
    BarExample,
    registerBarExamples,
    triggerBarExample
} from "./content/renderBarExamples";
import {
    ColorsExample,
    registerColorsExamples,
    triggerColorsExample
} from "./content/renderColorsExample";
import {
    CombinationExample,
    registerCombinationGraphExamples,
    triggerCombinationGraphExample
} from "./content/renderCombinationGraphExamples";
import {
    CriticalityExample,
    registerCriticalityExamples,
    triggerCriticalityExample
} from "./content/renderCriticalityExamples";
import {
    GanttExample,
    registerGanttExamples,
    triggerGanttExample
} from "./content/renderGanttExamples";
import {
    GridExample,
    registerGridExamples,
    triggerGridExample
} from "./content/renderGridExamples";
import {
    LineExample,
    registerLineExamples,
    registerMultiLineExamples,
    registerNonContiguousLineExamples,
    triggerLineExample,
    triggerMultilineExample,
    triggerNonContiguousExample
} from "./content/renderLineExamples";
import {
    PairedResultExample,
    registerPairedResultExamples,
    triggerPairedLineExample
} from "./content/renderPairedResultExamples";
import {
    RegionsExample,
    registerRegionsExamples,
    triggerRegionsExample
} from "./content/renderRegionsExamples";
import {
    registerShapesExamples,
    ShapesExample,
    triggerShapesExample
} from "./content/renderShapesExamples";
import {
    registerSplineExamples,
    SplineExample,
    triggerSplineExample
} from "./content/renderSplineExamples";
import {
    registerTimelineExamples,
    TimelineExample,
    triggerTimelineExample
} from "./content/renderTimelineExamples";

export const DICTIONARY = {
    line: {
        Instance: LineExample,
        exampleFunction: registerLineExamples,
        triggerFunction: triggerLineExample
    },
    multiline: {
        Instance: LineExample,
        exampleFunction: registerMultiLineExamples,
        triggerFunction: triggerMultilineExample
    },
    spline: {
        Instance: SplineExample,
        exampleFunction: registerSplineExamples,
        triggerFunction: triggerSplineExample
    },
    "non-contiguous-line": {
        Instance: LineExample,
        exampleFunction: registerNonContiguousLineExamples,
        triggerFunction: triggerNonContiguousExample
    },
    "paired-result": {
        Instance: PairedResultExample,
        exampleFunction: registerPairedResultExamples,
        triggerFunction: triggerPairedLineExample
    },
    bar: {
        Instance: BarExample,
        exampleFunction: registerBarExamples,
        triggerFunction: triggerBarExample
    },
    "combination-graph": {
        Instance: CombinationExample,
        exampleFunction: registerCombinationGraphExamples,
        triggerFunction: triggerCombinationGraphExample
    },
    gantt: {
        Instance: GanttExample,
        exampleFunction: registerGanttExamples,
        triggerFunction: triggerGanttExample
    },
    timeline: {
        Instance: TimelineExample,
        exampleFunction: registerTimelineExamples,
        triggerFunction: triggerTimelineExample
    },
    grid: {
        Instance: GridExample,
        exampleFunction: registerGridExamples,
        triggerFunction: triggerGridExample
    },
    axes: {
        Instance: AxesExample,
        exampleFunction: registerAxesExamples,
        triggerFunction: triggerAxesExample
    },
    regions: {
        Instance: RegionsExample,
        exampleFunction: registerRegionsExamples,
        triggerFunction: triggerRegionsExample
    },
    criticality: {
        Instance: CriticalityExample,
        exampleFunction: registerCriticalityExamples,
        triggerFunction: triggerCriticalityExample
    },
    shapes: {
        Instance: ShapesExample,
        exampleFunction: registerShapesExamples,
        triggerFunction: triggerShapesExample
    },
    colors: {
        Instance: ColorsExample,
        exampleFunction: registerColorsExamples,
        triggerFunction: triggerColorsExample
    }
};
export const DEFAULT_HOME_CONTENT_ID = "line";
export const DEFAULT_HOME_CONTENT = DICTIONARY[DEFAULT_HOME_CONTENT_ID];
export const registerExamples = (
    toggleSection,
    contentSection,
    setState,
    getState
) => {
    Object.keys(DICTIONARY).forEach((d) => {
        DICTIONARY[d].exampleFunction(
            new DICTIONARY[d].Instance(),
            toggleSection,
            contentSection,
            setState,
            getState
        );
    });
};
