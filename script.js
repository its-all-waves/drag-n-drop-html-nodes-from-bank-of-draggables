/* GOALS

- [x] use pointer events to implement custom drag n drop 
- [x] drag 1 box into another
- [x] must not translate upon click/tap
- [x] copies from origin
- [x] moves from receiver into another receiver
- [ ] draggable stores which receiver is hovered-over
- [ ] hovered-over divs visually respond to the state

*/

const origin = document.querySelector('.origin')
const receiver = document.querySelector('.receiver')
const draggableDiv = document.querySelector('.draggable')

// Keeps the page from moving when dragging a draggable
draggableDiv.style.touchAction = 'none'

// Apply all the event listeners to the draggable thru this listener
draggableDiv.addEventListener('pointerdown', pointerDown)

// Disallow the page from being pulled down to refresh / doing that bouncy bs
document.documentElement.style.setProperty('overscroll-behavior', 'none')


function pointerDown(e) {
	let draggable = e.target

	const draggedFromOrigin = draggable.parentNode.classList.contains('origin')
	// copy in-place if grabbed from origin, move otherwise
	// (truly -- leave a copy behind and drag the thing you clicked)
	if (draggedFromOrigin) {
		// store the copy in the draggable to be ref'd outside of this scope *
		const copy = draggable.copy = copyNode(draggable)
		// stop left-behind copy from translating under original draggable **
		copy.style.position = 'absolute'
		draggable.parentNode.appendChild(copy)
		// TODO: on drop, if still in origin, delete either the dragged or the copy
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

	// undoes: stop left-behind copy from translating under original draggable **
	// undoes: store the copy in the draggable to be ref'd outside of this scope *
	if (draggable.copy) {
		/* Yes, this is necessary, as .copy [must be] a pointer to the actual copy,
		need to make one final reference (1st 'undoes' above) before deleting. */
		draggable.copy.style.position = ''
		delete draggable.copy
	}

	// start listening for pointermove, pointerup
	draggable.addEventListener('pointermove', pointerMove)
	draggable.addEventListener('pointerup', pointerUp)
	draggable.addEventListener('pointercancel', pointerUp)
}


/* Determine where we are so we can drop the item there, if appropriate */
function pointerUp(e) {
	const draggable = e.target

	// remove all css that's no longer needed
	draggable.classList.remove('holding')
	draggable.style.position = ''
	draggable.style.top = ''
	draggable.style.left = ''

	// 'hide' the draggable from pointer so we can get at what's under it,
	// get what's under, then 'unhide' the draggable
	draggable.style.pointerEvents = 'none'
	const dropZone = document.elementFromPoint(e.clientX, e.clientY)
	// 'unhide' the draggable
	draggable.style.pointerEvents = ''

	// append the draggable where it's dropped if it's a valid place
	if (dropZone.classList.contains('receiver')) dropZone.appendChild(draggable)
	
	// don't append the draggable to the origin if it's dropped outside a receiver
	else draggable.remove()
	/* 👆🏽 NOTE: For an unknown reason, I had to generalize this to an else instead of a separate [if dropZone's classlist contains 'origin']. When it was a separate if statement, it only worked reliably when dropped above the element, in the 'origin'. If dropped below the element, still in 'origin', it would work 50% of the time. Wah? */

	// (last step) remove event listeners that were added on pointerdown
	draggable.removeEventListener('pointermove', pointerMove)
	draggable.removeEventListener('pointerup', pointerUp)
}


function pointerMove(e) { updatePosition(e) }


/* Window scroll accounts for offsets in position vals 
due to being scrolled or zoomed (IOW, when content outside 
the viewport). */
function updatePosition(e) {
	const draggable = e.target
	const grabOffset = draggable.grabOffset
	const x = e.clientX - grabOffset.x + window.scrollX
	const y = e.clientY - grabOffset.y + window.scrollY
	draggable.style.left = x + 'px'
	draggable.style.top = y + 'px'
}

function copyNode(draggedNode) {
	const draggedCopy = document.createElement('div')
	draggedCopy.className = draggedNode.className
	draggedCopy.textContent = draggedNode.textContent
	draggedCopy.style.touchAction = 'none'
	draggedCopy.addEventListener('pointerdown', pointerDown)
	return draggedCopy
}

/* ORIGINAL - Does not account for offset produced by zoom 
and scroll (out-of-view content) */
// function updatePosition(e) {
// 	const draggable = e.target
// 	const grabOffset = draggable.grabOffset
// 	draggable.style.left = `${e.clientX - grabOffset.x}px`
// 	draggable.style.top = `${e.clientY - grabOffset.y}px`
// }