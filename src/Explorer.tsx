import { useState, useRef, useEffect, forwardRef, useContext } from 'react';
import { ApplicationStateContext } from './ApplicationState';
import Draggable from './Draggable';
import DragTarget from './DragTarget';
import { EditorDocument } from './EditorDocument';
import './Explorer.scss';
import ExplorerNode from './ExplorerNode';
import newFileIcon from './images/new-file.png';
import newFolderIcon from './images/new-folder.png';
import WithContextMenu from './WithContextMenu';

type Props = {
	containerWidth: number;
	onDocumentRename: (document: EditorDocument, newName: string) => void;
	onDocumentSelect: (document: EditorDocument) => void;
	onDocumentAdd: (addFile: boolean) => void;
	onDocumentBlur: (document: EditorDocument, restoreName: string|null) => void;
	onContextMenuAddNew: (target: EditorDocument|null, addFile:boolean) => void;
	onContextMenuDelete: (target: EditorDocument) => void;
	onContextMenuCollapse: (target: EditorDocument|null) => void;
	onDrop: (target: EditorDocument|null) => void;
}

export default function Explorer ({
	containerWidth,
	onDocumentRename,
	onDocumentSelect,
	onDocumentAdd,
	onDocumentBlur,
	onContextMenuAddNew,
	onContextMenuDelete,
	onContextMenuCollapse,
	onDrop} : Props) {


	let { documents } = useContext( ApplicationStateContext );

	return <div className="explorer">
			<div className="controls">
				<div className="logo">ᴄʟᴏᴜᴘᴀᴅ</div>
				<div className="button" onClick={() => onDocumentAdd(true)}><img src={newFileIcon}/></div>
				<div className="button" onClick={() => onDocumentAdd(false)}><img src={newFolderIcon}/></div>
			</div>
			{ documents.map( ( document, index ) =>
				<Draggable	key={document.uid} draggableObject={document}>
					<ExplorerNode	key={document.uid}
									document={document}
									level={0}
									onSelect={onDocumentSelect}
									onRename={onDocumentRename}
									onBlur={onDocumentBlur}
									onDrop={onDrop}
									onContextMenuAddNew={onContextMenuAddNew}
									onContextMenuDelete={onContextMenuDelete}
									onContextMenuCollapse={onContextMenuCollapse}	/>
				</Draggable>
			)}
			<DragTarget className="highlight rest" onDrop={() => onDrop( null )}>
				<WithContextMenu menuItems={
						[ 	{ label: 'New File',
								onClick: () => onContextMenuAddNew( null, true ) },
							{ label: 'New Folder',
								onClick: () => onContextMenuAddNew( null, false ) },
							{ label: "Collapse All",
								onClick: () => onContextMenuCollapse( null )
							} ]
					} key={0}>
				</WithContextMenu>
			</DragTarget>
		</div>
}