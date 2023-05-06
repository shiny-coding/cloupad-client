import React, { useContext, useEffect, useRef, useState } from 'react';
import './App.scss';
import { ApplicationStateContext } from './ApplicationState';
import { cursorCapturedByEditableField } from './EditableField';
import { FileDocument } from './EditorDocument';
import './EditorWindow.scss';
import Ruler from './Ruler';
import { normalLineHeight, restoreSelection, saveSelection } from './Utils';

type Props = {
	onDocumentEdit: () => void;
}

function EditorWindow({ onDocumentEdit } : Props) {

	let activeDocument : FileDocument = useContext( ApplicationStateContext ).activeDocument as FileDocument;
	const $contentEditable = useRef<HTMLDivElement>( null );
	const $editorWindowContainer = useRef<HTMLDivElement>( null );

	function handleChange( e : React.SyntheticEvent ) {
		let _$contentEditable = $contentEditable.current as HTMLElement;
		activeDocument.content = _$contentEditable.innerHTML;
		activeDocument.savedSelection = saveSelection( _$contentEditable );
		activeDocument.linesCount = Math.round( _$contentEditable.getBoundingClientRect().height / normalLineHeight() );
		setRulerLinesCount( activeDocument.linesCount );
		onDocumentEdit();
	}

	function handleCursorChange( e : React.SyntheticEvent ) {
		let documentSelection = document.getSelection() as Selection;
		if ( documentSelection.rangeCount === 0 ) return;

		activeDocument.savedSelection = saveSelection( ($contentEditable.current as HTMLElement) );
	}

	function handleKeyDown( e : React.KeyboardEvent ) {
		if ( e.key == 'Tab' ) {
			document.execCommand( 'insertText', false, '    ' );
			e.preventDefault();
		}
	}

	function handleKeyUp( e : React.KeyboardEvent ) {
		handleCursorChange( e );
	}

	useEffect( () => {

		const pasteHandler = ( event : any ) => {
			let data;
			if ( event.clipboardData.types.includes( 'text/html' ) ) {
				data = event.clipboardData.getData( 'text/html' )
			} else {
				data = event.clipboardData.getData( 'text/plain' );
			}
			event.preventDefault();
			var template = document.createElement( 'template' );
			template.innerHTML = data;

			function visit( node: any ) {
				if ( node.childNodes )
				for ( let i=0; i<node.childNodes.length; ++i ) {
					let child = node.childNodes[ i ];
					visit( child );
				}
				let allowedStyles = [ 'color', 'font-weight', 'text-decoration' ];
				if ( node.style ) {
					let stylesToDelete = [];
					for ( let style of node.style ) {
						if ( !allowedStyles.includes( style ) ) stylesToDelete.push( style );
					}
					for ( let style of stylesToDelete ) node.style[ style ] = '';
				}
				console.log( node );
			}
			visit( template.content );
			document.execCommand( "insertHTML", false, template.innerHTML );
		};

		window.addEventListener( 'paste', pasteHandler );

		return () => { window.removeEventListener( 'paste', pasteHandler ); };
	}, []);


	useEffect(() => {
		let _$contentEditable = $contentEditable.current as HTMLElement;
		if ( activeDocument.savedSelection && !cursorCapturedByEditableField ) {
			restoreSelection( _$contentEditable, activeDocument.savedSelection );
		}
	});

	useEffect(() => {
		if ( activeDocument.savedScrollLinePos ) {
			const _$editorWindowContainer = $editorWindowContainer.current as HTMLElement;
			_$editorWindowContainer.scrollTop = normalLineHeight() * activeDocument.savedScrollLinePos;
		}
		let _$contentEditable = $contentEditable.current as HTMLElement;
		activeDocument.linesCount = _$contentEditable.getBoundingClientRect().height / normalLineHeight();
		setRulerLinesCount( activeDocument.linesCount );

	}, [ activeDocument ]);

	function handleScroll( e : React.SyntheticEvent ) {
		let _$editorWindowContainer = $editorWindowContainer.current as HTMLElement;
		let linesPos = _$editorWindowContainer.scrollTop / normalLineHeight();
		activeDocument.savedScrollLinePos = linesPos;
	}

	function onContainerClick() {
		$contentEditable.current?.focus();
	}

	// an optimization to re-render only a ruler, this will trigger state change of a ruler
	let setRulerLinesCount : (linesCount : number) => void;
	function setSetRulerLinesCount( setLinesCount : (linesCount : number) => void ) { setRulerLinesCount = setLinesCount; }

	return (
		<div ref={$editorWindowContainer} className="editor-window-container" onScroll={handleScroll} onClick={onContainerClick}>
			<Ruler initialLinesCount={activeDocument.linesCount ?? 1} setSetLinesCount={setSetRulerLinesCount} />
			<div ref={$contentEditable}
				className="editor-window"
				contentEditable="true"
				suppressContentEditableWarning={true}
				onInput={handleChange}
				onKeyUp={handleKeyUp}
				onKeyDown={handleKeyDown}
				onFocus={handleCursorChange}
				onClick={handleCursorChange}
				onTouchStart={handleCursorChange}
				onPaste={handleChange}
				onCut={handleChange}
				spellCheck={false}
				dangerouslySetInnerHTML={{__html: activeDocument.content ?? ''}}></div>
		</div>
	);
}

export default EditorWindow;
