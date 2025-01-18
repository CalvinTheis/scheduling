import { Controller } from "@hotwired/stimulus";

/**
 * Represents an interval that contains one or more blocks.
 * @typedef {Object} Interval
 * @property {number} start - The start value for the interval.
 * @property {number} end - The end value of the interval.
 * @proeprty {HTMLElement[]} - The blocks within the interval.
 */

/**
 * Merges two arrays while deduplicating elements between the two.
 * @param {Array} array1
 * @param {Array} array2
 * @return The merged array1 and array2
 */
const merge = (array1, array2) => {
  return array1.concat(array2.filter(a => !array1.some(b => a === b)));
}

/**
 * Merge overlapping intervals.
 * @param {Interval[]} intervals - The list of intervals to merge.
 * @return {Interval[]} - The merged list of intervals.
 */
const merge_overlaps = (intervals) => {
  if (intervals.length == 0)
    return [];

  intervals.sort((a, b) => a - b);
  // let result = [intervals[0]];
  let result = [intervals[0]];

  for (let interval of intervals) {
    if (result[result.length - 1].end >= interval.start)
      result[result.length - 1] = {
        begin: result[result.length - 1].start,
        end: Math.max(result[result.length - 1].end, interval.end),
        blocks: merge(result[result.length - 1].blocks, interval.blocks),
      };
    else
      result.push(interval);
  }

  return result;
}

/**
 * Controller for the column component.
 */
export default class extends Controller {
  static targets = ["block"];

  connect() {
    this.resize_overlaps();
  }

  /**
   * Horizontally resize schedule blocks so that blocks with overlapping time
   * ranges don't overlap on the schedule.
   */
  resize_overlaps() {
    // Build list of intervals
    /** @type {Interval[]} */
    const event_intervals = this.blockTargets.map(block => ({
      start: parseInt(block.dataset.starttime),
      end: parseInt(block.dataset.endtime),
      blocks: [block],
    }));

    // Get merged intervals
    const filled_intervals = merge_overlaps(event_intervals);

    // Resize blocks in all overlapping intervals
    for (let interval of filled_intervals) {
      let width_ratio = 1 / interval.blocks.length;

      // Resize each block to its proper width.
      interval.blocks.map(block => block.style.width = `calc(${width_ratio * 100}% - 1rem)`);

      // Move each block to its proper horizontal location.
      interval.blocks.map((block, i) => block.style.left = `${width_ratio * 100 * i}%`)
    }
  }
}
