import { PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { applicationState } from ".";
import { ApplicationStateContext } from "./ApplicationState";

import './DragTarget.scss';

type Props = {
	className?: string;
	onDrop: () => void;
}


export default function DragTarget({ children, onDrop, className } : PropsWithChildren<Props>) {

	let { draggingObject, setDraggingObject } = useContext( ApplicationStateContext );
	const [draggingOver, setDraggingOver] = useState<boolean>( false );
	const $container = useRef<HTMLDivElement>( null );

	function onMouseLeave( e: React.MouseEvent ) {
		if ( !draggingObject ) return;
		setDraggingOver( false );
		e.stopPropagation();
	}
	function onMouseEnter( e: React.MouseEvent ) {
		if ( !draggingObject ) return;
		setDraggingOver( true );
		e.stopPropagation();
	}

	function onMouseUp() {
		if ( draggingOver ) {
			onDrop();
		}
		setDraggingOver( false );
	}

	useEffect(() => {
		document.addEventListener( 'mouseup', onMouseUp, false );
        return () => {
            document.removeEventListener( 'mouseup', onMouseUp, false );
        }
    });

	return <>
				<div	ref={$container}
						className={'drag-target' + (className ? ' ' + className : '') + (draggingOver ? ' dragging-over' : '')}
						onMouseUp={onMouseUp}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}>
						{children}
				</div>
			</>;
}