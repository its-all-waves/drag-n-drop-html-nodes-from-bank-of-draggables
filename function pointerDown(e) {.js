function pointerDown(e) {
	let draggable = e.target

	// copy if grabbed from origin, move otherwise
	if (draggable.parentNode.classList.contains('origin')) {
		// copy node in-place
		copy = copy(draggable)
		copy.classList.add('copy') // DEBUG ONLY
		draggable.parentNode.appendChild(copy)
		// TODO: on drop, if still in origin, delete what's dragged to leave only copy

		// update position of original draggable element
		updatePosition(e)
	}

	// visual feedback of holding the draggable
	draggable.classList.add('holding')

	// (also fixes holding class remaining after pointer up)
	draggable.setPointerCapture(e.pointerId)

	// get computed width and height of draggable
	const bounds = draggable.getBoundingClientRect()

	// store the offset of the click to the top/left of the draggable
	draggable.grabOffset = { x: e.clientX - bounds.x, y: e.clientY - bounds.y }

	// allow the draggable to be positioned manually
	draggable.style.position = 'absolute'

	// stop translation of the draggable upon click/tap
	updatePosition(e)

	// start listening for pointermove, pointerup
	draggable.addEventListener('pointermove', pointerMove)
	draggable.addEventListener('pointerup', pointerUp)
	draggable.addEventListener('pointercancel', pointerUp)
}