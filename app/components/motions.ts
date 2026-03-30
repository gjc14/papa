import type { MotionProps } from "motion/react"

type FadeProps = {
	direction?: "up" | "down" | "left" | "right"
	delay?: number
	duration?: number
	distance?: number
}

export function fade({
	direction = "up",
	delay = 0,
	duration = 0.5,
	distance = 15,
}: FadeProps = {}): MotionProps {
	const hidden = () => {
		switch (direction) {
			case "up":
				return { opacity: 0, y: distance }
			case "down":
				return { opacity: 0, y: -distance }
			case "left":
				return { opacity: 0, x: distance }
			case "right":
				return { opacity: 0, x: -distance }
		}
	}

	return {
		variants: {
			hidden: hidden(),
			visible: {
				opacity: 1,
				y: 0,
				x: 0,
			},
		},
		initial: "hidden",
		whileInView: "visible",
		viewport: { once: true },
		transition: { delay, type: "spring", duration },
	}
}
