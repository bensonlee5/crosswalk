'use client';

import {useEffect, useId, useRef, useState} from 'react';

export type TurnClockProps = {
  /** Game action-time blocks, not elapsed real-world hours. */
  hours: number;
  max?: number;
  /** Room code + week + player ID. Changing this resets without a rewind. */
  turnKey: string;
  previewCost?: number;
  announce?: boolean;
  period?: 'week' | 'month';
};

const SEGMENTS = 6;
const CENTER_X = 56;
const CENTER_Y = 60;
const RADIUS = 35.5;
const SEGMENT_LENGTH = RADIUS * 54 * Math.PI / 180;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const display = (value: number) => Number(value.toFixed(2)).toString();

/** Exported so game-time geometry can be tested independently of rendering. */
export function getTurnClockState(hours: number, max = 6, previewCost = 0) {
  const capacity = Number.isFinite(max) && max > 0 ? max : 6;
  const remaining = clamp(Number.isFinite(hours) ? hours : 0, 0, capacity);
  const spent = 1 - remaining / capacity;
  const requestedCost = Math.max(0, Number.isFinite(previewCost) ? previewCost : 0);
  const preview = Math.min(requestedCost, remaining);
  return {
    capacity,
    remaining,
    spent,
    preview,
    requestedCost,
    angle: spent * 359.5,
    previewAngle: (1 - (remaining - preview) / capacity) * 359.5,
    phase: remaining === 0 ? 'empty' : remaining <= 1 ? 'critical' : remaining <= 2 ? 'low' : 'ready',
    segmentOffsets: Array.from({length: SEGMENTS}, (_, index) => -clamp(spent * SEGMENTS - index, 0, 1)),
  };
}

function point(degrees: number, radius = RADIUS) {
  const radians = (degrees - 90) * Math.PI / 180;
  return [CENTER_X + Math.cos(radians) * radius, CENTER_Y + Math.sin(radians) * radius];
}

function arc(start: number, end: number, radius = RADIUS) {
  const [x1, y1] = point(start, radius);
  const [x2, y2] = point(end, radius);
  // Two arcs also cover a whole-turn preview without SVG's coincident-endpoint ambiguity.
  if (end - start > 359.99) {
    const [xm, ym] = point(start + 180, radius);
    return `M${x1},${y1} A${radius},${radius} 0 0 1 ${xm},${ym} A${radius},${radius} 0 0 1 ${x2},${y2}`;
  }
  return `M${x1},${y1} A${radius},${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${x2},${y2}`;
}

const segmentPaths = Array.from({length: SEGMENTS}, (_, index) => arc(index * 60 + 3, (index + 1) * 60 - 3));

/**
 * Import turn-clock.css once in the app's global stylesheet / layout.
 * The keyed face is intentional: a fresh player's/week's dial must never
 * interpolate backwards through the previous player's spent time.
 */
export default function TurnClock(props: TurnClockProps) {
  const capacity = getTurnClockState(props.hours, props.max).capacity;
  return <TurnClockFace key={`${props.turnKey}:${capacity}`} {...props} max={capacity}/>;
}

function TurnClockFace({hours, max = 6, previewCost = 0, announce = true, period = 'week'}: TurnClockProps) {
  const state = getTurnClockState(hours, max, previewCost);
  const uid = useId().replace(/:/g, '');
  const previous = useRef(state.remaining);
  const [announcement, setAnnouncement] = useState('');
  const [spendSequence, setSpendSequence] = useState(0);

  useEffect(() => {
    const before = previous.current;
    previous.current = state.remaining;
    if (before === state.remaining) return;
    const difference = before - state.remaining;
    if (difference > 0) {
      setSpendSequence(sequence => sequence + 1);
      setAnnouncement(`${display(difference)} time ${difference === 1 ? 'block' : 'blocks'} spent. ${state.remaining === 0 ? `No time left this ${period}.` : `${display(state.remaining)} left this ${period}.`}`);
    } else {
      setAnnouncement(`${display(state.remaining)} time ${state.remaining === 1 ? 'block' : 'blocks'} left this ${period}.`);
    }
  }, [state.remaining]);

  const label = `${display(state.remaining)} of ${display(state.capacity)} time blocks left this ${period}.${state.requestedCost > 0 ? ` Selected action uses ${display(state.requestedCost)}.${state.requestedCost > state.remaining ? ' Not enough time remains.' : ''}` : ''}`;

  return <div className="cw-turn-clock" data-phase={state.phase} data-turn-clock="" title={label}>
    <div className="cw-turn-clock__meter" role="meter" aria-label={"Time left this "+period} aria-valuemin={0} aria-valuemax={state.capacity} aria-valuenow={state.remaining} aria-valuetext={label}>
      <svg className="cw-turn-clock__dial" viewBox="0 0 112 116" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${uid}-brass`} x1="0" y1="0" x2=".75" y2="1">
            <stop offset="0" stopColor="#fff0b2"/><stop offset=".18" stopColor="#bd9650"/><stop offset=".45" stopColor="#eed295"/><stop offset=".72" stopColor="#9c743b"/><stop offset="1" stopColor="#e4c582"/>
          </linearGradient>
          <radialGradient id={`${uid}-ivory`} cx=".35" cy=".2" r=".85">
            <stop offset="0" stopColor="#fffbed"/><stop offset=".7" stopColor="#eee3c4"/><stop offset="1" stopColor="#d3bf8e"/>
          </radialGradient>
          <linearGradient id={`${uid}-shutter`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9f5a43"/><stop offset="1" stopColor="#5a332b"/>
          </linearGradient>
          <clipPath id={`${uid}-window`}><circle cx="56" cy="60" r="27"/></clipPath>
        </defs>
        <ellipse cx="56" cy="109" rx="32" ry="3.3" fill="#10291e" opacity=".24"/>
        <path d="M29 98 25 109h8l5-9m36-2 5 11h8l-5-11" fill="#725432" stroke="#d5b16b" strokeWidth="1.5"/>
        <g className="cw-turn-clock__crown">
          <path d="M50 13V9h12v4" fill="#795b34"/>
          <rect x="46.5" y="4" width="19" height="7" rx="2" fill={`url(#${uid}-brass)`} stroke="#73552f"/>
          <path d="M50 5v5m4-5v5m4-5v5m4-5v5" stroke="#856132" strokeWidth=".8"/>
        </g>
        <circle cx="56" cy="60" r="47" fill={`url(#${uid}-brass)`} stroke="#674d30" strokeWidth="2"/>
        <circle cx="56" cy="60" r="43.5" fill="#4d3d2b" stroke="#f2d697" strokeWidth="1"/>
        <circle cx="56" cy="60" r="41" fill={`url(#${uid}-ivory)`}/>
        <circle cx="56" cy="60" r="40" fill="none" stroke="#aa8b53" strokeWidth=".6"/>
        <g fill="none" strokeWidth="8" strokeLinecap="butt">
          {segmentPaths.map((d, index) => <path key={`track-${index}`} d={d} className="cw-turn-clock__track"/>)}
          {segmentPaths.map((d, index) => <path key={index} d={d} className="cw-turn-clock__remaining" strokeDasharray={`${SEGMENT_LENGTH} ${SEGMENT_LENGTH}`} strokeDashoffset={state.segmentOffsets[index] * SEGMENT_LENGTH}/>)}
        </g>
        {state.preview > 0 && <path className="cw-turn-clock__preview" d={arc(state.spent * 360, (state.spent + state.preview / state.capacity) * 360)} fill="none" strokeWidth="8"/>}
        <circle cx="56" cy="60" r="29.5" fill="none" stroke="#92764d" strokeWidth=".65" opacity=".65"/>
        <g className="cw-turn-clock__ticks" stroke="#8b744e" strokeWidth="1">
          {Array.from({length: 30}, (_, index) => {
            const [x1, y1] = point(index * 12, index % 5 === 0 ? 25.7 : 27.2);
            const [x2, y2] = point(index * 12, 28.5);
            return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2}/>;
          })}
        </g>
        <g clipPath={`url(#${uid}-window)`} className="cw-turn-clock__shutters">
          <g className="cw-turn-clock__shutter cw-turn-clock__shutter--left">
            <path d="M27 32h29v57H27z" fill={`url(#${uid}-shutter)`}/>
            <path d="M29 41h25m-25 7h25m-25 7h25m-25 7h25m-25 7h25m-25 7h25m-25 7h25" stroke="#edc88c" strokeOpacity=".16"/>
          </g>
          <g className="cw-turn-clock__shutter cw-turn-clock__shutter--right">
            <path d="M56 32h29v57H56z" fill={`url(#${uid}-shutter)`}/>
            <path d="M58 41h25m-25 7h25m-25 7h25m-25 7h25m-25 7h25m-25 7h25m-25 7h25" stroke="#edc88c" strokeOpacity=".16"/>
          </g>
          <path className="cw-turn-clock__shutter-seam" d="M56 33v54" stroke="#39241d" strokeWidth="1"/>
        </g>
        <text x="56" y="46" textAnchor="middle" className="cw-turn-clock__week">{period.toUpperCase()}</text>
        <text x="56" y="75" textAnchor="middle" className="cw-turn-clock__number">{display(state.remaining)}</text>
        <text x="56" y="83" textAnchor="middle" className="cw-turn-clock__caption">{state.remaining === 0 ? 'TIME UP' : 'TIME LEFT'}</text>
        {state.preview > 0 && <g className="cw-turn-clock__ghost-hand" style={{transform: `rotate(${state.previewAngle}deg)`}}><path d="M56 59V28"/></g>}
        <g className="cw-turn-clock__hand" style={{transform: `rotate(${state.angle}deg)`}}>
          <path className="cw-turn-clock__hand-shadow" d="M54.8 67.5 53.5 39 56 24 58.5 39 57.2 67.5Z"/>
          <path className="cw-turn-clock__hand-body" d="M54.8 67.5 53.5 39 56 24 58.5 39 57.2 67.5Z"/>
          <path d="M56 28v30" stroke="#e9d7a6" strokeWidth=".7" opacity=".7"/>
        </g>
        <circle cx="56" cy="60" r="5.2" fill={`url(#${uid}-brass)`} stroke="#634e32" strokeWidth="1"/>
        <circle cx="56" cy="60" r="2" fill="#6e4c2d"/>
        <path d="M22 42A39 39 0 0 1 44 23" fill="none" stroke="#fff9df" strokeWidth="1.7" opacity=".48" strokeLinecap="round"/>
      </svg>
      {spendSequence > 0 && <span key={spendSequence} className="cw-turn-clock__spend-pulse" aria-hidden="true"/>}
    </div>
    <span className="cw-turn-clock__sr-only" role="status" aria-live={announce?'polite':'off'} aria-atomic="true">{announce?announcement:''}</span>
  </div>;
}
