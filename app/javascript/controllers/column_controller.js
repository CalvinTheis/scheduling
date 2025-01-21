import { Controller } from "@hotwired/stimulus";

/**
 * Represents an interval that contains one or more blocks.
 * @typedef {Object} Interval
 * @property {number} start - The start value for the interval.
 * @property {number} end - The end value of the interval.
 * @proeprty {HTMLElement[]} - The blocks within the interval.
 */

/**
 * Controller for the column component.
 */
export default class extends Controller {
  static targets = ["block", "blocks"];
  static outlets = ["modal"];

  connect() {
    this.viewStartTime = parseInt(this.element.dataset.viewStartTime);
    this.viewEndTime = parseInt(this.element.dataset.viewEndTime);
    this.#renderBlock();
  }

  // On click, display the popup based on the y-position of the mouse.
  displayAvailableTime(event) {
    let mouseYTime = this.#getTimeFromMouseY(event.clientY);

    // Ensure that we don't overlap an work order block.
    if (this.#timeOverlapsBlock(mouseYTime)) {
      this.modalOutlet.show("Error", "Selected time already has a work order!");
      return;
    }

    // Get nearest two blocks to click.
    let prevOrderBlock = this
      .blockTargets
      .toSorted((a, b) => a.dataset.endTime - b.dataset.endTime)
      .findLast(block => block.dataset.endTime < mouseYTime);
    let nextOrderBlock = this
      .blockTargets
      .toSorted((a, b) => a.dataset.startTime - b.dataset.startTime)
      .find(block => block.dataset.startTime > mouseYTime);

    if (prevOrderBlock && nextOrderBlock) {
      let timeBetweenEvents = Math.floor((nextOrderBlock.dataset.startTime - prevOrderBlock.dataset.endTime) / 60);
      this.modalOutlet.show("Schedule", `Work orders are ${timeBetweenEvents} minutes apart.`);
    } else {
      this.modalOutlet.show("Schedule", "This time slot is available.");
    }
  }

  /**** PRIVATE ****/

  /**
   * Checks if the given time overlaps a block in this column.
   * @param {number} time
   * @return {boolean}
   */
  #timeOverlapsBlock(time) {
    return this.blockTargets.some(block => {
      let startTime = parseInt(block.dataset.startTime);
      let endTime = parseInt(block.dataset.endTime);
      return startTime <= time && time <= endTime;
    });
  }

  /**
   * Get the time in seconds since midnight based on the y-position of the
   * mouse within the clicked element.
   * @param {number} mouseY - the y-position of the mouse.
   * @return {number} - time of day in seconds since midnight
   */
  #getTimeFromMouseY(mouseY) {
    let rect = this.blocksTarget.getBoundingClientRect();

    // Get y-position relative to the top of the element.
    let mouseYRatio = (mouseY - rect.top) / (rect.bottom - rect.top);

    // Get time value corresponding to mouse position
    return this.viewStartTime + mouseYRatio * (this.viewEndTime - this.viewStartTime);
  }

  /**
   * Position and resize a block in its column to have:
   * 1. a vertical offset from the top of the column corresponding to the work order's start time.
   * 2. a height corresponding to the work order's duration.
   * 3. a horizontal offset and width as to not overlap any other block in the column.
   *
   * Finally, the element is hidden by default to prevent artifacts, so unhide the element.
   */
  #renderBlock() {
    // Position and resize the block vertically:
    this.blockTargets.map(block => {
      let startTime = parseInt(block.dataset.startTime);
      let duration = parseInt(block.dataset.endTime) - startTime;
      block.style.top = `${this.#topPercentForTime(startTime)}%`;
      block.style.height = `${this.#heightPercentForDuration(duration)}%`;
    })

    // Resize and reposition the blocks so they don't overlap.
    /** @type {Interval[]} */
    const workOrderIntervals = this.blockTargets.map(block => ({
      start: parseInt(block.dataset.startTime),
      end: parseInt(block.dataset.endTime),
      blocks: [block],
    }));

    // Get merged intervals
    const filledIntervals = mergeOverlaps(workOrderIntervals);

    // Resize blocks in all overlapping intervals
    for (let interval of filledIntervals) {
      let widthRatio = 1 / interval.blocks.length;

      // Resize each block to its proper width.
      interval.blocks.map(block => block.style.width = `${widthRatio * 100}%`);

      // Move each block to its proper horizontal location.
      interval.blocks.map((block, i) => block.style.left = `${widthRatio * 100 * i}%`)
    }

    // Unhide the elements.
    this.blockTargets.map(block => block.classList.remove("hidden"));
  }

  /**
   * Calcuate the height of a time block given its duration.
   * @param {number} duration - duration in seconds.
   * @return {number} - the height of the time block as a percentage.
   */
  #heightPercentForDuration(duration) {
    return 100 * duration / (this.viewEndTime - this.viewStartTime);
  }

  /**
   * Calcuate the offset from the top of the column given the start time.
   * @param {number} time - time of day in seconds since midnight.
   * @return {number} - the offset as a percentage.
   */
  #topPercentForTime(time) {
    return 100 * (time - this.viewStartTime) / (this.viewEndTime - this.viewStartTime);
  }
}

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
const mergeOverlaps = (intervals) => {
  if (intervals.length == 0)
    return [];

  intervals.sort((a, b) => a - b);
  let result = [intervals[0]];

  for (let interval of intervals) {
    // If intervals overlap
    if (result[result.length - 1].end >= interval.start)
      // Merge them
      result[result.length - 1] = {
        begin: result[result.length - 1].start,
        end: Math.max(result[result.length - 1].end, interval.end),
        blocks: merge(result[result.length - 1].blocks, interval.blocks),
      };
    else
      // Else, add new interval.
      result.push(interval);
  }

  return result;
}
