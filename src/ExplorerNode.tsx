import { ReactNode, useContext, useState } from "react";
import { applicationState } from ".";
import { ApplicationStateContext } from "./ApplicationState";
import Draggable from "./Draggable";
import DragTarget from "./DragTarget";
import EditableField, { cursorCapturedByEditableField } from "./EditableField";
import { EditorDocument, FolderDocument } from "./EditorDocument";
import './ExplorerNode.scss';
import { scheduleServerOperation } from "./ServerOperations";
import WithContextMenu from "./WithContextMenu";

type Props = {
	document : EditorDocument;
	onRename: (document: EditorDocument, newName: string) => void;
	onSelect: (document: EditorDocument) => void;
	onBlur: (document: EditorDocument, restoreName: string|null) => void;
	onDrop: (target: EditorDocument|null) => void;
	onContextMenuAddNew: (target: EditorDocument, addFile:boolean) => void;
	onContextMenuDelete: (target: EditorDocument) => void;
	onContextMenuCollapse: (target: EditorDocument) => void;
	level: number;
}


export default function ExplorerNode({
		document,
		onRename,
		onSelect,
		onBlur,
		onDrop,
		onContextMenuAddNew,
		onContextMenuDelete,
		onContextMenuCollapse,
		level
	} : Props) {

	let { draggingObject, exploredDocument, documentWithNameEditing, documents } = useContext( ApplicationStateContext );

	let [rerender, setRerender] = useState<number>( 0 );
	let folderDocument = document as FolderDocument;

	function onToggleExpanded() {
		folderDocument.expanded = !folderDocument.expanded;
		scheduleServerOperation( { type: 'editFile', document: folderDocument }, documents );
		setRerender( rerender + 1 );
	}

	function onMouseUp( e : React.MouseEvent ) {
		if ( e.button != 0 ) return;
		let isExploredDocument = document == exploredDocument;
		onSelect( document );
		if ( isExploredDocument && document.isFolder && !draggingObject && !cursorCapturedByEditableField ) {
			onToggleExpanded();
		}
	}

	let children : ReactNode = null;
	if ( folderDocument && folderDocument.expanded && folderDocument.children.length ) {
		children =
			<div className="children" >
				{folderDocument.children.map( child =>
				<Draggable draggableObject={child} key={child.uid}>
					<ExplorerNode	document={child}
									onRename={onRename}
									onSelect={onSelect}
									onBlur={onBlur}
									onDrop={onDrop}
									onContextMenuAddNew={onContextMenuAddNew}
									onContextMenuDelete={onContextMenuDelete}
									onContextMenuCollapse={onContextMenuCollapse}
									level={level+1} />
				</Draggable>
				)}
			</div>;
	}
	return <>
				<WithContextMenu menuItems={
					[ 	{ label: 'New File',
							onClick: () => onContextMenuAddNew( document, true ) },
						{ label: 'New Folder',
							onClick: () => onContextMenuAddNew( document, false ) },
						document.isFolder ? {
								label: (document as FolderDocument).expanded ? "Collapse All" : "Uncollapse All",
								onClick: () => onContextMenuCollapse( document )
							} : null,
						{ label: 'Delete',
							onClick: () => onContextMenuDelete( document ) } ]
				} key={0}>
					<DragTarget onDrop={() => onDrop( document )}>
						<div 	className={'explorer-node'
										+ (document == exploredDocument ? ' selected' : '')
										+ (document.isFolder ? ' folder' : '')
										+ (folderDocument && folderDocument.expanded ? ' expanded' : '')}
							onMouseUp={onMouseUp}
							style={{paddingLeft: (level + 0.5) + 'rem'}}>
							<div className="expanded-toggler"></div>
							<EditableField	text={document.name}
											onChange={name => onRename( document, name )}
											onBlur={(restoreText) => onBlur( document, restoreText )}
											className="name"
											selected={document == exploredDocument}
											focused={document == documentWithNameEditing}	/>
						</div>
					</DragTarget>
				</WithContextMenu>
				{children}
			</>;
}