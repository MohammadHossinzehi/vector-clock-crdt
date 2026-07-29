import { VectorClock } from '../src/vector-clock';
import assert from 'assert';

describe('VectorClock', () => {
  describe('basic operations', () => {
    it('should initialize with zero values', () => {
      const clock = new VectorClock(['A', 'B', 'C']);
      const value = clock.getValue();
      assert.equal(value['A'], 0);
      assert.equal(value['B'], 0);
      assert.equal(value['C'], 0);
    });

    it('should increment clock value', () => {
      const clock = new VectorClock(['A', 'B']);
      clock.increment('A');
      const value = clock.getValue();
      assert.equal(value['A'], 1);
      assert.equal(value['B'], 0);
    });

    it('should support multiple increments', () => {
      const clock = new VectorClock(['A', 'B']);
      clock.increment('A');
      clock.increment('A');
      clock.increment('B');
      const value = clock.getValue();
      assert.equal(value['A'], 2);
      assert.equal(value['B'], 1);
    });

    it('should throw on invalid process', () => {
      const clock = new VectorClock(['A', 'B']);
      assert.throws(() => clock.increment('C'));
    });
  });

  describe('causality', () => {
    it('should detect happens-before', () => {
      const clock1 = new VectorClock(['A', 'B']);
      const clock2 = new VectorClock(['A', 'B']);
      
      clock1.increment('A');
      clock1.increment('A');
      clock2.increment('B');
      clock2.increment('A');
      
      assert(clock1.happensBefore(clock2) === false);
    });

    it('should detect concurrent events', () => {
      const clock1 = new VectorClock(['A', 'B']);
      const clock2 = new VectorClock(['A', 'B']);
      
      clock1.increment('A');
      clock2.increment('B');
      
      assert(clock1.concurrent(clock2));
      assert(clock2.concurrent(clock1));
    });

    it('should correctly merge clocks', () => {
      const clock1 = new VectorClock(['A', 'B']);
      const clock2 = new VectorClock(['A', 'B']);
      
      clock1.increment('A');
      clock1.increment('A');
      clock2.increment('B');
      clock2.increment('B');
      
      const merged = clock1.merge(clock2);
      const value = merged.getValue();
      
      assert.equal(value['A'], 2);
      assert.equal(value['B'], 2);
    });
  });

  describe('clone and equality', () => {
    it('should clone vector clock', () => {
      const clock = new VectorClock(['A', 'B']);
      clock.increment('A');
      
      const cloned = clock.clone();
      assert(clock.equals(cloned));
    });

    it('should detect equality', () => {
      const clock1 = new VectorClock(['A', 'B']);
      const clock2 = new VectorClock(['A', 'B']);
      
      clock1.increment('A');
      clock2.increment('A');
      
      assert(clock1.equals(clock2));
    });

    it('should detect inequality', () => {
      const clock1 = new VectorClock(['A', 'B']);
      const clock2 = new VectorClock(['A', 'B']);
      
      clock1.increment('A');
      clock2.increment('B');
      
      assert(!clock1.equals(clock2));
    });
  });

  describe('string representation', () => {
    it('should provide string representation', () => {
      const clock = new VectorClock(['A', 'B']);
      clock.increment('A');
      const str = clock.toString();
      assert(str.includes('A:1'));
      assert(str.includes('B:0'));
    });
  });
});
