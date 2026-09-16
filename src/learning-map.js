import { modules, projects } from './curriculum.js';
import { functionBridges } from './function-bridges.js';
import { practiceProjects, practiceDone } from './practice-content.js';
import { doneProjects } from './progress.js';
import { blockingSummary, firstIncompleteModule, moduleIndexForLesson, moduleIsOpen, moduleRequirements } from './progression.js';

export function learningMapStage(state, index) {
  const module = modules[index];
  if (!module) return null;
  const pending = moduleRequirements(state, index);
  const practices = practiceProjects.filter(item => moduleIndexForLesson(item.prerequisite) === index);
  const bridges = functionBridges.filter(item => item.moduleId === module.id);
  const project = projects[index];
  const done = module.lessons.filter(item => state.completed.includes(item.id)).length
    + practices.filter(item => practiceDone(state.learning?.[item.id], item)).length
    + bridges.filter(item => state.functionBridges?.[item.id]?.passed && state.functionBridges[item.id].quizCorrect).length
    + (doneProjects(state).some(item => item.id === project?.id) ? 1 : 0);
  const total = module.lessons.length + practices.length + bridges.length + (project ? 1 : 0);
  const open = moduleIsOpen(state, index);
  const current = Math.min(firstIncompleteModule(state), modules.length - 1) === index;
  return { module, project, pending, done, total, open, current, complete: pending.complete, blocker: open ? '' : blockingSummary(state, index) };
}
