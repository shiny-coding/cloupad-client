import { KeyboardEvent, SyntheticEvent, useContext, useEffect, useRef, useState } from 'react';
import { applicationState } from '.';
import { ApplicationStateContext } from './ApplicationState';
import './EditableField.scss';
import HierarchicalSelection from './Types';
import { saveSelection, restoreSelection } from './Utils';

type Props = {
	text: string;
	className: string;
	onChange: (newText: string) => void;
	onBlur?: (restoreText: string | null) => void;
	selected: boolean;
	focused: boolean;
}

export var cursorCapturedByEditableField = false;

export default function EditableField({ text, onChange, onBlur, className, selected, focused } : Props) {

	let { draggingObject } = useContext( ApplicationStateContext );

	let [position, setPosition] = useState<HierarchicalSelection | null>( null );
	let initialText = useRef<string>( text );
	let commitChange = useRef<boolean>( false ); // committing on enter-key
	let $ref = useRef<HTMLDivElement>( null );

	if ( focused ) cursorCapturedByEditableField = true;

	function onMouseDown( e : React.MouseEvent ) {
		if ( e.button != 0 ) return;
		if ( cursorCapturedByEditableField ) {
			e.stopPropagation();
		}
	}
	function onMouseUp( e : React.MouseEvent ) {
		if ( e.button != 0 ) return;
		if ( !selected ) return;
		if ( draggingObject ) return;
		let $div = $ref.current;
		if ( !$div ) throw new Error( "WTF?" );
		let wasEditable = $div.getAttribute( 'contenteditable' ) == 'true';
		if ( !wasEditable ) {
			initialText.current = $div.innerText;
			commitChange.current = false;
			$div.setAttribute( 'contenteditable', 'true' );
			$div.focus();
			cursorCapturedByEditableField = true;
		}
	}

	function onInput( e : SyntheticEvent ) {
		if ( !$ref.current ) return;
		setPosition( saveSelection( $ref.current ) );
		onChange( $ref.current.innerText ?? '' );
		e.stopPropagation();
		e.preventDefault();
	}
	function onKeyPress( e : KeyboardEvent<HTMLDivElement> ) {
		if ( e.key == 'Enter' ) {
			e.stopPropagation();
			e.preventDefault();
			if ( $ref.current?.innerText.trim() != '' ) {
				commitChange.current = true;
				$ref.current?.blur();
			}
		}
	}
	function onKeyUp( e : KeyboardEvent<HTMLDivElement> ) {
		if ( e.key == 'Escape' ) {
			$ref.current?.blur();
		}
	}
	function onLeave() {
		$ref.current?.removeAttribute( 'contenteditable' );
		setPosition( null );
		cursorCapturedByEditableField = false;
		if ( onBlur ) {
			onBlur( commitChange.current ? null : initialText.current );
		}
	}

	useEffect( () => {
		let $div = $ref.current;
		if ( !$div ) return;
		if ( focused ) $div.focus();
		if ( position ) restoreSelection( $div, position );

	}, [ text, position, focused ]);

	return <div ref={$ref}
				className={'editable-field ' + className}
				onMouseDown={onMouseDown}
				onMouseUp={onMouseUp}
				onContextMenu={()=>0}
				onBlur={onLeave}
				onKeyPress={onKeyPress}
				onKeyUp={onKeyUp}
				onInput={onInput}
				contentEditable={focused}
				dangerouslySetInnerHTML={{__html: text ?? ''}}/>;

}