
type HierarchicalSelection = {
	startContainerHierarchicalPosition : number[] | null;
	startOffset : number;
	endContainerHierarchicalPosition : number[] | null;
	endOffset : number;
}

export type Position = {
	left: number;
	top: number;
}

export default HierarchicalSelection;

var _nextUid = 1;

export function setNextUid( __nextUid: number ) {
	_nextUid = __nextUid;
}

export function nextUid() : number {
	return _nextUid++;
}