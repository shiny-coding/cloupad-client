import './Resizable.scss';
import './WithContextMenu.scss';
import React, { KeyboardEvent, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Position } from './Types';

type Props = {
	menuItems: (ContextMenuItem|null)[],
	className?: string;
}

export interface ContextMenuItem {
	label: string;
	onClick: () => void;
}

declare global {
	interface WindowEventMap {
		keydown: KeyboardEvent<HTMLInputElement>
	}
}

var openedMenuCloser : (() => void) | null = null;

function scheduleCloseMenu() {
	if ( !openedMenuCloser ) return;
	let closer = openedMenuCloser;
	setTimeout( function() {
		if ( openedMenuCloser == closer ) openedMenuCloser();
	} );
}

document.addEventListener( 'mouseup', scheduleCloseMenu, false );

window.addEventListener( 'keydown', function( e: KeyboardEvent<HTMLInputElement> ) {
	if ( e.key == 'Escape' ) scheduleCloseMenu();
} );

export default function WithContextMenu({ children, className, menuItems } : PropsWithChildren<Props>) {

	let [showing, setShowing] = useState( false );
	const $container = useRef<HTMLDivElement>( null );
	const $menu = useRef<HTMLDivElement>( null );
	let [mouseClickPosition, setMouseClickPosition] = useState<Position|null>( null );
	let [position, setPosition] = useState<Position|null>( null );

	function onContextMenu( e : React.MouseEvent ) {
		if ( !$container.current ) return;
		if ( openedMenuCloser ) openedMenuCloser();
		let mouseClickPosition = { left: e.clientX, top: e.clientY };
		setMouseClickPosition( mouseClickPosition );
		if ( $menu.current ) setCorrectPosition( mouseClickPosition );
		setShowing( true );
		openedMenuCloser = () => {
			setShowing( false );
			setMouseClickPosition( null );
			setPosition( null );
		}
		e.preventDefault();
		e.stopPropagation();
	}

	function setCorrectPosition( position: Position ) {
		if ( !$menu.current ) return;
		let menuHeight = $menu.current.getBoundingClientRect().height;
		let lowestPoint = window.innerHeight - 10;
		if ( position.top + menuHeight > lowestPoint ) {
			position.top = Math.max( lowestPoint - menuHeight, 0 );
		}
		setPosition( { left: position.left, top: position.top } );
	}

	useEffect( function() {
		if ( showing && !position && mouseClickPosition ) {
			setCorrectPosition( mouseClickPosition );
		}
	}, [ showing ] );

	useEffect( function() {
		if ( showing && position && $menu.current ) {
			$menu.current.style.visibility = ''
		}
	}, [ position, showing ] );

	return	<>
				<div ref={$container}
					className={'with-context-menu' + (className ? ' ' + className : '')}
					onContextMenu={onContextMenu}	>
					{children}
				</div>
				{showing &&
					<div ref={$menu} className="context-menu" style={{ left: position?.left, top: position?.top, visibility: 'hidden' }}>
						{menuItems.map( (item, index) => item &&
							<div key={index} className="context-menu-item" onClick={() => item.onClick()}>
								{item.label}
							</div>
						)}
					</div>
				}
			</>;
}

