import { combineRgb } from '@companion-module/base'
import { slug } from './variables.js'

/**
 * Ready-made buttons. These are what you drag onto a Stream Deck page — they arrive
 * already wired to the right preset or scoreboard, with the feedback attached, so a
 * volunteer operator never has to build a button from scratch.
 */

const BLACK = combineRgb(0, 0, 0)
const WHITE = combineRgb(255, 255, 255)
const DARK = combineRgb(20, 26, 36)
const RED = combineRgb(224, 49, 49)
const GREEN = combineRgb(18, 184, 134)
const BLUE = combineRgb(59, 130, 246)
const AMBER = combineRgb(234, 179, 8)

const style = (text, bg = DARK, color = WHITE, size = '14') => ({
	text,
	size,
	color,
	bgcolor: bg,
})

/* 🚨 Variable references below are written `$(${self.label}:name)`, NOT with a fixed prefix.
   Companion namespaces variables by the CONNECTION's label — the name the operator gave this
   connection — and that is theirs to change at any time. A prefix baked in here matches only
   the default name on the machine it was written on; anywhere else the dragged-in button shows
   an empty value and nothing explains why. `self.label` is kept current by the framework, and
   configUpdated() rebuilds these definitions, so a rename re-issues the presets correctly. */
export function updatePresets(self) {
	const presets = {}

	// ---- status ----
	presets['status'] = {
		type: 'button',
		category: 'Status',
		name: 'Connection status',
		style: style('SGP\nOFFLINE', combineRgb(80, 20, 20)),
		steps: [{ down: [], up: [] }],
		feedbacks: [
			{
				feedbackId: 'connected',
				options: {},
				style: { bgcolor: GREEN, color: BLACK, text: 'SGP\nREADY' },
			},
		],
	}

	// ---- library presets, one set per saved graphic ----
	for (const s of self.state.shows ?? []) {
		const k = slug(s.name)
		presets[`preset_toggle_${k}`] = {
			type: 'button',
			category: 'Library presets',
			name: `${s.name} — toggle on/off air`,
			style: style(s.name, DARK),
			steps: [{ down: [{ actionId: 'preset_toggle', options: { name: s.name } }], up: [] }],
			feedbacks: [{ feedbackId: 'preset_on', options: { name: s.name }, style: { bgcolor: RED, color: WHITE } }],
		}

		if ((s.rowCount ?? 0) > 0) {
			presets[`preset_next_${k}`] = {
				type: 'button',
				category: 'Library presets',
				name: `${s.name} — next row`,
				style: style(`${s.name}\n▶ NEXT\n$(${self.label}:preset_${k}_row)/$(${self.label}:preset_${k}_rows)`, DARK, WHITE, '7'),
				steps: [{ down: [{ actionId: 'preset_next', options: { name: s.name } }], up: [] }],
				feedbacks: [],
			}
			presets[`preset_prev_${k}`] = {
				type: 'button',
				category: 'Library presets',
				name: `${s.name} — previous row`,
				style: style(`${s.name}\n◀ PREV`, DARK, WHITE, '7'),
				steps: [{ down: [{ actionId: 'preset_prev', options: { name: s.name } }], up: [] }],
				feedbacks: [],
			}
		}

		// A graphic that builds gets its own ready-made transport: the Next key carries the
		// count so the operator can see where they are in the list without looking away.
		if ((s.reveals ?? []).length) {
			const cat = `Bullets — ${s.name}`
			presets[`bul_next_${k}`] = {
				type: 'button',
				category: cat,
				name: `${s.name} — next bullet`,
				style: style(
					`${s.name}\n▶ NEXT\n$(${self.label}:preset_${k}_bullet)/$(${self.label}:preset_${k}_bullets)`,
					GREEN,
					BLACK,
					'7'
				),
				steps: [{ down: [{ actionId: 'bullets_next', options: { name: s.name, layer: '' } }], up: [] }],
				feedbacks: [],
			}
			presets[`bul_prev_${k}`] = {
				type: 'button',
				category: cat,
				name: `${s.name} — take the last bullet back`,
				style: style(`${s.name}\n◀ BACK`, DARK, WHITE, '7'),
				steps: [{ down: [{ actionId: 'bullets_prev', options: { name: s.name, layer: '' } }], up: [] }],
				feedbacks: [],
			}
			presets[`bul_all_${k}`] = {
				type: 'button',
				category: cat,
				name: `${s.name} — reveal every bullet`,
				style: style(`${s.name}\nALL`, BLUE, WHITE, '7'),
				steps: [{ down: [{ actionId: 'bullets_all', options: { name: s.name, layer: '' } }], up: [] }],
				feedbacks: [],
			}
			presets[`bul_blank_${k}`] = {
				type: 'button',
				category: cat,
				name: `${s.name} — back to nothing revealed`,
				style: style(`${s.name}\nBLANK`, DARK, AMBER, '7'),
				steps: [{ down: [{ actionId: 'bullets_blank', options: { name: s.name, layer: '' } }], up: [] }],
				feedbacks: [],
			}
		}
	}

	presets['preset_alloff'] = {
		type: 'button',
		category: 'Library presets',
		name: 'ALL graphics off air',
		style: style('ALL\nOFF', combineRgb(90, 20, 20)),
		steps: [{ down: [{ actionId: 'preset_alloff', options: {} }], up: [] }],
		feedbacks: [],
	}

	// ---- one scoring set per scoreboard, so a 5-court meet is 5 ready pages ----
	for (const b of self.state.scoreboards ?? []) {
		const k = slug(b.name)
		const cat = `Scoreboard — ${b.name}`

		presets[`sb_air_${k}`] = {
			type: 'button',
			category: cat,
			name: `${b.name} — on/off air`,
			style: style(`${b.name}\nAIR`, DARK),
			steps: [
				{ down: [{ actionId: 'sb_show', options: { name: b.name } }], up: [] },
				{ down: [{ actionId: 'sb_hide', options: { name: b.name } }], up: [] },
			],
			feedbacks: [{ feedbackId: 'scoreboard_visible', options: { name: b.name }, style: { bgcolor: RED, color: WHITE } }],
		}
		presets[`sb_p1_${k}`] = {
			type: 'button',
			category: cat,
			name: `${b.name} — point team 1`,
			style: style(`$(${self.label}:sb_${k}_team1)\n+1\n$(${self.label}:sb_${k}_score1)`, BLUE, WHITE, '7'),
			steps: [{ down: [{ actionId: 'sb_point', options: { name: b.name, team: '1', delta: '1' } }], up: [] }],
			feedbacks: [],
		}
		presets[`sb_p2_${k}`] = {
			type: 'button',
			category: cat,
			name: `${b.name} — point team 2`,
			style: style(`$(${self.label}:sb_${k}_team2)\n+1\n$(${self.label}:sb_${k}_score2)`, BLUE, WHITE, '7'),
			steps: [{ down: [{ actionId: 'sb_point', options: { name: b.name, team: '2', delta: '1' } }], up: [] }],
			feedbacks: [],
		}
		presets[`sb_m1_${k}`] = {
			type: 'button',
			category: cat,
			name: `${b.name} — take a point back, team 1`,
			style: style(`T1\n−1`, combineRgb(60, 60, 70), WHITE, '14'),
			steps: [{ down: [{ actionId: 'sb_point', options: { name: b.name, team: '1', delta: '-1' } }], up: [] }],
			feedbacks: [],
		}
		presets[`sb_m2_${k}`] = {
			type: 'button',
			category: cat,
			name: `${b.name} — take a point back, team 2`,
			style: style(`T2\n−1`, combineRgb(60, 60, 70), WHITE, '14'),
			steps: [{ down: [{ actionId: 'sb_point', options: { name: b.name, team: '2', delta: '-1' } }], up: [] }],
			feedbacks: [],
		}
		presets[`sb_next_${k}`] = {
			type: 'button',
			category: cat,
			name: `${b.name} — next game/set`,
			style: style(`NEXT\nGAME\n$(${self.label}:sb_${k}_game)`, DARK, WHITE, '7'),
			steps: [{ down: [{ actionId: 'sb_nextgame', options: { name: b.name } }], up: [] }],
			feedbacks: [],
		}
	}

	// ---- presenter timer ----
	presets['timer_air'] = {
		type: 'button',
		category: 'Presenter timer',
		name: 'Timer on/off air',
		style: style('TIMER\nAIR', DARK),
		steps: [
			{ down: [{ actionId: 'timer_air', options: {} }], up: [] },
			{ down: [{ actionId: 'timer_off', options: {} }], up: [] },
		],
		feedbacks: [{ feedbackId: 'timer_visible', options: {}, style: { bgcolor: RED, color: WHITE } }],
	}
	presets['timer_startpause'] = {
		type: 'button',
		category: 'Presenter timer',
		name: 'Timer start / pause',
		style: style(`START\n$(${self.label}:timer_time)`, DARK, WHITE, '14'),
		steps: [
			{ down: [{ actionId: 'timer_start', options: {} }], up: [] },
			{ down: [{ actionId: 'timer_pause', options: {} }], up: [] },
		],
		feedbacks: [{ feedbackId: 'timer_running', options: {}, style: { bgcolor: GREEN, color: BLACK } }],
	}
	presets['timer_reset'] = {
		type: 'button',
		category: 'Presenter timer',
		name: 'Timer reset',
		style: style('RESET', DARK),
		steps: [{ down: [{ actionId: 'timer_reset', options: {} }], up: [] }],
		feedbacks: [],
	}
	presets['timer_plus'] = {
		type: 'button',
		category: 'Presenter timer',
		name: 'Timer +30 seconds',
		style: style('+30s', AMBER, BLACK),
		steps: [{ down: [{ actionId: 'timer_adjust', options: { seconds: '30' } }], up: [] }],
		feedbacks: [],
	}
	presets['timer_minus'] = {
		type: 'button',
		category: 'Presenter timer',
		name: 'Timer −30 seconds',
		style: style('−30s', AMBER, BLACK),
		steps: [{ down: [{ actionId: 'timer_adjust', options: { seconds: '-30' } }], up: [] }],
		feedbacks: [],
	}

	// ---- baseball / softball ----
	presets['bl_air'] = {
		type: 'button',
		category: 'Baseball / softball',
		name: 'Board on/off air',
		style: style('BALL\nAIR', DARK),
		steps: [
			{ down: [{ actionId: 'bl_show', options: {} }], up: [] },
			{ down: [{ actionId: 'bl_hide', options: {} }], up: [] },
		],
		feedbacks: [{ feedbackId: 'baseball_visible', options: {}, style: { bgcolor: RED, color: WHITE } }],
	}
	presets['bl_ball'] = {
		type: 'button',
		category: 'Baseball / softball',
		name: 'Ball',
		style: style(`BALL\n$(${self.label}:bl_count)`, GREEN, BLACK, '14'),
		steps: [{ down: [{ actionId: 'bl_ball', options: {} }], up: [] }],
		feedbacks: [],
	}
	presets['bl_strike'] = {
		type: 'button',
		category: 'Baseball / softball',
		name: 'Strike',
		style: style(`STRIKE\n$(${self.label}:bl_count)`, combineRgb(180, 60, 20), WHITE, '14'),
		steps: [{ down: [{ actionId: 'bl_strike', options: {} }], up: [] }],
		feedbacks: [],
	}
	presets['bl_out'] = {
		type: 'button',
		category: 'Baseball / softball',
		name: 'Out',
		style: style(`OUT\n$(${self.label}:bl_outs)`, RED, WHITE, '14'),
		steps: [{ down: [{ actionId: 'bl_out', options: {} }], up: [] }],
		feedbacks: [],
	}
	presets['bl_advance'] = {
		type: 'button',
		category: 'Baseball / softball',
		name: 'Next half-inning',
		style: style(`NEXT\n$(${self.label}:bl_inning)`, DARK, WHITE, '7'),
		steps: [{ down: [{ actionId: 'bl_advance', options: {} }], up: [] }],
		feedbacks: [],
	}
	presets['bl_run1'] = {
		type: 'button',
		category: 'Baseball / softball',
		name: 'Run — away',
		style: style(`AWAY\n+1\n$(${self.label}:bl_score1)`, BLUE, WHITE, '7'),
		steps: [{ down: [{ actionId: 'bl_run', options: { team: '1', delta: '1' } }], up: [] }],
		feedbacks: [],
	}
	presets['bl_run2'] = {
		type: 'button',
		category: 'Baseball / softball',
		name: 'Run — home',
		style: style(`HOME\n+1\n$(${self.label}:bl_score2)`, BLUE, WHITE, '7'),
		steps: [{ down: [{ actionId: 'bl_run', options: { team: '2', delta: '1' } }], up: [] }],
		feedbacks: [],
	}

	// ---- teleprompter ----
	// Laid out the way the panel in the app is laid out: on air and roll/hold first, then the
	// speed pair, then where-you-are. An operator who has used one should recognise the other.
	const PR = 'Teleprompter'
	presets['prompter_air'] = {
		type: 'button',
		category: PR,
		name: 'Teleprompter on / off air',
		style: style('PROMPT\noff air', DARK, WHITE, '7'),
		// Two steps rather than one toggle action: the app has no single "toggle on air" command,
		// and a button that lies about its state is worse than one extra press.
		steps: [
			{ down: [{ actionId: 'prompter_air', options: {} }], up: [] },
			{ down: [{ actionId: 'prompter_off', options: {} }], up: [] },
		],
		feedbacks: [{ feedbackId: 'prompter_visible', options: {}, style: { bgcolor: RED, color: WHITE, text: 'PROMPT\nON AIR' } }],
	}
	presets['prompter_rollhold'] = {
		type: 'button',
		category: PR,
		name: 'Roll / hold the script',
		style: style(`ROLL\n$(${self.label}:prompter_percent)%`, DARK, WHITE, '14'),
		steps: [{ down: [{ actionId: 'prompter_toggle', options: {} }], up: [] }],
		feedbacks: [
			{
				feedbackId: 'prompter_running',
				options: {},
				style: { bgcolor: GREEN, color: BLACK, text: `HOLD\n$(${self.label}:prompter_percent)%` },
			},
		],
	}
	presets['prompter_faster'] = {
		type: 'button',
		category: PR,
		name: 'Speed up',
		style: style(`FASTER\n$(${self.label}:prompter_speed)`, DARK, WHITE, '7'),
		steps: [{ down: [{ actionId: 'prompter_faster', options: { by: '5' } }], up: [] }],
		feedbacks: [],
	}
	presets['prompter_slower'] = {
		type: 'button',
		category: PR,
		name: 'Slow down',
		style: style(`SLOWER\n$(${self.label}:prompter_speed)`, DARK, WHITE, '7'),
		steps: [{ down: [{ actionId: 'prompter_slower', options: { by: '5' } }], up: [] }],
		feedbacks: [],
	}
	presets['prompter_back'] = {
		type: 'button',
		category: PR,
		name: 'Nudge back',
		style: style('▲\nBACK', DARK, WHITE, '14'),
		steps: [{ down: [{ actionId: 'prompter_back', options: {} }], up: [] }],
		feedbacks: [],
	}
	presets['prompter_ahead'] = {
		type: 'button',
		category: PR,
		name: 'Nudge ahead',
		style: style('▼\nAHEAD', DARK, WHITE, '14'),
		steps: [{ down: [{ actionId: 'prompter_ahead', options: {} }], up: [] }],
		feedbacks: [],
	}
	presets['prompter_top'] = {
		type: 'button',
		category: PR,
		name: 'Back to the top',
		style: style('TOP', AMBER, BLACK, '14'),
		steps: [{ down: [{ actionId: 'prompter_top', options: {} }], up: [] }],
		feedbacks: [],
	}
	presets['prompter_nextmark'] = {
		type: 'button',
		category: PR,
		name: 'Next section',
		style: style(`SECT ▶\n$(${self.label}:prompter_section)`, DARK, WHITE, '7'),
		steps: [{ down: [{ actionId: 'prompter_nextmark', options: {} }], up: [] }],
		feedbacks: [],
	}
	presets['prompter_prevmark'] = {
		type: 'button',
		category: PR,
		name: 'Previous section',
		style: style(`◀ SECT\n$(${self.label}:prompter_section)`, DARK, WHITE, '7'),
		steps: [{ down: [{ actionId: 'prompter_prevmark', options: {} }], up: [] }],
		feedbacks: [],
	}
	// A read-only button. Worth having its own: on a long script the number an operator wants
	// during a read is how much is LEFT, and there is nowhere else on the desk showing it.
	presets['prompter_where'] = {
		type: 'button',
		category: PR,
		name: 'Where the read is (no action)',
		style: style(
			`$(${self.label}:prompter_section)\n$(${self.label}:prompter_percent)%\n-$(${self.label}:prompter_left)`,
			DARK,
			WHITE,
			'7'
		),
		steps: [{ down: [], up: [] }],
		feedbacks: [],
	}

	// One button per bookmark, generated from the script that is loaded — the same idea as the
	// number keys on the panel, but with the section that is being read lit up.
	for (const m of self.state.prompter?.geom?.marks ?? []) {
		if (!m?.name) continue
		presets[`prompter_mark_${slug(m.name)}`] = {
			type: 'button',
			category: 'Teleprompter — sections',
			name: `Jump to “${m.name}”`,
			style: style(m.name, DARK, WHITE, '7'),
			steps: [{ down: [{ actionId: 'prompter_mark', options: { name: m.name } }], up: [] }],
			feedbacks: [
				{ feedbackId: 'prompter_at_mark', options: { name: m.name }, style: { bgcolor: AMBER, color: BLACK } },
			],
		}
	}

	// One button per SAVED SCRIPT, so a show with several segments gets a row of scripts that
	// lights up whichever one is loaded. Generated from the library, so saving a new script in
	// the app puts a new button here without anyone touching Companion.
	for (const sc of self.state.scripts ?? []) {
		if (!sc?.name) continue
		presets[`prompter_script_${slug(sc.name)}`] = {
			type: 'button',
			category: 'Teleprompter — saved scripts',
			name: `Load “${sc.name}”`,
			style: style(sc.name, DARK, WHITE, '7'),
			steps: [{ down: [{ actionId: 'prompter_script', options: { name: sc.name } }], up: [] }],
			feedbacks: [
				{ feedbackId: 'prompter_script_loaded', options: { name: sc.name }, style: { bgcolor: GREEN, color: BLACK } },
			],
		}
	}

	self.setPresetDefinitions(presets)
}
