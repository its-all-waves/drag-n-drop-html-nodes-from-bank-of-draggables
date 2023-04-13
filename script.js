/* GOALS

- use pointer events to implement custom drag n drop 
- drag 1 box into another
- must not translate upon click/tap

*/

const origin = document.querySelector('.origin')
const receiver = document.querySelector('.receiver')
const draggableDiv = document.querySelector('.draggable')


draggableDiv.addEventListener('pointerdown', pointerDown)


function pointerDown(e) {

	// TEST DELETE
	console.log('what the fucking fuck')

	const draggable = e.target

	// account for touch
	if (e.pointerType === 'touch') {
		draggable.style.touchAction = 'none'
	}

	// visual feedback of holding the draggable
	draggable.classList.add('holding')

	// (also fixes holding class remaining after pointer up)
	draggable.setPointerCapture(e.pointerId)

	// get computed width and height of draggable
	const bounds = draggable.getBoundingClientRect()

	// store the offset of the click to the top/left of the draggable
	draggable.offset = { x: e.clientX - bounds.x, y: e.clientY - bounds.y }

	// allow the draggable to be positioned manually
	draggable.style.position = 'absolute'

	// stop translation of the draggable upon click/tap
	updatePosition(e)

	// start listening for pointermove, pointerup
	draggable.addEventListener('pointermove', pointerMove)
	draggable.addEventListener('pointerup', pointerUp)
	draggable.addEventListener('pointercancel', pointerUp)
}


function pointerUp(e) {

	const draggable = e.target
	draggable.classList.remove('holding')
	draggable.style.position = ''
	
	// determine where we are so we can drop the item there, if appropriate...
	// 'hide' the draggable from 'view' so we can at what's under it, get what's under, then 'unhide the draggable
	draggable.style.pointerEvents = 'none'
	const dropZone = document.elementFromPoint(e.clientX, e.clientY)
	// 'unhide' the draggable
	draggable.style.pointerEvents = ''
	
	if (
		dropZone.classList.contains('receiver') ||
		dropZone.classList.contains('origin')
		) {
			dropZone.appendChild(draggable);
		}
		
	// last step - remove all the event listeners from the draggable
	draggable.removeEventListener('pointermove', pointerMove)
	draggable.removeEventListener('pointerup', pointerUp)
}


function pointerMove(e) {
	updatePosition(e)
}

function updatePosition(e) {
	const draggable = e.target
	const offset = draggable.offset
	draggable.style.left = `${e.clientX - offset.x}px`
	draggable.style.top = `${e.clientY - offset.y}px`
}


