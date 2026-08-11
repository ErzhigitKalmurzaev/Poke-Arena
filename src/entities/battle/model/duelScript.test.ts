import { describe, expect, it } from 'vitest';
import type { Fighter } from '@/entities/fighter';
import { determineDuelWinner } from './determineWinner';
import { buildDuelScript, powersAfter } from './duelScript';

function fighter(id: string, stats: Record<string, number>, types: string[] = ['fire']): Fighter {
  return {
    id,
    name: id,
    description: '',
    types,
    stats,
    sprite: '',
    shinySprite: null,
    cryUrl: null,
    isLegendary: false,
    isMythical: false,
    isEdited: false,
  };
}

/** Builds the script the arena would play for these two, via the real duel result. */
function scriptFor(a: Fighter | undefined, b: Fighter | undefined) {
  const duel = determineDuelWinner(0, a, b);
  return { duel, script: buildDuelScript(duel, a, b) };
}

const balanced = (id: string, attack: number) =>
  fighter(id, { hp: 100, attack, defense: 80, 'special-attack': 70, 'special-defense': 70, speed: 90 });

describe('buildDuelScript', () => {
  it('trades blows in turn and ends on the winner’s', () => {
    const { script } = scriptFor(balanced('a', 120), balanced('b', 100));
    expect(script.exchanges.map((exchange) => exchange.side)).toEqual(['a', 'b', 'a']);
  });

  it('lets the faster fighter open', () => {
    const fast = fighter('b', { speed: 200, attack: 10 });
    const slow = fighter('a', { speed: 5, attack: 10 });
    expect(scriptFor(slow, fast).script.exchanges[0]?.side).toBe('b');
    expect(scriptFor(fast, slow).script.exchanges[0]?.side).toBe('a');
  });

  it('names moves from the fighter type and his strongest stats', () => {
    const { script } = scriptFor(fighter('a', { attack: 200, speed: 150, hp: 10 }, ['ice']), balanced('b', 100));
    const aMoves = script.exchanges.filter((exchange) => exchange.side === 'a').map((e) => e.move.name);
    expect(aMoves).toEqual(['Ледяной удар', 'Ледяной рывок']);
  });

  it('has no exchanges to play when a slot is unfilled', () => {
    const { script } = scriptFor(balanced('a', 120), undefined);
    expect(script.exchanges).toEqual([]);
    expect(script.finalPowerA).toBeGreaterThan(script.finalPowerB);
  });

  /*
   * The whole point of the arena: it narrates a result that was already
   * decided. If the bars could ever contradict determineDuelWinner, the
   * screen would show one winner and the scoreboard another.
   */
  it('always ends with the winner ahead on health, however close the scores', () => {
    for (let attackB = 1; attackB <= 200; attackB += 1) {
      const { duel, script } = scriptFor(balanced('a', 100), balanced('b', attackB));

      if (duel.winner === 'a') expect(script.finalPowerA).toBeGreaterThan(script.finalPowerB);
      else if (duel.winner === 'b') expect(script.finalPowerB).toBeGreaterThan(script.finalPowerA);
      else expect(script.finalPowerA).toBe(script.finalPowerB);
    }
  });
});

/*
 * A duel ends because someone is knocked out. These pin down the two ways
 * that could go wrong on screen: a round stopping while both bars still have
 * health in them, and a fighter on an empty bar carrying on swinging.
 */
describe('knockout', () => {
  it('empties the loser and leaves the winner standing', () => {
    const { script } = scriptFor(balanced('a', 120), balanced('b', 100));
    const end = powersAfter(script, script.exchanges.length - 1);

    expect(end.b).toBe(0);
    expect(end.a).toBeGreaterThan(0);
  });

  it('lands the knockout on the final blow of the duel, never before it', () => {
    for (let attackB = 1; attackB <= 200; attackB += 1) {
      const { duel, script } = scriptFor(balanced('a', 100), balanced('b', attackB));
      if (duel.winner === 'draw') continue;

      const loser = duel.winner === 'a' ? 'b' : 'a';
      script.exchanges.forEach((_, index) => {
        const isFinalBlow = index === script.exchanges.length - 1;
        const health = powersAfter(script, index)[loser];
        if (isFinalBlow) expect(health).toBe(0);
        else expect(health).toBeGreaterThan(0);
      });
    }
  });

  it('never lets a fighter throw a blow on an empty bar', () => {
    for (let attackB = 1; attackB <= 200; attackB += 1) {
      const { script } = scriptFor(balanced('a', 100), balanced('b', attackB));

      script.exchanges.forEach((exchange, index) => {
        // Health the attacker is standing on as he swings - i.e. after every
        // blow that came before this one.
        expect(powersAfter(script, index - 1)[exchange.side]).toBeGreaterThan(0);
      });
    }
  });

  it('leaves a hair-thin winner barely standing', () => {
    const { script } = scriptFor(balanced('a', 101), balanced('b', 100));
    expect(script.finalPowerA).toBeLessThanOrEqual(20);
    expect(script.finalPowerB).toBe(0);
  });

  it('barely scratches a winner who dominates', () => {
    const { script } = scriptFor(fighter('a', { hp: 10_000 }), fighter('b', { hp: 1 }));
    expect(script.finalPowerA).toBe(96);
    expect(script.finalPowerB).toBe(0);
  });

  it('lets both survive a stalemate - the one result with health to spare', () => {
    const { duel, script } = scriptFor(fighter('a', { hp: 10 }), fighter('b', { hp: 10 }));
    expect(duel.winner).toBe('draw');

    const end = powersAfter(script, script.exchanges.length - 1);
    expect(end).toEqual({ a: 20, b: 20 });
  });
});

describe('powersAfter', () => {
  it('starts both fighters at full before the first blow', () => {
    const { script } = scriptFor(balanced('a', 120), balanced('b', 100));
    expect(powersAfter(script, -1)).toEqual({ a: 100, b: 100 });
  });

  it('only drops the side being hit', () => {
    const { script } = scriptFor(balanced('a', 120), balanced('b', 100));
    // Exchange 0 is A's blow, so B takes it and A is still untouched.
    expect(powersAfter(script, 0).a).toBe(100);
    expect(powersAfter(script, 0).b).toBeLessThan(100);
  });

  it('never lets a bar climb back up', () => {
    const { script } = scriptFor(balanced('a', 120), balanced('b', 100));
    let previous = { a: 100, b: 100 };
    for (let i = 0; i < script.exchanges.length; i += 1) {
      const current = powersAfter(script, i);
      expect(current.a).toBeLessThanOrEqual(previous.a);
      expect(current.b).toBeLessThanOrEqual(previous.b);
      previous = current;
    }
  });
});
