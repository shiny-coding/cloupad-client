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
				onKeyUp={handleCursorChange}
				onFocus={handleCursorChange}
				onClick={handleCursorChange}
				onTouchStart={handleCursorChange}
				onPaste={handleChange}
				onCut={handleChange}
				dangerouslySetInnerHTML={{__html: activeDocument.content ?? ''}}></div>
		</div>
	);
}

export default EditorWindow;
