import './Resizable.scss';

import React, { ReactNode, SyntheticEvent, useEffect, useRef, useState } from 'react';

type Props = {
	renderFirstComponent: (width: number) => ReactNode;
	renderSecondComponent: () => ReactNode;
	className: string;
	firstComponentWidth: number;
}

export default function Resizable({ className, renderFirstComponent, renderSecondComponent, firstComponentWidth } : Props) {

	let [__firstComponentWidth, setFirstComponentWidth] = useState( firstComponentWidth );

	const $anchor = useRef<HTMLDivElement>( null );
	const $container = useRef<HTMLDivElement>( null );
	const anchorOffset = useRef<number>( 0 );
	const [captured, setCaptured] = useState<boolean>( false );
	function onMouseDown( e : React.MouseEvent ) {
		if ( !$anchor.current ) return;
		let anchorRect = $anchor.current.getBoundingClientRect();
		anchorOffset.current = e.clientX - anchorRect.left;
		setCaptured( true );
	}
	function onMouseUp() {
		setCaptured( false );
	}
	function onMouseMove( e : React.MouseEvent ) {
		if ( !captured ) return;
		if ( !$container.current ) return;
		let containerRect = $container.current.getBoundingClientRect();
		let newWidth = e.clientX - containerRect.left - anchorOffset.current;
		newWidth = Math.max( newWidth, 50 );
		setFirstComponentWidth( newWidth );
	}

	useEffect(() => {
		document.addEventListener( 'mouseup', onMouseUp, false );
		return () => {
			document.removeEventListener( 'mouseup', onMouseUp, false );
		}
	});

	const firstMinWidth = 130;
	const collapseWidth = 70;

	return <div ref={$container}
				className={'resizable-container ' + className}
				onMouseMove={onMouseMove}
				onMouseUp={onMouseUp}>
				{__firstComponentWidth >= collapseWidth &&
				<div className="first-component-container" style={{
					width: __firstComponentWidth,
					minWidth: firstMinWidth
				}}>
					{renderFirstComponent(__firstComponentWidth)}
				</div>}
				<div	ref={$anchor}
						className={"resize-anchor" + (captured ? ' captured' : '')}
						onMouseDown={onMouseDown}	>
					<div className="resize-anchor-line"/>
				</div>
				<div className="second-component-container">
					{renderSecondComponent()}
				</div>
		</div>;
}