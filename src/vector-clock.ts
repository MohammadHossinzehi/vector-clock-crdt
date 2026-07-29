export interface VectorClockOptions {
  processes: string[];
}

export class VectorClock {
  private clock: Map<string, number>;
  private processes: string[];

  constructor(processes: string[]) {
    this.processes = [...processes].sort();
    this.clock = new Map();
    for (const process of this.processes) {
      this.clock.set(process, 0);
    }
  }

  /**
   * Increment the clock value for a given process
   */
  increment(processId: string): void {
    if (!this.clock.has(processId)) {
      throw new Error(`Process ${processId} not in vector clock`);
    }
    this.clock.set(processId, (this.clock.get(processId) ?? 0) + 1);
  }

  /**
   * Get the current state of the vector clock
   */
  getValue(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const process of this.processes) {
      result[process] = this.clock.get(process) ?? 0;
    }
    return result;
  }

  /**
   * Check if this clock happens-before another (strict causal ordering)
   */
  happensBefore(other: VectorClock): boolean {
    let hasStrictLess = false;
    for (const process of this.processes) {
      const thisVal = this.clock.get(process) ?? 0;
      const otherVal = other.clock.get(process) ?? 0;
      if (thisVal > otherVal) return false;
      if (thisVal < otherVal) hasStrictLess = true;
    }
    return hasStrictLess;
  }

  /**
   * Check if two clocks are concurrent (neither happens before the other)
   */
  concurrent(other: VectorClock): boolean {
    return !this.happensBefore(other) && !other.happensBefore(this);
  }

  /**
   * Check if this clock happens-before-or-equal to another
   */
  happensBeforeOrEqual(other: VectorClock): boolean {
    for (const process of this.processes) {
      const thisVal = this.clock.get(process) ?? 0;
      const otherVal = other.clock.get(process) ?? 0;
      if (thisVal > otherVal) return false;
    }
    return true;
  }

  /**
   * Merge two vector clocks (take element-wise maximum)
   */
  merge(other: VectorClock): VectorClock {
    const merged = new VectorClock(this.processes);
    for (const process of this.processes) {
      const thisVal = this.clock.get(process) ?? 0;
      const otherVal = other.clock.get(process) ?? 0;
      merged.clock.set(process, Math.max(thisVal, otherVal));
    }
    return merged;
  }

  /**
   * Copy the current vector clock
   */
  clone(): VectorClock {
    const cloned = new VectorClock(this.processes);
    for (const [process, value] of this.clock.entries()) {
      cloned.clock.set(process, value);
    }
    return cloned;
  }

  /**
   * Get string representation for debugging
   */
  toString(): string {
    const values = this.processes.map(p => `${p}:${this.clock.get(p)}`);
    return `[${values.join(', ')}]`;
  }

  /**
   * Check equality with another clock
   */
  equals(other: VectorClock): boolean {
    for (const process of this.processes) {
      if ((this.clock.get(process) ?? 0) !== (other.clock.get(process) ?? 0)) {
        return false;
      }
    }
    return true;
  }
}
