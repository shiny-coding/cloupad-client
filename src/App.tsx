import { useState, useContext, useEffect } from 'react';
import './App.scss';
import { EditorDocument, FileDocument, findDocumentParent, folderContainsDocument, FolderDocument, sortFilesAndFolders, updateDocumentPath } from './EditorDocument';
import EditorWindow from './EditorWindow';
import Explorer from './Explorer';
import Tabs from './Tabs';
import Resizable from './Resizable';
import { nextUid } from './Types';
import DragTarget from './DragTarget';
import { ApplicationStateContext } from './ApplicationState';
import Account from './Account';
import { scheduleServerOperation } from './ServerOperations';

function App() {

	let {	activeDocument, setActiveDocument,
			exploredDocument, setExploredDocument,
			setDocumentWithNameEditing,
			setDocumentWithTabNameEditing,
			previewDocument, setPreviewDocument,
			openedDocuments, setOpenedDocuments,
			documents, setDocuments,
			draggingObject } = useContext( ApplicationStateContext );

	useEffect(() => {
		scheduleServerOperation( {
			type: 'updateUser', openedDocuments, activeDocument, previewDocument, exploredDocument
		}, documents );
	}, [ openedDocuments, activeDocument, exploredDocument, previewDocument ] );

	function onTabClick( index : number ) {
		setActiveDocument( openedDocuments[ index ] );
		setExploredDocument( openedDocuments[ index ] );
	}

	function onAddTab() {
		onDocumentAddTo( true, exploredDocument, true );
	}

	function closeActiveDocument( optOpenedDocuments: FileDocument[]|null ) {
		if ( optOpenedDocuments === null ) {
			optOpenedDocuments = openedDocuments;
		}
		if ( activeDocument == null ) return;
		let index = optOpenedDocuments.indexOf( activeDocument );
		if ( index > 0 ) {
			setActiveDocument( optOpenedDocuments[ index - 1 ] );
		} else if ( index < optOpenedDocuments.length - 1 ) {
			setActiveDocument( optOpenedDocuments[ index + 1 ] );
		} else {
			setActiveDocument( null );
		}
	}
	function onTabClose( index : number ) {
		if ( openedDocuments[ index ] === previewDocument ) {
			setPreviewDocument( null );
		}
		if ( openedDocuments[ index ] === activeDocument ) {
			closeActiveDocument( null );
		}
		let newOpenedDocuments = openedDocuments.slice();
		newOpenedDocuments.splice( index, 1 );
		setOpenedDocuments( newOpenedDocuments );
	}

	function onTabTitleChange( index: number, newTitle: string ) {
		if ( !activeDocument ) return;
		activeDocument.name = newTitle;
		if ( activeDocument == previewDocument ) {
			setPreviewDocument( null );
		}
		setOpenedDocuments( openedDocuments.slice() );
		sortFilesAndFolders( documents );
		setDocuments( documents.slice() );

		scheduleServerOperation( { type: 'editFile', document: activeDocument }, documents );
	}

	function onTabTitleBlur( index: number, restoreName: string|null ) {
		onDocumentBlur( openedDocuments[ index ], restoreName );
	}

	function onDocumentRename( document: EditorDocument, newName: string ) {
		document.name = newName;
		setDocuments( documents.slice() );
		scheduleServerOperation( { type: 'editFile', document }, documents );
	}

	function onDocumentAdd( addFile: boolean ) {
		onDocumentAddTo( addFile, exploredDocument, false );
	}

	function onDocumentAddTo( addFile: boolean, exploredDocument: EditorDocument|null, addingInTabs: boolean ) {
		let newDocument =
			addFile ? { name: "", isFolder: false, content: "", uid: nextUid() }
					: { name: "", isFolder: true, children: [], expanded : true, uid: nextUid() };

		let targetFolder : FolderDocument | null = null;
		if ( exploredDocument ) {
			targetFolder = exploredDocument.isFolder
							? exploredDocument as FolderDocument
							: findDocumentParent( exploredDocument, documents );
		}
		let newDocuments = documents;
		if ( targetFolder != null ) {
			targetFolder.expanded = true;
			targetFolder.children = [ newDocument as EditorDocument ].concat( targetFolder.children );
		} else {
			newDocuments = [ newDocument as EditorDocument ].concat( documents.slice() );
			setDocuments( newDocuments );
		}

		if ( !newDocument.isFolder ) {
			setOpenedDocuments( openedDocuments.slice().concat( newDocument as FileDocument ) );
			setActiveDocument( newDocument as FileDocument );
		}
		if ( addingInTabs ) {
			setDocumentWithTabNameEditing( newDocument as FileDocument );
		} else {
			setExploredDocument( newDocument );
			setDocumentWithNameEditing( newDocument );
		}

		scheduleServerOperation( { type: 'editFile', document: newDocument }, newDocuments );
	}

	function onDocumentBlur( document : EditorDocument, restoreName: string|null ) {
		if ( restoreName !== null ) {
			document.name = restoreName;
			scheduleServerOperation( { type: 'editFile', document }, documents );
		}
		let targetFolder = findDocumentParent( document, documents );
		if ( document.name.trim() == '' ) {
			if ( targetFolder ) {
				targetFolder.children = targetFolder.children.filter( d => d != document );
			} else {
				setDocuments( documents.filter( d => d != document ) );
			}
			scheduleServerOperation( { type: 'deleteFile', document }, documents );
			setOpenedDocuments( openedDocuments.filter( d => d != document ) );
			setExploredDocument( null );
			closeActiveDocument( null );
		} else {
			if ( targetFolder == null ) {
				sortFilesAndFolders( documents );
			} else {
				sortFilesAndFolders( targetFolder.children );
			}
			setDocuments( documents.slice() );
		}

		setDocumentWithNameEditing( null );
		setDocumentWithTabNameEditing( null );
	}

	function onDocumentSelect( document: EditorDocument ) {
		if ( !document.isFolder ) {
			let fileDocument = document as FileDocument;
			if ( !openedDocuments.includes( fileDocument ) ) {
				let newOpenedDocuments = openedDocuments.slice();
				if ( previewDocument ) {
					newOpenedDocuments.splice( openedDocuments.indexOf( previewDocument ), 1, fileDocument );
				} else {
					newOpenedDocuments = newOpenedDocuments.concat( fileDocument );
				}
				setPreviewDocument( fileDocument );
				setOpenedDocuments( newOpenedDocuments );
			}
			setActiveDocument( fileDocument );
		}
		setExploredDocument( document );
	}

	function onDocumentEdit() {
		if ( previewDocument == activeDocument ) {
			setPreviewDocument( null );
		}

		scheduleServerOperation( { type: 'editFile', document: activeDocument }, documents );
	}

	function onDrop( target: EditorDocument|null ) {
		let draggingDocument = draggingObject as EditorDocument;
		if ( !draggingDocument ) return;
		if ( draggingDocument == target ) return;
		let parentFolder = findDocumentParent( draggingDocument, documents );
		let targetFolder : FolderDocument|null;
		if ( target ) {
			targetFolder = target?.isFolder ? target as FolderDocument : findDocumentParent( target, documents );
		} else {
			targetFolder = null;
		}

		if ( targetFolder == parentFolder ) return;
		if ( parentFolder == target ) return;
		if ( draggingDocument == targetFolder ) return;

		if ( draggingDocument.isFolder && targetFolder != null && folderContainsDocument( draggingDocument as FolderDocument, targetFolder ) ) return;

		let newDocuments = documents;
		if ( parentFolder == null ) {
			newDocuments = documents.filter( d => d != draggingDocument );
			setDocuments( newDocuments );
		} else {
			parentFolder.children = parentFolder.children.filter( d => d != draggingDocument );
			setDocuments( documents.slice() );
		}

		if ( targetFolder ) {
			targetFolder.children.push( draggingDocument );
			sortFilesAndFolders( targetFolder.children );
		} else {
			newDocuments = documents.slice();
			newDocuments.push( draggingDocument );
			sortFilesAndFolders( newDocuments );
			setDocuments( newDocuments );
		}

		scheduleServerOperation( { type: 'editFile', document: draggingDocument }, newDocuments );
	}

	function onDropInTabs( target: EditorDocument|null ) {
		let draggingDocument = draggingObject as FileDocument;
		if ( !draggingDocument ) return;
		let targetFile = target as FileDocument;
		let newOpenedDocuments = openedDocuments.slice();
		let indexOfDragging = newOpenedDocuments.indexOf( draggingDocument );
		let indexOfTarget = newOpenedDocuments.indexOf( targetFile );
		if ( indexOfDragging == -1 ) {
			newOpenedDocuments.splice( indexOfTarget, 0, draggingDocument );
		} else if ( indexOfDragging < indexOfTarget ) {
			newOpenedDocuments.splice( indexOfTarget + 1, 0, draggingDocument );
			newOpenedDocuments.splice( indexOfDragging, 1 );
		} else {
			newOpenedDocuments.splice( indexOfDragging, 1 );
			newOpenedDocuments.splice( indexOfTarget, 0, draggingDocument );
		}
		setOpenedDocuments( newOpenedDocuments );
		setActiveDocument( draggingDocument );
	}

	function onDropToEditor() {
		let draggingDocument = draggingObject as FileDocument;
		if ( draggingDocument.isFolder ) return;
		onDocumentSelect( draggingDocument );
		setPreviewDocument( null );
	}

	function onContextMenuAddNew( target: EditorDocument|null, addFile:boolean ) {
		onDocumentAddTo( addFile, target, false );
	}
	function onContextMenuDelete( target: EditorDocument ) {
		let parentFolder = findDocumentParent( target, documents );
		let newDocuments = documents;
		if ( parentFolder == null ) {
			newDocuments = documents.slice().filter( d => d != target );
			setDocuments( newDocuments );
		} else {
			parentFolder.children = parentFolder.children.filter( d => d != target );
			setDocuments( documents.slice() );
		}

		let newOpenedDocuments = openedDocuments.slice();
		let needCloseActiveDocument = false;
		function closeIfOpened( document: EditorDocument ) {
			if ( document.isFolder ) {
				for ( let child of (document as FolderDocument).children ) {
					closeIfOpened( child );
				}
			} else {
				if ( activeDocument == document ) needCloseActiveDocument = true;
				newOpenedDocuments = newOpenedDocuments.filter( d => d != document );
				scheduleServerOperation( { type: 'deleteFile', document }, documents );
			}
		}
		closeIfOpened( target );
		setOpenedDocuments( newOpenedDocuments );
		if ( exploredDocument == target ) setExploredDocument( null );
		if ( needCloseActiveDocument ) closeActiveDocument( newOpenedDocuments );
	}
	function onContextMenuCollapse(target: EditorDocument|null) {
		let folder = target as FolderDocument;
		function setExpandedRecursive( folder: FolderDocument, expanded: boolean ) {
			folder.expanded = expanded;
			for ( let child of folder.children ) {
				if ( child.isFolder ) setExpandedRecursive( child as FolderDocument, expanded );
			}
		}
		if ( target ) {
			setExpandedRecursive( folder, !folder.expanded );
		} else {
			for ( let document of documents ) {
				if ( document.isFolder ) setExpandedRecursive( document as FolderDocument, false );
			}
		}
		setDocuments( documents.slice() );
	}

	function onContextMenuClose( target: EditorDocument, closeThis: boolean ) {
	}

	return (
		<Resizable className="main"
			renderFirstComponent={(width:number) =>
				<Explorer	onDocumentSelect={onDocumentSelect}
							onDocumentRename={onDocumentRename}
							onDocumentAdd={onDocumentAdd}
							onDocumentBlur={onDocumentBlur}
							onContextMenuAddNew={onContextMenuAddNew}
							onContextMenuDelete={onContextMenuDelete}
							onContextMenuCollapse={onContextMenuCollapse}
							onDrop={onDrop}
							containerWidth={width}	/>}
			firstComponentWidth={240}
			// renderSecondComponent={()=>null}
			renderSecondComponent={() =>
				<div className="editor">
					<div className="tabs-and-account">
						<Tabs	onTabClick={onTabClick}
								onTabClose={onTabClose}
								onTabTitleChange={onTabTitleChange}
								onTabTitleBlur={onTabTitleBlur}
								onAddTab={onAddTab}
								onContextMenuClose={onContextMenuClose}
								onDrop={onDropInTabs}	/>
						<Account/>
					</div>
					{activeDocument &&
						<DragTarget onDrop={onDropToEditor}>
							<EditorWindow 	onDocumentEdit={onDocumentEdit}/>
						</DragTarget>
					}
				</div>}
		/>
	);
}

export default App;


