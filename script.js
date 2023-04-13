/* GOALS

- [x] use pointer events to implement custom drag n drop 
- [x] drag 1 box into another
- [x] must not translate upon click/tap
- [ ] copies from origin
- [ ] moves from receiver into another receiver

*/

const origin = document.querySelector('.origin')
const receiver = document.querySelector('.receiver')
const draggableDiv = document.querySelector('.draggable')


draggableDiv.addEventListener('pointerdown', pointerDown)

// Disallow the page from being pulled down to refresh / doing that bouncy bs
document.documentElement.style.setProperty('overscroll-behavior', 'none')

function pointerDown(e) {

	const draggable = e.target

	// TODO: WHY DOESN'T THIS WORK?
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
	draggable.grabOffset = { x: e.clientX - bounds.x, y: e.clientY - bounds.y }

	// allow the draggable to be positioned manually
	draggable.style.position = 'absolute'

	// stop translation of the draggable upon click/tap
	updatePosition(e)
	// snapToPointer(e)

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
	// 'hide' the draggable from pointer so we can at what's under it, get what's under, then 'unhide' the draggable
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


/* Window scroll accounts for offsets in position vals 
due to being scrolled or zoomed (IOW, when content outside 
the viewport). */
function updatePosition(e) {
	const draggable = e.target;
	const grabOffset = draggable.grabOffset
	const x = e.clientX - grabOffset.x + window.scrollX;
	const y = e.clientY - grabOffset.y + window.scrollY;
	draggable.style.left = x + 'px';
	draggable.style.top = y + 'px';
}

/* ORIGINAL - Does not account for offset produced by zoom 
and scroll (out-of-view content) */
// function updatePosition(e) {
// 	const draggable = e.target
// 	const grabOffset = draggable.grabOffset
// 	draggable.style.left = `${e.clientX - grabOffset.x}px`
// 	draggable.style.top = `${e.clientY - grabOffset.y}px`
// }
