import { createContext } from 'react';
import { DraggableObject } from './Draggable';
import { EditorDocument, FileDocument } from './EditorDocument';

type ApplicationState = {
	documents : EditorDocument[],
	openedDocuments : FileDocument[],
	activeDocument : FileDocument | null;
	exploredDocument: EditorDocument | null;
	previewDocument: FileDocument | null;
	draggingObject: DraggableObject | null;
	documentWithNameEditing: EditorDocument | null;
	documentWithTabNameEditing: FileDocument | null;
}

export type ApplicationStateWithSetters = ApplicationState & {
	setDocuments: (newDocuments : EditorDocument[]) => void;
	setOpenedDocuments: (openedDocuments: FileDocument[]) => void;
	setActiveDocument: (activeDocument: FileDocument | null) => void;
	setExploredDocument: (exploredDocument: EditorDocument | null) => void;
	setPreviewDocument: (previewDocument: FileDocument | null) => void;
	setDraggingObject: (draggingObject: DraggableObject | null) => void;
	setDocumentWithNameEditing: (documentWithNameEditing: EditorDocument | null) => void;
	setDocumentWithTabNameEditing: (documentWithTabNameEditing: FileDocument | null) => void;
}

export const ApplicationStateContext = createContext<ApplicationStateWithSetters>( {} as ApplicationStateWithSetters );

export default ApplicationState;