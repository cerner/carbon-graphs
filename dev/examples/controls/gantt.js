import Carbon from "../../../src/main/js/carbon";
import { getDemoData } from "../data";
import { shell } from "../helpers";

export const renderGantt = (el, id, title) => () => {
    shell.render(el, id, title);
    const ganttDefault = Carbon.api.gantt(getDemoData(`#${id}`, "GANTT"));
    return ganttDefault;
};
