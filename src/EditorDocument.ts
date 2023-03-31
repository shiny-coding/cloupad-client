import { DraggableObject } from "./Draggable";
import HierarchicalSelection from "./Types";

export interface EditorDocument extends DraggableObject {
	name: string;
	isFolder?: boolean;
	uid: number;
	path?: string;
}

export interface FileDocument extends EditorDocument {
	content: string;
	savedSelection?: HierarchicalSelection;
	savedScrollLinePos?: number;
	linesCount?: number;
}

export interface FolderDocument extends EditorDocument {
	children: EditorDocument[];
	expanded: boolean;
}

export function findDocumentParent( document: EditorDocument, rootDocuments: EditorDocument[] ) : FolderDocument | null {

	function impl( currentFolder: FolderDocument | null, document: EditorDocument, rootDocuments: EditorDocument[] ) : FolderDocument | null {
		let children = currentFolder == null ? rootDocuments : currentFolder.children;
		if ( children.includes( document ) ) return currentFolder;
		for ( let currentDocument of children ) {
			if ( currentDocument.isFolder ) {
				let childResult = impl( currentDocument as FolderDocument, document, rootDocuments );
				if ( childResult ) return childResult;
			}
		}
		return null;
	}

	return impl( null, document, rootDocuments );
}

export function updateDocumentPath( document: EditorDocument, rooDocuments: EditorDocument[] ) {
	let parts : string[] = [];
	let current: EditorDocument|null = document;
	while ( current ) {
		parts.splice( 0, 0, current.name );
		current = findDocumentParent( current, rooDocuments );
	}
	document.path = parts.join( '/' );
}

export function folderContainsDocument( folder: FolderDocument, document: EditorDocument ) : boolean {

	if ( folder.children.includes( document ) ) return true;

	return folder.children.filter( child => child.isFolder && folderContainsDocument( child as FolderDocument, document ) ).length != 0;
}

export function sortFilesAndFolders( children: EditorDocument[] ): EditorDocument[] {
	children.sort(
		( d1, d2 ) => {
			if ( d1.isFolder && !d2.isFolder ) return -1;
			if ( !d1.isFolder && d2.isFolder ) return +1;
			return d1.name.toUpperCase().localeCompare( d2.name.toUpperCase() );
		}
	)
	return children;
}