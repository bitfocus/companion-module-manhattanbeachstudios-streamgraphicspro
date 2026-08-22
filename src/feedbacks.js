import { combineRgb } from '@companion-module/base'
import { prompterSection } from './variables.js'

/**
 * Feedbacks colour a button from live app state, so an operator can see at a glance
 * what is actually on air rather than remembering what they last pressed.
 */

const RED = combineRgb(224, 49, 49)
const WHITE = combineRgb(255, 255, 255)
const GREEN = combineRgb(18, 184, 134)
const BLACK = combineRgb(0, 0, 0)
const AMBER = combineRgb(234, 179, 8)

const eq = (a, b) => String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase()

export function updateFeedbacks(self) {
	const presets = self.choices.presets
	const boards = self.choices.scoreboards
	const marks = self.choices.marks

	self.setFeedbackDefinitions({
		preset_on: {
			type: 'boolean',
			name: 'Library preset is on air',
			description: 'Turns the button red while this preset is on the Program output',
			defaultStyle: { bgcolor: RED, color: WHITE },
			options: [
				{
					type: 'dropdown',
					label: 'Library preset',
					id: 'name',
					default: presets[0]?.id ?? '',
					choices: presets,
					allowCustom: true,
				},
			],
			callback: (fb) => !!self.state.shows?.find((s) => eq(s.name, fb.options.name))?.on,
		},

		scoreboard_visible: {
			type: 'boolean',
			name: 'Scoreboard is on air',
			description: 'Turns the button red while this scoreboard is showing',
			defaultStyle: { bgcolor: RED, color: WHITE },
			options: [
				{
					type: 'dropdown',
					label: 'Scoreboard',
					id: 'name',
					default: boards[0]?.id ?? '',
					choices: boards,
					allowCustom: true,
					tooltip: 'Leave blank for the first scoreboard',
				},
			],
			callback: (fb) => {
				const list = self.state.scoreboards ?? []
				const b = String(fb.options.name ?? '').trim() ? list.find((x) => eq(x.name, fb.options.name)) : list[0]
				return !!b?.visible
			},
		},

		timer_visible: {
			type: 'boolean',
			name: 'Presenter timer is on air',
			defaultStyle: { bgcolor: RED, color: WHITE },
			options: [],
			callback: () => !!self.state.timer?.visible,
		},

		timer_running: {
			type: 'boolean',
			name: 'Presenter timer is running',
			description: 'Green while the clock is actually ticking',
			defaultStyle: { bgcolor: GREEN, color: BLACK },
			options: [],
			callback: () => !!self.state.timer?.running,
		},

		baseball_visible: {
			type: 'boolean',
			name: 'Baseball board is on air',
			defaultStyle: { bgcolor: RED, color: WHITE },
			options: [],
			callback: () => !!self.state.baseball?.visible,
		},

		prompter_visible: {
			type: 'boolean',
			name: 'Teleprompter is on air',
			description: 'Turns the button red while the script is being shown',
			defaultStyle: { bgcolor: RED, color: WHITE },
			options: [],
			callback: () => !!self.state.prompter?.visible,
		},

		prompter_running: {
			type: 'boolean',
			name: 'Teleprompter is rolling',
			description: 'Green while the script is actually moving. Holding is not the same as off air.',
			defaultStyle: { bgcolor: GREEN, color: BLACK },
			options: [],
			callback: () => !!self.state.prompter?.running,
		},

		prompter_at_mark: {
			type: 'boolean',
			name: 'Teleprompter is in this section',
			/* This is the one that makes a wall of bookmark buttons worth having. Jumping to a
			   section is only half the job — the other half is knowing, without looking away from
			   the presenter, which section the read is in now. */
			description: 'Lights the button for whichever section the read has reached',
			defaultStyle: { bgcolor: AMBER, color: BLACK },
			options: [
				{
					type: 'dropdown',
					label: 'Bookmark',
					id: 'name',
					default: marks[0]?.id ?? '',
					choices: marks,
					allowCustom: true,
				},
			],
			callback: (fb) => {
				const nm = String(fb.options.name ?? '').trim()
				if (!nm) return false
				return eq(prompterSection(self.state.prompter, self.clockOffset).name, nm)
			},
		},

		connected: {
			type: 'boolean',
			name: 'Connected to StreamGraphics Pro',
			description: 'Use this on a status button so a dead connection is obvious before you go live',
			defaultStyle: { bgcolor: GREEN, color: BLACK },
			options: [],
			callback: () => self.connected,
		},
	})
}
