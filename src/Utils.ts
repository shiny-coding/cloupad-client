import HierarchicalSelection from "./Types";

const $lineHeightHelper = document.getElementById( 'lineHeightHelper' );

var computedNormalLineHeight : number | undefined;

export function normalLineHeight() {
	if ( computedNormalLineHeight === undefined ) {
		if ( $lineHeightHelper == null ) throw new Error( "Cannot find #lineHeightHelper" );
		computedNormalLineHeight = parseFloat( getComputedStyle( $lineHeightHelper ).height );
	}
	return computedNormalLineHeight;
}

function getHierarchicalPosition( element: Node , container: HTMLElement ) {
	if ( !container.contains( element ) ) return null;

	let positions : number[] = [];
	let current = element;
	while ( current !== container ) {
		let parent = current.parentNode as Node;
		for ( let i=0; i<parent.childNodes.length; i++ ) {
			if ( parent.childNodes[ i ] === current ) {
				positions.push( i );
				break;
			}
		}
		current = parent;
	}

	return positions.reverse();
}

export function getHierarchicalChild( container: Node, positions: number[] | null ) {
	if ( positions == null ) return null;
	let current = container;
	for ( let position of positions ) {
		current = current.childNodes[ position ];
	}
	return current;
}

export function saveSelection( element: HTMLElement ) : HierarchicalSelection {
	let documentSelection = document.getSelection() as Selection;
	let range = documentSelection.getRangeAt(0);
	let selection = {
		startContainerHierarchicalPosition : getHierarchicalPosition( range.startContainer, element ),
		startOffset : range.startOffset,
		endContainerHierarchicalPosition : getHierarchicalPosition( range.endContainer, element ),
		endOffset : range.endOffset
	};
	return selection;
}

export function restoreSelection( element: HTMLElement, selection: HierarchicalSelection ){
	let documentSelection = document.getSelection() as Selection;
	documentSelection.removeAllRanges();

	let startContainer = getHierarchicalChild( element, selection.startContainerHierarchicalPosition );
	let endContainer = getHierarchicalChild( element, selection.endContainerHierarchicalPosition );

	const range = document.createRange();
	if ( startContainer && endContainer ) {
		range.setStart( startContainer, selection.startOffset );
		range.setEnd( endContainer,  selection.endOffset );
	}
	documentSelection.addRange( range );
	return selection;
}
