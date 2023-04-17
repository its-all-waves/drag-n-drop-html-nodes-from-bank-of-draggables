/* GOALS
- [x] use pointer events to implement custom drag n drop 
- [x] drag 1 box into another
- [x] must not translate upon click/tap
- [x] copies from origin
- [x] moves from receiver into another receiver
- [x] nothing unexpected when more than 1 div in origin
- [x] draggables don't move when picked up from / dropped inside origin
- [x] draggable stores which receiver is hovered-over
- [x] hovered-over divs visually respond to the state
- [x] if draggable is dropped in receiver but on top of child, behave as expected (append to receiver)
*/

const origin = document.querySelector('.origin')
// const receiver = document.querySelector('.receiver')
const draggables = document.querySelectorAll('.draggable')

draggables.forEach(draggable => {
	// Keeps the page from moving when dragging a draggable
	draggable.style.touchAction = 'none'
	
	// Apply all the event listeners to the draggable thru this listener
	draggable.addEventListener('pointerdown', pointerDown)
})

// Disallow the page from being pulled down to refresh / doing that bouncy bs
document.documentElement.style.setProperty('overscroll-behavior', 'none')

function pointerDown(e) {
	let draggable = e.target

	/* NOTE: only used to stop re-ordering of draggables if dragged from & dropped back into origin */
	// get the child number of the draggable to know where to insert it later
	const children = [...draggable.parentNode.children]
	for (const child of children) {
		if (child === draggable) {
			draggable.childNumber = children.indexOf(child)
			break
		}
	}

	// leave a copy if grabbed from origin, otherwise move
	const draggedFromOrigin = draggable.parentNode.classList.contains('origin')
	if (draggedFromOrigin) {
		// store the copy in the draggable to be ref'd outside of this scope *
		const copy = draggable.copy = copyNode(draggable)
		// stop left-behind copy from translating under original draggable **
		copy.style.position = 'absolute'

		const childNumber = draggable.childNumber
		const nodeToBeReplaced = draggable.parentNode.children[childNumber] 
		draggable.parentNode.insertBefore(copy, nodeToBeReplaced)
	}

	// delete childNumber property since won't be needed again
	if (draggable.childNumber) delete draggable.childNumber

	// add visual feedback for holding the draggable
	draggable.classList.add('holding')

	// lock the draggable to the pointer
	// (also fixes holding class remaining after pointer up)
	draggable.setPointerCapture(e.pointerId)

	// get computed dimensions of draggable to later calc offset of where grabbed 
	const bounds = draggable.getBoundingClientRect()

	// store the offset bt the click and the top/left of the draggable
	draggable.grabOffset = {
		x: e.clientX - bounds.x,
		y: e.clientY - bounds.y,
	}

	// allow the draggable to be positioned manually
	draggable.style.position = 'absolute'

	// stop translation of the draggable on pointerdown
	updatePosition(e)

	// undoes: stop left-behind copy from translating under original draggable **
	// undoes: store the copy in the draggable to be ref'd outside of this scope *
	if (draggable.copy) {
		/* Yes, this is necessary, as .copy [must be] a pointer to the actual copy.
		Need to make one final reference (1st 'undoes' above) before deleting. */
		draggable.copy.style.position = ''
		delete draggable.copy
	}

	// start listening for pointermove, pointerup
	draggable.addEventListener('pointermove', pointerMove)
	draggable.addEventListener('pointerup', pointerUp)
	draggable.addEventListener('pointercancel', pointerUp)
}


/* Determine where we are so we can drop the item there, if appropriate. Should successfully act on a receiver no matter what's inside it or what contains it.*/
function pointerUp(e) {
	const draggable = e.target

	// undoes: store the offset bt the click and the top/left of the draggable
	delete draggable.grabOffset

	// remove css from draggable that's no longer needed
	draggable.classList.remove('holding')
	draggable.style.position = ''
	draggable.style.top = ''
	draggable.style.left = ''

	// get the nodes under the draggable
	const nodesUnderDraggable = document.elementsFromPoint(e.clientX, e.clientY)

	// define dropping on a receiver
	const droppedOnReceiver = nodesUnderDraggable.some(node =>
		node.classList.contains('receiver')
	)

	// if draggable is dropped outside receiver, return,
	// unless it came from origin, then delete it first
	if (!droppedOnReceiver) {
		if (draggable.parentNode === origin) draggable.remove()
		draggable.removeEventListener('pointermove', pointerMove)
		draggable.removeEventListener('pointerup', pointerUp)
		draggable.removeEventListener('pointercancel', pointerUp)
		return
	}

	// we're definitely dropping in a receiver, so get the receiver
	const receiver = nodesUnderDraggable.find(node =>
		node.classList.contains('receiver')
	)

	// kill visual feedback for being hovered over
	receiver.classList.remove('hovered')

	// append draggable to the receiver, remove listeners added on pointerdown
	receiver.appendChild(draggable)
	draggable.removeEventListener('pointermove', pointerMove)
	draggable.removeEventListener('pointerup', pointerUp)
	draggable.removeEventListener('pointercancel', pointerUp)
}

/* Should successfully act on a receiver no matter what's inside it or what contains it. */
function pointerMove(e) {
	const draggable = e.target

	// get the nodes under the draggable
	const nodesUnderDraggable = document.elementsFromPoint(e.clientX, e.clientY)

	// get the receiver if we're over one, else null
	const receiver = nodesUnderDraggable.find(node =>
		node.classList.contains('receiver')
	)

	// get rid of feedback on every other receiver so
	// we can show it only on what we're currently over
	const receivers = document.querySelectorAll('.receiver')
	receivers.forEach(_receiver => {
		if (_receiver !== receiver) _receiver.classList.remove('hovered')
	})

	// hightlight the receiver if we're over one
	receiver?.classList.add('hovered')

	// match the draggable's position to the pointer
	updatePosition(e)
}

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