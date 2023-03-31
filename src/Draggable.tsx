import { PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { applicationState } from ".";
import { ApplicationStateContext } from "./ApplicationState";

import './Draggable.scss';

export interface DraggableObject {
}

type Props = {
	draggableObject : DraggableObject;
	className?: string;
}

const minDeltaToStartDragging = 5;

export default function Draggable({ children, draggableObject, className } : PropsWithChildren<Props>) {

	let { draggingObject, setDraggingObject } = useContext( ApplicationStateContext );

	const [captured, setCaptured] = useState<boolean>( false );
	const [dragging, setDragging] = useState<boolean>( false );
	const captureStart = useRef<number[]>( [0, 0] );
	const [dragPos, setDragPos] = useState<number[]>( [0, 0] );
	const $container = useRef<HTMLDivElement>( null );
	const dragOffset = useRef<number[]>( [0, 0] );

	function onMouseDown( e: React.MouseEvent ) {
		if ( e.button != 0 ) return;
		if ( !$container.current ) return;
		captureStart.current = [ e.clientX, e.clientY ];
		let containerRect = $container.current.getBoundingClientRect();
		dragOffset.current = [ e.clientX - containerRect.left, e.clientY - containerRect.top ];
		setCaptured( true );
		e.stopPropagation();
	}
	function onMouseMove( e: MouseEvent ) {
		if ( !captured ) return;
		let currentPos = [ e.clientX, e.clientY ];
		if ( !dragging ) {
			let maxDelta = Math.max( Math.abs( captureStart.current[ 0 ] - currentPos[ 0 ] ), Math.abs( captureStart.current[ 1 ] - currentPos[ 1 ] ) );
			if ( maxDelta > minDeltaToStartDragging ) {
				setDragging( true );
				setDraggingObject( draggableObject );
				setDragPos( currentPos );
			}
		} else {
			setDragPos( currentPos );
		}
	}

	function onMouseUp() {
		setCaptured( false );
		setDragging( false );
		setDraggingObject( null );
	}

	useEffect(() => {
		document.addEventListener( 'mouseup', onMouseUp, false );
		document.addEventListener( 'mousemove', onMouseMove, false );
		return () => {
			document.removeEventListener( 'mousemove', onMouseMove, false );
			document.removeEventListener( 'mouseup', onMouseUp, false );
		}
	}, [dragging, captured]);

	return <>
				<div	ref={$container}
						className={'draggable' + (dragging ? ' dragging' : '') + (className ? ' ' + className : '')}
						onMouseDown={onMouseDown}>
						{children}
				</div>
				{dragging &&
					<div	className="drag"
							style={{left: dragPos[ 0 ] - dragOffset.current[ 0 ], top: dragPos[ 1 ] - dragOffset.current[ 1 ]}}>{children}</div>}
			</>;
}