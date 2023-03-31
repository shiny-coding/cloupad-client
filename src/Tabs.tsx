import { SyntheticEvent, useContext } from 'react';
import { ApplicationStateContext } from './ApplicationState';
import Draggable, { DraggableObject } from './Draggable';
import DragTarget from './DragTarget';
import { EditorDocument } from './EditorDocument';
import Tab from './Tab';
import './Tabs.scss';
import WithContextMenu from './WithContextMenu';

type Props = {
	onTabClick: (index : number) => void;
	onTabClose: (index : number) => void;
	onAddTab: () => void;
	onTabTitleChange: (index : number, newTitle: string) => void;
	onTabTitleBlur: (index : number, restoreText: string | null) => void;
	onContextMenuClose: (target: EditorDocument, closeThis: boolean) => void;
	onDrop: (target: EditorDocument|null) => void;
};

function Tabs( {
		onTabClick,
		onTabClose,
		onTabTitleChange,
		onTabTitleBlur,
		onContextMenuClose,
		onDrop,
		onAddTab
	}: Props ) {

	let { openedDocuments, activeDocument, documentWithTabNameEditing, previewDocument } = useContext( ApplicationStateContext );

	function onCloseClick( e : SyntheticEvent, index : number ) {
		onTabClose( index );
		e.stopPropagation();
	}
	return (
		<div className={'tabs' + (openedDocuments.length == 0 ? ' no-tabs' : '')}>
			{openedDocuments.map( ( document, index ) =>
				<Draggable key={document.uid} draggableObject={document} className={document == activeDocument ? 'active' : ''}>
					<WithContextMenu menuItems={
					[ 	{ label: 'Close',
							onClick: () => onContextMenuClose( document, true ) },
						{ label: 'Close Others',
							onClick: () => onContextMenuClose( document, false ) } ] }>
						<DragTarget onDrop={() => onDrop( document )}>
							<Tab	key={index}
									title={document.name}
									isActive={document === activeDocument}
									isEditing={document === documentWithTabNameEditing}
									isPreview={document === previewDocument}
									onClick={() => onTabClick( index )}
									onClose={(e) => onCloseClick( e, index )}
									onChange={newTitle => onTabTitleChange( index, newTitle )}
									onBlur={restoreText => onTabTitleBlur( index, restoreText )}	/>
						</DragTarget>
					</WithContextMenu>
				</Draggable>
			)}
			<Tab		title={'+'}
						isActive={false}
						isEditing={false}
						isPreview={false}
						onClick={onAddTab}
						onClose={()=>0}
						isNew={true}
						onChange={()=>0}	/>
		</div>
	);
}

export default Tabs;
